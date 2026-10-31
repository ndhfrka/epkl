/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "l1zpbg8579l8ue1",
    "created": "2025-08-11 12:20:45.697Z",
    "updated": "2025-08-11 12:20:45.697Z",
    "name": "cp",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "mofts9ek",
        "name": "elemen",
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
        "id": "gmmi6et7",
        "name": "deskripsi",
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
        "id": "cggz3tvj",
        "name": "program_keahlian",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "w2z820jytrbxugw",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("l1zpbg8579l8ue1");

  return dao.deleteCollection(collection);
})
