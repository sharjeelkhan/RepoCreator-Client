import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from "lz-string";
import { computedFrom } from 'aurelia-binding';
import { inject } from 'aurelia-dependency-injection';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { RepoCreator } from 'source/services/RepoCreator';
import { ProgressModal } from 'source/components/progress-modal';
import underscore from 'underscore';
import 'bootstrap/css/bootstrap.css!';
import 'bootstrap-sweetalert/lib/sweet-alert.css!';
import 'bootstrap';
import sweetAlert from 'bootstrap-sweetalert';

@inject(Router, EventAggregator, RepoCreator)
export class EnterReplacements {
	activated: boolean = false;
	repoOwner: string = null;
	repoName: string = null;
	seed: string[] = null;
	canCreate: boolean = false;
	newRepoName: string = null;
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

		this.repoOwner = parameters.owner;
		this.repoName = parameters.name;
		this.replacements = this.tryGetReplacementsFromQueryStringKeys(parameters.keys);
		if (!this.replacements)
			this.findKeys();

		this.activated = true;
	}

	@computedFrom('repoOwner','repoName')
	protected get gitHubLink() { return `https://github.com/${this.repoOwner}/${this.repoName}/`; }

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
		});
		let promise = this.repoCreator.createRepo(this.repoOwner, this.repoName, this.newRepoName, replacementsMap);
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
			if (!this.newRepoName)
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
		this.router.navigate(`replacements/${this.repoOwner}/${this.repoName}?${queryString}`, { trigger: false });
	}

	private findKeys() {
		this.repoCreator.findKeys(this.repoOwner, this.repoName).then((results: string[]) => {
			this.replacements = this.keysToReplacements(results);
			this.onChanged();
		}).catch((error: Error) => {
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

// must be defined second so Aurelia doesn't think it is the view-model
export class Replacement {
	constructor(
		public name: string,
		public value: string
	) {}

	@computedFrom('name')
	get friendlyName(): string {
		var regex = /magic[_\-\.](.*?)[_\-\.]magic/;
		var match = regex.exec(this.name);
		if (!match)
			return this.name;

		return match[1];
	}
}
