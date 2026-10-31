/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z19fymso",
    "name": "terisi",
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

  // remove
  collection.schema.removeField("z19fymso")

  return dao.saveCollection(collection)
})
