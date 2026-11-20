/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add field
  collection.fields.addAt(19, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2629268091",
    "max": 0,
    "min": 0,
    "name": "hari_pkl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove field
  collection.fields.removeById("text2629268091")

  return app.save(collection)
})
