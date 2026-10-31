/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'tu'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'tu'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  collection.createRule = ""
  collection.updateRule = ""

  return dao.saveCollection(collection)
})
