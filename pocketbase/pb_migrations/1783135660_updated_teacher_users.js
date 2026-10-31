/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add field
  collection.fields.addAt(15, new Field({
    "help": "",
    "hidden": false,
    "id": "number3124247278",
    "max": null,
    "min": null,
    "name": "konversi_jjm_ke_jumlah_siswa",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove field
  collection.fields.removeById("number3124247278")

  return app.save(collection)
})
