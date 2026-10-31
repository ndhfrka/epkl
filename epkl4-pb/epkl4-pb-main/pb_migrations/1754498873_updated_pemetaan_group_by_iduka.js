/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.options = {
    "query": "SELECT \n  iduka.id, iduka.nama, iduka.terisi, \n  iduka.jumlah_kuota, iduka.wilayah\n  FROM pemetaan\n  INNER JOIN iduka on pemetaan.iduka=iduka.id\n  INNER JOIN program_keahlian on pemetaan.program_keahlian=program_keahlian.id\n  GROUP BY iduka.nama\n  ORDER BY iduka.wilayah ASC"
  }

  // remove
  collection.schema.removeField("kwhoycx1")

  // remove
  collection.schema.removeField("3eqwwehy")

  // remove
  collection.schema.removeField("zba6ao5e")

  // remove
  collection.schema.removeField("4flkp7bl")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bfmsteis",
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
    "id": "sqof0kkz",
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
    "id": "ptv9i1d8",
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
    "id": "w39q9bnf",
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

  collection.options = {
    "query": "SELECT \n  iduka.id, iduka.nama, iduka.terisi, iduka.jumlah_kuota, iduka.wilayah\n  FROM pemetaan\n  INNER JOIN iduka on pemetaan.iduka=iduka.id\n  INNER JOIN siswa on pemetaan.siswa=siswa.id\n  \n  GROUP BY iduka.nama\n  ORDER BY iduka.wilayah ASC"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kwhoycx1",
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
    "id": "3eqwwehy",
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
    "id": "zba6ao5e",
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
    "id": "4flkp7bl",
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
  collection.schema.removeField("bfmsteis")

  // remove
  collection.schema.removeField("sqof0kkz")

  // remove
  collection.schema.removeField("ptv9i1d8")

  // remove
  collection.schema.removeField("w39q9bnf")

  return dao.saveCollection(collection)
})
