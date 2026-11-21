/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "((@request.auth.role = \"instansi\" && @request.auth.iduka != \"\" && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa) || (@request.auth.role = \"guru\" && @collection.siswa.id ?= siswa && @collection.siswa.guru_pembimbing ?= @request.auth.id))",
    "updateRule": "((@request.auth.role = \"instansi\" && @request.auth.iduka != \"\" && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa) || (@request.auth.role = \"guru\" && @collection.siswa.id ?= siswa && @collection.siswa.guru_pembimbing ?= @request.auth.id))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("r0d15lq7e7cnru4")

  // update collection data
  unmarshal({
    "createRule": "((@request.auth.role = \"instansi\" && @request.auth.iduka != \"\" && @request.auth.iduka = @collection.pemetaan.iduka && @collection.pemetaan.siswa = siswa) || (@request.auth.role = \"guru\" && @collection.siswa.id = siswa && @collection.siswa.guru_pembimbing = @request.auth.id))",
    "updateRule": "(@request.auth.role = \"guru\" && @collection.siswa.id ?= siswa && @collection.siswa.guru_pembimbing ?= @request.auth.id)"
  }, collection)

  return app.save(collection)
})
