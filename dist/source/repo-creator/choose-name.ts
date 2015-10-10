import { autoinject } from 'aurelia-dependency-injection';
import { computedFrom } from 'aurelia-binding';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Validation } from 'aurelia-validation';

@autoinject()
export class ChooseName {
	constructor(
		private router: Router,
		private eventAggregator: EventAggregator,
		validation: Validation
	) {

		this.validation = validation.on(this)
			.ensure('newRepoName')
			.isNotEmpty();
	}

	private templateOwner: string;
	private templateName: string;

	protected newRepoName: string = '';
	protected validation: Validation;

	public activate(parameters: any) {
		this.templateOwner = parameters.owner;
		this.templateName = parameters.name;
	}

	@computedFrom('newRepoName')
	protected get inputValid() {
		return !!this.newRepoName;
	}

	protected createRepository = (): void => {
		this.validation.validate()
			.then(() => {
				this.router.navigate(`replacements/${this.templateOwner}/${this.templateName}/${this.newRepoName}`);
			})
			.catch((validationResult: any) => {
			});
	}
}
