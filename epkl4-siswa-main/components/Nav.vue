<template>
  <div class="col-lg-3 side-nav">
    <Header />
    <div class="card shadow-lg">
      <div class="card-body p-0">
        <!-- Lonceng pengingat absen & jurnal (muncul otomatis ≥ 16.00 jika belum diisi) -->
        <div class="side-nav__pengingat">
          <PengingatBell placement="right" />
        </div>
        <nav>
          <ol class="list-group list-group-flush quicksand fw-bold py-3">
            <nuxt-link to="/">
              <li class="list-group-item"><i class="bi bi-house-door"></i> Home</li>
            </nuxt-link>
            <nuxt-link v-if="role !== 'instansi'" to="/iduka">
              <li class="list-group-item"><i class="bi bi-buildings"></i> IDUKA</li>
            </nuxt-link>
            <nuxt-link v-if="role !== 'instansi'" to="/elemen">
              <li class="list-group-item"><i class="bi bi-journal-bookmark-fill"></i> Elemen</li>
            </nuxt-link>
            <nuxt-link to="/jurnal">
              <li class="list-group-item"><i class="bi bi-journals"></i> Jurnal</li>
            </nuxt-link>
            <nuxt-link to="/nilai">
              <li class="list-group-item"><i class="bi bi-patch-check"></i> Nilai</li>
            </nuxt-link>
            <nuxt-link to="/proyek">
              <li class="list-group-item"><i class="bi bi-calendar2-check"></i> Absen</li>
            </nuxt-link>
            <nuxt-link to="/ubah-password">
              <li class="list-group-item"><i class="bi bi-key"></i> Ubah Password</li>
            </nuxt-link>
            <nuxt-link to="/location">
              <li class="list-group-item"><i class="bi bi-geo-alt"></i> Lokasi PKL</li>
            </nuxt-link>
            <nuxt-link to="/logout">
              <li class="list-group-item text-danger"><i class="bi bi-box-arrow-right"></i> Keluar</li>
            </nuxt-link>
          </ol>
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
a {
  text-decoration: none;
}
/* baris lonceng pengingat di atas daftar menu */
.side-nav__pengingat {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px 0;
}
/* warna teks menu terang agar terbaca jelas di tema gelap */
a > li {
  color: var(--epkl-text);
}
a:hover > li {
  background-color: rgba(59, 130, 246, 0.14);
}
/* halaman yang sedang dibuka: biru + teks putih (Nuxt 3 pakai class router-link-exact-active) */
a.router-link-exact-active > li,
.list-group-item:hover {
  background-color: rgba(59, 130, 246, 0.85) !important;
  color: #fff;
}
.list-group-item {
  font-size: 1.2em;
  border: none !important;
  /* border-bottom: 2px solid #212529 !important; */
  background-color: transparent;
}
.list-group-item:hover .badge,
.list-group-item-active .badge {
  border: #fff;
  color: #fff;
  background-color: #fff;
}
@media screen and (max-width: 991.98px) {
  .side-nav {
    display: none;
  }
}
</style>
