<template>
  <div class="tambah-jurnal-wrapper">
    <!-- BANNER BATAS WAKTU: muncul jika jam sudah ≥ 18.00 -->
    <div v-if="sudahMelampauiBatas" class="card modern-card shadow-lg">
      <div class="card-body p-4 text-center">
        <div class="mb-3">
          <i class="bi bi-clock-fill text-danger" style="font-size: 3rem;"></i>
        </div>
        <h2 class="fw-bold text-white mb-2">Waktu Pengisian Jurnal Telah Berakhir</h2>
        <p class="text-secondary mb-3">
          Jurnal PKL hanya dapat diisi hingga pukul <strong class="text-warning">18.00 WIB</strong>.<br>
          Karena kamu belum mengisi jurnal hari ini, kamu akan dicatat sebagai <strong class="text-danger">Alpha</strong>.
        </p>
        <div class="alert-batas p-3 rounded-3 mb-4 d-inline-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
          <span class="small text-white">Pastikan mengisi jurnal sebelum pukul 18.00 WIB pada hari-hari selanjutnya.</span>
        </div>
        <div>
          <NuxtLink to="/jurnal" class="btn btn-outline-secondary rounded-pill px-4">
            <i class="bi bi-arrow-left me-1"></i> Kembali ke Jurnal
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="card modern-card shadow-lg">
      <!-- Header Responsif (Judul & Tombol Kembali Rapi di Mobile & Desktop) -->
      <div class="card-header modern-card__header">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <div class="header-icon flex-shrink-0">
              <i class="bi bi-pencil-square"></i>
            </div>
            <div class="min-w-0">
              <h1 class="header-title mb-0 text-truncate">Tulis Jurnal Harian</h1>
              <p class="header-subtitle mb-0 text-truncate d-none d-sm-block">Catat kegiatan dan lampirkan foto dokumentasi PKL</p>
            </div>
          </div>
          <NuxtLink to="/jurnal" class="btn btn-sm btn-outline-secondary rounded-pill px-3 flex-shrink-0">
            <i class="bi bi-arrow-left me-1"></i> Kembali
          </NuxtLink>
        </div>
        <p class="header-subtitle mt-2 mb-0 d-block d-sm-none">Catat kegiatan dan lampirkan foto dokumentasi PKL</p>
      </div>

      <div class="card-body p-4">
        <!-- WAKTU RESMI SERVER TERKUNCI (Anti-Curang Perubahan Jam HP) -->
        <div class="server-time-card p-3 rounded-3 mb-4 d-flex align-items-center gap-3">
          <div class="server-time-icon flex-shrink-0">
            <i class="bi bi-clock-history text-info fs-4"></i>
          </div>
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
              <span class="fw-bold text-white small d-inline-flex align-items-center gap-1">
                <i class="bi bi-shield-lock-fill text-warning"></i> Waktu Server Resmi (Terkunci)
              </span>
              <span class="badge bg-primary text-white rounded-pill px-3 py-1">
                {{ serverInfo.display || 'Sinkronisasi Waktu Server...' }}
              </span>
            </div>
            <div class="small text-secondary" style="font-size: 0.78rem;">
              Tanggal dan jam jurnal ditentukan otomatis dari server resmi (WIB). Mengubah jam atau tanggal pada HP tidak akan memengaruhi data waktu jurnal.
            </div>
          </div>
        </div>
        <!-- Deskripsi Kegiatan -->
        <div class="mb-4">
          <label for="deskripsi" class="form-label-custom">
            <i class="bi bi-card-text text-primary me-1"></i> Ceritakan Kegiatanmu Hari Ini <span class="text-danger">*</span>
          </label>
          <textarea
            v-model="form.deskripsi"
            id="deskripsi"
            class="form-control modern-textarea mb-2"
            placeholder="Tuliskan kegiatan, tugas, atau pembelajaran yang kamu lakukan hari ini di tempat PKL secara jelas..."
            rows="5"
            required
          ></textarea>
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 small text-secondary mt-1">
            <span>Usahakan menjelaskan secara runut dan detail</span>
            <span class="badge bg-secondary-subtle text-secondary px-2 py-1 rounded-pill">{{ form.deskripsi.length }} karakter</span>
          </div>
        </div>

        <!-- ======================================================================== -->
        <!-- FITUR FOTO KEGIATAN: Kamera Langsung & Upload Berkas (Maks. 2MB) [WAJIB] -->
        <!-- ======================================================================== -->
        <div class="mb-4 photo-section">
          <div class="mb-2">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
              <label class="form-label-custom mb-0">
                <i class="bi bi-camera-fill text-primary me-1"></i> Foto Dokumentasi Kegiatan <span class="text-danger">*</span>
              </label>
              <div class="d-flex align-items-center gap-2">
                <span v-if="!selectedFoto" class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 small">
                  <i class="bi bi-asterisk me-1"></i> Wajib Foto
                </span>
                <span v-else class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                  <i class="bi bi-check-circle-fill me-1"></i> Terlampir
                </span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1 small">
                  Maks. 2MB
                </span>
              </div>
            </div>
            <p class="photo-hint small text-secondary mb-0">
              Ambil foto kegiatan secara langsung dengan kamera atau unggah berkas dari galeri (format JPG, PNG, atau WEBP, maks 2MB).
            </p>
          </div>

          <!-- Banner Pengingat Wajib Foto jika belum ada foto -->
          <div v-if="!selectedFoto" class="alert-photo-required p-3 rounded-3 my-3 d-flex align-items-center gap-3">
            <i class="bi bi-exclamation-circle-fill text-warning fs-4 flex-shrink-0"></i>
            <div>
              <div class="fw-bold text-white small">Foto Dokumentasi Kegiatan Wajib Diunggah</div>
              <div class="small text-secondary">
                Silakan jepret foto langsung via kamera atau unggah file foto kegiatan (maksimal 2MB) di bawah ini.
              </div>
            </div>
          </div>

          <!-- Tampilan Preview Jika Foto Sudah Dipilih/Dijepret -->
          <div v-if="fotoPreviewUrl" class="photo-preview-card p-3 rounded-3 mb-3">
            <div class="d-flex align-items-center gap-3 flex-wrap">
              <div class="preview-img-box" @click="showFullPreview = true" title="Klik untuk perbesar">
                <img :src="fotoPreviewUrl" alt="Preview Foto" class="preview-thumb" />
                <div class="preview-zoom-hint">
                  <i class="bi bi-zoom-in"></i>
                </div>
              </div>
              <div class="preview-meta flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                    <i class="bi bi-check-circle-fill me-1"></i> Foto Siap Diunggah
                  </span>
                  <span class="badge bg-secondary-subtle text-secondary rounded-pill px-2 py-1 small">
                    {{ (selectedFoto?.size ? (selectedFoto.size / 1024).toFixed(0) + ' KB' : 'Ukuran Aman') }}
                  </span>
                </div>
                <div class="fw-semibold text-white text-truncate" style="max-width: 280px">
                  {{ selectedFoto?.name || 'foto_kegiatan_pkl.jpg' }}
                </div>
                <div class="small text-secondary mt-1">
                  <i class="bi bi-shield-check text-success me-1"></i> Ukuran di bawah batas 2MB
                </div>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="konfirmasiBukaKamera">
                  <i class="bi bi-camera me-1"></i> Foto Ulang
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="hapusFoto">
                  <i class="bi bi-trash me-1"></i> Hapus
                </button>
              </div>
            </div>
          </div>

          <!-- Pilihan Tombol Input Foto (Jika Belum Ada Foto) -->
          <div v-else class="photo-action-buttons row g-2">
            <!-- Tombol 1: Kamera Langsung -->
            <div class="col-md-6 col-12">
              <button
                type="button"
                class="btn-photo-action btn-photo-action--camera"
                @click="konfirmasiBukaKamera"
              >
                <div class="action-icon action-icon--camera">
                  <i class="bi bi-camera-fill"></i>
                </div>
                <div class="text-start">
                  <div class="action-title">Foto Langsung (Kamera)</div>
                  <div class="action-desc">Jepret aktivitas PKL menggunakan kamera perangkatmu</div>
                </div>
              </button>
            </div>

            <!-- Tombol 2: Upload Galeri / File Maks. 2MB -->
            <div class="col-md-6 col-12">
              <label class="btn-photo-action btn-photo-action--gallery mb-0 w-100">
                <div class="action-icon action-icon--gallery">
                  <i class="bi bi-image-fill"></i>
                </div>
                <div class="text-start flex-grow-1">
                  <div class="action-title">Pilih dari Galeri / Berkas</div>
                  <div class="action-desc">Unggah foto dari penyimpanan perangkat (Maks. 2MB)</div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="d-none"
                  @change="handleFileUpload"
                />
              </label>
            </div>
          </div>

          <!-- Alert jika ada error validasi ukuran -->
          <div v-if="errorFotoMsg" class="alert alert-danger modern-alert d-flex align-items-center gap-2 mt-2 py-2 px-3 small">
            <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
            <div>{{ errorFotoMsg }}</div>
          </div>
        </div>

        <div class="mb-4 privacy-note small text-secondary">
          <i class="bi bi-shield-lock me-1"></i> Saya menyetujui bahwa data dan foto kegiatan ini akan dikirimkan dan diverifikasi oleh guru pembimbing jurusan terkait.
        </div>

        <!-- Tombol Aksi Submit Tunggal (Rapi & Menyeluruh di Mobile & Desktop) -->
        <div class="pt-2">
          <button
            @click="buatJurnalBaru(false)"
            :disabled="isPosting || !form.deskripsi.trim() || !selectedFoto"
            class="btn btn-primary btn-submit-modern w-100 rounded-pill py-3 px-4 shadow"
          >
            <span v-if="!isPosting" class="d-flex align-items-center justify-content-center gap-2 fw-bold fs-6">
              <i class="bi bi-send-fill"></i> Kirim Jurnal & Dokumentasi
            </span>
            <span v-else class="d-flex align-items-center justify-content-center gap-2 fw-bold">
              <span class="spinner-border spinner-border-sm"></span> Mengunggah Jurnal...
            </span>
          </button>
        </div>

        <div v-if="!selectedFoto" class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis rounded-3 p-2 px-3 mt-3 small d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0"></i>
          <span>Tombol kirim akan aktif otomatis setelah kamu melampirkan foto dokumentasi kegiatan (maks. 2MB).</span>
        </div>
      </div>
    </div>

    <!-- ======================================================================== -->
    <!-- MODAL 1: KONFIRMASI BUKA KAMERA (Tanyakan dulu pada Desktop atau Mobile) -->
    <!-- ======================================================================== -->
    <div v-if="showCameraConfirmModal" class="modal-overlay-custom" @click="showCameraConfirmModal = false">
      <div class="modal-card-custom modal-card-custom--sm" @click.stop>
        <div class="modal-card-custom__header">
          <div class="d-flex align-items-center gap-2">
            <div class="modal-icon-badge">
              <i class="bi bi-camera-fill"></i>
            </div>
            <div>
              <h3 class="modal-card-custom__title">Buka Kamera Perangkat?</h3>
              <p class="modal-card-custom__subtitle">Konfirmasi pengambilan foto kegiatan secara langsung</p>
            </div>
          </div>
          <button class="btn-close-modal-sm" @click="showCameraConfirmModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-card-custom__body">
          <div class="device-detect-box mb-3 p-3 rounded-3">
            <div class="d-flex align-items-center gap-2 mb-1">
              <i :class="isMobileDevice ? 'bi bi-phone-fill text-primary' : 'bi bi-laptop-fill text-primary'" class="fs-5"></i>
              <strong class="text-white">
                Perangkat Terdeteksi: {{ isMobileDevice ? 'Ponsel / Tablet (Mobile)' : 'Komputer / Laptop (Desktop)' }}
              </strong>
            </div>
            <p class="small text-secondary mb-0">
              {{ isMobileDevice 
                ? 'Kamera belakang ponsel akan dibuka untuk mengambil foto kegiatan PKL-mu. Izinkan akses kamera saat browser meminta izin.' 
                : 'Webcam laptop/komputer akan diaktifkan untuk mengambil gambar secara langsung. Pastikan kamera terhubung dan diizinkan.' }}
            </p>
          </div>

          <p class="small text-secondary mb-0">
            Apakah kamu ingin membuka kamera sekarang untuk memotret aktivitas PKL?
          </p>
        </div>

        <div class="modal-card-custom__footer">
          <button class="btn btn-outline-secondary rounded-pill px-4" @click="showCameraConfirmModal = false">
            Batal
          </button>
          <button class="btn btn-primary rounded-pill px-4" @click="bukaKameraStream">
            <i class="bi bi-camera-fill me-1"></i> Buka Kamera
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================================== -->
    <!-- MODAL 2: LIVE VIEWFINDER KAMERA (Jepret Foto Langsung)                   -->
    <!-- ======================================================================== -->
    <div v-if="isCameraOpen" class="modal-overlay-custom" @click="tutupKamera">
      <div class="modal-card-custom modal-card-custom--camera" @click.stop>
        <div class="modal-card-custom__header">
          <div class="d-flex align-items-center gap-2">
            <div class="modal-icon-badge">
              <i class="bi bi-camera-video-fill"></i>
            </div>
            <div>
              <h3 class="modal-card-custom__title">Kamera Dokumentasi PKL</h3>
              <p class="modal-card-custom__subtitle">Arahkan kamera ke kegiatan/pekerjaan PKL yang sedang kamu kerjakan</p>
            </div>
          </div>
          <button class="btn-close-modal-sm" @click="tutupKamera">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-card-custom__body p-0 camera-body-container">
          <!-- Live Video Stream -->
          <div v-show="!capturedImageData" class="video-container">
            <video ref="videoElement" autoplay playsinline class="camera-stream"></video>
            
            <!-- Overlay Guide Frame -->
            <div class="camera-frame-guide">
              <div class="guide-corner top-left"></div>
              <div class="guide-corner top-right"></div>
              <div class="guide-corner bottom-left"></div>
              <div class="guide-corner bottom-right"></div>
              <div class="guide-text">Dokumentasi PKL</div>
            </div>

            <!-- Pesan jika kamera loading -->
            <div v-if="cameraLoading" class="camera-loader">
              <div class="spinner-border text-primary mb-2"></div>
              <div class="text-white small">Menyiapkan stream kamera...</div>
            </div>
          </div>

          <!-- Preview Hasil Jepretan -->
          <div v-show="capturedImageData" class="captured-preview-container">
            <img :src="capturedImageData" alt="Hasil Jepretan" class="captured-img" />
          </div>

          <!-- Hidden Canvas untuk processing -->
          <canvas ref="canvasElement" class="d-none"></canvas>
        </div>

        <div class="modal-card-custom__footer camera-footer justify-content-between">
          <!-- Kontrol Saat Kamera Live -->
          <template v-if="!capturedImageData">
            <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="gantiKameraFacing" :disabled="cameraLoading">
              <i class="bi bi-arrow-repeat me-1"></i> Putar Kamera
            </button>
            <button type="button" class="btn btn-primary rounded-pill px-4 shutter-btn" @click="jepretFoto" :disabled="cameraLoading">
              <i class="bi bi-camera-fill me-1"></i> Jepret Foto
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm rounded-pill px-3" @click="tutupKamera">
              Batal
            </button>
          </template>

          <!-- Kontrol Setelah Foto Dijepret -->
          <template v-else>
            <button type="button" class="btn btn-outline-secondary rounded-pill px-3" @click="ulangiJepretan">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Foto Ulang
            </button>
            <button type="button" class="btn btn-success rounded-pill px-4" @click="gunakanHasilJepretan">
              <i class="bi bi-check-lg me-1"></i> Gunakan Foto Ini
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Full Preview Foto -->
    <div v-if="showFullPreview && fotoPreviewUrl" class="foto-full-overlay" @click="showFullPreview = false">
      <div class="foto-full-box" @click.stop>
        <img :src="fotoPreviewUrl" alt="Preview Foto Penuh" class="foto-full-img" />
        <button class="btn-close-full" @click="showFullPreview = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from 'nuxt/app'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Buat Jurnal Baru — e-PKL / SMK AL-FATAH BANJARNEGARA" })

