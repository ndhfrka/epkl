/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9kxzglle",
    "name": "walikelas",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "6e5t20e9wltw52o",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove
  collection.schema.removeField("9kxzglle")

  return dao.saveCollection(collection)
})
