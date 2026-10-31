/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "oykj70ac09zvrc0",
    "created": "2025-08-11 12:12:44.481Z",
    "updated": "2025-08-11 12:12:44.481Z",
    "name": "pemetaan_pembimbing",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "k3pekue5",
        "name": "pembimbing",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "1d4fljtg4b3ycm6",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "7y4g6sdw",
        "name": "siswa",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "x7r3nzzkgabfesz",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "s29aapog",
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
  const collection = dao.findCollectionByNameOrId("oykj70ac09zvrc0");

  return dao.deleteCollection(collection);
})
