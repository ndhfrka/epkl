/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

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

  return dao.saveCollection(collection)
})
