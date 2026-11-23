<template>
  <div class="card">
    <div class="card-header">
      <span class="h4 fw-bold"><i class="bi bi-patch-check"></i> Nilai</span>
      <!-- <span v-if="!isLoading" class="float-end">
        <nuxt-link v-if="!isCertificate" to="/nilai/tambah" class="btn btn-info btn-sm"><i class="bi bi-plus-lg"></i> Buat Baru</nuxt-link>
      </span> -->
    </div>
    <div class="card-body">
      <div v-if="isLoading" class="row py-3">
        <div class="col-lg-12">
          <loading />
        </div>
      </div>
      <div v-else>
        <div v-if="isPenilai" class="row">
          <div class="col-lg-12">
            <p class="small text-muted">{{ isGuru ? 'Penilaian PKL oleh guru pembimbing. Pilih nama peserta untuk mengisi atau memperbarui nilai.' : 'Penilaian PKL oleh instansi. Pilih nama peserta untuk mengisi atau memperbarui nilai.' }}</p>
            <div v-for="row in penilaiRows" :key="row.siswa.id" class="card mb-2">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold">{{ row.siswa.nama }} <span class="text-muted small">{{ row.siswa.kelas?.startsWith('XII') ? row.siswa.kelas : 'XII.' + row.siswa.kelas }}</span></div>
                  <div class="small text-muted">
                    <span v-if="row.nilai">Elemen 1-4: {{ row.nilai.nilai_elemen1 }} / {{ row.nilai.nilai_elemen2 }} / {{ row.nilai.nilai_elemen3 }} / {{ row.nilai.nilai_elemen4 }} <span v-if="row.nilai.isValid" class="badge bg-success">Tervalidasi</span></span>
                    <span v-else>Belum ada nilai</span>
                  </div>
                </div>
                <nuxt-link v-if="row.nilai" :to="`/nilai/tambah?nilai=${row.nilai.id}`" class="btn btn-dark btn-sm border border-2 border-dark"><i class="bi bi-pencil"></i> Perbarui Nilai</nuxt-link>
                <nuxt-link v-else :to="`/nilai/tambah?siswa=${row.siswa.id}`" class="btn btn-info btn-sm border border-2 border-dark"><i class="bi bi-upload"></i> Upload Nilai</nuxt-link>
              </div>
            </div>
            <div v-if="!penilaiRows.length" class="text-center fs-4 fw-bold text-muted py-5">
              <i class="bi bi-people fs-1"></i> <br> Belum ada data nilai
            </div>
          </div>
        </div>
        <div v-else-if="isCertificate" class="row">
          <div class="col-lg-12">
            <loading v-if="isLoading" />
            <div v-else-if="!certificate.isValid" class="alert alert-warning small text-center">
              Nilai sedang proses validasi
            </div>
            <!-- [NILAI HANYA GURU/INSTANSI] Siswa hanya dapat MELIHAT nilai,
                 tidak boleh mengedit/mengupload — sesuai kebijakan aplikasi
                 dan aturan koleksi nilai di PocketBase. -->
            <div>
              <div class="row">
                <div class="col-lg-6">
                  <div class="mb-4">
                    <div class="fw-bold pb-2"><i class="bi bi-image-fill"></i> Pratinjau Nilai Elemen</div>
                    <img v-if="tempNilaiImg?.length" :src="`${host}/api/files/${certificate.collectionId}/${certificate.id}/${tempNilaiImg}`" alt="Foto jurnal nilai" width="100%" class="border border-2 border-dark mb-2">
                    <div v-else class="border border-2 border-dark mb-2 p-5 text-center text-muted small">Belum ada foto nilai elemen</div>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="mb-4">
                    <div class="text-muted fw-bold">Nilai Elemen 1</div>
                    <span class="fw-bold">{{ form.nilai_elemen1 }}</span>
                  </div>
                  <div class="mb-4">
                    <div class="text-muted fw-bold">Nilai Elemen 2</div>
                    <span class="fw-bold">{{ form.nilai_elemen2 }}</span>
                  </div>
                  <div class="mb-4">
                    <div class="text-muted fw-bold">Nilai Elemen 3</div>
                    <span class="fw-bold">{{ form.nilai_elemen3 }}</span>
                  </div>
                  <div class="mb-4">
                    <div class="text-muted fw-bold">Nilai Elemen 4</div>
                    <span class="fw-bold">{{ form.nilai_elemen4 }}</span>
                  </div>
                  <template v-if="form.isEntrust">
                    <div class="mb-4">
                      <div class="text-muted fw-bold">Jabatan Penandatangan</div>
                      <span class="fw-bold">{{ form.pj_penandatangan || '&#8212;' }}</span>
                    </div>
                    <div class="mb-4">
                      <div class="text-muted fw-bold">Nama Pejabat Penandatangan</div>
                      <span class="fw-bold">{{ form.nama_pj_penandatangan || '&#8212;' }}</span>
                    </div>
                    <div v-if="form.nomor_pegawai" class="mb-4">
                      <div class="text-muted fw-bold">Nomor Pegawai</div>
                      <span class="fw-bold">{{ form.nomor_pegawai }}</span>
                    </div>
                    <div v-if="form.nomor_sertifikat" class="mb-4">
                      <div class="text-muted fw-bold">Nomor Sertifikat</div>
                      <span class="fw-bold">{{ form.nomor_sertifikat }}</span>
                    </div>
                    <div v-if="tempLogoImg?.length" class="mb-4">
                      <div class="text-muted fw-bold">Logo IDUKA</div>
                      <img :src="`${host}/api/files/${certificate.collectionId}/${certificate.id}/${tempLogoImg}`" alt="Logo IDUKA" width="70">
                    </div>
                  </template>
                  <div class="alert alert-info small">
                    Nilai hanya dapat diisi atau diperbarui oleh <b>guru pembimbing</b> atau <b>instansi (tempat PKL)</b>. Hubungi salah satunya apabila ada data nilai yang perlu diperbaiki.
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="card my-3 hand-cursor" data-bs-toggle="modal" data-bs-target="#preview">
              <div class="card-body">
                <div class="fw-bold fs-4 mb-3">{{ certificate?.expand.iduka.nama }}</div>
                <div class="fw-bold text-muted">{{ certificate?.expand.siswa.nama }}</div>
                <div class="text-muted">XII.{{ certificate?.expand.siswa.kelas }}</div>
              </div>
            </div>
            <div class="modal modal-lg" id="preview" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-0 border border-2 border-dark shadow-lg">
                  <div class="modal-header fw-bold bg-success rounded-0 border-0 border-bottom border-2 border-dark">
                    <span class="fs-4">Rincian Nilai</span>
                    <button class="btn-close" data-bs-dismiss="modal" label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <table class="table table-bordered border border-dark fw-bold">
                      <tbody>
                        <tr>
                          <td>Internalisasi dan penerapan soft skills</td>
                          <td width="1%">:</td>
                          <td class="text-center">{{ certificate?.nilai_elemen1 }}</td>
                        </tr>
                        <tr>
                          <td>Penerapan hard skills</td>
                          <td width="1%">:</td>
                          <td class="text-center">{{ certificate?.nilai_elemen2 }}</td>
                        </tr>
                        <tr>
                          <td>Peningkatan dan pengembangan hard skills</td>
                          <td width="1%">:</td>
                          <td class="text-center">{{ certificate?.nilai_elemen3 }}</td>
                        </tr>
                        <tr>
                          <td>Penyiapan Kemandirian Berwirausaha</td>
                          <td width="1%">:</td>
                          <td class="text-center">{{ certificate?.nilai_elemen4 }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div> -->
          </div>
        </div>
        <div v-else class="row">
          <div class="col-lg-12">
            <div class="text-center fs-4 fw-bold text-muted py-5">
              <i class="bi bi-database fs-1"></i> <br>
              Belum ada nilai
              <p class="small mt-2 mb-0">Nilai akan diisi langsung oleh <b>instansi (tempat PKL)</b> atau <b>guru pembimbing</b> setelah masa PKL berjalan/selesai.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Nilai — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
let config = useRuntimeConfig()
let host = urlDasarPocketBase()
let isLoading = ref(true)
let isCertificate = ref(false)
let prokel = user.user.value?.program_keahlian
let siswa_id = user.user.value?.siswa
// [NILAI HANYA GURU/INSTANSI] nilai hanya boleh diisi/diperbarui oleh
// guru pembimbing & instansi (tempat PKL) — sesuai kebijakan aplikasi
// dan aturan koleksi nilai di PocketBase.
let isInstansi = user.user.value?.role === 'instansi'
let isGuru = user.user.value?.role === 'guru'
let isPenilai = isInstansi || isGuru
let nilaiList = ref([])
let certificate = ref()
let tempLogoImg = ref()
let tempNilaiImg = ref()
let guruSiswaList = ref([])
let form = ref({
  "nilai_elemen1": 0,
  "nilai_elemen2": 0,
  "nilai_elemen3": 0,
  "nilai_elemen4": 0,
  "pj_penandatangan": "",
  "foto_jurnal_nilai": "",
  "logo": "",
  "isEntrust": false,
  "isValid": "",
  "nama_pj_penandatangan": "",
  "nomor_pegawai": "",
  "nomor_sertifikat": "",
})

// daftar siswa + status nilai masing-masing untuk akun guru/instansi
let pemetaanList = ref([])
let penilaiRows = computed(() => {
  let rows = []
  let seen = new Set()
  // sumber daftar siswa:
  // - instansi: siswa yang dipetakan ke iduka milik akun instansi
  // - guru: siswa yang dibimbing (siswa.guru_pembimbing = akun guru ini)
  let sumber = isInstansi
    ? pemetaanList.value.map(p => p.expand?.siswa).filter(Boolean)
    : guruSiswaList.value
  for (let s of sumber) {
    if (!s || seen.has(s.id)) continue
    seen.add(s.id)
    rows.push({ siswa: s, nilai: nilaiList.value.find(n => n.siswa === s.id) })
  }
  // siswa yang sudah punya record nilai (expand siswa) walau belum ada pemetaan
  for (let n of nilaiList.value) {
    let s = n.expand?.siswa
    if (!s || seen.has(s.id)) continue
    seen.add(s.id)
    rows.push({ siswa: s, nilai: n })
  }
  return rows
})

async function getNilaiInstansi() {
  isLoading.value = true
  client.autoCancellation(false)
  try {
    // Instansi hanya melihat siswa yang pemetaannya menunjuk ke iduka milik
    // akun instansi ini (relasi resmi teacher_users.iduka), bukan dari
    // tebak-tebakan nama iduka pada record nilai.
    const idukaId = user.user.value?.iduka
    if (!idukaId) {
      console.error('[nilai] Akun instansi belum terhubung ke tempat PKL (field iduka kosong).')
      nilaiList.value = []
      pemetaanList.value = []
      isLoading.value = false
      return
    }
    pemetaanList.value = await client.collection('pemetaan').getFullList({
      filter: `iduka='${idukaId}'`,
      expand: 'siswa'
    })
    const siswaDataIds = pemetaanList.value.map(p => p.siswa).filter(Boolean)
    if (siswaDataIds.length) {
      nilaiList.value = await client.collection('nilai').getFullList({
        filter: siswaDataIds.map(id => `siswa='${id}'`).join(' || '),
        expand: 'siswa, iduka'
      })
    } else {
      nilaiList.value = []
    }
  } catch(e) {
    console.error('[nilai] Gagal memuat nilai instansi:', e)
    nilaiList.value = []
  }
  isLoading.value = false
}

// [NILAI HANYA GURU/INSTANSI] Guru pembimbing: daftar siswa binaannya
// (siswa.guru_pembimbing = akun guru ini) + nilai masing-masing.
async function getNilaiGuru() {
  isLoading.value = true
  client.autoCancellation(false)
  try {
    guruSiswaList.value = await client.collection('siswa').getFullList({
      filter: `guru_pembimbing='${user.user.value?.id}'`
    })
    const ids = guruSiswaList.value.map(s => s.id)
    if (ids.length) {
      nilaiList.value = await client.collection('nilai').getFullList({
        filter: ids.map(id => `siswa='${id}'`).join(' || '),
        expand: 'siswa, iduka'
      })
    } else {
      nilaiList.value = []
    }
  } catch(e) {
    console.error('[nilai] Gagal memuat nilai guru:', e)
    guruSiswaList.value = []
    nilaiList.value = []
  }
  isLoading.value = false
}

async function getNilai(loading=true, isCert=false) {
  isLoading.value = loading
  isCertificate.value = isCert
  client.autoCancellation(false)
  try {
    let res = await client.collection('nilai').getFirstListItem(`siswa='${siswa_id}'`, {
      expand: "iduka, siswa"
    })
    if(res) {
      certificate.value = res
      form.value = res
      tempLogoImg.value = certificate.value.logo
      tempNilaiImg.value = certificate.value.foto_jurnal_nilai
      isLoading.value = false
      isCertificate.value = true
    }
  } catch(error) {
    isLoading.value = false
    isCertificate.value = false
  }
}

onMounted(() => {
  // [NILAI HANYA GURU/INSTANSI] guru & instansi -> daftar penilaian
  // (bisa mengisi/memperbarui via /nilai/tambah); siswa -> lihat nilai
  // miliknya saja (read-only)
  if (isPenilai) {
    isGuru ? getNilaiGuru() : getNilaiInstansi()
    return
  }
  getNilai()
  client.autoCancellation(false)
  client.collection('nilai').subscribe('*', function(e) {
    // getNilai params:
    // - isLoading nilai default na true
    // - isCert nilai default na false
    if(e.action == 'update') getNilai(false, true)
  },{})
})
</script>
