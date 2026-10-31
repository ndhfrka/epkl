/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.name = "elemen_cp"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gmmi6et7",
    "name": "cp",
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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.name = "cp"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gmmi6et7",
    "name": "deskripsi",
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
