/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4140980080")

  // remove field
  collection.fields.removeById("lhp1sb0a")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "obaqft54uy417kr",
    "help": "",
    "hidden": false,
    "id": "relation3491757652",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "kelas",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4140980080")

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "lhp1sb0a",
    "max": 0,
    "min": 0,
    "name": "kelas",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("relation3491757652")

  return app.save(collection)
})
