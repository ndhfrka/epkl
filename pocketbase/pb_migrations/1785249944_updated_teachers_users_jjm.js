/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_82013277")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_wfuj9nhzsg` ON `teachers_users_jjm` (`program_keahlian`)",
      "CREATE INDEX `idx_ktqiwwirji` ON `teachers_users_jjm` (`guru`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "w2z820jytrbxugw",
    "help": "",
    "hidden": false,
    "id": "relation1119579848",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "program_keahlian",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_82013277")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_wfuj9nhzsg` ON `teachers_users_jjm` (`prokel`)",
      "CREATE INDEX `idx_ktqiwwirji` ON `teachers_users_jjm` (`guru`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "w2z820jytrbxugw",
    "help": "",
    "hidden": false,
    "id": "relation1119579848",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "prokel",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
