/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3495023975")

  // update collection data
  unmarshal({
    "passwordAuth": {
      "identityFields": [
        "username"
      ]
    }
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "email3885137012",
    "name": "email",
    "onlyDomains": [],
    "presentable": false,
    "required": false,
    "system": true,
    "type": "email"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3495023975")

  // update collection data
  unmarshal({
    "passwordAuth": {
      "identityFields": [
        "username",
        "email"
      ]
    }
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "exceptDomains": [],
    "help": "",
    "hidden": false,
    "id": "email3885137012",
    "name": "email",
    "onlyDomains": [],
    "presentable": false,
    "required": true,
    "system": true,
    "type": "email"
  }))

  return app.save(collection)
})
