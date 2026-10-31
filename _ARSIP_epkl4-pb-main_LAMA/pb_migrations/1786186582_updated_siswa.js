/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "help": "",
    "hidden": false,
    "id": "relation3934632881",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "guru_pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // remove field
  collection.fields.removeById("relation3934632881")

  return app.save(collection)
})
