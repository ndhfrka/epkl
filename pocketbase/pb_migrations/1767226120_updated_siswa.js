/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove field
  collection.fields.removeById("text3885819652")

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "json3885819652",
    "maxSize": 0,
    "name": "currentMood",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3885819652",
    "max": 0,
    "min": 0,
    "name": "currentMood",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("json3885819652")

  return app.save(collection)
})
