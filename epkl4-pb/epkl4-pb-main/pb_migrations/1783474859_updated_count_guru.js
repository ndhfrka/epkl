/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1224128683")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(*) as jumlah_guru, id FROM teacher_users\nWHERE role = 'guru' OR role = 'jurusan'"
  }, collection)

  // remove field
  collection.fields.removeById("number90903330")

  // add field
  collection.fields.addAt(0, new Field({
    "help": "",
    "hidden": false,
    "id": "number1501334321",
    "max": null,
    "min": null,
    "name": "jumlah_guru",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1224128683")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_siswa, id FROM siswa"
  }, collection)

  // add field
  collection.fields.addAt(0, new Field({
    "help": "",
    "hidden": false,
    "id": "number90903330",
    "max": null,
    "min": null,
    "name": "jumlah_siswa",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // remove field
  collection.fields.removeById("number1501334321")

  return app.save(collection)
})
