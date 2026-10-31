<template>
  <div class="card">
    <div class="card-header">
      <span class="h5 fw-bold"><i class="bi bi-journals"></i> Jurnal</span>
      <span v-if="$device.isMobile">
        <span v-if="pemetaan.length > 0 && !havePostJournalToday && !isGuru" class="float-end journal-button">
          <NuxtLink to="/jurnal/tambah" class="btn btn-dark btn-sm border border-2 border-dark"><i class="bi bi-pencil-square"></i> Buat</NuxtLink>
        </span>
      </span>
    </div>
    <!-- ./card-heder -->

    <!-- TODO: create single modal Edit Jurnal save draft and kirim button call diff function and querying must be UPDATE not CREATE -->
      <div v-if="$device.isMobile" class="modal" id="edit-jurnal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-0 border border-2 border-dark shadow-lg">
            <div class="modal-header fw-bold rounded-0 border-0 border-bottom border-2 border-dark">
              <i class="bi bi-pencil-square me-2"></i> Edit Jurnal
              <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-4">
                  <label for="elemen">Tujuan Pembelajaran</label>
                  <select v-model="formEdit.elemen" id="elemen" class="form form-control form-select" required>
                    <option disabled value="" selected>&#8212; Pilih &#8212;</option>
                    <option v-for="elemen in elements" :key="elemen.id" :value="elemen.id">{{ elemen.tujuan }}</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label for="deskripsi">Ceritain Kegiatan Lu!</label>
                  <textarea v-model="formEdit.deskripsi"
                    @input="removeSingleSpaceIfEmpty" id="deskripsi" class="form form-control mb-2"
                    placeholder="Gunakan bahasa indonesia baik dan benar. Sesuaikan dengan tujuan yang dipilih, boleh ditulis paragraf atau daftar urutan. Asal jangan curhat..."
                    rows="5" required></textarea>
                  <span class="mb-3 fw-bold small">
                    <i v-if="formEdit.deskripsi.length > 124" class="bi bi-check-circle-fill text-success"></i>
                    {{ formEdit.deskripsi.length }} <span v-if="formEdit.deskripsi.length < 125" class="text-muted"> (min. 125
                      karakter)</span>
                  </span>
                </div>
                <div class="mb-4 smallest text-muted">
                  Saya udah baca dan setuju dengan <nuxt-link to="/privacy" target="_blank"
                    class="link text-muted">kebijakan privasi & syarat penggunaan</nuxt-link>.
                </div>
                <button @click="buatJurnalBaru(false, true)" :disabled="isPosting || formEdit.deskripsi.length < 125"
                  class="btn btn-dark me-2 border border-2 border-dark" data-bs-dismiss="modal">
                  <span v-if="!isPosting"><i class="bi bi-send"></i> Kirim</span>
                  <span v-else>Sedang mengirim</span>
                </button>
                <span class="link small fw-bold text-muted hand-cursor" data-bs-dismiss="modal">Tutup</span>
                <div @click="buatJurnalBaru(true, true)" v-if="formEdit.elemen" data-bs-dismiss="modal" class="float-end pt-2 smallest fw-bold hand-cursor"><i class="bi bi-save"></i> Simpan draft</div>
            </div>
          </div>
        </div>
      </div>

    <!-- card-body -->
    <div class="card-body">
      <!-- toggle tampilan & aksi ekspor -->
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <!-- Tombol Ekspor PDF yang selalu terlihat, kontras tinggi dan sangat jelas -->
          <button
            @click="eksporPdf"
            :disabled="isEksporPdf"
            class="btn btn-danger btn-sm px-3 py-2 fw-bold text-white shadow-sm d-inline-flex align-items-center gap-2 btn-ekspor-pdf"
            title="Unduh Agenda Harian PKL dalam bentuk dokumen PDF"
            aria-label="Ekspor dokumen agenda PKL ke format PDF"
          >
            <template v-if="!isEksporPdf">
              <i class="bi bi-file-earmark-pdf-fill fs-6 text-white"></i>
              <span class="fw-bold fs-6">Ekspor PDF</span>
            </template>
            <template v-else>
              <span class="spinner-border spinner-border-sm text-white" role="status" aria-hidden="true"></span>
              <span class="fw-bold">Menyiapkan PDF...</span>
            </template>
          </button>
        </div>
        <div class="btn-group btn-group-sm shadow-sm" role="group" aria-label="Tampilan">
          <button :class="viewMode == 'agenda' ? 'btn btn-dark fw-semibold' : 'btn btn-outline-secondary'" @click="viewMode = 'agenda'">
            <i class="bi bi-table"></i> Agenda
          </button>
          <button :class="viewMode == 'list' ? 'btn btn-dark fw-semibold' : 'btn btn-outline-secondary'" @click="viewMode = 'list'">
            <i class="bi bi-list-ul"></i> List
          </button>
        </div>
      </div>

      <!-- TAMPILAN AGENDA HARIAN PKL -->
      <div v-if="viewMode == 'agenda'">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div class="d-flex gap-2">
            <select v-model="filterBulan" class="form-select form-select-sm agenda-filter" aria-label="Filter bulan">
              <option value="0">Semua Bulan</option>
              <option v-for="(b, i) in bulanList" :key="i" :value="i + 1">{{ b }}</option>
            </select>
            <select v-model="filterTahun" class="form-select form-select-sm agenda-filter" aria-label="Filter tahun">
              <option v-for="t in tahunList" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <nuxt-link v-if="!isInstansi && !isGuru" to="/jurnal/tambah" class="btn btn-dark btn-sm border border-2 border-dark px-3 py-2 fw-semibold">
              <i class="bi bi-plus-lg"></i> Tambah Kegiatan
            </nuxt-link>
          </div>
        </div>

        <div class="agenda-paper">
          <div class="agenda-title">AGENDA HARIAN PRAKTEK KERJA LAPANGAN (PKL)</div>
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
                  <span class="info-text" :class="{ 'info-empty': !infoValues[f.key] }" title="Klik untuk mengisi" @click="startEditInfo(f.key)">{{ infoValues[f.key] || 'klik untuk isi' }}</span>
                </template>
              </span>
            </div>
          </div>

          <div class="table-scroll">
            <table class="agenda-table">
              <thead>
                <tr>
                  <th class="col-no">No.</th>
                  <th class="col-tgl">Hari/Tanggal</th>
                  <th>Uraian kegiatan yang dilakukan</th>
                  <th class="col-ttd">Tanda tangan Instansi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(j, i) in agendaItems" :key="j.id">
                  <td class="col-no text-center">{{ i + 1 }}</td>
                  <td class="col-tgl">
                    <template v-if="editingTglId === j.id">
                      <input :id="'tgl-input-' + j.id" v-model="editingTglText" class="form-control form-control-sm" type="text" @keyup.enter="saveTgl()" @blur="saveTgl()" />
                    </template>
                    <template v-else>
                      <span class="tgl-text" :class="{ 'info-empty': !j.tanggalAgenda }" title="Klik untuk mengisi" @click="startEditTgl(j)">{{ j.tanggalAgenda || j.tanggal }}</span>
                    </template>
                  </td>
                  <td class="pre-text">
                    <template v-if="editingId === j.id">
                      <textarea v-model="editingText" :id="'cell-input-' + j.id" class="form-control form-control-sm mb-2" rows="3" @input="onCellInput" @blur="saveEdit()"></textarea>
                      <div class="d-flex gap-1">
                        <button class="btn btn-primary btn-sm" :disabled="isSavingCell" @click="saveEdit()">Simpan</button>
                        <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit()">Batal</button>
                      </div>
                    </template>
                    <template v-else>
                      {{ j.deskripsi }}
                      <span v-if="!isInstansi && !isGuru" class="row-actions">
                        <button class="btn-action" title="Edit kegiatan" @click="startEdit(j)"><i class="bi bi-pencil-fill"></i></button>
                        <button class="btn-action" title="Hapus kegiatan" @click="hapusJurnal(j)"><i class="bi bi-trash-fill"></i></button>
                      </span>
                    </template>
                  </td>
                  <td class="col-ttd">
                    <template v-if="j.ttd?.length || ttdMap[j.id]">
                      <div class="ttd-wrap">
                        <img :src="ttdUrl(j)" class="ttd-img" alt="tanda tangan instansi" />
                        <button v-if="(j.ttd?.length && !isInstansi && !isGuru) || ttdMap[j.id]" class="btn-action" title="Hapus tanda tangan" @click="hapusTtd(j)"><i class="bi bi-x-circle-fill"></i></button>
                      </div>
                    </template>
                    <label v-else-if="!isGuru" class="fill-hint ttd-hint" title="Unggah tanda tangan instansi">
                      <i class="bi bi-upload"></i> unggah ttd
                      <input type="file" accept="image/*" class="d-none" @change="uploadTtd($event, j)" />
                    </label>
                  </td>
                </tr>
                <template v-if="!isInstansi && !isGuru">
                  <tr v-for="n in emptyRowCount" :key="'baris-kosong-' + n" class="agenda-empty-row">
                    <td class="col-no text-center">{{ agendaItems.length + n }}</td>
                    <td class="col-tgl"></td>
                    <td>
                      <template v-if="editingId === 'baru-' + n">
                        <textarea v-model="editingText" :id="'cell-input-baru-' + n" class="form-control form-control-sm mb-2" rows="3" @input="onCellInput" @blur="saveEdit()"></textarea>
                        <div class="d-flex gap-1">
                          <button class="btn btn-primary btn-sm" :disabled="isSavingCell" @click="saveEdit()">Simpan</button>
                          <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit()">Batal</button>
                        </div>
                      </template>
                      <span v-else class="fill-hint" @click="startNew('baru-' + n)"><i class="bi bi-plus-lg"></i> tulis kegiatan</span>
                    </td>
                    <td class="col-ttd"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAMPILAN LIST (LAMA) -->
      <div v-else>
      <div class="row">
        <div class="col-md-12">
          <div v-if="countDraftJournal > 0 || notValidCount > 0" class="alert alert-warning small">
            <div v-if="countDraftJournal > 0">
              <span class="fw-bold">{{ countDraftJournal }}</span> Draft
            </div>
            <div v-if="notValidCount > 0">
              <span class="fw-bold">{{ notValidCount }}</span> Jurnal belum divalidasi 
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 p-0">
              <div v-if="!isLoadingJournals" class="mx-3 text-center text-muted smallest">
                <!-- <span v-if="journals.totalItems" class="float-start">Halaman <span class="fw-bold">{{ journals.page }}</span> dari <span class="fw-bold">{{ journals.totalPages }}</span></span> -->
                <!-- <span v-if="journals.totalItems">Menampilkan {{ journals.items.length }}  dari {{ journals.totalItems }} Jurnal</span> -->
                <span v-if="journals.totalItems" class="badge border border-dark text-dark">{{ journals.totalItems }} Jurnal</span>
              </div>
              <div v-if="!isLoadingJournals" class="text-center text-muted fw-bold fs-4">
                <span v-if="journals.totalItems == 0">
                  <div class="fs-1 pt-5"><i class="bi bi-database"></i></div>
                  Belum ada jurnal
                </span>
              </div>

              <!-- Filter by elemen / tujuan pembelajaran -->
              <div class="mx-3 mt-2 sticky">
                <select @change="getJournals" v-model="opsiFilterElemen" name="elemen" class="form form-select form-sm">
                  <option value="" disabled>Filter Jurnal</option>
                  <option value="Semua">Semua</option>
                  <option value="sesuai">Sesuai Elemen</option>
                  <option value="Lain-lain">Tidak Sesuai Elemen</option>
                </select> 
              </div>

              <Loading class="py-3" v-if="isLoadingJournals" />
              <div v-else v-for="journal in journals.items" :key="journal.id"
                class="card jurnal-hover jurnal-item no-shadow">
                <div class="card-body">
                  <!-- <div class="bookmark fs-2">
                    <div v-if="journal.expand.elemen.elemen == 'Lain-lain'" class="bookmark-icon text-danger"><i class="bi bi-bookmark-fill"></i></div>
                    <div v-else class="bookmark-icon text-info"><i class="bi bi-bookmark-fill"></i></div>
                  </div> -->
                  <div class="mb-1 smallest fw-bold text-muted">
                    <span v-if="journal.expand.elemen?.elemen == 'Lain-lain'"><i
                        class="bi bi-bookmark-fill text-danger"></i> {{ journal.expand.elemen?.elemen || 'Belum ada elemen' }}</span>
                    <span v-else-if="journal.expand.elemen"><i class="bi bi-bookmark-fill text-info"></i> {{ journal.expand.elemen.elemen }}</span>
                    <span v-else><i class="bi bi-bookmark-fill text-muted"></i> Belum ada elemen</span>
                  </div>
                  <div v-if="isInstansi && journal.expand.siswa?.siswa" class="small fw-bold text-grey"><i class="bi bi-person"></i> {{ journal.expand.siswa.siswa.nama }}</div>
                  <span class="text-muted smallest"><i class="bi bi-calendar2-date"></i> {{ journal.created }}</span>
                  <article class="my-3 pre-text">
                    {{ journal.deskripsi }}
                  </article>

                  <div v-if="journal.foto?.length" class="my-3 foto-container hand-cursor" data-bs-toggle="modal"
                    :data-bs-target="`#foto-${journal.id}`">
                    <img :src="`${host}/api/files/${journal.collectionId}/${journal.id}/${journal.foto}`"
                      :alt="journal.deskripsi" class="foto" />
                  </div>
                  <div v-if="journal.isValid" class="text-muted small float-start">
                    <span class="text-danger"><i class="bi bi-heart-fill"></i></span>
                  </div>
                  <div v-else class="text-muted small float-start">
                    <span class="text-danger me-2"><i class="bi bi-heart"></i></span>
                    <span v-if="$device.isMobile && journal.isDraft && !isInstansi && !isGuru" data-bs-toggle="modal" data-bs-target="#edit-jurnal" @click="setModalEditJurnal(journal)" class="badge border border-1 border-danger text-danger smallest hand-cursor">
                      <i class="bi bi-pencil-square"></i> Edit Draft
                    </span>
                  </div>

                  <div v-if="journal.isComment" @click="getKomentarByIdJurnal(journal)" class="float-end text-muted small hand-cursor" data-bs-toggle="modal" data-bs-target="#modal-lihat-komentar">
                    <i class="bi bi-chat-left-fill"></i> Lihat komentar
                  </div>

                </div>

                <!-- MODAL FOTO PREVIEW -->
                <div v-if="journal.foto?.length" class="modal" :id="`foto-${journal.id}`" aria-hidden="true" tabindex="-1">
                  <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content rounded-0 border border-3 border-dark shadow-lg">
                      <div class="modal-header rounded-0 border-0 border-bottom border-3 border-dark fw-bold">
                        Preview
                        <button class="btn-close" data-bs-dismiss="modal" label="Close"></button>
                      </div>
                      <div class="modal-body p-0">
                        <img :src="`${host}/api/files/${journal.collectionId}/${journal.id}/${journal.foto}`"
                          :alt="journal.deskripsi" class="foto-preview" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- single modal: lihat komentar -->
              <div class="modal" id="modal-lihat-komentar">
                <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content rounded-0 border border-3 border-dark shadow-lg">
                    <div class="modal-body">
                      <loading-placeholder v-if="isLoadingKomentar" row="1" col="12" /> 
                      <div v-else>
                        <div v-if="pratinjauKomentar" class="text-muted small">{{ pratinjauKomentar.created }}</div>
                        <div v-if="pratinjauKomentar" class="my-2">
                          {{ pratinjauKomentar.komentar }}
                        </div>
                      </div>
                      <div class="text-end text-muted fw-bold mt-3 hand-cursor" data-bs-dismiss="modal">Tutup</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="row my-3 mb-2">
            <div v-if="!isLoadingJournals" class="col-md-12">
              <loading v-if="isMovingPage" /> 
              <!--<div v-else>
                <div v-if="journals || isMovingPage" class="text-muted smallest mb-2">
                  <span v-if="journals.totalItems">Halaman {{ journals.page }} dari {{ journals.totalPages }}</span>
                </div>
              </div>
              <button v-if="journals.totalItems" :disabled="isMovingPage || journals.page < 2"
                @click="pagination(journals.page - 1, false)" class="btn btn-info me-2 border border-2 border-dark">
                sebelumnya
              </button>-->
              <div class="text-center">
                <button v-if="journals.totalItems" :disabled="isMovingPage || journals.page >= journals.totalPages" @click="pagination(journals.page + 1, false)" class="btn btn-dark border border-2 border-dark">
                  muat lagi <i class="bi bi-arrow-down"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  </div>
  <M3Fab
    v-if="pemetaan.length > 0 && !havePostJournalToday && !isInstansi && !isGuru"
    to="/jurnal/tambah"
    icon="bi-journal-plus"
    label="Buat Jurnal"
    size="regular"
    variant="primary"
    position="br"
    :nav-bar-safe="true"
    :mobile-only="true"
  />
