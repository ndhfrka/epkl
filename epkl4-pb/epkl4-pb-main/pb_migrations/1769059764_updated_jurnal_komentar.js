/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = pembimbing.id",
    "deleteRule": "@request.auth.id = pembimbing.id",
    "indexes": [
      "CREATE INDEX `idx_YI7WJOb6Jk` ON `jurnal_komentar` (`idJurnal`)",
      "CREATE INDEX `idx_9wFR5Nx8Uf` ON `jurnal_komentar` (`pembimbing`)"
    ],
    "updateRule": "@request.auth.id = pembimbing.id"
  }, collection)

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "1d4fljtg4b3ycm6",
    "hidden": false,
    "id": "relation3827847480",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pembimbing",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1105735874")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = idJurnal.pembimbing.id",
    "deleteRule": "",
    "indexes": [
      "CREATE INDEX `idx_YI7WJOb6Jk` ON `jurnal_komentar` (`idJurnal`)"
    ],
    "updateRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation3827847480")

  return app.save(collection)
})