let user = usePocketBaseUser()
let client = usePocketBaseClient()
let { tandaiAbsenOtomatis, tandaiAlphaOtomatis } = useAbsenOtomatis()
const { cekPengingat, JAM_BATAS_JURNAL } = usePengingat()

// Guru tidak boleh membuat jurnal siswa
if ((user.user.value?.role ?? '') === 'guru') navigateTo('/jurnal')

let prokel = user.user.value?.program_keahlian
let isLoading = ref(true)
let isPosting = ref(false)
let isSaved = ref(false)

// ========================================================================
//  CEK JAM SERVER — blokir pengisian setelah 18.00 WIB
// ========================================================================
const { serverInfo, fetchServerTime } = useServerTime()

// Jam server dalam angka (0-23), null saat belum di-fetch
const jamServer = computed(() => {
  if (!serverInfo.value?.jam) return null
  const parts = String(serverInfo.value.jam).split(':')
  return parseInt(parts[0], 10)
})

const sudahMelampauiBatas = computed(() => {
  if (jamServer.value === null) return false
  return jamServer.value >= JAM_BATAS_JURNAL
})

// Jika sudah melewati batas, tandai alpha secara otomatis
watch(sudahMelampauiBatas, (val) => {
  if (val) tandaiAlphaOtomatis()
}, { immediate: false })

