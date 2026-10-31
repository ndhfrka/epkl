<template>
  <div class="bg-transparent">
      <div v-if="(isGuru || isInstansi) && listSiswaOption.length > 0" class="d-flex align-items-center justify-content-center gap-2 mb-3 flex-wrap">
        <!-- Badge Jurusan Guru -->
        <span v-if="isGuru && guruJurusanNama" class="badge rounded-pill bg-primary px-3 py-2 text-white shadow-sm" style="font-size: 0.85rem">
          <i class="bi bi-mortarboard-fill me-1"></i> Jurusan {{ guruJurusanNama }}
        </span>
        <!-- Filter Jurusan jika akun guru/admin punya akses multi-jurusan -->
        <div v-else-if="isGuru && listJurusanOption.length > 1" class="d-flex align-items-center gap-1">
          <label class="fw-bold text-muted mb-0 small"><i class="bi bi-funnel-fill me-1"></i>Jurusan:</label>
          <select v-model="selectedJurusanFilter" class="form-select form-select-sm" style="max-width: 140px" @change="onJurusanFilterChange">
            <option value="all">Semua Jurusan</option>
            <option v-for="j in listJurusanOption" :key="j.id" :value="j.id">{{ j.nama }}</option>
          </select>
        </div>

        <label class="fw-bold text-muted mb-0 small">Pantau Siswa:</label>
        <select v-model="selectedSiswaUserId" class="form-select form-select-sm" style="max-width: 250px" @change="onChangeSiswa">
          <option v-for="opt in listSiswaOption" :key="opt.userId" :value="opt.userId">{{ opt.nama }} ({{ opt.kelas }})</option>
        </select>
      </div>
      <div v-else-if="isGuru && listSiswaOption.length === 0" class="alert alert-info text-center py-2 px-3 small mx-auto mb-3" style="max-width: 450px">
        <i class="bi bi-info-circle me-1"></i> Belum ada siswa terdaftar di jurusan {{ guruJurusanNama || 'ini' }}.
      </div>

    <div class="pb-2 text-center">
      <Loading v-if="isLoading" />
      <span v-else-if="!isLoading && peserta">
        <div class="profil-wrap">
          <div class="profil-foto">
            <img v-if="fotoUrl" :src="fotoUrl" alt="foto profil" class="hand-cursor" title="Klik untuk melihat foto" @click="showFoto = true" />
            <i v-else class="bi bi-person-circle"></i>
            <label v-if="!isInstansi && !isGuru" class="profil-edit hand-cursor" title="Klik untuk unggah foto profil">
              <i class="bi bi-camera-fill"></i>
              <input type="file" accept="image/*" class="d-none" @change="uploadFoto" />
            </label>
          </div>
          <div class="profil-nama">
            <div class="fw-bold text-grey">{{ peserta.nama }}</div>
            <div v-if="pesertaJurusan" class="mt-1">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                <i class="bi bi-mortarboard-fill me-1"></i> {{ pesertaJurusan }}
              </span>
            </div>
          </div>
        </div>
      </span>
    </div>
  </div>

  <div v-if="showFoto && fotoUrl" class="foto-preview" @click="showFoto = false">
    <img :src="fotoUrl" alt="foto profil" />
    <button class="btn-close-foto" title="Tutup" @click.stop="showFoto = false"><i class="bi bi-x-lg"></i></button>
  </div>

  <Loading v-if="isLoadingJournaToday" />
  <div v-else class="mb-3">
    <nuxt-link v-if="countDraftJournal > 0" to="/jurnal" class="link">
      <div class="alert alert-danger text-center small p-2">
        Ada <span class="fw-bold">{{ countDraftJournal }}</span> draft jurnal. Segera kirim! <i class="bi bi-arrow-right"></i>
      </div>
    </nuxt-link>
    <nuxt-link v-if="!isInstansi && !isGuru" to="/jurnal/tambah" class="link">
      <div v-if="pemetaan.length > 0 && peserta?.guru_pembimbing != '' && !havePostJournalToday" class="alert alert-dark text-center small p-2">
        <i class="bi bi-pencil-square"></i> Ayo buat Jurnal hari ini <i class="bi bi-arrow-right"></i>
      </div>
    </nuxt-link>
    <nuxt-link v-if="countUnreadJournalComment > 0" to="/jurnal" class="link">
      <div class="text-center small p-2">
        <i class="bi bi-bell"></i> Kamu punya {{ countUnreadJournalComment }} komentar jurnal <i class="bi bi-arrow-right"></i> 
      </div>
    </nuxt-link>
  </div>

  <!---->
  <div class="card">
    <div class="card-body">
      <div class="row">
        <div class="col-md-12">
          <Loading v-if="isLoading" />
          <div v-else>
            <div class="row g-3">
              <div class="col-6 col-md-4 col-lg-2">
                <div class="mb-3">
                  <div class="text-muted">Jurusan</div>
                  <span v-if="pesertaJurusan" class="fw-bold text-grey">{{ pesertaJurusan }}</span>
                  <span v-else>&#8212;</span>
                  <div v-if="pesertaKonsentrasi" class="small text-muted text-truncate" :title="pesertaKonsentrasi">{{ pesertaKonsentrasi }}</div>
                </div>
              </div>

              <div class="col-6 col-md-4 col-lg-2">
                <div class="mb-3">
                  <div class="text-muted">Kelas <button v-if="!isInstansi && !isGuru" class="btn-edit-mini" title="Edit kelas" @click="mulaiEditKelas"><i class="bi bi-pencil-square"></i></button></div>
                  <template v-if="editingKelas">
                    <input v-model="kelasText" class="form-control form-control-sm edit-inline" type="text" placeholder="Contoh: XI TKJ 1" @keyup.enter="simpanKelas" @blur="simpanKelas" />
                  </template>
                  <template v-else>
                    <span v-if="peserta" class="fw-bold text-grey">{{ peserta.kelas || '-' }}</span>
                    <span v-else>&#8212;</span>
                  </template>
                </div>
              </div>

              <div class="col-12 col-md-4 col-lg-3">
                <div class="mb-3">
                  <div class="text-muted">Tempat PKL <button v-if="!isInstansi && !isGuru" class="btn-edit-mini" title="Edit tempat PKL" @click="mulaiEditIduka"><i class="bi bi-pencil-square"></i></button></div>
                  <template v-if="editingIduka">
                    <input v-model="idukaNama" class="form-control form-control-sm edit-inline" type="text" placeholder="Nama tempat PKL / instansi" @keyup.enter="simpanIduka" />
                    <input v-model="idukaAlamat" class="form-control form-control-sm edit-inline mt-1" type="text" placeholder="Alamat" @keyup.enter="simpanIduka" />
                    <div class="mt-1">
                      <button class="btn btn-primary btn-sm" @click="simpanIduka">Simpan</button>
                      <button class="btn btn-outline-secondary btn-sm" @click="editingIduka = false">Batal</button>
                    </div>
                  </template>
                  <template v-else>
                    <template v-if="iduka">
                      <nuxt-link to="/iduka" class="link">
                        <span class="fw-bold text-grey">{{ iduka?.items[0].expand.iduka.nama }}</span>
                      </nuxt-link>
                      <div v-if="iduka?.items[0].expand.iduka?.alamat" class="small text-muted">{{ iduka?.items[0].expand.iduka.alamat }}</div>
                    </template>
                    <span v-else>Belum pemetaan</span>
                  </template>
                </div>
              </div>

              <div class="col-12 col-md-6 col-lg-3">
                <div class="mb-3">
                  <div class="text-muted">Guru Pembimbing <button class="btn-edit-mini" title="Pilih guru pembimbing" @click="mulaiEditGuru"><i class="bi bi-pencil-square"></i></button></div>
                  <template v-if="editingGuru">
                    <select v-model="guruPilih" class="form-select form-select-sm edit-inline" @change="simpanGuru">
                      <option value="">- pilih guru -</option>
                      <option v-for="g in guruList" :key="g.id" :value="g.id">{{ g.nama }}</option>
                    </select>
                    <div class="mt-1">
                      <button class="btn btn-outline-secondary btn-sm" @click="editingGuru = false">Tutup</button>
                    </div>
                  </template>
                  <template v-else>
                    <span v-if="guruNamaTampil" class="fw-bold text-grey">{{ guruNamaTampil }}</span>
                    <span v-else>Belum pemetaan</span>
                  </template>
                </div>
              </div>

              <div class="col-12 col-md-6 col-lg-2">
                <div class="mb-3"><div class="jam-pkl-frame">
                  <div class="jam-pkl-header">Jam PKL
                    <span v-if="!isInstansi && !isGuru" class="btn-edit-mini" title="Edit jam mulai & selesai PKL" @click="mulaiEditJam" style="cursor:pointer"><i class="bi bi-pencil-square"></i></span>
                  </div></div>
                  <template v-if="editingJam">
                    <div class="d-flex align-items-center gap-1 flex-wrap">
                      <input v-model="jamMulaiText" type="time" class="form-control form-control-sm edit-inline" style="max-width:112px" aria-label="Jam mulai PKL">
                      <span class="text-muted"><i class="bi bi-arrow-right"></i></span>
                      <input v-model="jamSelesaiText" type="time" class="form-control form-control-sm edit-inline" style="max-width:112px" aria-label="Jam selesai PKL">
                    </div>
                    <div class="d-flex gap-1 mt-1">
                      <button class="btn btn-primary btn-sm" @click="simpanJam">Simpan</button>
                      <button class="btn btn-outline-secondary btn-sm" @click="editingJam = false">Batal</button>
                    </div>
                  </template>
                  <template v-else>
                    <span v-if="emptyPemetaan || !iduka?.items?.length">Belum pemetaan</span>
                    <span v-else-if="jamMulai || jamSelesai" class="jam-pkl-chip" title="Jam kerja PKL di tempat PKL-mu">
                      <span class="jam-pkl-item"><i class="bi bi-clock"></i> {{ jamMulai || '—' }}</span>
                      <span class="jam-pkl-sep"><i class="bi bi-arrow-right-short"></i></span>
                      <span class="jam-pkl-item"><i class="bi bi-clock"></i> {{ jamSelesai || '—' }}</span>
                    </span>
                    <span v-else class="text-muted small">Belum diatur — klik <i class="bi bi-pencil-square"></i> untuk isi</span>
                  </template>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  <div class="mt-4">
    <div class="d-flex justify-content-between align-items-center pb-1">
      <div class="fw-bold text-grey fs-5"><i class="bi bi-people"></i> Temen Satu Tim</div>
      <button v-if="!editingTeman && !isInstansi && !isGuru" class="btn btn-light btn-sm border border-2 border-dark" @click="mulaiEditTeman"><i class="bi bi-pencil"></i> Edit</button>
    </div>
    <Loading v-if="isLoading" />
    <div v-else class="card">
      <div class="card-body p-0">
        <template v-if="editingTeman">
          <div class="p-3">
            <label class="small text-muted">Tulis satu teman per baris (Nama - Kelas)</label>
            <textarea v-model="temanTimText" class="form-control form-control-sm" rows="5" placeholder="Contoh: Aisyah - XI TKJ 1"></textarea>
            <div class="mt-2">
              <button class="btn btn-sm btn-primary border border-2 border-dark" :disabled="isSavingTeman" @click="simpanTemanTim">{{ isSavingTeman ? 'Menyimpan...' : 'Simpan' }}</button>
              <button class="btn btn-sm btn-light border border-2 border-dark ms-1" @click="editingTeman = false">Batal</button>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-if="temanTimRows.length > 0" class="list-group list-group-flush">
            <div v-for="(t, i) in temanTimRows" :key="'tim-' + i" class="list-group-item">
              <div class="float-start fs-4 me-2"><i class="bi bi-person"></i></div>
              <span class="small fw-bold text-grey pb-0 mb-0">{{ t.nama }}</span> <br>
              <span v-if="t.kelas" class="smallest text-muted">{{ t.kelas }}</span>
            </div>
          </div>
          <div v-else-if="pemetaan.length > 0" class="list-group list-group-flush">
            <div v-for="p in pemetaan" :key="p.id" class="list-group-item">
              <div class="float-start fs-4 me-2"><i class="bi bi-person"></i></div>
              <span class="small fw-bold text-grey pb-0 mb-0">{{ p.expand.siswa.nama }}</span> <br>
              <span class="smallest text-muted">{{ p.expand.siswa.kelas }}</span>
            </div>
          </div>
          <div v-else class="text-center text-muted small p-3">Belum ada temen / kamu PKL sendirian</div>
        </template>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div class="fw-bold text-grey fs-5 pb-1"><i class="bi bi-journal-check"></i> Rekapan Bulanan</div>
    <Loading v-if="isLoading" />
    <div v-else class="row">
      <div v-for="r in rekapanList" :key="r.id" class="col-lg-3 col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <strong>Rekapan {{ NAMA_BULAN[r.bulan - 1] }} {{ r.tahun }}</strong>
            <div class="small mt-2">
              <div><span class="text-success fw-bold">✓</span> Hadir: <strong>{{ r.hadir }}</strong></div>
              <div><span class="text-warning fw-bold">S</span> Sakit: <strong>{{ r.sakit }}</strong></div>
              <div><span class="fw-bold">I</span> Izin: <strong>{{ r.izin }}</strong></div>
              <div><span class="text-danger fw-bold">✗</span> Alpa: <strong>{{ r.alpa }}</strong></div>
              <div><span class="fw-bold">L</span> Libur: <strong>{{ r.libur || 0 }}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="rekapanList.length < 1" class="col-12">
        <div class="card">
          <div class="card-body text-center text-muted small">Belum ada rekapan. Rekap bulan yang sudah selesai muncul otomatis setelah ada data absen di halaman Absen PKL.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div class="">
      <div class="row">
        <div class="col-lg-3">
          <nuxt-link class="link" to="/jurnal">
            <div class="card mb-3">
              <div class="card-body">
                <strong class="fs-4">{{ countJournal }}</strong>
                <div class="small">Jurnal Harian</div>
                <!-- <span class="small"> halaman</span> -->
              </div>
            </div>
          </nuxt-link>
        </div>

        <div v-if="countJournalNotValid > 0" class="col-lg-3">
          <nuxt-link class="link" to="/jurnal">
            <div class="card bg-warning mb-3">
              <div class="card-body">
                <strong class="fs-4">{{ countJournalNotValid }}</strong>
                <div class="small">Jurnal belum di validasi</div>
                <!-- <span class="small"> halaman</span> -->
              </div>
            </div>
          </nuxt-link>
        </div>

        <div class="col-lg-3">
          <div class="card mb-3">
            <div class="card-body">
              <div class="float-end" data-bs-toggle="modal" data-bs-target="#info-aktivitas"><i class="bi bi-info-circle"></i></div>

              <strong class="fs-4">
                <span v-if="prosentaseAktivitasJurnal >= 95">👑</span>
                <span v-else-if="prosentaseAktivitasJurnal > 89">😃</span>
                <span v-else-if="prosentaseAktivitasJurnal > 79">😔</span>
                <span v-else>😭</span>
                {{ prosentaseAktivitasJurnal }}%
              </strong>
              <div class="small">{{ descAktivitasJurnal }}</div>
            </div>
          </div>
        </div>

        <div class="modal" id="info-aktivitas">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border border-3 border-dark">
              <div class="modal-body">
                <i class="bi bi-info-circle"></i> Prosentase Aktivitas dihutung dari Jurnal dengan Elemen CP yang sesuai PKL dan sudah divalidasi pembimbing!
              </div>

              <div class="modal-footer">
                <button class="btn btn-light btn-sm border border-2 border-dark" data-bs-dismiss="modal">Oke</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
  <M3Fab
    v-if="!isInstansi && !isGuru && pemetaan.length > 0 && peserta?.guru_pembimbing != '' && !havePostJournalToday"
    to="/jurnal/tambah"
    icon="bi-pencil-square"
    label="Buat Jurnal Hari Ini"
    size="regular"
    variant="primary"
    position="br"
    :nav-bar-safe="true"
    :mobile-only="true"
  />
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Overview — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
let prokel = user.user.value?.program_keahlian
let isInstansi = user.user.value?.role === 'instansi'
let isGuru = user.user.value?.role === 'guru'

