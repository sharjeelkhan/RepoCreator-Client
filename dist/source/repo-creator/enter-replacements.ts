import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from "lz-string";
import { computedFrom } from 'aurelia-binding';
import { inject } from 'aurelia-dependency-injection';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { RepoCreator } from 'source/services/RepoCreator';
import { ProgressModal } from 'source/components/progress-modal';
import underscore from 'underscore';
import './enter-replacements.css!';
import 'bootstrap/css/bootstrap.css!';
import 'bootstrap-sweetalert/lib/sweet-alert.css!';
import 'bootstrap';
import sweetAlert from 'bootstrap-sweetalert';

@inject(Router, EventAggregator, RepoCreator)
export class EnterReplacements {
	activated: boolean = false;
	templateOwner: string = null;
	templateName: string = null;
	seed: string[] = null;
	canCreate: boolean = false;
	destinationName: string = null;
	replacements: Replacement[] = null;
	progressModal: ProgressModal = null;

	constructor(
		private router: Router,
		private eventAggregator: EventAggregator,
		private repoCreator: RepoCreator
	) {}

	public activate(parameters: any) {
		// TODO: work-around for https://github.com/aurelia/history/issues/2
		if (this.activated)
			return;

		this.templateOwner = parameters.templateOwner;
		this.templateName = parameters.templateName;
		this.destinationName = parameters.destinationName;
		this.replacements = this.tryGetReplacementsFromQueryStringKeys(parameters.keys);
		if (!this.replacements)
			this.findKeys();

		this.activated = true;
	}

	protected get gitHubLink() {
		return `https://github.com/${this.templateOwner}/${this.templateName}/`;
	}

	protected onChanged = () => {
		// setImmediate to avoid a jquery/Aurelia bug resulting in a console error message
		setImmediate(() => {
			this.setCanCreate();
			this.updateQueryString();
		});
	}

	protected createRepo = () => {
		let replacementsMap = underscore(this.replacements).reduce((map: any, replacement: Replacement) => {
			map[replacement.name] = replacement.value;
			return map;
		}, {});
		let promise = this.repoCreator.createRepo(this.templateOwner, this.templateName, this.destinationName, replacementsMap);
		promise.then((result: string) => {
			sweetAlert.sweetAlert({
				title: `Repo created!`,
				text: `A new repository has been created at ${result}`,
				type: "success",
				confirmButtonClass: "btn-success",
				confirmButtonText: "Create another!",
				showCancelButton: true,
				cancelButtonClass: "btn-primary",
				cancelButtonText: "Take me there!"
			}, (isConfirm: boolean) => {
				if (isConfirm)
					this.router.navigate("choose");
				else
					window.location.href = `${result}`;
			});
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
		this.progressModal.show(promise);
	}

	private setCanCreate() {
		this.canCreate = (() => {
			if (!this.replacements)
				return false;
			if (!this.destinationName)
				return false;
			for (var i = 0; i < this.replacements.length; ++i)
				if (!this.replacements[i].value)
					return false;

			return true;
		})();
	}

	private updateQueryString(): void {
		let keys = underscore(this.replacements).map((x: any) => x.name);
		let keysJson = JSON.stringify(keys);
		let keysSerialized = compressToEncodedURIComponent(keysJson);
		let queryString = `keys=${keysSerialized}`;
		this.router.navigate(`replacements/${this.templateOwner}/${this.templateName}/${this.destinationName}?${queryString}`, { trigger: false });
	}

	private findKeys() {
		this.repoCreator.findKeys(this.templateOwner, this.templateName).then((results: string[]) => {
			this.replacements = this.keysToReplacements(results);
			this.onChanged();
		}).catch((error: Error) => {
			// TODO: pop-up error and then navigate back to choose-repository
			this.eventAggregator.publish(error);
		});
	}

	private tryGetReplacementsFromQueryStringKeys(serializedKeys: string): Replacement[] {
		if (!serializedKeys)
			return null;

		try {
			let deserializedKeys = decompressFromEncodedURIComponent(serializedKeys);
			let keys = JSON.parse(deserializedKeys);
			return this.keysToReplacements(keys);
		}
		catch (error) {
			return null;
		}
	}

	private keysToReplacements(keys: string[]): Replacement[] {
		return underscore(keys).map((key: string) => new Replacement(key, ''));
	}
}

// must be defined second in the file so Aurelia doesn't think it is the view-model
export class Replacement {
	constructor(
		public name: string,
		public value: string
	) {}

	@computedFrom('name')
	get friendlyName(): string {
		let regex = /magic[_\-\.](.*?)[_\-\.]magic/;
		let match = regex.exec(this.name);
		if (!match)
			return this.name;

		return match[1];
	}
}
