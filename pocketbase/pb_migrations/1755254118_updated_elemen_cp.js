/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("l1zpbg8579l8ue1")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || program_keahlian = @request.auth.program_keahlian"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
})
