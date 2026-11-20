<template>
  <!-- Hanya Akun Guru atau Admin yang dapat mengakses -->
  <div v-if="isGuru || isAdmin" class="galeri-page-wrapper">
    <!-- Header Galeri -->
    <div class="card modern-card shadow-lg mb-4">
      <div class="card-body p-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="galeri-header-icon">
              <i class="bi bi-images"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h1 class="galeri-title mb-0">Galeri Foto Kegiatan PKL</h1>
                <!-- Badge Jurusan Guru -->
                <span v-if="isGuru && currentJurusanNama" class="badge-jurusan">
                  <i class="bi bi-mortarboard-fill me-1"></i> Jurusan {{ currentJurusanNama }}
                </span>
                <span v-else-if="isAdmin" class="badge-admin">
                  <i class="bi bi-shield-lock-fill me-1"></i> Semua Jurusan (Admin)
                </span>
                <span v-else-if="isSiswa" class="badge-siswa">
                  <i class="bi bi-person-badge-fill me-1"></i> Dokumentasi Saya
                </span>
              </div>
              <p class="galeri-subtitle mb-0">
                {{ isGuru 
                  ? 'Menampilkan dokumentasi foto aktivitas praktik kerja lapangan khusus siswa jurusan ' + currentJurusanNama 
                  : (isSiswa ? 'Koleksi foto kegiatan PKL yang telah kamu upload' : 'Monitoring seluruh dokumentasi foto kegiatan PKL siswa') }}
              </p>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="fetchGaleri(true)" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise me-1" :class="{ 'spin-anim': isLoading }"></i> Segarkan
            </button>
            <NuxtLink v-if="isSiswa" to="/jurnal/tambah" class="btn btn-sm btn-primary rounded-pill px-3">
              <i class="bi bi-camera-fill me-1"></i> Unggah Foto
            </NuxtLink>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="row g-2 mt-3 pt-3 border-top border-secondary border-opacity-10">
          <!-- Search Box -->
          <div class="col-md-5 col-12">
            <div class="input-group input-group-sm">
              <span class="input-group-text search-addon"><i class="bi bi-search"></i></span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control modern-input"
                placeholder="Cari nama siswa, tempat PKL, atau aktivitas..."
              />
              <button v-if="searchQuery" class="btn btn-outline-secondary" @click="searchQuery = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <!-- Filter Jurusan (Hanya jika Admin / Multi-jurusan) -->
          <div v-if="isAdmin || (isGuru && listJurusan.length > 1 && !currentJurusanNama)" class="col-md-3 col-6">
            <select v-model="filterJurusan" class="form-select form-select-sm modern-select">
              <option value="all">Semua Jurusan</option>
              <option v-for="j in listJurusan" :key="j.id" :value="j.id">{{ j.nama }}</option>
            </select>
          </div>

          <!-- Filter Siswa -->
          <div :class="isAdmin ? 'col-md-4 col-6' : 'col-md-7 col-12'">
            <select v-model="filterSiswa" class="form-select form-select-sm modern-select">
              <option value="all">Semua Siswa ({{ filteredFotoList.length }} Foto)</option>
              <option v-for="s in listSiswaInGaleri" :key="s.id" :value="s.id">
                {{ s.nama }} ({{ s.kelas }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
      <div class="text-white fw-semibold">Memuat Galeri Foto Dokumentasi...</div>
      <div class="small text-secondary mt-1">Menyinkronkan data jurnal dan berkas foto</div>
    </div>

    <!-- Gallery Grid -->
    <div v-else-if="filteredFotoList.length > 0" class="row g-3 mb-4">
      <div
        v-for="item in filteredFotoList"
        :key="item.id"
        class="col-xl-3 col-lg-4 col-md-6 col-12"
      >
        <div class="galeri-card shadow-sm" @click="bukaLightbox(item)">
          <!-- Foto Container -->
          <div class="galeri-card__img-box">
            <img
              :src="getPhotoUrl(item)"
              :alt="item.deskripsi"
              class="galeri-card__img"
              loading="lazy"
            />
            <div class="galeri-card__overlay">
              <span class="btn-zoom"><i class="bi bi-arrows-fullscreen"></i> Perbesar</span>
            </div>
            <!-- Badge Jurusan di Atas Foto -->
            <span class="img-badge-jurusan">
              {{ item.jurusanNama || 'PKL' }}
            </span>
            <!-- Badge Tanggal -->
            <span class="img-badge-date">
              <i class="bi bi-calendar-event me-1"></i> {{ item.tanggalTampil }}
            </span>
          </div>

          <!-- Info Card Body -->
          <div class="galeri-card__body p-3">
            <!-- Siswa Profile -->
            <div class="d-flex align-items-center gap-2 mb-2">
              <div class="student-avatar-mini">
                <i class="bi bi-person-fill"></i>
              </div>
              <div class="flex-grow-1 min-w-0">
                <div class="student-name text-truncate" :title="item.siswaNama">
                  {{ item.siswaNama }}
                </div>
                <div class="student-class small text-secondary">
                  {{ item.siswaKelas || 'Siswa PKL' }}
                </div>
              </div>
            </div>

            <!-- Tempat PKL -->
            <div v-if="item.idukaNama" class="iduka-pill text-truncate mb-2" :title="item.idukaNama">
              <i class="bi bi-buildings-fill text-primary me-1"></i> {{ item.idukaNama }}
            </div>

            <!-- Deskripsi Jurnal Singkat -->
            <p class="galeri-card__desc mb-0" :title="item.deskripsi">
              {{ item.deskripsi }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card modern-card p-5 text-center">
      <div class="empty-galeri-icon mb-3">
        <i class="bi bi-camera"></i>
      </div>
      <h3 class="text-white fw-bold fs-5 mb-1">Belum Ada Foto Kegiatan</h3>
      <p class="text-secondary small mb-3" style="max-width: 480px; margin: 0 auto;">
        {{ isGuru 
          ? 'Belum ada siswa jurusan ' + (currentJurusanNama || 'ini') + ' yang mengunggah foto dokumentasi kegiatan pada jurnal mereka.' 
          : 'Belum ada foto dokumentasi yang diunggah. Foto kegiatan akan otomatis muncul di sini saat siswa melampirkan foto pada jurnal harian.' }}
      </p>
      <div v-if="isSiswa">
        <NuxtLink to="/jurnal/tambah" class="btn btn-primary rounded-pill px-4">
          <i class="bi bi-camera-fill me-1"></i> Tulis Jurnal & Unggah Foto
        </NuxtLink>
      </div>
    </div>

    <!-- ======================================================================== -->
    <!-- LIGHTBOX MODAL (PERBESAR FOTO & DETAIL JURNAL)                           -->
    <!-- ======================================================================== -->
    <div v-if="lightboxItem" class="lightbox-overlay" @click="tutupLightbox">
      <div class="lightbox-dialog" @click.stop>
        <div class="lightbox-content">
          <!-- Area Gambar Penuh -->
          <div class="lightbox-image-pane">
            <img :src="getPhotoUrl(lightboxItem)" :alt="lightboxItem.deskripsi" class="lightbox-img" />
            <button class="btn-close-lightbox" title="Tutup" @click="tutupLightbox">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Area Detail & Keterangan -->
          <div class="lightbox-info-pane p-4">
            <!-- Siswa Header -->
            <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-10">
              <div class="lightbox-avatar">
                <i class="bi bi-person-fill"></i>
              </div>
              <div>
                <h4 class="text-white fw-bold mb-0 fs-5">{{ lightboxItem.siswaNama }}</h4>
                <div class="small text-secondary">
                  <span>{{ lightboxItem.siswaKelas }}</span> &bull; 
                  <span class="text-primary fw-semibold">{{ lightboxItem.jurusanNama }}</span>
                </div>
              </div>
            </div>

            <!-- Meta Penempatan -->
            <div class="mb-3">
              <div class="small text-secondary fw-semibold mb-1"><i class="bi bi-buildings-fill text-primary me-1"></i> Lokasi Tempat PKL:</div>
              <div class="text-white fw-bold">{{ lightboxItem.idukaNama || 'Belum Diatur' }}</div>
            </div>

            <!-- Meta Tanggal -->
            <div class="mb-3">
              <div class="small text-secondary fw-semibold mb-1"><i class="bi bi-calendar3 text-primary me-1"></i> Tanggal Dokumentasi:</div>
              <div class="text-white">{{ lightboxItem.tanggalTampil }}</div>
            </div>

            <!-- Keterangan / Deskripsi Kegiatan -->
            <div class="mb-4">
              <div class="small text-secondary fw-semibold mb-1"><i class="bi bi-journal-text text-primary me-1"></i> Uraian Kegiatan Siswa:</div>
              <div class="lightbox-desc-box p-3 rounded-3 text-white-50">
                {{ lightboxItem.deskripsi }}
              </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="d-flex gap-2">
              <a
                :href="getPhotoUrl(lightboxItem)"
                target="_blank"
                download
                class="btn btn-primary rounded-pill px-3 flex-grow-1 text-center"
              >
                <i class="bi bi-download me-1"></i> Unduh Foto Asli
              </a>
              <button class="btn btn-outline-secondary rounded-pill px-3" @click="tutupLightbox">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Akses Ditolak untuk Siswa -->
  <div v-else class="container py-5 text-center text-white min-vh-100 d-flex align-items-center justify-content-center">
    <div class="card bg-dark border border-secondary border-opacity-25 p-5 mx-auto shadow-lg" style="max-width: 480px; border-radius: 1.5rem; background: rgba(15, 23, 42, 0.9) !important; backdrop-filter: blur(12px);">
      <div class="mb-3 text-warning" style="font-size: 3.5rem;">
        <i class="bi bi-shield-lock-fill"></i>
      </div>
      <h3 class="fw-bold text-white mb-2">Akses Terbatas</h3>
      <p class="text-secondary mb-4 small">
        Halaman Galeri Foto PKL hanya dapat diakses oleh akun Guru Pembimbing dan Admin. Siswa tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <div>
        <NuxtLink to="/" class="btn btn-primary rounded-pill px-4 py-2">
          <i class="bi bi-house-door-fill me-1"></i> Kembali ke Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Galeri Foto PKL — e-PKL / SMK AL-FATAH BANJARNEGARA" })

const user = usePocketBaseUser()
const client = usePocketBaseClient()

const role = user.user.value?.role || 'siswa'
const isGuru = role === 'guru'
const isAdmin = ['admin', 'jurusan', 'superadmin', 'tu', 'wakasek'].includes(role)
const isSiswa = role === 'siswa'

// Redirect otomatis jika akun siswa mencoba membuka URL langsung
if (role === 'siswa') {
  navigateTo('/')
}

let isLoading = ref(true)
let allJurnalList = ref([])
let listJurusan = ref([])
let currentJurusanNama = ref('')
let currentJurusanId = ref('')
let searchQuery = ref('')
let filterJurusan = ref('all')
let filterSiswa = ref('all')

// State Lightbox Modal
let lightboxItem = ref(null)

function getPhotoUrl(item) {
  if (!item?.id || !item?.foto) return ''
  return `${client.baseUrl}/api/files/jurnal/${item.id}/${item.foto}`
}

function bukaLightbox(item) {
  lightboxItem.value = item
}

function tutupLightbox() {
  lightboxItem.value = null
}

// Format Tanggal
function formatTanggal(item) {
  if (item.tanggal_agenda) return item.tanggal_agenda
  if (item.created) {
    const d = new Date(item.created)
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d)
  }
  return '-'
}

async function loadJurusanInfo() {
  try {
    const pkRecords = await client.collection('program_keahlian').getFullList({ sort: 'nama' })
    listJurusan.value = pkRecords

    // Jika Guru, cari jurusannya (PPLG, TKR, AKL)
    if (isGuru) {
      let userPk = user.user.value?.program_keahlian || []
      if (typeof userPk === 'string') {
        try { userPk = JSON.parse(userPk) } catch (e) { userPk = [userPk] }
      }
      if (!Array.isArray(userPk)) userPk = userPk ? [userPk] : []

      // Fallback deteksi jika field kosong: cocokkan dengan username/nama guru (e.g. Guru_PPLG -> PPLG)
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
        currentJurusanId.value = userPk[0]
        const found = pkRecords.find(p => p.id === userPk[0])
        currentJurusanNama.value = found ? found.nama : ''
        filterJurusan.value = userPk[0]
      }
    }
  } catch (err) {
    console.error('Gagal memuat jurusan:', err)
  }
}

async function fetchGaleri(refresh = false) {
  isLoading.value = true
  client.autoCancellation(false)

  try {
    await loadJurusanInfo()

    // Ambil seluruh jurnal yang memiliki foto
    const records = await client.collection('jurnal').getFullList({
      filter: 'foto != ""',
      sort: '-created',
      expand: 'siswa, siswa.siswa, iduka, program_keahlian'
    })

    const parsed = records.map(j => {
      const siswaAcc = j.expand?.siswa
      const siswaData = siswaAcc?.expand?.siswa
      const idukaData = j.expand?.iduka
      const pkData = j.expand?.program_keahlian

      // Resolusi program keahlian ID & Nama
      const pkId = j.program_keahlian || siswaAcc?.program_keahlian || siswaData?.program_keahlian || ''
      const pkObj = listJurusan.value.find(p => p.id === pkId)
      const pkNama = pkData?.nama || pkObj?.nama || (pkId ? 'Jurusan' : '')

      return {
        id: j.id,
        foto: j.foto,
        deskripsi: j.deskripsi || '',
        tanggalTampil: formatTanggal(j),
        created: j.created,
        // Siswa
        siswaId: siswaAcc?.id || '',
        siswaNama: siswaData?.nama || siswaAcc?.username || 'Siswa PKL',
        siswaKelas: siswaData?.kelas || '',
        // Jurusan
        jurusanId: pkId,
        jurusanNama: pkNama,
        // IDUKA
        idukaId: idukaData?.id || '',
        idukaNama: idukaData?.nama || '',
      }
    })

    // Filter akses privasi per jurusan untuk guru:
    // "foto yang sudah diupload oleh siswa hanya akan tampil di akun guru perjurusan semisal siswa nya pplg maka foto kegiatan siswa tersebut hanya bisa muncul pada akun guru pplg"
    if (isGuru && currentJurusanId.value) {
      allJurnalList.value = parsed.filter(item => item.jurusanId === currentJurusanId.value)
    } else if (isSiswa) {
      // Siswa hanya melihat fotonya sendiri
      allJurnalList.value = parsed.filter(item => item.siswaId === user.user.value?.id)
    } else {
      // Admin dapat melihat seluruh foto
      allJurnalList.value = parsed
    }
  } catch (err) {
    console.error('Gagal memuat galeri:', err)
    allJurnalList.value = []
  } finally {
    isLoading.value = false
  }
}

// Daftar Siswa Unik untuk Filter Dropdown
const listSiswaInGaleri = computed(() => {
  const map = new Map()
  for (const item of allJurnalList.value) {
    if (item.siswaId && !map.has(item.siswaId)) {
      map.set(item.siswaId, { id: item.siswaId, nama: item.siswaNama, kelas: item.siswaKelas })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama))
})

// Filter Dinamis Berdasarkan Pencarian & Dropdown
const filteredFotoList = computed(() => {
  return allJurnalList.value.filter(item => {
    // Filter Jurusan (jika admin)
    if (filterJurusan.value !== 'all' && item.jurusanId !== filterJurusan.value) {
      return false
    }

    // Filter Siswa
    if (filterSiswa.value !== 'all' && item.siswaId !== filterSiswa.value) {
      return false
    }

    // Filter Search Text
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchSiswa = item.siswaNama.toLowerCase().includes(q)
      const matchKelas = (item.siswaKelas || '').toLowerCase().includes(q)
      const matchIduka = (item.idukaNama || '').toLowerCase().includes(q)
      const matchDesc = (item.deskripsi || '').toLowerCase().includes(q)
      if (!matchSiswa && !matchKelas && !matchIduka && !matchDesc) return false
    }

    return true
  })
})

