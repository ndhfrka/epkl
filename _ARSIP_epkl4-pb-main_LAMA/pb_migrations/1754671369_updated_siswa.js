/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove
  collection.schema.removeField("3g3ukrw1")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3g3ukrw1",
    "name": "status_acc_pkl",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
