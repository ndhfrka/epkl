<template>
  <div v-if="open" class="m3-drawer m3-state" @click.self="emitClose" role="dialog" aria-modal="true">
    <!-- Scrim backdrop -->
    <transition name="fade">
      <div v-if="open" class="m3-drawer__scrim" @click="emitClose"></div>
    </transition>

    <!-- Drawer panel -->
    <transition name="slide">
      <aside v-if="open" class="m3-drawer__panel" :class="{ 'm3-drawer__panel--wide': wide }">
        <!-- Drag-to-close handle -->
        <div class="m3-drawer__handle" aria-hidden="true"></div>

        <!-- Header (foto + nama) -->
        <header class="m3-drawer__header">
          <div class="m3-drawer__brand">
            <span class="lexend-mega">e-PKL<span class="m3-drawer__dot">.</span></span>
            <span class="m3-drawer__brand-sub m3-label-small">Siswa</span>
          </div>

          <div v-if="user?.user.value" class="m3-drawer__account">
            <div class="m3-drawer__avatar">
              <img
                v-if="resolvedAvatar"
                :src="resolvedAvatar"
                :alt="displayName"
                class="m3-drawer__avatar-img"
                loading="lazy"
                @error="avatarError = true"
              />
              <i v-else class="bi bi-person-circle m3-drawer__avatar-icon"></i>
            </div>
            <div class="m3-drawer__account-info">
              <div class="m3-title-small m3-drawer__name">{{ displayName }}</div>
              <div class="m3-label-small m3-drawer__role">
                {{ roleLabel }}{{ user.user.value.username ? ` • @${user.user.value.username}` : '' }}
              </div>
            </div>
          </div>
        </header>

        <!-- Divider -->
        <div class="m3-drawer__divider"></div>

        <!-- Destinations (scrollable) -->
        <nav class="m3-drawer__nav" aria-label="Menu">
          <template v-for="group in destinationGroups" :key="group.label">
            <div v-if="group.label" class="m3-drawer__group-label">{{ group.label }}</div>
            <nuxt-link
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              class="m3-drawer__item m3-state"
              active-class="m3-drawer__item--active"
              :class="{ 'm3-drawer__item--danger': item.danger }"
              :exact="item.exact ?? true"
              @click="onItemClick(item)"
            >
              <i :class="`bi ${item.icon} m3-drawer__item-icon`" aria-hidden="true"></i>
              <span class="m3-drawer__item-label">{{ item.label }}</span>
              <span v-if="item.badge && item.badge > 0" class="m3-badge m3-drawer__item-badge">
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            </nuxt-link>
          </template>
          <div class="m3-drawer__nav-bottom"></div>
        </nav>

        <!-- Footer version -->
        <footer class="m3-drawer__footer">
          <div class="m3-drawer__footer-links m3-body-small">
            <nuxt-link class="m3-link" to="/privacy">Privacy</nuxt-link>
            <span class="m3-drawer__footer-sep">·</span>
            <nuxt-link class="m3-link" to="/terms">Terms</nuxt-link>
          </div>
          <div class="m3-label-small m3-text-muted m3-drawer__footer-version">
            <i class="bi bi-info-circle"></i>
            <span>e-PKL v{{ version }}</span>
          </div>
        </footer>
      </aside>
    </transition>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  countUnread: { type: Number, default: 0 },
  countDraft: { type: Number, default: 0 },
  wide: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'close', 'navigate'])

function emitClose() { emit('update:open', false); emit('close') }
function onItemClick(item) {
  emit('navigate', item)
  setTimeout(() => emitClose(), 150)
}

const user = usePocketBaseUser()
const client = usePocketBaseClient()
const config = useRuntimeConfig()
const version = config.public.appVersion || '3.0'

const avatarError = ref(false)

const role = computed(() => user?.user.value?.role || 'siswa')
const isInstansi = computed(() => role.value === 'instansi')
const isGuru = computed(() => role.value === 'guru')
const roleLabel = computed(() => {
  if (isGuru.value) return 'Guru Pembimbing'
  if (isInstansi.value) return 'Instansi / IDUKA'
  return 'Siswa PKL'
})

const displayName = computed(() => {
  const u = user?.user.value
  if (!u) return ''
  if (resolvedName.value) return resolvedName.value
  const nama = u.nama || u.name || ''
  if (nama) return nama
  const expSiswa = u.expand?.siswa
  if (expSiswa?.nama) return expSiswa.nama
  const expGuru = u.expand?.guru || u.expand?.pembimbing
  if (expGuru?.nama) return expGuru.nama
  const expInstansi = u.expand?.instansi || u.expand?.akun_instansi
  if (expInstansi?.nama) return expInstansi.nama
  return u.username || ''
})

