<template>
  <nuxt-link to="/" class="btn btn-light btn-sm border border-2 border-dark"><i class="bi bi-arrow-left"></i>
    Kembali</nuxt-link>
  <nuxt-link to="/terms" class="btn btn-dark btn-sm border border-2 border-dark ms-2">Aturan & Syarat Penggunaan</nuxt-link>
  <div class="card mt-3">
    <div class="card-header fw-bold fs-5">
      Kebijakan Privasi
    </div>
    <div class="card-body text-dark">
      <p class="text-muted small">
        Diperbaharui pada 21 November 2026
      </p>
      <p>
        Kebijakan Privasi ini bertujuan untuk membantu Anda memahami data yang kami kumpulkan. Dengan
        menggunakan aplikasi e-PKL, maka Anda setuju dengan dokumen kebijakan privasi ini.
      </p>

      <h5 class="fw-bold text-grey">Informasi yang Kami Simpan</h5>

      <div class="fw-bold">Informasi Personal</div>
      <p>
        Kami menyimpan informasi personal Anda diantaranya Nama, Email, Kelas/Jurusan (Program Keahlian),
        Kata Sandi, serta Peran akun (Peserta Didik, Guru Pembimbing, atau Instansi) yang digunakan untuk
        pembagian otoritas di dalam aplikasi.
      </p>

      <div class="fw-bold">Informasi Jurnal Harian</div>
      <p>
        Kami mengumpulkan dan menyimpan aktivitas jurnal harian Anda pada masing-masing program keahlian,
        diantaranya uraian kegiatan, elemen Mapel PKL yang dipilih, tanggal agenda, swafoto/berkas foto
        pendukung, serta status validasi dari Guru Pembimbing Jurusan.
      </p>

      <div class="fw-bold">Informasi Absensi</div>
      <p>
        Kami menyimpan catatan kehadiran harian Anda dengan tanda Hadir (&#10003;), Sakit (S), Izin (I),
        Alpa (A), dan Libur (L). Sebagian tanda dibuat otomatis oleh sistem berdasarkan jurnal yang Anda
        kirim: jurnal yang memuat kata <em>sakit</em> atau <em>izin</em> otomatis menandai absensi
        sesuai, dan apabila Anda tidak mengisi jurnal hingga batas pukul 18.00 WIB maka otomatis dicatat
        sebagai Alpa. Menghapus jurnal juga akan menghapus baris absensi yang bersangkutan.
      </p>

      <div class="fw-bold">Informasi Nilai</div>
      <p>
        Kami mengumpulkan dan menyimpan nilai PKL yang diserahkan oleh peserta didik untuk kemudian
        diperiksa dan divalidasi oleh Guru Pembimbing sekolah.
      </p>

      <div class="fw-bold">Informasi IDUKA & Lokasi</div>
      <p>
        Kami menyimpan data tempat Praktik Kerja Lapangan (IDUKA) seperti nama instansi, pimpinan,
        kontak, alamat, serta koordinat lokasi yang digunakan untuk menampilkan peta sebaran tempat
        magang milik Anda dan teman-teman.
      </p>

      <div class="fw-bold">Preferensi Tampilan</div>
      <p>
        Pilihan mode tampilan gelap/terang Anda disimpan pada perangkat Anda sendiri (<em>localStorage</em>)
        dan tidak dikirim ke server.
      </p>

      <h5 class="fw-bold text-grey">Bagaimana Kami Menggunakan Informasi Anda</h5>
      <p>
        Informasi personal Anda kami gunakan untuk pembagian otoritas pada masing-masing program keahlian
        diantaranya mengelola Elemen Mapel PKL, Guru Pembimbing, IDUKA, Jurnal harian, dan Absensi.
      </p>
      <p>
        Kami menggunakan jurnal harian peserta untuk mengelompokkan aktivitas harian sesuai Elemen Mapel
        PKL, sebagai bahan validasi oleh Guru Pembimbing, serta untuk analitik data.
      </p>
      <p>
        Kami menggunakan informasi absensi untuk menyusun rekap kehadiran bulanan (Hadir, Sakit, Izin,
        Alpa, Libur) yang ditampilkan pada dashboard peserta dan dapat dipantau oleh Guru Pembimbing.
      </p>
      <p>
        Sistem juga menjadwalkan pemeriksaan otomatis pada pukul 18.00 WIB (waktu server) untuk menandai
        peserta yang belum mengisi jurnal pada hari tersebut sebagai Alpa, sekaligus mengirim pengingat
        pada notifikasi aplikasi.
      </p>
      <p>
        Kami menggunakan nilai peserta didik untuk Rapor PKL dan/atau pencetakan Sertifikat.
      </p>
      <p>
        Informasi IDUKA dan koordinat lokasi kami gunakan untuk menampilkan peta sebaran tempat magang
        pada halaman Lokasi PKL.
      </p>

      <h5 class="fw-bold text-grey">Bagaimana Kami Menjaga Keamanan Informasi Anda</h5>
      <p>
        Kami mengupayakan menjaga keamanan seluruh informasi Anda tetap aman agar tidak dicuri.
        Sebagai contoh, kami menyimpan <em>password</em> menggunakan mekanisme <em>hashing</em>, tidak
        dalam bentuk karakter asli. Selain itu kami membatasi akses terhadap semua informasi yang
        tersimpan pada aplikasi e-PKL, dengan kata lain hanya yang memiliki akun dan otoritas tertentu
        yang dapat mengakses informasi di dalam aplikasi e-PKL.
      </p>
      <p>
        Jurnal harian yang telah divalidasi oleh Guru Pembimbing Jurusan akan dikunci: peserta didik
        tidak lagi dapat mengubah atau menghapusnya, sehingga catatan kehadiran dan jurnal yang telah
        disetujui tidak dapat diubah diam-diam.
      </p>
      <p>
        Apabila seluruh/salah satu informasi terekspos dan disalahgunakan dengan/tanpa sengaja oleh Anda,
        maka itu menjadi tanggung jawab Anda.
        Kami tidak akan menggunakan informasi Anda untuk hal-hal lain di luar aplikasi e-PKL.
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })
useHead({
  title: "Kebijakan Privasi — e-PKL / SMK AL-FATAH BANJARNEGARA.",
  meta: [
    { name: "description", content: "Kebijakan Privasi pada SaaS/App Pemetaan, Jurnal Harian, dan Absensi Peserta PKL (Praktik Kerja Lapangan) tingkat SMK." }
  ]
})
</script>
