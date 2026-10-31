/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "bool3006991964",
    "name": "isArchive",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // remove field
  collection.fields.removeById("bool3006991964")

  return app.save(collection)
})
