/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = ""
  collection.viewRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  collection.listRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru' || @request.auth.role = 'tu'"
  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'guru' || @request.auth.role = 'tu'"

  return app.save(collection)
})
