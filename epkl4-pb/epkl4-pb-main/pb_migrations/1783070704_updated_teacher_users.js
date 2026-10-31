/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2896773725",
    "max": 0,
    "min": 0,
    "name": "kelompok_mapel",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove field
  collection.fields.removeById("text2896773725")

  return app.save(collection)
})
