/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || (@request.auth.role = 'instansi' && iduka = @request.auth.iduka) || siswa = @request.auth.siswa)",
    "viewRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || (@request.auth.role = 'instansi' && iduka = @request.auth.iduka) || siswa = @request.auth.siswa)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''"
  }, collection)

  return app.save(collection)
})
