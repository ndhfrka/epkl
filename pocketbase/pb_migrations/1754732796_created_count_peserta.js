/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "fte9e1vcdurfgdt",
    "created": "2025-08-09 09:46:36.303Z",
    "updated": "2025-08-09 09:46:36.303Z",
    "name": "count_peserta",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fylpk158",
        "name": "jumlah_siswa",
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
      "query": "SELECT COUNT(id) as jumlah_siswa, id FROM siswa"
    }
  });

  return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("fte9e1vcdurfgdt");

  return app.deleteCollection(collection);
})
