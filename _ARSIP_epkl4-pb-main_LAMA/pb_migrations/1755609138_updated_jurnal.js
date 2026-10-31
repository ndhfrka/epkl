/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hxpqscaa",
    "name": "foto",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/jpeg",
        "image/png"
      ],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yr4k50nyt95w2do")

  // remove
  collection.schema.removeField("hxpqscaa")

  return dao.saveCollection(collection)
})
