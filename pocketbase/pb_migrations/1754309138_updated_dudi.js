/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  collection.name = "iduka"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  collection.name = "dudi"

  return app.save(collection)
})
