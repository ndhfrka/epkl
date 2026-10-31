/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "listRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || siswa = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa.siswa))",
    "viewRule": "(@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek' || siswa = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa.siswa))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("yr4k50nyt95w2do")

  // update collection data
  unmarshal({
    "listRule": "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'",
    "viewRule": "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"
  }, collection)

  return app.save(collection)
})
