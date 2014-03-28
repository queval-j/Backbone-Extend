(function () {
	window.SDK = {};
	Backbone.Application
		.attachApp(app, "start")
		.addFile([
			'/src/SDK/sdk.overlay.js'
		])
		.start();
})();