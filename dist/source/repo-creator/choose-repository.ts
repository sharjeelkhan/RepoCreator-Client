import { OAuth } from 'source/services/OAuth';
import { StripeCheckout, StripeToken } from 'source/services/StripeCheckout';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import underscore from 'underscore';
import './choose-repository.css!';

class Repository {
	constructor(
		public owner: string,
		public name: string,
		public favorite: boolean,
		public sponsored: boolean,
		public popular: boolean,
		public result: boolean
	) {}

	equals = (other: Repository): boolean => {
		return this.owner == other.owner
			&& this.name == other.name;
	}

	merge = (other: Repository) => {
		this.favorite = this.favorite || other.favorite;
		this.sponsored = this.sponsored || other.sponsored;
		this.popular = this.popular || other.popular;
		this.result = this.result || other.result;
	}

	get favoriteStyle(): string {
		return `color: ${this.favorite ? 'yellow' : 'white'}`;
	}

	get sponsoredStyle(): string {
		return `color: ${this.sponsored ? 'lime' : 'white'}`;
	}
}

@inject(OAuth, StripeCheckout, Router, EventAggregator)
export class ChooseRepository {
	private allTemplates: Repository[] = [];
	private favoriteTemplates: Repository[] = [];
	private sponsoredTemplates: Repository[] = [];
	private popularTemplates: Repository[] = [];
	private resultTemplates: Repository[] = [];

	constructor(
		private oAuth: OAuth,
		private stripeCheckout: StripeCheckout,
		private router: Router,
		private eventAggregator: EventAggregator
	) {}

	activate() {
		this.fetchSponsored();
		this.fetchPopular();
		if (this.oAuth.isLoggedIn)
			this.fetchFavorites();
	}

	get loggedIn(): boolean {
		return this.oAuth.isLoggedIn;
	}

	protected search = () => {
		this.clearSearchResults();
		setTimeout(() => {
			let resultTemplates = [
				new Repository('Zoltu', 'Templates.NuGet', false, false, false, true),
				new Repository('Zoltu', 'Templates-Aurelia-TypeScript', false, false, false, true),
				new Repository('Zoltu', 'Templates.TypeScript.Aurelia.CustomElement', false, false, false, true)
			];
			this.mergeTemplates(resultTemplates);
		}, 1500);
	}

	protected repoSelected = (repo: Repository) => {
		this.router.navigate(`replacements/${repo.owner}/${repo.name}`);
	}

	protected toggleFavorite = (repo: Repository): void => {
		if (repo.favorite)
			this.removeFavorite(repo);
		else
			this.addFavorite(repo);
	}

	protected sponsor = (repo: Repository) => {
		if (repo.sponsored)
			return;

		this.oAuth.gitHubEmail.then((email: string) => {
			return this.stripeCheckout.popup(email, 'Sponsor a repository so anyone can use it as a template!', 500, 'Sponsor');
		}).then((value: StripeToken) => {
			console.log('Purchase complete!');
			// TODO: show processing
			// TODO: tell server about card details
			// TODO: poll the server for a result
		}).catch((error: Error) => {
			this.eventAggregator.publish(error);
		});
	}

	private removeFavorite = (repo: Repository): void => {
		// TODO: tell server to un-favorite
		repo.favorite = false;
		this.updateTemplates();
	}

	private addFavorite = (repo: Repository): void => {
		// TODO: tell server to favorite
		repo.favorite = true;
		this.updateTemplates();
	}

	private clearSearchResults = () => {
		this.allTemplates = underscore(this.allTemplates)
			.each((template: Repository) => template.result = false)
			.filter((template: Repository) => template.favorite || template.sponsored || template.popular);
	}

	protected fetchFavorites = (): void => {
		// TODO: get favorites
		this.oAuth.auth0Token.then(token => {
			let favoriteTemplates = [
				new Repository("Zoltu", "Templates.NuGet", true, false, false, false)
			];
			this.mergeTemplates(favoriteTemplates);
		});
	}

	private fetchSponsored = (): void => {
		// TODO: get sponsored
		setTimeout(() => {
			let sponsoredTemplates = [
				new Repository("Zoltu", "Templates.NuGet", false, true, false, false),
				new Repository("apple", "banana", false, true, false, false)
			];
			this.mergeTemplates(sponsoredTemplates);
		}, 1000);
	}

	private fetchPopular = (): void => {
		// TODO: get popular
		setTimeout(() => {
			let popularTemplates = [
				new Repository("zip", "zap", false, false, true, false),
				new Repository("apple", "banana", false, false, true, false)
			];
			this.mergeTemplates(popularTemplates);
		}, 1500);
	}

	private mergeTemplates = (repos: Repository[]) => {
		repos.forEach(repo => {
			let match: Repository = underscore(this.allTemplates).findWhere({ owner: repo.owner, name: repo.name });
			if (match)
				match.merge(repo);
			else
				this.allTemplates.push(repo);
		})
		this.updateTemplates();
	}

	private updateTemplates = () => {
		// setImmediate to avoid a jquery/Aurelia bug resulting in a console error message
		setImmediate(() => {
			this.favoriteTemplates = underscore(this.allTemplates).filter((repo: Repository) => repo.favorite);
			this.sponsoredTemplates = underscore(this.allTemplates).filter((repo: Repository) => repo.sponsored);
			this.popularTemplates = underscore(this.allTemplates).filter((repo: Repository) => repo.popular);
			this.resultTemplates = underscore(this.allTemplates).filter((repo: Repository) => repo.result);
		});
	}
}
