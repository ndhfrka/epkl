/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "vnqha4wpfll82e8",
    "created": "2025-08-06 16:36:10.794Z",
    "updated": "2025-08-06 16:36:10.794Z",
    "name": "pemetaan_group_by_iduka",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "w5lzjtaa",
        "name": "nama",
        "type": "text",
        "required": false,
        "presentable": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "pdlihcmt",
        "name": "terisi",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT iduka.id, iduka.nama, iduka.terisi FROM pemetaan\n  INNER JOIN iduka on iduka.id=pemetaan.iduka\n  INNER JOIN siswa on siswa.id=pemetaan.siswa\nGROUP BY iduka.nama"
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8");

  return dao.deleteCollection(collection);
})
