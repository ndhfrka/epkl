/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru' || @request.auth.role = 'tu'"
  }, collection)

  return app.save(collection)
})
