Backbone-Extend
===============

Backbon-extend provides new features in order to enhance the Web Application made with Backbone (https://github.com/jashkenas/backbone).

Currently, Backbone-Extend has :
- Backbone.Application :
Backbone.Application allow to the Backbone.Page to talk between us and provide a system to prevent a user to modify the
- Backbone.Page :  
His goal is simple : make the difference between primary view and subview. You can have only one Backbone.Page showed, so when you fire the show event, you hide all the view not concernet by the call. It's just easy like that.
- Backbone.Keyboard :  
Backbone.Keyboard provide a system to create some shortcuts with the keyboard and do some action,
- Backbone.Network :  
Backbone.Network provide some shortcuts to do some query on the serveur (JSON / REST API),
- Backbone.Template :  
Backbone.Template allow you to get your templates and save them in a memory cache, web application directly in the console.

I would like to add other possibility with Backbone.Extend. You can see the project "blog" in the examples folder.
