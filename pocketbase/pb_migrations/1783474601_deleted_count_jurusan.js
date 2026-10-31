/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3005397298");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "help": "",
        "hidden": false,
        "id": "number3131083531",
        "max": null,
        "min": null,
        "name": "jumlah_jurusan",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      }
    ],
    "id": "pbc_3005397298",
    "indexes": [],
    "listRule": "",
    "name": "count_jurusan",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT COUNT(id) as jumlah_jurusan, id FROM program_keahlian",
    "viewRule": null
  });

  return app.save(collection);
})
