<template>
  <div class="m3-login-header">
    <div class="m3-login-header__logo">
      <div class="m3-login-header__avatar">
        <i class="bi bi-mortarboard-fill m3-login-header__avatar-icon"></i>
      </div>
    </div>
    <div class="m3-login-header__brand">
      <span class="lexend-mega m3-login-header__title">e-PKL<span class="m3-login-header__dot">.</span></span>
      <span class="m3-login-header__role m3-label-small">Siswa PKL</span>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* KUNCI HEADER LOGIN SECARA EKSPLISIT (bukan hanya bergantung token M3).
   Tujuan: walau zoom browser turun sampai 80%, logo + judul tidak menyusut jadi
   tampak "mini" di tengah layar desktop luas. */
.m3-login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: calc(40px + var(--m3-safe-top, 0px)) 20px 16px;
  text-align: center;
}

.m3-login-header__logo {
  width: 104px;
  height: 104px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--md-sys-color-primary-container, #004a77);
  color: var(--md-sys-color-on-primary-container, #d4e3ff);
  border-radius: 32px;
  box-shadow: var(--m3-elevation-level-2, 0 6px 16px rgba(0,0,0,0.3));
}
.m3-login-header__avatar {
  width: 68px;
  height: 68px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: var(--md-sys-color-secondary-container, #103253);
  color: var(--md-sys-color-on-secondary-container, #d4e6ff);
}
.m3-login-header__avatar-icon {
  font-size: 38px;
  line-height: 1;
}

.m3-login-header__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.m3-login-header__title {
  font-size: 32px;
  letter-spacing: -0.6px;
  color: var(--md-sys-color-on-background, #e7edf7);
  line-height: 1.1;
  margin: 0;
}
.m3-login-header__dot {
  color: var(--md-sys-color-primary, #60a5fa);
  -webkit-text-stroke: 1px var(--md-sys-color-primary, #60a5fa);
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.55);
}
.m3-login-header__role {
  color: var(--md-sys-color-on-surface-variant, #a4adc7);
  text-transform: uppercase;
  letter-spacing: 1.4px;
  font-size: 12px;
  font-weight: 600;
}

/* Desktop (≥ 992px): Logo & judul DIPERBESAR agar tidak tampak kecil di tengah layar lebar */
@media (min-width: 992px) {
  .m3-login-header {
    padding: 56px 28px 20px;
    gap: 18px;
  }
  .m3-login-header__logo { width: 116px; height: 116px; border-radius: 36px; }
  .m3-login-header__avatar { width: 76px; height: 76px; border-radius: 28px; }
  .m3-login-header__avatar-icon { font-size: 42px; }
  .m3-login-header__title { font-size: 36px; }
  .m3-login-header__role { font-size: 13px; }
}
</style>
