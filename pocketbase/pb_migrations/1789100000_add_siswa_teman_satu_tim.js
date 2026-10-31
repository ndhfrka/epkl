/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("siswa")

  // lewati bila field sudah ada (mis. dibuat via API sebelumnya)
  try {
    collection.fields.getByName("teman_satu_tim")
    return
  } catch {}

  // add new field
  collection.fields.add(new Field({
    "type": "text",
    "name": "teman_satu_tim"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("siswa")

  // remove field
  collection.fields.removeByName("teman_satu_tim")

  return app.save(collection)
})
