/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || id = @request.auth.id"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || id = @request.auth.id"

  return app.save(collection)
})
