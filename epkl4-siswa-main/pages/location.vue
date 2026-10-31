<template>
  <div class="lokasi-page">
    <!-- Header -->
    <div class="lokasi-header">
      <div>
        <h1 class="lokasi-title">
          <i class="bi bi-geo-alt-fill"></i>
          Lokasi PKL
        </h1>
        <p class="lokasi-subtitle">Tempat magang (IDUKA) milikmu &amp; teman-teman</p>
      </div>
      <button
        v-if="isSiswa && !lokasiSaya"
        class="btn-m3 btn-tambah"
        type="button"
        @click="bukaForm()"
      >
        <i class="bi bi-plus-lg"></i>
        <span>Tambah Lokasi</span>
      </button>
    </div>

    <!-- Banner gagal muat -->
    <div v-if="loadError" class="alert-m3 alert-error" style="margin-bottom: 16px;">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>{{ loadError }}</span>
      <button class="btn-ulang" type="button" @click="muatLokasi">
        <i class="bi bi-arrow-clockwise"></i> Coba Lagi
      </button>
    </div>

    <!-- Form tambah / edit lokasi -->
    <div v-if="showForm" class="form-card">
      <h2 class="form-title">
        <i class="bi" :class="editingId ? 'bi-pencil-fill' : 'bi-pin-map-fill'"></i>
        {{ editingId ? 'Edit Lokasi PKL' : 'Tambah Tempat PKL Baru' }}
      </h2>
      <p class="form-hint">
        Isi nama perusahaan dan alamat lengkap. Peta akan otomatis menunjuk lokasi tersebut.
      </p>

      <div v-if="formError" class="alert-m3 alert-error">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>{{ formError }}</span>
      </div>

      <label class="field-label" for="f-nama">Nama Perusahaan / IDUKA <span class="req">*</span></label>
      <input id="f-nama" v-model="formNama" class="m3-input" type="text" maxlength="120"
        placeholder="cth: CV Clasnet CCTV" />

      <label class="field-label" for="f-alamat">Alamat Lengkap <span class="req">*</span></label>
      <textarea id="f-alamat" v-model="formAlamat" class="m3-input m3-textarea" rows="3" maxlength="500"
        placeholder="cth: Jl. Merdeka No.10, Banjarnegara, Jawa Tengah"></textarea>

      <label class="field-label" for="f-link">Link Google Maps <span class="opsional">(opsional)</span></label>
      <input id="f-link" v-model="formLink" class="m3-input" type="url"
        placeholder="https://maps.google.com/..." />

      <div class="form-actions">
        <button class="btn-m3 btn-simpan" type="button" :disabled="menyimpan" @click="simpanLokasi">
          <span v-if="menyimpan" class="dots"><i></i><i></i><i></i></span>
          <i v-else class="bi bi-check-lg"></i>
          <span>{{ menyimpan ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Lokasi') }}</span>
        </button>
        <button v-if="editingId" class="btn-m3 btn-batal" type="button" @click="tutupForm">
          Batal
        </button>
      </div>
    </div>

    <!-- ===== LOKASI SAYA ===== -->
    <div class="lokasi-layout">
      <div class="kolom-peta">
        <h3 class="bagian-title">
          <i class="bi bi-person-fill"></i>
          {{ isSiswa ? 'Lokasi Saya' : 'Peta Lokasi PKL' }}
        </h3>

        <!-- Belum punya lokasi: state kosong -->
        <div v-if="!terpilih && !memuat" class="kosong kartu-kosong">
          <template v-if="isSiswa">
            <i class="bi bi-pin-map kosong-icon"></i>
            <p class="kosong-teks">
              Kamu <b>belum menambahkan tempat PKL</b>.<br />
              Tambahkan agar guru &amp; teman bisa melihat lokasi magangmu.
            </p>
            <button class="btn-m3 btn-simpan" type="button" @click="bukaForm()">
              <i class="bi bi-plus-lg"></i>
              Tambah Lokasi PKL
            </button>
          </template>
          <template v-else>
            <i class="bi bi-people kosong-icon"></i>
            <p class="kosong-teks">
              Belum ada lokasi PKL siswa yang ditambahkan.<br />
              Upload lokasi PKL hanya berlaku untuk akun siswa.
            </p>
          </template>
        </div>

        <!-- Sedang menampilkan lokasi (milik sendiri / teman) -->
        <template v-else-if="terpilih">
          <div v-if="isSiswa && melihatTeman" class="chip-kembali">
            <button class="btn-kembali" type="button" @click="kembaliKeMilikSaya">
              <i class="bi bi-arrow-left"></i>
              Kembali ke Lokasi Saya
            </button>
          </div>

          <div class="map-frame">
            <iframe
              class="map-embed"
              :class="{ 'map-embed--blur': !petaAktif && petaSudahMuat }"
              :src="embedUrl"
              loading="eager"
              allowfullscreen
              referrerpolicy="no-referrer"
              @load="petaTampil"
            ></iframe>

            <!-- INTERSTITIUM: "Klik untuk aktifkan interaksi peta" -->
            <!-- Tujuan: mencegah user (tanpa sengaja) scroll / zoom peta saat scroll halaman -->
            <!-- (yang memicu request MapsJsInternalService/GetViewportInfo via gRPC   -->
            <!-- dan menghasilkan ERR_HTTP2_PING_FAILED). User HARUS klik dulu sebelum  -->
            <!-- sebelum iframe menerima event interaksi. Berlaku SEMUA perangkat. -->
            <div
              v-if="!petaAktif && petaSudahMuat"
              class="map-interstitium"
              @click="aktifkanPeta"
              role="button"
              tabindex="0"
              @keydown.enter.space.prevent="aktifkanPeta"
            >
              <div class="map-interstitium__btn">
                <i class="bi bi-hand-index-thumb-fill"></i>
                <span>Klik untuk Aktifkan Peta</span>
                <small>scroll halaman tidak akan terganggu zoom</small>
              </div>
            </div>

            <!-- Tombol buka layar penuh HANYA muncul SETELAH user aktifkan interaksi -->
            <!-- (supaya tidak tumpang tindih dengan interstitium). -->
            <button
              v-if="tampilkanTombolFs && petaAktif"
              type="button"
              class="map-aktifkan"
              @click="bukaPeta"
            >
              <span class="map-aktifkan-btn">
                <i class="bi bi-arrows-fullscreen"></i>
                Buka Peta Layar Penuh
              </span>
            </button>

            <div v-if="petaMemuat || !petaSudahMuat" class="map-loading">
              <span class="dots besar"><i></i><i></i><i></i></span>
              <p>Memuat peta...</p>
            </div>
          </div>

          <!-- Mode layar penuh (perangkat sentuh): di layer tanpa scroll halaman,
               peta embed bisa digeser 1 jari, di-zoom, dan diklik seperti di desktop.
               Strategi render supaya hanya SATU instance iframe Google Maps yang
               aktif pada satu waktu (hindari log "Running with experiment IDs"
               muncul berkali-kali karena iframe duplicate):
                 • v-if  = pernahBukaPeta    → hanya buat iframe fs SETELAH user klik buka
                 • v-show = petaLayarPenuh   → saat ditutup, cuma sembunyikan (tidak hancurkan)
                 • loading="lazy" + :src    → src berubah hanya saat embedUrl berubah  -->
          <Teleport to="body">
            <div v-if="pernahBukaPeta" v-show="petaLayarPenuh" class="peta-fullscreen">
              <div class="peta-fs-bar">
                <span class="peta-fs-title">
                  <i class="bi bi-geo-alt-fill"></i>
                  {{ terpilih?.nama_iduka }}
                </span>
                <button class="peta-fs-close" type="button" aria-label="Tutup peta" @click="tutupPeta">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <iframe
                v-show="petaLayarPenuh"
                :src="petaLayarPenuh ? embedUrl : 'about:blank'"
                class="peta-fs-map"
                loading="eager"
                allowfullscreen
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          </Teleport>

          <div class="info-card">
            <div class="info-head">
              <div class="info-icon">
                <i class="bi bi-buildings-fill"></i>
              </div>
              <div class="info-name-wrap">
                <h2 class="info-name">{{ terpilih.nama_iduka }}</h2>
                <span class="info-badge">
                  {{ melihatTeman ? ('PKL: ' + terpilih.pemilik + (terpilih.jumlahSiswa > 1 ? ' (' + terpilih.jumlahSiswa + ' siswa)' : '')) : 'Tempat PKL-mu' }}
                </span>
              </div>
            </div>
            <div class="info-body">
              <i class="bi bi-geo info-row-icon"></i>
              <p class="info-address">{{ terpilih.alamat }}</p>
            </div>
            <div class="info-actions">
              <a class="btn-m3 btn-directions" :href="directionsUrl" target="_blank" rel="noopener">
                <i class="bi bi-signpost-split-fill"></i>
                Petunjuk Arah
              </a>
              <button class="btn-m3 btn-copy" type="button" @click="salinAlamat">
                <i class="bi" :class="tersalin ? 'bi-check-lg' : 'bi-clipboard'"></i>
                {{ tersalin ? 'Tersalin!' : 'Salin Alamat' }}
              </button>
              <template v-if="!melihatTeman">
                <button class="btn-m3 btn-edit" type="button" @click="bukaForm(lokasiSaya)">
                  <i class="bi bi-pencil-fill"></i>
                  Edit
                </button>
                <button class="btn-m3 btn-hapus" type="button" @click="hapusLokasi(lokasiSaya)">
                  <i class="bi bi-trash-fill"></i>
                  Hapus
                </button>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- Daftar lokasi teman -->
      <div class="kolom-daftar">
        <h3 class="daftar-title">
          <i class="bi bi-people-fill"></i>
          {{ isSiswa ? 'Lokasi PKL Teman' : 'Lokasi PKL Siswa' }} ({{ teman.length }})
        </h3>

        <div v-if="memuat" class="kosong">
          <span class="dots besar"><i></i><i></i><i></i></span>
          <p>Memuat lokasi...</p>
        </div>

        <div v-else-if="teman.length === 0" class="kosong">
          <i class="bi bi-people kosong-icon"></i>
          <p>Belum ada teman yang menambahkan<br />tempat PKL-nya.</p>
        </div>

        <div v-else class="daftar-wrap">
          <button
            v-for="lok in teman"
            :key="lok.id"
            type="button"
            class="item-lokasi"
            :class="{ aktif: terpilih && terpilih.id === lok.id }"
            @click="lihatTeman(lok)"
          >
            <div class="item-pin">
              <i class="bi bi-geo-alt-fill"></i>
            </div>
            <div class="item-teks">
              <span class="item-nama">{{ lok.nama_iduka }}</span>
              <span class="item-alamat">{{ lok.alamat }}</span>
              <span class="item-pemilik">
                <i class="bi bi-person-fill"></i> {{ lok.pemilik }}
                <span v-if="lok.jumlahSiswa > 1" class="item-jumlah">{{ lok.jumlahSiswa }} siswa</span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

const user = usePocketBaseUser()
const client = usePocketBaseClient()

// upload lokasi PKL hanya berlaku untuk akun siswa (guru/instansi hanya melihat)
const isSiswa = computed(() => (user?.user?.value?.role || 'siswa') === 'siswa')
const isGuru = computed(() => (user?.user?.value?.role || '') === 'guru')

const lokasiSaya = ref(null)   // record milik user yang sedang login
const teman = ref([])          // record milik siswa lain
const terpilih = ref(null)     // lokasi yang sedang ditampilkan di peta
const memuat = ref(true)
const tersalin = ref(false)
const loadError = ref('')

// ==== state interaksi peta ====
// petaAktif: user sudah klik interstitium → boleh interaksi langsung dengan iframe.
//            SELAMA petaAktif=false, overlay menutup iframe → TIDAK ADA event
//            scroll/geser/zoom yang mencapai iframe → TIDAK ada request
//            MapsJsInternalService/GetViewportInfo → TIDAK ada ERR_HTTP2_PING_FAILED.
const petaAktif = ref(false)
// petaSudahMuat: iframe selesai kirim event load → interstitium baru muncul
//                (jika peta belum siap, loading overlay yang tampil)
const petaSudahMuat = ref(false)

function aktifkanPeta() {
  petaAktif.value = true
}

// ==== state form ====
const showForm = ref(false)
const editingId = ref(null)
const formNama = ref('')
const formAlamat = ref('')
const formLink = ref('')
const formError = ref('')
const menyimpan = ref(false)

const melihatTeman = computed(() =>
  !!(terpilih.value && terpilih.value.id !== lokasiSaya.value?.id)
)

// ==== muat daftar lokasi dari PocketBase ====
async function muatLokasi() {
  memuat.value = true
  loadError.value = ''
  try {
    const idSaya = client.authStore?.model?.id
    const res = await client.collection('lokasi_pkl').getList(1, 200, {
      // expand 2 tingkat: lokasi_pkl.siswa (akun user) -> user.siswa (data siswa berisi nama)
      expand: 'siswa.siswa'
    })
    const items = (res?.items || []).map(r => ({
      id: r.id,
      nama_iduka: r.nama_iduka,
      alamat: r.alamat,
      link_maps: r.link_maps || '',
      // koordinat dari link maps (untuk menampilkan pin di peta)
      koordinat: ekstrakKoordinat(r.link_maps || ''),
      // nama asli siswa ada di data_siswa (relasi), fallback ke username akun
      pemilik: (r.expand?.siswa?.expand?.siswa?.nama || r.expand?.siswa?.username || '').trim(),
      milikSaya: r.siswa === idSaya,
      // id akun student_users pemilik lokasi (untuk mengikuti siswa yang dipilih di dasbor)
      siswaUserId: r.siswa,
      // guru pembimbing siswa pemilik lokasi ini (relasi bisa string atau array)
      guruPembimbing: (() => {
        const gp = r.expand?.siswa?.expand?.siswa?.guru_pembimbing
        return Array.isArray(gp) ? gp : (gp ? [gp] : [])
      })()
    }))
    lokasiSaya.value = items.find(i => i.milikSaya) || null

    // kelompokkan tempat PKL yang sama agar semua nama siswa tercantum di satu entri
    // (tempat yang sama tidak muncul dobel di daftar)
    const kelompok = new Map()
    for (const it of items.filter(i => !i.milikSaya)) {
      // kunci pengelompokan: nama iduka tanpa tanda baca/huruf besar/ spasi berlebih
      const kunci = it.nama_iduka.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      const g = kelompok.get(kunci)
      if (g) {
        g.ids.push(it.id)
        g.namaSiswa.push(it.pemilik || '(tanpa nama)')
        if (it.siswaUserId) g.siswaUserIds.push(it.siswaUserId)
        for (const gid of it.guruPembimbing) {
          if (!g.guruIds.includes(gid)) g.guruIds.push(gid)
        }
      } else {
        kelompok.set(kunci, {
          ...it,
          ids: [it.id],
          namaSiswa: [it.pemilik || '(tanpa nama)'],
          siswaUserIds: it.siswaUserId ? [it.siswaUserId] : [],
          guruIds: [...it.guruPembimbing]
        })
      }
    }
    teman.value = [...kelompok.values()].map(g => ({
      ...g,
      pemilik: g.namaSiswa.join(', '),
      jumlahSiswa: g.namaSiswa.length
    }))

    // default tampilan:
    // - siswa: lokasi milik sendiri
    // - guru/instansi: lokasi siswa yang sedang dipilih di dasbor (dropdown pantauan),
    //   fallback: siswa bimbingan (guru), lalu lokasi pertama di daftar
    if (isSiswa.value) {
      terpilih.value = lokasiSaya.value
    } else {
      const sidDipantau = await useSiswaDipantauAkunId()
      terpilih.value = (sidDipantau && teman.value.find(t => t.siswaUserIds?.includes(sidDipantau)))
        || (isGuru.value && teman.value.find(g => g.guruIds?.some(gid => gid === idSaya)))
        || (teman.value.length ? teman.value[0] : null)
    }
  } catch (e) {
    // gagal muat (mis. koleksi belum dibuat / belum restart PocketBase)
    loadError.value = 'Gagal memuat daftar lokasi. Pastikan PocketBase berjalan, lalu klik Coba Lagi.'
    lokasiSaya.value = null
    teman.value = []
    terpilih.value = null
  } finally {
    memuat.value = false
  }
}

function lihatTeman(lok) {
  terpilih.value = lok
  tersalin.value = false
  // gulir ke peta agar perubahan terlihat jelas di mobile
  setTimeout(() => {
    document.querySelector('.map-frame')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 50)
}

function kembaliKeMilikSaya() {
  terpilih.value = lokasiSaya.value
  tersalin.value = false
}

// ==== form ====
function bukaForm(lok) {
  if (!isSiswa.value) return // upload lokasi hanya untuk siswa
  if (lok && lok.milikSaya) {
    editingId.value = lok.id
    formNama.value = lok.nama_iduka
    formAlamat.value = lok.alamat
    formLink.value = lok.link_maps || ''
  } else {
    editingId.value = null
    formNama.value = ''
    formAlamat.value = ''
    formLink.value = ''
  }
  formError.value = ''
  showForm.value = true
  setTimeout(() => {
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 50)
}

function tutupForm() {
  showForm.value = false
  editingId.value = null
  formError.value = ''
  menyimpan.value = false
}

async function simpanLokasi() {
  if (!isSiswa.value) return // upload lokasi hanya untuk siswa
  formError.value = ''
  if (!formNama.value.trim()) { formError.value = 'Nama perusahaan wajib diisi.'; return }
  if (!formAlamat.value.trim()) { formError.value = 'Alamat lengkap wajib diisi.'; return }

  menyimpan.value = true
  const payload = {
    siswa: client.authStore?.model?.id,
    nama_iduka: formNama.value.trim(),
    alamat: formAlamat.value.trim()
  }
  if (formLink.value.trim()) {
    let link = formLink.value.trim()
    // normalisasi: pastikan ada skema agar lolos validasi URL PocketBase
    if (!/^https?:\/\//i.test(link)) link = 'https://' + link
    payload.link_maps = link
  }

  try {
    const saved = editingId.value
      ? await client.collection('lokasi_pkl').update(editingId.value, payload)
      : await client.collection('lokasi_pkl').create(payload)
      await muatLokasi()
      // fallback optimis: pastikan lokasi langsung tampil walau refresh gagal
    if (!lokasiSaya.value && saved?.id) {
      lokasiSaya.value = {
        id: saved.id,
        nama_iduka: saved.nama_iduka,
        alamat: saved.alamat,
        link_maps: saved.link_maps || '',
        pemilik: '',
        milikSaya: true
      }
      terpilih.value = lokasiSaya.value
    }
    tutupForm()
  } catch (e) {
    console.error('Simpan lokasi gagal:', e?.response || e)
    let detail = ''
    const fields = e?.response?.data
    if (fields && typeof fields === 'object') {
      const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v?.message || 'tidak valid'}`)
      if (parts.length) detail = ' (' + parts.join('; ') + ')'
    }
    formError.value = (e?.response?.message || e?.message || 'Gagal menyimpan lokasi.') + detail
  } finally {
    menyimpan.value = false
  }
}

async function hapusLokasi(lok) {
  if (!confirm(`Hapus lokasi "${lok.nama_iduka}"?`)) return
  try {
    await client.collection('lokasi_pkl').delete(lok.id)
    terpilih.value = null
    await muatLokasi()
  } catch (e) {
    alert(e?.response?.message || 'Gagal menghapus lokasi.')
  }
}

// ==== peta Google Maps (embed, tanpa API key) ====
const petaSiap = ref(false)
let timerSiap = null

// ekstrak koordinat dari link Google Maps yang disimpan siswa
function ekstrakKoordinat(url) {
  if (!url) return ''
  // !3dlat!4dlng = koordinat pin tempat sebenarnya (paling akurat)
  let m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (!m) m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)      // pola /@lat,lng,z (pusat tampilan)
  if (!m) {
    try {
      const u = new URL(url)
      const q = u.searchParams.get('q') || u.searchParams.get('query')
      if (q) m = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/)
    } catch {}
  }
  return m ? `${m[1]},${m[2]}` : ''
}

// ambil nama tempat resmi dari link /maps/place/<Nama>/ (mis. "Clasnet CCTV")
// — nama resmi langsung ketemu Google (pin pasti muncul), berbeda dgn nama ketikan siswa
function ekstrakNamaTempat(url) {
  if (!url) return ''
  try {
    const m = url.match(/\/place\/([^/]+)/)
    return m ? decodeURIComponent(m[1]).replace(/\+/g, ' ').trim() : ''
  } catch {
    return ''
  }
}

// URL embed untuk lokasi terpilih
// CATATAN SEPUTAR ERROR 400 Bad Request di Google Maps output=embed:
//   • Google Maps SANGAT rewel terhadap karakter "control" (\r, \n, \t, \v dll),
//     spasi beruntun, atau tanda baca yang aneh di parameter q.
//   • Jika query q berisi newline dari field alamat PB, meskipun di-encode, Google Maps
//     seringkali menolak dengan 400 Bad Request.
//   • KOORDINAT LEBIH AMAN daripada text search — format `-6.xyz,106.xyz` hampir tidak
//     pernah menyebabkan 400 karena tidak ada parsing nama tempat di sisi Google.
//
// Strategi prioritas:
//   1. Jika ADA koordinat dari link_maps → GUNAKAN KOORDINAT SEBAGAI q (paling aman).
//   2. Jika TIDAK ADA koordinat → pakai nama + alamat, TAPI bersihkan SEMUA control char,
//      trim spasi beruntun, dan hapus non-printable.
//   3. Tambahkan ie=UTF8 & oe=UTF8 untuk memastikan encoding charset disepakati.
const embedUrl = computed(() => {
  const t = terpilih.value
  if (!t) return ''
  const koordinat = ekstrakKoordinat(t.link_maps)
  let q
  if (koordinat) {
    // PRIORITAS TERTINGGI: koordinat (hampir tidak pernah 400)
    q = koordinat
  } else {
    // Fallback text search: bersihkan SEMUA karakter yang bisa bikin GMaps 400
    const nama = ekstrakNamaTempat(t.link_maps)
    const alamat = (t.alamat || '').toString()
    const namaId = (t.nama_iduka || '').toString()
    const mentah = (nama && alamat ? `${nama}, ${alamat}` : '')
      || nama
      || [namaId, alamat].map(x => (x || '').trim()).filter(Boolean).join(', ')
      || 'Indonesia'
    // [1] Hapus ALL control characters (0x00-0x1F dan 0x7F) — ini TERBUKA menyebabkan 400
    //     meskipun di-encode. (misal \r \n \t \b \f \v di field alamat PB yang di-copy paste)
    // [2] Trim spasi beruntun dan non-breaking space (nbsp).
    // [3] Hapus semua backtick & tanda kutip tidak seimbang yang tersisa.
    q = mentah
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/`+/g, '')
      .replace(/^[,;\s]+|[,;\s]+$/g, '')
      .trim()
    if (!q) q = 'Indonesia'
  }
  // t=k  → tampilan satelit (sesuai project memory PKL)
  // hl=id → label bahasa Indonesia
  // ie=UTF8 & oe=UTF8 → encoding charset eksplisit agar tidak miss-parse
  // z=17 → zoom level
  return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) +
    '&z=17&t=k&hl=id&ie=UTF8&oe=UTF8&output=embed'
})

// tombol petunjuk arah via Google Maps
const directionsUrl = computed(() => {
  const t = terpilih.value
  if (!t) return 'https://www.google.com/maps'
  const koordinat = ekstrakKoordinat(t.link_maps)
  let tujuan
  if (koordinat) {
    tujuan = koordinat
  } else {
    const namaId = (t.nama_iduka || '').toString()
    const alamat = (t.alamat || '').toString()
    tujuan = `${namaId}, ${alamat}`
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/`+/g, '')
      .replace(/^[,;\s]+|[,;\s]+$/g, '')
      .trim() || 'Indonesia'
  }
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(tujuan)
})

// overlay loading hilang saat iframe selesai dimuat
function petaTampil() {
  clearTimeout(timerSiap)
  petaSiap.value = true
  petaSudahMuat.value = true
}

// pengaman: tutup overlay bila iframe lambat/terhalang ekstensi
// Saat user pilih lokasi BERBEDA → reset SEMUA state interaksi peta ke default:
//   • petaAktif=false → interstitium muncul lagi (harus klik lagi → aman)
//   • petaSiap=false, petaSudahMuat=false → tampil loading dulu
watch(terpilih, () => {
  petaSiap.value = false
  petaSudahMuat.value = false
  petaAktif.value = false
  clearTimeout(timerSiap)
  timerSiap = setTimeout(petaTampil, 8000)
}, { immediate: true })

const petaMemuat = computed(() => memuat.value || !petaSiap.value)

// perangkat sentuh (HP/tablet): iframe embed Google Maps yang dimuat di halaman
// yang bisa di-scroll membatasi interaksi satu jari (perilaku bawaan Chrome/WebKit).
// Solusi (dipakai Google sendiri): buka peta dalam mode layar penuh — di layer
// tanpa scroll halaman, peta bisa digeser, di-zoom, dan diklik seperti di desktop.
const tampilkanTombolFs = ref(false)
const petaLayarPenuh = ref(false)

onMounted(() => {
  tampilkanTombolFs.value = window.matchMedia('(pointer: coarse)').matches
})

// iframe layar penuh dipertahankan (v-show) setelah pertama dibuka supaya
// menutup peta tidak membatalkan request Google yang masih berjalan (ERR_ABORTED)
const pernahBukaPeta = ref(false)

function bukaPeta() {
  // User tap "Buka Layar Penuh" = otomatis set interaksi PETA AKTIF juga,
  // supaya interstitium hilang dan tidak ada konflik z-index / interaksi tertutup.
  petaAktif.value = true
  petaLayarPenuh.value = true
  pernahBukaPeta.value = true
}

function tutupPeta() {
  petaLayarPenuh.value = false
}

// kunci scroll halaman selama peta layar penuh terbuka
watch(petaLayarPenuh, (terbuka) => {
  document.body.style.overflow = terbuka ? 'hidden' : ''
})

onBeforeUnmount(() => {
  clearTimeout(timerSiap)
  document.body.style.overflow = ''
})

async function salinAlamat() {
  if (!terpilih.value) return
  try {
    await navigator.clipboard.writeText(terpilih.value.alamat)
    tersalin.value = true
    setTimeout(() => (tersalin.value = false), 2000)
  } catch (e) {
    tersalin.value = false
  }
}

onMounted(() => {
  if (user?.user?.value?.id) {
    muatLokasi()
  }
})

// pengaman: muat ulang jika data user berubah saat sesi aktif
watch(() => user?.user?.value?.id, (id, lama) => {
  if (id && id !== lama) muatLokasi()
})
</script>

<style scoped>
.lokasi-page {
  max-width: 1100px;
  margin: 0 auto;
}

/* ===== Header ===== */
.lokasi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.lokasi-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}
.lokasi-title i {
  color: #ea4335;
}
.lokasi-subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}

/* ===== Judul bagian ===== */
.bagian-title,
.daftar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}
.bagian-title i,
.daftar-title i {
  color: var(--md-sys-color-primary, #4f46e5);
}

/* ===== Layout utama ===== */
.lokasi-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 900px) {
  .lokasi-layout {
    grid-template-columns: 1.35fr 1fr;
    align-items: start;
  }
  .kolom-peta {
    position: sticky;
    top: 80px;
  }
}

/* ===== Chip kembali ke lokasi saya ===== */
.chip-kembali {
  margin-bottom: 10px;
}
.btn-kembali {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--md-sys-color-outline-variant, #c4c7c5);
  background: var(--md-sys-color-surface, #fff);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-kembali:hover {
  background: var(--md-sys-color-surface-container, #f0edf4);
}

/* ===== Bingkai peta ===== */
.map-frame {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
  margin-bottom: 16px;
}
.map-embed {
  display: block;
  width: 100%;
  height: 320px;
  border: 0;
  transition: filter 0.25s ease, transform 0.25s ease;
}
.map-embed--blur {
  filter: blur(1.5px) saturate(0.95) brightness(0.92);
  transform: scale(1.005);
  pointer-events: none;
}
@media (min-width: 900px) {
  .map-embed {
    height: 400px;
  }
}

/* ===== Overlay interstitium "klik untuk aktifkan interaksi" ===== */
.map-interstitium {
  position: absolute;
  inset: 0;
  z-index: 4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background transparan agar user masih bisa melihat peta di belakang,
     tapi SEMUA event (scroll, click, drag, pinch) DITANGKAP oleh overlay */
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(0.6px);
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.map-interstitium:hover,
.map-interstitium:focus-visible {
  background: rgba(0, 0, 0, 0.52);
}
.map-interstitium:focus-visible {
  box-shadow: inset 0 0 0 3px var(--md-sys-color-primary, #60a5fa);
}
.map-interstitium__btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 18px 26px 16px;
  border-radius: var(--md-sys-shape-corner-extra-large, 28px);
  background: var(--md-sys-color-primary-container, #004a77);
  color: var(--md-sys-color-on-primary-container, #d4e3ff);
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.55),
    0 3px 8px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
  pointer-events: none;
  max-width: 86%;
  text-align: center;
}
.map-interstitium:hover .map-interstitium__btn {
  transform: translateY(-1px) scale(1.01);
  background: var(--md-sys-color-primary, #60a5fa);
  color: var(--md-sys-color-on-primary, #001f36);
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.55),
    0 4px 10px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.map-interstitium:active .map-interstitium__btn {
  transform: translateY(0) scale(0.99);
}
.map-interstitium__btn > i {
  color: currentColor;
  font-size: 1.6rem;
  margin-bottom: 2px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
}
.map-interstitium__btn > small {
  font-weight: 500;
  color: currentColor;
  font-size: 0.74rem;
  opacity: 0.78;
  line-height: 1.3;
}

/* ===== Overlay loading peta ===== */
.map-loading {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--md-sys-color-surface, #05080f);
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  font-size: 0.85rem;
}
.map-loading p {
  margin: 0;
}

/* ===== Tombol buka peta layar penuh (hanya tampil setelah petaAktif) ===== */
.map-aktifkan {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 14px;
  background: transparent;
  border: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  pointer-events: none;
}
.map-aktifkan-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 999px;
  background: var(--md-sys-color-secondary-container, #3b4758);
  color: var(--md-sys-color-on-secondary-container, #d9e3f7);
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255,255,255,0.08);
  pointer-events: auto;
  transition: transform 0.15s ease, background 0.2s ease;
}
.map-aktifkan:hover .map-aktifkan-btn {
  transform: translateY(-1px);
  background: var(--md-sys-color-primary-container, #004a77);
  color: var(--md-sys-color-on-primary-container, #d4e3ff);
}

/* ===== Peta mode layar penuh (perangkat sentuh) ===== */
.peta-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: var(--md-sys-color-surface, #fff);
}
.peta-fs-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  background: var(--md-sys-color-surface, #fff);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}
.peta-fs-title {
  flex: 1 1 auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.peta-fs-title i {
  color: #ea4335;
  flex-shrink: 0;
}
.peta-fs-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 0;
  background: var(--md-sys-color-surface-container, #f0edf4);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.peta-fs-close:active {
  transform: scale(0.94);
}
.peta-fs-map {
  flex: 1 1 auto;
  width: 100%;
  border: 0;
  /* area interaksi tanpa scroll halaman: peta bisa digeser 1 jari & di-zoom */
  touch-action: pan-x pan-y;
}

/* ===== Kartu info ===== */
.info-card {
  background: var(--md-sys-color-surface-container-low, #f6f6f6);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 16px;
}
.info-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.info-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--md-sys-color-primary-container, #e8def8);
  color: var(--md-sys-color-on-primary-container, #21005d);
  font-size: 1.3rem;
  flex-shrink: 0;
}
.info-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  word-break: break-word;
}
.info-badge {
  display: inline-block;
  margin-top: 2px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--md-sys-color-tertiary-container, #cce5f0);
  color: var(--md-sys-color-on-tertiary-container, #004a63);
  font-size: 0.72rem;
  font-weight: 600;
}
.info-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--md-sys-color-surface-container, #f0edf4);
  margin-bottom: 14px;
}
.info-row-icon {
  color: #ea4335;
  font-size: 1.05rem;
  margin-top: 2px;
}
.info-address {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

/* ===== Tombol ===== */
.info-actions,
.form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn-m3 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease, transform 0.1s ease;
}
.btn-m3:active {
  transform: scale(0.97);
}
.btn-m3:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-tambah,
.btn-simpan {
  background: var(--md-sys-color-primary, #4f46e5);
  color: var(--md-sys-color-on-primary, #fff);
}
.btn-directions {
  background: var(--md-sys-color-primary, #4f46e5);
  color: var(--md-sys-color-on-primary, #fff);
}
.btn-directions:hover {
  filter: brightness(1.1);
  color: var(--md-sys-color-on-primary, #fff);
}
.btn-copy {
  background: var(--md-sys-color-secondary-container, #e3f2fd);
  color: var(--md-sys-color-on-secondary-container, #0d47a1);
}
.btn-copy:hover {
  filter: brightness(0.97);
}
.btn-edit {
  background: var(--md-sys-color-primary-container, #e8def8);
  color: var(--md-sys-color-on-primary-container, #21005d);
}
.btn-hapus {
  background: #fdecec;
  color: #b3261e;
}
.btn-batal {
  background: var(--md-sys-color-surface-container, #f0edf4);
  color: var(--md-sys-color-on-surface, #1c1b1f);
}

/* ===== Form tambah/edit ===== */
.form-card {
  background: var(--md-sys-color-surface-container-low, #f6f6f6);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 16px;
  border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
}
.form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}
.form-title i {
  color: var(--md-sys-color-primary, #4f46e5);
}
.form-hint {
  margin: 0 0 14px;
  font-size: 0.83rem;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.field-label {
  display: block;
  font-size: 0.83rem;
  font-weight: 600;
  margin: 12px 0 6px;
  color: var(--md-sys-color-on-surface, #1c1b1f);
}
.field-label .req {
  color: #ea4335;
}
.field-label .opsional {
  font-weight: 400;
  color: var(--md-sys-color-on-surface-variant, #49454f);
}
.m3-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline, #c4c7c5);
  background: var(--md-sys-color-surface, #fff);
  color: var(--md-sys-color-on-surface, #1c1b1f);
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}
.m3-input:focus {
  border-color: var(--md-sys-color-primary, #4f46e5);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}
.m3-textarea {
  resize: vertical;
  min-height: 84px;
  font-family: inherit;
}
.form-actions {
  margin-top: 16px;
}

/* ===== Alert ===== */
.alert-m3 {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
  margin-bottom: 12px;
}
.alert-error {
  background: var(--md-sys-color-error-container, #ffe7e7);
  color: var(--md-sys-color-on-error-container, #8c1d18);
}
.btn-ulang {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--md-sys-color-on-error-container, #8c1d18);
  background: transparent;
  color: var(--md-sys-color-on-error-container, #8c1d18);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-ulang:hover {
  background: rgba(140, 29, 24, 0.08);
}

/* ===== Daftar lokasi teman ===== */
.kolom-daftar {
  background: var(--md-sys-color-surface-container-low, #f6f6f6);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 16px;
}
.daftar-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-lokasi {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: var(--md-sys-color-surface, #fff);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.item-lokasi:hover {
  background: var(--md-sys-color-surface-container, #f0edf4);
}
.item-lokasi.aktif {
  border-color: var(--md-sys-color-primary, #4f46e5);
  background: var(--md-sys-color-primary-container, #e8def8);
}
.item-pin {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdecec;
  color: #ea4335;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.item-lokasi.aktif .item-pin {
  background: #fff;
}
.item-teks {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-nama {
  font-weight: 700;
  font-size: 0.93rem;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  word-break: break-word;
}
.item-alamat {
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  word-break: break-word;
}
.item-pemilik {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--md-sys-color-primary, #4f46e5);
  margin-top: 2px;
}

.item-jumlah {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  background: var(--md-sys-color-primary, #4f46e5);
  white-space: nowrap;
}

/* ===== Kosong / loading ===== */
.kosong {
  text-align: center;
  padding: 28px 12px;
  color: var(--md-sys-color-on-surface-variant, #49454f);
  font-size: 0.88rem;
}
.kartu-kosong {
  background: var(--md-sys-color-surface-container-low, #f6f6f6);
  border-radius: 18px;
  border: 2px dashed var(--md-sys-color-outline-variant, #c4c7c5);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.kosong-icon {
  font-size: 2.2rem;
  color: var(--md-sys-color-outline, #c4c7c5);
}
.kosong-teks {
  margin: 0;
  line-height: 1.6;
}

/* ===== Loading dots ===== */
.dots {
  display: inline-flex;
  gap: 4px;
}
.dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: dotBounce 0.9s infinite ease-in-out;
}
.dots i:nth-child(2) { animation-delay: 0.15s; }
.dots i:nth-child(3) { animation-delay: 0.3s; }
.dots.besar i { width: 9px; height: 9px; }
@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-5px); opacity: 1; }
}
</style>
