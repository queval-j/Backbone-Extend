var	express = require('express'),
	app = express(),
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

app.all('/api/*', function (req, res) {
	res.send({
		"error": {
			"reason": "Method not implemented"
		}
	});
});

app.listen(port);
console.log('Server is listening on port', port);