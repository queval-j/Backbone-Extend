app.Views.Articles = Backbone.Page.extend({
	init: function (opts) {
		this._alreadyLoaded = false;
		this.listingTmpl = null;
		this.contentTmpl = null;
		this._collection = new app.Collections.Articles();
		this._id = 0;
		this.getEvents().on('show', this._redraw, this);
	},
	_dataId: "page-articles",
	loadTemplate: function (callback) {
		Backbone.Template.get('/templates/article.html', function (err, res) {
			if (err) return alert('Une erreur s\'est produite');
			callback(res);
		});
	},
	setId: function (id) {
		if (_.isNumber(id))
			this._id = id;
		else
			this._id = 0;
		return (this);
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
			self.listingTmpl = self.$('#articleListing').html();
			self.contentTmpl = self.$('#articleContent').html();
			self.getApp().$content.append(self.$el);
			self._alreadyLoaded = true;
			self.loadArticles(function () {
				callback.apply(self, []);
			});
		});
		return (this);
	},
	loadArticles: function (callback) {
		var self = this;
		Backbone.Data.get('articles', function (data) {
			self._collection.add(data);
			self.drawArticles(callback);
		}, function () {
			console.error(arguments);
			alert('Error');
		}, this);
	},
	drawArticles: function (callback) {
		callback = callback || $.noop;
		var self = this,
			$myList = this.$('.articles .myList');
		$myList.html('');
		this._collection.each(function (model, id) {
			var toDraw = self.listingTmpl;
			toDraw = _.template(toDraw, {
				'id': id,
				"model": model
			});
			$myList.append(toDraw);
		});
		this._redraw();
		callback();
	},
	_redraw: function () {
		var model = this._collection.at(this._id);
		if (!model)
			model = this._collection.first();
		this.$('.articles .myContent').html('');
		this.$('.articles .myContent').append(model.getView().getEl().html());
		model.getView().state('show');
	}
});