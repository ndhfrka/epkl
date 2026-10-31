/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_299784706")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE wilayah='dalam' AND isArchive=false"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_299784706")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE wilayah='dalam'"
  }, collection)

  return app.save(collection)
})