</template>

<script setup>
import { onBeforeRouteLeave } from 'vue-router'
import { eksporAgendaHarianPdf } from '~/utils/eksporPdf'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Jurnal — e-PKL / SMK AL-FATAH BANJARNEGARA." })

let config = useRuntimeConfig()
let host = config.public.apiBaseUrl + ":" + config.public.apiPort
let user = usePocketBaseUser()
let client = usePocketBaseClient()
let { tandaiAbsenOtomatis } = useAbsenOtomatis()
const { cekPengingat } = usePengingat() // segarkan notif pengingat setelah jurnal diisi
// Nilai AWAL / snapshot setup-level
let isInstansi = (user.user.value?.role ?? '') === 'instansi'
let isGuru = (user.user.value?.role ?? '') === 'guru'
let prokel = user.user.value?.program_keahlian ?? ''
let isLoading = ref(true)
let isLoadingJournals = ref(true)
let isPosting = ref(false)
let isSaved = ref(false)
let elements = ref([])
let journals = ref([])
let pemetaan = ref([])
let ttdMap = ref({})
let perPage = 30
let form = ref({
  "deskripsi": "",
  "elemen": "",
  "siswa": user.user.value.id,
  "pembimbing": "",
  "iduka": "",
  "program_keahlian": prokel,
  "isDraft": false
})
let formEdit = ref({
  "deskripsi": "",
  "elemen": "",
  "siswa": user.user.value.id,
  "pembimbing": "",
  "iduka": "",
  "program_keahlian": prokel,
})
// SYNC REACTIVE - DIJALANKAN SETELAH form & formEdit ADA (supaya tidak ReferenceError / 500)
watchEffect(() => {
  isInstansi = (user.user.value?.role ?? '') === 'instansi'
  isGuru = (user.user.value?.role ?? '') === 'guru'
  prokel = user.user.value?.program_keahlian ?? ''
  if (form.value) form.value.program_keahlian = prokel
  if (formEdit.value) formEdit.value.program_keahlian = prokel
})
let isMovingPage = ref(false)
let havePostJournalToday = ref(false)
let today = useServerDay()
let maxLenDesc = ref(50)
let notValidCount = ref(0)
let countDraftJournal = ref(0)
let isLoadingKomentar = ref(true)
let pratinjauKomentar = ref()
let opsiFilterElemen = ref('')

