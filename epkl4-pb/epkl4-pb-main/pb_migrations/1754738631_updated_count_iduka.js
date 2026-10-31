/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xujbbw53t37p22u")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  // remove
  collection.schema.removeField("ncxpas2b")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5j20j68b",
    "name": "jumlah_iduka",
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
  const collection = dao.findCollectionByNameOrId("xujbbw53t37p22u")

  collection.listRule = "@request.auth.role = 'admin'"
  collection.viewRule = "@request.auth.role = 'admin'"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ncxpas2b",
    "name": "jumlah_iduka",
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
  collection.schema.removeField("5j20j68b")

  return dao.saveCollection(collection)
})
