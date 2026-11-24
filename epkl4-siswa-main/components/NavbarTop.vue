<template>
  <header
    class="m3-topappbar modern-topbar m3-state"
    :class="[
      `m3-topappbar--${size}`,
      { 'm3-topappbar--scrolled': isScrolled },
      { 'm3-topappbar--mobile-only': mobileOnly },
    ]"
    id="m3TopAppBar"
    role="banner"
  >
    <div class="m3-topappbar__row">
      <!-- Leading action (Glass hamburger button) -->
      <button
        class="m3-topappbar__leading glass-btn-leading"
        type="button"
        :aria-label="leadingLabel"
        @click="$emit('leading-click')"
      >
        <i :class="`bi ${leadingIcon}`" aria-hidden="true"></i>
      </button>

      <!-- Title / Brand Area -->
      <div class="m3-topappbar__headline">
        <slot name="title">
          <div class="d-flex align-items-center gap-2">
            <span class="topbar-brand-badge">
              <span class="brand-glow-dot"></span>
              e-PKL
            </span>
            <span class="m3-topappbar__title">{{ effectiveTitle }}</span>
          </div>
          <span class="m3-topappbar__subtitle">
            <i class="bi bi-building me-1"></i>SMK AL-FATAH BANJARNEGARA
          </span>
        </slot>
      </div>

      <!-- Spacer -->
      <div class="m3-topappbar__spacer"></div>

      <!-- Trailing actions (Cukup tombol notifikasi) -->
      <div class="m3-topappbar__actions" aria-label="Aksi">
        <slot name="actions">
          <!-- [FITUR TEMA] Tombol mode gelap/terang — berdampingan dengan tombol notifikasi -->
          <div class="topbar-action-item">
            <TombolTema />
          </div>
          <!-- Lonceng pengingat absen & jurnal -->
          <div class="topbar-action-item">
            <PengingatBell v-if="showNotifications" placement="bottom" />
          </div>
          <!-- Lonceng notifikasi siswa alfa (guru per jurusan) -->
          <div class="topbar-action-item">
            <NotifikasiGuru placement="bottom" />
          </div>
        </slot>
      </div>
    </div>

    <!-- Bottom divider for non-scrolled variant (optional, subtle) -->
    <div
      v-if="size === 'small' && showDivider"
      class="m3-topappbar__divider"
      aria-hidden="true"
    ></div>
  </header>
</template>

<script setup>
const props = defineProps({
  size: { type: String, default: 'small', validator: (v) => ['small', 'medium', 'large'].includes(v) },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  leadingIcon: { type: String, default: 'bi-list' },
  leadingLabel: { type: String, default: 'Buka menu' },
  showNotifications: { type: Boolean, default: true },
  showAccount: { type: Boolean, default: false },
  showDivider: { type: Boolean, default: true },
  mobileOnly: { type: Boolean, default: true },
})

const emit = defineEmits(['leading-click', 'action-account', 'scrolled'])

const route = useRoute()
const user = usePocketBaseUser()
const client = usePocketBaseClient()

const routeTitleMap = computed(() => {
  const path = route.path
  if (path === '/' || path.startsWith('/home')) return 'Beranda'
  if (path.startsWith('/jurnal')) return 'Jurnal PKL'
  if (path.startsWith('/nilai')) return 'Nilai PKL'
  if (path.startsWith('/proyek')) return 'Absen & Proyek'
  if (path.startsWith('/iduka')) return 'IDUKA'
  if (path.startsWith('/elemen')) return 'Elemen CP'
  if (path.startsWith('/ubah-password')) return 'Keamanan'
  if (path.startsWith('/location')) return 'Lokasi PKL'
  if (path.startsWith('/profil')) return 'Profil'
  if (path.startsWith('/agenda')) return 'Agenda'
  if (path.startsWith('/ttd')) return 'Tanda Tangan'
  return ''
})

