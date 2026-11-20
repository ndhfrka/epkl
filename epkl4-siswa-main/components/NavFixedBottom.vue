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
          class="m3-navbar__link"
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
  if (isGuru.value) {
    list.push({
      to: '/guru/validasi',
      icon: 'bi-clipboard-check',
      iconActive: 'bi-clipboard-check-fill',
      label: 'Validasi',
    })
  } else if (!isInstansi.value) {
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
  padding: 8px 8px calc(8px + var(--m3-safe-bottom, 0px));
  background: rgba(11, 18, 33, 0.88) !important;
  backdrop-filter: blur(24px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 -10px 35px rgba(0, 0, 0, 0.65), 0 -1px 0 rgba(59, 130, 246, 0.25) !important;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border: none;
}

.m3-navbar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  max-width: 600px;
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
  justify-content: center;
  text-decoration: none !important;
  padding: 0;
  width: 100%;
  isolation: isolate;
  overflow: visible;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.m3-navbar__link-inner {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
  min-width: 44px;
  padding: 4px 0 2px;
  text-decoration: none;
  color: #94a3b8;
  isolation: isolate;
  border-radius: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
}

.m3-navbar__link-inner:hover,
.m3-navbar__link-inner:focus,
.m3-navbar__link-inner:active,
.m3-navbar__link-inner:focus-visible,
.m3-navbar__link-inner--active {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.m3-navbar__link::before,
.m3-navbar__link::after,
.m3-navbar__link-inner::before,
.m3-navbar__link-inner::after {
  display: none !important;
  content: none !important;
}

.m3-navbar__indicator {
  position: absolute;
  top: 1px;
  left: 50%;
  transform: translateX(-50%) scale(0.6);
  transform-origin: center;
  width: 52px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(59, 130, 246, 0.15) 100%);
  border: 1px solid rgba(59, 130, 246, 0.45);
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.4);
  transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
.m3-navbar__indicator--active {
  transform: translateX(-50%) scale(1);
  opacity: 1;
}

.m3-navbar__icon {
  font-size: 20px;
  line-height: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  color: #94a3b8;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.m3-navbar__link-inner--active .m3-navbar__icon {
  color: #38bdf8 !important;
  transform: translateY(-2px) scale(1.12);
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.7);
}
.m3-navbar__link-inner:active .m3-navbar__icon { transform: scale(0.92); }

.m3-navbar__label {
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 14px;
  position: relative;
  z-index: 2;
  color: #64748b;
  transition: all 0.2s ease;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}
.m3-navbar__link-inner--active .m3-navbar__label {
  color: #ffffff !important;
  font-weight: 700 !important;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
}

/* Badge M3 Modern Neon */
.m3-navbar__badge {
  position: absolute;
  top: 1px;
  left: calc(50% + 14px);
  transform: translateX(-50%);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border: 2px solid #0b1221 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.7) !important;
  box-sizing: content-box;
}
.m3-navbar__badge--small { min-width: 7px; width: 7px; height: 7px; padding: 0; border-radius: var(--md-sys-shape-corner-full); }

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
