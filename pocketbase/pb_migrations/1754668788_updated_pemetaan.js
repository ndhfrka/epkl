/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "t8xeft3y",
    "name": "status_acc_pkl",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // remove
  collection.schema.removeField("t8xeft3y")

  return app.save(collection)
})
