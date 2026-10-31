/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "w2z820jytrbxugw",
    "help": "",
    "hidden": false,
    "id": "relation988328493",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "program_keahlian",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("obaqft54uy417kr")

  // remove field
  collection.fields.removeById("relation988328493")

  return app.save(collection)
})
