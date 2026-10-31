<template>
  <div class="card">
    <div class="card-header">
      <span class="h5 fw-bold"><i class="bi bi-calendar2-check"></i> Absen PKL</span>
    </div>

    <div v-if="isLoading" class="card-body py-3">
      <loading />
    </div>

    <div v-else class="card-body">
      <!-- filter bulan & tahun: ganti bulan akan membuka data bulan tersebut -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
        <div class="d-flex gap-2">
          <select v-model="filterBulan" class="form-select form-select-sm agenda-filter" aria-label="Pilih bulan">
            <option v-for="(b, i) in bulanList" :key="i" :value="i + 1">{{ b }}</option>
          </select>
          <select v-model="filterTahun" class="form-select form-select-sm agenda-filter" aria-label="Pilih tahun">
            <option v-for="t in tahunList" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <span v-if="!isInstansi && !isGuru" class="text-muted agenda-hint">Klik kotak tanggal untuk menandai: ✓ hadir → S sakit → I izin → ✗ alpa → kosong <span class="versi-tag">v3</span></span>
      </div>

      <div v-if="simpanStatus.text" :class="'simpan-status simpan-' + simpanStatus.type" role="status">{{ simpanStatus.text }}</div>

      <div class="absen-legend mb-2">
        <span><b class="lg lg-v">✓</b> Hadir</span>
        <span><b class="lg lg-s">S</b> Sakit</span>
        <span><b class="lg lg-i">I</b> Izin</span>
        <span><b class="lg lg-x">✗</b> Alpa / Tidak masuk</span>
      </div>

      <div class="agenda-paper">
        <div class="agenda-title">PROGRAM KEGIATAN PRAKTEK KERJA LAPANGAN (PKL)</div>
        <div class="agenda-subtitle">SMK AL FATAH BANJARNEGARA</div>
        <div class="agenda-subtitle">TAHUN PELAJARAN 2026/2027</div>

        <div class="agenda-info">
          <div v-for="f in infoFields" :key="f.key" class="agenda-info-row">
            <span class="agenda-info-label">{{ f.label }}</span><span class="agenda-info-colon">:</span>
            <span class="agenda-info-value">
              <template v-if="editInfoKey === f.key">
                <input :id="'info-input-' + f.key" v-model="editInfoValue" class="info-input" type="text" @keyup.enter="saveInfo()" @blur="saveInfo()" />
              </template>
              <template v-else>
                <span class="info-text" :class="{ 'info-empty': !infoValues[f.key] }" :title="(isInstansi || isGuru) ? '' : 'Klik untuk mengisi'" @click="startEditInfo(f.key)">{{ infoValues[f.key] || ((isInstansi || isGuru) ? '—' : 'klik untuk isi') }}</span>
              </template>
            </span>
          </div>
        </div>

        <div class="table-scroll">
          <table class="agenda-table absen-table">
            <thead>
              <tr>
                <th class="col-no" rowspan="2">No.</th>
                <th class="col-uraian" rowspan="2">Jenis Kegiatan</th>
                <th class="col-bulan" :colspan="jumlahHari">
                  <span>BULAN : {{ bulanList[filterBulan - 1] }}</span>
                  <span class="tgl-label">TANGGAL</span>
                </th>
              </tr>
              <tr>
                <th v-for="h in jumlahHari" :key="'h' + h" class="col-hari">{{ h }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(a, i) in agendaItems" :key="a.id">
                <td class="col-no text-center">{{ i + 1 }}</td>
                <td class="col-uraian">
                  <template v-if="editingId === a.id">
                    <input v-model="editingText" :id="'absen-input-' + a.id" class="cell-input" type="text" @input="onCellInput" @keyup.enter="saveEdit()" @blur="saveEdit()" />
                    <div class="d-flex gap-1 mt-1">
                      <button class="btn btn-primary btn-sm" :disabled="isSavingCell" @click="saveEdit()">Simpan</button>
                      <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit()">Batal</button>
                    </div>
                  </template>
                  <template v-else>
                    <span class="uraian-text" :class="{ 'info-empty': !a.uraian }" :title="(isInstansi || isGuru) ? '' : 'Klik untuk mengubah'" @click="startEdit(a)">{{ a.uraian || ((isInstansi || isGuru) ? '—' : 'klik untuk isi') }}</span>
                    <span v-if="!isInstansi && !isGuru" class="row-actions">
                      <button class="btn-action" title="Hapus baris" @click="hapusAbsen(a)"><i class="bi bi-trash-fill"></i></button>
                    </span>
                  </template>
                </td>
                <td v-for="h in jumlahHari" :key="a.id + '-' + h" class="col-hari cell-day" :class="a.marks[h] ? 'mark-' + a.marks[h] : ''" title="Klik: ✓ → S → I → ✗ → kosong" @click="toggleDay(a, h)">
                  <span v-if="a.marks[h]">{{ markSymbol(a.marks[h]) }}</span>
                </td>
              </tr>
              <template v-if="!isInstansi && !isGuru">
                <tr v-for="n in emptyRowCount" :key="'baris-kosong-' + n" class="agenda-empty-row">
                  <td class="col-no text-center">{{ agendaItems.length + n }}</td>
                  <td class="col-uraian">
                    <template v-if="editingId === 'baru-' + n">
                      <input v-model="editingText" :id="'absen-input-baru-' + n" class="cell-input" type="text" @input="onCellInput" @keyup.enter="saveEdit()" @blur="saveEdit()" />
                      <div class="d-flex gap-1 mt-1">
                        <button class="btn btn-primary btn-sm" :disabled="isSavingCell" @click="saveEdit()">Simpan</button>
                        <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit()">Batal</button>
                      </div>
                    </template>
                    <span v-else class="fill-hint" @click="startNew('baru-' + n)"><i class="bi bi-plus-lg"></i> tulis kegiatan</span>
                  </td>
                  <td v-for="h in jumlahHari" :key="'kosong-' + n + '-' + h" class="col-hari cell-day" title="Klik untuk tandai hadir di tanggal ini" @click="startDayBaru(n, h)"></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <div class="absen-footer">
          <span>Pembimbing PKL 2026/2027</span>
          <span>SMK Al Fatah Banjarnegara</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeRouteLeave } from 'vue-router'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Absen PKL — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
