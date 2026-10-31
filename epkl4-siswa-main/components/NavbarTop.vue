<template>
  <header
    class="m3-topappbar m3-state"
    :class="[
      `m3-topappbar--${size}`,
      { 'm3-topappbar--scrolled': isScrolled },
      { 'm3-topappbar--mobile-only': mobileOnly },
    ]"
    id="m3TopAppBar"
    role="banner"
  >
    <div class="m3-topappbar__row">
      <!-- Leading action -->
      <button
        class="m3-topappbar__leading m3-icon-btn m3-state"
        type="button"
        :aria-label="leadingLabel"
        @click="$emit('leading-click')"
      >
        <i :class="`bi ${leadingIcon}`" aria-hidden="true"></i>
      </button>

      <!-- Title -->
      <div class="m3-topappbar__headline">
        <slot name="title">
          <span class="m3-topappbar__title">{{ effectiveTitle }}</span>
          <span v-if="subtitle" class="m3-topappbar__subtitle">{{ subtitle }}</span>
        </slot>
      </div>

      <!-- Spacer (small) / flexible spacer (medium/large) -->
      <div class="m3-topappbar__spacer"></div>

      <!-- Trailing actions (max 3 recommended M3) -->
      <div class="m3-topappbar__actions" aria-label="Aksi">
        <!-- Custom actions slot: use <template #actions> -->
        <slot name="actions">
          <!-- Lonceng pengingat absen & jurnal (muncul otomatis ≥ 16.00 jika belum diisi) -->
          <PengingatBell v-if="showNotifications" placement="bottom" />

          <button
            v-if="showAccount"
            type="button"
            class="m3-icon-btn m3-state m3-topappbar__action"
            aria-label="Akun"
            @click="$emit('action-account')"
          >
            <img
              v-if="avatarUrl || resolvedAvatar"
              :src="avatarUrl || resolvedAvatar"
              alt="avatar"
              class="m3-topappbar__avatar"
              loading="lazy"
              @error="avatarError = true"
            />
            <i v-else class="bi bi-person-circle" aria-hidden="true"></i>
          </button>
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
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
  /* Default elevation 0 (flat when at top) */
  box-shadow: var(--m3-elevation-level-0);
}
.m3-topappbar--scrolled {
  box-shadow: var(--m3-elevation-level-2);
  background-color: var(--md-sys-color-surface-container-highest);
}

.m3-topappbar__row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px 0 calc(4px + var(--m3-safe-left, 0px));
  min-height: 64px;
  height: calc(64px + var(--m3-safe-top, 0px));
  padding-top: var(--m3-safe-top, 0px);
}

/* Small variant */
.m3-topappbar--small .m3-topappbar__row { min-height: 64px; height: calc(64px + var(--m3-safe-top, 0px)); }
.m3-topappbar--medium .m3-topappbar__row { min-height: 112px; height: calc(112px + var(--m3-safe-top, 0px)); align-items: flex-end; padding-bottom: 12px; }
.m3-topappbar--large .m3-topappbar__row { min-height: 152px; height: calc(152px + var(--m3-safe-top, 0px)); align-items: flex-end; padding-bottom: 12px; }

.m3-topappbar__leading,
.m3-topappbar__action {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-surface-variant);
  border: none;
  background: transparent;
  border-radius: var(--md-sys-shape-corner-full);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  flex-shrink: 0;
  transition: color 0.15s ease, background-color 0.15s ease;
}
.m3-topappbar__leading:hover,
.m3-topappbar__action:hover { color: var(--md-sys-color-on-surface); }
.m3-topappbar__leading::before,
.m3-topappbar__action::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
}
.m3-topappbar__leading:hover::before,
.m3-topappbar__action:hover::before { opacity: 0.08; }
.m3-topappbar__leading:focus-visible,
.m3-topappbar__action:focus-visible { outline: none; }
.m3-topappbar__leading:focus-visible::before,
.m3-topappbar__action:focus-visible::before { opacity: 0.12; }
.m3-topappbar__leading:active::before,
.m3-topappbar__action:active::before { opacity: 0.10; }
.m3-topappbar__leading > i,
.m3-topappbar__action > i {
  font-size: 24px;
  position: relative;
  z-index: 1;
}
.m3-topappbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  object-fit: cover;
  border: 1px solid var(--md-sys-color-outline-variant);
  position: relative;
  z-index: 1;
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
  font: var(--md-sys-typescale-title-large-font);
  letter-spacing: 0px;
  color: var(--md-sys-color-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.m3-topappbar--medium .m3-topappbar__title,
.m3-topappbar--large .m3-topappbar__title {
  font: var(--md-sys-typescale-headline-small-font);
  white-space: normal;
  line-height: 36px;
}
.m3-topappbar__subtitle {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m3-topappbar__spacer { display: none; }

.m3-topappbar__actions {
  display: inline-flex;
  align-items: center;
  gap: 0px;
  padding-right: var(--m3-safe-right, 0px);
}
.m3-topappbar__action { position: relative; }

.m3-topappbar__divider {
  height: 1px;
  background: var(--md-sys-color-outline-variant);
  margin: 0 0 0;
  opacity: 0.5;
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
