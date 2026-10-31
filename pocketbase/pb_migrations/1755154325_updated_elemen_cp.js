/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ixptzuv3",
    "name": "tujuan",
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
}, (app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  // remove
  collection.schema.removeField("ixptzuv3")

  return app.save(collection)
})