const siswaId = computed(() => user?.user.value?.siswa || '')
const guruId = computed(() => user?.user.value?.guru || user?.user.value?.pembimbing || '')
const instansiId = computed(() => user?.user.value?.instansi || user?.user.value?.akun_instansi || '')

const resolvedAvatar = ref('')
const resolvedName = ref('')
const fetchedRelation = ref(null)

function buildFileUrl(collection, recordId, filename, updated) {
  // field file PocketBase berbentuk array — kosong = [] yang dianggap truthy
  const name = Array.isArray(filename) ? filename[0] : filename
  if (!recordId || !name) return ''
  const cacheKey = updated ? encodeURIComponent(updated) : Date.now()
  return `${client.baseUrl}/api/files/${collection}/${recordId}/${name}?t=${cacheKey}`
}

function extractRelationName(rec) {
  if (!rec) return ''
  return rec.nama || rec.name || rec.nama_lengkap || rec.fullname || ''
}

function resolveAvatarFromUser() {
  avatarError.value = false
  resolvedName.value = ''
  const u = user?.user.value
  if (!u) { resolvedAvatar.value = ''; return }

  if (u.foto) {
    const col = isGuru.value ? 'teacher_users' : isInstansi.value ? 'teacher_users' : 'student_users'
    const url = buildFileUrl(col, u.id, u.foto, u.updated)
    if (url) { resolvedAvatar.value = url; return }
  }

  const expSiswa = u.expand?.siswa
  if (expSiswa) {
    if (expSiswa.foto) resolvedAvatar.value = buildFileUrl('siswa', expSiswa.id, expSiswa.foto, expSiswa.updated)
    const nm = extractRelationName(expSiswa); if (nm) resolvedName.value = nm
    if (resolvedAvatar.value) return
  }
  const expGuru = u.expand?.guru || u.expand?.pembimbing
  if (expGuru) {
    if (expGuru.foto) {
      const colName = expGuru.collectionName || 'pembimbing'
      resolvedAvatar.value = buildFileUrl(colName, expGuru.id, expGuru.foto, expGuru.updated)
    }
    const nm = extractRelationName(expGuru); if (nm) resolvedName.value = nm
    if (resolvedAvatar.value) return
  }
  const expInstansi = u.expand?.instansi || u.expand?.akun_instansi
  if (expInstansi) {
    if (expInstansi.foto) resolvedAvatar.value = buildFileUrl('akun_instansi', expInstansi.id, expInstansi.foto, expInstansi.updated)
    const nm = extractRelationName(expInstansi); if (nm) resolvedName.value = nm
    if (resolvedAvatar.value) return
  }
  resolvedAvatar.value = ''
}

async function fetchRelationForFoto() {
  const u = user?.user.value
  if (!u) return

  try {
    if (siswaId.value && !u.expand?.siswa) {
      const rec = await client.collection('siswa').getOne(siswaId.value, { $autoCancel: false })
      if (rec) {
        fetchedRelation.value = { type: 'siswa', data: rec }
        if (rec.foto) resolvedAvatar.value = buildFileUrl('siswa', rec.id, rec.foto, rec.updated)
        const nm = extractRelationName(rec); if (nm && !resolvedName.value) resolvedName.value = nm
      }
      return
    }
    if (isGuru.value && guruId.value && !(u.expand?.guru || u.expand?.pembimbing)) {
      let rec = null
      for (const col of ['pembimbing', 'guru', 'teacher_users']) {
        try { rec = await client.collection(col).getOne(guruId.value, { $autoCancel: false }); if (rec) break } catch (_) { /* noop */ }
      }
      if (rec) {
        fetchedRelation.value = { type: 'guru', data: rec }
        if (rec.foto) {
          const colName = rec.collectionName || 'pembimbing'
          resolvedAvatar.value = buildFileUrl(colName, rec.id, rec.foto, rec.updated)
        }
        const nm = extractRelationName(rec); if (nm && !resolvedName.value) resolvedName.value = nm
      }
      return
    }
    if (isInstansi.value && instansiId.value && !(u.expand?.instansi || u.expand?.akun_instansi)) {
      let rec = null
      for (const col of ['akun_instansi', 'instansi', 'iduka', 'dudi']) {
        try { rec = await client.collection(col).getOne(instansiId.value, { $autoCancel: false }); if (rec) break } catch (_) { /* noop */ }
      }
      if (rec) {
        fetchedRelation.value = { type: 'instansi', data: rec }
        if (rec.foto) {
          const colName = rec.collectionName || 'akun_instansi'
          resolvedAvatar.value = buildFileUrl(colName, rec.id, rec.foto, rec.updated)
        }
        const nm = extractRelationName(rec); if (nm && !resolvedName.value) resolvedName.value = nm
      }
    }
  } catch (err) {
    resolvedAvatar.value = ''
  }
}

