/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = "@request.auth.role = 'admin' && @request.auth.role = 'jurusan'"

  return app.save(collection)
})
