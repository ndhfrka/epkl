/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool4071817644",
    "name": "isComment",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove field
  collection.fields.removeById("bool4071817644")

  return app.save(collection)
})
