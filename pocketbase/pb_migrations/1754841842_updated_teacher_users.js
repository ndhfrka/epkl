/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove
  collection.schema.removeField("ohhjnqmz")

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ohhjnqmz",
    "name": "pembimbing",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "p3mkjk78uv3foib",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.save(collection)
})
