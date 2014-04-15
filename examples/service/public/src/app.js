window.app = {
	'_url': 'http://localhost:8080',
	start: function () {
		Backbone.Template.setUrl(this.url);
		Backbone.Services
			.setUrl(this._url+"/services/")
			.add('index', 'index.html')
			.load(function () {
				console.log('App loaded');
			});
	}
};