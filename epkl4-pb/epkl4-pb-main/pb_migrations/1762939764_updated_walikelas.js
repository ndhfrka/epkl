/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o")

  collection.indexes = []

  // remove
  collection.schema.removeField("abs0wdjw")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o")

  collection.indexes = [
    "CREATE INDEX `idx_omAfE6W` ON `walikelas` (`rombel`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "abs0wdjw",
    "name": "rombel",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