let listSiswaOption = ref([])
let selectedSiswaUserId = ref(null)

let guruJurusanNama = ref('')
let listJurusanOption = ref([])
let selectedJurusanFilter = ref('all')

let pesertaJurusan = computed(() => peserta.value?.expand?.program_keahlian?.nama || peserta.value?.expand?.program_keahlian?.alias || '')
let pesertaKonsentrasi = computed(() => peserta.value?.expand?.program_keahlian?.konsentrasi_keahlian || '')

let isLoading = ref(true)
let isLoadingJournaToday = ref(true)
let countJournal = ref(0)
let countJournalNotValid = ref(0)
let countJournalSesuaiElemen = ref(0)
let countJournalTidakSesuaiElemen = ref(0)
let prosentaseAktivitasJurnal = ref(0)
let descAktivitasJurnal = ref('')
let pemetaan = ref([])
let iduka = ref()
let peserta = ref()
let emptyPemetaan = ref(false)
let fotoUrl = computed(() => {
  const p = peserta.value
  if (!p?.foto?.length) return ''
  return client.baseUrl + '/api/files/siswa/' + p.id + '/' + p.foto + '?t=' + (p.updated ? encodeURIComponent(p.updated) : Date.now())
})
let guruNamaTampil = computed(() => {
  const g = peserta.value?.expand?.guru_pembimbing
  if (!g) return ''
  if (Array.isArray(g)) return g.map(x => x?.nama).filter(Boolean).join(', ')
  return g.nama || ''
})
let editingKelas = ref(false)
let kelasText = ref('')
let editingIduka = ref(false)
let idukaNama = ref('')
let idukaAlamat = ref('')
let editingGuru = ref(false)
let guruList = ref([])
let guruPilih = ref('')
let showFoto = ref(false)
let today = useServerDay()
let havePostJournalToday = ref(false)
let countDraftJournal = ref(0)
let countUnreadJournalComment = ref(0)
let isLoadingJournalSesuaiTidakSesuai = ref(true)

