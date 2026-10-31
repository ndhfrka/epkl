/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("fte9e1vcdurfgdt")

  collection.listRule = "  @request.auth.role = 'admin'"
  collection.viewRule = "  @request.auth.role = 'admin'"

  // remove
  collection.schema.removeField("fylpk158")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n9ne9s82",
    "name": "jumlah_siswa",
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
  const collection = dao.findCollectionByNameOrId("fte9e1vcdurfgdt")

  collection.listRule = null
  collection.viewRule = null

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "fylpk158",
    "name": "jumlah_siswa",
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
  collection.schema.removeField("n9ne9s82")

  return dao.saveCollection(collection)
})
