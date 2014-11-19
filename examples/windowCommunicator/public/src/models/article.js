app.Models.Article = Backbone.Model.extend({
	initialize: function () {
		console.log('New Model');
		this._view = new app.Views.Article({
			"model": this
		});
	},
	getView: function () {
		return (this._view);
	}

});