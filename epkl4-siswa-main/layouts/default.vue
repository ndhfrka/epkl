<template>
  <!-- ⚠️ JANGAN PAKAI v-if="isMobile" STRUKTURAL!
       isMobile dari @nuxtjs/device default breakpoint ≤768px (bukan 992px).
       Celah 769-991px = DUAL-NOT-FOUND (side-nav hide, Top/Bottom M3 tidak render).
       SOLUSI: SELALU RENDER SEMUA KOMPONEN → biarkan CSS @media yg toggle visibility.
       Breakpoint unified: Mobile ≤ 991.98px  |  Desktop ≥ 992px (standar Bootstrap lg). -->

  <!-- ===== Top App Bar M3 (display mobile-only via CSS min-width:992px → display none) ===== -->
  <NavbarTop
    @leading-click="drawerOpen = true"
    @action-account="drawerOpen = true"
    :show-account="true"
    :show-notifications="true"
    :mobile-only="true"
  />

  <!-- ===== Navigation Drawer M3 (selalu ada; open via drawerOpen state) ===== -->
  <M3NavigationDrawer v-model:open="drawerOpen" />

  <!-- ====== SHARED ROOT CONTAINER (100% legacy struktur) ====== -->
  <div class="epkl-root epkl-root--legacy-mb6">
    <div class="epkl-row epkl-row--mt3 row">
      <!-- Side Nav (hide ≤ 991.98px via Nav.vue internal @media) -->
      <Nav />

      <!-- Main Content Slot -->
      <div class="col-lg-9 epkl-main-slot">
        <slot />
      </div>

      <!-- Bottom Nav M3 (display mobile-only via CSS min-width:992px → display none) -->
      <NavFixedBottom />
    </div>

    <!-- Footer: mobile / desktop via class CSS toggle -->
    <Footer class="epkl-footer" />
  </div>
</template>

<script setup>
// Catatan: isMobile tidak digunakan untuk structural render (hanya untuk kepentingan lain jika perlu)
// const { isMobile } = useDevice()
const drawerOpen = ref(false)

function bodyScrollLock(lock) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = lock ? 'hidden' : ''
}
watchEffect(() => { bodyScrollLock(drawerOpen.value) })
onBeforeUnmount(() => bodyScrollLock(false))
</script>

<style>
@font-face {
  font-family: 'Romana BT';
  src: url('~/assets/font/RomanaB.ttf');
}
@font-face {
  font-family: 'Metropolis';
  src: url('~/assets/font/Metropolis-Regular.otf');
}

html, body {
  font-family: "Plus Jakarta Sans", "Quicksand", sans-serif;
  background: var(--md-sys-color-background, #040712);
  color: var(--md-sys-color-on-background, #e7edf7);
}

/* ========== LEGACY DESKTOP LAYOUT — 100% SAMA SEBELUM M3 ========== */
.epkl-root {
  width: 100%;
  padding-right: var(--bs-gutter-x, 1rem);
  padding-left: var(--bs-gutter-x, 1rem);
  margin-right: auto;
  margin-left: auto;
  box-sizing: border-box;
}
@media (min-width: 1400px) {
  .epkl-root { max-width: 1500px; }
}
.epkl-root--legacy-mb6 {
  margin-bottom: 5.5em;
}
.epkl-row--mt3 {
  margin-top: 1rem;
}

.epkl-row--mt3.row {
  --bs-gutter-x: 1.25rem;
}

/* Shared desktop-mobile main slot padding */
.epkl-main-slot {
  min-width: 0;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

/* ========== MOBILE OVERRIDE (≤ 991.98px) ========== */
@media (max-width: 991.98px) {
  .epkl-root {
    padding-top: calc(64px + var(--m3-safe-top, 0px));
    padding-bottom: calc(80px + var(--m3-safe-bottom, 0px));
    padding-left: calc(14px + var(--m3-safe-left, 0px));
    padding-right: calc(14px + var(--m3-safe-right, 0px));
  }
  .epkl-root--legacy-mb6 {
    margin-bottom: 0;
  }
  .epkl-row--mt3 {
    margin-top: 0;
  }
  .epkl-row--mt3.row {
    --bs-gutter-x: 0.75rem;
    margin-left: 0;
    margin-right: 0;
  }
  .epkl-main-slot {
    padding-left: 0;
    padding-right: 0;
  }
  .epkl-main-slot > :first-child { margin-top: 0.75rem !important; }
  .epkl-main-slot > :last-child { margin-bottom: 0.75rem !important; }
  .epkl-main-slot .mt-3,
  .epkl-main-slot .mt-4,
  .epkl-main-slot .mt-5 { margin-top: 1rem !important; }
  .epkl-main-slot .mb-3 { margin-bottom: 1rem !important; }
  .epkl-main-slot .mb-4 { margin-bottom: 1.25rem !important; }
}

/* Extra small 420px -> kecilkan AppBar 60 Bottom 76 + padding lebih hemat tapi tetap tidak mepet */
@media (max-width: 420px) {
  .epkl-root {
    padding-top: calc(60px + var(--m3-safe-top, 0px));
    padding-bottom: calc(76px + var(--m3-safe-bottom, 0px));
    padding-left: calc(12px + var(--m3-safe-left, 0px));
    padding-right: calc(12px + var(--m3-safe-right, 0px));
  }
  .epkl-row--mt3.row { --bs-gutter-x: 0.5rem; }
  .epkl-main-slot .mt-3,
  .epkl-main-slot .mt-4,
  .epkl-main-slot .mt-5 { margin-top: 0.85rem !important; }
}

/* ========== Footer Toggle ========== */
.epkl-footer { display: block; }
/* Di desktop: sembunyikan mobile-only footer, tampilkan desktop footer via component class */
@media screen and (min-width: 992px) {
  .footer-mobile-view { display: none !important; }
}
@media screen and (max-width: 991.98px) {
  .footer-desktop-view { display: none !important; }
}
/* Karena Footer.vue render 1x, dan default.vue pakai Footer class epkl-footer tanpa mobile/desktop flag — 
   Footer.vue legacy tidak punya display logic per ukuran (kecuali diatur via scoped style Footer).
   Biarkan visibility Footer ditentukan Footer sendiri via style scoped lama:
   viewport >= 992 footer-mobile-view hidden, viewport < 992 footer-desktop-view hidden. */

/* ========== Utility classes ========== */
.quicksand {
  font-family: "Quicksand", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.lexend-mega {
  font-family: "Lexend Mega", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
.metropolis { font-family: 'Metropolis'; }
.romana { font-family: 'Romana BT'; }

table { font-size: medium; }
table thead { font-size: medium; }

.mb-6 { margin-bottom: 5.5em; }
.pre-text { white-space: pre-wrap; }
.smallest { font-size: .8em; }
</style>
