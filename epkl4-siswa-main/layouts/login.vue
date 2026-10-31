<template>
  <div class="m3-login-shell">
    <!-- Decorative background shapes -->
    <div aria-hidden="true" class="m3-login-shell__bg m3-login-shell__bg--blob1"></div>
    <div aria-hidden="true" class="m3-login-shell__bg m3-login-shell__bg--blob2"></div>

    <div class="m3-login-shell__grid">
      <div class="m3-login-shell__panel m3-elev-2">
        <Header />
        <div class="m3-login-shell__content">
          <slot />
        </div>
      </div>
    </div>

    <footer class="m3-login-shell__footer">
      <span class="m3-label-small m3-text-muted">© {{ year }} e-PKL v{{ version }} · Dibuat untuk Siswa PKL</span>
    </footer>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const version = config.public.appVersion || '3.0'
const year = new Date().getFullYear()
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

.m3-login-shell {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: radial-gradient(1200px 800px at 20% -10%, rgba(0, 74, 119, 0.35), transparent 60%),
              radial-gradient(900px 600px at 100% 110%, rgba(71, 85, 105, 0.25), transparent 60%),
              var(--md-sys-color-background, #040712);
}

.m3-login-shell__bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
.m3-login-shell__bg--blob1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, var(--md-sys-color-primary, #60a5fa) 0%, transparent 60%);
  top: -140px; left: -140px;
}
.m3-login-shell__bg--blob2 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, var(--md-sys-color-tertiary, #d0bcff) 0%, transparent 60%);
  bottom: -140px; right: -140px;
  opacity: 0.2;
}

.m3-login-shell__grid {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 24px;
  padding-top: calc(24px + var(--m3-safe-top, 0px));
  padding-bottom: calc(88px + var(--m3-safe-bottom, 0px));
}

/* ==========================================================
   KUNCI UKURAN PANEL LOGIN SECARA EKSPLISIT.
   Sebelumnya hanya mengandalkan max-width + var(--token) →
   kalau ada token M3 yang tidak ke-load / zoom browser < 100%
   (55% contoh di user), form tampak SANGAT KECIL sekali.
   SEKARANG:
     • Mobile ≤ 599px  : max-width 440px (default aman)
     • Desktop ≥ 600px : width 100% clamp 520px → 560px
                         (jadi walau user zoom 80% / display scale
                          125%, panel TIDAK PERNAH keciiiiil banget
                          kayak stampel di tengah layar lebar).
   ========================================================== */
.m3-login-shell__panel {
  width: 100%;
  max-width: clamp(420px, 46vw, 560px);
  min-width: 320px;
  background: var(--md-sys-color-surface-container-low, #09101e);
  border-radius: var(--md-sys-shape-corner-extra-large, 28px);
  border: 1px solid var(--md-sys-color-outline-variant, #374260);
  overflow: hidden;
  box-shadow: var(--m3-elevation-level-3, 0 12px 48px rgba(0,0,0,0.45));
}

.m3-login-shell__content {
  padding: 8px 28px 32px;
}

/* Desktop (≥ 992px): BESARKAN padding + lock max-width nyaman.
   Layar desktop 1366+ biasanya lebih luas, panel login 560px
   (bukan 440px) supaya proporsional dan tidak seperti tombol mini. */
@media (min-width: 992px) {
  .m3-login-shell__grid {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 56px;
    padding-bottom: 88px;
    gap: 48px;
  }
  .m3-login-shell__panel {
    max-width: 580px;
    width: 560px;
    border-radius: 32px;
  }
  .m3-login-shell__content {
    padding: 12px 40px 40px;
  }
  .m3-login-shell__footer span { font-size: 14px; }
}

.m3-login-shell__footer {
  position: absolute;
  left: 0; right: 0;
  bottom: 0;
  padding: 16px 16px calc(16px + var(--m3-safe-bottom, 0px));
  text-align: center;
  z-index: 1;
}
.m3-text-muted { color: var(--md-sys-color-on-surface-variant, #a4adc7); }

/* Legacy helpers */
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
.hand-cursor { cursor: pointer; }
.smallest { font-size: small; }
</style>
