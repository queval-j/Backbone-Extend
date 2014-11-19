window.SDK = window.SDK || {};

SDK.Overlay = function () {
	this.$overlay = $('<div>');
	this.$overlay.attr('style', 'position:fixed;top:0px;left:0px;height:100%;width:100%;background-color: rgba(0, 0, 0, 0.85);');
	$('body').append(this.$overlay);
};

SDK.Overlay.prototype.hide = function () {
	this.$overlay.stop().hide(0);
};

SDK.Overlay.prototype.show = function () {
	this.$overlay.stop().show(0);
};

SDK.Overlay = new SDK.Overlay();