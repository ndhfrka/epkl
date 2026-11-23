<template>
  <div class="validasi-wrapper pb-5">
    <!-- Header Halaman -->
    <div class="card modern-card shadow-lg mb-4">
      <div class="card-header modern-card__header">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <div class="header-icon flex-shrink-0">
              <i class="bi bi-clipboard-check-fill text-warning"></i>
            </div>
            <div class="min-w-0">
              <h1 class="header-title mb-0 text-truncate">Validasi Jurnal PKL</h1>
              <p class="header-subtitle mb-0 text-truncate">
                Khusus Guru Pembimbing Jurusan (PPLG, TKR, AKL)
              </p>
            </div>
          </div>

          <!-- Indikator Waktu Server Resmi -->
          <div class="server-time-badge d-flex align-items-center gap-2 py-1 px-3 rounded-pill">
            <i class="bi bi-shield-lock-fill text-info"></i>
            <span class="small text-secondary">Waktu Server:</span>
            <span class="badge bg-primary text-white rounded-pill">{{ serverTimeDisplay || 'Memuat...' }}</span>
          </div>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <!-- Ringkasan Statistik -->
        <div class="row g-2 g-md-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="stat-box stat-box--pending p-3 rounded-3 text-center">
              <div class="stat-number stat-num stat-num--pending fw-bold fs-3">{{ statPending }}</div>
              <div class="stat-label small text-secondary">Menunggu Validasi</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-box stat-box--valid p-3 rounded-3 text-center">
              <div class="stat-number stat-num stat-num--valid fw-bold fs-3">{{ statValid }}</div>
              <div class="stat-label small text-secondary">Sudah Tervalidasi</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-box stat-box--total p-3 rounded-3 text-center">
              <div class="stat-number stat-num stat-num--total fw-bold fs-3">{{ filteredJurnals.length }}</div>
              <div class="stat-label small text-secondary">Total Tampil</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-box stat-box--jurusan p-3 rounded-3 text-center">
              <div class="stat-number stat-number-jurusan fw-bold fs-5 pt-1 text-truncate">{{ activeJurusanNama || 'Semua Jurusan' }}</div>
              <div class="stat-label small text-secondary">Jurusan Aktif</div>
            </div>
          </div>
        </div>

        <!-- Filter Tab Jurusan (PPLG, TKR, AKL) -->
        <div class="mb-3">
          <label class="form-label-custom small text-secondary mb-2">
            <i class="bi bi-mortarboard-fill text-primary me-1"></i> Pilih Jurusan Siswa:
          </label>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="jurusan in listJurusan"
              :key="jurusan.id"
              class="btn btn-jurusan"
              :class="{
                'btn-jurusan--active': selectedJurusan === jurusan.id,
                'btn-jurusan--pplg': jurusan.nama === 'PPLG',
                'btn-jurusan--tkr': jurusan.nama === 'TKR',
                'btn-jurusan--akl': jurusan.nama === 'AKL',
              }"
              @click="setJurusan(jurusan.id)"
            >
              <i class="bi bi-tag-fill me-1"></i>
              {{ jurusan.nama }}
              <span v-if="countPerJurusan[jurusan.id]" class="badge bg-warning text-dark ms-1 rounded-pill">
                {{ countPerJurusan[jurusan.id] }}
              </span>
            </button>
            <button
              class="btn btn-jurusan"
              :class="{ 'btn-jurusan--active': selectedJurusan === 'all' }"
              @click="setJurusan('all')"
            >
              <i class="bi bi-grid-fill me-1"></i> Semua Jurusan
            </button>
          </div>
        </div>

        <!-- Filter Status & Pencarian -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <!-- Filter Status Validasi -->
          <div class="btn-group btn-group-sm rounded-pill p-1 filter-group" role="group">
            <button
              type="button"
              class="btn rounded-pill px-3 py-1"
              :class="filterStatus === 'pending' ? 'btn-warning text-dark fw-bold' : 'btn-tab'"
              @click="filterStatus = 'pending'"
            >
              <i class="bi bi-clock-history me-1"></i> Menunggu Validasi ({{ statPending }})
            </button>
            <button
              type="button"
              class="btn rounded-pill px-3 py-1"
              :class="filterStatus === 'valid' ? 'btn-success text-white fw-bold' : 'btn-tab'"
              @click="filterStatus = 'valid'"
            >
              <i class="bi bi-check-circle-fill me-1"></i> Sudah Tervalidasi ({{ statValid }})
            </button>
            <button
              type="button"
              class="btn rounded-pill px-3 py-1"
              :class="filterStatus === 'all' ? 'btn-primary text-white fw-bold' : 'btn-tab'"
              @click="filterStatus = 'all'"
            >
              Semua
            </button>
          </div>

          <!-- Aksi Massal (Validasi Semua yang pending) & Tombol Refresh -->
          <div class="d-flex align-items-center gap-2">
            <button
              v-if="filterStatus !== 'valid' && pendingInView.length > 0"
              @click="validasiSemua()"
              :disabled="isValidatingAll"
              class="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
              title="Validasi seluruh jurnal yang tampil"
            >
              <span v-if="isValidatingAll" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-check2-all"></i>
              Validasi Semua ({{ pendingInView.length }})
            </button>
            <button
              @click="loadJurnals(true)"
              :disabled="isLoading"
              class="btn btn-sm btn-outline-secondary rounded-pill px-3"
              title="Segarkan data"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin-icon': isLoading }"></i>
            </button>
          </div>
        </div>

        <!-- Input Pencarian Cepat -->
        <div class="mb-4">
          <div class="input-group input-group-sm">
            <span class="input-group-text search-addon">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control search-input"
              placeholder="Cari nama siswa, NIS, atau tempat PKL/IDUKA..."
            />
            <button v-if="searchQuery" class="btn btn-outline-secondary" @click="searchQuery = ''">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Memuat data jurnal...</span>
          </div>
          <div class="mt-2 text-secondary small">Memuat daftar jurnal siswa...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredJurnals.length === 0" class="empty-state text-center py-5 px-3 rounded-3 border border-secondary border-opacity-25">
          <div class="empty-state-icon fs-1 text-secondary mb-2">
            <i class="bi bi-journal-x"></i>
          </div>
          <h5 class="empty-title mb-1">Tidak Ada Jurnal</h5>
          <p class="text-secondary small mb-3">
            {{ filterStatus === 'pending'
              ? 'Seluruh jurnal untuk jurusan yang dipilih sudah tervalidasi atau belum ada yang diajukan.'
              : 'Tidak ditemukan jurnal yang cocok dengan filter atau pencarian Anda.' }}
          </p>
          <button v-if="filterStatus !== 'all' || selectedJurusan !== 'all'" class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="resetFilter()">
            Reset Filter
          </button>
        </div>

        <!-- Daftar Jurnal (Responsif Desktop & Mobile) -->
        <div v-else class="journal-cards-container">
          <div
            v-for="jurnal in filteredJurnals"
            :key="jurnal.id"
            class="journal-card mb-3 p-3 rounded-3"
            :class="{
              'journal-card--pending': !jurnal.isValid,
              'journal-card--valid': jurnal.isValid
            }"
          >
            <!-- TAMPILAN DESKTOP (d-none d-md-flex: Rapi, Terstruktur & Proporsional) -->
            <div class="d-none d-md-flex align-items-center gap-3">
              <!-- Kolom 1: Profil Siswa & Jurusan (210px) -->
              <div class="col-siswa flex-shrink-0" style="width: 210px;">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <div class="student-avatar text-white fw-bold">
                    {{ (jurnal.siswaNama || 'S').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="fw-bold siswa-nama text-truncate fs-6" :title="jurnal.siswaNama">{{ jurnal.siswaNama }}</div>
                    <div v-if="jurnal.siswaNis" class="text-secondary small text-truncate">NIS: {{ jurnal.siswaNis }}</div>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span
                    class="badge rounded-pill px-2 py-1"
                    :class="{
                      'bg-primary': jurnal.jurusanNama === 'PPLG',
                      'bg-danger': jurnal.jurusanNama === 'TKR',
                      'bg-success': jurnal.jurusanNama === 'AKL',
                      'bg-secondary': !['PPLG', 'TKR', 'AKL'].includes(jurnal.jurusanNama)
                    }"
                  >
                    {{ jurnal.jurusanNama }}
                  </span>
                  <span class="text-secondary small text-truncate" :title="jurnal.idukaNama">
                    <i class="bi bi-buildings text-primary me-1"></i>{{ jurnal.idukaNama || 'IDUKA' }}
                  </span>
                </div>
              </div>

              <!-- Kolom 2: Uraian Kegiatan & Waktu Server (Flex Grow) -->
              <div class="col-kegiatan flex-grow-1 min-w-0">
                <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
                  <span class="text-info small fw-semibold">
                    <i class="bi bi-calendar-check me-1"></i>{{ jurnal.tanggalAgenda || jurnal.tanggalTampil }}
                  </span>
                  <span class="badge bg-dark border border-secondary border-opacity-25 text-secondary" style="font-size: 0.72rem;">
                    <i class="bi bi-shield-check text-success me-1"></i> Waktu Server: {{ jurnal.createdFormatted }}
                  </span>
                </div>
                <div class="journal-deskripsi p-2 px-3 rounded-2">
                  <div class="pre-text">{{ jurnal.deskripsi }}</div>
                </div>
              </div>

              <!-- Kolom 3: Foto Dokumentasi (95px) -->
              <div class="col-foto flex-shrink-0 text-center" style="width: 95px;">
                <div v-if="jurnal.fotoUrl" class="foto-thumb-box mx-auto" @click="bukaZoom(jurnal)" title="Klik untuk memperbesar foto">
                  <img :src="jurnal.fotoUrl" alt="Foto kegiatan" class="foto-thumb" />
                  <div class="zoom-badge"><i class="bi bi-zoom-in"></i></div>
                </div>
                <div v-else class="no-foto-box mx-auto text-secondary small rounded">
                  <i class="bi bi-image text-muted d-block fs-5"></i>
                  <span style="font-size: 0.72rem;">Tanpa Foto</span>
                </div>
              </div>

              <!-- Kolom 4: Status Validasi & Tombol Aksi (160px) -->
              <div class="col-aksi flex-shrink-0 text-end" style="width: 160px;">
                <div class="mb-2 text-center text-md-end">
                  <span
                    v-if="jurnal.isValid"
                    class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1"
                    style="font-size: 0.75rem;"
                  >
                    <i class="bi bi-check-circle-fill me-1"></i> Tervalidasi
                  </span>
                  <span
                    v-else
                    class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2 py-1"
                    style="font-size: 0.75rem;"
                  >
                    <i class="bi bi-hourglass-split me-1"></i> Menunggu Validasi
                  </span>
                </div>
                <div>
                  <button
                    v-if="!jurnal.isValid"
                    class="btn btn-sm btn-success rounded-pill px-3 py-2 w-100 fw-bold d-inline-flex align-items-center justify-content-center gap-1 shadow-sm btn-action-val"
                    :disabled="jurnal.isUpdating"
                    @click="setValidasi(jurnal, true)"
                  >
                    <span v-if="jurnal.isUpdating" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-check-circle-fill"></i>
                    Validasi Jurnal
                  </button>
                  <button
                    v-else
                    class="btn btn-sm btn-outline-warning rounded-pill px-3 py-1 w-100 small d-inline-flex align-items-center justify-content-center gap-1"
                    :disabled="jurnal.isUpdating"
                    @click="setValidasi(jurnal, false)"
                  >
                    <span v-if="jurnal.isUpdating" class="spinner-border spinner-border-sm" role="status"></span>
                    <i v-else class="bi bi-x-circle"></i>
                    Batalkan Validasi
                  </button>
                </div>
              </div>
            </div>

            <!-- TAMPILAN MOBILE (d-flex d-md-none: Compact & Mudah Disentuh) -->
            <div class="d-flex d-md-none flex-column gap-3">
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2 min-w-0">
                  <div class="student-avatar text-white fw-bold flex-shrink-0">
                    {{ (jurnal.siswaNama || 'S').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <div class="fw-bold siswa-nama text-truncate">{{ jurnal.siswaNama }}</div>
                    <div class="text-secondary small text-truncate">
                      <i class="bi bi-buildings text-primary me-1"></i>{{ jurnal.idukaNama || 'IDUKA' }}
                    </div>
                  </div>
                </div>
                <div class="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                  <span
                    class="badge rounded-pill px-2 py-1"
                    :class="{
                      'bg-primary': jurnal.jurusanNama === 'PPLG',
                      'bg-danger': jurnal.jurusanNama === 'TKR',
                      'bg-success': jurnal.jurusanNama === 'AKL',
                      'bg-secondary': !['PPLG', 'TKR', 'AKL'].includes(jurnal.jurusanNama)
                    }"
                  >
                    {{ jurnal.jurusanNama }}
                  </span>
                  <span
                    v-if="jurnal.isValid"
                    class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2"
                    style="font-size: 0.7rem;"
                  >
                    Tervalidasi
                  </span>
                  <span
                    v-else
                    class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-2"
                    style="font-size: 0.7rem;"
                  >
                    Menunggu
                  </span>
                </div>
              </div>

              <!-- Deskripsi Kegiatan -->
              <div class="journal-deskripsi p-3 rounded-3">
                <div class="small text-secondary fw-semibold mb-1">
                  <i class="bi bi-pencil-square me-1 text-primary"></i> Uraian Kegiatan:
                </div>
                <div class="pre-text">{{ jurnal.deskripsi }}</div>
              </div>

              <!-- Metadata & Foto Mobile -->
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div class="small text-secondary" style="font-size: 0.75rem;">
                  <div><i class="bi bi-calendar-event me-1 text-info"></i>{{ jurnal.tanggalAgenda || jurnal.tanggalTampil }}</div>
                  <div><i class="bi bi-shield-check text-success me-1"></i>Server: {{ jurnal.createdFormatted }}</div>
                </div>
                <div v-if="jurnal.fotoUrl" class="foto-thumb-box" @click="bukaZoom(jurnal)" title="Lihat Foto">
                  <img :src="jurnal.fotoUrl" alt="Foto kegiatan" class="foto-thumb" />
                  <div class="zoom-badge"><i class="bi bi-zoom-in"></i></div>
                </div>
              </div>

              <!-- Tombol Aksi Mobile Full Width -->
              <div>
                <button
                  v-if="!jurnal.isValid"
                  class="btn btn-success rounded-pill px-3 py-2 w-100 fw-bold d-inline-flex align-items-center justify-content-center gap-1 shadow-sm"
                  :disabled="jurnal.isUpdating"
                  @click="setValidasi(jurnal, true)"
                >
                  <span v-if="jurnal.isUpdating" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-check-circle-fill"></i>
                  Validasi Jurnal Ini
                </button>
                <button
                  v-else
                  class="btn btn-outline-warning rounded-pill px-3 py-1 w-100 small d-inline-flex align-items-center justify-content-center gap-1"
                  :disabled="jurnal.isUpdating"
                  @click="setValidasi(jurnal, false)"
                >
                  <span v-if="jurnal.isUpdating" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-x-circle"></i>
                  Batalkan Validasi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ZOOM FOTO DOKUMENTASI -->
    <div v-if="zoomModalOpen" class="modal-zoom-overlay" @click="zoomModalOpen = false">
      <div class="modal-zoom-content" @click.stop>
        <div class="d-flex justify-content-between align-items-center mb-2 text-white">
          <div class="fw-bold fs-6 text-truncate">{{ activeZoomJurnal?.siswaNama }} — Foto Dokumentasi</div>
          <button class="btn btn-sm btn-outline-light rounded-circle" @click="zoomModalOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <img :src="activeZoomJurnal?.fotoUrl" alt="Foto kegiatan resolusi penuh" class="img-fluid rounded-3 modal-zoom-img" />
        <div class="mt-2 text-secondary small text-center">
          {{ activeZoomJurnal?.tanggalAgenda || activeZoomJurnal?.tanggalTampil }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from 'nuxt/app'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Validasi Jurnal Guru — e-PKL / SMK AL-FATAH BANJARNEGARA" })

const user = usePocketBaseUser()
const client = usePocketBaseClient()
const config = useRuntimeConfig()
const host = urlDasarPocketBase()

const role = computed(() => user.user.value?.role || '')
const isGuru = computed(() => role.value === 'guru' || role.value === 'admin')

// Guard: Siswa tidak boleh mengakses halaman ini
if (process.client && !isGuru.value) {
  navigateTo('/jurnal')
}

const { serverInfo, fetchServerTime } = useServerTime()
const serverTimeDisplay = computed(() => serverInfo.value.display || '')

// State
const isLoading = ref(true)
const isValidatingAll = ref(false)
const listJurusan = ref([])
const selectedJurusan = ref('all')
const activeJurusanNama = ref('')
const filterStatus = ref('pending') // 'pending' | 'valid' | 'all'
const searchQuery = ref('')
const allJurnals = ref([])

// Zoom modal
const zoomModalOpen = ref(false)
const activeZoomJurnal = ref(null)

function bukaZoom(jurnal) {
  activeZoomJurnal.value = jurnal
  zoomModalOpen.value = true
}

// Statistik
const statPending = computed(() => allJurnals.value.filter(j => !j.isValid && matchJurusan(j)).length)
const statValid = computed(() => allJurnals.value.filter(j => j.isValid && matchJurusan(j)).length)

const countPerJurusan = computed(() => {
  const counts = {}
  for (const pk of listJurusan.value) {
    counts[pk.id] = allJurnals.value.filter(j => !j.isValid && (j.jurusanId === pk.id)).length
  }
  return counts
})

function matchJurusan(j) {
  if (selectedJurusan.value === 'all') return true
  return j.jurusanId === selectedJurusan.value
}

const filteredJurnals = computed(() => {
  let list = allJurnals.value.filter(matchJurusan)

  if (filterStatus.value === 'pending') {
    list = list.filter(j => !j.isValid)
  } else if (filterStatus.value === 'valid') {
    list = list.filter(j => j.isValid)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(j =>
      (j.siswaNama || '').toLowerCase().includes(q) ||
      (j.siswaNis || '').toLowerCase().includes(q) ||
      (j.idukaNama || '').toLowerCase().includes(q) ||
      (j.deskripsi || '').toLowerCase().includes(q)
    )
  }

  return list
})

const pendingInView = computed(() => filteredJurnals.value.filter(j => !j.isValid))

function setJurusan(jurusanId) {
  selectedJurusan.value = jurusanId
  if (jurusanId === 'all') {
    activeJurusanNama.value = 'Semua Jurusan'
  } else {
    const found = listJurusan.value.find(j => j.id === jurusanId)
    activeJurusanNama.value = found ? found.nama : ''
  }
}

function resetFilter() {
  selectedJurusan.value = 'all'
  filterStatus.value = 'pending'
  searchQuery.value = ''
  activeJurusanNama.value = 'Semua Jurusan'
}

// Format waktu UTC ke lokal
function formatCreated(dateStr) {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta'
    }).format(date) + ' WIB'
  } catch {
    return dateStr
  }
}

