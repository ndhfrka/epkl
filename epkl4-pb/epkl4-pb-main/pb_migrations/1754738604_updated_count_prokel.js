/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0rwszo91buttd1m")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  // remove
  collection.schema.removeField("2kzpl9dc")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "z3ox2tb6",
    "name": "jumlah_prokel",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0rwszo91buttd1m")

  collection.listRule = "@request.auth.role = 'admin'"
  collection.viewRule = "@request.auth.role = 'admin'"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "2kzpl9dc",
    "name": "jumlah_prokel",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // remove
  collection.schema.removeField("z3ox2tb6")

  return dao.saveCollection(collection)
})
