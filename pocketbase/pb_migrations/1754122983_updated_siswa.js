/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("x7r3nzzkgabfesz")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"
  collection.deleteRule = "@request.auth.role = 'admin' || @request.auth.role = 'guru'"

  return app.save(collection)
})
