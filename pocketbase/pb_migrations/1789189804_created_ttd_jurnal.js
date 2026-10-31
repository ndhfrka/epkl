/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'instansi'",
    "deleteRule": "@request.auth.role = 'instansi'",
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
        "cascadeDelete": true,
        "collectionId": "yr4k50nyt95w2do",
        "help": "",
        "hidden": false,
        "id": "relation2449611656",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "jurnal",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "file2905931821",
        "maxSelect": 1,
        "maxSize": 4194304,
        "mimeTypes": [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp"
        ],
        "name": "ttd",
        "presentable": false,
        "protected": false,
        "required": true,
        "system": false,
        "thumbs": [],
        "type": "file"
      }
    ],
    "id": "pbc_3979043561",
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "name": "ttd_jurnal",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'instansi'",
    "viewRule": "@request.auth.id != ''"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3979043561");

  return app.delete(collection);
})
