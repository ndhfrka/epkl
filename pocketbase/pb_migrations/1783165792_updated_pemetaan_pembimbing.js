/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "help": "",
    "hidden": false,
    "id": "k3pekue5",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "help": "",
    "hidden": false,
    "id": "k3pekue5",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
