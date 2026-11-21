<template>
  <nuxt-link to="/" class="btn btn-light btn-sm border border-2 border-dark"><i class="bi bi-arrow-left"></i>
    Kembali</nuxt-link>
  <nuxt-link to="/terms" class="btn btn-dark btn-sm border border-2 border-dark ms-2">Aturan & Syarat Penggunaan</nuxt-link>
  <div class="card mt-3">
    <div class="card-header fw-bold fs-5">
      Cooked By
    </div>
    <div class="card-body">
      <div class="text-center">
        <h5 class="fw-bold fs-4 mb-0">Muhammad Nadhif Raka Saputra</h5>
        <p class="text-muted">@ndhfrka</p>
        <p class="small text-muted mb-0">
          Pengembang aplikasi e-PKL versi peserta &mdash; ditulis ulang dengan
          <strong>Nuxt 3 (Vue)</strong> di sisi depan dan <strong>PocketBase</strong> di sisi belakang.
        </p>
      </div>
      <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-2 fs-4">
        <nuxt-link to="https://github.com/ndhfrka/epkl" target="_blank"
          class="text-decoration-none" title="GitHub: ndhfrka/epkl">
          <i class="bi bi-github"></i>
        </nuxt-link>
        <nuxt-link to="https://github.com/ndhfrka/epkl" target="_blank"
          class="text-decoration-none small">
          github.com/ndhfrka/epkl
        </nuxt-link>
      </div>
      <hr>
      <p class="small">
        e-PKL Peserta dibuat terpisah dengan aplikasi utama untuk Guru dengan harapan mempermudah
        pengembangannya. Versi ini ditulis ulang dari nol dan kini dilengkapi fitur-fitur terbaru
        seperti berikut.
      </p>
      <ul class="small">
        <li><strong>Dashboard</strong> bergaya bento: ringkasan PKL, kehadiran hari ini, agenda terdekat,
          dan rekap kehadiran bulanan (Hadir, Sakit, Izin, Alpa, Libur).</li>
        <li><strong>Jurnal harian</strong> dengan pengelompokan sesuai Elemen Mapel PKL, swafoto/berkas
          foto, serta sinkronisasi absensi otomatis.</li>
        <li><strong>Absensi otomatis</strong>: jurnal yang memuat kata <em>sakit</em>/<em>izin</em> otomatis
          menandai absen (S/I), dan peserta yang tidak mengisi jurnal hingga pukul 18.00 WIB dianggap
          <em>Alpa</em> (A).</li>
        <li><strong>Validasi jurnal</strong> oleh Guru Pembimbing Jurusan &mdash; jurnal yang sudah
          divalidasi terkunci dan tidak dapat diedit/dihapus oleh peserta.</li>
        <li><strong>Nilai PKL</strong> untuk Rapor dan/atau Sertifikat, <strong>Elemen</strong> Mapel PKL,
          <strong>IDUKA</strong>, serta <strong>Peta Lokasi</strong> tempat magang.</li>
        <li><strong>Pengingat</strong> pada notifikasi aplikasi, termasuk peringatan jurnal yang belum
          diisi menjelang pukul 18.00.</li>
        <li><strong>Mode gelap/terang</strong> yang tersimpan per perangkat, tampilan responsif untuk
          desktop dan mobile.</li>
      </ul>
      <p class="small">
        Dibangun di atas <strong>Nuxt 3</strong> (Vue 3, Composition API, auto-import composables),
        <strong>Bootstrap 5</strong>, <strong>Bootstrap Icons</strong>, Material Design 3 pada
        komponen form, peta <em>embed</em> interaktif untuk lokasi IDUKA, kompresi foto
        (<em>compressorjs</em>) serta ekspor PDF (<em>jspdf</em>) untuk rapor/sertifikat, dengan
        <strong>PocketBase</strong> sebagai basis data & otentikasi.
      </p>
      <p class="small mb-0">
        Dilisensikan di bawah lisensi MIT &mdash; lihat berkas <em>LICENSE</em> pada repositori.
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })
useHead({
  title: "Cooked By — e-PKL / SMK AL-FATAH BANJARNEGARA.",
  meta: [
    { name: "description", content: "Dibuat oleh Muhammad Nadhif Raka Saputra (@ndhfrka) — Aplikasi Pemetaan, Jurnal Harian, dan Absensi Peserta PKL (Praktik Kerja Lapangan) tingkat SMK." }
  ]
})
</script>
