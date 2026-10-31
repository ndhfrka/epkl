/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "date2204086782",
    "max": "",
    "min": "",
    "name": "titimangsa_rapor",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // remove field
  collection.fields.removeById("date2204086782")

  return app.save(collection)
})