const { cekPengingat } = usePengingat() // segarkan notif pengingat setelah absen diisi
let siswa_id = user?.user.value.siswa
let isInstansi = user.user.value?.role === 'instansi'
let isGuru = user.user.value?.role === 'guru'
let isLoading = ref(true)

// ====== STATUS SIMPAN: tampil di layar supaya jelas datanya masuk atau gagal ======
let simpanStatus = ref({ type: 'ok', text: '' })
let statusTimer = null
function setStatus(type, text) {
  simpanStatus.value = { type, text }
  clearTimeout(statusTimer)
  if (type !== 'err') statusTimer = setTimeout(() => { simpanStatus.value = { type: 'ok', text: '' } }, 2500)
}
function pesanError(e) {
  return e?.response?.message || e?.message || 'terjadi kesalahan'
}

// ====== FILTER BULAN & TAHUN ======
let filterBulan = ref(new Date().getMonth() + 1)
let filterTahun = ref(new Date().getFullYear())
let bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
let tahunList = []
for (let t = 2024; t <= new Date().getFullYear() + 1; t++) tahunList.push(t)

// kolom tanggal selalu 1-31 seperti formulir kertas, apa pun bulannya
const jumlahHari = 31

let absenRows = ref([])

// data dipisah per bulan & tahun, jadi ganti bulan otomatis membuka data bulan itu
let agendaItems = computed(() => absenRows.value.filter(a => a.bulan == filterBulan.value && a.tahun == filterTahun.value))

// total baris selalu 27 seperti agenda, sisanya baris kosong
let emptyRowCount = computed(() => Math.max(0, 27 - agendaItems.value.length))

function normalisasiMarks(m) {
  return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {}
}

