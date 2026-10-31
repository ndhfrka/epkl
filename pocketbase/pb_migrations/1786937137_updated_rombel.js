/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "6e5t20e9wltw52o",
    "help": "",
    "hidden": false,
    "id": "relation458910685",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "walikelas",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // remove field
  collection.fields.removeById("relation458910685")

  return app.save(collection)
})
