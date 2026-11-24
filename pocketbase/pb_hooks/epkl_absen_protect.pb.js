/**
 * ePKL — Pelindung & notifikasi baris absen (PocketBase JSVM).
 *
 * CATATAN PENTING JSVM: handler hook TIDAK bisa memanggil fungsi/konstanta
 * yang didefinisikan di level file (ReferenceError saat runtime) — semua
 * logika harus ditulis INLINE di dalam tiap handler. Karena itu blok-blok
 * di bawah ini sengaja berulang.
 *
 * Aturan inti:
 * 1) Baris absen yang memiliki tanda APA PUN pada `marks` (✓/S/I/x) tidak
 *    boleh DIHAPUS oleh siswa (baris kosong = draf, boleh).
 * 2) Tanda ALFA ('x') hanya bisa dihapus guru/instansi/admin — siswa tidak.
 * 3) Tanda ALFA BARU memicu notifikasi ke akun GURU per jurusan
 *    (teacher_users role 'guru' dengan program_keahlian yang sama dengan
 *    jurusan siswa) — disimpan di koleksi `notifikasi`.
 */

// ---------- 1) PELINDUNG HAPUS ----------
onRecordDeleteRequest((e) => {
  try {
    const rec = e.record
    const idBaris = String(rec.id || '')

    // dekode kolom JSON `marks` (bisa datang sebagai string / array byte / objek)
    const raw = rec.get('marks')
    let marksObj = {}
    if (typeof raw === 'string') {
      const s = raw.trim()
      if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
        try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
      }
    } else if (Array.isArray(raw)) {
      let arrByte = raw.length > 0
      for (let i = 0; i < raw.length; i++) {
        if (typeof raw[i] !== 'number' || raw[i] < 0 || raw[i] > 255) { arrByte = false; break }
      }
      if (arrByte) {
        const s = String.fromCharCode.apply(null, raw).trim()
        if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
          try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
        }
      }
    } else if (raw && typeof raw === 'object') {
      marksObj = raw
    }

    let berTanda = false
    for (const k in marksObj) {
      const v = marksObj[k]
      if (String(v == null ? '' : v).trim() !== '') { berTanda = true; break }
    }
    console.log('[PROTEKSI] delete absen id=' + idBaris + ' adaTanda=' + berTanda)

    // Tanpa tanda = draf → jalur normal (pemilik baris boleh menghapusnya).
    if (!berTanda) {
      e.next()
      return
    }

    // staff (superuser/guru/instansi) boleh
    let staff = false
    if (e.hasSuperuserAuth()) staff = true
    else {
      const auth = e.auth
      if (auth) {
        let koleksi = ''
        let peran = ''
        try { koleksi = String(auth.collection().name || '') } catch (err) {}
        try { peran = String(auth.getString('role') || '') } catch (err) {}
        if (koleksi === '_superusers' || koleksi === 'teacher_users' || peran === 'guru' || peran === 'instansi') staff = true
      }
    }
    if (staff) {
      e.next()
      return
    }
    throw new BadRequestError(
      'Baris absen yang sudah divalidasi tidak bisa dihapus oleh siswa. Hubungi guru bila ada kekeliruan.'
    )
  } catch (err) {
    if (err && String(err.message || '').indexOf('Baris absen') === 0) throw err
    console.log('[PROTEKSI] delete guard error: ' + err)
    e.next() // gagal membaca kondisi → jalur normal
  }
}, 'absen')

// ---------- 2) PELINDUNG UBAH: tanda Alfa hanya bisa dihapus guru ----------
onRecordUpdateRequest((e) => {
  try {
    const rec = e.record

    const dekode = function (raw) {
      let marksObj = {}
      if (typeof raw === 'string') {
        const s = raw.trim()
        if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
          try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
        }
      } else if (Array.isArray(raw)) {
        let arrByte = raw.length > 0
        for (let i = 0; i < raw.length; i++) {
          if (typeof raw[i] !== 'number' || raw[i] < 0 || raw[i] > 255) { arrByte = false; break }
        }
        if (arrByte) {
          const s = String.fromCharCode.apply(null, raw).trim()
          if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
            try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
          }
        }
      } else if (raw && typeof raw === 'object') {
        marksObj = raw
      }
      return marksObj
    }

    const baru = dekode(rec.get('marks'))
    let lama = {}
    try {
      lama = dekode(rec.original().get('marks'))
    } catch (err) {
      try { lama = dekode($app.findRecordById('absen', rec.id).get('marks')) } catch (err2) {
        console.log('[PROTEKSI] gagal baca marks lama: ' + err2)
        e.next()
        return
      }
    }

    // daftar hari bertanda 'x'
    const xDari = function (m) {
      const out = []
      for (const k in m) if (String(m[k]) === 'x') out.push(k)
      return out
    }
    const xLama = xDari(lama)
    const xBaru = xDari(baru)

    let alfaDihapus = false
    for (let i = 0; i < xLama.length; i++) {
      if (xBaru.indexOf(xLama[i]) === -1) { alfaDihapus = true; break }
    }
    if (!alfaDihapus) {
      e.next()
      return
    }

    let staff = false
    if (e.hasSuperuserAuth()) staff = true
    else {
      const auth = e.auth
      if (auth) {
        let koleksi = ''
        let peran = ''
        try { koleksi = String(auth.collection().name || '') } catch (err) {}
        try { peran = String(auth.getString('role') || '') } catch (err) {}
        if (koleksi === '_superusers' || koleksi === 'teacher_users' || peran === 'guru' || peran === 'instansi') staff = true
      }
    }
    if (staff) {
      e.next()
      return
    }
    throw new BadRequestError(
      'Tanda Alfa hanya bisa dihapus oleh guru. Hubungi guru bila ada kekeliruan.'
    )
  } catch (err) {
    if (err && String(err.message || '').indexOf('Tanda Alfa') === 0) throw err
    console.log('[PROTEKSI] update guard error: ' + err)
    e.next()
  }
}, 'absen')

