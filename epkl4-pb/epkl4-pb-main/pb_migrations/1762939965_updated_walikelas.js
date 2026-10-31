/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o")

  collection.indexes = [
    "CREATE INDEX `idx_ITlgzOL` ON `walikelas` (`rombel`)",
    "CREATE INDEX `idx_xQ96CB3` ON `walikelas` (`program_keahlian`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wzyuxx7m",
    "name": "program_keahlian",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "w2z820jytrbxugw",
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

  collection.indexes = [
    "CREATE INDEX `idx_ITlgzOL` ON `walikelas` (`rombel`)"
  ]

  // remove
  collection.schema.removeField("wzyuxx7m")

  return dao.saveCollection(collection)
})
