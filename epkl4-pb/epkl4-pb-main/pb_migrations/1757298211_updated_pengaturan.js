/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9hlvrfmi",
    "name": "rentang_pelaksanaan",
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
  const collection = dao.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // remove
  collection.schema.removeField("9hlvrfmi")

  return dao.saveCollection(collection)
})
