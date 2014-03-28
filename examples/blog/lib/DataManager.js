var fs = require('fs'),
	colors = require('colors');

var DataManager = {
	_path: __dirname+"/data.json",
	_content: null,
	_noop: function () {},
	_loadFile: function (callback) { // load the file asynchronisly
		var self = this;

		callback = callback || this._noop;
		fs.readFile(this._path, function (err, buffer) {
			if (err) throw err;
			self._content = JSON.parse(buffer.toString());
			console.log('-', '[DataManager]'.green, ': File loaded');
			callback();
		});
	},
	init: function (callback) {
		this._loadFile(callback);
		for (var key in this) {
			(function (key, self) {
				if (key.indexOf('_') != 0)
					return;
				Object.defineProperty(self, key, {
					'enumerable': false, // it can't be enumerated
					'configurable': false, // it can't be deleted
					'writable': true
				});
			})(key, this);
		}
		return (this);
	},
	get: function (key) {
		return (this._content[key]);
	},
	set: function (key, value) {
		var self = this;
		this._content[key] = value;
		return (this);
	}
};

module.exports = DataManager;