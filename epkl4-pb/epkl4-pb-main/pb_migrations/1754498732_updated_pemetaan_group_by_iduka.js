/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.options = {
    "query": "SELECT \n  iduka.id, iduka.nama, iduka.terisi, iduka.jumlah_kuota, iduka.wilayah\n  FROM pemetaan\n  INNER JOIN iduka on pemetaan.iduka=iduka.id\n  INNER JOIN siswa on pemetaan.siswa=siswa.id\n  \n  GROUP BY iduka.nama\n  ORDER BY iduka.wilayah ASC"
  }

  // remove
  collection.schema.removeField("kyg3avha")

  // remove
  collection.schema.removeField("0ebzhg92")

  // remove
  collection.schema.removeField("jmdzell3")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.options = {
    "query": "SELECT iduka.id, iduka.nama, iduka.terisi, iduka.jumlah_kuota FROM pemetaan\n  INNER JOIN iduka on iduka.id=pemetaan.iduka\n  INNER JOIN siswa on siswa.id=pemetaan.siswa\nGROUP BY iduka.nama"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kyg3avha",
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
    "id": "0ebzhg92",
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
    "id": "jmdzell3",
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

  // remove
  collection.schema.removeField("kwhoycx1")

  // remove
  collection.schema.removeField("3eqwwehy")

  // remove
  collection.schema.removeField("zba6ao5e")

  // remove
  collection.schema.removeField("4flkp7bl")

  return dao.saveCollection(collection)
})
