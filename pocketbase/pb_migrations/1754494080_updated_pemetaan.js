/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8eirehuj",
    "name": "siswa",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "x7r3nzzkgabfesz",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8eirehuj",
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
  }))

  return app.save(collection)
})
