<template>
  <div class="m3-login-header">
    <div class="m3-login-header__logo">
      <div class="m3-login-header__avatar">
        <!-- [GANTI LOGO] Logo resmi SMK AL-FATAH BANJARNEGARA menggantikan
             ikon topi wisuda (bi-mortarboard-fill). File: /logo-smk-alfatah.png
             (latar transparan) — dipasang di atas kapsul putih agar warna
             sekolah selalu jelas di mode gelap maupun terang. -->
        <img class="m3-login-header__logo-img" src="/logo-smk-alfatah.png"
          alt="Logo SMK AL-FATAH BANJARNEGARA" />
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
  /* [GANTI LOGO] Kotak logo tidak lagi biru (primary-container):
     dipilih hijau lembut gradasi agar selaras dengan warna dominan
     logo SMK AL-FATAH (hijau #60a848 + emas #f0d818) dan tetap
     hangat di samping aksen biru aplikasi e-PKL. */
  background: linear-gradient(150deg, #f0f7ea 0%, #ddefd2 100%);
  box-shadow:
    inset 0 0 0 1px rgba(96, 168, 72, 0.35),
    var(--m3-elevation-level-2, 0 6px 16px rgba(0, 0, 0, 0.3));
  border-radius: 32px;
}
.m3-login-header__avatar {
  width: 68px;
  height: 68px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  /* [GANTI LOGO] kapsul putih di atas kotak hijau lembut agar artwork
     logo sekolah (latar transparan) selalu tajam & kontras di tema
     gelap maupun terang; cincin hijau tipis menyatu dengan kotak */
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(96, 168, 72, 0.22);
}
.m3-login-header__logo-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  display: block;
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
  .m3-login-header__logo-img { width: 64px; height: 64px; }
  .m3-login-header__title { font-size: 36px; }
  .m3-login-header__role { font-size: 13px; }
}
</style>
