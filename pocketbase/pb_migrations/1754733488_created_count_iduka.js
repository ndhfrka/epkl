/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "xujbbw53t37p22u",
    "created": "2025-08-09 09:58:08.667Z",
    "updated": "2025-08-09 09:58:08.667Z",
    "name": "count_iduka",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "eccbrk5j",
        "name": "jumlah_iduka",
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
      "query": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka"
    }
  });

  return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("xujbbw53t37p22u");

  return app.deleteCollection(collection);
})
