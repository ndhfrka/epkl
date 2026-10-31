/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  // remove
  collection.schema.removeField("1d9djhvp")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8ts5rjzz",
    "name": "kontak",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1d9djhvp",
    "name": "kontak",
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

  // remove
  collection.schema.removeField("8ts5rjzz")

  return dao.saveCollection(collection)
})
