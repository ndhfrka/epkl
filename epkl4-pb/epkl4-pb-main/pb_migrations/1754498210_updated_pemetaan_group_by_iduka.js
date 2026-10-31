/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.options = {
    "query": "SELECT iduka.id, iduka.nama, iduka.terisi, iduka.jumlah_kuota FROM pemetaan\n  INNER JOIN iduka on iduka.id=pemetaan.iduka\n  INNER JOIN siswa on siswa.id=pemetaan.siswa\nGROUP BY iduka.nama"
  }

  // remove
  collection.schema.removeField("w5lzjtaa")

  // remove
  collection.schema.removeField("pdlihcmt")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("vnqha4wpfll82e8")

  collection.options = {
    "query": "SELECT iduka.id, iduka.nama, iduka.terisi FROM pemetaan\n  INNER JOIN iduka on iduka.id=pemetaan.iduka\n  INNER JOIN siswa on siswa.id=pemetaan.siswa\nGROUP BY iduka.nama"
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w5lzjtaa",
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
    "id": "pdlihcmt",
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

  // remove
  collection.schema.removeField("kyg3avha")

  // remove
  collection.schema.removeField("0ebzhg92")

  // remove
  collection.schema.removeField("jmdzell3")

  return dao.saveCollection(collection)
})
