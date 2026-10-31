/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_p11zvomlm8` ON `pemetaan_pembimbing` (`pembimbing`)",
      "CREATE INDEX `idx_pz5yz53sh7` ON `pemetaan_pembimbing` (`siswa`)",
      "CREATE INDEX `idx_a26nh5lhuf` ON `pemetaan_pembimbing` (`program_keahlian`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