async function getCountJournal(loading=true) {
  isLoading.value = loading
  client.autoCancellation(false)
  let base = (isGuru || isInstansi)
    ? `siswa='${selectedSiswaUserId.value || "tidak-ada"}'`
    : `siswa='${user.user.value.id}'`
  let res_journal = await client.collection('jurnal').getFullList({
    filter: base,
    fields: "id",
  })
  let filterNotValid = base ? base + ` && isValid=false` : `isValid=false`
  let res_journal2 = await client.collection('jurnal').getFullList({
    filter: filterNotValid,
    fields: `id`
  })
  if(res_journal && res_journal2) {
    isLoading.value = false
    countJournal.value = res_journal.length
    countJournalNotValid.value = res_journal2.length
  }
}

async function getCountJournalSesuaiTidakSesuai(loading=true) {
  isLoadingJournalSesuaiTidakSesuai.value = loading
  let f = (isGuru || isInstansi)
    ? `siswa='${selectedSiswaUserId.value || "tidak-ada"}' && `
    : `siswa="${user.user.value.id}" && `
  let res_jurnal = await client.collection('jurnal').getList(1,1, {
    filter: f.replace(/ && $/, '')
  })
  let res_tidak_sesuai = await client.collection('jurnal').getList(1,1, {
    filter: f ? f + `elemen.elemen="Lain-lain"` : `elemen.elemen="Lain-lain"`
  })
  let res_sesuai = { totalItems: res_jurnal.totalItems - res_tidak_sesuai.totalItems }

  if(res_jurnal && res_tidak_sesuai) {
    isLoadingJournalSesuaiTidakSesuai.value = false
    countJournalSesuaiElemen.value = res_sesuai.totalItems
    countJournalTidakSesuaiElemen.value = res_tidak_sesuai.totalItems
    
    prosentaseAktivitasJurnal.value = Math.round((res_sesuai.totalItems / res_jurnal.totalItems) * 100 || 0)

    if(prosentaseAktivitasJurnal.value >= 95) descAktivitasJurnal.value = "Aktivitasmu Sangat Sesuai"
    else if(prosentaseAktivitasJurnal.value > 89) descAktivitasJurnal.value = "Aktivitasmu Sesuai"
    else if(prosentaseAktivitasJurnal.value > 79) descAktivitasJurnal.value = "Aktivitasmu Cukup Sesuai"
    else descAktivitasJurnal.value = "Aktivitasmu Kurang Sesuai"
  }
}

