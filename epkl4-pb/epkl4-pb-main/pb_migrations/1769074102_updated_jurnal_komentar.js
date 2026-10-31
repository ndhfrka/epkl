/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_YI7WJOb6Jk` ON `jurnal_komentar` (`idJurnal`)",
      "CREATE INDEX `idx_9wFR5Nx8Uf` ON `jurnal_komentar` (`pembimbing`)",
      "CREATE INDEX `idx_SjYQNlbhA3` ON `jurnal_komentar` (`isOpen`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_YI7WJOb6Jk` ON `jurnal_komentar` (`idJurnal`)",
      "CREATE INDEX `idx_9wFR5Nx8Uf` ON `jurnal_komentar` (`pembimbing`)"
    ]
  }, collection)

  return app.save(collection)
})
