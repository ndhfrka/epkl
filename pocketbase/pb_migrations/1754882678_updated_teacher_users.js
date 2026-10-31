/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

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

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

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

  return app.save(collection)
})
