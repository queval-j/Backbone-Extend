app.Views.Home = Backbone.Page.extend({
	init: function (opts) {
		this._alreadyLoaded = false;
	},
	_dataId: "page-home",
	loadTemplate: function (callback) {
		Backbone.Template.get('/templates/home.html', function (err, res) {
			if (err) return alert('Une erreur s\'est produite');
			callback(res);
		});
	},
	render: function (callback) {
		var self = this;
		callback = callback || $.noop;
		if (this._alreadyLoaded) {
			this.show();
			return callback();
		}
		this.loadTemplate(function (html) {
			self.$el.html(html);
			self.getApp().$content.append(self.$el);
			self._alreadyLoaded = true;
			callback.apply(self, []);
		});
		return (this);
	}
});