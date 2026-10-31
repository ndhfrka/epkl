/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fvawpqv9",
    "name": "status_pemetaan_pembimbing",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove
  collection.schema.removeField("fvawpqv9")

  return app.save(collection)
})
