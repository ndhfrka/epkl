<template>
  <!-- Dropdown bulan & tahun bergaya aplikasi (tema-aware + animasi halus).
       Menggantikan <select> native yang di mobile melempar frame popup
       mentah browser yang muncul tiba-tiba. -->
  <div ref="akar" class="fbt d-flex gap-2">
    <!-- ===== BULAN ===== -->
    <div class="fbt-wrap">
      <button type="button" class="fbt-btn" :class="{ 'fbt-btn--terbuka': terbuka === 'bulan' }"
        :aria-expanded="terbuka === 'bulan'" aria-label="Filter bulan" @click.stop="ganti('bulan')">
        <span class="fbt-teks">{{ teksBulan }}</span>
        <i class="bi bi-chevron-down fbt-panah" :class="{ 'fbt-panah--putar': terbuka === 'bulan' }"></i>
      </button>
      <transition name="fbt-anim">
        <div v-if="terbuka === 'bulan'" class="fbt-panel" role="listbox" aria-label="Daftar bulan">
          <button v-for="o in opsiBulan" :key="o.v" type="button" role="option"
            class="fbt-opsi" :class="{ 'fbt-opsi--aktif': bulan === o.v }"
            :aria-selected="bulan === o.v" @click.stop="pilihBulan(o.v)">
            <span>{{ o.label }}</span>
            <i v-if="bulan === o.v" class="bi bi-check2"></i>
          </button>
        </div>
      </transition>
    </div>

    <!-- ===== TAHUN ===== -->
    <div class="fbt-wrap">
      <button type="button" class="fbt-btn" :class="{ 'fbt-btn--terbuka': terbuka === 'tahun' }"
        :aria-expanded="terbuka === 'tahun'" aria-label="Filter tahun" @click.stop="ganti('tahun')">
        <span class="fbt-teks">{{ teksTahun }}</span>
        <i class="bi bi-chevron-down fbt-panah" :class="{ 'fbt-panah--putar': terbuka === 'tahun' }"></i>
      </button>
      <transition name="fbt-anim">
        <div v-if="terbuka === 'tahun'" class="fbt-panel" role="listbox" aria-label="Daftar tahun">
          <button v-for="o in opsiTahun" :key="o.v" type="button" role="option"
            class="fbt-opsi" :class="{ 'fbt-opsi--aktif': tahun === o.v }"
            :aria-selected="tahun === o.v" @click.stop="pilihTahun(o.v)">
            <span>{{ o.label }}</span>
            <i v-if="tahun === o.v" class="bi bi-check2"></i>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  bulan: { type: Number, default: 0 },
  tahun: { type: Number, default: 0 },
  bulanList: { type: Array, default: () => [] },
  tahunList: { type: Array, default: () => [] },
  izinkanSemua: { type: Boolean, default: false },
})
const emit = defineEmits(['update:bulan', 'update:tahun'])

const akar = ref(null)
const terbuka = ref(null)

const opsiBulan = computed(() => {
  const daftar = props.bulanList.map((b, i) => ({ v: i + 1, label: b }))
  return props.izinkanSemua ? [{ v: 0, label: 'Semua Bulan' }, ...daftar] : daftar
})
const opsiTahun = computed(() => props.tahunList.map(t => ({ v: t, label: String(t) })))

const teksBulan = computed(() => opsiBulan.value.find(o => o.v === props.bulan)?.label || 'Bulan')
const teksTahun = computed(() => String(props.tahun || 'Tahun'))

function ganti(k) { terbuka.value = terbuka.value === k ? null : k }
function pilihBulan(v) { emit('update:bulan', v); terbuka.value = null }
function pilihTahun(v) { emit('update:tahun', v); terbuka.value = null }

function tutupLuar(e) { if (akar.value && !akar.value.contains(e.target)) terbuka.value = null }
function tutupEsc(e) { if (e.key === 'Escape') terbuka.value = null }
onMounted(() => {
  document.addEventListener('click', tutupLuar)
  document.addEventListener('keydown', tutupEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', tutupLuar)
  document.removeEventListener('keydown', tutupEsc)
})
</script>

<style scoped>
.fbt-wrap { position: relative; }

/* ===== tombol pemicu ===== */
.fbt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  min-width: 112px;
  padding: 0.4rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface, #0f1729);
  background-color: var(--md-sys-color-surface-container-low, #f3f6fa);
  border: 1px solid var(--md-sys-color-outline-variant, rgba(100, 116, 139, 0.4));
  border-radius: 12px;
  transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.fbt-btn:hover { background-color: var(--md-sys-color-surface-container, #e8edf5); }
.fbt-btn:active { transform: scale(0.97); }
.fbt-btn--terbuka {
  background-color: var(--md-sys-color-surface-container-high, #e2e8f2);
  border-color: var(--md-sys-color-primary, #1d4ed8);
}
.fbt-panah { font-size: 0.68rem; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.fbt-panah--putar { transform: rotate(180deg); }

/* ===== panel daftar opsi ===== */
.fbt-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1055;
  min-width: 100%;
  max-height: 258px;
  overflow-y: auto;
  padding: 0.35rem;
  background-color: var(--md-sys-color-surface-container-lowest, #ffffff);
  border: 1px solid var(--md-sys-color-outline-variant, rgba(100, 116, 139, 0.35));
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 41, 0.2);
}
.fbt-opsi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.65rem;
  border: 0;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface, #0f1729);
  background: transparent;
  transition: background-color 0.2s ease, color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.fbt-opsi:hover { background-color: var(--md-sys-color-surface-container-high, #e2e8f2); }
.fbt-opsi--aktif {
  background-color: var(--md-sys-color-surface-container-high, #e2e8f2);
  color: var(--md-sys-color-primary, #1d4ed8);
  font-weight: 700;
}
.fbt-opsi--aktif i { color: var(--md-sys-color-primary, #1d4ed8); }

/* ===== animasi muncul/hilang yang halus ===== */
.fbt-anim-enter-active { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.fbt-anim-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.fbt-anim-enter-from { opacity: 0; transform: translateY(-6px) scale(0.97); }
.fbt-anim-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>
