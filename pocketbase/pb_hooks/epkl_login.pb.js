/**
 * ePKL — Login gabungan siswa & guru dalam SATU request.
 *
 * Masalah yang diselesaikan:
 *   Sebelumnya halaman login mencoba student_users dulu, lalu fallback ke
 *   teacher_users. Akibatnya SETIAP login akun guru selalu meninggalkan
 *   error merah "POST .../student_users/auth-with-password 400" di console
 *   browser, meskipun login akhirnya berhasil.
 *
 * Endpoint baru:
 *   POST /api/epkl/login   { "identity": "<username>", "password": "..." }
 *   → 200 { token, record, koleksi }  bila cocok di salah satu koleksi
 *   → 400 { code, message }           bila kredensial salah / kosong
 *
 * Catatan: endpoint ini TIDAK menggantikan endpoint auth bawaan PocketBase;
 * keduanya tetap jalan. Frontend punya fallback ke alur lama bila endpoint
 * ini tidak tersedia (mis. hosting yang tidak mendukung pb_hooks).
 */

routerAdd('POST', '/api/epkl/login', (e) => {
  const info = e.requestInfo()
  const identity = String((info.body && info.body.identity) || '').trim()
  const password = String((info.body && info.body.password) || '')

  if (!identity || !password) {
    return e.json(400, {
      code: 400,
      message: 'identity dan password wajib diisi.',
    })
  }

  // Coba cocokkan pada satu koleksi auth. Return record-nya bila cocok.
  const coba = (namaKoleksi) => {
    let rec = null
    try {
      rec = $app.findFirstRecordByFilter(namaKoleksi, 'username = {:u}', {
        u: identity,
      })
    } catch (err) {
      return null // username tidak ada di koleksi ini
    }
    if (!rec) return null
    try {
      if (rec.validatePassword(password)) return rec
    } catch (err) {}
    return null
  }

  let rec = coba('student_users')
  let koleksi = 'student_users'
  if (!rec) {
    rec = coba('teacher_users')
    koleksi = 'teacher_users'
  }

  if (!rec) {
    return e.json(400, { code: 400, message: 'Failed to authenticate.' })
  }

  return e.json(200, {
    token: rec.newAuthToken(),
    record: rec.publicExport(),
    koleksi: koleksi,
  })
})
