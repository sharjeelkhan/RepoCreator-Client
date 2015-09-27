import { bindable } from 'aurelia-templating';
import { Router } from 'aurelia-router';
import 'bootstrap';

export class NavBar {
	@bindable router: Router = null;

	get routes(): any {
		return this.router.navigation;
	}

	bind() {
		if (!this.router)
			throw new Error("router not bound!");
	}
}
