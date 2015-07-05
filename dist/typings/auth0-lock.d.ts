declare module "auth0-lock" {
	export interface Identity {
		connection: string;
		user_id: string;
		provider: string;
		[key: string]: any;
	}

	export interface Profile {
		user_id: string;
		name: string;
		nickname: string;
		picture: string;
		identities?: Identity[];
		app_metadata?: any;
		user_metadata?: any;
	}

	export default class Auth0Lock {
		constructor(clientID: string, domain: string, options?: any);
		show(options?: any, callback?: (error: any, profile: Profile, token: string) => void): void;
		showSignin(options?: any, callback?: (error: any, profile: Profile, token: string) => void): void;
		showSignup(options?: any, callback?: (error: any, profile: Profile, token: string) => void): void;
		showReset(options?: any, callback?: (error: any, profile: Profile, token: string) => void): void;
		hide(callback?: () => void): void;
		logout(query?: any): void;
		on(event: string, callback: () => void): void;
	}
}
