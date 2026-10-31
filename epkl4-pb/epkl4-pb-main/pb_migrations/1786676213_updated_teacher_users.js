/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "w2z820jytrbxugw",
    "help": "",
    "hidden": false,
    "id": "f2q4fvug",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "program_keahlian",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "w2z820jytrbxugw",
    "help": "",
    "hidden": false,
    "id": "f2q4fvug",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "program_keahlian",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
