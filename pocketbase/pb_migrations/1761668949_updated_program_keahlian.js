/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "yx17uvzy",
    "name": "konsentrasi_keahlian",
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
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // remove
  collection.schema.removeField("yx17uvzy")

  return app.save(collection)
})
