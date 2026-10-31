/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("at7mugzkhd7d3mr")

  // remove field
  collection.fields.removeById("number742271621")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("at7mugzkhd7d3mr")

  // add field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "number742271621",
    "max": 1000,
    "min": 0,
    "name": "wiggle",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})
