/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mwu4xb4m",
    "name": "sakit",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "clzuzg1z",
    "name": "izin",
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

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "644wdh07",
    "name": "tanpa_keterangan",
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
  const collection = dao.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // remove
  collection.schema.removeField("mwu4xb4m")

  // remove
  collection.schema.removeField("clzuzg1z")

  // remove
  collection.schema.removeField("644wdh07")

  return dao.saveCollection(collection)
})
