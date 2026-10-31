/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.name = "pemetaan"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.name = "pemetaan_pkl"

  return app.save(collection)
})
