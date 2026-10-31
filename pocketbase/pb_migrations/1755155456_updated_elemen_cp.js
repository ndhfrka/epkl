/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = null
  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null

  return app.save(collection)
})
