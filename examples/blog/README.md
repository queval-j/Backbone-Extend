# Workshop 3
==========

## Server APIs


### Hash received in error case

**Hash received :**

```
{
	"error": {
		"reason": "Bad ID."
	}
}
```

### Get the articles

```
GET - /api/articles
```

**Hash to send :**

Nothing

**Hash received :**

```
{
	"articles": [{
		"name": "Name",
		"author": "Someone",
		"create": 1215468751,
		"content": "I'm the content of this article"
	}]
}
```

### Add an article

```
POST - /api/articles
```

**Hash to send :**

```
{
	"name": "Name",
	"author": "Someone",
	"content": "I'm the content of this article"
}
```


**Hash received :**

```
{
	"ok": true
}
```

### Modify an article

```
PUT - /api/articles/:id
```

**Hash to send :**

```
{
	"name": "Name",
	"author": "Someone",
	"content": "I'm the content of this article"
}
```


**Hash received :**

```
{
	"ok": true,
	"id": 0,
	"article": {
		"name": "Name",
		"author": "Someone",
		"create": 1215468751,
		"content": "I'm the content of this article"
	}
}
```

### Remove an article

```
DELETE - /api/articles/:id
```

**Hash to send :**
Nothing


**Hash received :**

```
{
	"ok": true
}
```
