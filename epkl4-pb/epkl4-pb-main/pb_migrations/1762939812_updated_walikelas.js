/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o")

  collection.indexes = [
    "CREATE INDEX `idx_ITlgzOL` ON `walikelas` (`rombel`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "x60bpnap",
    "name": "rombel",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "obaqft54uy417kr",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o")

  collection.indexes = []

  // remove
  collection.schema.removeField("x60bpnap")

  return dao.saveCollection(collection)
})
