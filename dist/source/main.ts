export function configure(aurelia: any) {
	aurelia.use
		.standardConfiguration()
		.developmentLogging()
		.plugin('aurelia-computed');

	aurelia.start().then((x: any) => x.setRoot('source/app', document.body));
}
