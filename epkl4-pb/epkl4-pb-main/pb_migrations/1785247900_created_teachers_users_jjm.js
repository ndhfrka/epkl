/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
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
      },
      {
        "cascadeDelete": false,
        "collectionId": "1d4fljtg4b3ycm6",
        "help": "",
        "hidden": false,
        "id": "relation3907593434",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "guru",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number370149676",
        "max": null,
        "min": 2,
        "name": "jjm",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number3124247278",
        "max": null,
        "min": 1,
        "name": "konversi_jjm_ke_jumlah_siswa",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_82013277",
    "indexes": [
      "CREATE INDEX `idx_wfuj9nhzsg` ON `teachers_users_jjm` (`prokel`)",
      "CREATE INDEX `idx_ktqiwwirji` ON `teachers_users_jjm` (`guru`)"
    ],
    "listRule": "@request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'",
    "name": "teachers_users_jjm",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'",
    "viewRule": "@request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_82013277");

  return app.delete(collection);
})
