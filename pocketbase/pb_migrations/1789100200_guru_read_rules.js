/// <reference path="../pb_data/types.d.ts" />
// Akses read-only untuk akun guru: guru bisa MELIHAT absen, rekapan, agenda, dan jurnal siswa,
// tapi tidak bisa membuat/mengubah/menghapus (create/update/delete tetap rule siswa).
migrate((app) => {
  const ruleUser = "user = @request.auth.id || @request.auth.role = 'guru'"
  const ruleJurnal = "siswa = @request.auth.id || @request.auth.role = 'guru'"

  const targets = [
    { name: "absen", rule: ruleUser },
    { name: "rekapan_bulanan", rule: ruleUser },
    { name: "agenda_info", rule: ruleUser },
    { name: "jurnal", rule: ruleJurnal }
  ]
  for (const t of targets) {
    const c = app.findCollectionByNameOrId(t.name)
    c.listRule = t.rule
    c.viewRule = t.rule
    app.save(c)
  }
}, (app) => {
  const oldUser = "user = @request.auth.id"
  const oldJurnal = "@request.auth.id != ''"

  const targets = [
    { name: "absen", rule: oldUser },
    { name: "rekapan_bulanan", rule: oldUser },
    { name: "agenda_info", rule: oldUser },
    { name: "jurnal", rule: oldJurnal }
  ]
  for (const t of targets) {
    const c = app.findCollectionByNameOrId(t.name)
    c.listRule = t.rule
    c.viewRule = t.rule
    app.save(c)
  }
})
