/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ujwneldz",
    "name": "isValid",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove
  collection.schema.removeField("ujwneldz")

  return dao.saveCollection(collection)
})
