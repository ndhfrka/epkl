/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4100911419")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)",
      "CREATE INDEX `idx_z9upjt56pa` ON `proyek` (`siswa`)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "x7r3nzzkgabfesz",
    "help": "",
    "hidden": false,
    "id": "relation839040381",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "siswa",
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
      "CREATE INDEX `idx_yciar82mvn` ON `proyek` (`program_keahlian`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("relation839040381")

  return app.save(collection)
})
