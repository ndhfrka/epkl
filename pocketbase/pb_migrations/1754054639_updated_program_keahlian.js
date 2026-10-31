/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yrdbi2jv",
    "name": "nama",
    "type": "text",
    "required": false,
    "presentable": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yrdbi2jv",
    "name": "nama",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return app.save(collection)
})
