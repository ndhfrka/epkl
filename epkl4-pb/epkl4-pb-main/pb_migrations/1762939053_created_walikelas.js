/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "6e5t20e9wltw52o",
    "created": "2025-11-12 09:17:33.848Z",
    "updated": "2025-11-12 09:17:33.848Z",
    "name": "walikelas",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "qovv7zak",
        "name": "nama",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "o0ijpze3",
        "name": "nip",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "abs0wdjw",
        "name": "rombel",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_omAfE6W` ON `walikelas` (`rombel`)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("6e5t20e9wltw52o");

  return dao.deleteCollection(collection);
})
