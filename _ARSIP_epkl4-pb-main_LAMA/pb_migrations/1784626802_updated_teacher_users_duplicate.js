/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2735705349")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2735705349")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  }, collection)

  return app.save(collection)
})
