var	db = require('../lib/DataManager');

function sendError(msg, res) {
	res.send({
		"error": {
			"reason": msg
		}
	});
};

var articles = {
	getArticles: function (app) {
		app.get('/api/articles', function (req, res) {
			res.send({
				'articles': db.get('articles')
			});
		});
	},
	addArticle: function (app) {
		app.post('/api/articles', function (req, res) {
			var articles = db.get('articles');

			articles.push({
				"name": req.body['name'] || "New name",
				"author": req.body['author'] || "unknown",
				"create": (new Date).getTime(),
				"content": req.body['content'] || ""
			});

			res.send({
				"ok": true
			});
		});
	},
	modifyArticle: function (app) {
		app.put('/api/articles/:id', function (req, res) {
			var id = req.param('id'),
				articles = db.get('articles'); // get id
			if (id < 0 || id >= articles.length) return sendError("Bad ID.", res);
			articles = articles[id];
			for (var key in articles) {
				articles[key] = req.body[key] || articles[key];
			}
			res.send({
				"ok": true,
				"id": id,
				"article": articles
			});
		});
	},
	deleteArticle: function (app) {
		app.delete('/api/articles/:id', function (req, res) {
			var id = req.param('id'),
				articles = db.get('articles'); // get id
			if (id < 0 || id >= articles.length) return sendError("Bad ID.", res);
			articles.splice(id, 1);
			res.send({
				"ok": true
			});
		});
	}
};

module.exports = function (app) {
	for (var key in articles) {
		articles[key](app);
	}
};