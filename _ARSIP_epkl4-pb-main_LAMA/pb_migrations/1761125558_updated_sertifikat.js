/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.name = "nilai"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_6fUSSjp` ON `nilai` (`siswa`)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.name = "sertifikat"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_6fUSSjp` ON `sertifikat` (`siswa`)"
  ]

  return dao.saveCollection(collection)
})
