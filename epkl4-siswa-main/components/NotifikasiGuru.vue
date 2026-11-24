<template>
  <div v-if="role === 'guru'" ref="rootEl" class="notiguru">
    <button
      type="button"
      class="notiguru__btn"
      :class="{ 'notiguru__btn--active': open }"
      aria-label="Notifikasi siswa alfa"
      @click.stop="toggle"
    >
      <i class="bi" :class="belumDibaca ? 'bi-bell-fill' : 'bi-bell'" aria-hidden="true"></i>
      <span v-if="belumDibaca" class="notiguru__badge">{{ badgeLabel }}</span>
    </button>

    <!-- Panel di-teleport ke body + position:fixed agar selalu tampil di atas topbar/drawer -->
    <Teleport to="body">
      <transition name="notiguru-pop">
        <div
          v-if="open"
          ref="panelEl"
          class="notiguru__panel"
          :style="panelStyle"
          role="dialog"
          aria-label="Panel notifikasi alpa"
        >
          <div class="notiguru__head">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>Siswa Alfa</span>
            <button
              v-if="belumDibaca"
              type="button"
              class="notiguru__tandai"
              @click="tandaiSemua"
            >Tandai dibaca</button>
          </div>

          <template v-if="daftar.length">
            <div
              v-for="it in daftar"
              :key="it.id"
              class="notiguru__item"
              :class="{ 'notiguru__item--baru': !it.dibaca }"
              :title="it.dibaca ? 'Sudah dibaca' : 'Klik untuk tandai sudah dibaca'"
              @click="tandai(it)"
            >
              <i class="bi bi-exclamation-octagon-fill" aria-hidden="true"></i>
              <div class="notiguru__item-body">
                <span class="notiguru__item-text">{{ it.pesan }}</span>
                <span class="notiguru__item-waktu">{{ waktuRelatif(it.created) }}</span>
              </div>
            </div>
          </template>

          <p v-else class="notiguru__note">
            <i class="bi bi-check-circle" style="color: var(--md-sys-color-primary, #7cc4ff);"></i>
            Tidak ada notifikasi — tidak ada siswa yang alfa.
          </p>

          <div class="notiguru__foot">
            <button type="button" class="notiguru__ulang" :disabled="memuat" @click="muat(true)">
              <i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Perbarui
            </button>
            <span class="notiguru__foot-note">Notifikasi muncul otomatis saat ada siswa yang alfa (tidak mengisi jurnal sampai pukul 18.00).</span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
// Notifikasi alpa siswa untuk akun GURU PER JURUSAN.
// Sumber data: koleksi `notifikasi` yang diisi otomatis oleh hook
// pb_hooks/epkl_absen_protect.pb.js setiap ada tanda alfa baru pada absen.
const props = defineProps({
  // 'bottom' = dropdown di bawah lonceng (topbar mobile),
  // 'right' = dropdown ke kanan lonceng (sidebar desktop)
  placement: { type: String, default: 'bottom' },
})

const client = usePocketBaseClient()
const user = usePocketBaseUser().user
const role = computed(() => String(user.value?.role || 'siswa'))
const idSaya = computed(() => String(user.value?.id || ''))

const daftar = ref([])
const memuat = ref(false)
const open = ref(false)
const rootEl = ref(null)
const panelEl = ref(null)
const panelStyle = ref({})
const route = useRoute()

const belumDibaca = computed(() => daftar.value.filter(it => !it.dibaca).length)
const badgeLabel = computed(() => (belumDibaca.value > 9 ? '9+' : String(belumDibaca.value)))

async function muat(paksa = false) {
  if (!import.meta.client) return
  if (role.value !== 'guru' || !idSaya.value) return
  if (memuat.value && !paksa) return
  memuat.value = true
  try {
    client.autoCancellation(false)
    const res = await client.collection('notifikasi').getList(1, 30, {
      filter: `penerima = "${idSaya.value}"`,
      sort: '-created',
    })
    daftar.value = res.items || []
  } catch (e) {
    console.warn('[NotifikasiGuru] gagal memuat notifikasi:', e)
  } finally {
    memuat.value = false
  }
}

async function tandai(it) {
  if (it.dibaca) return
  try {
    const res = await client.collection('notifikasi').update(it.id, { dibaca: true })
    const idx = daftar.value.findIndex(x => x.id === it.id)
    if (idx !== -1) daftar.value[idx] = res
  } catch (e) {
    // diam — coba lagi saat perbarui
  }
}

async function tandaiSemua() {
  const belum = daftar.value.filter(it => !it.dibaca)
  for (const it of belum) await tandai(it)
}

// ---- realtime: daftar & badge ikut segar tanpa buka panel ----
let berhenti = null
async function pasangRealtime() {
  if (berhenti) { try { await berhenti() } catch (e) {} berhenti = null }
  if (!import.meta.client) return
  if (role.value !== 'guru' || !idSaya.value) return
  try {
    berhenti = await client.collection('notifikasi').subscribe('*', () => muat(true), {
      filter: `penerima = "${idSaya.value}"`,
    })
  } catch (e) {
    berhenti = null // fallback: panel disegarkan saat dibuka & interval
  }
}

