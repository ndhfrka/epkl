/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("xujbbw53t37p22u")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE isArchive=false"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("xujbbw53t37p22u")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka"
  }, collection)

  return app.save(collection)
})
