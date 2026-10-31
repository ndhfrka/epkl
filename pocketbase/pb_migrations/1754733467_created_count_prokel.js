/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "0rwszo91buttd1m",
    "created": "2025-08-09 09:57:47.840Z",
    "updated": "2025-08-09 09:57:47.840Z",
    "name": "count_prokel",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "p3xuy1tp",
        "name": "jumlah_prokel",
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
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT COUNT(id) as jumlah_prokel, id FROM program_keahlian"
    }
  });

  return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("0rwszo91buttd1m");

  return app.deleteCollection(collection);
})