watch(() => [role.value, idSaya.value], () => {
  muat(true)
  pasangRealtime()
})

let interval = null
onMounted(() => {
  muat(true)
  pasangRealtime()
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', onResize)
  interval = setInterval(() => muat(), 120000) // cadangan bila realtime putus
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', onResize)
  if (interval) clearInterval(interval)
  if (berhenti) { try { berhenti() } catch (e) {} berhenti = null }
})

// ---- posisi panel (sama seperti PengingatBell) ----
function posisiPanel() {
  // komponen ini bisa terpasang di dua tempat (topbar mobile + sidebar desktop);
  // satu di antaranya pasti tersembunyi — ukur yang TERLIHAT saja
  let el = rootEl.value
  if (el) {
    const r0 = el.getBoundingClientRect()
    if (r0.width === 0 && r0.height === 0) {
      const semua = document.querySelectorAll('.notiguru')
      for (const b of semua) {
        const rb = b.getBoundingClientRect()
        if (rb.width > 0) { el = b; break }
      }
    }
  }
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
    muat(true) // segarkan setiap panel dibuka
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

watch(() => route.fullPath, () => { open.value = false })

function waktuRelatif(iso) {
  if (!iso) return ''
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const selisih = Date.now() - t
  if (selisih < 60000) return 'baru saja'
  if (selisih < 3600000) return Math.floor(selisih / 60000) + ' mnt lalu'
  if (selisih < 86400000) return Math.floor(selisih / 3600000) + ' jam lalu'
  if (selisih < 7 * 86400000) return Math.floor(selisih / 86400000) + ' hari lalu'
  const d = new Date(t)
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return d.getDate() + ' ' + BULAN[d.getMonth()]
}
</script>

<style scoped>
.notiguru { position: relative; display: inline-flex; }

.notiguru__btn {
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
.notiguru__btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--md-sys-color-on-surface, #e3e2e6); }
.notiguru__btn--active { color: var(--md-sys-color-primary, #7cc4ff); }
.notiguru__btn > i { font-size: 22px; }

.notiguru__badge {
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
.notiguru__panel {
  position: fixed;
  z-index: 3000;
  width: min(320px, calc(100vw - 24px));
  max-height: min(70vh, 460px);
  overflow-y: auto;
  background: var(--md-sys-color-surface-container, #211f26);
  color: var(--md-sys-color-on-surface, #e3e2e6);
  border: 1px solid var(--md-sys-color-outline-variant, #48454e);
  border-radius: var(--md-sys-shape-corner-large, 16px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  padding: 14px;
}

.notiguru__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 10px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, #48454e);
  color: var(--md-sys-color-error, #f2b8b5);
}
.notiguru__tandai {
  margin-left: auto;
  border: 1px solid var(--md-sys-color-outline-variant, #48454e);
  background: transparent;
  color: var(--md-sys-color-on-surface, #e3e2e6);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
}
.notiguru__tandai:hover { background: rgba(255, 255, 255, 0.06); }

.notiguru__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 8px;
  margin: 2px -8px;
  border-radius: 10px;
  cursor: pointer;
}
.notiguru__item:hover { background: rgba(255, 255, 255, 0.05); }
.notiguru__item > i { font-size: 18px; color: var(--md-sys-color-error, #f2b8b5); margin-top: 2px; flex-shrink: 0; }
.notiguru__item--baru { background: rgba(242, 184, 181, 0.08); }
.notiguru__item--baru > i { color: var(--md-sys-color-error, #f2b8b5); }
.notiguru__item:not(.notiguru__item--baru) > i { color: var(--md-sys-color-outline-variant, #48454e); }
.notiguru__item-body { display: flex; flex-direction: column; gap: 4px; }
.notiguru__item-text { font-size: 0.88rem; line-height: 1.35; }
.notiguru__item-waktu { font-size: 0.72rem; color: var(--md-sys-color-on-surface-variant, #c4c6c5); }

.notiguru__note { font-size: 0.88rem; color: var(--md-sys-color-on-surface-variant, #c4c6c5); margin: 10px 2px; display: flex; gap: 8px; align-items: center; }

.notiguru__foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--md-sys-color-outline-variant, #48454e);
}
.notiguru__ulang {
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
.notiguru__ulang:hover { background: rgba(255, 255, 255, 0.06); }
.notiguru__ulang:disabled { opacity: 0.5; cursor: default; }
.notiguru__foot-note { font-size: 0.72rem; color: var(--md-sys-color-on-surface-variant, #c4c6c5); }

/* Animasi pop */
.notiguru-pop-enter-active, .notiguru-pop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.notiguru-pop-enter-from, .notiguru-pop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>
