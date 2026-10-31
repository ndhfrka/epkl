<template>
  <div class="card">
    <div class="card-header">
      <span class="h4 fw-bold"><i class="bi bi-journal-bookmark-fill"></i> Elemen</span>
    </div>
    <div class="card-body">
      <div class="alert alert-warning pb-0 small">
        <ul class="px-2">
          <li>Elemen berikut berkaitan dengan <nuxt-link to="/jurnal" class="link">Jurnal</nuxt-link></li>
          <li><code>Lain-lain</code> adalah opsi di luar konteks elemen</li>
        </ul>
      </div>

      <loading v-if="isLoading" />

      <div v-if="elements" class="accordion accordion-flush" id="accordion-parent">
        <div v-for="(elemen,i) in elements" :key="elemen.id" class="accordion-item border-bottom border-1 border-grey">
          <div class="accordion-header">
            <button class="accordion-button collapsed px-3 py-3" type="button" data-bs-toggle="collapse" :data-bs-target="`#flush-${elemen.id}`" aria-expanded="false" :aria-controls="`flush-${elemen.id}`">
              <span class="badge bg-primary rounded-pill me-3 px-3">{{ i+1 }}</span> 
              <span class="fw-bold elemen-title">{{ elemen.elemen }}</span>
            </button>
          </div>
          <div :id="`flush-${elemen.id}`" class="accordion-collapse collapse" data-bs-parent="#accordion-parent">
            <div class="accordion-body bg-light rounded-bottom">
              <div class="mb-4">
                <div class="fw-bold text-primary mb-2">
                  <i class="bi bi-bullseye me-1"></i> Capaian Pembelajaran (CP)
                </div>
                <div class="p-3 bg-white border border-light rounded shadow-sm content-box">
                  {{ elemen.cp }}
                </div>
              </div>
              <div class="mb-2">
                <div class="fw-bold text-success mb-2">
                  <i class="bi bi-list-check me-1"></i> Tujuan Pembelajaran
                </div>
                <div class="p-3 bg-white border border-light rounded shadow-sm content-box pre-text">
                  {{ elemen.tujuan }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
useHead({ title: "Elemen — e-PKL / SMK AL-FATAH BANJARNEGARA." })
let user = usePocketBaseUser()
let client = usePocketBaseClient()
let prokel = user.user.value?.program_keahlian
let isLoading = ref(true)
let elements = ref([])

async function getElemenCp() {
  isLoading.value = true
  client.autoCancellation(false)
  let res = await client.collection('elemen_cp').getFullList({
    filter: "program_keahlian='"+prokel+"'",
    sort: 'created'
  })
  if(res) {
    isLoading.value = false
    elements.value = res
  }
}

onMounted(() => getElemenCp())
</script>

<style scoped>
/* ============================================================
   PERBAIKAN WARNA TEKS (JADI PUTIH) DI ATAS BACKGROUND GELAP
   ============================================================ */

/* ===== HEADER JUDUL HALAMAN ===== */
.card-header {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}
.card-header .h4,
.card-header .h4 * {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

/* ===== HEADER ACCORDION (BAGIAN YANG KLIK UNTUK BUKA) ===== */
.accordion-button,
.accordion-button.collapsed,
.accordion-button:not(.collapsed) {
  color: #ffffff !important;
  background-color: transparent !important;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.accordion-button:not(.collapsed) {
  background-color: rgba(91, 110, 242, 0.22) !important;
}

/* Ini yang MENGUBAH WARNA TEKS HITAM JADI PUTIH */
.elemen-title {
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.45) !important;
}

/* Badge nomor bulat biru */
.badge.bg-primary {
  color: #ffffff !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.2);
}

/* ===== INFO BOX ATAS ===== */
.alert-warning {
  background-color: rgba(255, 193, 7, 0.15) !important;
  border-color: rgba(255, 193, 7, 0.3) !important;
}
.alert-warning li {
  color: rgba(255,255,255,0.92) !important;
}
.alert-warning .link {
  color: #fcd34d !important;
  font-weight: 600;
}
.alert-warning code {
  color: #fbbf24 !important;
  background-color: rgba(0,0,0,0.3) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}

/* ===== BADGE / LABEL di DALAM ACCORDION BODY ===== */
.accordion-body .text-primary {
  color: #c7d2fe !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
}
.accordion-body .text-success {
  color: #bbf7d0 !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 1px rgba(0,0,0,0.3);
}

/* ===== KONTEN ISI (CP & TUJUAN) ===== */
.accordion-body {
  background-color: #1e293b !important;
}
.content-box {
  color: #f1f5f9 !important;
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
  font-size: 0.95rem;
  line-height: 1.7;
}
.accordion-body .content-box {
  color: #f1f5f9 !important;
}
.pre-text {
  white-space: pre-wrap;
  color: #f1f5f9 !important;
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
}

/* Hilangkan outline/focus bawaan Bootstrap */
button:focus,
.accordion-button:focus {
  box-shadow: none !important;
  outline: none !important;
}

/* Border pemisah item */
.accordion-item {
  border-color: rgba(255,255,255,0.08) !important;
  background-color: transparent !important;
}

/* Scroll bar halus (jika butuh) */
.pre-text::-webkit-scrollbar-thumb,
.content-box::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}
</style>
