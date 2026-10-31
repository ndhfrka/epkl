/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || @request.auth.role = 'jurusan' || @request.auth.id != ''"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
})
