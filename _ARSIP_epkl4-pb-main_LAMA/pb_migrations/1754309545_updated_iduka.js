/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.program_keahlian.nama = 'TSM'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.program_keahlian.nama = 'TSM'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.program_keahlian.nama = 'TSM'"

  return dao.saveCollection(collection)
})