onMounted(() => {
  if (role === 'siswa') {
    navigateTo('/')
    return
  }
  fetchGaleri()
})
</script>

<style scoped>
.galeri-page-wrapper {
  padding-bottom: 3rem;
}

.modern-card {
  background: rgba(15, 23, 42, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

.galeri-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #6366f1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.galeri-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.galeri-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
}

.badge-jurusan {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.badge-admin {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.35);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
}

.badge-siswa {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.35);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
}

.search-addon {
  background: rgba(11, 18, 33, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-right: none !important;
  color: #94a3b8 !important;
}

.modern-input, .modern-select {
  background: rgba(11, 18, 33, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #f1f5f9 !important;
  border-radius: 10px;
}

.modern-input:focus, .modern-select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

/* ========== CARD GALERI FOTO ========== */
.galeri-card {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.galeri-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.6) !important;
}

.galeri-card__img-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #000;
  overflow: hidden;
}

.galeri-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.galeri-card:hover .galeri-card__img {
  transform: scale(1.06);
}

.galeri-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.22s ease;
}

.galeri-card:hover .galeri-card__overlay {
  opacity: 1;
}

.btn-zoom {
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.img-badge-jurusan {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(15, 23, 42, 0.85);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.35);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  backdrop-filter: blur(4px);
}

