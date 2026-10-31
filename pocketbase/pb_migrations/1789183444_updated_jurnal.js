/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "listRule": "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'",
    "viewRule": "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "listRule": "siswa = @request.auth.id || @request.auth.role = 'guru'",
    "viewRule": "siswa = @request.auth.id || @request.auth.role = 'guru'"
  }, collection)

  return app.save(collection)
})
