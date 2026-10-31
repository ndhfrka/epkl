/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'guru'"

  return app.save(collection)
})
