/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "bool1332471722",
    "name": "isDraft",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove field
  collection.fields.removeById("bool1332471722")

  return app.save(collection)
})
