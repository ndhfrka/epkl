// ============================================================
// usePengingat — pengingat otomatis absen & jurnal harian
// Muncul otomatis setelah pukul 16.00 jika belum diisi.
// State dibagi satu untuk semua instance lonceng (mobile & desktop)
// supaya tidak ada pengecekan ganda dan datanya selalu sinkron.
// ============================================================

// JAM PENGINGAT DEFAULT: 16.00 — notif otomatis hanya aktif mulai jam ini.
//
// MODE UJI COBA (tanpa menunggu jam 16.00) — jalankan di Console browser:
//   localStorage.setItem('epkl_jam_pengingat', '9')   // contoh: jam 09.00
//   lalu refresh halaman → lonceng berperilaku seolah-olah jam sudah ≥ 09.00
// Kembalikan normal:
//   localStorage.removeItem('epkl_jam_pengingat')
const DEFAULT_JAM_PENGINGAT = 16

// --- state bersama (module-level) ---
const items = ref([])
const memeriksa = ref(false)
const jamPengingatEfektif = ref(DEFAULT_JAM_PENGINGAT)

let terakhirDiperiksa = 0
let terakhirCekManual = 0        // waktu cek manual (klik lonceng) terakhir
let intervalId = null
let debounceRefreshId = null
let retryRefreshId = null
let transisiTimerId = null       // timer yang menyala tepat saat masuk jam pengingat
let visibilityTerpasang = false  // listener visibilitychange cukup 1x

