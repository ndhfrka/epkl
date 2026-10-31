/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
})
