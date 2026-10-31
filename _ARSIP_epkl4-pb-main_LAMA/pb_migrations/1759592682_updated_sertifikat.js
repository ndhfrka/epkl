/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_6fUSSjp` ON `sertifikat` (`siswa`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.indexes = []

  return dao.saveCollection(collection)
})
