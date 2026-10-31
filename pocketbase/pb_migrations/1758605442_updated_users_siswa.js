/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.name = "student_users"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.name = "users_siswa"

  return app.save(collection)
})
