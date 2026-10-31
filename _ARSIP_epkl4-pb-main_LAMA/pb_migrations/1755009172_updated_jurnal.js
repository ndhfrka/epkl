/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rogaljbz",
    "name": "cp",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "l1zpbg8579l8ue1",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove
  collection.schema.removeField("rogaljbz")

  return dao.saveCollection(collection)
})
