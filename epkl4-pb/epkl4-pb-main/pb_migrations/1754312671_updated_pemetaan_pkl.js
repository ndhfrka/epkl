/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.name = "pemetaan"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.name = "pemetaan_pkl"

  return dao.saveCollection(collection)
})
