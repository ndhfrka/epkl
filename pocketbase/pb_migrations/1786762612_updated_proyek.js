/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "help": "",
    "hidden": false,
    "id": "relation3827847480",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // remove field
  collection.fields.removeById("relation3827847480")

  return app.save(collection)
})
