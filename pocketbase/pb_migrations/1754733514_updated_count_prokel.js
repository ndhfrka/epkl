/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("0rwszo91buttd1m")

  collection.listRule = "@request.auth.role = 'admin'"
  collection.viewRule = "@request.auth.role = 'admin'"

  // remove
  collection.schema.removeField("p3xuy1tp")

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

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("0rwszo91buttd1m")

  collection.listRule = null
  collection.viewRule = null

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "p3xuy1tp",
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
  collection.schema.removeField("2kzpl9dc")

  return app.save(collection)
})
