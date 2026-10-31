/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool88970920",
    "name": "isOpen",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // remove field
  collection.fields.removeById("bool88970920")

  return app.save(collection)
})