async function loadJurusan() {
  try {
    const pkRecords = await client.collection('program_keahlian').getFullList({ sort: 'nama' })
    listJurusan.value = pkRecords

    // Deteksi jurusan guru login (PPLG, TKR, AKL)
    let userPk = user.user.value?.program_keahlian || []
    if (typeof userPk === 'string') {
      try { userPk = JSON.parse(userPk) } catch { userPk = [userPk] }
    }
    if (!Array.isArray(userPk)) userPk = userPk ? [userPk] : []

    // Fallback deteksi jika field kosong
    if (!userPk.length) {
      const uname = (user.user.value?.username || user.user.value?.nama || '').toUpperCase()
      for (const pk of pkRecords) {
        if (uname.includes(pk.nama.toUpperCase())) {
          userPk.push(pk.id)
          break
        }
      }
    }

    if (userPk.length > 0) {
      selectedJurusan.value = userPk[0]
      const found = pkRecords.find(p => p.id === userPk[0])
      activeJurusanNama.value = found ? found.nama : ''
    } else {
      selectedJurusan.value = 'all'
      activeJurusanNama.value = 'Semua Jurusan'
    }
  } catch (err) {
    console.error('Gagal memuat jurusan:', err)
  }
}

async function loadJurnals(refresh = false) {
  isLoading.value = true
  client.autoCancellation(false)

  try {
    if (!listJurusan.value.length || refresh) {
      await loadJurusan()
    }
    await fetchServerTime()

    // Ambil jurnal dengan expand lengkap
    const records = await client.collection('jurnal').getFullList({
      sort: '-created',
      expand: 'siswa, siswa.siswa, siswa.program_keahlian, program_keahlian, iduka, elemen'
    })

    allJurnals.value = records.map(j => {
      const siswaAcc = j.expand?.siswa
      const siswaData = siswaAcc?.expand?.siswa
      const idukaData = j.expand?.iduka
      const elemenData = j.expand?.elemen
      const pkData = j.expand?.program_keahlian || siswaAcc?.expand?.program_keahlian

      // Identifikasi ID & Nama Jurusan
      const pkId = j.program_keahlian || siswaAcc?.program_keahlian || siswaData?.program_keahlian || ''
      const pkObj = listJurusan.value.find(p => p.id === pkId)
      const jurusanNama = pkData?.nama || pkObj?.nama || 'Umum'

      // URL Foto kegiatan
      let fotoUrl = ''
      if (j.foto) {
        fotoUrl = `${host}/api/files/${j.collectionId}/${j.id}/${j.foto}`
      }

      return {
        id: j.id,
        deskripsi: j.deskripsi || '',
        tanggalAgenda: j.tanggal_agenda || '',
        tanggalTampil: formatCreated(j.created),
        createdFormatted: formatCreated(j.created),
        isValid: j.isValid === true,
        isUpdating: false,
        fotoUrl,
        siswaId: siswaAcc?.id || '',
        siswaNama: siswaData?.nama || siswaAcc?.nama || siswaAcc?.username || 'Siswa',
        siswaNis: siswaData?.nis || '',
        idukaNama: idukaData?.nama || '',
        jurusanId: pkId,
        jurusanNama,
        elemenCp: elemenData?.tujuan || elemenData?.elemen || ''
      }
    })
  } catch (err) {
    console.error('Gagal memuat daftar jurnal:', err)
  } finally {
    isLoading.value = false
  }
}