const effectiveTitle = computed(() => {
  if (props.title) return props.title
  if (routeTitleMap.value) return routeTitleMap.value
  const u = user?.user.value
  let nama = u?.nama || u?.name || ''
  if (!nama && u?.expand?.siswa?.nama) nama = u.expand.siswa.nama
  if (!nama && u?.expand?.guru?.nama) nama = u.expand.guru.nama
  if (!nama && u?.expand?.pembimbing?.nama) nama = u.expand.pembimbing.nama
  if (!nama && u?.expand?.instansi?.nama) nama = u.expand.instansi.nama
  return nama ? `Hai, ${nama.split(' ')[0]} 👋` : 'e-PKL'
})

const avatarError = ref(false)

function buildFileUrl(collection, recordId, filename, updated) {
  // field file PocketBase berbentuk array — kosong = [] yang dianggap truthy
  const name = Array.isArray(filename) ? filename[0] : filename
  if (!recordId || !name) return ''
  const cacheKey = updated ? encodeURIComponent(updated) : Date.now()
  return `${client.baseUrl}/api/files/${collection}/${recordId}/${name}?t=${cacheKey}`
}

const avatarUrl = computed(() => {
  const u = user?.user.value
  if (!u) return ''
  if (u.foto) {
    const role = u.role || 'siswa'
    const col = role === 'guru' ? 'teacher_users' : role === 'instansi' ? 'teacher_users' : 'student_users'
    const url = buildFileUrl(col, u.id, u.foto, u.updated)
    if (url) return url
  }
  const expSiswa = u.expand?.siswa
  if (expSiswa?.foto) return buildFileUrl('siswa', expSiswa.id, expSiswa.foto, expSiswa.updated)
  const expGuru = u.expand?.guru || u.expand?.pembimbing
  if (expGuru?.foto) {
    const col = expGuru.collectionName || 'pembimbing'
    return buildFileUrl(col, expGuru.id, expGuru.foto, expGuru.updated)
  }
  const expInstansi = u.expand?.instansi || u.expand?.akun_instansi
  if (expInstansi?.foto) return buildFileUrl('akun_instansi', expInstansi.id, expInstansi.foto, expInstansi.updated)
  return ''
})

const siswaId = computed(() => user?.user.value?.siswa || '')
const guruId = computed(() => user?.user.value?.guru || user?.user.value?.pembimbing || '')
const instansiId = computed(() => user?.user.value?.instansi || user?.user.value?.akun_instansi || '')
const role = computed(() => user?.user.value?.role || 'siswa')
const resolvedAvatar = ref('')

async function fetchRelationForAvatar() {
  const u = user?.user.value
  if (!u) return
  if (avatarUrl.value || resolvedAvatar.value) return
  try {
    if (siswaId.value && !u.expand?.siswa) {
      const rec = await client.collection('siswa').getOne(siswaId.value, { $autoCancel: false })
      if (rec?.foto) resolvedAvatar.value = buildFileUrl('siswa', rec.id, rec.foto, rec.updated)
      return
    }
    if (role.value === 'guru' && guruId.value && !(u.expand?.guru || u.expand?.pembimbing)) {
      let rec = null
      for (const col of ['pembimbing', 'guru', 'teacher_users']) {
        try { rec = await client.collection(col).getOne(guruId.value, { $autoCancel: false }); if (rec) break } catch (_) {}
      }
      if (rec?.foto) {
        const col = rec.collectionName || 'pembimbing'
        resolvedAvatar.value = buildFileUrl(col, rec.id, rec.foto, rec.updated)
      }
      return
    }
    if (role.value === 'instansi' && instansiId.value && !(u.expand?.instansi || u.expand?.akun_instansi)) {
      let rec = null
      for (const col of ['akun_instansi', 'instansi', 'iduka', 'dudi']) {
        try { rec = await client.collection(col).getOne(instansiId.value, { $autoCancel: false }); if (rec) break } catch (_) {}
      }
      if (rec?.foto) {
        const col = rec.collectionName || 'akun_instansi'
        resolvedAvatar.value = buildFileUrl(col, rec.id, rec.foto, rec.updated)
      }
    }
  } catch (_) { resolvedAvatar.value = '' }
}

