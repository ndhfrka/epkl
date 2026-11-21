<template>
  <div class="card">
    <div class="card-header">
      <span class="h4 fw-bold">Isi / Perbarui Nilai PKL</span>
      <span class="float-end">
        <nuxt-link to="/nilai" class="btn btn-light btn-sm border border-2 border-dark">Kembali</nuxt-link>
      </span>
    </div>
    <div class="card-body">
      <Loading v-if="isLoadingMetaPemetaan" />
      <div v-else class="row">
        <div class="col-lg-6">
          <form @submit.prevent="buatBaru">
            <div v-if="targetSiswaNama" class="alert alert-info border border-2 border-dark small">
              Mengisi nilai untuk: <strong>{{ targetSiswaNama }}</strong>
            </div>
            <div class="mb-4">
              <label for="fotonilai">Foto Halaman Nilai <span class="text-danger">*</span></label>
              <input @change="compressFile" class="form form-control" type="file" id="fotonilai" accept="image/*" capture="environment" :required="!editId" />
            </div>
            <div class="mb-4">
              <label for="el_softskill">Nilai Elemen 1 <span class="text-danger">*</span></label>
              <input v-model="form.nilai_elemen1" type="number" min="0" max="100" id="el_softskill" class="form form-control" required>
            </div>
            <div class="mb-4">
              <label for="el_hardskill">Nilai Elemen 2 <span class="text-danger">*</span></label>
              <input :disabled="form.nilai_elemen1 < 1" v-model="form.nilai_elemen2" type="number" min="0" max="100" id="el_hardskill" class="form form-control" required>
            </div>
            <div class="mb-4">
              <label for="el_pengembangan_hardskill">Nilai Elemen 3 <span class="text-danger">*</span></label>
              <input :disabled="form.nilai_elemen2 < 1" v-model="form.nilai_elemen3" type="number" min="0" max="100" id="el_pengembangan_hardskill" class="form form-control" required>
            </div>
            <div class="mb-4">
              <label for="el_wirausaha">Nilai Elemen 4 <span class="text-danger">*</span></label>
              <input :disabled="form.nilai_elemen2 < 1" v-model="form.nilai_elemen4" type="number" min="0" max="100" id="el_wirausaha" class="form form-control" required>
            </div>

            <hr>

            <div class="mb-4 form-check form-switch">
              <input v-model="form.isEntrust" class="form-check-input" type="checkbox" id="entrust" switch>
              <label for="entrust">Sertifikat (opsional)</label>
            </div>
            <div v-if="form.isEntrust">
              <div class="mb-4">
                <label for="pj_penandatangan">Jabatan Penandatangan <span class="text-danger">*</span></label>
                <input :disabled="form.nilai_elemen4 < 1" v-model="form.pj_penandatangan" type="text" id="pj_penandatangan" class="form form-control" placeholder="CEO/Direktur/Kepala Bengkel..." required>
              </div>
              <div class="mb-4">
                <label for="nama_pj_penandatangan">Nama Lengkap Pejabat Penandatangan <span class="text-danger">*</span></label>
                <input :disabled="form.pj_penandatangan < 1" v-model="form.nama_pj_penandatangan" type="text" id="nama_pj_penandatangan" class="form form-control" placeholder="Tulis nama lengkap pejabat..." required>
              </div>
              <div class="mb-4">
                <label for="nomor_pegawai">NIP <span class="text-muted">(opsional)</span></label>
                <input v-model="form.nomor_pegawai" type="text" id="nomor_pegawai" class="form form-control" placeholder="Kosongkan jika tidak ada">
              </div>
              <div class="mb-4">
                <label for="nomor_sertifikat">Nomor Sertifikat <span class="text-muted">(opsional)</span></label>
                <input v-model="form.nomor_sertifikat" type="text" id="nomor_sertifikat" class="form form-control" placeholder="Kosongkan jika tidak ada">
              </div>
              <div class="mb-4">
                <label for="logo_iduka">Logo IDUKA <span class="text-muted">(apabila punya)</span></label>
                <input @change="compressFileLogo" class="form form-control" type="file" id="logo_iduka" accept="image/*" />
              </div>
            </div>
            <button :disabled="isSending || form.nilai_elemen1 < 1 || form.nilai_elemen2 < 1 || form.nilai_elemen3 < 1 || form.nilai_elemen4 < 1" class="btn btn-dark me-2 border border-2 border-dark">
              <span v-if="isSending">Sedang mengirim</span>
              <span v-else>{{ editId ? 'Simpan Perbaruan' : 'Kirim Nilai' }}</span>
            </button>
            <nuxt-link to="/nilai" class="btn btn-light border border-2 border-dark">Kembali</nuxt-link>
            <span v-if="isSaved" class="ms-3 small fst-italic text-muted">Nilai berhasil disimpan!</span>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Compressor from 'compressorjs'
