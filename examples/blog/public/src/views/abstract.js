app.Views.Abstract = Backbone.Page.extend({
	initForAll: function () {
		this.e.on('show', this._mainShow, this);
	},
	_mainShow: function () {
		this.app.getMenu().removeClass('active');
		$('li[data-id="'+this._dataId+'"]', this.app.getMenu().parent()).addClass('active');
	}
});