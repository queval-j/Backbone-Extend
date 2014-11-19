window.app = {
	'url': 'http://localhost:8080',
	Views: {},
	views: {},
	Models: {},
	Collections: {},
	Router: null,
	$content: $('#content'),
	$menus: $('ul.nav.masthead-nav li'),
	getMenu: function () {
		return (this.$menus);
	},
	initializeResources: function () {
		Backbone.Data.set('articles', {
			'url': '/api/articles',
			onDone: function (data) {
				return (data.articles);
			}
		});
	},
	start: function () {
		this.e = _.extend({}, Backbone.Events);
		Backbone.Network.setUrl(this.url);
		Backbone.Template.setUrl(this.url);
		this.initializeResources();
		this.router = new app.Router({
			"app": this
		});
		Backbone.history.start({
			"pushState": false
		});
		Backbone.keyboard.start();
		Backbone.keyboard.on('Shift+V', function (e) {
			e.preventDefault();
			alert('Hey ! :)');
		});
	}
};