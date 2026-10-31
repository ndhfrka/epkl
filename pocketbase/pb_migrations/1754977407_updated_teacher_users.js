/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "v6skwvve",
    "name": "status_pemetaan",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove
  collection.schema.removeField("v6skwvve")

  return app.save(collection)
})
