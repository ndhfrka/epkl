/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.listRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44myub55g4kvbva")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'guru' "

  return dao.saveCollection(collection)
})