// Aksi Validasi Satu Jurnal
async function setValidasi(jurnal, status) {
  jurnal.isUpdating = true
  client.autoCancellation(false)

  try {
    const res = await client.collection('jurnal').update(jurnal.id, {
      isValid: status
    })
    if (res) {
      jurnal.isValid = status
    }
  } catch (err) {
    console.error('Gagal memperbarui validasi jurnal:', err)
    alert('Gagal mengubah status validasi: ' + (err?.response?.message || err?.message || 'Terjadi kesalahan'))
  } finally {
    jurnal.isUpdating = false
  }
}

// Aksi Validasi Semua Jurnal Terpilih
async function validasiSemua() {
  const pending = pendingInView.value
  if (!pending.length) return

  const konfirmasi = confirm(`Validasi ${pending.length} jurnal yang tampil sekaligus?`)
  if (!konfirmasi) return

  isValidatingAll.value = true
  client.autoCancellation(false)

  try {
    for (const item of pending) {
      item.isUpdating = true
      try {
        await client.collection('jurnal').update(item.id, { isValid: true })
        item.isValid = true
      } catch (e) {
        console.error('Gagal validasi item', item.id, e)
      } finally {
        item.isUpdating = false
      }
    }
  } finally {
    isValidatingAll.value = false
  }
}

