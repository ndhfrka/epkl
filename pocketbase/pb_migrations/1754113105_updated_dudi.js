/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

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

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // remove
  collection.schema.removeField("z19fymso")

  return app.save(collection)
})
