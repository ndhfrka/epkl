/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7ncegziw",
    "name": "nomor_pegawai",
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
  collection.schema.removeField("7ncegziw")

  return app.save(collection)
})