definePageMeta({ middleware: 'auth' })
useHead({ title: "Buat Nilai — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
let isLoading = ref(false)
let isCertificate = ref(false)
let isSending = ref(false)
let isSaved = ref(false)
let isError = ref(false)
let isLoadingMetaPemetaan = ref(true)
let prokel = user.user.value?.program_keahlian
let siswa_id = user.user.value?.siswa
let meta_pemetaan = ref()
// [NILAI HANYA GURU/INSTANSI] mengisi/memperbarui nilai via query
// ?nilai=<id> = perbarui nilai, ?siswa=<id> = isi nilai baru
let route = useRoute()
let isInstansi = user.user.value?.role === 'instansi'
let isGuru = user.user.value?.role === 'guru'
let isPenilai = isInstansi || isGuru
let editId = route.query.nilai || ''
let targetSiswa = route.query.siswa || ''
let targetSiswaNama = ref('')

// pembimbing_id akan nyimpen nilai id pembimbing dari collection `siswa`
let pembimbing_id = ref()

let form = ref({
  "nilai_elemen1": 0,
  "nilai_elemen2": 0,
  "nilai_elemen3": 0,
  "nilai_elemen4": 0,
  "foto_jurnal_nilai": "",
  "iduka": "",
  "siswa": "",
  "program_keahlian": prokel,
  "pj_penandatangan": "",
  "logo": "",
  "isEntrust": false,
  "isValid": false,
  "nama_pj_penandatangan": "",
  "nomor_sertifikat": "",
  "nomor_pegawai": "",
  "pembimbing": ""
})

let hasMappingTeacher = ref(false)
let hasMappingIduka = ref(false)

async function buatBaru() {
  isSending.value = true
  isSaved.value = false
  try {
    if (isPenilai) {
      // guru pembimbing / instansi: perbarui nilai lama atau buat nilai
      // baru untuk siswa yang dituju (siswa tidak lagi mengirim nilai)
      if (editId) {
        await client.collection('nilai').update(editId, form.value)
      } else {
        await client.collection('nilai').create(form.value)
      }
      isSending.value = false
      isSaved.value = true
      navigateTo('/nilai')
      return
    }
  } catch(err) {
    isSending.value = false
    isSaved.value = false
    isError.value = true
  }
}

function compressFile(e) {
  let file = e.target.files[0]
  if(!file) return;
  new Compressor(file, {
    quality: 0.6,
    success(result) {
      form.value.foto_jurnal_nilai = result
    },
    error(err) {
      console.error(err.message)
    }
  })
}

function compressFileLogo(e) {
  let file = e.target.files[0]
  if(!file) return
  new Compressor(file, {
    quality: 0.6,
    success(result) {
      form.value.logo = result
    },
    error(err) {
      console.log(err.message)
    }
  })
}

async function getIdukaByPeserta() {
  isLoadingMetaPemetaan.value = true
  client.autoCancellation(false)
  try {
    let res = await client.collection('pemetaan').getFirstListItem(`siswa='${siswa_id}'`, {
      expand: 'siswa'
    })
    if(res) {
      meta_pemetaan.value = res

      // jika sudah pemetaan peserta ke IDUKA maka hasMappingIduka harus true agar bisa serahkan nilai
      hasMappingIduka.value = true
      isLoadingMetaPemetaan.value = false

      let res_pemetaan_pembimbing = await client.collection('pemetaan_pembimbing').getFirstListItem(`pembimbing="${res.expand?.siswa.guru_pembimbing}"`)
      if(res_pemetaan_pembimbing) {
        // jika sudah pemetaan peserta ke guru maka hasMappingTeacher harus true agar bisa serahkan nilai
        hasMappingTeacher.value = true
      }
    }
  } catch(err) {
    navigateTo('/nilai')
    isLoadingMetaPemetaan.value = false
  }
}

async function getNilai() {
  isLoading.value = true
  isCertificate.value = false
  try {
    client.autoCancellation(false)
    let res = await client.collection('nilai').getFirstListItem(`siswa='${siswa_id}'`)
    if(res) {
      // jika nilai sudah diajuin, redir ke halaman nilai
      navigateTo('/nilai')
      isLoading.value = false
      isCertificate.value = true
    }
  } catch(error) {
    isLoading.value = false
    isCertificate.value = false
  }
}

async function getSiswa() {
  try {
    let res_siswa = await client.collection('siswa').getOne(user.user.value?.siswa)

    if(res_siswa) {
      pembimbing_id.value = res_siswa.guru_pembimbing
    }
  } catch(e) {
    // abaikan: akun instansi tidak punya relasi siswa
  }
}

// mode instansi: prefill form dari nilai yang diedit atau set target siswa
async function prefillInstansi() {
  isLoadingMetaPemetaan.value = true
  client.autoCancellation(false)
  try {
    if (editId) {
      let res = await client.collection('nilai').getOne(editId, { expand: 'siswa' })
      if (res) {
        form.value.nilai_elemen1 = res.nilai_elemen1
        form.value.nilai_elemen2 = res.nilai_elemen2
        form.value.nilai_elemen3 = res.nilai_elemen3
        form.value.nilai_elemen4 = res.nilai_elemen4
        form.value.pj_penandatangan = res.pj_penandatangan || ''
        form.value.nama_pj_penandatangan = res.nama_pj_penandatangan || ''
        form.value.nomor_pegawai = res.nomor_pegawai || ''
        form.value.nomor_sertifikat = res.nomor_sertifikat || ''
        form.value.isValid = res.isValid
        form.value.isEntrust = !!(res.pj_penandatangan || res.nama_pj_penandatangan)
        form.value.siswa = res.siswa
        form.value.iduka = res.iduka
        if (res.expand?.siswa) targetSiswaNama.value = res.expand.siswa.nama
      }
    } else if (targetSiswa) {
      form.value.siswa = targetSiswa
      try {
        let s = await client.collection('siswa').getOne(targetSiswa)
        if (s) {
          targetSiswaNama.value = s.nama
          form.value.pembimbing = s.guru_pembimbing || ''
        }
      } catch(e) {}
      // isi iduka dari pemetaan siswa agar data nilai tetap lengkap
      try {
        let pm = await client.collection('pemetaan').getFirstListItem(`siswa='${targetSiswa}'`)
        if (pm) form.value.iduka = pm.iduka
      } catch(e) {}
    }
  } catch(e) {}
  isLoadingMetaPemetaan.value = false
}

onMounted(() => {
  // [NILAI HANYA GURU/INSTANSI] hanya guru pembimbing & instansi (tempat
  // PKL) yang boleh mengisi/mengubah nilai; siswa hanya memantau
  // (sesuai kebijakan aplikasi & aturan koleksi nilai di PocketBase).
  if (!isPenilai) {
    alert('Hanya akun guru pembimbing atau instansi (tempat PKL) yang boleh mengisi atau mengubah nilai.')
    navigateTo('/nilai')
    return
  }
  prefillInstansi()
})
</script>
