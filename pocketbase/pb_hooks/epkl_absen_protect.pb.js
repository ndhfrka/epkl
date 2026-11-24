/**
 * ePKL — Pelindung baris absen yang sudah divalidasi.
 *
 * Aturan: baris absen yang sudah memiliki tanda APA PUN pada kolom `marks`
 * (✓ hadir / S sakit / I izin / x alfa — artinya jurnal sudah diupload dan/
 * atau sudah divalidasi guru) TIDAK BOLEH dihapus oleh siswa.
 *
 * Yang masih boleh dihapus siswa:
 *   - baris tanpa tanda sama sekali (marks kosong) — itu draf hasil tombol
 *     "keluar" yang belum pernah diisi jurnal / divalidasi guru.
 *
 * Yang selalu boleh menghapus baris ber-tanda:
 *   - superuser (panel admin PocketBase)
 *   - guru / instansi (koleksi teacher_users, atau role guru/instansi)
 *
 * Lapisan ini berdiri di server sehingga tetap berlaku walau ada orang
 * memanggil API langsung (menghindari penghapusan dari luar UI).
 */

onRecordDeleteRequest((e) => {
  const rec = e.record
  const idBaris = String(rec.id || '')

  // marks disimpan sebagai kolom JSON: { "1": "v", "5": "s", ... }
  // Di JSVM nilainya bisa sampai dalam beberapa bentuk: string JSON,
  // array byte ([123,125] = "{}"), atau objek — semuanya ditangani.
  const marks = rec.get('marks')
  let adaTanda = false
  const anggapAda = (s) => {
    const t = String(s).trim()
    return t !== '' && t !== '{}' && t !== 'null' && t !== '[]'
  }
  if (typeof marks === 'string') {
    adaTanda = anggapAda(marks)
  } else if (Array.isArray(marks)) {
    // array byte dari kolom JSON → diterjemahkan ke teks dulu
    let arrByte = marks.length > 0
    for (let i = 0; i < marks.length; i++) {
      if (typeof marks[i] !== 'number' || marks[i] < 0 || marks[i] > 255) {
        arrByte = false
        break
      }
    }
    adaTanda = arrByte
      ? anggapAda(String.fromCharCode.apply(null, marks))
      : marks.length > 0
  } else if (marks && typeof marks === 'object') {
    const daftar = Object.keys(marks)
    for (let i = 0; i < daftar.length; i++) {
      const v = marks[daftar[i]]
      if (String(v == null ? '' : v).trim() !== '') {
        adaTanda = true
        break
      }
    }
  }
  console.log('[PROTEKSI] delete absen id=' + idBaris + ' adaTanda=' + adaTanda)

  // Tanpa tanda = draf → jalur normal (pemilik baris boleh menghapusnya).
  if (!adaTanda) {
    e.next()
    return
  }

  // Superuser selalu boleh.
  try {
    if (e.hasSuperuserAuth()) {
      e.next()
      return
    }
  } catch (err) {
    console.log('[PROTEKSI] cek superuser gagal: ' + err)
  }

  // Guru / instansi (termasuk superuser yang auth-nya terbaca sebagai record).
  const auth = e.auth
  if (auth) {
    let koleksi = ''
    let peran = ''
    try { koleksi = String(auth.collection().name || '') } catch (err) {}
    try { peran = String(auth.getString('role') || '') } catch (err) {}
    if (koleksi === '_superusers' || koleksi === 'teacher_users' || peran === 'guru' || peran === 'instansi') {
      e.next()
      return
    }
  }

  // Sisanya (termasuk siswa) ditolak.
  throw new BadRequestError(
    'Baris absen yang sudah divalidasi tidak bisa dihapus oleh siswa. Hubungi guru bila ada kekeliruan.'
  )
}, 'absen')

console.log('[PROTEKSI] hook pelindung absen terpasang')