let form = ref({
  deskripsi: "",
  siswa: user.user.value?.id,
  pembimbing: "",
  iduka: "",
  program_keahlian: prokel,
  isDraft: false
})

let havePostJournalToday = ref(false)
let today = useServerDay()

// ========================================================================
//  STATE FOTO KEGIATAN & KAMERA
// ========================================================================
let selectedFoto = ref(null)
let fotoPreviewUrl = ref('')
let errorFotoMsg = ref('')
let showFullPreview = ref(false)

// State Modal Konfirmasi & Live Kamera
let showCameraConfirmModal = ref(false)
let isCameraOpen = ref(false)
let cameraLoading = ref(false)
let videoElement = ref(null)
let canvasElement = ref(null)
let mediaStream = ref(null)
let currentFacingMode = ref('environment')
let capturedImageData = ref('')

const isMobileDevice = computed(() => {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

function konfirmasiBukaKamera() {
  errorFotoMsg.value = ''
  showCameraConfirmModal.value = true
}

async function bukaKameraStream() {
  showCameraConfirmModal.value = false
  isCameraOpen.value = true
  cameraLoading.value = true
  capturedImageData.value = ''

  try {
    const constraints = {
      video: {
        facingMode: currentFacingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Browser Anda tidak mendukung akses kamera secara langsung.')
    }

    mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    nextTick(() => {
      if (videoElement.value) {
        videoElement.value.srcObject = mediaStream.value
        videoElement.value.play()
      }
      cameraLoading.value = false
    })
  } catch (err) {
    cameraLoading.value = false
    isCameraOpen.value = false
    console.error('Gagal mengakses kamera:', err)
    errorFotoMsg.value = 'Tidak dapat mengakses kamera: ' + (err.message || 'Izin kamera ditolak.')
  }
}

function gantiKameraFacing() {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment'
  hentikanStream()
  bukaKameraStream()
}

function jepretFoto() {
  if (!videoElement.value || !canvasElement.value) return
  const video = videoElement.value
  const canvas = canvasElement.value

  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Ambil data URL untuk preview
  capturedImageData.value = canvas.toDataURL('image/jpeg', 0.88)
}

function ulangiJepretan() {
  capturedImageData.value = ''
}

function gunakanHasilJepretan() {
  if (!canvasElement.value) return
  canvasElement.value.toBlob(blob => {
    if (!blob) return
    const file = new File([blob], `kegiatan_pkl_${Date.now()}.jpg`, { type: 'image/jpeg' })

    // Validasi ukuran <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      errorFotoMsg.value = 'Ukuran foto hasil jepretan melebihi 2MB. Silakan coba kembali.'
      return
    }

    selectedFoto.value = file
    fotoPreviewUrl.value = URL.createObjectURL(file)
    errorFotoMsg.value = ''
    tutupKamera()
  }, 'image/jpeg', 0.85)
}

function hentikanStream() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
}

function tutupKamera() {
  hentikanStream()
  isCameraOpen.value = false
  capturedImageData.value = ''
}

function handleFileUpload(e) {
  errorFotoMsg.value = ''
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return

  // Validasi tipe file
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    errorFotoMsg.value = 'Format file tidak didukung! Harap pilih gambar dengan format JPG, PNG, atau WEBP.'
    return
  }

  // Validasi ukuran maksimal 2MB
  const maxBytes = 2 * 1024 * 1024
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    errorFotoMsg.value = `Ukuran foto melebihi batas maksimal 2MB (ukuran saat ini: ${sizeMb} MB). Silakan pilih foto dengan ukuran lebih kecil.`
    return
  }

  selectedFoto.value = file
  fotoPreviewUrl.value = URL.createObjectURL(file)
}

