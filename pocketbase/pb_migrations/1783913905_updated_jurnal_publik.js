/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1812447966")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, created, deskripsi from jurnal\nWHERE isDraft=false\nORDER BY created DESC\nLIMIT 5"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_txHI")

  // remove field
  collection.fields.removeById("_clone_t1bb")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "_clone_Q3r2",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_d79Q",
    "max": 0,
    "min": 0,
    "name": "deskripsi",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1812447966")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT id, created, deskripsi from jurnal\nWHERE isDraft=false\nORDER BY created DESC"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "_clone_txHI",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "_clone_t1bb",
    "max": 0,
    "min": 0,
    "name": "deskripsi",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("_clone_Q3r2")

  // remove field
  collection.fields.removeById("_clone_d79Q")

  return app.save(collection)
})