async function getInfo(loading=true) {
  isLoading.value = loading
  client.autoCancellation(false)
  try {
    let siswaId = user.user.value?.siswa || ''
    if (isInstansi || isGuru) {
      let opt = listSiswaOption.value.find(x => x.userId === selectedSiswaUserId.value)
      siswaId = opt ? opt.siswaId : ''
    }
    if (!siswaId) {
      emptyPemetaan.value = true
      return
    }
    let res_siswa = await client.collection('siswa').getOne(siswaId, {
      expand: "program_keahlian, guru_pembimbing"
    })

    let res_iduka = await client.collection('pemetaan').getList(1,1, {
      filter: "siswa='"+siswaId+"'",
      expand: "iduka, iduka.pembimbing_sekolah, program_keahlian, siswa"
    })

    if(res_iduka && res_siswa) {
      peserta.value = res_siswa
      if(res_iduka.items.length > 0) {
        let res_pemetaan = await client.collection('pemetaan').getFullList({
          filter: "iduka='"+res_iduka?.items[0].iduka+"' && siswa!='"+siswaId+"'",
          expand: "iduka, siswa"
        })
        if(res_pemetaan) {
          iduka.value = res_iduka
          pemetaan.value = res_pemetaan
          // reset tanda kosong supaya kartu iduka kembali tampil jika
          // sebelumnya sempat "Belum pemetaan" lalu datanya muncul.
          emptyPemetaan.value = false
        }
      } else {
        emptyPemetaan.value = true
      }
    }
  } catch (e) {
    // Jangan biarkan halaman macet di status loading jika ada query gagal.
    console.error('[home] getInfo gagal:', e)
    emptyPemetaan.value = true
  } finally {
    isLoading.value = false
  }
}

