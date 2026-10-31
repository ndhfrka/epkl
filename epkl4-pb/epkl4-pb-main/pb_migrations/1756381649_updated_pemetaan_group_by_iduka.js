/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.listRule = "@request.auth.id != ''"

  // remove
  collection.schema.removeField("xsmzb1gf")

  // remove
  collection.schema.removeField("pghn0xhm")

  // remove
  collection.schema.removeField("nxjxapnq")

  // remove
  collection.schema.removeField("cwfmo67d")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "3lopsui1",
    "name": "nama",
    "type": "text",
    "required": false,
    "presentable": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r8gnyoxe",
    "name": "terisi",
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
    "id": "xfxazvxt",
    "name": "jumlah_kuota",
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
    "id": "fxovx2py",
    "name": "wilayah",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "dalam",
        "luar"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.listRule = ""

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xsmzb1gf",
    "name": "nama",
    "type": "text",
    "required": false,
    "presentable": true,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pghn0xhm",
    "name": "terisi",
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
    "id": "nxjxapnq",
    "name": "jumlah_kuota",
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
    "id": "cwfmo67d",
    "name": "wilayah",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "dalam",
        "luar"
      ]
    }
  }))

  // remove
  collection.schema.removeField("3lopsui1")

  // remove
  collection.schema.removeField("r8gnyoxe")

  // remove
  collection.schema.removeField("xfxazvxt")

  // remove
  collection.schema.removeField("fxovx2py")

  return dao.saveCollection(collection)
})