onMounted(() => nextTick(fetchRelationForAvatar))
watch(
  () => [user?.user.value?.id, avatarUrl.value],
  ([uid]) => {
    if (!uid) { resolvedAvatar.value = ''; return }
    resolvedAvatar.value = ''
    nextTick(fetchRelationForAvatar)
  }
)

/* Scroll-behaviour: Small Top App Bar elevation 0→2 on scroll */
const isScrolled = ref(false)

function onScroll() {
  const target = document.documentElement || document.body
  const v = target.scrollTop > 4
  if (v !== isScrolled.value) {
    isScrolled.value = v
    emit('scrolled', v)
  }
}
function attach() {
  if (typeof window === 'undefined') return
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
function detach() {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
}

onMounted(() => nextTick(attach))
onBeforeUnmount(detach)
</script>

<style scoped>
.m3-topappbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  background: rgba(11, 18, 33, 0.85) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s ease;
}
.m3-topappbar--scrolled {
  background: rgba(11, 18, 33, 0.95) !important;
  border-bottom-color: rgba(59, 130, 246, 0.25) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55) !important;
}

.m3-topappbar__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 calc(8px + var(--m3-safe-left, 0px));
  min-height: 64px;
  height: calc(64px + var(--m3-safe-top, 0px));
  padding-top: var(--m3-safe-top, 0px);
}

/* Small variant */
.m3-topappbar--small .m3-topappbar__row { min-height: 64px; height: calc(64px + var(--m3-safe-top, 0px)); }
.m3-topappbar--medium .m3-topappbar__row { min-height: 112px; height: calc(112px + var(--m3-safe-top, 0px)); align-items: flex-end; padding-bottom: 12px; }
.m3-topappbar--large .m3-topappbar__row { min-height: 152px; height: calc(152px + var(--m3-safe-top, 0px)); align-items: flex-end; padding-bottom: 12px; }

.glass-btn-leading {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.glass-btn-leading:hover {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(59, 130, 246, 0.35);
  color: #60a5fa;
  transform: scale(1.05);
}

.glass-btn-leading > i {
  font-size: 1.3rem;
}

.topbar-brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%);
  border: 1px solid rgba(59, 130, 246, 0.35);
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #60a5fa;
  letter-spacing: 0.02em;
}

.brand-glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
  display: inline-block;
}

.m3-topappbar__leading,
.m3-topappbar__action {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.m3-topappbar__leading:hover,
.m3-topappbar__action:hover {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.12);
}

.topbar-avatar-btn {
  background: transparent;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.m3-topappbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.45);
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}
.m3-topappbar__avatar:hover {
  transform: scale(1.08);
}

.avatar-fallback-top {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  border: 2px solid #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.45);
}

.m3-topappbar__headline {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 0 8px;
  min-width: 0;
  overflow: hidden;
}
.m3-topappbar--medium .m3-topappbar__headline,
.m3-topappbar--large .m3-topappbar__headline { justify-content: flex-end; }
.m3-topappbar__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.m3-topappbar--medium .m3-topappbar__title,
.m3-topappbar--large .m3-topappbar__title {
  font-size: 1.3rem;
  white-space: normal;
  line-height: 32px;
}
.m3-topappbar__subtitle {
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m3-topappbar__spacer { display: none; }

.m3-topappbar__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: var(--m3-safe-right, 0px);
}
.m3-topappbar__action { position: relative; }

.m3-topappbar__divider {
  display: none;
}

/* Mobile-only */
@media (min-width: 992px) {
  .m3-topappbar--mobile-only { display: none !important; }
}

/* IconBtn helper (small screen) */
@media (max-width: 420px) {
  .m3-topappbar__title { font-size: 20px; }
  .m3-topappbar__row { min-height: 60px; height: calc(60px + var(--m3-safe-top, 0px)); }
}
</style>
