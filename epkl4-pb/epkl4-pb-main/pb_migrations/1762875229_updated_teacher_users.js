/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ubcrgy9j",
    "name": "nip",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // remove
  collection.schema.removeField("ubcrgy9j")

  return dao.saveCollection(collection)
})
