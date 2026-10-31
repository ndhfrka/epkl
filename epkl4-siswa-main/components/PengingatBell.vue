<template>
  <div v-if="role === 'siswa'" ref="rootEl" class="pengingat">
    <button
      type="button"
      class="pengingat__btn"
      :class="{ 'pengingat__btn--active': open }"
      aria-label="Pengingat absen dan jurnal"
      @click.stop="toggle"
    >
      <i class="bi" :class="items.length ? 'bi-bell-fill' : 'bi-bell'" aria-hidden="true"></i>
      <span v-if="items.length" class="pengingat__badge">{{ items.length }}</span>
    </button>

    <!-- Panel di-teleport ke body + position:fixed agar selalu tampil di atas topbar/drawer -->
    <Teleport to="body">
      <transition name="pengingat-pop">
        <div
          v-if="open"
          ref="panelEl"
          class="pengingat__panel"
          :style="panelStyle"
          role="dialog"
          aria-label="Panel pengingat"
        >
          <div class="pengingat__head">
            <i class="bi bi-alarm" aria-hidden="true"></i>
            <span>Pengingat Harian</span>
          </div>

          <p v-if="memeriksa" class="pengingat__note">Memeriksa data terbaru…</p>

          <template v-else-if="items.length">
            <div v-for="it in items" :key="it.id" class="pengingat__item">
              <i :class="`bi ${it.icon}`" aria-hidden="true"></i>
              <div class="pengingat__item-body">
                <span class="pengingat__item-text">{{ it.text }}</span>
                <nuxt-link :to="it.to" class="pengingat__aksi" @click="open = false">
                  Isi sekarang <i class="bi bi-arrow-right"></i>
                </nuxt-link>
              </div>
            </div>
          </template>

          <p v-else class="pengingat__note">
            <i class="bi bi-check-circle" style="color: var(--md-sys-color-primary, #7cc4ff);"></i>
            Tidak ada pengingat — absen & jurnal hari ini sudah terisi.
          </p>

          <div class="pengingat__foot">
            <button type="button" class="pengingat__ulang" :disabled="memeriksa" @click="cekPengingat(true)">
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Periksa ulang
            </button>
            <span class="pengingat__foot-note">Notifikasi otomatis muncul setelah pukul {{ jamLabel }} jika belum diisi</span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  // 'bottom' = dropdown di bawah lonceng (topbar mobile),
  // 'right' = dropdown ke kanan lonceng (sidebar desktop)
  placement: { type: String, default: 'bottom' },
})

const { items, memeriksa, cekPengingat, role, jamPengingatEfektif } = usePengingat()

const open = ref(false)
const rootEl = ref(null)
const panelEl = ref(null)
const panelStyle = ref({})
const route = useRoute()
// jam pengingat efektif (bisa di-override via localStorage 'epkl_jam_pengingat' untuk uji)
const jamLabel = computed(() => `${String(jamPengingatEfektif.value).padStart(2, '0')}.00`)

// hitung posisi panel dari posisi tombol lonceng di layar
function posisiPanel() {
  const el = rootEl.value
  if (!el || !import.meta.client) return
  const r = el.getBoundingClientRect()
  const vw = window.innerWidth
  const width = Math.min(320, vw - 24)
  if (props.placement === 'right') {
    let left = r.right + 10
    if (left + width > vw - 8) left = r.left - width - 10 // balik ke kiri jika tak muat
    left = Math.max(8, Math.min(left, vw - width - 8))
    panelStyle.value = { left: `${left}px`, top: `${Math.max(8, r.top)}px`, width: `${width}px` }
  } else {
    const right = Math.max(12, vw - r.right)
    panelStyle.value = { top: `${r.bottom + 8}px`, right: `${right}px`, width: `${width}px` }
  }
}

async function toggle() {
  open.value = !open.value
  if (open.value) {
    posisiPanel()
    cekPengingat(true) // paksa periksa setiap panel dibuka, apa pun jamnya
  }
}

function onDocClick(e) {
  if (!open.value) return
  const t = e.target
  if (rootEl.value?.contains(t)) return
  if (panelEl.value?.contains(t)) return
  open.value = false
}
function onResize() {
  if (open.value) open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', onResize)
})

watch(() => route.fullPath, () => { open.value = false })
</script>

<style scoped>
.pengingat { position: relative; display: inline-flex; }

.pengingat__btn {
  position: relative;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--md-sys-shape-corner-full, 999px);
  color: var(--md-sys-color-on-surface-variant, #c4c6c5);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.pengingat__btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--md-sys-color-on-surface, #e3e2e6); }
.pengingat__btn--active { color: var(--md-sys-color-primary, #7cc4ff); }
.pengingat__btn > i { font-size: 22px; }

.pengingat__badge {
  position: absolute;
  top: 5px;
  right: 5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--md-sys-color-error, #f2b8b5);
  color: #601410;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--md-sys-color-surface-container-high, #211f26);
  box-sizing: content-box;
  pointer-events: none;
}

/* Panel dropdown — fixed di level dokumen (di-teleport ke body) */
.pengingat__panel {
  position: fixed;
  z-index: 3000;
  width: min(320px, calc(100vw - 24px));
  background: var(--md-sys-color-surface-container, #211f26);
  color: var(--md-sys-color-on-surface, #e3e2e6);
  border: 1px solid var(--md-sys-color-outline-variant, #48454e);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  padding: 14px;
}

.pengingat__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #48454e);
  color: var(--md-sys-color-primary, #7cc4ff);
}

.pengingat__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 2px;
}
.pengingat__item > i { font-size: 20px; color: var(--md-sys-color-error, #f2b8b5); margin-top: 2px; }
.pengingat__item-body { display: flex; flex-direction: column; gap: 4px; }
.pengingat__item-text { font-size: 0.9rem; line-height: 1.35; }

.pengingat__aksi {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--md-sys-color-primary, #7cc4ff);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.pengingat__aksi:hover { text-decoration: underline; }

.pengingat__note { font-size: 0.88rem; color: var(--md-sys-color-on-surface-variant, #c4c6c5); margin: 10px 2px; }

.pengingat__foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #48454e);
}
.pengingat__ulang {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--md-sys-color-outline-variant, #48454e);
  background: transparent;
  color: var(--md-sys-color-on-surface, #e3e2e6);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.pengingat__ulang:hover { background: rgba(255, 255, 255, 0.06); }
.pengingat__ulang:disabled { opacity: 0.5; cursor: default; }
.pengingat__foot-note { font-size: 0.72rem; color: var(--md-sys-color-on-surface-variant, #c4c6c5); }

/* Animasi pop */
.pengingat-pop-enter-active, .pengingat-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.pengingat-pop-enter-from, .pengingat-pop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
