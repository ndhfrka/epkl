/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2439879792")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'",
    "viewRule": "user = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2439879792")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || @request.auth.role = 'guru'",
    "viewRule": "user = @request.auth.id || @request.auth.role = 'guru'"
  }, collection)

  return app.save(collection)
})
