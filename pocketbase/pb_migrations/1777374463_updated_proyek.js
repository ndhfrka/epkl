/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)",
      "CREATE INDEX `idx_z9upjt56pa` ON `proyek` (`siswa`)",
      "CREATE INDEX `idx_wo9w7x39cm` ON `proyek` (`iduka`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "44myub55g4kvbva",
    "help": "",
    "hidden": false,
    "id": "relation146983788",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "iduka",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)",
      "CREATE INDEX `idx_z9upjt56pa` ON `proyek` (`siswa`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation146983788")

  return app.save(collection)
})
