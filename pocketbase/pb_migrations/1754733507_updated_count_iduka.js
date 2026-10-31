/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("xujbbw53t37p22u")

  collection.listRule = "@request.auth.role = 'admin'"
  collection.viewRule = "@request.auth.role = 'admin'"

  // remove
  collection.schema.removeField("eccbrk5j")

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

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("xujbbw53t37p22u")

  collection.listRule = null
  collection.viewRule = null

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eccbrk5j",
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
  collection.schema.removeField("ncxpas2b")

  return app.save(collection)
})
