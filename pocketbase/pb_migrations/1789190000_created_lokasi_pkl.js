/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // lewati bila koleksi sudah ada (mis. dibuat via API sebelumnya)
  try {
    app.findCollectionByNameOrId("lokasi_pkl")
    return
  } catch {}

  const usersCol = app.findCollectionByNameOrId("student_users")
  const ruleSendiri = "siswa = @request.auth.id"

  const collection = new Collection({
    "type": "base",
    "name": "lokasi_pkl",
    // semua user login boleh melihat daftar lokasi PKL (agar teman bisa melihat lokasi satu sama lain)
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    // hanya boleh menambah/mengubah/menghapus lokasi milik sendiri
    "createRule": ruleSendiri,
    "updateRule": ruleSendiri,
    "deleteRule": ruleSendiri,
    "fields": [
      { "type": "relation", "name": "siswa", "required": true, "collectionId": usersCol.id, "maxSelect": 1 },
      { "type": "text", "name": "nama_iduka", "required": true, "max": 120 },
      { "type": "text", "name": "alamat", "required": true, "max": 500 },
      { "type": "url", "name": "link_maps" }
    ]
  })

  return app.save(collection)
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("lokasi_pkl")
    return app.delete(collection)
  } catch {}
})
