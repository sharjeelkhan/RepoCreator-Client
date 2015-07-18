import { Profile, Identity } from 'auth0-lock';
import Auth0Lock from 'auth0-lock';
import underscore from 'underscore';

class Map<T> {
	[key: string]: T
}

class User {
	constructor(
		public userId: string,
		public nickname: string,
		public email: string,
		public idToken: string,
		public identities: Map<Identity>
	) {}
}

interface SigninResult {
	profile: Profile;
	idToken: string;
}

class Auth0LockWrapper {
	private auth0Lock: Auth0Lock = new Auth0Lock('GbwGInNlOq75YqX1Xv9BKxRTA1V3cCkC', 'zoltu.auth0.com');

	showSignin(options: any): Promise<SigninResult> {
		return new Promise<SigninResult>((resolve, reject) => {
			let error: Error = null;
			let signinResult: SigninResult = null;
			// auth0 will not call the showSignin callback if the popup is closed, so we have to store the result of the callback and wait for the hidden event to be fired
			this.auth0Lock.on('hidden', () => {
				if (signinResult)
					resolve(signinResult);
				else
					reject(error || new Error("Popup closed"));
			});
			this.auth0Lock.showSignin(options, (_error: Error, profile: Profile, idToken: string) => {
				if (_error)
					error = _error;
				else
					signinResult = {
						profile: profile,
						idToken: idToken
					};
			});
		});
	}

	logout(): void {
		this.auth0Lock.logout();
	}
}

export class OAuth {
	private auth0: Auth0LockWrapper = new Auth0LockWrapper();
	private userPromise: Promise<User> = Promise.reject<User>(new Error('Not logged in.'));

	get isLoggedIn(): Promise<boolean> {
		return this.userPromise.then(_ => true).catch(_ => false);
	}

	get gitHubAuthToken(): Promise<string> {
		return this.userPromise.then(user => user.identities['github']['access_token']);
	}

	get gitHubLogin(): Promise<string> {
		return this.userPromise.then(user => user.nickname);
	}

	get gitHubEmail(): Promise<string> {
		return this.userPromise.then(user => user.email);
	}

	login = (): Promise<void> => {
		this.userPromise = this.auth0.showSignin({ connections: ['github'], socialBigButtons: true }).then(result => {
			let identities = underscore(result.profile.identities).reduce((result: Map<Identity>, identity: Identity) => {
				result[identity.provider] = identity;
				return result;
			}, new Map<Identity>());
			return new User(result.profile.user_id, result.profile.nickname, result.profile.email, result.idToken, identities);
		});
		return this.userPromise.then(_ => {});
	}

	logout = (): void => {
		this.auth0.logout();
		this.userPromise = Promise.reject<User>(new Error('Not logged in.'));
	}
}
