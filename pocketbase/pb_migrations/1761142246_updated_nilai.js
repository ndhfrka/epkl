/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a9rmli6a",
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
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "a9rmli6a",
    "name": "prokel",
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
  }))

  return app.save(collection)
})
