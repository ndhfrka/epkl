/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = "@request.auth.role = 'jurusan' || @request.auth.role = 'admin'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.createRule = "id = @request.auth.id || @request.auth.role = 'jurusan' || @request.auth.role = 'admin' || @request.auth.id != ''"

  return dao.saveCollection(collection)
})
