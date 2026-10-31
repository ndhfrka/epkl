/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7vjachp0",
    "name": "nama_pj_penandatangan",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sjg6kgnd",
    "name": "nomor",
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
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // remove
  collection.schema.removeField("7vjachp0")

  // remove
  collection.schema.removeField("sjg6kgnd")

  return app.save(collection)
})