export function usePengingat() {
  const user = usePocketBaseUser()
  const client = usePocketBaseClient()

  const role = computed(() => user?.user.value?.role || 'siswa')
  const uid = computed(() => user?.user.value?.id || '')

  // Jam pengingat efektif (bisa di-override lewat localStorage untuk uji coba)
  function bacaJamPengingat() {
    if (!import.meta.client) return DEFAULT_JAM_PENGINGAT
    try {
      const v = parseInt(localStorage.getItem('epkl_jam_pengingat'), 10)
      if (!isNaN(v) && v >= 0 && v <= 23) return v
    } catch (_) {}
    return DEFAULT_JAM_PENGINGAT
  }

  function msMenujuJamPengingat(now = new Date()) {
    const jam = jamPengingatEfektif.value
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), jam, 0, 0, 0)
    return target.getTime() - now.getTime()
  }

  // ========================================================================
  //  PERBAIKAN NOTIFIKASI TIDAK HILANG SETELAH ISI DATA
  // ========================================================================
  // Masalah lama: user sudah isi absen/jurnal → cekPengingat(true) dipanggil,
  // tapi notifikasi masih muncul. Penyebab paling sering:
  //   (1) TIME GAP — PocketBase butuh beberapa ratus ms untuk commit data ke
  //       SQLite disk. Kalau kita cek LANGSUNG setelah .update()/create()
  //       selesai di-network, cache PB di-memory bisa saja belum di-refresh.
  //   (2) RACE — pemanggilan cekPengingat(true) bertabrakan dengan cek
  //       interval (per menit) atau event lain.
  //   (3) Mark absen TIDAK HANYA 'v' — user mengisi S (sakit), I (izin),
  //       X (alpa) — code LAMA hanya cek `a.marks && a.marks[hari]` (TRUE),
  //       tapi ada edge case ketika marks[hari] = 0 / false / null string.
  //
  // Solusi sistematis:
  //   • requestCheck(): DEBOUNCE 500ms → beri waktu PocketBase commit dulu.
  //   • Setelah requestCheck dijalankan DAN hasilnya MASIH ADA notifikasi
  //     tapi user baru saja klik isi (mode paksa=true) → RETRY 1x lagi
  //     setelah 1500ms — data PB dijamin sudah masuk.
  //   • Filter mark absen LEBIH KETAT: dianggap terisi JIKA field hari ini
  //     ADA dan BUKAN empty string, apa pun nilainya (v/s/i/x).
  // ========================================================================

  function requestCheck(paksa = false) {
    // Debounce 500ms — banyak event trigger (setelah absen / jurnal / realtime)
    // tidak perlu memanggil pengecekan tiap event. Cukup 1x setelah stabil.
    if (debounceRefreshId) clearTimeout(debounceRefreshId)
    debounceRefreshId = setTimeout(() => cekPengingatInternal(paksa, 1), 500)
  }

  // Pasang timer yang menyala TEPAT saat memasuki jam pengingat supaya badge
  // muncul seketika — tidak menunggu interval 60 detik + throttle 4 menit.
  function jadwalkanTransisi() {
    if (!import.meta.client) return
    if (transisiTimerId) { clearTimeout(transisiTimerId); transisiTimerId = null }
    const ms = msMenujuJamPengingat()
    if (ms > 0 && ms < 24 * 60 * 60 * 1000) {
      transisiTimerId = setTimeout(() => {
        transisiTimerId = null
        cekPengingatInternal(false, 1, true) // dariTransisi → lewati throttle
      }, ms + 1000)
    }
  }

  // Kalau tab sempat di background ketika jam berganti (browser men-throttle
  // interval), saat tab kembali aktif langsung periksa — jangan tunggu tick.
  function pasangVisibilityListener() {
    if (!import.meta.client || visibilityTerpasang) return
    visibilityTerpasang = true
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return
      if (!uid.value || role.value !== 'siswa') return
      const jam = bacaJamPengingat()
      if (jam !== jamPengingatEfektif.value) jamPengingatEfektif.value = jam
      const now = new Date()
      if (now.getHours() >= jamPengingatEfektif.value && Date.now() - terakhirDiperiksa > 60 * 1000) {
        cekPengingatInternal(false, 1, true)
      } else {
        jadwalkanTransisi() // sinkronkan ulang timer (jam bisa bergeser saat sleep)
      }
    })
  }

  async function cekPengingatInternal(paksa, attempt, dariTransisi = false) {
    if (!import.meta.client) return
    // jam pengingat efektif bisa berubah (mode uji) → perbarui label
    const jam = bacaJamPengingat()
    if (jam !== jamPengingatEfektif.value) jamPengingatEfektif.value = jam

    if (!uid.value || role.value !== 'siswa') { items.value = []; return }

    const now = new Date()
    // sebelum jam pengingat: tidak ada notifikasi otomatis (kecuali diminta paksa).
    // [PERBAIKAN] hasil cek MANUAL (klik lonceng) TIDAK lagi dihapus oleh
    // pemeriksaan otomatis selama masih segar (≤ 30 menit). Dulu interval 60
    // detik menghapusnya begitu saja → badge "hilang sendiri" setelah ±1 menit.
    if (now.getHours() < jam && !paksa && !dariTransisi) {
      const manualMasihSegar = terakhirCekManual && (Date.now() - terakhirCekManual) < 30 * 60 * 1000
      if (!manualMasihSegar && items.value.length) items.value = []
      jadwalkanTransisi()
      return
    }
    // hemat request TANPA mode paksa: cek ulang maksimal 1x per 4 menit.
    // [PERBAIKAN] pengecualian saat transisi masuk jam pengingat / tab kembali
    // aktif → badge muncul seketika, bukan terlambat beberapa menit.
    if (!paksa && !dariTransisi && Date.now() - terakhirDiperiksa < 4 * 60 * 1000) return
    terakhirDiperiksa = Date.now()
    memeriksa.value = true
    try {
      const bulan = now.getMonth() + 1
      const tahun = now.getFullYear()
      const hari = String(now.getDate())
      client.autoCancellation(false)

      const [jurnal, absen] = await Promise.all([
        client.collection('jurnal').getList(1, 10, {
          filter: `siswa="${uid.value}"`,
          sort: '-created',
          fields: 'id,isDraft,created,tanggal_agenda',
          requestKey: null,       // ← JANGAN pakai cache key sama
          $cancelKey: 'pengingat-jurnal-' + attempt,
        }).catch(() => null),
        client.collection('absen').getList(1, 10, {
          filter: `user="${uid.value}" && bulan=${bulan} && tahun=${tahun}`,
          fields: 'id,marks',
          requestKey: null,       // ← JANGAN pakai cache key sama
          $cancelKey: 'pengingat-absen-' + attempt,
        }).catch(() => null),
      ])

      // jurnal terhitung "hari ini" jika label agenda-nya hari ini ATAU dibuat hari ini
      const samaHari = (j) => {
        const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
        const tgl = j?.tanggal_agenda ? String(j.tanggal_agenda).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/) : null
        if (tgl) {
          const t = new Date(+tgl[3], +tgl[2] - 1, +tgl[1])
          if (t.getFullYear() === y && t.getMonth() === m && t.getDate() === d) return true
        }
        const buat = j?.created ? new Date(String(j.created).replace(' ', 'T')) : null
        return !!(buat && !isNaN(buat) && buat.getFullYear() === y && buat.getMonth() === m && buat.getDate() === d)
      }

      // [FIX #1 MARK ABSEN LEBIH KETAT]
      // Terhitung "sudah absen" jika ada record bulan ini yang pada field
      // tanggal HARI INI mengandung mark APAPUN (v / s / i / x)
      // — SELAMA BUKAN string kosong / null / undefined.
      // Sebelumnya `!!a.marks && a.marks[hari]` bisa gagal jika marks[hari]
      // = 0, false, atau string kosong dari data lama yang corrupt.
      const sudahAbsen = !!(absen?.items || []).some((a) => {
        if (!a.marks || typeof a.marks !== 'object' || Array.isArray(a.marks)) return false
        const val = a.marks[hari]
        if (val === null || val === undefined) return false
        const strVal = String(val).trim().toLowerCase()
        return strVal !== '' && strVal !== '0' && strVal !== 'false'
      })
      const jurnalItems = (jurnal?.items || []).filter(samaHari)
      const adaDraft = jurnalItems.some((j) => j.isDraft)
      const adaFinal = jurnalItems.some((j) => !j.isDraft)

      const list = []
      if (!sudahAbsen) {
        list.push({
          id: 'absen',
          icon: 'bi-calendar2-check',
          to: '/proyek',
          text: 'Kamu belum mengisi absen hari ini.',
        })
      }
      if (!adaFinal) {
        list.push({
          id: 'jurnal',
          icon: 'bi-journals',
          to: '/jurnal/tambah',
          text: adaDraft
            ? 'Jurnal hari ini masih draft — selesaikan dan kirim.'
            : 'Kamu belum mengisi jurnal hari ini.',
        })
      }
      items.value = list
      if (paksa) terakhirCekManual = Date.now()

      // [FIX #2 RETRY KEDUA KALAU MASIH ADA NOTIF DAN MODE PAKSA]
      // User baru saja klik simpan (paksa=true) — tapi hasil pengecekan
      // MASIH menyatakan belum isi. Kemungkinan besar commit PB belum selesai
      // di disk. Coba LAGI 1500ms kemudian.
      if (paksa && list.length && attempt === 1) {
        if (retryRefreshId) clearTimeout(retryRefreshId)
        retryRefreshId = setTimeout(() => cekPengingatInternal(true, 2), 1500)
      }
    } catch (_) {
      terakhirDiperiksa = 0 // gagal → boleh coba lagi nanti
    } finally {
      memeriksa.value = false
    }
  }

  // Backward compatible — call dengan nama lama cekPengingat langsung diarahkan
  // ke debounced wrapper untuk stabilitas.
  function cekPengingat(paksa = false) {
    requestCheck(paksa)
  }

  function mulaiInterval() {
    if (intervalId) return
    intervalId = setInterval(() => cekPengingat(), 60 * 1000)
  }
  function stopInterval() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
  }

  watch(
    [uid, role],
    ([v, r]) => {
      if (v && r === 'siswa') {
        cekPengingat()
        mulaiInterval()
        jadwalkanTransisi()
        pasangVisibilityListener()
      }
      else { stopInterval(); items.value = [] }
    },
    { immediate: true }
  )

  return { items, memeriksa, cekPengingat, role, JAM_PENGINGAT: DEFAULT_JAM_PENGINGAT, jamPengingatEfektif }
}
