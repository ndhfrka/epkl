/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // remove
  collection.schema.removeField("qju1vgka")

  // remove
  collection.schema.removeField("er7xfmf1")

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qju1vgka",
    "name": "mulai",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "er7xfmf1",
    "name": "selesai",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return app.save(collection)
})
