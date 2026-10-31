/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ugmsaer2",
    "name": "isEntrust",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add
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
}, (app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // remove
  collection.schema.removeField("ugmsaer2")

  // remove
  collection.schema.removeField("sbyftuhe")

  return app.save(collection)
})
