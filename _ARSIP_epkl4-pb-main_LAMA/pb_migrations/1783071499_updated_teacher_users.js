/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add field
  collection.fields.addAt(14, new Field({
    "help": "",
    "hidden": false,
    "id": "number370149676",
    "max": null,
    "min": null,
    "name": "jjm",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove field
  collection.fields.removeById("number370149676")

  return app.save(collection)
})
