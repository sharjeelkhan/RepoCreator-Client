import { autoinject } from 'aurelia-dependency-injection';
import { HttpClient, RequestBuilder, HttpResponseMessage } from 'aurelia-http-client';
import { OAuth } from 'source/services/OAuth';
import { StripeCheckout, StripeToken } from 'source/services/StripeCheckout';
import { Repository } from 'source/models/Repository';
import { Request as FindKeysRequest, Progress as FindKeysProgress, Step as FindKeysProgressStep } from 'source/models/FindKeys';
import { Request as CreateRepoRequest, Progress as CreateRepoProgress, Step as CreateRepoProgressStep } from 'source/models/CreateRepo';
import underscore from 'underscore';

let baseUri: string = 'https://repocreator-api.zoltu.io';

@autoinject
export class RepoCreator {
	// TODO: HttpClient should be injected with transient.
	constructor(
		private httpClient: HttpClient,
		private oAuth: OAuth,
		private stripeCheckout: StripeCheckout) {
		this.httpClient.configure((builder: RequestBuilder) => builder['withHeader']('Accept', 'application/json'));
		this.httpClient.configure((builder: RequestBuilder) => builder['withHeader']('Content-Type', 'application/json'));
	}

	findKeys(repoOwner: string, repoName: string): Promise<string[]> {
		return this.oAuth.maybeJwtToken.then(jwtToken => {
			if (jwtToken)
				this.httpClient.configure((builder: RequestBuilder) => builder['withHeader']('Authorization', 'Bearer ' + jwtToken));
			let repository = new Repository('GitHub', repoOwner, repoName);
			let request = new FindKeysRequest(repository);
			return new Promise((resolve: (result: string[]) => void, reject: (error: Error) => void) => new FindKeys(this.httpClient, request, resolve, reject).execute());
		});
	}

	createRepo(templateRepoOwner: string, templateRepoName: string, destinationRepoName: string, replacements: any): Promise<string> {
		return this.oAuth.jwtToken.then(jwtToken => this.oAuth.gitHubLogin.then(login => {
			if (jwtToken)
				this.httpClient.configure((builder: RequestBuilder) => builder['withHeader']('Authorization', 'Bearer ' + jwtToken));
			let templateRepository = new Repository('GitHub', templateRepoOwner, templateRepoName);
			let destinationRepository = new Repository('GitHub', login, destinationRepoName);
			let request = new CreateRepoRequest(destinationRepository, templateRepository, replacements);
			return new Promise((resolve: (result: any) => void, reject: (error: Error) => void) => new CreateRepo(this.httpClient, request, resolve, reject).execute());
		}));
	}

	getSponsored(): Promise<Repository[]> {
		return this.httpClient.get(`${baseUri}/api/sponsored`)
			.then((response: HttpResponseMessage) => underscore(response.content).map((item: any) => Repository.deserialize(item)));
	}

	sponsor(repository: Repository): Promise<Repository[]> {
		return this.oAuth.jwtToken.then(jwtToken => this.oAuth.gitHubEmail.then(email => {
			return this.stripeCheckout.popup(email, 'Sponsor a repository so anyone can use it as a template!', 500, 'Sponsor');
		}).then(value => {
			// TODO: show processing
			let paymentToken = value.id;
			this.httpClient.configure((builder: RequestBuilder) => builder['withHeader']('Authorization', 'Bearer ' + jwtToken));
			return this.httpClient.put(`${baseUri}/api/sponsored/add`, { 'payment_token': paymentToken, 'repository': repository })
		}).then((response: HttpResponseMessage) => {
			return underscore(response.content).map((item: any) => Repository.deserialize(item))
		}));
	}
}

class CreateRepo {
	constructor(
		private httpClient: HttpClient,
		private request: CreateRepoRequest,
		private resolve: (result: any) => void,
		private reject: (error: Error) => void
	) {}

	execute(): void {
		this.httpClient.post(`${baseUri}/api/create_repository`, this.request)
			.then((x: HttpResponseMessage) => this.success(x), (x: HttpResponseMessage) => this.failure(x));
	}

	success(httpResponseMessage: HttpResponseMessage): void {
		let token = <string>httpResponseMessage.content;
		this.progress(token);
	}

	failure(httpResponseMessage: HttpResponseMessage): void {
		this.reject(new Error(`Failed to initiate repository creation: ${httpResponseMessage.content}`));
	}

	progress(token: string): void {
		this.httpClient.get(`${baseUri}/api/create_repository/progress/${token}`)
			.then((x: HttpResponseMessage) => this.progressSuccess(x), (x: HttpResponseMessage) => this.progressFailure(x));
	}

	progressSuccess(httpResponseMessage: HttpResponseMessage): void {
		let progress = CreateRepoProgress.deserialize(httpResponseMessage.content);
		switch (progress.current_step) {
			case CreateRepoProgressStep.Succeeded:
				this.resolve(progress.success_result);
				break;
			case CreateRepoProgressStep.Failed:
				this.reject(new Error(progress.failure_result));
				break;
			default:
				setTimeout(() => this.progress(progress.progress_token), 1000);
				break;
		}
	}

	progressFailure(httpResponseMessage: HttpResponseMessage): void {
		this.reject(new Error(`Failed to get progress update for repository creation: ${httpResponseMessage.content}`));
	}
}

class FindKeys {
	constructor(
		private httpClient: HttpClient,
		private request: FindKeysRequest,
		private resolve: (result: string[]) => void,
		private reject: (error: Error) => void
	) {}

	execute(): void {
		this.httpClient.post(`${baseUri}/api/find_keys_in_repo`, this.request)
			.then((x: HttpResponseMessage) => this.success(x), (x: HttpResponseMessage) => this.failure(x));
	}

	success(httpResponseMessage: HttpResponseMessage): void {
		let token = httpResponseMessage.content;
		this.progress(token);
	};

	failure(httpResponseMessage: HttpResponseMessage): void {
		this.reject(new Error(`Failed to initiate key finding: ${httpResponseMessage.content}`));
	};

	progress(token: string): void {
		this.httpClient.get(`${baseUri}/api/find_keys_in_repo/progress/${token}`)
			.then((x: HttpResponseMessage) => this.progressSuccess(x), (x: HttpResponseMessage) => this.progressFailure(x));
	};

	progressSuccess(httpResponseMessage: HttpResponseMessage): void {
		let progress = FindKeysProgress.deserialize(httpResponseMessage.content);
		switch (progress.current_step) {
			case FindKeysProgressStep.Succeeded:
				this.resolve(progress.success_result);
				break;
			case FindKeysProgressStep.Failed:
				this.reject(new Error(progress.failure_reason));
				break;
			default:
				setTimeout(() => this.progress(progress.progress_token), 1000);
				break;
		}
	};

	progressFailure(httpResponseMessage: HttpResponseMessage): void {
		this.reject(new Error(`Failed to get progress update: ${httpResponseMessage.content}`));
	};
}
