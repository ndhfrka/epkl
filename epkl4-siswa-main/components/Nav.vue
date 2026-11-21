<template>
  <div class="col-lg-3 side-nav">
    <Header />
    <div class="card modern-side-card">
      <div class="card-body p-0">
        <!-- [FITUR TEMA] Mode gelap/terang (desktop) -->
        <div class="side-nav__tema">
          <TombolTema />
        </div>
        <!-- Lonceng pengingat absen & jurnal (muncul otomatis ≥ 16.00 jika belum diisi) -->
        <div class="side-nav__pengingat">
          <PengingatBell placement="right" />
        </div>
        <nav class="side-nav__menu">
          <ul class="nav-list">
            <li class="nav-item">
              <nuxt-link to="/" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-grid-1x2-fill"></i></div>
                <span class="nav-text">Dashboard</span>
              </nuxt-link>
            </li>
            <li v-if="role !== 'instansi'" class="nav-item">
              <nuxt-link to="/iduka" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-buildings-fill"></i></div>
                <span class="nav-text">IDUKA / Mitra</span>
              </nuxt-link>
            </li>
            <li v-if="role !== 'instansi'" class="nav-item">
              <nuxt-link to="/elemen" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-journal-bookmark-fill"></i></div>
                <span class="nav-text">Elemen CP</span>
              </nuxt-link>
            </li>
            <li class="nav-item">
              <nuxt-link to="/jurnal" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-journal-text"></i></div>
                <span class="nav-text">Jurnal PKL</span>
              </nuxt-link>
            </li>
            <li v-if="role === 'guru' || role === 'admin'" class="nav-item">
              <nuxt-link to="/guru/validasi" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-clipboard-check-fill text-warning"></i></div>
                <span class="nav-text">Validasi Jurnal</span>
              </nuxt-link>
            </li>
            <li v-if="role === 'guru' || role === 'admin'" class="nav-item">
              <nuxt-link to="/galeri" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-images"></i></div>
                <span class="nav-text">Galeri Foto PKL</span>
              </nuxt-link>
            </li>
            <li class="nav-item">
              <nuxt-link to="/nilai" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-patch-check-fill"></i></div>
                <span class="nav-text">Nilai & Sertifikat</span>
              </nuxt-link>
            </li>
            <li class="nav-item">
              <nuxt-link to="/proyek" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-calendar2-check-fill"></i></div>
                <span class="nav-text">Absensi Harian</span>
              </nuxt-link>
            </li>
            <li class="nav-item">
              <nuxt-link to="/location" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-geo-alt-fill"></i></div>
                <span class="nav-text">Lokasi & Geofence</span>
              </nuxt-link>
            </li>
            <li class="nav-item nav-item--divider"></li>
            <li class="nav-item">
              <nuxt-link to="/ubah-password" class="nav-link-custom">
                <div class="nav-icon"><i class="bi bi-shield-lock-fill"></i></div>
                <span class="nav-text">Keamanan Akun</span>
              </nuxt-link>
            </li>
            <li class="nav-item">
              <nuxt-link to="/logout" class="nav-link-custom nav-link-custom--danger">
                <div class="nav-icon"><i class="bi bi-box-arrow-right"></i></div>
                <span class="nav-text">Keluar</span>
              </nuxt-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
let user = usePocketBaseUser()
let prokel = ref({})
let nama = user.user.value?.nama
let role = user.user.value?.role
let username = user.user.value?.username
</script>

<style scoped>
.modern-side-card {
  background: rgba(13, 20, 36, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.5) !important;
  overflow: hidden;
}

.side-nav__pengingat {
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px 4px;
}

.side-nav__menu {
  padding: 6px 10px 14px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item--divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 8px 10px;
}

.nav-link-custom {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 1.05rem;
  color: #94a3b8;
  transition: all 0.22s ease;
}

.nav-link-custom:hover {
  color: #f1f5f9;
  background: rgba(59, 130, 246, 0.12);
  transform: translateX(3px);
}

.nav-link-custom:hover .nav-icon {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.2);
}

/* Nuxt active state */
.nav-link-custom.router-link-exact-active {
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.nav-link-custom.router-link-exact-active .nav-icon {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

/* Danger logout */
.nav-link-custom--danger {
  color: #f87171;
}

.nav-link-custom--danger .nav-icon {
  color: #f87171;
  background: rgba(239, 68, 68, 0.08);
}

.nav-link-custom--danger:hover {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.16);
}

.nav-link-custom--danger:hover .nav-icon {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.25);
}

@media screen and (max-width: 991.98px) {
  .side-nav {
    display: none;
  }
}

:deep(.m3-login-header) {
  padding: 24px 16px 14px !important;
  gap: 10px !important;
}

:deep(.m3-login-header__logo) {
  width: 68px !important;
  height: 68px !important;
  border-radius: 20px !important;
  /* [GANTI LOGO] Samakan dengan Header.vue: kotak logo hijau lembut
     (senada logo SMK AL-FATAH: hijau #60a848 + emas #f0d818),
     bukan lagi gradient biru #1e3a8a -> #2563eb */
  background: linear-gradient(150deg, #f0f7ea 0%, #ddefd2 100%) !important;
  box-shadow:
    inset 0 0 0 1px rgba(96, 168, 72, 0.4),
    0 8px 20px rgba(15, 23, 42, 0.45) !important;
}

:deep(.m3-login-header__avatar) {
  width: 46px !important;
  height: 46px !important;
  border-radius: 14px !important;
  /* kapsul putih solid agar artwork logo transparan tetap tajam;
     cincin hijau tipis menyatu dengan kotak hijau lembut */
  background: #ffffff !important;
  box-shadow: inset 0 0 0 1px rgba(96, 168, 72, 0.22) !important;
}

:deep(.m3-login-header__avatar-icon) {
  font-size: 26px !important;
}

:deep(.m3-login-header__title) {
  font-size: 24px !important;
  color: #ffffff !important;
}

:deep(.m3-login-header__role) {
  font-size: 11px !important;
  color: #60a5fa !important;
  letter-spacing: 1px !important;
}

/* [FITUR TEMA] Baris tombol mode gelap/terang di sisi navigasi desktop */
.side-nav__tema {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 0;
}
</style>
