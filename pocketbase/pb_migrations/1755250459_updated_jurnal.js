/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.createRule = "siswa = @request.auth.id"
  collection.updateRule = "siswa = @request.auth.id"
  collection.deleteRule = "siswa = @request.auth.id"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.createRule = ""
  collection.updateRule = ""
  collection.deleteRule = ""

  return app.save(collection)
})
