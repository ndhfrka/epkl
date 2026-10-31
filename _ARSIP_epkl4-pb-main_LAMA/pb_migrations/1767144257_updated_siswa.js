/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.id != ''"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  }, collection)

  return app.save(collection)
})
