/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

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

  return dao.saveCollection(collection)
})
