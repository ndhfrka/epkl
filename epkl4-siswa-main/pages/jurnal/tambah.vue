<template>
  <div class="card">
    <div class="card-header">
      <span class="h5 fw-bold">Jurnal / Buat baru</span>
      <NuxtLink to="/jurnal" class="float-end btn btn-light btn-sm border border-2 border-dark">Kembali</NuxtLink>
    </div>
    <div class="card-body">
      <div class="mb-4">
        <label for="deskripsi">Ceritakan Kegiatanmu!</label>
        <textarea v-model="form.deskripsi" id="deskripsi" class="form form-control mb-2"
          placeholder="Tulis kegiatan yang kamu lakukan hari ini, boleh ditulis paragraf atau daftar urutan."
          rows="5" required></textarea>
        <span class="mb-3 fw-bold small text-muted">{{ form.deskripsi.length }} karakter</span>
      </div>
      <div class="mb-4 smallest text-muted">
        Saya udah baca dan setuju dengan <nuxt-link to="/privacy" target="_blank"
          class="link text-muted">kebijakan privasi & syarat penggunaan</nuxt-link>.
      </div>
      <button @click="buatJurnalBaru(false)" :disabled="isPosting || !form.deskripsi.trim()"
        class="btn btn-dark btn-sm me-2 border border-2 border-dark">
        <span v-if="!isPosting"><i class="bi bi-send"></i> Kirim</span>
        <span v-else>Sedang mengirim</span>
      </button>
      <button @click="buatJurnalBaru(true)" :disabled="isPosting" class="btn btn-light btn-sm border border-2 border-dark float-end"><i class="bi bi-save"></i> Simpan draft</button>
    </div>
  </div>
</template>


<script setup>
import { navigateTo } from 'nuxt/app'

definePageMeta({ middleware: 'auth' })
useHead({ title: "Jurnal — e-PKL / SMK AL-FATAH BANJARNEGARA." })

let user = usePocketBaseUser()
let client = usePocketBaseClient()
let { tandaiAbsenOtomatis } = useAbsenOtomatis()
const { cekPengingat } = usePengingat() // segarkan notif pengingat setelah jurnal diisi

// guru tidak boleh membuat/mengunggah jurnal — langsung kembali ke halaman jurnal
if ((user.user.value?.role ?? '') === 'guru') navigateTo('/jurnal')
let prokel = user.user.value?.program_keahlian
let isLoading = ref(true)
let isPosting = ref(false)
let isSaved = ref(false)
let form = ref({
  "deskripsi": "",
  "siswa": user.user.value?.id,
  "pembimbing": "",
  "iduka": "",
  "program_keahlian": prokel,
  "isDraft": false
})

let havePostJournalToday = ref(false)
let today = useServerDay()


// fungsi ini nerima 2 params
// isDraft untuk menyimpan draft dengan type bool
// isUpdate untuk membedakan antara Buat Baru atau Update yang berasal dari Edit Jurnal
// secara default isUpdate bernilai False, ini disesuein sama nama func-nya.
async function buatJurnalBaru(isDraft) {
  if ((user.user.value?.role ?? '') === 'guru') return
  isPosting.value = true
  isSaved.value = false
  client.autoCancellation(false)
  form.value.isDraft = isDraft
  form.value.siswa = user.user.value.id
  // catat tanggal agenda hari ini (format sama dgn halaman Jurnal) agar
  // jurnal terhitung di tabel agenda & pengingat harian
  const kini = new Date()
  const namaHari = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(kini)
  form.value.tanggal_agenda = `${namaHari}, ${kini.getDate()}/${kini.getMonth() + 1}/${kini.getFullYear()}`
  try {
    let response = await client.collection('jurnal').create(form.value)
    if (response) {
      isPosting.value = false
      isSaved.value = true
      // isi baris absen otomatis: 1 kegiatan = 1 baris, ✓ di tanggal kegiatan (draft tidak)
      // PERBAIKAN: SELESAIKAN DULU tandaiAbsenOtomatis SEBELUM cek pengingat
      // agar data absen 100% tersimpan di PB saat pengecekan pengingat berjalan.
      // Sebelumnya: cekPengingat(true) DIPANGGIL DULU sebelum tandaiAbsenOtomatis
      // selesai — akibatnya jurnal & absen dianggap BELUM ADA → notif tidak hilang.
      if (!isDraft) await tandaiAbsenOtomatis(new Date(), form.value.deskripsi)
      cekPengingat(true) // jurnal + absen otomatis sudah terisi → refresh notif
      form.value.deskripsi = ""
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
      expand: "siswa"
    })
    let res_pemetaan = await client.collection('pemetaan').getFullList({
      filter: "siswa='" + res_user.siswa + "'",
      expand: "iduka, siswa"
    })

    isLoading.value = false

    // apabila sudah pemetaan PKL maka iduka & pembimbing terisi otomatis
    // jika belum pemetaan, form tetap bisa diisi manual
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

onMounted(() => {
  getElemenCp()
  isTodayPostJournal()
})
</script>
