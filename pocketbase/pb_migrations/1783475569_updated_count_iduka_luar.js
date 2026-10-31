/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1068511808")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE wilayah='luar' AND isArchive=false"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1068511808")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(id) as jumlah_iduka, id FROM iduka\nWHERE wilayah='luar'"
  }, collection)

  return app.save(collection)
})
