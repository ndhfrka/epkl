/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "(@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa)",
    "listRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || siswa = @request.auth.siswa || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa))",
    "updateRule": "(@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa)",
    "viewRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || siswa = @request.auth.siswa || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'instansi'",
    "listRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.role = 'instansi'",
    "viewRule": "@request.auth.id != ''"
  }, collection)

  return app.save(collection)
})
