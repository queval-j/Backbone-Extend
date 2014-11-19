var	express = require('express'),
	app = express(),
	colors = require('colors'),
	port;


app.configure(function () {
	app.use(express.compress());
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
	port = 8080;
});

app.configure('production', function () {
	port = 80;
});

app.listen(port); // start the server
console.log('Server is now listening on port'.grey, (port+"").green);