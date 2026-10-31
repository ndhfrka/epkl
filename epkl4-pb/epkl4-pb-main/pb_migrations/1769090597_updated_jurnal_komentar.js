/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "yr4k50nyt95w2do",
    "hidden": false,
    "id": "relation4044600082",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "idJurnal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "yr4k50nyt95w2do",
    "hidden": false,
    "id": "relation4044600082",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "idJurnal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