// ====== AGENDA HARIAN PKL ======
let viewMode = ref('agenda')
let filterBulan = ref(new Date().getMonth() + 1)
let filterTahun = ref(new Date().getFullYear())
let bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
let tahunList = []
for (let t = 2024; t <= new Date().getFullYear() + 1; t++) tahunList.push(t)
let jurnalAgenda = ref([])
let isEksporPdf = ref(false)
let infoNama = ref('')
let infoNis = ref('')
let infoIduka = ref('')
let infoAlamat = ref('')

let agendaItems = computed(() => jurnalAgenda.value.filter(j => {
  if (filterBulan.value != 0 && j._d.getMonth() + 1 != filterBulan.value) return false
  if (j._d.getFullYear() != filterTahun.value) return false
  return true
}))

// total baris selalu 27 seperti formulir agenda, sisanya baris kosong
let emptyRowCount = computed(() => Math.max(0, 27 - agendaItems.value.length))

// tanggal agenda yang diketik (format: Hari, D/M/YYYY) menentukan bulan datanya
function parseAgendaDate(s) {
  if (!s) return null
  const m = String(s).match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return isNaN(d.getTime()) ? null : d
}

async function getJurnalAgenda() {
  client.autoCancellation(false)
  try {
    // instansi: hanya agenda milik siswa yang dipantau (pemetaan terbaru) agar sama dengan data siswa
    let sidInstansi = (isInstansi || isGuru) ? await useSiswaDipantauAkunId() : null
    let res = []
    try {
      const list = await client.collection('jurnal').getList(1, 500, {
        filter: (isInstansi || isGuru) ? `siswa="${sidInstansi || "tidak-ada"}"` : `siswa="${user.user.value.id}"`,
        sort: "+created",
        fields: "id,deskripsi,created,tanggal_agenda,ttd",
        requestKey: null
      })
      res = list?.items || []
      // jika lebih dari 500, ambil halaman berikutnya
      if (list?.totalPages && list.totalPages > 1) {
        for (let p = 2; p <= Math.min(list.totalPages, 5); p++) {
          const np = await client.collection('jurnal').getList(p, 500, {
            filter: (isInstansi || isGuru) ? `siswa="${sidInstansi || "tidak-ada"}"` : `siswa="${user.user.value.id}"`,
            sort: "+created",
            fields: "id,deskripsi,created,tanggal_agenda,ttd"
          })
          if (np?.items?.length) res = res.concat(np.items)
        }
      }
    } catch (_e) {
      // fallback: getFullList DENGAN batch 500 sebagai argumen pertama, BUKAN tanpa argumen
      res = await client.collection('jurnal').getFullList(500, {
        filter: (isInstansi || isGuru) ? `siswa="${sidInstansi || "tidak-ada"}"` : `siswa="${user.user.value.id}"`,
        sort: "+created",
        fields: "id,deskripsi,created,tanggal_agenda,ttd"
      })
    }
    jurnalAgenda.value = res.map(j => {
      const d = parseAgendaDate(j.tanggal_agenda) || new Date(j.created)
      const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d)
      const tanggal = `${hari}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
      return { id: j.id, deskripsi: j.deskripsi, tanggal, tanggalAgenda: j.tanggal_agenda || '', ttd: j.ttd || '', _d: d }
    })
  } catch (e) {
    jurnalAgenda.value = []
  }
}

// ====== EKSPOR PDF (AGENDA HARIAN PKL) ======
async function eksporPdf() {
  if (!agendaItems.value || !agendaItems.value.length) {
    alert('Belum ada data kegiatan pada periode yang dipilih untuk diekspor ke PDF. Silakan pilih filter bulan lain atau tambahkan kegiatan terlebih dahulu.')
    return
  }
  isEksporPdf.value = true
  try {
    const periode = filterBulan.value != 0
      ? `${bulanList[filterBulan.value - 1]} ${filterTahun.value}`
      : `Semua Bulan ${filterTahun.value}`
    await eksporAgendaHarianPdf({
      items: agendaItems.value.map(j => ({
        tanggal: j.tanggalAgenda || j.tanggal,
        uraian: j.deskripsi,
        ttdUrl: (j.ttd?.length || ttdMap.value[j.id]) ? ttdUrl(j) : ''
      })),
      info: {
        nama: infoValues.value.nama,
        nis: infoValues.value.nis,
        iduka: infoValues.value.iduka,
        alamat: infoValues.value.alamat
      },
      periode
    })
  } catch (e) {
    console.error('[jurnal] Gagal membuat PDF:', e)
    alert('Gagal membuat PDF: ' + (e?.message || e))
  } finally {
    isEksporPdf.value = false
  }
}

// ====== ISI & EDIT LANGSUNG DI TABEL AGENDA ======
let editingId = ref(null) // id jurnal, atau 'baru-<n>' saat mengisi baris kosong
let editingText = ref('')
let isSavingCell = ref(false)

function startEdit(j) {
  if (isInstansi || isGuru) return
  editingId.value = j.id
  editingText.value = j.deskripsi
}

function startNew(key) {
  if (isInstansi || isGuru) return
  editingId.value = key
  editingText.value = ''
}

function cancelEdit() {
  clearTimeout(cellSaveTimer)
  editingId.value = null
  editingText.value = ''
}

// tanggal default untuk kegiatan baru mengikuti bulan/tahun yang sedang dipilih
function defaultTanggalAgenda() {
  const now = new Date()
  const bln = Number(filterBulan.value) > 0 ? Number(filterBulan.value) : now.getMonth() + 1
  const thn = Number(filterTahun.value) || now.getFullYear()
  const d = (bln === now.getMonth() + 1 && thn === now.getFullYear()) ? now : new Date(thn, bln - 1, 1)
  const hari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d)
  return `${hari}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
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
      // isi kegiatan baru langsung dari baris kosong agenda
      const rec = await client.collection('jurnal').create({
        siswa: user.user.value.id,
        deskripsi: teks,
        isDraft: false,
        tanggal_agenda: defaultTanggalAgenda()
      })
      // tandai ✓ otomatis di tabel absen sesuai tanggal agenda
      await tandaiAbsenOtomatis(rec.tanggal_agenda)
      if (keepOpen) {
        editingId.value = rec.id
        // kembalikan fokus ke textarea karena baris pindah posisi setelah tersimpan
        nextTick(() => {
          const el = document.getElementById('cell-input-' + rec.id)
          if (el) {
            el.focus()
            el.setSelectionRange(el.value.length, el.value.length)
          }
        })
      }
    } else {
      await client.collection('jurnal').update(editingId.value, { deskripsi: teks })
    }
    await getJurnalAgenda()
    cekPengingat(true) // jurnal terisi → notif pengingat langsung diperiksa ulang
  } catch (e) {
    alert('Gagal menyimpan kegiatan: ' + (e?.response?.message || e?.message || 'terjadi kesalahan'))
  }
  isSavingCell.value = false
  if (!keepOpen) cancelEdit()
}

