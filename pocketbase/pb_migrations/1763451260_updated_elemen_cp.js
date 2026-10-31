/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.deleteRule = null

  return app.save(collection)
})
