/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text280656570",
    "max": 0,
    "min": 0,
    "name": "jam_mulai",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text223284150",
    "max": 0,
    "min": 0,
    "name": "jam_selesai",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // remove field
  collection.fields.removeById("text280656570")

  // remove field
  collection.fields.removeById("text223284150")

  return app.save(collection)
})
