/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"

  return dao.saveCollection(collection)
})