async function getAbsen() {
  client.autoCancellation(false)
  try {
    // instansi: hanya absen milik siswa yang dipantau (pemetaan terbaru) agar sama dengan data siswa
    let sidInstansi = (isInstansi || isGuru) ? await useSiswaDipantauAkunId() : null
    let filterAbsen = (isInstansi || isGuru) ? `user='${sidInstansi || "tidak-ada"}'` : `user="${user.user.value.id}"`
    let res = await client.collection('absen').getFullList({
      filter: filterAbsen,
      sort: '+created',
      fields: 'id,uraian,marks,bulan,tahun,created' + ((isInstansi || isGuru) ? ',user' : '')
    })
    absenRows.value = res.map(r => ({
      id: r.id,
      uraian: r.uraian || '',
      marks: normalisasiMarks(r.marks),
      bulan: Number(r.bulan),
      tahun: Number(r.tahun),
      created: r.created,
      user: r.user
    }))
    if (isInstansi || isGuru) isiInfoSiswaInstansi(res)
  } catch (e) {
    console.error('Gagal memuat absen:', e)
    setStatus('err', 'Gagal memuat data absen: ' + pesanError(e))
    absenRows.value = []
  }
}

// ====== TANDA TANGGAL: ✓ hadir → S sakit → I izin → ✗ alpa → kosong ======
const MARK_CYCLE = ['v', 's', 'i', 'x']
function markSymbol(m) {
  return { v: '✓', s: 'S', i: 'I', x: '✗' }[m] || ''
}

// ====== GEOFENCING ======
function ekstrakKoordinat(url) {
  if (!url) return ''
  let m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (!m) m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (!m) {
    try {
      const u = new URL(url)
      const q = u.searchParams.get('q') || u.searchParams.get('query')
      if (q) m = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/)
    } catch {}
  }
  return m ? `${m[1]},${m[2]}` : ''
}

