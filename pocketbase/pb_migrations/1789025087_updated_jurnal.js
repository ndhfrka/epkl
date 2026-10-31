/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text4265915775",
    "max": 0,
    "min": 0,
    "name": "tanggal_agenda",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "file2905931821",
    "maxSelect": 1,
    "maxSize": 5242880,
    "mimeTypes": [],
    "name": "ttd",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove field
  collection.fields.removeById("text4265915775")

  // remove field
  collection.fields.removeById("file2905931821")

  return app.save(collection)
})
