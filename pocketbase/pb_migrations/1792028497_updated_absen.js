/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3694013751")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || user = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= user.siswa))",
    "viewRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || user = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= user.siswa))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3694013751")

  // update collection data
  unmarshal({
    "listRule": "user = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'",
    "viewRule": "user = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"
  }, collection)

  return app.save(collection)
})
