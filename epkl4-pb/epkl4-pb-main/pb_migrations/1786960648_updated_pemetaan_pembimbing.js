/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "x7r3nzzkgabfesz",
    "help": "",
    "hidden": false,
    "id": "7y4g6sdw",
    "maxSelect": 18,
    "minSelect": 0,
    "name": "siswa",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "x7r3nzzkgabfesz",
    "help": "",
    "hidden": false,
    "id": "7y4g6sdw",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "siswa",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