async function isTodayPostJournal() {
  if (isGuru || isInstansi) { isLoadingJournaToday.value = false; return }
  try {
    isLoadingJournaToday.value = true
    let siswaFilter = user.user.value.id
    let response = await client.collection('jurnal').getFirstListItem(`siswa="${siswaFilter || 'tidak-ada'}"`, {
      sort: "-created"
    })
    if(response) {
      let res = response
      const date = new Date(res.created)
      const options = {
        dateStyle: "long"
      }
      res.created = new Intl.DateTimeFormat('id-ID', options).format(date)
      if(res.created == today) havePostJournalToday.value = true
      isLoadingJournaToday.value = false
    }
  } catch(error) {
    isLoadingJournaToday.value = false
  }
}

async function uploadFoto(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = ''
  if (!file) return
  try {
    await client.collection('siswa').update(user.user.value.siswa, { foto: file })
    await getInfo(false)
  } catch (err) {
    alert('Gagal mengunggah foto: ' + (err?.response?.message || err?.message))
  }
}

function mulaiEditKelas() {
  if (editingKelas.value) return
  kelasText.value = peserta.value?.kelas || ''
  editingKelas.value = true
}

async function simpanKelas() {
  if (!editingKelas.value) return
  editingKelas.value = false
  try {
    const res = await client.collection('siswa').update(user.user.value.siswa, { kelas: kelasText.value })
    peserta.value.kelas = res.kelas
  } catch (err) {
    alert('Gagal menyimpan kelas: ' + (err?.response?.message || err?.message))
  }
}

let editingTeman = ref(false)
let isSavingTeman = ref(false)
let temanTimText = ref('')
let temanTimRows = computed(() => {
  const raw = peserta.value?.teman_satu_tim || ''
  return String(raw).split('\n').map(s => s.trim()).filter(Boolean).map(line => {
    const m = line.split(/\s+-\s+/)
    if (m.length >= 2) return { nama: m[0].trim(), kelas: m.slice(1).join(' - ').trim() }
    return { nama: line, kelas: '' }
  })
})

function mulaiEditTeman() {
  if (editingTeman.value) return
  temanTimText.value = peserta.value?.teman_satu_tim || ''
  editingTeman.value = true
}

async function simpanTemanTim() {
  isSavingTeman.value = true
  try {
    const res = await client.collection('siswa').update(user.user.value.siswa, { teman_satu_tim: temanTimText.value })
    peserta.value.teman_satu_tim = res.teman_satu_tim
    editingTeman.value = false
  } catch (err) {
    alert('Gagal menyimpan temen satu tim: ' + (err?.response?.message || err?.message))
  }
  isSavingTeman.value = false
}

function mulaiEditIduka() {
  if (editingIduka.value) return
  const id = iduka.value?.items?.[0]?.expand?.iduka
  idukaNama.value = id?.nama || ''
  idukaAlamat.value = id?.alamat || ''
  editingIduka.value = true
}

async function simpanIduka() {
  if (!editingIduka.value) return
  if (!idukaNama.value.trim()) { alert('Nama tempat PKL tidak boleh kosong'); return }
  try {
    const first = iduka.value?.items?.[0]
    if (first) {
      const res = await client.collection('iduka').update(first.iduka, {
        nama: idukaNama.value.trim(),
        alamat: idukaAlamat.value.trim()
      })
      first.expand.iduka.nama = res.nama
      first.expand.iduka.alamat = res.alamat
      editingIduka.value = false
    } else {
      const newIduka = await client.collection('iduka').create({
        nama: idukaNama.value.trim(),
        alamat: idukaAlamat.value.trim()
      })
      try {
        await client.collection('pemetaan').create({
          iduka: newIduka.id,
          siswa: user.user.value.siswa,
          program_keahlian: prokel || ''
        })
      } catch (errPem) {
        alert('Tempat PKL tersimpan, tetapi gagal membuat pemetaan: ' + (errPem?.response?.message || errPem?.message))
        await getInfo(false)
        return
      }
      await getInfo(false)
      editingIduka.value = false
    }
  } catch (err) {
    alert('Gagal menyimpan tempat PKL: ' + (err?.response?.message || err?.message))
  }
}

