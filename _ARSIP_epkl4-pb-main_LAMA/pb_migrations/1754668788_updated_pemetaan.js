/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // remove
  collection.schema.removeField("t8xeft3y")

  return dao.saveCollection(collection)
})