async function saveEdit() {
  clearTimeout(cellSaveTimer)
  await saveCell(false)
}

async function hapusJurnal(j) {
  if (isInstansi || isGuru) return
  if (!confirm('Hapus kegiatan ini dari agenda?')) return
  client.autoCancellation(false)
  try {
    await client.collection('jurnal').delete(j.id)
    await getJurnalAgenda()
    cekPengingat(true) // jurnal dihapus → notif pengingat langsung diperiksa ulang
  } catch (e) {
    alert('Gagal menghapus kegiatan: ' + (e?.response?.message || e?.message || 'terjadi kesalahan'))
  }
}

// ====== EDIT HARI/TANGGAL DI TABEL AGENDA ======
let editingTglId = ref(null)
let editingTglText = ref('')

function startEditTgl(j) {
  if (isInstansi || isGuru) return
  editingTglId.value = j.id
  editingTglText.value = j.tanggalAgenda || ''
  nextTick(() => document.getElementById('tgl-input-' + j.id)?.focus())
}

async function saveTgl() {
  if (isInstansi || isGuru) return
  if (!editingTglId.value) return
  const id = editingTglId.value
  const val = editingTglText.value.trim()
  editingTglId.value = null
  const item = jurnalAgenda.value.find(x => x.id === id)
  if (!item || val === (item.tanggalAgenda || '')) return
  client.autoCancellation(false)
  try {
    await client.collection('jurnal').update(id, { tanggal_agenda: val })
    await getJurnalAgenda()
  } catch (e) {
    alert('Gagal menyimpan tanggal: ' + (e?.response?.message || e?.message || 'terjadi kesalahan'))
  }
}