function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function cekGeofencing() {
  setStatus('ok', 'Memeriksa lokasi Anda...');
  return new Promise(async (resolve) => {
    try {
      const idSaya = client.authStore?.model?.id;
      // Ambil hingga 10 record lokasi milik siswa ini — pilih yang pertama
      // dengan koordinat valid, supaya tetap berjalan walau ada record ganda
      // atau record dengan link rusak.
      const res = await client.collection('lokasi_pkl').getList(1, 10, {
        filter: `siswa="${idSaya}"`
      });
      
      if (!res.items || res.items.length === 0) {
        alert('Anda belum mengatur Lokasi PKL. Silakan atur lokasi terlebih dahulu di menu Lokasi PKL.');
        setStatus('err', 'Lokasi PKL belum diatur.');
        resolve(false);
        return;
      }
      
      let koordinatPKL = ''
      for (const rec of res.items) {
        const k = ekstrakKoordinat(rec.link_maps)
        if (k) { koordinatPKL = k; break }
      }
      if (!koordinatPKL) {
        alert('Lokasi PKL Anda tidak memiliki koordinat valid. Perbarui link Google Maps di menu Lokasi PKL (pastikan formatnya mengandung koordinat).');
        setStatus('err', 'Koordinat PKL tidak valid.');
        resolve(false);
        return;
      }

      const [latPKL, lonPKL] = koordinatPKL.split(',').map(Number);

      if (!navigator.geolocation) {
        // Geolocation hanya tersedia pada konteks aman: HTTPS atau localhost.
        alert('Geolocation tidak tersedia di browser ini. Penyebab paling umum: halaman dibuka lewat HTTP di luar localhost (mis. http://192.168.x.x:3001). Buka lewat http://localhost:3001 di komputer, atau gunakan HTTPS saat diakses dari HP/jaringan lain.');
        setStatus('err', 'Geolocation tidak tersedia (butuh HTTPS/localhost).');
        resolve(false);
        return;
      }

      // Ambil posisi GPS; jika gagal dengan akurasi tinggi, coba sekali lagi
      // dengan mode akurasi rendah (Wi-Fi/jaringan — lebih cepat & kompatibel).
      function ambilPosisi(opsi) {
        return new Promise((res2, rej2) => navigator.geolocation.getCurrentPosition(res2, rej2, opsi))
      }

      let position = null
      try {
        position = await ambilPosisi({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
      } catch (err1) {
        try {
          position = await ambilPosisi({ enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 })
        } catch (err2) {
          const kode = (err2 && err2.code) || (err1 && err1.code)
          let pesan = 'Gagal mendapatkan lokasi Anda. Pastikan Anda mengizinkan akses lokasi (GPS) pada browser/perangkat Anda.'
          if (kode === 1) pesan = 'Akses lokasi DITOLAK. Izinkan akses lokasi untuk situs ini pada browser Anda (ketuk ikon gembok di address bar).'
          else if (kode === 2) pesan = 'Lokasi tidak dapat ditentukan. Coba keluar ruangan / nyalakan GPS lalu coba lagi.'
          else if (kode === 3) pesan = 'Waktu tunggu GPS habis. Coba lagi di tempat dengan sinyal lebih baik.'
          alert(pesan)
          setStatus('err', 'Gagal akses GPS.');
          resolve(false)
          return
        }
      }

      const latUser = position.coords.latitude;
      const lonUser = position.coords.longitude;
      const akurasi = Math.round(position.coords.accuracy || 0);
      const jarak = hitungJarak(latUser, lonUser, latPKL, lonPKL);

      if (jarak > 100) {
        alert(`Anda berada di luar jangkauan lokasi PKL (Jarak: ${Math.round(jarak)} meter). Anda harus berada dalam radius 100 meter untuk absen hadir.`);
        setStatus('err', `Jarak terlalu jauh: ${Math.round(jarak)}m`);
        resolve(false);
      } else {
        setStatus('ok', `Lokasi valid (${Math.round(jarak)}m, akurasi ±${akurasi}m)`);
        resolve(true);
      }
    } catch (e) {
      alert('Terjadi kesalahan saat memverifikasi lokasi.');
      setStatus('err', 'Error verifikasi lokasi.');
      resolve(false);
    }
  });
}

async function toggleDay(a, h) {
  if (isInstansi || isGuru) return
  const marks = { ...a.marks }
  const idx = MARK_CYCLE.indexOf(marks[h])
  
  let targetMark = ''
  if (idx === -1) targetMark = 'v'
  else if (idx === MARK_CYCLE.length - 1) targetMark = null
  else targetMark = MARK_CYCLE[idx + 1]

  if (targetMark === 'v') {
    const isWithinRadius = await cekGeofencing()
    if (!isWithinRadius) return
  }

  if (targetMark === null) delete marks[h]
  else marks[h] = targetMark

  a.marks = marks // update optimis biar terasa instan
  client.autoCancellation(false)
  try {
    await client.collection('absen').update(a.id, { marks })
    setStatus('ok', 'Tanda absen tersimpan ✓')
    cekPengingat(true) // absen terisi → notif pengingat langsung diperiksa ulang
  } catch (e) {
    getAbsen() // kembalikan kondisi asli kalau gagal
    setStatus('err', 'Gagal menyimpan tanda absen: ' + pesanError(e))
    alert('Gagal menyimpan tanda absen: ' + pesanError(e))
  }
}

// klik kotak tanggal di baris kosong: buat baris absen baru lalu langsung buka editor kegiatannya
async function startDayBaru(n, h) {
  if (isInstansi || isGuru) return
  
  const isWithinRadius = await cekGeofencing()
  if (!isWithinRadius) return

  client.autoCancellation(false)
  try {
    const rec = await client.collection('absen').create({
      user: user.user.value.id,
      uraian: '',
      marks: { [h]: 'v' },
      bulan: Number(filterBulan.value),
      tahun: Number(filterTahun.value)
    })
    await getAbsen()
    cekPengingat(true) // absen terisi → notif pengingat langsung diperiksa ulang
    editingId.value = rec.id
    editingText.value = ''
    nextTick(() => {
      const el = document.getElementById('absen-input-' + rec.id)
      if (el) el.focus()
    })
  } catch (e) {
    setStatus('err', 'Gagal membuat baris absen: ' + pesanError(e))
    alert('Gagal membuat baris absen: ' + pesanError(e))
  }
}

// ====== ISI & EDIT JENIS KEGIATAN LANGSUNG DI TABEL ======
let editingId = ref(null) // id baris, atau 'baru-<n>' saat mengisi baris kosong
let editingText = ref('')
let isSavingCell = ref(false)

function startEdit(a) {
  editingId.value = a.id
  editingText.value = a.uraian
}

function startNew(key) {
  editingId.value = key
  editingText.value = ''
}

function cancelEdit() {
  clearTimeout(cellSaveTimer)
  editingId.value = null
  editingText.value = ''
}

// autosave: tersimpan otomatis 1 detik setelah berhenti mengetik
let cellSaveTimer = null
function onCellInput() {
  if (!editingId.value || isSavingCell.value) return
  clearTimeout(cellSaveTimer)
  cellSaveTimer = setTimeout(() => saveCell(true), 1000)
}

async function saveCell(keepOpen = false) {
  if (isInstansi || isGuru) return
  let teks = editingText.value.trim()
  if (!teks) {
    if (!keepOpen) cancelEdit()
    return
  }
  isSavingCell.value = true
  client.autoCancellation(false)
  try {
    if (String(editingId.value).startsWith('baru-')) {
      // baris absen baru langsung dari baris kosong, ikut bulan/tahun terpilih
      const rec = await client.collection('absen').create({
        user: user.user.value.id,
        uraian: teks,
        marks: {},
        bulan: Number(filterBulan.value),
        tahun: Number(filterTahun.value)
      })
      editingId.value = rec.id
      await getAbsen()
    } else {
      await client.collection('absen').update(editingId.value, { uraian: teks })
      await getAbsen()
    }
  } catch (e) {
    isSavingCell.value = false
    // editan dibiarkan terbuka supaya bisa dicoba lagi
    setStatus('err', 'Gagal menyimpan jenis kegiatan: ' + pesanError(e))
    alert('Gagal menyimpan jenis kegiatan: ' + pesanError(e))
    return
  }
  isSavingCell.value = false
  setStatus('ok', 'Jenis kegiatan tersimpan ✓')
  if (keepOpen) {
    // kembalikan fokus ke input karena baris pindah posisi setelah tersimpan
    nextTick(() => {
      const el = document.getElementById('absen-input-' + editingId.value)
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
    })
  } else {
    cancelEdit()
  }
}

async function saveEdit() {
  clearTimeout(cellSaveTimer)
  await saveCell(false)
}

async function hapusAbsen(a) {
  if (isInstansi || isGuru) return
  if (!confirm('Hapus baris absen ini?')) return
  client.autoCancellation(false)
  try {
    await client.collection('absen').delete(a.id)
    await getAbsen()
  } catch (e) {
    setStatus('err', 'Gagal menghapus baris: ' + pesanError(e))
    alert('Gagal menghapus baris: ' + pesanError(e))
  }
}

// kirim kegiatan yang sedang diedit saat halaman mau ditinggal (tutup tab / refresh / pindah halaman)
function flushCellOnExit() {
  if (!editingId.value) return
  const teks = (editingText.value || '').trim()
  if (!teks) return
  const isBaru = String(editingId.value).startsWith('baru-')
  const url = `${client.baseUrl}/api/collections/absen/records${isBaru ? '' : '/' + editingId.value}`
  const payload = isBaru
    ? { user: user.user.value.id, uraian: teks, marks: {}, bulan: Number(filterBulan.value), tahun: Number(filterTahun.value) }
    : { uraian: teks }
  try {
    fetch(url, {
      method: isBaru ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: client.authStore.token },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {})
  } catch (e) {}
}

// ====== INFO HEADER (klik untuk mengisi, tersimpan per user) ======
let infoFields = [
  { key: 'nama', label: 'Nama Siswa' },
  { key: 'nis', label: 'NIS' }
]
let infoNama = ref('')
let infoNis = ref('')
let infoValues = computed(() => ({ nama: infoNama.value, nis: infoNis.value }))
let infoSetter = { nama: v => infoNama.value = v, nis: v => infoNis.value = v }
let editInfoKey = ref(null)
let editInfoValue = ref('')
let agendaInfoId = ref(null)

function startEditInfo(key) {
  if (isInstansi || isGuru) return
  editInfoKey.value = key
  editInfoValue.value = infoValues.value[key] || ''
  nextTick(() => document.getElementById('info-input-' + key)?.focus())
}

async function persistInfo(key, val) {
  if (isInstansi || isGuru) return
  client.autoCancellation(false)
  try {
    if (agendaInfoId.value) {
      await client.collection('agenda_info').update(agendaInfoId.value, { [key]: val })
    } else {
      let rec = await client.collection('agenda_info').create({ user: user.user.value.id, [key]: val })
      agendaInfoId.value = rec?.id
    }
  } catch (e) {
    setStatus('err', 'Gagal menyimpan info header: ' + pesanError(e))
  }
}

// otomatis tersimpan saat mengetik (debounce 800ms), tanpa perlu klik keluar
let infoSaveTimer = null
watch(editInfoValue, () => {
  if (!editInfoKey.value) return
  clearTimeout(infoSaveTimer)
  infoSaveTimer = setTimeout(() => {
    if (!editInfoKey.value) return
    const key = editInfoKey.value
    const val = (editInfoValue.value || '').trim()
    if (val === (infoValues.value[key] || '')) return
    infoSetter[key](val)
    persistInfo(key, val)
  }, 800)
})

async function saveInfo() {
  if (!editInfoKey.value) return
  clearTimeout(infoSaveTimer)
  const key = editInfoKey.value
  const val = (editInfoValue.value || '').trim()
  editInfoKey.value = null
  if (val === (infoValues.value[key] || '')) return
  infoSetter[key](val)
  persistInfo(key, val)
}

// kirim data yang sedang diedit saat halaman mau ditinggal (tutup tab / refresh)
function flushInfoOnExit() {
  if (!editInfoKey.value) return
  const key = editInfoKey.value
  const val = (editInfoValue.value || '').trim()
  if (val === (infoValues.value[key] || '')) return
  const isUpdate = !!agendaInfoId.value
  const url = `${client.baseUrl}/api/collections/agenda_info/records${isUpdate ? '/' + agendaInfoId.value : ''}`
  const payload = isUpdate ? { [key]: val } : { user: user.user.value.id, [key]: val }
  try {
    fetch(url, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: client.authStore.token },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {})
  } catch (e) {}
}

onBeforeRouteLeave(() => {
  clearTimeout(infoSaveTimer)
  saveInfo()
  flushCellOnExit()
})

onMounted(() => {
  window.addEventListener('beforeunload', () => {
    flushInfoOnExit()
    flushCellOnExit()
  })
  getAbsen()
  getAgendaInfo()
  getInfoSeed()
  isLoading.value = false
})

async function getAgendaInfo() {
  if (isInstansi || isGuru) return
  client.autoCancellation(false)
  try {
    let rec = await client.collection('agenda_info').getFirstListItem(`user="${user.user.value.id}"`)
    agendaInfoId.value = rec.id
    for (let k of ['nama', 'nis']) {
      if (rec[k]) infoSetter[k](rec[k])
    }
  } catch (e) {}
}

// tampilan instansi: isi info header dari data siswa pemilik absen (read-only)
async function isiInfoSiswaInstansi() {
  try {
    let uid = await useSiswaDipantauAkunId()
    if (!uid) return
    let rec = await client.collection('agenda_info').getFirstListItem(`user="${uid}"`)
    for (let k of ['nama', 'nis']) {
      if (rec[k]) infoSetter[k](rec[k])
    }
  } catch (e) {}
}

// isi awal nama & nis dari data siswa (tidak menimpa isian manual)
async function getInfoSeed() {
  if (isInstansi || isGuru) return
  try {
    let res = await client.collection('siswa').getOne(siswa_id)
    if (!infoNama.value) infoNama.value = res?.nama || ''
    if (!infoNis.value) infoNis.value = res?.nis || ''
  } catch (e) {}
}
</script>

<style scoped>
/* ====== ABSEN PKL ====== */
.agenda-filter {
  min-width: 140px;
}

.agenda-hint {
  font-size: 0.82rem;
}

.versi-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  font-size: 0.72rem;
  font-weight: 700;
}

