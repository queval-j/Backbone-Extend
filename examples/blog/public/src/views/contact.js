app.Views.Contact = Backbone.Page.extend({
	init: function (opts) {
		this._alreadyLoaded = false;
	},
	_dataId: "page-contact",
	loadTemplate: function (callback) {
		Backbone.Template.get('/templates/contact.html', function (err, res) {
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
			self.app.$content.append(self.$el);
			self._alreadyLoaded = true;
			callback.apply(self, []);
		});
		return (this);
	}
});