// ===== Jam PKL (jam mulai & jam selesai) — tersimpan di data IDUKA =====
const idukaRow = computed(() => iduka.value?.items?.[0]?.expand?.iduka)
const rapihJam = (j) => (j || '').trim().replace(':', '.')
const jamMulai = computed(() => rapihJam(idukaRow.value?.jam_mulai))
const jamSelesai = computed(() => rapihJam(idukaRow.value?.jam_selesai))
let editingJam = ref(false)
let jamMulaiText = ref('')
let jamSelesaiText = ref('')

function mulaiEditJam() {
  if (editingJam.value) return
  jamMulaiText.value = idukaRow.value?.jam_mulai || ''
  jamSelesaiText.value = idukaRow.value?.jam_selesai || ''
  editingJam.value = true
}

async function simpanJam() {
  if (!editingJam.value) return
  if (!idukaRow.value?.id) { editingJam.value = false; return }
  try {
    const res = await client.collection('iduka').update(idukaRow.value.id, {
      jam_mulai: jamMulaiText.value,
      jam_selesai: jamSelesaiText.value
    })
    idukaRow.value.jam_mulai = res.jam_mulai
    idukaRow.value.jam_selesai = res.jam_selesai
    editingJam.value = false
  } catch (err) {
    alert('Gagal menyimpan jam PKL: ' + (err?.response?.message || err?.message))
  }
}

async function mulaiEditGuru() {
  if (editingGuru.value) return
  editingGuru.value = true
  const cur = peserta.value?.expand?.guru_pembimbing
  guruPilih.value = Array.isArray(cur) ? (cur[0]?.id || '') : (cur?.id || '')
  try {
    guruList.value = await client.collection('teacher_users').getFullList({ sort: 'nama', fields: 'id,nama' })
  } catch (err) {
    guruList.value = []
    alert('Gagal memuat daftar guru: ' + (err?.response?.message || err?.message))
  }
}

async function simpanGuru() {
  try {
    await client.collection('siswa').update(user.user.value.siswa, { guru_pembimbing: guruPilih.value ? [guruPilih.value] : [] })
    await getInfo(false)
  } catch (err) {
    alert('Gagal menyimpan guru pembimbing: ' + (err?.response?.message || err?.message))
  }
}

async function getCountDraftJournal() {
  let filter = (isGuru || isInstansi)
    ? `siswa="${selectedSiswaUserId.value || 'tidak-ada'}" && isDraft=true`
    : `siswa="${user.user.value.id}" && isDraft=true`
  let res = await client.collection('jurnal').getFullList({
    filter
  })
  if(res) {
    countDraftJournal.value = res.length
  }
}

async function getCountUnreadJournalComment() {
  let filter = (isGuru || isInstansi)
    ? `idJurnal.siswa.id="${selectedSiswaUserId.value || 'tidak-ada'}" && isOpen=false`
    : `idJurnal.siswa.id="${user.user.value.id}" && isOpen=false`
  let res = await client.collection('jurnal_komentar').getList(1,1, { filter })
  if(res) {
    countUnreadJournalComment.value = res.totalItems
  }
}

// ====== REKAPAN BULANAN (otomatis tersimpan tiap bulan selesai) ======
let rekapanList = ref([])
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

async function getRekapan() {
  client.autoCancellation(false)
  try {
    const filter = (isGuru || isInstansi)
      ? `user="${selectedSiswaUserId.value || 'tidak-ada'}"`
      : `user="${user.user.value.id}"`
    rekapanList.value = await client.collection('rekapan_bulanan').getFullList({
      filter,
      sort: '-tahun,-bulan'
    })
  } catch {
    rekapanList.value = []
  }
}

async function generateRekapanOtomatis() {
  if (isInstansi) return
  client.autoCancellation(false)
  try {
    const now = new Date()
    const nowBulan = now.getMonth() + 1
    const nowTahun = now.getFullYear()
    // bulan-bulan yang sudah selesai (tahun lalu seluruhnya + tahun ini sebelum bulan berjalan)
    const periode = []
    for (let b = 1; b <= 12; b++) periode.push({ bulan: b, tahun: nowTahun - 1 })
    for (let b = 1; b < nowBulan; b++) periode.push({ bulan: b, tahun: nowTahun })
    const absenAll = await client.collection('absen').getFullList({
      filter: `user="${user.user.value.id}"`,
      fields: 'id,marks,bulan,tahun'
    })
    for (const p of periode) {
      const rows = absenAll.filter(a => Number(a.bulan) === p.bulan && Number(a.tahun) === p.tahun)
      if (rows.length < 1) continue
      let hadir = 0, sakit = 0, izin = 0, alpa = 0
      const terisi = new Set()
      for (const r of rows) {
        const marks = r.marks || {}
        for (const k of Object.keys(marks)) {
          if (!marks[k]) continue
          const hn = Number(k)
          if (hn >= 1 && hn <= 31) terisi.add(hn)
          if (marks[k] === 'v') hadir++
          else if (marks[k] === 's') sakit++
          else if (marks[k] === 'i') izin++
          else if (marks[k] === 'x') alpa++
        }
      }
      // tanggal kosong di bulan selesai = libur
      const hariDalamBulan = new Date(p.tahun, p.bulan, 0).getDate()
      let libur = 0
      for (let d = 1; d <= hariDalamBulan; d++) if (!terisi.has(d)) libur++
      const data = { user: user.user.value.id, bulan: p.bulan, tahun: p.tahun, hadir, sakit, izin, alpa, libur }
      const existing = rekapanList.value.find(r => Number(r.bulan) === p.bulan && Number(r.tahun) === p.tahun)
      if (existing) await client.collection('rekapan_bulanan').update(existing.id, data)
      else await client.collection('rekapan_bulanan').create(data)
    }
    await getRekapan()
  } catch { /* diamkan */ }
}

