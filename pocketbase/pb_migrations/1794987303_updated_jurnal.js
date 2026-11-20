/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "updateRule": "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "updateRule": "siswa = @request.auth.id"
  }, collection)

  return app.save(collection)
})
