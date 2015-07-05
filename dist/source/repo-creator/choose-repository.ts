import { OAuth } from 'source/services/OAuth';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { inject } from 'aurelia-dependency-injection';
import { computedFrom } from 'aurelia-framework';
import underscore from 'underscore';

class Repository {
	constructor(
		public owner: String,
		public name: String,
		public favorite: boolean,
		public sponsored: boolean,
		public popular: boolean,
		public result: boolean
	) {}

	equals = (other: Repository): Boolean => {
		return this.owner == other.owner
			&& this.name == other.name;
	}

	merge = (other: Repository) => {
		this.favorite = this.favorite || other.favorite;
		this.sponsored = this.sponsored || other.sponsored;
		this.popular = this.popular || other.popular;
		this.result = this.result || other.result;
	}

	@computedFrom('favorite')
	get style(): String {
		return this.favorite ? 'color: yellow;' : '';
	}
}

@inject(OAuth, Router, EventAggregator)
export class ChooseRepository {
	private token: String;
	private allTemplates: Repository[] = [];
	private favoriteTemplates: Repository[] = [];
	private sponsoredTemplates: Repository[] = [];
	private popularTemplates: Repository[] = [];
	private resultTemplates: Repository[] = [];

	constructor(
		private oAuth: OAuth,
		private router: Router,
		private eventAggregator: EventAggregator
	) {}

	activate() {
		return this.oAuth.gitHubAuthToken.then(token => {
			this.token = token;
			this.fetchTemplates();
		}).catch(error => {
			this.eventAggregator.publish(error);
			this.router.navigate('repo-creator', {});
		});
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

	protected toggleFavorite = (repo: Repository) => {
		if (repo.favorite)
			this.removeFavorite(repo);
		else
			this.addFavorite(repo);
	}

	private removeFavorite = (repo: Repository) => {
		// TODO: tell server to un-favorite
		repo.favorite = false;
		this.updateTemplates();
	}

	private addFavorite = (repo: Repository) => {
		// TODO: tell server to favorite
		repo.favorite = true;
		this.updateTemplates();
	}

	private clearSearchResults = () => {
		this.allTemplates = underscore(this.allTemplates)
			.each((template: Repository) => template.result = false)
			.filter((template: Repository) => template.favorite || template.sponsored || template.popular);
	}

	private fetchTemplates = () => {
		// TODO: get favorites
		setTimeout(() => {
			let favoriteTemplates = [
				new Repository("Zoltu", "Templates.NuGet", true, false, false, false)
			];
			this.mergeTemplates(favoriteTemplates);
		}, 500);

		// TODO: get sponsored
		setTimeout(() => {
			let sponsoredTemplates = [
				new Repository("Zoltu", "Templates.NuGet", false, true, false, false),
				new Repository("apple", "banana", false, true, false, false)
			];
			this.mergeTemplates(sponsoredTemplates);
		}, 1000);

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
