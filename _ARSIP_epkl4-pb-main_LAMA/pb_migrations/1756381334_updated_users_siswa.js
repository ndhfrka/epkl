/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = "@request.auth.id != ''"
  collection.viewRule = "@request.auth.id != ''"
  collection.createRule = "id = @request.auth.id || @request.auth.role = 'jurusan' || @request.auth.role = 'admin' || @request.auth.id != ''"
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'jurusan' || @request.auth.role = 'admin' || @request.auth.id != ''"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = ""
  collection.updateRule = "id = @request.auth.id || @request.auth.role = 'jurusan' || @request.auth.role = 'admin'"

  return dao.saveCollection(collection)
})
