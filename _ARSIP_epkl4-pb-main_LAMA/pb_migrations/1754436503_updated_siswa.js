/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f7ssm6a4",
    "name": "nama",
    "type": "text",
    "required": false,
    "presentable": true,
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
  const collection = dao.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f7ssm6a4",
    "name": "nama",
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
