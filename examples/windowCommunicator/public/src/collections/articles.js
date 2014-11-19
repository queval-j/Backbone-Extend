app.Collections.Articles = Backbone.Collection.extend({
	model: app.Models.Article,
	initialize: function () {
		console.log('New Collection');
	}
});