/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'wakasek'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("w2z820jytrbxugw")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "deleteRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  }, collection)

  return app.save(collection)
})
