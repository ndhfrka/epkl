/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_pz5yz53sh7` ON `pemetaan_pembimbing` (`siswa`)",
      "CREATE INDEX `idx_a26nh5lhuf` ON `pemetaan_pembimbing` (`program_keahlian`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("k3pekue5")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("oykj70ac09zvrc0")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_p11zvomlm8` ON `pemetaan_pembimbing` (`pembimbing`)",
      "CREATE INDEX `idx_pz5yz53sh7` ON `pemetaan_pembimbing` (`siswa`)",
      "CREATE INDEX `idx_a26nh5lhuf` ON `pemetaan_pembimbing` (`program_keahlian`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "help": "",
    "hidden": false,
    "id": "k3pekue5",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
