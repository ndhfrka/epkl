/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nz3wz6pn",
    "name": "tte",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/webp"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // remove
  collection.schema.removeField("nz3wz6pn")

  return app.save(collection)
})