// ---------- 3) NOTIFIKASI ALPA BARU (create) ----------
onRecordAfterCreateSuccess((e) => {
  try {
    const rec = e.record

    const dekode = function (raw) {
      let marksObj = {}
      if (typeof raw === 'string') {
        const s = raw.trim()
        if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
          try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
        }
      } else if (Array.isArray(raw)) {
        let arrByte = raw.length > 0
        for (let i = 0; i < raw.length; i++) {
          if (typeof raw[i] !== 'number' || raw[i] < 0 || raw[i] > 255) { arrByte = false; break }
        }
        if (arrByte) {
          const s = String.fromCharCode.apply(null, raw).trim()
          if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
            try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
          }
        }
      } else if (raw && typeof raw === 'object') {
        marksObj = raw
      }
      return marksObj
    }

    const marksObj = dekode(rec.get('marks'))
    const daftarHari = []
    for (const k in marksObj) if (String(marksObj[k]) === 'x') daftarHari.push(k)
    if (!daftarHari.length) { e.next(); return }

    // ---- kirim notifikasi ke guru per jurusan ----
    const NAMA_BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const pad2 = function (n) { n = Number(n); return n < 10 ? '0' + n : '' + n }

    const idAkun = String(rec.getString('user') || '')
    if (!idAkun) { e.next(); return }
    let akun = null
    try { akun = $app.findRecordById('student_users', idAkun) } catch (err) { e.next(); return }
    const idSiswa = String(akun.getString('siswa') || '')
    if (!idSiswa) { e.next(); return }
    let siswa = null
    try { siswa = $app.findRecordById('siswa', idSiswa) } catch (err) { e.next(); return }
    const namaSiswa = String(siswa.getString('nama') || 'Siswa')
    const idPk = String(siswa.getString('program_keahlian') || '')
    if (!idPk) { e.next(); return }
    let namaJurusan = ''
    try { namaJurusan = String($app.findRecordById('program_keahlian', idPk).getString('nama') || '') } catch (err) {}

    const bulan = Number(rec.getInt('bulan'))
    const tahun = Number(rec.getInt('tahun'))

    const gurus = $app.findRecordsByFilter('teacher_users', "role = 'guru'", '', 100, 0)
    for (let gi = 0; gi < gurus.length; gi++) {
      const g = gurus[gi]
      const pkGuru = g.get('program_keahlian')
      let cocok = false
      if (Array.isArray(pkGuru)) cocok = pkGuru.indexOf(idPk) !== -1
      else if (typeof pkGuru === 'string') cocok = pkGuru === idPk
      if (!cocok) continue

      for (let hi = 0; hi < daftarHari.length; hi++) {
        const hari = Number(daftarHari[hi])
        const tgl = tahun + '-' + pad2(bulan) + '-' + pad2(hari)

        // hindari dobel
        let sudah = false
        try {
          $app.findFirstRecordByFilter('notifikasi',
            'penerima={:p} && tanggal_alpha={:t} && siswa_id={:s} && tipe="alpa"',
            { p: g.id, t: tgl, s: idSiswa })
          sudah = true
        } catch (err) {}
        if (sudah) continue

        let tglCantik = tgl
        try {
          const d = new Date(tahun, bulan - 1, hari)
          tglCantik = NAMA_HARI[d.getDay()] + ', ' + hari + ' ' + NAMA_BULAN[bulan] + ' ' + tahun
        } catch (err) {}

        const pesan = namaSiswa +
          (namaJurusan ? ' (' + namaJurusan + ')' : '') +
          ' tercatat ALFA pada ' + tglCantik +
          ' karena tidak mengisi jurnal PKL sampai pukul 18.00.'

        const notif = new Record($app.findCollectionByNameOrId('notifikasi'))
        notif.set('penerima', g.id)
        notif.set('judul', 'Siswa Alfa')
        notif.set('pesan', pesan)
        notif.set('tanggal_alpha', tgl)
        notif.set('siswa_id', idSiswa)
        notif.set('nama_siswa', namaSiswa)
        notif.set('dibaca', false)
        notif.set('tipe', 'alpa')
        $app.save(notif)
        console.log('[PROTEKSI] notifikasi alpa terkirim ke ' + g.getString('username') + ' untuk ' + namaSiswa + ' ' + tgl)
      }
    }
  } catch (err) {
    console.log('[PROTEKSI] notifikasi alpa (create) gagal: ' + err)
  }
  e.next()
}, 'absen')

