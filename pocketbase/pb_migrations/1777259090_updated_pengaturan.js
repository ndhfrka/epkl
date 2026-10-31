/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("6fjhpg0dy7g24wa")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'tu'",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'tu'"
  }, collection)

  return app.save(collection)
})
