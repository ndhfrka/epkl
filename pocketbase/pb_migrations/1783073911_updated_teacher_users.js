/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "manageRule": "@request.auth.collectionName = 'teacher_users'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("1d4fljtg4b3ycm6")

  // update collection data
  unmarshal({
    "manageRule": null
  }, collection)

  return app.save(collection)
})
