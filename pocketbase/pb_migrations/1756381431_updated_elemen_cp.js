/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
})