// ====== TANDA TANGAN INSTANSI (unggah gambar) ======
// instansi menyimpan ttd di koleksi ttd_jurnal (write khusus instansi),
// siswa/guru menyimpan di field ttd pada koleksi jurnal
function ttdUrl(j) {
  let rec = ttdMap.value[j.id]
  if (rec) return `${host}/api/files/ttd_jurnal/${rec.id}/${rec.ttd}`
  return `${host}/api/files/jurnal/${j.id}/${j.ttd}`
}

async function getTtdInstansi() {
  // ⚠️ HANYA ROLE 'instansi' YANG BOLEH MENGAKSES KOLEKSI ttd_jurnal (403/400 untuk role lain).
  //    Siswa/guru menyimpan ttd di FIELD 'ttd' di record 'jurnal' sendiri (lihat ttdUrl() di bawah).
  //    Double guard: dari variable isInstansi DAN dari PocketBase authStore.model.role (source of truth).
  const authRole = (client.authStore?.model?.role ?? '').toString().toLowerCase()
  if (!isInstansi && authRole !== 'instansi') {
    ttdMap.value = {}
    return
  }

  client.autoCancellation(false)
  try {
    if (!client.authStore?.isValid || !client.authStore?.model?.id) {
      ttdMap.value = {}
      return
    }
    let res = []
    try {
      // Request sesederhana mungkin: tanpa parameter tambahan, perPage kecil DULU (100).
      // PocketBase 0.40 kadang mengembalikan 400 jika sort + perPage besar + rule digabung.
      const page1 = await client.collection('ttd_jurnal').getList(1, 100)
      res = page1?.items || []
      if (page1?.totalPages && page1.totalPages > 1) {
        for (let p = 2; p <= Math.min(page1.totalPages, 3); p++) {
          const np = await client.collection('ttd_jurnal').getList(p, 100)
          if (np?.items?.length) res = res.concat(np.items)
        }
      }
    } catch (e) {
      // TIDAK ADA fallback getFullList di sini - dapat memicu skipTotal=1 dan 400.
      res = []
    }
    // Sort di client-side saja (hindari ?sort=-created di URL yang kadang 400).
    try {
      res.sort((a, b) => {
        const ta = new Date(a.created || a.updated || 0).getTime()
        const tb = new Date(b.created || b.updated || 0).getTime()
        return tb - ta
      })
    } catch (e) {}
    let m = {}
    for (let r of res || []) {
      if (r && r.jurnal) m[r.jurnal] = r
    }
    ttdMap.value = m
    return
  } catch (e) {
    ttdMap.value = {}
    return
  }
}

