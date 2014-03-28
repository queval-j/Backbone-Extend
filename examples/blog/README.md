# Workshop 3
==========

## Les APIs


### Hash reçu en cas d'erreur

**Hash reçu :**

```
{
	"error": {
		"reason": "Bad ID."
	}
}
```

### Récupérer les articles

```
GET - /api/articles
```

**Hash à envoyer :**

Aucun

**Hash reçu :**

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

### Ajouter un article

```
POST - /api/articles
```

**Hash à envoyer :**

```
{
	"name": "Name",
	"author": "Someone",
	"content": "I'm the content of this article"
}
```


**Hash reçu :**

```
{
	"ok": true
}
```

### Modifier un article

```
PUT - /api/articles/:id
```

**Hash à envoyer :**

```
{
	"name": "Name",
	"author": "Someone",
	"content": "I'm the content of this article"
}
```


**Hash reçu :**

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

### Supprimer un article

```
DELETE - /api/articles/:id
```

**Hash à envoyer :**
Rien à envoyer


**Hash reçu :**

```
{
	"ok": true
}
```