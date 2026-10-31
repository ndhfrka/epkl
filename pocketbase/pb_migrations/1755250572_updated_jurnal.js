/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.updateRule = "siswa = @request.auth.id || pembimbing = @request.auth.id"
  collection.deleteRule = "siswa = @request.auth.id || @request.auth.role = 'admin'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.updateRule = "siswa = @request.auth.id"
  collection.deleteRule = "siswa = @request.auth.id"

  return app.save(collection)
})
