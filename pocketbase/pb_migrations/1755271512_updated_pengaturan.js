/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  collection.createRule = "@request.auth.role = 'admin' || @request.auth.role = 'tu'"
  collection.updateRule = "@request.auth.role = 'admin' || @request.auth.role = 'tu'"

  return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  collection.createRule = ""
  collection.updateRule = ""

  return app.save(collection)
})
