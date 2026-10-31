/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove
  collection.schema.removeField("v6skwvve")

  return dao.saveCollection(collection)
})
