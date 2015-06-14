Backbone-Extend (0.3.1)
=======================

Backbon-extend provides new features in order to enhance the Web Applications made with Backbone (https://github.com/jashkenas/backbone).

## Backbone.Application

Backbone.Application manage the connection among the Backbone.Pages, at the start, it will create a partial copy of your application in order to prevent the user to modify you application easily.

**Backbone.Application.attachApp(```app```, ```appStartMethod```) :**

Attach your application to Backbone.Application in order to start when you want. ```app```(```object```) and ```appStartMethod``` will be the method called from ```app``` for starting the application.

```javascript
var App = {
	run: function () {
		console.log('application is now running');
	}
};
Backbone.Application
		.attachApp(App, 'run') // Attach your application
		.start(); // Copy your object and will execute 'App.run()'. If doesn't exist, throw an Error();
```

**Backbone.Application.addFile(```file```) :**

You can ask for loading javascript files to Backbone.Application before starting your application. 

```javascript
var App = { [...] };
Backbone.Application
		.attachApp(App, 'run')
		.addFile('/js/main.js') // string or array of string
		.start();
```

**Backbone.Application.start(```onDone```, ```onError```) :**

You have to call this method in order to start your application.

```javascript
var App = { [...] };
Backbone.Application
		.attachApp(App, 'run')
		.addFile('/js/main.js') // string or array of string
		.start(function () {
			// This function is calling just after App.run();
		}, function (jqXhr, error, reason) {
			// This function is call if a file added before was not able to be loaded
		});
```


## Backbone.Page

Backbone.Page is based on Backbone.View.extend with a new behavior designed for the single view applications. You can display only one Backbone.Page.


**Backbone.Page :**

Sample :

```javascript
window.App {
	Pages: {},
	pages: {},
	$body: $('body'),
	run: function () {
		// Create Pages
		this.pages.Homepage = new this.Pages.Homepage({
			'app': this // REQUIRED : you have to specify "app". It's equal to the main application.
		}).render(function () {
			this.show(); // "this" is equal to App.pages.Homepage
		});
		
		// Show the page "About"
		var self = this;
		this.pages.About.show();
		setTimeout(function () {
			self.pages.About = new self.Pages.About({
				'app': self // REQUIRED : you have to specify "app". It's equal to the main application.
			}).render(function () {
				// Because the page "About" will be shown,
				// the page "Homepage", will be hidden.
				this.show(); // "this" is equal to App.pages.About
			});
		}, 1000);
	}
};

window.App.Pages.Homepage = Backbone.Page.extend({
	init: function (opts) { // = initialize
		this.getEvents().on('show', this._show, this);
		this.getEvents().on('hide', this._hide, this);
	},
	render: function (callback) {
		callback = callback || $.noop;
		this.$el.html('<h1>Homepage</h1>');
		this.getApp().$body.append(this.$el);
		callback.apply(this, []);
		return (this);
	},
	_show: function () {
		console.log('shown');
	},
	_hide: function () {
		console.log('hidden');	
	}
});

window.App.Pages.About = Backbone.Page.extend({
	init: function (opts) { // = initialize
		this.getEvents().on('show', this._show, this);
		this.getEvents().on('hide', this._hide, this);
	},
	render: function (callback) {
		callback = callback || $.noop;
		this.$el.html('<h1>Homepage</h1>');
		this.getApp().$body.append(this.$el);
		callback.apply(this, []);
		return (this);
	},
	_show: function () {
		console.log('shown');
	},
	_hide: function () {
		console.log('hidden');	
	}
});

Backbone.Application
		.attachApp(App, 'run')
		.start();
```

**Backbone.Page.getApp :**

You can access to your main application with ```this.getApp()``` :

```javascript
App.Pages.Homepage = Backbone.Page.extend({
	init: function (opts) {
		var 	getFromInstance = this.getApp(),
			getFromParameters = opts['app'];

		console.log(_.isEqual(getFromInstance, getFromParameters)); // true
	}
});

```

**Backbone.Page.getEvents :**

Backbone.Page give an event system that you can use to know information like : when the page is shown or hidden.

```javascript
App.Pages.Homepage = Backbone.Page.extend({
	init: function (opts) {
		this.getEvents().on('show', this._show, this); // this.show is already used by Backbone.Page
		this.getEvents().on('hide', this._hide, this); // this.hide is already used by Backbone.Page
	},
	_show: function () {
		console.log('show');
	},
	_hide: function () {
		console.log('hide');
	}
});

```

## Backbone.Data (*Experimental*)
Backbone.Data is a system designed for syncing the **entity** between your application and the server. When you will get your entity, you can be sure that the data are always updated.

***First step :*** Declaring an entity

```javascript
var entityOptions = {
	"url": "/articles",
	"type": "get",
	"dataType": "json",
	"refresh-mode": "just-in-time|socket|interval", // "just-in-time" | "socket" | "interval"
	"refresh-time": 10000, // 10 seconds
	"onDone": function (data) {
		// Result from the server 
		// {
		//	"articles": [{ [...] }, { [...] }, { [...] }, { [...] }]
		// }
		return (data.articles);
	}
};

Backbone.Data.set(''articles", entityOptions); // Backbone.Data will now take to give us the synced data.
```

***Seconds step :*** Getting the data

```javascript
Backbone.Data.get('article', function (res) {
	// Data has been updated
	console.log(res);
}, function (jqXhr, error, reason) {
	// an error is occurred
	// You have 2 choices :
	// You can throw an error or retry to get information
	
	// Or you can get the information from the cache with this.getData()
	console.log(this.getData()); // 'this' is equal to your entity
});
```

**Backbone.Data : Go Further**

When you are declaring an entity, you can choose the way that Backbone.Data will get the data update. Maybe, you have taken care about the ```refresh-mode```.

You can choose to update your data each time you get the entity (```just-in-time```), the data will be update by socket (```socket```) or the data will be updated every *x* seconds (```interval```).

the ```just-in-time```  and ```interval``` are working with a queue system and they are working well. But the ```socket``` is currently in *experimental* development. *It will be available on the first quarter 2015 (hopefully)*.


## Backbone.Template

Backbone.Template will take and put in cache the template.

**Backbone.Template.setUrl(```url```)**

Set the URL of the templates location.

```javascript
Backbone.Template.setUrl('/templates/'); // = http://localhost/templates/
Backbone.Template.setUrl('/templates'); // = http://localhost/templates
```

**Backbone.Template.getUrl() : **

Return the current URL of Backbone.Template.

```javascript
Backbone.Template.getUrl(); // = http://localhost/templates/ || http://localhost/templates
```

**Backbone.Template.get(```url```, ```callback```) :**

Return the template asked for.

```javascript
var self = this;
Backbone.Template.get('index.html', function (err, html) { // on error, is equal to jQuery onError (jqXhr, error, reason)
	self.$el.html(html);
});
```

**Backbone.Template.compile(```UrlOrTemplate```, ```hash```) :**

```UrlOrTemplate``` can be the URL ( ```index.html``` ) or the value ( ```<h1><%- title %> World !</h1>``` ).

```javascript
var self = this;
Backbone.Template.get('index.html', function (err, html) { // on error, is equal to jQuery onError (jqXhr, error, reason)
	self.$el.html(Backbone.Template.compile(html, {
		"title": "Hello"
	}));
});
```

Or more quickly :

```javascript
this.$el.html(Backbone.Template.compile('index.html', { // Working only if the template has already been loaded
	"title": "Hello"
}));
```

**Backbone.Template.new(```name```, ```url```) :**

You can create an instance in order to download template from different location (the ```url``` argument is optional). The ```name``` is going to allow you to retrieve your object from anywhere (see ```Backbone.Template.getInstance```)

```javascript
var myFirstLocation = Backbone.Template.new('dashboard', '/templates/dashboard');
var mySecondLocation = Backbone.Template.new('login');
mySecondLocation.setUrl('/templates/login'); // set the URL after
```

**Backbone.Template.getInstance(```name```) :**
The getInstance method allows you to get the instance named at the creation.

***Warning : If there are multiple instance with the same name, the method's going to get the first one.***

```javascript
var myFirstLocation = Backbone.Template.getInstance('dashboard');
var mySecondLocation = Backbone.Template.getInstance('login');
```


## Backbone.Network

Backbone.Network is an abstraction of jQuery.ajax. It was designed for the connection between an API (*server*) and the Web Application (*client*).

**Backbone.Network.setUrl(url) :**

You can configure where Backbone.Network will, by default, be able to get information from.

```javascript
Backbone.Network.setUrl('/api'); 
```

**Backbone.Network simple query :**

```javascript
// Backbone.Network.put || 
// Backbone.Network.post ||
// Backbone.Network.delete ||
// Backbone.Network.get ||
// Prototype :
Backbone.Network.get(opts, context, callback);
```

```javascript
Backbone.Network.get({ // Is equal to $.ajax
	'url': "/version", // or "http://localhost:2000/api/version", both are usable
	'dataType': "application/json",
	'contentType': "application/json",
	'data': {'_apiKey': "bouh"}
}, function (err, res) {
	console.log(arguments);	
});
```

**Backbone.Network json query :**

You can use the JSON version. All is already pre-configured for the kind of request.

```javascript
// Backbone.Network.putJSON || 
// Backbone.Network.postJSON ||
// Backbone.Network.deleteJSON ||
// Backbone.Network.getJSON
// Prototype :
Backbone.Network.getJSON(opts, context, callback);
```

```javascript
// Backbone.Network.putJSON || 
// Backbone.Network.postJSON ||
// Backbone.Network.deleteJSON ||
Backbone.Network.getJSON({ // Is equal to $.ajax
	'url': "/version", // or "http://localhost:2000/api/version", both are usable
	'data': {'_apiKey': "bouh"}
}, function (err, res) {
	console.log(arguments);	
});
```

**Backbone.Network.new(```name```, ```url```) :**

You can create an instance in order to managed different network (the ```url``` argument is optional).

```javascript
var myFirstApi = Backbone.Network.new('api', '/api/v1');
var mySecondApi = Backbone.Network.new('api_other', 'http://my-other-ip.com/api/');
mySecondApi.setUrl('/api/v2'); // set the URL after
```

**Backbone.Network.getInstance(```func```) :**

The getInstance method allows you to get the instance named at the creation.

***Warning : If there are multiple instance with the same name, the method's going to get the first one.***

```javascript
var myFirstApi = Backbone.Network.getInstance('api');
var mySecondApi = Backbone.Network.getInstance('api_other');
```

**Backbone.Network.addMiddleware(```func```) :**

You can add middlewares in order to add (or remove) information of the options send to jQuery.

```javascript
var myFirstApi = Backbone.Network.getInstance('api');

myFirstApi.addMiddleware(function (Request, next) {
	Request.options['url'] = Request.options['url']+'?token=1234';
	next();
});
```


## Backbone.Keyboard

Backbone.Keyboard allow you to declare an action to execute when a keyboard shortcut has been did.

**Backbone.Keyboard.start() :**

This method starts to listen to the keyboard.

```javascript
Backbone.Keyboard.start();
```

**Backbone.Keyboard.stop() :**

This method stops to listen to the keyboard.

```javascript
Backbone.Keyboard.stop();
```

**Backbone.Keyboard.on(```command```, ```callback```[, ```ctx```]) :**

Backbone.Keyboard is based on Backbone.Event you can listening the commands easily :

```javascript
Backbone.keyboard.start();
Backbone.keyboard.on('Shift+V', function (e) {
	e.preventDefault();
	alert('Bouh !');
});
```

## Backbone.Cookie

Backbone.Cookie allow you to manage the Cookie very easily.

**Backbone.Cookie.get(```name```) :**

Return the cookie if exists. Otherwise, return ```null```.

```javascript
var cookie = Backbone.Cookie.get('_session');
console.log(cookie ? 'exists' : 'doesn\'t exist');
```

**Backbone.Cookie.new(```name```) :**

Create and return the cookie if exists.

```javascript
var cookie = Backbone.Cookie.new('_session');
console.log(cookie.getName(), "=", cookie.getValue());
```

### Backbone.Cookie Instance :
The Backbone.Cookie return an instance "Cookie".

**Cookie : getting and setting **

```javascript
var cookie = Backbone.Cookie.new('_session');
console.log(cookie.getName(), "=", cookie.getValue()); // = '_session : '
cookie.setValue('Bouh'); // Change temporary the value
cookie.save(); // save the cookie
console.log(cookie.getName(), "=", cookie.getValue()); // = '_session : Bouh'
```

You can re-read the cookie simply :

```javascript
cookie.update(); // update the information from the current cookie
```

And if you would like to remove it :

```javascript
cookie = cookie.remove(); // null
```

## Backbone.Window

Backbone.Window allow to create a new popup (window.open) and enable the communication between the master window and popup by events. Backbone.Window has two object : ```BBWindow``` for the main window and ```BBWindowCommunicator``` for the sub-window (popup).

The communication between them works like a walkie-talkie.


### Backbone.Window.BBWindow

Example :

```javascript
// Main Window - examples/windowCommunicator/public/src/run.js
$('button').click(function () {
    var subWindow = Backbone.Window.newWindow();
    
    subWindow.once('load', function () { // This event when the communication is 
        subWindow.send(function (callback) {
        	// This code will be evaluate on the sub-window
        	callback(
        		$('[data-target="sentence"]').html() // Sentence
        	);
        }, function (sentence) {
        	// get the "sentence" from the sub-window
            console.log('You just said : ', sentence);
            $('[data-target="here"]').html('Message : '+sentence);
        });
        
        subWindow.on('closeMe', function (time) {
        	// This event will be fired from the sub-window
        	console.log('Sub-Window will be close in', time, 'milliseconds.');
        	setTimeout(function () {
        		subWindow.close();
        	}, +time)
        });
        console.log('Main windows is now communicating with the sub-window.');
    });
    
    subWindow.on('failed', function () {
        console.error('Main windows was not able to communicating with the sub-window');
    });

    subWindow.open( // = window.open
	    	"/popup.html",
    		"_blank", "toolbar=no, scrollbars=no, resizable=no, top=500, left=500, width=400, height=400"
    	);
});
```

**BBWindow.open() :**

This method takes the exact same parameters than window.open().

**BBWindow.close() :**

This method close the window.


**BBWindow Events :**

You can listen the states and messages who are coming from the sub window.

The states :  
```load```: fired when the communication between the main window and the sub window is working.  
```close```: fired when the sub window has been closed.
```failed```: fired when an error has occurred.

*BBWindow is based on the Backbone.Events. So, you are able to create your own message thrown from the sub window.*

**BBWindow.isOpen() :**

Return ```true``` if the sub window is open. Otherwise, return ```false```.

**BBWindow.isClosed() :**

Return ```true``` if the sub window is closed. Otherwise, return ```false```.

**BBWindow.isActive() :**

Return ```true``` if the main window can communicate with the sub window and if the sub window is open. Otherwise, return ```false```.

**BBWindow.send(```funcToEvaluate```, ```callback```[, ```context```])**

This function will evaluate the function ```funcToEvaluate``` in the sub window. The ```callback``` will be called if the ```funcToEvaluate``` was been designed for and the ```callback``` will have the context specify in the last optional parameter.

Example :

```javascript
subWindow.send(function (callback) {
	// This code will be evaluate in the sub-window
	 callback(
		$('[data-target="sentence"]').html() // Sentence
	);
}, function (sentence) {
 	// get the "sentence" from the sub-window
       console.log('You just said : ', sentence);
       $('[data-target="here"]').html('Message : '+sentence);
});
```

### Backbone.Window.BBWindowCommunicator

Example :

```javascript
// Main Window - examples/windowCommunicator/public/src/run.popup.js
$(document).ready(function () {
	var mainWindow = Backbone.Window.newCommunicator();
	
	setTimeout(function () {
		console.log('sent');
		// Fire an event to the main window
		mainWindow.talk('closeMe', '2000');
	}, 4000);
	mainWindow.start();
});
```

**BBWindowCommunicator.start() :**

This method will start the communication and wait for a "connection" from the main window.
```javascript
var mainWindow = Backbone.Window.newCommunicator();
mainWindow.start();
```

**BBWindowCommunicator.talk(eventName, parameters[...]) :**

This method is equal to ```trigger``` of Backbone.Events.

```javascript
var mainWindow = Backbone.Window.newCommunicator();
mainWindow.start();
mainWindow.talk('filePercentage', '80');
```

## Go Further

Backbone.extend is not finished ! So, take a look from time to time ;)

You can see the examples in order to watch how Backbone.Extends works.
