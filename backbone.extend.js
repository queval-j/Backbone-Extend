(function (Backbone, _) {
	if (!Backbone) {
		console.error('Backbone is not loaded !');
		return;
	}
	if (!_) {
		console.error('Underscore is not loaded !');
		return;
	}
	// Initialize
	// - Backbone.Application
	// - Backbone.Keyboard
	// - Backbone.Page
	// - Backbone.Template

	// Backbone.Application
	//  - attachApp(App, funcToCall)
	//	- addFile(urlScript) // load only script js
	//	- setApiUrl(url) // set an api url
	//	- setTemplateUrl(url) // a template url
	//	- start(callback) // start app

	Backbone.Application = function () {
		this.__app = null;
		this.__appFuncToCall = null;
		this.__files = [];
		this.__urls = {
			"API": "/api",
			"template": "/templates"
		};
	};
	Backbone.Application.prototype = _.extend(Backbone.Application.prototype, Backbone.Events);
	Backbone.Application.prototype.attachApp = function (app, appCallback) {
		if (app && app[appCallback] && _.isFunction(app[appCallback])) {
			this.__app = app;
			this.__appFuncToCall = appCallback;
		}
		return (this);
	};

	Backbone.Application.prototype.addFile = function (file) {
		if (!_.isArray(file) && !_.isString(file)) return (this);
		if (_.isArray(file)) {
			this.__files = this.__files.concat(file);
		} else {
			this.__files.push(file);
		}
		return (this);
	};

	Backbone.Application.prototype.setApiUrl = function (url) {
		if (!_.isString(url)) return (this);
		this.__urls['API'] = url;
		return (this);
	};

	Backbone.Application.prototype.setTemplateUrl = function (url) {
		if (!_.isString(url)) return (this);
		this.__urls['template'] = url;
		return (this);
	};

	Backbone.Application.prototype.getTemplateUrl = function () {
		return (this.__urls['template']);
	};

	Backbone.Application.prototype.getApiUrl = function () {
		return (this.__urls['API']);
	};

	Backbone.Application.prototype.start = function (callback) {
		callback = callback || $.noop;
		var i = -1,
			max = this.__files.length,
			self = this,
		loadFunc = function () {
			++i;
			if (i < max) {
				$.getScript(self.__files[i], loadFunc);
			} else {
				_.extend({}, app)[self.__appFuncToCall]();
				self.__app = null;
				self.__appFuncToCall = null;
				callback();
			}
			return (self);
		};
		return loadFunc();
	};

	Backbone.Application = new Backbone.Application();

	// Backbone.Page
	// - show
	// - hide
	// - setApp
	// - setHistory([{
	//		"name": "Home",
	//		"view": app.views.Home (extend of Page)
	// }]);
	// - addHistory({
	//		"name": "Home",
	//		"view": app.views.Home (extend of Page)
	// });

	Backbone.Page = Backbone.View.extend({
		__pages: {
			_visible: true
		},
		_location: [],
		init: $.noop, // like initialize
		initForAll: $.noop, // is init for each instance
		initialize: function (opts) {
			var self = this;
			this.app = opts['app'] || null;
			this.e = _.extend({}, Backbone.Events);
			Backbone.Application.on('BackboneExtend::newView', function (cid) {
				if (cid != self.cid)
					self.hide();
			});
			this.initForAll.apply(this, opts);
			this.init.apply(this, opts);
			this.hide();
		},
		show: function () {
			this.e.trigger('show');
			if (this.__pages._visible) return (this);
			this.$el.show(0);
			this.__pages._visible = true;
			Backbone.Application.trigger('BackboneExtend::newView', this.cid);
			return (this);
		},
		hide: function () {
			this.$el.hide(0);
			this.e.trigger('hide');
			this.__pages._visible = false;
			return (this);
		},
		setHistory: function (ways) {
			var formated = _.find(ways, function (elm) {
				return (elm['name'] && elm['view'] ? false : true);
			});
			if (formated) return (this);
			this._location = ways;
		},
		addHistory: function (way) {
			if (!(elm['name'] && !(elm['view']))) return (this);
			this._location.push(way);
		}
	});

	//	- Backbone.Template
	//	- get(url, callback)
	//	- setUrl(url, callback)
	//	- getUrl()

	Backbone.Template = function () {
		this.__url = Backbone.Application.getTemplateUrl();
		this.__cache = {};
		Object.defineProperty(this, '__url', {
			"enumerable": false
		});
		Object.defineProperty(this, '__cache', {
			"enumerable": false
		});
	};

	Backbone.Template.prototype.setUrl = function (url) {
		this.__url = url;
		return (this);
	};

	Backbone.Template.prototype.getUrl = function () {
		return (this.__url);
	};

	Backbone.Template.prototype.get = function (url, callback) {
		url = this.__url + url;
		callback = callback || $.noop;
		if (this.__cache[url]) return callback(null, this.__cache[url]);
		var self = this;
		$.ajax({
			'url': url,
			'type': 'GET'
		})
		.done(function (html) {
			self.__cache[url] = html;
			callback(null, html);
		}).fail(callback);
	};

	Backbone.Template.prototype.compile = function (guess, hash) {
		if (this.__cache[guess])
			guess = this.__cache[guess];
		return (_.template(guess, hash));
	};

	Backbone.Template = new Backbone.Template();

	// Backbone.Network
	// - [get|post|put|delete]JSON(opts, callback)
	// - [get|post|put|delete](opts, callback)
	// - setUrl(url)
	Backbone.Network = function () {
		this.__url = "/";
	};

	Backbone.Network.prototype.setUrl = function (url) {
		this.__url = url;
		return (this);
	};

	Backbone.Network.prototype.query = function (opts, callback) {
		if (!opts['url']) return callback('Error: no url provided');
		if (!(opts['url'].indexOf('http://') === 0 ||
			opts['url'].indexOf('https://') === 0))
			opts['url'] = this.__url + (opts['url'] || '');
		$.ajax({
			'url': opts['url'],
			'type': opts['type'],
			'data': opts['data'],
			'dataType': opts['dataType'] || undefined
		})
		.done(function (res) {
			callback(null, res);
		}).fail(callback);
	};

	var methods = ['get', 'post', 'put', 'delete'];
	_.each(methods, function (method) {
		Backbone.Network.prototype[method+"JSON"] = function (opts, callback) {
			opts['type'] = method.toUpperCase();
			opts['dataType'] = "json";
			Backbone.Network.query(opts, callback);
		};
		Backbone.Network.prototype[method] = function (opts, callback) {
			opts['type'] = method.toUpperCase();
			Backbone.Network.query(opts, callback);
		};
	});

	Backbone.Network = new Backbone.Network();

	Backbone.Keyboard = function () {
		this.__lastKey = [];
	};

	Backbone.Keyboard.prototype = _.extend(Backbone.Keyboard.prototype, Backbone.Events);

	Backbone.Keyboard.prototype.start = function () {
		var self = this,
			buff;
		document.onkeydown = function (e) {
			self.__lastKey.push(self.getKeyInfo(e));
			self.__last = e;
		};
		document.onkeyup = function () {
			buff = "";
			_.each(self.__lastKey, function (key, id) {
				if (key['ctrl'] && buff.indexOf('Ctrl') == -1)
					buff += "Ctrl+";
				else if (key['alt'] && buff.indexOf('Alt') == -1)
					buff += "Alt+";
				else if (key['shift'] && buff.indexOf('Shift') == -1)
					buff += "Shift+";
				else if (key['meta'] && buff.indexOf('Meta') == -1)
					buff += "Meta+";
				else
					buff += key['value'];
			});
			buff = buff.replace(/\+$/, '');
			self.trigger(buff, self.__last);
			self.__lastKey.length = 0;
		};
		return (this);
	};

	Backbone.Keyboard.prototype.getKeyInfo = function (e) {
		if (!e) return (null);
		return ({
			'meta': e.metaKey,
			'ctrl': e.ctrlKey,
			'alt': e.altKey,
			'shift': e.shiftKey,
			'value': String.fromCharCode(e.keyCode),
			'event': e
		});
	};

	Backbone.keyboard = new Backbone.Keyboard();

})(window.Backbone, window._);

