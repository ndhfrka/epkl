/// <reference path="../pb_data/types.d.ts" />
// Akun instansi (clasnet): bisa MELIHAT jurnal, absen, rekapan, dan agenda siswa
// (read-only), tetap bisa mengisi nilai, tapi TIDAK bisa mengedit/mengupload
// data lain (create/update/delete jurnal & absen diblokir untuk instansi).
migrate((app) => {
  const ruleUser = "user = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"
  const ruleJurnal = "siswa = @request.auth.id || @request.auth.role = 'guru' || @request.auth.role = 'instansi'"

  const targets = [
    { name: "absen", rule: ruleUser },
    { name: "rekapan_bulanan", rule: ruleUser },
    { name: "agenda_info", rule: ruleUser },
    { name: "jurnal", rule: ruleJurnal }
  ]
  for (const t of targets) {
    const c = app.findCollectionByNameOrId(t.name)
    if (String(c.listRule).indexOf("instansi") === -1) c.listRule = t.rule
    if (String(c.viewRule).indexOf("instansi") === -1) c.viewRule = t.rule
    app.save(c)
  }

  // update jurnal: cegah instansi menyunting jurnal siswa
  const c = app.findCollectionByNameOrId("jurnal")
  const cur = String(c.updateRule || "")
  if (cur.indexOf("instansi") === -1) {
    c.updateRule = "(" + cur + ") && @request.auth.role != 'instansi'"
    app.save(c)
  }
}, (app) => {
  const oldUser = "user = @request.auth.id || @request.auth.role = 'guru'"
  const oldJurnal = "siswa = @request.auth.id || @request.auth.role = 'guru'"

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
  const c = app.findCollectionByNameOrId("jurnal")
  c.updateRule = "siswa = @request.auth.id || @request.auth.id != ''"
  app.save(c)
})