async function fetchSiswaOptions() {
  if (!isInstansi && !isGuru) return
  client.autoCancellation(false)
  try {
    let options = []

    if (isInstansi) {
      // Instansi hanya boleh memantau siswa yang PKL-nya di tempatnya sendiri:
      // saring pemetaan berdasarkan iduka milik akun instansi.
      const opsiPemetaan = { expand: 'siswa,program_keahlian', sort: '-created' }
      const idukaId = user.user.value?.iduka
      if (!idukaId) {
        console.error('[home] Akun instansi belum terhubung ke tempat PKL (field iduka kosong). Hubungi admin untuk menghubungkannya di PocketBase Admin.')
        listSiswaOption.value = []
        selectedSiswaUserId.value = null
        return
      }
      opsiPemetaan.filter = `iduka='${idukaId}'`
      let pem = await client.collection('pemetaan').getFullList(opsiPemetaan)
      const siswaIds = pem.map(p => p.expand?.siswa?.id).filter(Boolean)
      let userAccs = siswaIds.length
        ? await client.collection('student_users').getList(1, 50, { filter: siswaIds.map(id => `siswa='${id}'`).join(' || ') }).then(r => r.items)
        : []
      
      for (let p of pem) {
        if (p.expand?.siswa) {
          let s = p.expand.siswa
          let u = userAccs.find(x => x.siswa === s.id)
          if (u) {
            options.push({ userId: u.id, siswaId: s.id, nama: s.nama, kelas: s.kelas, jurusan: p.expand?.program_keahlian?.nama || '' })
          }
        }
      }
    } else if (isGuru) {
      // Guru memantau siswa per jurusan (PPLG, TKR, AKL, dst.)
      let allPk = []
      try {
        allPk = await client.collection('program_keahlian').getFullList({ sort: 'nama' })
        listJurusanOption.value = allPk
      } catch (errPk) {
        console.warn('[home] Gagal memuat daftar program_keahlian:', errPk)
      }

      let guruPk = user.user.value?.program_keahlian || []
      if (!Array.isArray(guruPk)) guruPk = guruPk ? [guruPk] : []

      // Fallback deteksi jurusan jika field program_keahlian di akun guru belum terisi
      if (!guruPk.length) {
        const uname = (user.user.value?.username || user.user.value?.nama || '').toLowerCase()
        for (const pk of allPk) {
          const nm = (pk.nama || '').toLowerCase()
          if (nm && uname.includes(nm)) {
            guruPk.push(pk.id)
            break
          }
        }
      }

      const matchingPk = allPk.filter(p => guruPk.includes(p.id))
      if (matchingPk.length === 1) {
        guruJurusanNama.value = matchingPk[0].nama
        if (selectedJurusanFilter.value === 'all') {
          selectedJurusanFilter.value = matchingPk[0].id
        }
      } else if (matchingPk.length > 1) {
        guruJurusanNama.value = matchingPk.map(p => p.nama).join(', ')
      }

      // Tentukan target jurusan yang difilter
      let targetPk = (selectedJurusanFilter.value && selectedJurusanFilter.value !== 'all')
        ? selectedJurusanFilter.value
        : (guruPk.length === 1 ? guruPk[0] : null)

      let filterAcc = ''
      if (targetPk) {
        filterAcc = `program_keahlian='${targetPk}' || siswa.program_keahlian='${targetPk}'`
      } else if (guruPk.length > 1) {
        filterAcc = guruPk.map(id => `program_keahlian='${id}' || siswa.program_keahlian='${id}'`).join(' || ')
      }

      const accs = await client.collection('student_users').getFullList({
        filter: filterAcc || undefined,
        expand: 'siswa,program_keahlian',
        sort: 'username'
      })

      for (let u of accs) {
        if (u.expand?.siswa) {
          let s = u.expand.siswa
          let pkName = u.expand?.program_keahlian?.nama || s.expand?.program_keahlian?.nama || ''
          options.push({
            userId: u.id,
            siswaId: s.id,
            nama: s.nama,
            kelas: s.kelas,
            jurusan: pkName
          })
        }
      }
    }

    const unique = []
    const map = new Map()
    for (const item of options) {
      if (!map.has(item.siswaId)) {
        map.set(item.siswaId, true)
        unique.push(item)
      }
    }
    listSiswaOption.value = unique

    if (unique.length > 0) {
      const masihValid = selectedSiswaUserId.value && unique.find(x => x.userId === selectedSiswaUserId.value)
      if (!masihValid) {
        const saved = localStorage.getItem('selectedSiswaUserId')
        if (saved && unique.find(x => x.userId === saved)) {
          selectedSiswaUserId.value = saved
        } else {
          selectedSiswaUserId.value = unique[0].userId
        }
        localStorage.setItem('selectedSiswaUserId', selectedSiswaUserId.value)
      }
    } else {
      selectedSiswaUserId.value = null
    }
  } catch (e) {
    console.error('[home] Gagal memuat daftar siswa pemantauan:', e)
  }
}

