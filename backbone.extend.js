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
	// - Backbone.Network
	// - Backbone.Data
	// - Backbone.Template
	// - Backbone.Window

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
			if (this.__pages._visible) {
				this.getEvents().trigger('show');
				return (this);
			}
			this.$el.show(0);
			this.__pages._visible = true;
			Backbone.Application.trigger('BackboneExtend::newView', this.cid);
			this.getEvents().trigger('show');
			return (this);
		},
		hide: function () {
			this.$el.hide(0);
			this.__pages._visible = false;
			this.getEvents().trigger('hide');
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
				this.set('lastTime', this.get('refresh-time') + 1000);
				this.set('data', undefined);
				this.__updating = false;
				this.waitingFor = [];
			},
			reinitialize: function () {
				this.initialize();
			},
			getData: function () {
				return (this.get('data'));
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
				if (this.get('data') && now < maxTime)
					return (false);
				return (true);
			},
			onError: function () {
				console.error(arguments);
			},
			sync: function (onDone, onError, ctx) {
				onError = onError || this.onError;
				if (this.isUpdating(onDone, onError, ctx)) return;
				if (!this.hasToBeRefreshed()) {
					this.open();
					return (onDone.apply(ctx || this, [this.get('data')]));
				}
				this.close();
				onError = onError || onDone;
				var loader = this.toJSON();
				loader = {
					'dataType': loader.dataType,
					'type': loader.type,
					'url': loader.url
					, 'onDone': loader.onDone
				};
				var type = loader.type,
					dataType = loader.dataType.toLowerCase();
				if (dataType === 'json') {
					type = (type.toLowerCase())+'JSON';
				}
				if (!Backbone.Network[type]) {
					this.open();
					return (onError.apply(this, ["Error: the method doesn't exist."]));
				}
				Backbone.Network[type](loader, this, function (err, res) {
					// this.open();
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
			reinitialize: function (series) {
				if (!_.isArray(series)) {
					series = [];
					this._getCollection().each(function (model) {
						series.push(model.get('name'));
					});
				}
				this._getCollection().each(function (model) {
					if (series.indexOf(model.get('name')) >= 0)
						model.reinitialize();
				});
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
		return (_.template(guess)(hash));
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
		if (opts['type'] != 'GET' && (opts['contentType'] && opts['contentType'] == 'application/json'))
		 	opts['data'] = JSON.stringify(opts['data']);
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

	// Backbone.Keyboard
	Backbone.Keyboard = function () {
		this.__lastKey = [];
	};

	Backbone.Keyboard.prototype = _.extend(Backbone.Keyboard.prototype, Backbone.Events);

	Backbone.Keyboard.prototype.start = function () {
		var self = this,
			buff;

		this.__lastKey.length = 0;

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

	Backbone.Keyboard.prototype.stop = function () {
		var self = this,
			buff;
		document.onkeydown = $.noop;
		document.onkeyup = $.noop;
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

	// Backbone.Cookie :
	//
	// - get(name)
	// - new(name)
	// - read(name)
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


	// Backbone.Window :
	//
	// - open - like window.open but return a BBWindow

	// BBWindow :
	// 
	// - on('load') = onload
	// - isOpen() = bool
	// - isClose() = bool
	// - isActive = bool
	// - close() = bool (true if closed)
	// - send(func, callback, ctx) - Func = Function to execute in the sub-window side

	(function (Backbone, window) {
		var cnfTimeout = 10,
			cnfTimeoutTime = 250;

		var BBWindow = function () {
			this.queue = [];
			this.on('_newMessage', this._sendPackage, this);
		};

		BBWindow.prototype = _.extend(BBWindow.prototype, Backbone.Events);

		BBWindow.prototype.open = function () {			// 
			var self = this;
			// Initialization
			this._window = window.open.apply(window, arguments);
			this._window.onbeforeunload = function () {
				self.trigger('closed');
				self._terminated = true;
				self._window = undefined;
			};
			// Open window
			this._window.onload = function () {
				alreadyDone = true;
				self.startCommunication(function (err) {
					self._terminated = self.isOpen(); // close ?
					if (!err && self.isActive()) {
						self._communicator.on('all', function () {
							var args = Array.prototype.slice.call(arguments);
							var e = args.shift();
							if (e.indexOf('external:') != 0)
								return;
							e = e.slice('external:'.length);
							args.unshift(e);
							self.trigger.apply(self, args);
						});
						return (self.trigger('load'));
					}
				});
			};
		};

		BBWindow.prototype.startCommunication = function (callback) {
			var self = this;
			callback = callback || $.noop;
				var timeout = cnfTimeout,
					timeoutTime = cnfTimeoutTime;
				var waitCommunication = function () {
					if (--timeout < 0) {
						self._communicator = undefined;
						var msgError = 'Backbone.Extend was not able to communicate with the window.';
						callback(msgError, null);
						return (self.trigger('failed', msgError));
					}
					if ((self._window && !self._window.window.BBCommunicator) || !self._window)
						return (setTimeout(waitCommunication, timeoutTime));
					self._communicator = self._window.window.BBCommunicator;
					self._communicator.once('started', function () {
						var args = Array.prototype.slice.call(arguments);
						args.unshift('started');
						self.trigger.apply(self, args);
						callback();
					});
					self._communicator.trigger('newConnection');
				};
			waitCommunication();
		};

		BBWindow.prototype.isOpen = function () {
			return (!_.isUndefined(this._window));
		};

		BBWindow.prototype.isActive = function () {
			return (!_.isUndefined(this._communicator) && !this.isClosed());
		};

		BBWindow.prototype.isClosed = function () {
			return (this._terminated);
		};

		BBWindow.prototype.close = function () {
			if (this._window)
				this._window.close();
			
			this._terminated = true;
			this._window = undefined;
			return (true);
		};

		BBWindow.prototype.send = function (toSend, callback, ctx) {
			var ticket = (new Date()).getTime(),
				message = {
				'message': (toSend.toString()),
				'ticket': ''+ticket,
				'callback': callback || $.noop,
				'ctx': ctx || callback
			};
			this.queue.push(message);
			this.trigger('_newMessage');
		};

		BBWindow.prototype._sendPackage = function () {
			var msg = this.queue.shift();
			if (_.isUndefined(msg)) return;
			this._communicator.once('evaluate:'+msg.ticket, function (args) {
				msg.callback.apply(msg.ctx, arguments)
			});
			
			this._communicator.trigger(
				'evaluate', 
				msg.message.toString(),
				msg.ticket
			);
		};

		// BBWindowCommunicator
		//
		// - start
		// - talk
		var BBWindowCommunicator =  function (autoload) {
			autoload = autoload || _.isUndefined(autoload) || _.isNull(autoload);
			this.init();
			this.start();
			if (autoload)
				this.start();
		};

		BBWindowCommunicator.prototype = _.extend(BBWindowCommunicator.prototype, Backbone.Events);

		BBWindowCommunicator.prototype.init = function () {
			window.BBCommunicator = this;			
			this.on('evaluate', function (toEval, id) {
				if (!_.isString(toEval))
					return;
				var funcToExecute = eval('('+toEval+')');
				funcToExecute(function () {
					var args = Array.prototype.slice.call(arguments);
					args.unshift('evaluate:'+id);
					window.BBCommunicator.trigger.apply(window.BBCommunicator, args);
				});
			});
			this.once('newConnection', function () {
				this.trigger('started');
			}, this);
			// (onload || $.noop)();
		};

		BBWindowCommunicator.prototype.start = function () {
			// this.trigger('started');
		}

		BBWindowCommunicator.prototype.talk = function () {
			var args = Array.prototype.slice.call(arguments);
			var e = args.shift();
			e = 'external:'+e;
			args.unshift(e);
			this.trigger.apply(this, args);
		}

		Backbone.Window = {
			newWindow: function () {
				return (new BBWindow(arguments))
			},
			newCommunicator: function (autoload) {
				return (new BBWindowCommunicator(autoload));
			}
		};
	})(Backbone, window);

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
					return (_.template(template)(obj));
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
							// console.log(obj, keys[key]);
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

