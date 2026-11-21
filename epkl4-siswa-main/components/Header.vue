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
  width: 116px;
  height: 116px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* [LOGO OPSI 1] Tampilan bersih & menyatu: kotak latar hijau pastel
     dihapus total (background transparan, tanpa ring/shadow) sehingga
     tidak ada efek background ganda di belakang logo sekolah. Elemen
     ini kini hanya berperan sebagai wadah/spacing logo. */
  background: transparent;
  box-shadow: none;
  border-radius: 32px;
}
.m3-login-header__avatar {
  width: 78px;
  height: 78px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  /* [LOGO OPSI 1] Kapsul putih juga dihapus — logo (PNG transparan)
     tampil langsung di atas card gelap dengan sedikit padding dari
     kapsul ini agar tidak menempel tepi; kontras tetap terjaga. */
  background: transparent;
  box-shadow: none;
}
.m3-login-header__logo-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
  /* [LOGO OPSI 1] Subtle shadow mengikuti bentuk alpha logo (bukan
     kotak) agar logo jelas di card gelap; halo putih tipis membantu
     detail gelap pada artwork tetap terbaca. */
  filter:
    drop-shadow(0 0 8px rgba(255, 255, 255, 0.10))
    drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
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
  .m3-login-header__logo { width: 130px; height: 130px; border-radius: 36px; }
  .m3-login-header__avatar { width: 88px; height: 88px; border-radius: 28px; }
  .m3-login-header__logo-img { width: 74px; height: 74px; }
  .m3-login-header__title { font-size: 36px; }
  .m3-login-header__role { font-size: 13px; }
}
</style>
