/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || program_keahlian = @request.auth.program_keahlian"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
})
