/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  collection.viewRule = ""

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("44myub55g4kvbva")

  collection.viewRule = "@request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'guru'"

  return app.save(collection)
})
