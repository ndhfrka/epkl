/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = null
  collection.viewRule = null

  return app.save(collection)
})
