/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.createRule = "siswa = @request.auth.id"
  collection.updateRule = "siswa = @request.auth.id"
  collection.deleteRule = "siswa = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  collection.createRule = ""
  collection.updateRule = ""
  collection.deleteRule = ""

  return dao.saveCollection(collection)
})
