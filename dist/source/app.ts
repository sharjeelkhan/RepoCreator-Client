import { inject } from 'aurelia-dependency-injection';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router, RouterConfiguration, NavigationContext } from 'aurelia-router';

@inject(EventAggregator)
export class App {
	protected router: Router = null;

	private routes: any[] = [
		{ route: '', redirect: 'about' },
		{ route: 'repo-creator', moduleId: './repo-creator/index', nav: true, title: 'Try It!' },
		{ route: 'pricing', moduleId: './pricing', nav: true, title: 'Pricing' },
		{ route: 'about', moduleId: './about', nav: true, title: 'About' }
	];

	public constructor(private eventAggregator: EventAggregator) {
		this.eventAggregator.subscribe(Error, (error: Error) => {
			console.log(error);
			window.appInsights.trackException(error);
			window.Rollbar.error(error);
		});
	}

	public configureRouter(config: RouterConfiguration, router: Router) {
		config.title = 'Zoltu: RepoCreator';
		config.map(this.routes);
		this.router = router;
	}
}

export class AppInsights {
	private appInsights: any;

	constructor() {
		this.appInsights = this.appInsights||function(config: any){
			function r(config: any){t[config]=function(){var i=arguments;t.queue.push(function(){t[config].apply(t,i)})}}var t={config:config},u=document,e=window,o="script",s=u.createElement(o),i,f;for(s.src=config.url||"//az416426.vo.msecnd.net/scripts/a/ai.0.js",u.getElementsByTagName(o)[0].parentNode.appendChild(s),t.cookie=u.cookie,t.queue=[],i=["Event","Exception","Metric","PageView","Trace"];i.length;)r("track"+i.pop());return r("setAuthenticatedUserContext"),r("clearAuthenticatedUserContext"),config.disableExceptionTracking||(i="onerror",r("_"+i),f=e[i],e[i]=function(config,r,u,e,o){var s=f&&f(config,r,u,e,o);return s!==!0&&t["_"+i](config,r,u,e,o),s}),t
		}({ instrumentationKey:"d8b1e7e4-76fb-4c7a-b74c-2ef1a78bc7eb" });
	}

	run(navigationContext: NavigationContext, next) {
		var origin = window.location.pathname + window.location.hash;
		//var path = origin.replace("/#/", "/").replace("#", "");
		//console.log("[AppInsights] Tracking for %s", path);
		this.appInsights.trackPageView(navigationContext.nextInstruction.fragment);
		return next();
	}
}