// ---------- 4) NOTIFIKASI ALPA BARU (update — tanda x yang benar-benar baru) ----------
onRecordAfterUpdateSuccess((e) => {
  try {
    const rec = e.record

    const dekode = function (raw) {
      let marksObj = {}
      if (typeof raw === 'string') {
        const s = raw.trim()
        if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
          try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
        }
      } else if (Array.isArray(raw)) {
        let arrByte = raw.length > 0
        for (let i = 0; i < raw.length; i++) {
          if (typeof raw[i] !== 'number' || raw[i] < 0 || raw[i] > 255) { arrByte = false; break }
        }
        if (arrByte) {
          const s = String.fromCharCode.apply(null, raw).trim()
          if (s !== '' && s !== 'null' && s !== '[]' && s !== '{}') {
            try { marksObj = JSON.parse(s) } catch (err) { marksObj = {} }
          }
        }
      } else if (raw && typeof raw === 'object') {
        marksObj = raw
      }
      return marksObj
    }

    const lama = dekode(rec.original().get('marks'))
    const baru = dekode(rec.get('marks'))
    const daftarHari = []
    for (const k in baru) {
      if (String(baru[k]) === 'x' && String(lama[k] || '') !== 'x') daftarHari.push(k)
    }
    if (!daftarHari.length) { e.next(); return }

    // ---- kirim notifikasi ke guru per jurusan (blok sama dengan create) ----
    const NAMA_BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const pad2 = function (n) { n = Number(n); return n < 10 ? '0' + n : '' + n }

    const idAkun = String(rec.getString('user') || '')
    if (!idAkun) { e.next(); return }
    let akun = null
    try { akun = $app.findRecordById('student_users', idAkun) } catch (err) { e.next(); return }
    const idSiswa = String(akun.getString('siswa') || '')
    if (!idSiswa) { e.next(); return }
    let siswa = null
    try { siswa = $app.findRecordById('siswa', idSiswa) } catch (err) { e.next(); return }
    const namaSiswa = String(siswa.getString('nama') || 'Siswa')
    const idPk = String(siswa.getString('program_keahlian') || '')
    if (!idPk) { e.next(); return }
    let namaJurusan = ''
    try { namaJurusan = String($app.findRecordById('program_keahlian', idPk).getString('nama') || '') } catch (err) {}

    const bulan = Number(rec.getInt('bulan'))
    const tahun = Number(rec.getInt('tahun'))

    const gurus = $app.findRecordsByFilter('teacher_users', "role = 'guru'", '', 100, 0)
    for (let gi = 0; gi < gurus.length; gi++) {
      const g = gurus[gi]
      const pkGuru = g.get('program_keahlian')
      let cocok = false
      if (Array.isArray(pkGuru)) cocok = pkGuru.indexOf(idPk) !== -1
      else if (typeof pkGuru === 'string') cocok = pkGuru === idPk
      if (!cocok) continue

      for (let hi = 0; hi < daftarHari.length; hi++) {
        const hari = Number(daftarHari[hi])
        const tgl = tahun + '-' + pad2(bulan) + '-' + pad2(hari)

        let sudah = false
        try {
          $app.findFirstRecordByFilter('notifikasi',
            'penerima={:p} && tanggal_alpha={:t} && siswa_id={:s} && tipe="alpa"',
            { p: g.id, t: tgl, s: idSiswa })
          sudah = true
        } catch (err) {}
        if (sudah) continue

        let tglCantik = tgl
        try {
          const d = new Date(tahun, bulan - 1, hari)
          tglCantik = NAMA_HARI[d.getDay()] + ', ' + hari + ' ' + NAMA_BULAN[bulan] + ' ' + tahun
        } catch (err) {}

        const pesan = namaSiswa +
          (namaJurusan ? ' (' + namaJurusan + ')' : '') +
          ' tercatat ALFA pada ' + tglCantik +
          ' karena tidak mengisi jurnal PKL sampai pukul 18.00.'

        const notif = new Record($app.findCollectionByNameOrId('notifikasi'))
        notif.set('penerima', g.id)
        notif.set('judul', 'Siswa Alfa')
        notif.set('pesan', pesan)
        notif.set('tanggal_alpha', tgl)
        notif.set('siswa_id', idSiswa)
        notif.set('nama_siswa', namaSiswa)
        notif.set('dibaca', false)
        notif.set('tipe', 'alpa')
        $app.save(notif)
        console.log('[PROTEKSI] notifikasi alpa terkirim ke ' + g.getString('username') + ' untuk ' + namaSiswa + ' ' + tgl)
      }
    }
  } catch (err) {
    console.log('[PROTEKSI] notifikasi alpa (update) gagal: ' + err)
  }
  e.next()
}, 'absen')

console.log('[PROTEKSI] hook pelindung + notifikasi absen terpasang')
