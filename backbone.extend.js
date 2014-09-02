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

	Backbone.Application.prototype.start = function (callback, callbackError) {
		callback = callback || $.noop;
		callbackError = callbackError || $.noop;
		var i = -1,
			max = this.__files.length,
			self = this,
		loadFunc = function () {
			++i;
			if (i < max) {
				$.getScript(self.__files[i], loadFunc)
				.fail(callbackError);
			} else {
				if (self.__app && self.__app[self.__appFuncToCall]) {
					_.extend({}, self.__app)[self.__appFuncToCall]();
					self.__app = null;
					self.__appFuncToCall = null;
					callback();
				} else {
					throw (new Error('The method "'+self.__appFuncToCall+"' is unknown."));
				}
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
	// - getApp
	// - setHistory([{
	//		"name": "Home",
	//		"view": app.views.Home (extend of Page)
	// }]);
	// - addHistory({
	//		"name": "Home",
	//		"view": app.views.Home (extend of Page)
	// });

	Backbone.Page = Backbone.View.extend({
		init: $.noop, // like initialize
		initForAll: $.noop, // is init for each instance
		getApp: function () { return (this.__pages.app); },
		getEvents: function () { return (this.__pages.e); },
		__initialize: function (opts) {
			var self = this;
			this.__pages = {
				_visible: true
				, app: opts['app'] || null
				, e: _.extend({}, Backbone.Events)
				, __location: []
			};

			Backbone.Application.on('BackboneExtend::newView', function (cid) {
				if (cid != self.cid)
					self.hide();
			});
		},
		initialize: function (opts) {
			var self = this;
			this.__initialize(opts);
			this.initForAll.apply(this, arguments);
			this.init.apply(this, arguments);
			this.hide();
		},
		isShow: function () {
			return (this.__pages._visible);
		},
		isHide: function () {
			return (!this.__pages._visible);
		},
		show: function () {
			this.getEvents().trigger('show');
			if (this.__pages._visible) return (this);
			this.$el.show(0);
			this.__pages._visible = true;
			Backbone.Application.trigger('BackboneExtend::newView', this.cid);
			return (this);
		},
		hide: function () {
			this.$el.hide(0);
			this.getEvents().trigger('hide');
			this.__pages._visible = false;
			return (this);
		},
		setHistory: function (ways) {
			var formated = _.find(ways, function (elm) {
				return (elm['name'] && elm['view'] ? false : true);
			});
			if (formated) return (this);
			this.__pages.__location = ways;
		},
		addHistory: function (way) {
			if (!(elm['name'] && !(elm['view']))) return (this);
			this.__pages.__location.push(way);
		}
	});

	(function (Backbone) {
		var DataModel = Backbone.Model.extend({
			initialize: function (opts) {
				this.set('lastTime', 0);
				this.set('data', {});
				this.__updating = false;
				this.waitingFor = [];
			},
			open: function () {
				this.__updating = false;
				var exec_stack = [],
					self = this;
					if (!this.waitingFor.length) return;
				var elm = this.waitingFor[0];
				this.waitingFor.shift();
				this.sync.apply(this, elm['arguments']);
				this.waitingFor.length = 0;
			},
			close: function () {
				this.__updating = true;
			},
			isUpdating: function () {
				if (!this.__updating) return (false);
				this.waitingFor.push({
					"arguments": arguments
				});
				return (true);
			},
			hasToBeRefreshed: function () {
				var now = (new Date()).getTime(),
					maxTime = this.get('refresh-time');
				now -= this.get('lastTime');
				if (now < maxTime)
					return (false);
				return (true);
			},
			sync: function (onDone, onError, ctx) {
				if (this.isUpdating(onDone, onError, ctx)) return;
				if (!this.hasToBeRefreshed()) {
					this.open();
					return (onDone.apply(ctx || this, [this.get('data')]));
				}
				this.close();
				onError = onError || onDone;
				var loader = this.toJSON();
				var type = loader.type,
					dataType = loader.dataType.toLowerCase();
				if (dataType === 'json') {
					type = (type.toLowerCase())+'JSON';
				}
				if (!Backbone.Network[type]) {
					this.open();
					return (onErrorError.apply(this, ["Error: the method doesn't exist."]));
				}
				Backbone.Network[type](loader, this, function (err, res) {
					if (err) return (onError.apply(ctx || this, arguments));
					var data = loader.onDone(res);
					this.set('data', data);
					this.set('lastTime', (new Date()).getTime());
					onDone.apply(ctx || this, [data]);
					this.open();
				});
			}
		});
		
		var DataCollection = Backbone.Collection.extend({
			model: DataModel
		});
		var getData = function (data) {
			return (data);
		};

		// Backbone.Data
		// - set("name", opts) (url, type, dataType, onDone, refresh-mode, refresh-time)
		// - get("name", function (data) {
		// 		console.log(data);
		// }, function (err) {
		// 		console.log(err);
		// }, this)

		Backbone.Data = {
			__attr: {
				dataCollection: new DataCollection(),
				e: _.extend({}, Backbone.Events)
			},
			_getCollection: function () { return (this.__attr.dataCollection); },
			get: function (id, onDone, onError, ctx) {
				var elm = this._getCollection().find(function (model) {
					return (model.get('name') === id);
				});
				if (!elm) return onError.apply(ctx || this, ['"'+id+'" is undefined']);
				elm.sync(onDone, onError, ctx);
			},
			set: function (key, opts) {
				var model = {
					'name': key,
					'url': opts['url'],
					'type': opts['type'] || 'get',
					'dataType': opts['dataType'] || 'json',
					'onDone': opts['onDone'] || getData,
					'refresh-mode': opts['refresh-mode'] || 'just-in-time', // "just-in-time" | "interval" | "socket" | "socket|just-in-time|interval"
					'refresh-time': opts['refresh-time'] || 10000
				};
				this._getCollection().add(model);
			}
		};
	})(Backbone)

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
		var subUrl = url;
		if (subUrl.indexOf('http') === -1)
			subUrl = this.__url + subUrl;
		callback = callback || $.noop;
		if (this.__cache[url]) return callback(null, this.__cache[url]);
		var self = this;
		$.ajax({
			'url': subUrl,
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

	Backbone.Network.prototype.query = function (opts, callback, ctx) {
		if (!opts['url']) return callback('Error: no url provided');
		if (!(opts['url'].indexOf('http://') === 0 ||
			opts['url'].indexOf('https://') === 0))
			opts['url'] = this.__url + (opts['url'] || '');
		// if (opts['type'] != 'GET' && (opts['contentType'] && opts['contentType'] == 'application/json'))
		// 	opts['data'] = JSON.stringify(opts['data']);
		$.ajax({
			'url': opts['url'],
			'type': opts['type'],
			'data': opts['data'],
			'dataType': opts['dataType'] || undefined
		})
		
		.done(function (res) {
			callback.apply(ctx || this, [null, res]);
		}).fail(function () {
			callback.apply(ctx || this, arguments);
		});
	};

	var methods = ['get', 'post', 'put', 'delete'];
	_.each(methods, function (method) {
		Backbone.Network.prototype[method+"JSON"] = function (opts, context, callback) {
			if (typeof context === 'function') {
				callback = context;
				context = null;
			}
			opts['type'] = method.toUpperCase();
			opts['dataType'] = "json";
			opts['contentType']="application/json";
			Backbone.Network.query(opts, callback, context);
		};
		Backbone.Network.prototype[method] = function (opts, context, callback) {
			if (typeof context === 'function') {
				callback = context;
				context = null;
			}
			opts['type'] = method.toUpperCase();
			Backbone.Network.query(opts, callback, context);
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


	var Cookie = function (name, value) {
		this._attrs = {
			"name": name || "",
			"value": value || ""
		};
		Object.defineProperty(this, '_attrs', {
			"enumerable": false
		});
	};

	Cookie.prototype.getName = function () {
		return (this._attrs['name']);
	};

	Cookie.prototype.getValue = function () {
		return (this._attrs['value']);
	};

	Cookie.prototype.setValue = function (newValue) {
		this._attrs['value'] = newValue;
		return (this);
	};

	Cookie.prototype.save = function (time) { // seconds
		var expires = new Date();
		expires.setTime(expires.getTime() + (time * 1000));
		expires = "expires="+expires.toGMTString();
		document.cookie = this._attrs['name']+"="+this._attrs['value']+"; "+expires;
		return (this);
	};

	Cookie.prototype.update = function () {
		this._attrs['value'] = this._read(this._attrs['name']);
		return (this);
	};

	Cookie.prototype.remove = function () {
		this.save(-1);
		return (null);
	};

	Backbone.Cookie = {
		get: function (name) {
			var value = this.read(name);
			if (value)
				return (new Cookie(name, value));
			return (null);
		},
		new: function (name) {
			return (name ? new Cookie(name) : null);
		},
		read: function (name) {
			name += "=";
			var cookies = document.cookie.split(';'),
				cookie;
			for (var i in cookies) {
				cookie = cookies[i].trim();
				if (cookie.indexOf(name) === 0) return (cookie.substring(name.length, cookie.length));
			}
			return (null);
		}
	};

	Cookie.prototype._read = Backbone.Cookie.read;

	// Backbone.Services
	// 
	// - addService('module.html')
	// - getService('name')
	// - load(callback)
	// 
	(function (Backbone) {
		String.prototype.capitalizeFirstLetter = function() {
			return (this.charAt(0).toUpperCase() + this.slice(1));
		};
		var Service = function () {
			this.$el = $('<service>');
			this.instance = {
				'init': $.noop,
				'attr': {},
				'templates': {},
				'$el': $('<div>'),
				_bbe_render: function (template, values) {
					if (typeof values != 'object')
						values = {};
					var obj = _.extend({
						'templates': this.templates,
						'self': this,
						'attributes': this.attr
					}, values);
					return (_.template(template, obj));
				},
				getTemplate: function (name) {return (this.templates[name]);}
			};
			this.STRING = typeof '';
			this.NUMBER = typeof 1;
			this.FUNCTION = typeof $.noop;
			this.OBJECT = typeof Backbone;
		};

		Service.prototype.toHtml = function (template) {
			template = template.replace(/<\/template\>/gi, '</script>');
			template = template.replace(/<template/gi, '<script type="text/JavaScript"');
			return ($(template));
		};

		Service.prototype.fillSimpleInstance = function ($template) {
			var $el = this.$el,
				instance = this.instance;
			instance.render = function () {
				instance.$el.attr('id', $el.attr('id') || ''); // assign id
				instance.$el.attr('class', $el.attr('class') || ''); // assign id
				var rendered = this._bbe_render(this.getTemplate($el.attr('template-main') || 'main') || '', {});
				instance.$el.html(rendered);
				$($el.attr('attachTo')).append(instance.$el);
			};

			instance.initialize = function () {
				this.render();
				this.init();
			};
		};

		Service.prototype.load = function (template, callback) {
			var self = this;
			this.$el = this.toHtml(template);

			if (!this.$el.get(0) || (this.$el.get(0) && this.$el.get(0).tagName.toLowerCase() != "service"))
				throw new Error('Backbone.Service: is not a valid service.');
			_.each(this.$('property'), function () {
				self.parseProperty.call(self, arguments);
			});
			_.each(this.$('script[type="text/JavaScript"]'), function (template) {
				self.addTemplate(template);
			});
			this.loadTemplate(function () {
				var instance = self.instance;
				self.fillSimpleInstance(); // fill instance
				if (self.$el.attr('extend')) {
					var obj = window,
						keys = self.$el.attr('extend').split('.');
					for (var key in keys) {
						if (obj[keys[key]]) {
							obj = obj[keys[key]];
						}
						else {
							console.log(obj, keys[key]);
							return (callback(self.instance));
						}
					}
					if (self.$el.attr('instance') === 'true') {
						try {
							instance = new (obj.extend(instance))();
						} catch (e) {
							console.error(e);
							throw (new Error('Backbone.Service: Impossible to create an instance.'));
						}
					} else {
							instance = obj.extend(instance);
					}
				}
				callback(instance);
			});
		};

		Service.prototype.loadTemplate = function (callback) {
			var max = _.countBy(this.instance.templates, function (elm) {
					return (typeof elm);
				})['function'],
				i = 0,
				func = function () {
					if (++i >= max) {
						callback();
					}
				};
			_.each(this.instance.templates, function (elm) {
				if (typeof elm === 'function') {
					elm(func);
				}
			});
		};

		Service.prototype.addTemplate = function ($template) {
			$template = $($template);
			var self = this;
			if (!$template.attr('name').trim()) return;
			if ($template.attr('src')) {
				this.instance.templates[$template.attr('name')] = function (callback) {
					Backbone.Template.get(Backbone.Services.getTemplateUrl() + $template.attr('src'), function (err, html) {
						self.instance.templates[$template.attr('name')] = html || null;
						callback();
					});
				};
				return (this);
			}
			this.instance.templates[$template.attr('name')] = $template.html();
		};

		Service.prototype.checkType = function (type) {
			if (type == this.STRING ||
				type == this.NUMBER ||
				type == this.FUNCTION ||
				type == this.OBJECT)
				return (true);
			return (false);
		};

		Service.prototype.parsePropertyService = function (name, service) {
			var funcName;
			switch (service) {
				case 'get':
					funcName = 'get'+name.capitalizeFirstLetter();
					this.instance[funcName] = function () {
						return (this.attr[name]);
					};
					break;
				case 'set':
					funcName = 'set'+name.capitalizeFirstLetter();
					this.instance[funcName] = function (value) {
						this.attr[name] = value;
						return (this);
					};
					break;
				default:
					break;
			}
		};

		Service.prototype.parseProperty = function ($property) {
			$property = $($property);
			var name, type, services, configure, value,
				self = this;
			name = $property.attr('name'); // require
			type = $property.attr('type') || 'string'; // default : string
			services = ($property.attr('services') || '').split('|');
			value = $property.html();
			if (!this.checkType(type))
				return;
			if (type == this.STRING || type == this.NUMBER || type == this.OBJECT) {
				if (type == this.OBJECT) {
					try {
						this.instance.attr[name] = JSON.parse(value);
					} catch (e) {
						this.instance.attr[name] = value;
					}
				}
				else
					this.instance.attr[name] = value;
				_.each(services, function (service) {
					self.parsePropertyService(name, service);
				});
			}
			if (type != this.FUNCTION) return;
			var service = {exports: {}};
			(function (window) {
				value = '(function () {'+value+'})()';
				eval(value);
			})({});
			this.instance[name] = service.exports;
		};

		Service.prototype.$ = function (elm) {
			return ($(elm, this.$el));
		};

		Backbone.Services = {
			_url: '/services',
			_urlTemplate: '/templates/',
			_services: {}, // will content the services
			setUrl: function (url) {
				this._url = url;
				return (this);
			},
			getUrl: function () {
				return (this._url);
			},
			setTemplateUrl: function (url) {
				this._urlTemplate = url;
				return (this);
			},
			getTemplateUrl: function () {
				return (this._urlTemplate);
			},
			add: function (name, url) {
				this._services[name] = url;
				return (this);
			},
			get: function (service) {
				return (this._services[service]);
			},
			load: function (callback) {
				var max = _.countBy(this._services, function (elm) {return (typeof elm);})['string'],
					i = 0,
					loadFunc = function () {
						if (++i >= max)
							callback();
					}, self = this;
				_.each(this._services, function (elm, key) {
					if (typeof elm === "string") {
						if (elm.indexOf('http') === -1)
							elm = self.getUrl() + elm;
						Backbone.Template.get(elm, function (err, res) {
							var service = new Service();
							service.load(res, function (instance) {
								self._services[key] = instance;
								loadFunc();
							});
						});
					}
				});
				return (this);
			}
		};
	})(Backbone);

})(window.Backbone, window._);

