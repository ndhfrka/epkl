/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("a4vhqmka6xzhiq3")

  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan'"

  return app.save(collection)
})
