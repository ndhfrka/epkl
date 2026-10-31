/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "help": "",
        "hidden": false,
        "id": "number1068197171",
        "max": null,
        "min": null,
        "name": "jumlah_iduka",
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
    "id": "pbc_1068511808",
    "indexes": [],
    "listRule": "",
    "name": "count_iduka_luar",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE wilayah='luar'",
    "viewRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1068511808");

  return app.delete(collection);
})
