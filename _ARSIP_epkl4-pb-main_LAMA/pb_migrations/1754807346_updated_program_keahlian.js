/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("w2z820jytrbxugw")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu'"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu'"
  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("w2z820jytrbxugw")

  collection.listRule = ""
  collection.viewRule = ""
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
