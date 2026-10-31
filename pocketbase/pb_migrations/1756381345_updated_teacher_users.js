/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
})
