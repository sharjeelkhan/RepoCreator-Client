import { customElement, useView, bindable } from 'aurelia-framework';
import jquery from 'jquery';
import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';

@customElement('progress-modal')
@useView('./progress-modal.html')
export class ProgressModal {
	@bindable
	public title: string;
	@bindable
	public id: string;

	protected bind(bindingContext: any) {
		if (!this.title)
			throw new Error("Must provide title to progress-modal!");
		if (!this.id)
			throw new Error("Must provide id to progress-modal!");
	}

	public show(promise: Promise<any>) {
		if (!promise)
			throw new Error('A promise is required to show the progress modal.');

		jquery(`#${this.id}`).modal('show');
		promise.then(_ => this.hide(), _ => this.hide());
	}

	public hide() {
		jquery(`#${this.id}`).modal('hide');
	}
}
