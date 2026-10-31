/// <reference path="../pb_data/types.d.ts" />
// Akun instansi (perusahaan tempat PKL): bisa login dan hanya bisa
// mengisi/mengupload nilai siswa di halaman Nilai. Akses lain dibatasi
// oleh rules koleksi (jurnal/absen/rekapan hanya milik siswa & guru).
// Migration ini fail-safe: tidak pernah melempar error supaya PocketBase
// tetap bisa start meski data lama bentrok (perbaikan manual lewat admin).
migrate((app) => {
  let collection = null
  try {
    collection = app.findCollectionByNameOrId("teacher_users")
  } catch (e) {
    return
  }

  // 1. pastikan opsi role 'instansi' tersedia
  try {
    let roleField = collection.fields.getByName("role")
    if (roleField && roleField.values.indexOf("instansi") === -1) {
      roleField.values.push("instansi")
      app.save(collection)
    }
  } catch (e) {}

  // 2. pastikan akun clasnet ada dengan role instansi
  try {
    const existing = app.findRecordByFilter(collection, "username = 'clasnet'")
    if (existing.getString("role") !== "instansi") {
      existing.set("role", "instansi")
      app.save(existing)
    }
    return
  } catch (e) {}

  // belum ada: buat baru (kalau bentrok data lama, biarkan — diperbaiki manual)
  try {
    const rec = new Record(collection)
    rec.set("username", "clasnet")
    rec.set("nama", "Clasnet")
    rec.set("role", "instansi")
    rec.set("verified", true)
    rec.setPassword("clasnet123")
    app.save(rec)
  } catch (e) {}
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("teacher_users")
    const rec = app.findRecordByFilter(collection, "username = 'clasnet'")
    app.delete(rec)
  } catch (e) {}
})
