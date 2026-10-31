/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9hlvrfmi",
    "name": "rentang_pelaksanaan",
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
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // remove
  collection.schema.removeField("9hlvrfmi")

  return app.save(collection)
})
