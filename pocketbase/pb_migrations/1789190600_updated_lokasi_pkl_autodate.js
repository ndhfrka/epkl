/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Tambahkan field autodate created/updated yang hilang
  // (koleksi lokasi_pkl dibuat via migrasi tanpa autodate, sehingga
  //  sort=-created di API selalu 400)
  const collection = app.findCollectionByNameOrId("lokasi_pkl")

  collection.fields.add(new Field({
    type: "autodate",
    name: "created",
    onCreate: true,
    system: false
  }))
  collection.fields.add(new Field({
    type: "autodate",
    name: "updated",
    onUpdate: true,
    system: false
  }))

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("lokasi_pkl")
  collection.fields.removeByName("created")
  collection.fields.removeByName("updated")
  app.save(collection)
})
