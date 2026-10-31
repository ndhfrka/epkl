/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qk56lvcl",
    "name": "alias",
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
    const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // remove
  collection.schema.removeField("qk56lvcl")

  return app.save(collection)
})
