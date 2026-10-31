/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.indexes = [
    "CREATE INDEX `idx_uu7eUgl` ON `pemetaan` (\n  `iduka`,\n  `siswa`,\n  `program_keahlian`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.indexes = []

  return dao.saveCollection(collection)
})