async function uploadTtd(e, j) {
  if (isGuru) return
  let file = e.target.files[0]
  e.target.value = ''
  if (!file || !j) return
  client.autoCancellation(false)
  try {
    let fd = new FormData()
    if (isInstansi) {
      fd.append('jurnal', j.id)
      fd.append('ttd', file)
      let rec = ttdMap.value[j.id]
      if (rec) await client.collection('ttd_jurnal').update(rec.id, fd)
      else await client.collection('ttd_jurnal').create(fd)
      await getTtdInstansi()
    } else {
      fd.append('ttd', file)
      await client.collection('jurnal').update(j.id, fd)
      await getJurnalAgenda()
    }
  } catch (err) {}
}

async function hapusTtd(j) {
  if (isGuru) return
  client.autoCancellation(false)
  try {
    if (isInstansi) {
      let rec = ttdMap.value[j.id]
      if (rec) await client.collection('ttd_jurnal').delete(rec.id)
      await getTtdInstansi()
    } else {
      await client.collection('jurnal').update(j.id, { ttd: null })
      await getJurnalAgenda()
    }
  } catch (e) {}
}

// ====== INFO HEADER AGENDA (klik untuk mengisi) ======
let infoFields = [
  { key: 'nama', label: 'Nama Siswa' },
  { key: 'nis', label: 'NIS' },
  { key: 'iduka', label: 'Tempat PKL / Instansi' },
  { key: 'alamat', label: 'Alamat' }
]
let infoValues = computed(() => ({ nama: infoNama.value, nis: infoNis.value, iduka: infoIduka.value, alamat: infoAlamat.value }))
let infoSetter = { nama: v => infoNama.value = v, nis: v => infoNis.value = v, iduka: v => infoIduka.value = v, alamat: v => infoAlamat.value = v }
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
  } catch (e) {}
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
})

onMounted(() => window.addEventListener('beforeunload', flushInfoOnExit))
onBeforeUnmount(() => window.removeEventListener('beforeunload', flushInfoOnExit))

async function getAgendaInfo() {
  client.autoCancellation(false)
  try {
    let rec = await client.collection('agenda_info').getFirstListItem(`user="${user.user.value.id}"`)
    agendaInfoId.value = rec.id
    for (let k of ['nama', 'nis', 'iduka', 'alamat']) {
      if (rec[k]) infoSetter[k](rec[k])
    }
  } catch (e) {}
}

// tampilan instansi: isi info header dari data siswa yang dipantau (pemetaan terakhir, read-only)
async function isiInfoSiswaInstansi() {
  try {
    let uid = await useSiswaDipantauAkunId()
    if (!uid) return
    let akun = await client.collection('student_users').getOne(uid, { expand: 'siswa' })
    let s = akun?.expand?.siswa
    if (!s) return
    
    if (s.nama && !infoNama.value) infoNama.value = s.nama
    if (s.nis && !infoNis.value) infoNis.value = s.nis
    
    try {
      let rec = await client.collection('agenda_info').getFirstListItem(`user="${uid}"`)
      for (let k of ['nama', 'nis', 'iduka', 'alamat']) {
        if (rec[k]) infoSetter[k](rec[k])
      }
    } catch (e) {}
  } catch (e) {}
}

async function isTodayPostJournal() {
  if (isInstansi || isGuru) return
  try {
    client.autoCancellation(false)
    let response = await client.collection('jurnal')
      .getFirstListItem("siswa='" + user.user.value.id + "'", {
        sort: "-created"
      })
    if (response) {
      let res = response
      const date = new Date(res.created);
      const options = {
        dateStyle: "long",
      }
      res.created = new Intl.DateTimeFormat('id-ID', options).format(date)
      // memeriksa jurnal hari ini, jika belum mengirim maka tombol buat jurnal muncul
      // jika sudah maka tombol buat jurnal akan hilang :D
      if (res.created == today) {
        havePostJournalToday.value = true
      }
    }
  } catch (error) {
  }
}

// fungsi ini nerima 2 params
// isDraft untuk menyimpan draft dengan type bool
// isUpdate untuk membedakan antara Buat Baru atau Update yang berasal dari Edit Jurnal
// secara default isUpdate bernilai False, ini disesuein sama nama func-nya.
async function buatJurnalBaru(isDraft, isUpdate=false) {
  // console.log(form.value)
  isPosting.value = true
  isSaved.value = false
  client.autoCancellation(false)
  let response;
  if(isUpdate) {
    formEdit.value.isDraft = isDraft
    response = await client.collection('jurnal').update(formEdit.value.id, formEdit.value)
  } else {
    form.value.isDraft = isDraft
    response = await client.collection('jurnal').create(form.value)
    // isi baris absen otomatis: 1 kegiatan = 1 baris, ✓ di tanggal kegiatan (draft tidak)
    if (!isDraft) await tandaiAbsenOtomatis(new Date(), form.value.deskripsi)
  }
  if (response) {
    isPosting.value = false
    isSaved.value = true
    form.value.elemen = ""
    form.value.deskripsi = ""
  }
}

