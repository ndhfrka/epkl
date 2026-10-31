/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add field
  collection.fields.addAt(18, new Field({
    "cascadeDelete": false,
    "collectionId": "44myub55g4kvbva",
    "help": "",
    "hidden": false,
    "id": "relation146983788",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "iduka",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove field
  collection.fields.removeById("relation146983788")

  return app.save(collection)
})
