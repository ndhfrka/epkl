/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'instansi'",
    "updateRule": "@request.auth.role = 'instansi'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'guru' || @request.auth.role = 'jurusan' || @request.auth.id != ''"
  }, collection)

  return app.save(collection)
})
