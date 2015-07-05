import { OAuth } from 'source/services/OAuth';
import { EventAggregator } from 'aurelia-event-aggregator';
import { NavigationContext, NavigationInstruction } from 'aurelia-router';
import { inject } from 'aurelia-dependency-injection';

@inject(OAuth, EventAggregator)
export class AuthorizeStep {
	constructor(
		private oAuth: OAuth,
		private eventAggregator: EventAggregator)
	{}

	run(routingContext: NavigationContext, next: { (): NavigationInstruction; cancel: () => NavigationInstruction }): Promise<NavigationInstruction> {
		if (!routingContext.nextInstructions.some((instruction: NavigationInstruction) => !!instruction.config.authorize))
			return Promise.resolve<any>(next());

		return this.oAuth.isLoggedIn.then(loggedIn => {
			if (loggedIn)
				return next();

			return this.oAuth.login().then(() => {
				return next();
			});
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
			return next.cancel();
		});
	}
}
