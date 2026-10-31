<template>
  <div class="">
    <div class="h4 fw-bold text-center text-grey">
      <span v-if="meta_pemetaan">{{ form.nama }}</span>
      <span v-else>IDUKA</span>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <loading v-if="isLoading" />
      <div v-else class="row">
        <div v-if="!meta_pemetaan" class="col-md-12">
          <div class="text-center text-muted pb-5">
            <div class="fs-1 pt-5"><i class="bi bi-database"></i></div>
            <span class="fw-bold fs-4">Belum pemetaan tempat</span>
          </div>
        </div>
        <div v-else class="col-md-6">
          <form @submit.prevent="updateIduka">
            <div class="mb-4">
              <label for="pimpinan">Pimpinan <span class="text-danger">*</span></label>
              <input v-model="form.pimpinan" :disabled="isLoading || isSaving || !bisaEdit" type="text" id="pimpinan"
                class="form form-control" placeholder="nama pimpinan" required>
            </div>
            <div class="mb-4">
              <label for="kontak">Kontak <span class="text-danger">*</span></label>
              <input v-model="form.kontak" :disabled="isLoading || isSaving || !bisaEdit" type="text" id="kontak"
                class="form form-control" placeholder="nomor telepon/HP kantor" required>
            </div>
            <div class="mb-4">
              <label for="email">Email (opsional)</label>
              <input v-model="form.email" :disabled="isLoading || isSaving || !bisaEdit" type="email" id="email"
                class="form form-control" placeholder="email kantor kalo ada">
            </div>
            <div class="mb-4">
              <label for="instruktur">Instruktur <span class="text-danger">*</span></label>
              <input v-model="form.pembimbing_iduka" :disabled="isLoading || isSaving || !bisaEdit" type="text" id="instruktur"
                class="form form-control" placeholder="nama pembimbing di tempat PKL" required>
            </div>
            <button v-if="bisaEdit" :disabled="isSaving" class="btn btn-dark border border-2 border-dark">
              <span v-if="isSaving">Sedang menyimpan</span>
              <span v-else>Simpan</span>
            </button>
            <div v-else class="text-muted small fst-italic">
              Mode pantauan — data ini hanya dapat diubah oleh akun instansi (pemilik tempat PKL).
            </div>
            <span v-if="isSaved" class="ms-2 fst-italic text-muted fw-bold small">Berhasil tersimpan!</span>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Identitas IDUKA — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
// role akun: 'siswa' (student_users), atau role teacher_users (guru/instansi/admin/...)
let role = user.user.value?.role || 'siswa'
let isSiswa = role === 'siswa'
let isInstansi = role === 'instansi'
// siswa & instansi boleh mengubah identitas iduka; guru dan role lain hanya memantau
let bisaEdit = isSiswa || isInstansi
let peserta_id = user.user.value?.siswa || ''
let isLoading = ref(true)
let isSaving = ref(false)
let isSaved = ref(false)
let form = ref({
  "pimpinan": "loading",
  "kontak": "loading",
  "email": "loading",
  "pembimbing_iduka": "loading",
})
let meta_pemetaan = ref()

// Untuk guru/instansi: samakan dengan halaman home — pakai siswa yang sedang
// dipantau (pilihan tersimpan di localStorage 'selectedSiswaUserId'),
// fallback ke pemetaan terbaru supaya kartu iduka tidak kosong.
// Instansi hanya boleh melihat siswa yang PKL-nya di tempatnya sendiri.
async function resolveSiswaDipantau() {
  const opsi = { expand: 'siswa', sort: '-created' }
  if (isInstansi) {
    const idukaId = user.user.value?.iduka
    if (!idukaId) {
      console.error('[iduka] Akun instansi belum terhubung ke tempat PKL (field iduka kosong).')
      return ''
    }
    opsi.filter = `iduka='${idukaId}'`
  }
  const pem = await client.collection('pemetaan').getFullList(opsi)
  const siswaIds = pem.map(p => p.expand?.siswa?.id).filter(Boolean)
  if (!siswaIds.length) return ''
  const accs = siswaIds.length
    ? await client.collection('student_users').getList(1, 50, { filter: siswaIds.map(id => `siswa='${id}'`).join(' || ') }).then(r => r.items)
    : []
  const opts = []
  for (const p of pem) {
    const s = p.expand?.siswa
    if (!s) continue
    const acc = accs.find(x => x.siswa === s.id)
    if (acc) opts.push({ userId: acc.id, siswaId: s.id })
  }
  if (!opts.length) return ''
  const saved = localStorage.getItem('selectedSiswaUserId')
  const pilih = opts.find(o => o.userId === saved) || opts[0]
  return pilih.siswaId
}

async function getIdukaByIdPeserta(loading = true) {
  isLoading.value = loading
  client.autoCancellation(false)
  try {
    if (!isSiswa) peserta_id = await resolveSiswaDipantau()
    if (!peserta_id) throw new Error('belum-ada-pemetaan')
    let res = await client.collection('pemetaan').getFirstListItem(`siswa="${peserta_id}"`, {
      expand: "iduka"
    })
    if (res) {
      form.value = res.expand.iduka
      meta_pemetaan.value = res.expand.iduka
    }
  } catch (e) {
    meta_pemetaan.value = ""
    if (e?.response?.code !== 404 && e?.message !== 'belum-ada-pemetaan') {
      console.error('[iduka] Gagal memuat identitas iduka:', e)
    }
  } finally {
    isLoading.value = false
  }
}

async function updateIduka() {
  isSaving.value = true
  isSaved.value = false
  client.autoCancellation(false)
  try {
    let res = await client.collection('iduka').update(form.value.id, {
      "pimpinan": form.value.pimpinan,
      "kontak": form.value.kontak,
      "email": form.value.email,
      "pembimbing_iduka": form.value.pembimbing_iduka,
    })
    if (res) {
      isSaved.value = true
    }
  } catch (e) {
    console.error('[iduka] Gagal menyimpan:', e)
    alert('Gagal menyimpan: ' + (e?.response?.message || e?.message))
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  getIdukaByIdPeserta()
})
</script>
