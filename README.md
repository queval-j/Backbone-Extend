Backbone-Extend
===============

Backbon-extend provides new features in order to enhance the Web Applications made with Backbone (https://github.com/jashkenas/backbone).

Currently, Backbone-Extend has :
- **Backbone.Application** :
Backbone.Applications allows to the Backbone.Page to communicate with each of them. It is able to start your application in the memory without any reference for the user and, therefore, prevent the user to modify the Application.

- **Backbone.Cookie** :  
With Backbone.Cookie, it's possible to create or get a cookie previously saved and manage it easily.

- **Backbone.Page** :  
Backbone.Page is a very useful object inherited from Backbone.View. The big difference between Backbone.Page and Backbone.View is the behavior. You can create a lot of Backbone.Page, like Backbone.View, but you can display only one of them.

- **Backbone.Keyboard** :  
If you would like to create global shortcuts, you can use Backbone.Keyboard. Take a look to the examples.

- **Backbone.Network** :  
Backbone.Network was created especially for your calls with your API.

- **Backbone.Service** :  
With Backbone.Service, you can create with a short html, an object. This object will have a simple usage, like a Modale box. You can see an example in examples/service.

Short example :

```
<service id="nsWindowModal" class="bouh" template-main="index" extend="Backbone.View" instance="true" attachTo="body">
	<property name="version"	type="string" services="get" readonly="true">0.1.1</property>
	<property name="title"		type="string" services="get|set">Article</property>
	<property name="subTitle"	type="string" services="get|set">The Subtitle</property>
	<property name="content"	type="string" services="get|set">Hey, what's going on ?</property>
	<property name="obj"		type="object" services="get|set">{name: "bouh"}</property>
	<property name="sayHello"	type="function">
		service.exports = function () {
			return ('Hello :D');
		}
	</property>
	<property name="init"	type="function">
		service.exports = function () {
			// call after the initialization
		}
	</property>
	<template name="index" src="home.html"></template>
	<template name="secondtemplate">
		Hi :D
	</template>
</service>
```

With this code, you have an new Backbone.View already add to the body, with a getter and setter for some attributes. And you have declear 2 functions (sayHello and init). You have asked to Backbone.Service to load 2 templates and initialize the view with the template index.html and you have asked an instance of this view. (The attribute Readonly, will after)
- **Backbone.Template** :  
Backbone.Template will be your best friend ! You can load your template with it easily, and you will be able to compile your template with it !

Backbone.extend is not finished ! So, take a look from time to time ;)

You can see the examples, to watch how Backbone.Extends works.