watch(
  () => [user?.user.value, props.open],
  ([u, isOpen]) => {
    if (!u) { resolvedAvatar.value = ''; return }
    resolveAvatarFromUser()
    if (isOpen && !resolvedAvatar.value) {
      nextTick(fetchRelationForFoto)
    }
  },
  { immediate: true, deep: false }
)

const destinationGroups = computed(() => {
  const menuUtama = [
    { to: '/', icon: 'bi-house-door-fill', label: 'Home', exact: true },
  ]
  if (!isInstansi.value) {
    menuUtama.push({ to: '/iduka', icon: 'bi-buildings-fill', label: 'IDUKA / Tempat PKL' })
    menuUtama.push({ to: '/elemen', icon: 'bi-journal-bookmark-fill', label: 'Elemen CP' })
  }
  menuUtama.push({ to: '/jurnal', icon: 'bi-journals', label: 'Jurnal Harian', badge: (props.countUnread || 0) + (props.countDraft || 0) || undefined })
  menuUtama.push({ to: '/nilai', icon: 'bi-patch-check-fill', label: 'Nilai PKL' })
  menuUtama.push({ to: '/proyek', icon: 'bi-calendar2-check-fill', label: 'Absen PKL' })

  const menuLainnya = [
    { to: '/ubah-password', icon: 'bi-key-fill', label: 'Ubah Password' },
    { to: '/location', icon: 'bi-geo-alt-fill', label: 'Lokasi PKL' },
    { to: '/logout', icon: 'bi-box-arrow-right', label: 'Keluar', danger: true },
  ]

  const groups = [{ label: 'Menu Utama', items: menuUtama }]
  groups.push({ label: 'Lainnya', items: menuLainnya })
  return groups
})
</script>

