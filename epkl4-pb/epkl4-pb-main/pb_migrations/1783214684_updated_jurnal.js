/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove field
  collection.fields.removeById("relation3536084642")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "oykj70ac09zvrc0",
    "help": "",
    "hidden": false,
    "id": "relation3536084642",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "uji_pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