onMounted(() => {
  loadJurnals()

  // Realtime subscription agar otomatis update saat siswa submit
  try {
    client.collection('jurnal').subscribe('*', () => {
      loadJurnals(false)
    })
  } catch { /* noop */ }
})

onBeforeUnmount(() => {
  try {
    client.collection('jurnal').unsubscribe('*')
  } catch { /* noop */ }
})
</script>

<style scoped>
/* ============================================================
   TEMA-AWARE (terang & gelap, desktop & mobile)
   Semua warna memakai variabel tema var(--md-sys-color-*)
   sehingga selaras dengan halaman lain di kedua mode.
   ============================================================ */

.validasi-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.modern-card {
  background: var(--md-sys-color-surface-container, #0d1424) !important;
  border: 1px solid var(--md-sys-color-outline-variant, #43474e) !important;
  border-radius: 20px !important;
}

.modern-card__header {
  background: transparent;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #43474e);
  padding: 16px 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface, #e2e8f0);
}

.header-subtitle {
  font-size: 0.82rem;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
}

.server-time-badge {
  background: var(--md-sys-color-surface-container-high, #18213a);
  border: 1px solid rgba(59, 130, 246, 0.25);
  transition: background-color 0.25s ease;
}

/* ===== KARTU STATISTIK ===== */
.stat-box {
  background: var(--md-sys-color-surface-container-high, #18213a);
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
  transition: transform 0.2s ease, background-color 0.25s ease;
}
.stat-box:hover {
  transform: translateY(-2px);
}
.stat-box--pending { border-color: rgba(234, 179, 8, 0.45); }
.stat-box--valid { border-color: rgba(34, 197, 94, 0.45); }
.stat-box--total { border-color: rgba(56, 189, 248, 0.45); }

.stat-num--pending { color: var(--md-sys-color-warning, #facc15); }
.stat-num--valid { color: var(--md-sys-color-success, #22c55e); }
.stat-num--total { color: #38bdf8; }
.stat-number-jurusan { color: var(--md-sys-color-on-surface, #e2e8f0); }

/* ===== TOMBOL PILIH JURUSAN ===== */
.btn-jurusan {
  background: var(--md-sys-color-surface-container-high, #18213a);
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}
.btn-jurusan:hover {
  color: var(--md-sys-color-on-surface, #e2e8f0);
  background: var(--md-sys-color-surface-container-highest, #232d4a);
}
.btn-jurusan--active {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
}
.btn-jurusan--pplg.btn-jurusan--active {
  background: #0284c7 !important;
  border-color: #38bdf8 !important;
}
.btn-jurusan--tkr.btn-jurusan--active {
  background: #ea580c !important;
  border-color: #f97316 !important;
}
.btn-jurusan--akl.btn-jurusan--active {
  background: #16a34a !important;
  border-color: #22c55e !important;
}

/* ===== GRUP FILTER STATUS & TAB ===== */
.filter-group {
  background: var(--md-sys-color-surface-container-high, #18213a);
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
}
.btn-tab {
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  border: 0;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.btn-tab:hover {
  color: var(--md-sys-color-on-surface, #e2e8f0);
}

/* ===== PENCARIAN ===== */
.search-addon {
  background: var(--md-sys-color-surface-container-high, #18213a) !important;
  border: 1px solid var(--md-sys-color-outline-variant, #43474e) !important;
  border-right: none !important;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2) !important;
}
.search-input {
  background: var(--md-sys-color-surface-container-high, #18213a) !important;
  border: 1px solid var(--md-sys-color-outline-variant, #43474e) !important;
  color: var(--md-sys-color-on-surface, #e2e8f0) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.search-input::placeholder {
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  opacity: 1;
}
.search-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  background: var(--md-sys-color-surface-container-high, #18213a);
  transition: background-color 0.25s ease;
}
.empty-state-icon { color: var(--md-sys-color-on-surface-variant, #c3c7d2); }
.empty-title { color: var(--md-sys-color-on-surface, #e2e8f0); }

/* ===== KARTU JURNAL ===== */
.journal-card {
  background: var(--md-sys-color-surface-container-high, #18213a);
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
  transition: all 0.2s ease;
}
.journal-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  background: var(--md-sys-color-surface-container-highest, #232d4a);
}
.journal-card--pending {
  border-left: 4px solid #eab308 !important;
}
.journal-card--valid {
  border-left: 4px solid #22c55e !important;
}

.siswa-nama {
  color: var(--md-sys-color-on-surface, #e2e8f0);
}

.student-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.journal-deskripsi {
  background: var(--md-sys-color-surface-container-lowest, #020409);
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
  transition: background-color 0.25s ease;
}

.pre-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface, #e2e8f0);
}

/* ===== THUMBNAIL FOTO ===== */
.foto-thumb-box {
  position: relative;
  width: 90px;
  height: 68px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--md-sys-color-outline-variant, #43474e);
  background: #000;
  -webkit-tap-highlight-color: transparent;
}
.foto-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}
.foto-thumb-box:hover .foto-thumb {
  transform: scale(1.08);
}
.zoom-badge {
  position: absolute;
  right: 4px;
  bottom: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.7rem;
}

.no-foto-box {
  width: 90px;
  height: 68px;
  background: var(--md-sys-color-surface-container-highest, #232d4a);
  border: 1px dashed var(--md-sys-color-outline-variant, #43474e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
}

.btn-action-val {
  height: 38px;
  font-size: 0.85rem;
  letter-spacing: 0.01em;
}

.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== MODAL ZOOM FOTO ===== */
/* Penampil foto tetap gelap di kedua tema (standar penampil gambar) */
.modal-zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: modalFadeIn 0.2s ease-out;
}
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-zoom-content {
  max-width: 90vw;
  max-height: 90vh;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  animation: modalScaleIn 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes modalScaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.modal-zoom-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

/* Hormati preferensi kurangi-gerakan */
@media (prefers-reduced-motion: reduce) {
  .stat-box, .journal-card, .foto-thumb, .modal-zoom-content, .modal-zoom-overlay,
  .btn-jurusan, .server-time-badge, .filter-group, .search-input {
    transition: none !important;
    animation: none !important;
  }
}
</style>