function hapusFoto() {
  selectedFoto.value = null
  fotoPreviewUrl.value = ''
  errorFotoMsg.value = ''
}

// ========================================================================
//  SUBMIT JURNAL BARU (TEXT + FOTO VIA FORMDATA)
// ========================================================================
async function buatJurnalBaru(isDraft) {
  if ((user.user.value?.role ?? '') === 'guru') return

  if (!form.value.deskripsi.trim()) {
    alert('Deskripsi kegiatan wajib diisi.')
    return
  }

  // Validasi wajib upload foto atau foto langsung
  if (!selectedFoto.value) {
    errorFotoMsg.value = 'Foto kegiatan wajib dilampirkan! Silakan ambil foto secara langsung via kamera atau unggah file foto (maksimal 2MB).'
    const photoEl = document.querySelector('.photo-section')
    if (photoEl) photoEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isPosting.value = true
  isSaved.value = false
  client.autoCancellation(false)

  // Ambil waktu server resmi secara realtime (mencegah manipulasi waktu pada HP/klien)
  const sTime = await fetchServerTime()
  const tglAgenda = sTime?.tanggal_agenda || `${new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date())}, ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`

  // Menggunakan FormData agar field teks dan berkas foto terkirim bersamaan
  const formData = new FormData()
  formData.append('deskripsi', form.value.deskripsi)
  formData.append('siswa', user.user.value.id)
  formData.append('pembimbing', form.value.pembimbing || '')
  formData.append('iduka', form.value.iduka || '')
  formData.append('program_keahlian', form.value.program_keahlian || prokel || '')
  formData.append('isDraft', isDraft)
  // Jurnal siswa baru otomatis isValid = false, baru terverifikasi/terupload setelah divalidasi guru jurusan
  formData.append('isValid', 'false')
  formData.append('tanggal_agenda', tglAgenda)

  if (selectedFoto.value) {
    formData.append('foto', selectedFoto.value)
  }

  try {
    let response = await client.collection('jurnal').create(formData)
    if (response) {
      isPosting.value = false
      isSaved.value = true
      if (!isDraft) await tandaiAbsenOtomatis(new Date(), form.value.deskripsi)
      cekPengingat(true)
      form.value.deskripsi = ""
      selectedFoto.value = null
      fotoPreviewUrl.value = ''
      alert('Jurnal berhasil disimpan dan dikirim! Status saat ini: Menunggu Validasi dari Guru Jurusan sebelum resmi terupload.')
      navigateTo('/jurnal')
    }
  } catch (error) {
    isPosting.value = false
    console.error(error)
    alert('Gagal menyimpan jurnal: ' + (error?.response?.message || error?.message || 'terjadi kesalahan'))
  }
}

async function getElemenCp() {
  isLoading.value = true
  client.autoCancellation(false)
  try {
    let res_user = await client.collection('student_users').getOne(user.user.value.id, {
      expand: "siswa, program_keahlian"
    })
    let res_pemetaan = await client.collection('pemetaan').getFullList({
      filter: "siswa='" + res_user.siswa + "'",
      expand: "iduka, siswa"
    })

    isLoading.value = false

    // Pastikan program_keahlian tercatat
    form.value.program_keahlian = res_user.program_keahlian || res_user.expand?.siswa?.program_keahlian || prokel || ''

    if (res_pemetaan.length > 0) {
      form.value.iduka = res_pemetaan[0].iduka
      form.value.pembimbing = res_user.expand?.siswa?.guru_pembimbing || ''
    }
  } catch (error) {
    isLoading.value = false
    console.error(error)
  }
}

async function isTodayPostJournal() {
  try {
    client.autoCancellation(false)
    let response = await client.collection('jurnal')
      .getFirstListItem("siswa='" + user.user.value.id + "'", {
        sort: "-created"
      })
    if (response) {
      let res = response
      const date = new Date(res.created)
      const options = { dateStyle: "long" }
      res.created = new Intl.DateTimeFormat('id-ID', options).format(date)
      if (res.created == today) {
        havePostJournalToday.value = true
      }
    }
  } catch (error) {}
}

onMounted(() => {
  fetchServerTime()
  getElemenCp()
  isTodayPostJournal()
})

onBeforeUnmount(() => {
  hentikanStream()
})
</script>

<style scoped>
.tambah-jurnal-wrapper {
  max-width: 860px;
  margin: 0 auto 3rem;
}

/* Banner batas waktu 18.00 */
.alert-batas {
  background: rgba(234, 179, 8, 0.12);
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.server-time-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.modern-card {
  background: rgba(15, 23, 42, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  overflow: hidden;
}

.modern-card__header {
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 18px 24px !important;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.header-subtitle {
  font-size: 0.82rem;
  color: #94a3b8;
}

.form-label-custom {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
}

.modern-textarea {
  background: rgba(11, 18, 33, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #f1f5f9 !important;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.modern-textarea:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
}

/* ========== PHOTO SECTION STYLING ========== */
.photo-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 18px;
}

.btn-photo-action {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
  cursor: pointer;
  transition: all 0.22s ease;
  width: 100%;
}

.btn-photo-action:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.action-icon--camera {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

.action-icon--gallery {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.action-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
}

.action-desc {
  font-size: 0.78rem;
  color: #94a3b8;
}

.photo-preview-card {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.preview-img-box {
  position: relative;
  width: 90px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.preview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-zoom-hint {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-img-box:hover .preview-zoom-hint {
  opacity: 1;
}

.modern-alert {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 10px;
  color: #fca5a5;
}

.alert-photo-required {
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  backdrop-filter: blur(8px);
}

/* ========== MODAL CUSTOM OVERLAYS ========== */
.modal-overlay-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card-custom {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9);
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScaleIn 0.22s ease-out;
}

.modal-card-custom--sm {
  max-width: 480px;
}

.modal-card-custom--camera {
  max-width: 720px;
}

@keyframes modalScaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-card-custom__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.25rem;
}

.modal-card-custom__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.modal-card-custom__subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 2px 0 0;
}

.btn-close-modal-sm {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-modal-sm:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.modal-card-custom__body {
  padding: 20px 24px;
}

.device-detect-box {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.modal-card-custom__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(11, 18, 33, 0.5);
}

/* Camera Stream Container */
.camera-body-container {
  background: #000;
  position: relative;
  min-height: 360px;
  max-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-container, .captured-preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-stream, .captured-img {
  width: 100%;
  max-height: 55vh;
  object-fit: cover;
}

.camera-frame-guide {
  position: absolute;
  inset: 20px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
}

.guide-text {
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #e2e8f0;
}

.camera-loader {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.shutter-btn {
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5);
}

/* Full Preview */
.foto-full-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.foto-full-box {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
}

.foto-full-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-close-full {
  position: absolute;
  top: -16px;
  right: -16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-submit-modern {
  font-size: 1.05rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border: none;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45) !important;
  transition: all 0.22s ease;
}

.btn-submit-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.55) !important;
}

@media (max-width: 768px) {
  .tambah-jurnal-wrapper {
    margin-bottom: 2rem;
  }
  .server-time-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.modern-card {
    border-radius: 18px !important;
  }
  .modern-card__header {
    padding: 14px 16px !important;
  }
  .card-body {
    padding: 16px !important;
  }
  .header-title {
    font-size: 1.15rem;
  }
  .header-subtitle {
    font-size: 0.75rem;
  }
  .header-icon {
    width: 36px;
    height: 36px;
    font-size: 1.05rem;
  }
  .photo-section {
    padding: 14px;
    border-radius: 14px;
  }
  .btn-photo-action {
    padding: 12px;
    gap: 10px;
    border-radius: 12px;
  }
  .action-icon {
    width: 38px;
    height: 38px;
    font-size: 1.15rem;
  }
  .action-title {
    font-size: 0.88rem;
  }
  .action-desc {
    font-size: 0.74rem;
  }
  .btn-submit-modern {
    font-size: 0.95rem;
    padding-top: 12px !important;
    padding-bottom: 12px !important;
  }
  .modal-card-custom__header {
    padding: 16px 18px 12px;
  }
  .modal-card-custom__body {
    padding: 16px 18px;
  }
  .modal-card-custom__footer {
    padding: 12px 18px;
  }
}
</style>
