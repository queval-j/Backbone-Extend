app.Views.Article = Backbone.View.extend({
	initialize: function (opts) {
		this._model = opts['model'];
		this.loadTemplate(function () {});
	},
	loadTemplate: function (callback) {
		callback = callback || $.noop;
		var self = this;
		Backbone.Template.get('/templates/article.html', function (err, html) {
			if (err) return alert('Une erreur s\'est produite');
			self.render(html);
			callback();
		});
	},
	render: function (html) {
		html = $('#articleContent', html).html();
		html = _.template(html, {
			'model': this._model
		});
		this.$el.html(html);
	},
	state: function (type) {
		this.$el[type]();
		return (this);
	},
	getEl: function () {
		return (this.$el);
	}
});