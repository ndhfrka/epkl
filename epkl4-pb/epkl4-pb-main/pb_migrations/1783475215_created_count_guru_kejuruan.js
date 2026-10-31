/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
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
    "id": "pbc_1159169265",
    "indexes": [],
    "listRule": "",
    "name": "count_guru_kejuruan",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT COUNT(*) as jumlah_guru, id FROM teacher_users\nWHERE role = 'guru' OR role = 'jurusan'",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1159169265");

  return app.delete(collection);
})
