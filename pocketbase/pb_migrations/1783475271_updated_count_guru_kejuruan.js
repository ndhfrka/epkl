/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1159169265")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(*) as jumlah_guru, id FROM teacher_users\nWHERE role = 'guru' OR role = 'jurusan' AND kelompok_mapel='Guru Kejuruan'"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1159169265")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT COUNT(*) as jumlah_guru, id FROM teacher_users\nWHERE role = 'guru' OR role = 'jurusan'"
  }, collection)

  return app.save(collection)
})
