import { inject } from 'aurelia-dependency-injection';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router, RouterConfiguration } from 'aurelia-router';
import { AuthorizeStep } from 'source/AuthorizeStep';
import './app.css!';

@inject(EventAggregator)
export class App {
	protected router: Router = null;

	private routes: any[] = [
		{ route: '', redirect: 'about' },
		{ route: 'repo-creator', moduleId: './repo-creator/index', nav: true, title: 'Try It!', authorize: true },
		{ route: 'pricing', moduleId: './pricing', nav: true, title: 'Pricing' },
		{ route: 'about', moduleId: './about', nav: true, title: 'About' }
	];

	public constructor(private eventAggregator: EventAggregator) {
		this.eventAggregator.subscribe(Error, (error: Error) => console.log(error));
	}

	public configureRouter(config: RouterConfiguration, router: Router) {
		config.title = 'Zoltu: RepoCreator';
		config.addPipelineStep('authorize', AuthorizeStep);
		config.map(this.routes);
		this.router = router;
	}
}
