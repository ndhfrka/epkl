/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zbzon4bo",
    "name": "wilayah",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "dalam",
        "luar"
      ]
    }
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // remove
  collection.schema.removeField("zbzon4bo")

  return app.save(collection)
})