.img-badge-date {
  position: absolute;
  bottom: 8px;
  right: 10px;
  background: rgba(0, 0, 0, 0.75);
  color: #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  backdrop-filter: blur(4px);
}

.galeri-card__body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.student-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.student-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #f1f5f9;
}

.student-class {
  font-size: 0.72rem;
  color: #94a3b8;
}

.iduka-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
  max-width: 100%;
}

.galeri-card__desc {
  font-size: 0.78rem;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
}

.empty-galeri-icon {
  font-size: 3rem;
  color: #64748b;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== LIGHTBOX MODAL ========== */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(12px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-dialog {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.95);
  max-width: 950px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalScaleIn 0.22s ease-out;
}

@keyframes modalScaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.lightbox-content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  max-height: 90vh;
}

.lightbox-image-pane {
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-height: 90vh;
}

.lightbox-img {
  width: 100%;
  height: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.btn-close-lightbox {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-lightbox:hover {
  background: #ef4444;
  border-color: #ef4444;
}

.lightbox-info-pane {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 90vh;
}

.lightbox-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.lightbox-desc-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  line-height: 1.6;
  max-height: 220px;
  overflow-y: auto;
}

@media (max-width: 860px) {
  .lightbox-content {
    grid-template-columns: 1fr;
    max-height: 85vh;
    overflow-y: auto;
  }
  .lightbox-image-pane {
    max-height: 45vh;
  }
}
</style>
