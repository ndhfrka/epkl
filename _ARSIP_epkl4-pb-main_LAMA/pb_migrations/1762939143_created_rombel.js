/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "obaqft54uy417kr",
    "created": "2025-11-12 09:19:03.936Z",
    "updated": "2025-11-12 09:19:03.936Z",
    "name": "rombel",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vv9tlm8r",
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
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role != ''",
    "viewRule": "@request.auth.role != ''",
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("obaqft54uy417kr");

  return dao.deleteCollection(collection);
})
