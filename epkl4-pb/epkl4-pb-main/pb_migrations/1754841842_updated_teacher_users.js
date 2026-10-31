/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove
  collection.schema.removeField("ohhjnqmz")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ohhjnqmz",
    "name": "pembimbing",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "p3mkjk78uv3foib",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
