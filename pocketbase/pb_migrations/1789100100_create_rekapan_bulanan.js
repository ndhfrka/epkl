/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // lewati bila koleksi sudah ada (mis. dibuat via API sebelumnya)
  try {
    app.findCollectionByNameOrId("rekapan_bulanan")
    return
  } catch {}

  const usersCol = app.findCollectionByNameOrId("student_users")
  const rule = "user = @request.auth.id"

  const collection = new Collection({
    "type": "base",
    "name": "rekapan_bulanan",
    "listRule": rule,
    "viewRule": rule,
    "createRule": rule,
    "updateRule": rule,
    "deleteRule": rule,
    "fields": [
      { "type": "relation", "name": "user", "required": true, "collectionId": usersCol.id, "maxSelect": 1 },
      { "type": "number", "name": "bulan", "required": true },
      { "type": "number", "name": "tahun", "required": true },
      { "type": "number", "name": "hadir" },
      { "type": "number", "name": "sakit" },
      { "type": "number", "name": "izin" },
      { "type": "number", "name": "alpa" },
      { "type": "number", "name": "libur" }
    ]
  })

  return app.save(collection)
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("rekapan_bulanan")
    return app.delete(collection)
  } catch {}
})
