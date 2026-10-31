/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)",
      "CREATE INDEX `idx_v6t5ni77u3` ON `proyek` (`siswa`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)"
    ]
  }, collection)

  return app.save(collection)
})