async function getJournals(loading = true) {
  isLoadingJournals.value = loading
  client.autoCancellation(false)

  // guru: semua jurnal; instansi: jurnal siswa dipantau; siswa: jurnal sendiri
  let base = ''
  if (isGuru || isInstansi) {
    let sidInstansi = await useSiswaDipantauAkunId()
    base = `siswa="${sidInstansi || "tidak-ada"}"`
  } else {
    base = `siswa="${user.user.value.id}"`
  }
  let filter = base
  if(opsiFilterElemen.value == 'Lain-lain') {
    filter = base ? base + ` && elemen.elemen="Lain-lain"` : `elemen.elemen="Lain-lain"`
  }
  else if(opsiFilterElemen.value == 'sesuai') {
    filter = base ? base + ` && elemen.elemen!="Lain-lain"` : `elemen.elemen!="Lain-lain"`
  }

  let res = await client.collection('jurnal').getList(1, perPage, {
    filter: filter,
    expand: "iduka, pembimbing, siswa.siswa, elemen",
    sort: "-isDraft, isValid, -created"
  })
  if (res) {
    isLoadingJournals.value = false
    journals.value = res
    notValidCount.value = 0
    // console.log(journals.value)
    // konversi waktu UTC dari server ke full date lokal indo
    for (let i = 0; i < journals.value.items.length; i++) {
      const date = new Date(journals.value.items[i].created);
      const options = {
        dateStyle: "full",
        timeStyle: "short"
      };
      journals.value.items[i].created = new Intl.DateTimeFormat('id-ID', options).format(date);

      if (!journals.value.items[i].isValid) notValidCount.value++
    }
  }
}

async function pagination(page, loading = true) {
  isLoadingJournals.value = loading
  isMovingPage.value = true
  client.autoCancellation(false)
  // guru: semua jurnal; instansi: jurnal siswa dipantau; siswa: jurnal sendiri
  let paginationFilter = ''
  if (isGuru || isInstansi) {
    let sidInstansi = await useSiswaDipantauAkunId()
    paginationFilter = `siswa='${sidInstansi || "tidak-ada"}'`
  } else {
    paginationFilter = "siswa='" + user.user.value.id + "'"
  }
  let res = await client.collection('jurnal').getList(page, perPage, {
    filter: paginationFilter,
    expand: "iduka, pembimbing, siswa.siswa, elemen",
    sort: "isValid, -created"
  })
  if (res) {
    for(let i=0; i<res.items.length; i++) {
      const date = new Date(res.items[i].created);
      const options = {
        dateStyle: "full",
        timeStyle: "short"
      };
      res.items[i].created = new Intl.DateTimeFormat('id-ID', options).format(date);
    }

    journals.value.page = res.page
    journals.value.perPage = res.perPage
    journals.value.totalItems = res.totalItems
    journals.value.totalPages = res.totalPages
    journals.value.items = journals.value.items.concat(res.items)
    isLoadingJournals.value = false
    isMovingPage.value = false
  }
}

async function getElemenCp() {
  if (isInstansi || isGuru) return
  isLoading.value = true
  client.autoCancellation(false)

  let res_elemen = []
  try {
    // getList DULU - hindari getFullList tanpa batch
    const list = await client.collection('elemen_cp').getList(1, 500, {
      filter: "program_keahlian='" + prokel + "'",
      sort: 'created'
    })
    res_elemen = list?.items || []
  } catch (_e) {
    // Fallback: getFullList DENGAN batch 500 (argumen pertama)
    try {
      res_elemen = await client.collection('elemen_cp').getFullList(500, {
        filter: "program_keahlian='" + prokel + "'",
        sort: 'created'
      })
    } catch (e) { res_elemen = [] }
  }

  let res_user = null
  try {
    res_user = await client.collection('student_users').getOne(user.user.value.id, {
      expand: "siswa"
    })
  } catch (_e) {
    res_user = null
  }

  if (res_elemen && res_user) {
    elements.value = res_elemen
    let res_pemetaan = []
    try {
      const pm = await client.collection('pemetaan').getList(1, 200, {
        filter: "siswa='" + res_user.siswa + "'",
        expand: "iduka"
      })
      res_pemetaan = pm?.items || []
    } catch (_e) {
      try {
        res_pemetaan = await client.collection('pemetaan').getFullList(200, {
          filter: "siswa='" + res_user.siswa + "'",
          expand: "iduka"
        })
      } catch (e) { res_pemetaan = [] }
    }
    if (res_pemetaan) {
      isLoading.value = false
      pemetaan.value = res_pemetaan
      // info header agenda harian (jangan menimpa isian manual dari agenda_info)
      if (!infoIduka.value) infoIduka.value = res_pemetaan[0]?.expand?.iduka?.nama || ''
      if (!infoAlamat.value) infoAlamat.value = res_pemetaan[0]?.expand?.iduka?.alamat || ''
      if (res_pemetaan.length > 0) {
        form.value.iduka = res_pemetaan[0].iduka
        form.value.pembimbing = res_pemetaan[0].expand?.iduka?.pembimbing_sekolah
      }
    }
  }
}

async function getPesertaByIdUser() {
  if (isInstansi || isGuru) return
  let res = await client.collection('student_users').getOne(user?.user.value.id, {
    expand: `siswa`
  })
  if (res) {
    // info header agenda harian (jangan menimpa isian manual dari agenda_info)
    if (!infoNama.value) infoNama.value = res.expand.siswa.nama
    if (!infoNis.value) infoNis.value = res.expand.siswa.nis
  }
}

