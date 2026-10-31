/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "czlaqx34",
    "name": "pembimbing_iduka",
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

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "czlaqx34",
    "name": "pembimbing_dudi",
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

  return app.save(collection)
})