<style scoped>
.m3-drawer {
  position: fixed;
  inset: 0;
  z-index: 1080;
  display: flex;
  align-items: stretch;
  pointer-events: none;
}
.m3-drawer__scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  pointer-events: auto;
}
.m3-drawer__panel {
  position: relative;
  margin: 0;
  margin-left: 0;
  width: min(360px, 85vw);
  max-width: 100vw;
  height: 100%;
  background-color: var(--md-sys-color-surface-container-high, #18213a);
  color: var(--md-sys-color-on-surface, #e2e8f0);
  box-shadow: var(--m3-elevation-level-5);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  border-top-right-radius: var(--md-sys-shape-corner-extra-large, 28px);
  border-bottom-right-radius: var(--md-sys-shape-corner-extra-large, 28px);
  overflow: hidden;
}
.m3-drawer__panel--wide { width: min(400px, 90vw); }

.m3-drawer__handle {
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  background: var(--md-sys-color-outline-variant, #43474e);
  opacity: 0.55;
  z-index: 2;
}

/* ===== Header ===== */
.m3-drawer__header {
  padding: calc(52px + var(--m3-safe-top, 0px)) 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: linear-gradient(180deg,
    rgba(96, 165, 250, 0.08) 0%,
    transparent 80%);
  flex-shrink: 0;
}
.m3-drawer__brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.m3-drawer__brand .lexend-mega {
  font-size: 24px;
  letter-spacing: -0.5px;
  color: var(--md-sys-color-on-surface, #e2e8f0);
}
.m3-drawer__dot {
  color: var(--md-sys-color-primary, #60a5fa);
  -webkit-text-stroke: 1px var(--md-sys-color-primary, #60a5fa);
}
.m3-drawer__brand-sub {
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  letter-spacing: 0.5px;
}

.m3-drawer__account {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 2px 0;
}
.m3-drawer__avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  background: linear-gradient(135deg,
    var(--md-sys-color-primary-container, #004a77) 0%,
    var(--md-sys-color-secondary-container, #3b4758) 100%);
  color: var(--md-sys-color-on-primary-container, #d4e3ff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px var(--md-sys-color-surface-container-highest, #232d4a),
              0 0 0 4px var(--md-sys-color-outline-variant, #43474e),
              0 6px 16px rgba(0,0,0,0.35);
}
.m3-drawer__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.m3-drawer__avatar-icon {
  font-size: 40px;
  color: var(--md-sys-color-on-primary-container, #d4e3ff);
  opacity: 0.95;
}
.m3-drawer__account-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}
.m3-drawer__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--md-sys-color-on-surface, #e2e8f0);
  font-weight: 600;
}
.m3-drawer__role {
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m3-drawer__divider {
  height: 1px;
  background: var(--md-sys-color-outline-variant, #43474e);
  margin: 0 24px;
  flex-shrink: 0;
  opacity: 0.7;
}

/* ===== Nav (scrollable) ===== */
.m3-drawer__nav {
  padding: 10px 12px 16px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
.m3-drawer__nav::-webkit-scrollbar { width: 6px; }
.m3-drawer__nav::-webkit-scrollbar-track { background: transparent; }
.m3-drawer__nav::-webkit-scrollbar-thumb {
  background: var(--md-sys-color-surface-container-highest, #232d4a);
  border-radius: var(--md-sys-shape-corner-full, 9999px);
}
.m3-drawer__nav::-webkit-scrollbar-thumb:hover {
  background: var(--md-sys-color-primary, #60a5fa);
}

.m3-drawer__nav-bottom {
  flex-shrink: 0;
  height: 8px;
}

.m3-drawer__group-label {
  font: var(--md-sys-typescale-label-small-font);
  letter-spacing: 0.5px;
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  padding: 18px 16px 8px;
}
.m3-drawer__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 54px;
  padding: 0 20px 0 16px;
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  color: var(--md-sys-color-on-surface, #e2e8f0);
  text-decoration: none !important;
  font: var(--md-sys-typescale-label-large-font);
  letter-spacing: 0.1px;
  transition: background-color 0.15s ease, color 0.15s ease;
  isolation: isolate;
  overflow: hidden;
}
.m3-drawer__item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 0;
}
.m3-drawer__item > * { position: relative; z-index: 1; }
.m3-drawer__item:hover::before { opacity: 0.08; }
.m3-drawer__item:focus-visible { outline: none; }
.m3-drawer__item:focus-visible::before { opacity: 0.12; }
.m3-drawer__item:active::before { opacity: 0.10; }
.m3-drawer__item-icon {
  width: 24px;
  height: 24px;
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-surface-variant, #c3c7d2);
  flex-shrink: 0;
}
.m3-drawer__item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.m3-drawer__item--active {
  background-color: var(--md-sys-color-secondary-container, #3b4758);
  color: var(--md-sys-color-on-secondary-container, #d9e3f7);
}
.m3-drawer__item--active .m3-drawer__item-icon {
  color: var(--md-sys-color-on-secondary-container, #d9e3f7);
}
.m3-drawer__item--active::before { display: none; }
.m3-drawer__item--danger { color: var(--md-sys-color-error, #f87171); }
.m3-drawer__item--danger .m3-drawer__item-icon { color: var(--md-sys-color-error, #f87171); }
.m3-drawer__item--danger.m3-drawer__item--active {
  background-color: rgba(248, 113, 113, 0.12);
  color: var(--md-sys-color-error, #f87171);
}

.m3-drawer__item-badge {
  background: var(--md-sys-color-error, #f87171);
  color: var(--md-sys-color-on-error, #410002);
  border-radius: var(--md-sys-shape-corner-small, 8px);
  padding: 2px 8px;
  min-width: 20px;
  text-align: center;
  font: var(--md-sys-typescale-label-small-font);
  flex-shrink: 0;
}

/* ===== Footer ===== */
.m3-drawer__footer {
  padding: 12px 24px calc(16px + var(--m3-safe-bottom, 0px));
  border-top: 1px solid var(--md-sys-color-outline-variant, #43474e);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  background-color: var(--md-sys-color-surface-container, #0d1424);
  flex-shrink: 0;
}
.m3-drawer__footer-links {
  display: inline-flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
}
.m3-drawer__footer-sep {
  margin: 0 8px;
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  opacity: 0.6;
}
.m3-text-muted { color: var(--md-sys-color-on-surface-variant, #a4adc7); }
.m3-drawer__footer-version {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}
.m3-drawer__footer-version i {
  font-size: 12px;
  opacity: 0.8;
}
.m3-link {
  color: var(--md-sys-color-primary, #60a5fa);
  text-decoration: none;
}
.m3-link:hover { text-decoration: underline; }

.m3-badge { display: inline-flex; align-items: center; justify-content: center; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.28s cubic-bezier(0.2, 0, 0, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }

@media (min-width: 600px) {
  .m3-drawer__panel { width: 360px; }
}
@media (max-width: 420px) {
  .m3-drawer__header { padding-left: 20px; padding-right: 20px; }
  .m3-drawer__avatar { width: 54px; height: 54px; }
  .m3-drawer__avatar-icon { font-size: 34px; }
  .m3-drawer__item { min-height: 52px; padding-right: 16px; }
}
</style>