.simpan-status {
  margin-bottom: 10px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 600;
}

.simpan-ok {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: #4ade80;
}

.simpan-err {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
}

.absen-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.82rem;
  color: #cbd5e1;
}

.absen-legend .lg {
  display: inline-block;
  width: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.lg-v { color: #4ade80; }
.lg-s { color: #fbbf24; }
.lg-i { color: #60a5fa; }
.lg-x { color: #f87171; }

.agenda-paper {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(96, 165, 250, 0.35);
  border-radius: 12px;
  /* fluid: di HP padding mengecil otomatis sehingga kertas melebar penuh */
  padding: clamp(14px, 3.5vw, 28px) clamp(12px, 3.5vw, 22px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.agenda-title {
  text-align: center;
  font-weight: 800;
  letter-spacing: 0.8px;
  /* fluid: mengecil otomatis di layar kecil agar judul tidak patah banyak baris */
  font-size: clamp(0.95rem, 0.8rem + 0.8vw, 1.25rem);
  color: #111827;
  text-transform: uppercase;
}

.agenda-subtitle {
  text-align: center;
  font-weight: 700;
  font-size: 0.98rem;
  color: #111827;
  text-transform: uppercase;
}

.agenda-info {
  margin: 22px 0 18px;
  font-size: 1.02rem;
  max-width: 640px;
}

.agenda-info-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.agenda-info-label {
  /* fluid: di HP label menyusut agar kolom isi (nilai) tidak sempit */
  flex: 0 0 clamp(105px, 36%, 175px);
  max-width: none;
  font-weight: 600;
  color: #111827;
}

.agenda-info-colon {
  padding: 0 6px;
}

.agenda-info-value {
  flex: 1;
  min-height: 1.3em;
  border-bottom: 1px dotted #6b7280;
  padding: 0 6px 2px;
  font-weight: 700;
  color: #111827;
  overflow-wrap: anywhere;
}

.table-scroll {
  overflow-x: auto;
}

.agenda-table {
  width: 100%;
  /* jangan dipadatkan di layar kecil: biarkan melebar lalu digeser horizontal */
  min-width: 640px;
  border-collapse: collapse;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  font-size: 1.02rem;
  line-height: 1.6;
  background: #ffffff;
  color: #1f2937;
}

.absen-table th,
.absen-table td {
  border: 1px solid #374151;
  padding: 5px 6px;
  vertical-align: middle;
}

.absen-table th {
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111827;
}

/* header tabel harus tetap terang agar terbaca di atas kertas putih
   (menimpa `table th` gelap dari theme.css global) */
.absen-table thead th {
  background-color: #e5e7eb !important;
  color: #111827 !important;
  border-color: #111827;
}

.col-bulan {
  text-align: left;
  white-space: nowrap;
}

.col-bulan .tgl-label {
  float: right;
}

.absen-table .col-no {
  width: 40px;
  text-align: center;
}

.absen-table .col-uraian {
  width: 230px;
  min-width: 210px;
}

.absen-table .col-hari {
  width: 30px;
  min-width: 30px;
  white-space: nowrap;
  text-align: center;
  padding: 5px 1px !important;
}

.cell-day {
  cursor: pointer;
  font-weight: 700;
  color: #111827;
  user-select: none;
}

.cell-day:hover {
  background: rgba(59, 130, 246, 0.12);
}

/* warna tanda absen */
.cell-day.mark-v { color: #15803d; }
.cell-day.mark-s { color: #b45309; }
.cell-day.mark-i { color: #1d4ed8; }
.cell-day.mark-x { color: #b91c1c; }

.agenda-empty-row td {
  height: 36px;
}

.fill-hint {
  color: #9ca3af;
  font-style: italic;
  cursor: pointer;
  user-select: none;
}

.fill-hint:hover {
  color: #374151;
}

.uraian-text {
  cursor: pointer;
  border-radius: 2px;
}

.uraian-text:hover {
  background: rgba(59, 130, 246, 0.1);
}

.info-empty {
  color: #9ca3af;
  font-style: italic;
  font-weight: 400;
}

.info-text {
  cursor: pointer;
  border-radius: 2px;
}

.info-text:hover {
  background: rgba(59, 130, 246, 0.1);
}

.info-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #3b82f6;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  padding: 0 2px;
}

.cell-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid #3b82f6;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.98rem;
  color: #111827;
  padding: 0 2px;
}

.row-actions {
  float: right;
  display: inline-flex;
  gap: 2px;
}

.btn-action {
  border: none;
  background: transparent;
  color: #9ca3af;
  padding: 0 4px;
  font-size: 0.78rem;
  line-height: 1;
}

.btn-action:hover {
  color: #111827;
}

.absen-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}
</style>