let removeSingleSpaceIfEmpty = computed(() => {
  if (form.value.deskripsi.length < 1 || form.value.deskripsi[0] == ' ') form.value.deskripsi = ''
  if (formEdit.value.deskripsi.length < 1 || formEdit.value.deskripsi[0] == ' ') formEdit.value.deskripsi = ''
})

// copy data dari form ke formEdit agar tidak mengubah data sementara
// yang ditampilkan pada list
function setModalEditJurnal(jurnal) {
  formEdit.value = jurnal
}

async function getCountDraftJournal() {
  let filterStr = (isGuru || isInstansi)
    ? `siswa="${await useSiswaDipantauAkunId() || 'tidak-ada'}" && isDraft=true`
    : `siswa="${user.user.value.id}" && isDraft=true`
  try {
    // PAKAI getList + totalItems -> JANGAN ambil SEMUA data hanya untuk HITUNG PANJANG
    let res = await client.collection('jurnal').getList(1, 1, {
      filter: filterStr
    })
    countDraftJournal.value = res?.totalItems ?? 0
  } catch (_e) {
    // Fallback lama jika getList gagal - getFullList DENGAN batch argumen pertama
    try {
      let res = await client.collection('jurnal').getFullList(200, {
        filter: filterStr
      })
      countDraftJournal.value = (res || []).length
    } catch (e) {
      countDraftJournal.value = 0
    }
  }
}

async function getKomentarByIdJurnal(journal) {
  isLoadingKomentar.value = true
  let res = await client.collection('jurnal_komentar').getList(1,1, {
    filter: `idJurnal="${journal.id}"`
  })
  if(res) {
    pratinjauKomentar.value = res.items[0]
    await client.collection('jurnal_komentar').update(pratinjauKomentar.value.id, { isOpen: true })
    isLoadingKomentar.value = false
    const date = new Date(pratinjauKomentar.value.created);
    const options = {
      dateStyle: "full",
      timeStyle: "short"
    }
    pratinjauKomentar.value.created = new Intl.DateTimeFormat('id-ID', options).format(date);
  }
}

onMounted(() => {
  getElemenCp()
  getJournals()
  getJurnalAgenda()
  getAgendaInfo()
  getTtdInstansi()
  if (isInstansi || isGuru) isiInfoSiswaInstansi()
  isTodayPostJournal()
  getPesertaByIdUser()
  getCountDraftJournal()
  client.autoCancellation(false)
  client.collection('jurnal').subscribe('*', function (e) {
    if (e.action == 'create' || e.action == 'update') {
      getJournals(false)
      getJurnalAgenda()
      isTodayPostJournal()
      getCountDraftJournal()
    }
  }, {})
})
</script>

<style scoped>
.form-control-file {
  display: none;
}

.foto-container {
  width: 100%;
  height: 200px;
}

.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.foto-preview {
  width: 100%;
  height: 100%;
}

.jurnal-hover:hover {
  background-color: #f9f9f9;
}

.bg-danger {
  background-color: rgb(255, 99, 132) !important;
}

@media screen and (max-width: 992px) {
  .journal-form {
    display: none;
  }
}

/*@media screen and (min-width: 992px) {
  .journal-button {
    display: none;
  }
}*/
.pre-text {
  white-space: pre-wrap;
}

.bookmark {
  position: relative;
}

.bookmark .bookmark-icon {
  position: absolute;
  top: -20px;
  right: -5px;
}

.jurnal-item {
  border: none !important;
  border-bottom: 1px solid #bababa !important;
  border-radius: 0 !important;
}

.no-shadow {
  box-shadow: none !important;
}

.sticky {
  position: sticky !important;
  top: 1rem;
  left: 0;
  z-index: 1;
}

/* ====== AGENDA HARIAN PKL ====== */
.agenda-filter {
  min-width: 140px;
}

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
  font-size: 0.98rem;
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
  color: #374151;
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

.agenda-table th,
.agenda-table td {
  border: 1px solid #374151;
  padding: 7px 9px;
  vertical-align: top;
}

.agenda-table th {
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111827;
}

/* header tabel harus tetap terang agar terbaca di atas kertas putih
   (menimpa `table th` gelap dari theme.css global) */
.agenda-table thead th {
  background-color: #e5e7eb !important;
  color: #111827 !important;
  border-color: #111827;
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

.info-text,
.tgl-text {
  cursor: pointer;
  border-radius: 2px;
  font-weight: 600;
  color: #111827;
}

.info-text:hover,
.tgl-text:hover {
  background: rgba(59, 130, 246, 0.1);
}

.info-empty {
  color: #6b7280;
  font-style: italic;
  font-weight: 600;
}

/* data kegiatan di tabel lebih gelap & tegas agar jelas terbaca */
.pre-text {
  font-weight: 500;
  color: #111827;
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

.ttd-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-style: normal;
  font-weight: 600;
  color: #2563eb;
}

.ttd-hint:hover {
  color: #1d4ed8;
}

.ttd-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ttd-img {
  max-width: 100%;
  max-height: 44px;
  object-fit: contain;
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

.agenda-table .col-no {
  width: 40px;
  text-align: center;
}

.agenda-table .col-tgl {
  width: 160px;
}

.agenda-table .col-ttd {
  width: 140px;
}

.agenda-empty-row td {
  height: 38px;
}

/* Tombol Ekspor PDF */
.btn-ekspor-pdf {
  background-color: #dc2626 !important;
  border-color: #b91c1c !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  font-size: 0.875rem !important;
  border-radius: 8px !important;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3) !important;
}

.btn-ekspor-pdf:hover:not(:disabled) {
  background-color: #b91c1c !important;
  border-color: #991b1b !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4) !important;
}

.btn-ekspor-pdf:active:not(:disabled) {
  transform: translateY(0);
}

.btn-ekspor-pdf:disabled {
  opacity: 0.75 !important;
  cursor: not-allowed;
}
</style>
