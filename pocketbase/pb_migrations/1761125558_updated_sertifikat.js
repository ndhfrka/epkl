/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.name = "nilai"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_6fUSSjp` ON `nilai` (`siswa`)"
  ]

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  collection.name = "sertifikat"
  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_6fUSSjp` ON `sertifikat` (`siswa`)"
  ]

  return app.save(collection)
})
