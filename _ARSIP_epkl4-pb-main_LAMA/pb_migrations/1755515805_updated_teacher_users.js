/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru' || @request.auth.role = 'tu'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru'"

  return dao.saveCollection(collection)
})
