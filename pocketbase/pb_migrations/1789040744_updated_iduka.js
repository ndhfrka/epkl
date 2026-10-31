/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != ''"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  }, collection)

  return app.save(collection)
})
