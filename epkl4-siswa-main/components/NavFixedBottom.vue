<template>
  <nav
    class="m3-navbar m3-elev-2"
    role="navigation"
    aria-label="Navigasi utama"
  >
    <ul class="m3-navbar__list">
      <li
        v-for="dest in destinations"
        :key="dest.to"
        class="m3-navbar__item"
      >
        <nuxt-link
          :to="dest.to"
          class="m3-navbar__link m3-state"
          v-slot="{ isActive, href, navigate }"
          custom
        >
          <a
            :href="href"
            class="m3-navbar__link-inner"
            :class="{ 'm3-navbar__link-inner--active': isActive }"
            @click="navigate($event)"
          >
            <!-- Badge overlay -->
            <span v-if="dest.badge && dest.badge() > 0" class="m3-navbar__badge" :class="{ 'm3-navbar__badge--small': dest.badge() <= 9 }">
              {{ dest.badge() > 99 ? '99+' : dest.badge() }}
            </span>

            <!-- Active indicator (M3 pill shape) -->
            <span
              class="m3-navbar__indicator"
              :class="{ 'm3-navbar__indicator--active': isActive }"
              aria-hidden="true"
            ></span>

            <!-- Icon -->
            <i
              :class="`bi ${isActive ? dest.iconActive || dest.icon : dest.icon} m3-navbar__icon`"
              :aria-hidden="true"
            ></i>

            <!-- Label -->
            <span class="m3-navbar__label">{{ dest.label }}</span>
          </a>
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const user = usePocketBaseUser()
const client = usePocketBaseClient()

const role = computed(() => user?.user.value?.role || 'siswa')
const isInstansi = computed(() => role.value === 'instansi')
const isGuru = computed(() => role.value === 'guru')
const countDraft = ref(0)
const countUnreadComment = ref(0)

async function refreshCounts() {
  if (!user.user.value || isInstansi.value || isGuru.value) return
  try {
    const uid = user.user.value.id
    const [d, u] = await Promise.all([
      client.collection('jurnal').getList(1, 1, {
        filter: `siswa="${uid}" && isDraft=true`,
        fields: 'id',
      }).catch(() => ({ totalItems: 0 })),
      client.collection('jurnal_komentar').getList(1, 1, {
        filter: `idJurnal.siswa.id="${uid}" && isOpen=false`,
        fields: 'id',
      }).catch(() => ({ totalItems: 0 })),
    ])
    countDraft.value = d?.totalItems || 0
    countUnreadComment.value = u?.totalItems || 0
  } catch { /* noop */ }
}

const destinations = computed(() => {
  const list = [
    {
      to: '/',
      exact: true,
      icon: 'bi-house-door',
      iconActive: 'bi-house-door-fill',
      label: 'Home',
    },
  ]
  if (!isInstansi.value) {
    list.push({
      to: '/iduka',
      icon: 'bi-buildings',
      iconActive: 'bi-buildings-fill',
      label: 'IDUKA',
    })
  }
  list.push({
    to: '/jurnal',
    icon: 'bi-journals',
    iconActive: 'bi-journals',
    label: 'Jurnal',
    badge: () => countDraft.value + countUnreadComment.value,
  })
  list.push({
    to: '/nilai',
    icon: 'bi-patch-check',
    iconActive: 'bi-patch-check-fill',
    label: 'Nilai',
  })
  list.push({
    to: '/proyek',
    icon: 'bi-calendar2-check',
    iconActive: 'bi-calendar2-check-fill',
    label: 'Absen',
  })
  list.push({
    to: '/location',
    icon: 'bi-geo-alt',
    iconActive: 'bi-geo-alt-fill',
    label: 'Lokasi',
  })
  return list
})

onMounted(() => {
  refreshCounts()
  // Realtime subscribe
  try {
    client.collection('jurnal').subscribe('*', () => refreshCounts(), {})
    client.collection('jurnal_komentar').subscribe('*', () => refreshCounts(), {})
  } catch { /* noop */ }
})
</script>

<style scoped>
.m3-navbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
  padding: 12px 8px calc(12px + var(--m3-safe-bottom, 0px));
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  /* Top corners M3 shape large */
  border-top-left-radius: var(--md-sys-shape-corner-large);
  border-top-right-radius: var(--md-sys-shape-corner-large);
  border: none;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.m3-navbar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  width: 100%;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.m3-navbar__item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.m3-navbar__link {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-decoration: none !important;
  padding: 0;
  width: 100%;
  isolation: isolate;
  overflow: visible;
}

.m3-navbar__link-inner {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: 100%;
  min-width: 48px;
  padding: 4px 0 0;
  text-decoration: none;
  color: var(--md-sys-color-on-surface-variant);
  isolation: isolate;
}

.m3-navbar__indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  width: 64px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-secondary-container);
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), opacity 0.25s ease;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
.m3-navbar__indicator--active {
  transform: translateX(-50%) scaleX(1);
  opacity: 1;
}

/* State layer on indicator area when active */
.m3-navbar__link-inner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  background: currentColor;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 1;
}
.m3-navbar__link-inner:hover::after { opacity: 0.08; }
.m3-navbar__link-inner--active::after { background: var(--md-sys-color-on-secondary-container); }

.m3-navbar__icon {
  font-size: 24px;
  line-height: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: color 0.2s ease, transform 0.15s ease;
}
.m3-navbar__link-inner--active .m3-navbar__icon {
  color: var(--md-sys-color-on-secondary-container);
}
.m3-navbar__link-inner:active .m3-navbar__icon { transform: scale(0.92); }

.m3-navbar__label {
  font: var(--md-sys-typescale-label-medium-font);
  letter-spacing: 0.5px;
  line-height: 16px;
  position: relative;
  z-index: 2;
  color: var(--md-sys-color-on-surface-variant);
  transition: color 0.2s ease, font-weight 0.2s ease;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}
.m3-navbar__link-inner--active .m3-navbar__label {
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-label-large-font);
  letter-spacing: 0.1px;
}

/* Badge M3 */
.m3-navbar__badge {
  position: absolute;
  top: 0;
  left: calc(50% + 14px);
  transform: translateX(-50%);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--md-sys-shape-corner-small);
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  font: var(--md-sys-typescale-label-small-font);
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border: 2px solid var(--md-sys-color-surface-container-high);
  box-sizing: content-box;
}
.m3-navbar__badge--small { min-width: 6px; width: 6px; height: 6px; padding: 0; border-radius: var(--md-sys-shape-corner-full); }

/* Desktop: hide component (hanya mobile) */
@media (min-width: 992px) {
  .m3-navbar { display: none !important; }
}

/* Extra-small screen */
@media (max-width: 360px) {
  .m3-navbar { padding: 8px 4px calc(8px + var(--m3-safe-bottom, 0px)); }
  .m3-navbar__indicator { width: 56px; height: 32px; }
  .m3-navbar__link-inner::after { width: 56px; }
  .m3-navbar__label { font-size: 10px; }
}
</style>
