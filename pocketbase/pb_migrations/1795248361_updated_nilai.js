/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = \"instansi\" && @request.auth.iduka != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = \"instansi\""
  }, collection)

  return app.save(collection)
})
