/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.id != ''"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
})
