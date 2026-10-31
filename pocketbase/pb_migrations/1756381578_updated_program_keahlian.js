/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
})
