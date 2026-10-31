/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
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
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "gs6f3the",
        "max": 0,
        "min": 0,
        "name": "nis",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "lqre9bcx",
        "max": 0,
        "min": 0,
        "name": "nisn",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "f7ssm6a4",
        "max": 0,
        "min": 0,
        "name": "nama",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "1zzfsic0",
        "maxSelect": 1,
        "name": "jk",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "L",
          "P"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "lhp1sb0a",
        "max": 0,
        "min": 0,
        "name": "kelas",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "w2z820jytrbxugw",
        "help": "",
        "hidden": false,
        "id": "pkbn4wku",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "program_keahlian",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "fvawpqv9",
        "name": "status_pemetaan_pembimbing",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "qdvmb0ma",
        "name": "status_pemetaan_pkl",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "help": "",
        "hidden": false,
        "id": "v0hqactz",
        "name": "status_rapot",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "mive77os",
        "max": 0,
        "min": 0,
        "name": "catatan",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "sgrjm3lh",
        "name": "hasUser",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "cascadeDelete": false,
        "collectionId": "6e5t20e9wltw52o",
        "help": "",
        "hidden": false,
        "id": "9kxzglle",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "walikelas",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json3885819652",
        "maxSize": 0,
        "name": "currentMood",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "cascadeDelete": false,
        "collectionId": "1d4fljtg4b3ycm6",
        "help": "",
        "hidden": false,
        "id": "relation3934632881",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "guru_pembimbing",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
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
    "id": "pbc_4140980080",
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "name": "siswa_duplicate",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.id != ''",
    "viewRule": "@request.auth.id != ''"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4140980080");

  return app.delete(collection);
})
