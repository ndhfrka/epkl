/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sbyftuhe",
    "name": "isValid",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sbyftuhe",
    "name": "isVerify",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
})
