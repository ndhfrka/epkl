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
   TEMA-AWARE + ANIMASI HALUS (terang & gelap, desktop & mobile)
   Semua warna memakai variabel tema (var(--md-sys-color-*))
   sehingga otomatis mengikuti mode terang/gelap — tidak ada lagi
   panel gelap yang dipaksa tampil di tema terang.
   ============================================================ */

/* ===== HEADER JUDUL HALAMAN ===== */
.card-header {
  background-color: transparent !important;
  border-bottom: 1px solid var(--md-sys-color-outline-variant) !important;
}
.card-header .h4,
.card-header .h4 * {
  color: var(--md-sys-color-on-surface, #0f1729) !important;
  text-shadow: none;
}

/* ===== ALERT INFO ATAS (amber lembut, terbaca di dua tema) ===== */
.alert-warning {
  background-color: rgba(245, 158, 11, 0.12) !important;
  border-color: rgba(245, 158, 11, 0.35) !important;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.alert-warning li,
.alert-warning li * {
  color: var(--md-sys-color-warning, #b45309) !important;
}
.alert-warning .link {
  color: var(--md-sys-color-warning, #b45309) !important;
  font-weight: 600;
  text-decoration: underline;
}
.alert-warning code {
  color: var(--md-sys-color-warning, #b45309) !important;
  background-color: var(--md-sys-color-surface-container-highest) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}

/* ===== HEADER ACCORDION (BAGIAN YANG DIKLIK UNTUK BUKA) ===== */
.accordion-button,
.accordion-button.collapsed,
.accordion-button:not(.collapsed) {
  color: var(--md-sys-color-on-surface, #0f1729) !important;
  background-color: transparent !important;
  font-weight: 600;
  letter-spacing: 0.2px;
  -webkit-tap-highlight-color: transparent;
}
/* transisi halus: warna + chevron berputar saat buka/tutup */
.accordion-button,
.accordion-button::after {
  transition: background-color 0.25s ease, color 0.25s ease, transform 0.3s ease;
}
.accordion-button.collapsed:hover {
  background-color: var(--md-sys-color-surface-container-low, #0a1120) !important;
}
.accordion-button:active {
  background-color: var(--md-sys-color-surface-container-high, #18213a) !important;
}
.accordion-button:not(.collapsed) {
  background-color: var(--md-sys-color-surface-container-high, #18213a) !important;
}

.elemen-title {
  color: var(--md-sys-color-on-surface, #0f1729) !important;
  font-weight: 700 !important;
  font-size: 1rem !important;
  text-shadow: none !important;
}

/* Badge nomor bulat */
.badge.bg-primary {
  color: #ffffff !important;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: box-shadow 0.25s ease;
}

/* ===== ANIMASI BUKA/TUTUP ACCORDION ===== */
/* tinggi accordion melorot mulus (lembutkan easing bawaan) */
.accordion-collapse.collapsing {
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
/* isi muncul dengan fade + slide kecil saat terbuka */
.accordion-collapse.collapse.show .content-box {
  animation: elemenBoxIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes elemenBoxIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== ISI ACCORDION BODY (tema-aware, bukan gelap paksa) ===== */
.accordion-body {
  background-color: var(--md-sys-color-surface-container-lowest, #f3f6fa) !important;
  border-top: 1px solid var(--md-sys-color-outline-variant) !important;
}
.accordion-body .text-primary {
  color: var(--md-sys-color-primary, #1d4ed8) !important;
  font-weight: 700 !important;
  text-shadow: none;
}
.accordion-body .text-success {
  color: var(--md-sys-color-success, #15803d) !important;
  font-weight: 700 !important;
  text-shadow: none;
}

/* ===== KONTEN ISI (CP & TUJUAN) ===== */
.content-box {
  color: var(--md-sys-color-on-surface, #0f1729) !important;
  background-color: var(--md-sys-color-surface-container-highest, #d2d9e6) !important;
  border: 1px solid var(--md-sys-color-outline-variant) !important;
  font-size: 0.95rem;
  line-height: 1.7;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.accordion-body .content-box {
  color: var(--md-sys-color-on-surface, #0f1729) !important;
}
.pre-text {
  white-space: pre-wrap;
  color: var(--md-sys-color-on-surface, #0f1729) !important;
  background-color: var(--md-sys-color-surface-container-highest, #d2d9e6) !important;
  border: 1px solid var(--md-sys-color-outline-variant) !important;
}

/* Hilangkan outline/focus bawaan Bootstrap */
button:focus,
.accordion-button:focus {
  box-shadow: none !important;
  outline: none !important;
}

/* Border pemisah item */
.accordion-item {
  border-color: var(--md-sys-color-outline-variant) !important;
  background-color: transparent !important;
}

/* Scroll bar halus */
.pre-text::-webkit-scrollbar-thumb,
.content-box::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-outline-variant, #c5ccd8);
  border-radius: 4px;
}

/* Hormati preferensi kurangi-gerakan (aksesibilitas) */
@media (prefers-reduced-motion: reduce) {
  .accordion-collapse.collapsing,
  .accordion-button,
  .accordion-button::after,
  .content-box {
    transition: none !important;
    animation: none !important;
  }
}
</style>
