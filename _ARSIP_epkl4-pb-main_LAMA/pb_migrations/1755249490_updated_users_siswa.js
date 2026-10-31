/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = ""
  collection.viewRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || id = @request.auth.id"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || id = @request.auth.id"

  return dao.saveCollection(collection)
})
