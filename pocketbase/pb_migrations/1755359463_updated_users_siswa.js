/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'jurusan' || @request.auth.role = 'admin'"
  collection.deleteRule = "@request.auth.role = 'admin' && @request.auth.role = 'jurusan'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = "@request.auth.role = 'admin'"
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'admin'"
  collection.deleteRule = "@request.auth.role = 'guru' && @request.auth.role = 'admin'"

  return app.save(collection)
})