async function onJurusanFilterChange() {
  await fetchSiswaOptions()
  await onChangeSiswa()
}

async function onChangeSiswa() {
  localStorage.setItem('selectedSiswaUserId', selectedSiswaUserId.value)
  isLoading.value = true
  await getInfo()
  getCountJournal()
  getCountJournalSesuaiTidakSesuai()
  getCountDraftJournal()
  getCountUnreadJournalComment()
  getRekapan()
  isTodayPostJournal()
}

onMounted(async () => {
  if (isGuru || isInstansi) await fetchSiswaOptions()

  getCountJournal()
  getInfo()
  isTodayPostJournal()
  getCountDraftJournal()
  getCountUnreadJournalComment()
  getCountJournalSesuaiTidakSesuai()
  getRekapan().then(() => generateRekapanOtomatis())
  client.autoCancellation(false)
  client.collection('pemetaan').subscribe('*', async function(e){
    if(e.action == 'create' || e.action == 'update') {
      // Muat ulang daftar siswa pemetaan supaya pemetaan yang baru saja
      // dibuat siswa (mis. lewat akun siswa di tab lain) langsung muncul
      // di dropdown pemantauan guru/instansi tanpa harus refresh manual.
      await fetchSiswaOptions()
      // Jika ada pemetaan BARU, arahkan pantauan ke siswa pemilik pemetaan
      // tersebut (kebiasaannya guru ingin langsung melihat siswa yang baru
      // mendaftar/mengisi pemetaan). Untuk update, biarkan pilihan saat ini.
      if (e.action == 'create' && e.record?.siswa) {
        const opsiBaru = listSiswaOption.value.find(o => o.siswaId === e.record.siswa)
        if (opsiBaru) {
          selectedSiswaUserId.value = opsiBaru.userId
          localStorage.setItem('selectedSiswaUserId', opsiBaru.userId)
        }
      }
      // Jaga agar pilihan tetap valid; jika tidak valid kembalikan ke opsi pertama
      if (!listSiswaOption.value.find(o => o.userId === selectedSiswaUserId.value)) {
        selectedSiswaUserId.value = listSiswaOption.value[0]?.userId || null
      }
      getInfo()
      getCountJournal()
      getCountDraftJournal()
      getCountJournalSesuaiTidakSesuai(false)
      isTodayPostJournal()
    }
  }, {})
  client.collection('jurnal').subscribe('*', function(e){
    if(e.action == 'create' || e.action == 'update') {
      getCountJournal()
      isTodayPostJournal()
      getCountDraftJournal()
      getCountJournalSesuaiTidakSesuai(false)
    } 
  }, {})
  client.collection('jurnal_komentar').subscribe('*', function(e){
    if(e.action == 'create' || e.action == 'update') getCountUnreadJournalComment()
  },{})
})
</script>

<style scoped>
.small, .small table {
  font-size: 14px !important;
}
.card .card-header {
  font-size: 1.2rem;
  background-color: transparent;
  border-bottom: none !important;
}
.smallest {
  font-size: 10pt
}
.profil-wrap {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin: 4px auto 6px;
}
.profil-foto {
  position: relative;
  display: inline-flex;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  overflow: visible;
  justify-content: center;
  align-items: center;
}
.profil-foto img {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(96, 165, 250, 0.65);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
.profil-foto .bi-person-circle {
  font-size: 116px;
  color: #60a5fa;
}
.profil-edit {
  position: absolute;
  right: 0px;
  bottom: 6px;
  background: transparent;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
}
.foto-preview {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}
.foto-preview img {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 12px;
  border: 3px solid rgba(96, 165, 250, 0.65);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}
.btn-close-foto {
  position: absolute;
  top: 18px;
  right: 22px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.6rem;
  cursor: pointer;
}
.profil-nama div:first-child {
  font-size: 1.15rem;
}
.btn-edit-mini {
  border: none;
  background: transparent;
  color: #60a5fa;
  padding: 0 2px;
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-edit-mini:hover {
  color: #93c5fd;
}

/* Jam PKL frame and header styling */
.jam-pkl-frame {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: transparent; /* removed white background to blend with app */
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
  max-width: 100%;
}
.jam-pkl-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #ffffff; /* white text */
}
.edit-inline {
  max-width: 240px;
  border-radius: 8px;
}

/* ===== Jam PKL chip (mulai - selesai) ===== */
.jam-pkl-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  border-radius: 999px;
  background: transparent; /* removed white/light background */
  border: 1px solid #1e3a8a; /* primary blue border for visibility */
  box-shadow: none;
  font-weight: 600;
  color: #111827; /* dark text */
  font-size: 0.95rem;
  white-space: nowrap;
  margin: 0 auto;
  max-width: 100%;
  flex-wrap: wrap;
}

.jam-pkl-chip .bi-clock {
  color: #ffffff; /* white icons */
  font-size: 1.05rem;
}
.jam-pkl-sep {
  color: #64748b;
  display: inline-flex;
  margin: 0 8px;
}



.jam-pkl-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #ffffff; /* white time text */
}
</style>
