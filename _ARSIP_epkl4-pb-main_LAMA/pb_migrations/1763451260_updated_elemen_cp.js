/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.deleteRule = null

  return dao.saveCollection(collection)
})
