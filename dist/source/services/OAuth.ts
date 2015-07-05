import { Profile, Identity } from 'auth0-lock';
import Auth0Lock from 'auth0-lock';
import underscore from 'underscore';
import store from 'store';

class Map<T> {
	[key: string]: T
}

class User {
	constructor(
		public userId: string,
		public nickname: string,
		public idToken: string,
		public identities: Map<Identity>
	) {}
}

class Auth0LockWrapper {
	private auth0Lock: Auth0Lock = new Auth0Lock('GbwGInNlOq75YqX1Xv9BKxRTA1V3cCkC', 'zoltu.auth0.com');

	showSignin(options: any): Promise<{profile: Profile, idToken: string}> {
		return new Promise<{profile: Profile, idToken: string}>((resolve, reject) => {
			let error: Error = null;
			let profile: Profile = null;
			let idToken: string = null;
			// auth0 will not call the showSignin callback if the popup is closed, so we have to store the result of the callback and wait for the hidden event to be fired
			this.auth0Lock.on('hidden', () => {
				if (profile && idToken)
					resolve({ profile: profile, idToken: idToken });
				else
					reject(error || new Error("Popup closed"));
			});
			this.auth0Lock.showSignin(options, (_error: Error, _profile: Profile, _idToken: string) => {
				error = _error;
				profile = _profile;
				idToken = _idToken;
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

	constructor() {
		// TODO: add validation of the user object before continuing on
		let storedUser = <User>store.get('OAuth.user');
		if (storedUser)
			this.userPromise = Promise.resolve<User>(storedUser);
	}

	get isLoggedIn(): Promise<boolean> {
		return this.userPromise.then(_ => true).catch(_ => false);
	}

	get gitHubAuthToken(): Promise<string> {
		return this.userPromise.then(user => user.identities['github']['access_token']);
	}

	get gitHubLogin(): Promise<string> {
		return this.userPromise.then(user => user.nickname);
	}

	login = (): Promise<void> => {
		this.userPromise = this.auth0.showSignin({ connections: ['github'], socialBigButtons: true }).then(result => {
			let identities = underscore(result.profile.identities).reduce((result: Map<Identity>, identity: Identity) => {
				result[identity.provider] = identity;
				return result;
			}, new Map<Identity>());
			let user = new User(result.profile.user_id, result.profile.nickname, result.idToken, identities);
			store.set('OAuth.user', user);
			return user;
		});
		return this.userPromise.then(_ => {});
	}

	logout = (): void => {
		store.clear();
		this.auth0.logout();
		this.userPromise = Promise.reject<User>(new Error('Not logged in.'));
	}
}
