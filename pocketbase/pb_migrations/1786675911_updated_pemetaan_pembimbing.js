/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2735705349",
    "help": "",
    "hidden": false,
    "id": "relation3827847480",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // remove field
  collection.fields.removeById("relation3827847480")

  return app.save(collection)
})
