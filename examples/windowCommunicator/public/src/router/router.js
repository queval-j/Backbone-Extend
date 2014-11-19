app.Router = Backbone.Router.extend({
	initialize: function (opts) {
		this.app = opts['app'];
	},
	routes: {
		'': 'home',
		'articles': 'articles',
		'articles/:id': 'articles',
		'contact': 'contact',
		'error/:code': "error"
	},
	home: function () {
		if (!this.app.views.Home) {
			SDK.Overlay.show();
			this.app.views.Home = new this.app.Views.Home({
				'app': this.app
			}).render(function () {
				SDK.Overlay.hide();
				this.show();
			});
			return;
		}
		this.app.views.Home.show();
	},
	articles: function (id) {
		id = +(id || 0);
		if (!this.app.views.Articles) {
			SDK.Overlay.show();
			this.app.views.Articles = new this.app.Views.Articles({
				'app': this.app
			})
			.setId(id)
			.render(function () {
				SDK.Overlay.hide();
				this.show();
			});
			return;
		}
		this.app.views.Articles.setId(id).show();
	},
	contact: function () {
		if (!this.app.views.Contact) {
			SDK.Overlay.show();
			this.app.views.Contact = new this.app.Views.Contact({
				'app': this.app
			})
			.render(function () {
				SDK.Overlay.hide();
				this.show();
			});
			return;
		}
		this.app.views.Contact.show();
	},
	error: function (code) {
		if (!this.app.views.Error) {
			SDK.Overlay.show();
			this.app.views.Error = new this.app.Views.Error({
				'app': this.app
			}).render(function () {
				SDK.Overlay.hide();
				this.show();
			});
			return;
		}
		this.app.views.Error.setCode(code || 404).show();
	}
});