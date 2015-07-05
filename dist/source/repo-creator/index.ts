import { Router, RouterConfiguration } from 'aurelia-router';

export class RepoCreator {
	router: Router = null;

	routes = [
		{ route: ['', 'choose'], moduleId: './choose-repository', nav: false, title: 'Choose Repo'},
		{ route: 'replacements/:owner/:name', moduleId: './enter-replacements', nav: false, title: 'Replacements' }
	];

	configureRouter(config: RouterConfiguration, router: Router) {
		this.router = router;
		this.router.configure((config: any) => config.map(this.routes));
	}
}
