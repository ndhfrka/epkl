/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3694013751")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || @request.auth.role = 'guru'",
    "viewRule": "user = @request.auth.id || @request.auth.role = 'guru'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3694013751")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id",
    "viewRule": "user = @request.auth.id"
  }, collection)

  return app.save(collection)
})
