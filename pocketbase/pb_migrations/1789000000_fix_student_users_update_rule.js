/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("student_users")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id = id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("student_users")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'jurusan' || @request.auth.role = 'admin'"
  }, collection)

  return app.save(collection)
})
