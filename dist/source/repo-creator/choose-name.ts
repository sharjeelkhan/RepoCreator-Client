import { autoinject } from 'aurelia-dependency-injection';
import { computedFrom } from 'aurelia-binding';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import './choose-name.css!';

@autoinject()
export class ChooseName {
	constructor(
		private router: Router,
		private eventAggregator: EventAggregator
	) {}
	
	private templateOwner: string;
	private templateName: string;

	protected newRepoName: string = '';

	public activate(parameters: any) {
		this.templateOwner = parameters.owner;
		this.templateName = parameters.name;
	}
	
	@computedFrom('newRepoName')
	protected get inputValid() {
		return !!this.newRepoName;
	}

	protected createRepository = (): void => {
		this.router.navigate(`replacements/${this.templateOwner}/${this.templateName}/${this.newRepoName}`);
	}
}
