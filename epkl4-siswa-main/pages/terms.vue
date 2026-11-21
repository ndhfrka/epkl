<template>
  <nuxt-link to="/" class="btn btn-light btn-sm border border-2 border-dark"><i class="bi bi-arrow-left"></i>
    Kembali</nuxt-link>
  <nuxt-link to="/privacy" class="btn btn-dark btn-sm border border-2 border-dark ms-2">Kebijakan Privasi</nuxt-link>
  <div class="card mt-3">
    <div class="card-header fw-bold fs-5">
      Aturan dan Syarat Penggunaan
    </div>
    <div class="card-body text-dark">
      <p class="text-muted small">
        Diperbaharui pada 21 November 2026
      </p>

      <h5 class="fw-bold text-grey">Akun Anggota e-PKL</h5>
      <ul>
        <li>Peserta didik aktif di SMK AL-FATAH BANJARNEGARA.</li>
        <li>Setiap anggota yang terdaftar artinya sepakat dengan Kebijakan Privasi aplikasi e-PKL.</li>
        <li>Setiap anggota berhak dan dianjurkan memperbaharui password secara berkala melalui halaman
          Ganti Sandi.</li>
        <li>e-PKL berhak menonaktifkan akun anggota apabila terjadi hal lain misalnya cuti atau
          mengundurkan diri.</li>
      </ul>

      <h5 class="fw-bold text-grey">Terkait Elemen</h5>
      <ul>
        <li>
          Berdasarkan <nuxt-link to="https://uploads.belajar.id/document/files/Panduan_Praktik_Kerja_Lapangan_Sebagai_Mata_Pelajaran_Dalam_Implementasi_Kurikulum_Merdeka_01j7gc39ne8pwwze47qwf12a5s.pdf" target="_blank">Panduan Direktorat SMK</nuxt-link>
          (edisi revisi tahun 2024) Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi terkait elemen Capaian Pembelajaran (CP)
          PKL sebagai Mata Pelajaran dalam implementasi kurikulum merdeka.
        </li>
        <li>Elemen berisi CP dan tujuan Mapel PKL.</li>
        <li>Elemen ini akan digunakan oleh peserta didik untuk mengisi Jurnal Harian.</li>
        <li>Jobdesc yang tidak sesuai dengan elemen dan bukan lintas keahlian, gunakan <strong>Lain-lain</strong>.</li>
      </ul>

      <h5 class="fw-bold text-grey">Terkait Jurnal Harian</h5>
      <ul>
        <li>Jurnal harian merupakan aktivitas kegiatan harian peserta di IDUKA yang harus didokumentasikan.</li>
        <li>Jurnal diisi 1 x sehari sesuai elemen mapel PKL, lintas konsentrasi keahlian dan atau masih berhubungan
          dengan <em>jobdesc</em>.</li>
        <li>Peserta didik wajib menyematkan swafoto (<em>selfie</em>) menggunakan HP kedalam jurnal harian sesuai
          aktivitasnya.</li>
        <li>Jurnal dapat ditulis kapan saja, namun wajib terkirim sebelum batas pukul <strong>18.00 WIB</strong>
          (mengacu pada waktu server). Melewati batas tersebut, peserta dianggap <strong>Alpa</strong> pada hari
          bersangkutan dan akan muncul pengingat pada notifikasi aplikasi.</li>
        <li>Jurnal yang memuat kata <strong>sakit</strong> atau <strong>izin</strong> akan otomatis menandai absensi
          hari bersangkutan sebagai Sakit (S) atau Izin (I).</li>
        <li>Menghapus baris jurnal akan menghapus baris absensi yang bersangkutan, jadi pastikan kegiatan yang
          dihapus memang keliru.</li>
        <li>Guru Pembimbing akan memeriksa dan memvalidasi jurnal dengan status:
          <table class="table text-muted small mt-3">
            <tbody>
              <tr>
                <td><i class="bi bi-hourglass-split text-warning"></i> Menunggu Validasi</td>
                <td>: Jurnal sudah dikirim dan menunggu pemeriksaan Guru Pembimbing Jurusan.</td>
              </tr>
              <tr>
                <td><i class="bi bi-patch-check-fill text-success"></i> Sudah Tervalidasi</td>
                <td>: Jurnal dinyatakan sesuai dan dikunci otomatis.</td>
              </tr>
            </tbody>
          </table>
        </li>
        <li><strong>Jurnal yang sudah tervalidasi tidak dapat diedit atau dihapus lagi oleh peserta didik.</strong>
          Apabila ada kekeliruan, sampaikan kepada Guru Pembimbing untuk dikoreksi.</li>
        <li>Dilarang mengunggah foto dan teks yang mengandung SARA.</li>
        <li>Segala bentuk teks dan foto yang diunggah adalah tanggung jawab yang bersangkutan.</li>
      </ul>

      <h5 class="fw-bold text-grey">Terkait Absensi</h5>
      <ul>
        <li>Absensi peserta dicatat dengan tanda Hadir (&#10003;), Sakit (S), Izin (I), Alpa (A), dan Libur (L)
          pada tabel absensi bulanan.</li>
        <li>Sebagian tanda diisi otomatis oleh sistem: mengirim jurnal menandai Hadir, jurnal dengan kata
          sakit/izin menandai S/I, dan tidak mengisi jurnal hingga pukul 18.00 WIB menandai Alpa (A).</li>
        <li>Rekap kehadiran bulanan (Hadir, Sakit, Izin, Alpa, Libur) ditampilkan pada dashboard dan dapat
          dipantau oleh Guru Pembimbing.</li>
        <li>Apabila terdapat kekeliruan tanda absensi, sampaikan kepada Guru Pembimbing untuk diperiksa
          dan diperbaiki.</li>
      </ul>

      <h5 class="fw-bold text-grey">Terkait Nilai</h5>
      <ul>
        <li>Nilai akan digunakan untuk Rapor PKL dan/atau penitipan Sertifikat bagi IDUKA yang tidak dapat menerbitkan.</li>
        <li>Peserta didik berkewajiban menyerahkan nilai PKL yang diberikan oleh instruktur/pembimbing IDUKA melalui aplikasi e-PKL.</li>
        <li>Nilai yang diserahkan akan diperiksa oleh Guru pembimbing sekolah sampai dinyatakan valid.</li>
      </ul>

      <h5 class="fw-bold text-grey">Terkait IDUKA & Lokasi</h5>
      <ul>
        <li>Data IDUKA (pimpinan, kontak, alamat) wajib diisi dengan benar karena digunakan untuk
          administrasi pembimbingan.</li>
        <li>Lokasi IDUKA dapat ditampilkan pada peta sebaran tempat magang, sehingga pastikan titik
          lokasi yang dicatat akurat.</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'public' })
useHead({
  title: "Aturan dan Syarat Penggunaan — e-PKL / SMK AL-FATAH BANJARNEGARA.",
  meta: [
    { name: "description", content: "Aturan dan Syarat Penggunaan pada SaaS/App Pemetaan, Jurnal Harian, dan Absensi Peserta PKL (Praktik Kerja Lapangan) tingkat SMK." }
  ]
})
</script>
