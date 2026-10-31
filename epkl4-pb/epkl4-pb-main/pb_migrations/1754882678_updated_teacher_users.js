/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f4nnhqpf",
    "name": "role",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "admin",
        "jurusan",
        "guru",
        "tu",
        "wakasek"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "f4nnhqpf",
    "name": "role",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "admin",
        "jurusan",
        "guru",
        "tu"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
