# ePKL — elektronik Praktik Kerja Lapangan

![version](https://img.shields.io/badge/version-3.0-blue) ![frontend](https://img.shields.io/badge/Nuxt-3.x-00DC82) ![backend](https://img.shields.io/badge/PocketBase-0.40-brightgreen) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

**ePKL** adalah aplikasi **Kehadiran & Jurnal Peserta PKL** untuk SMK (PPLG, TKR, AKL). Aplikasi ini ditulis ulang dari Python/Django menjadi JavaScript (Vue/Nuxt) dan memakai **PocketBase** sebagai backend, serta sengaja dipisah antara **aplikasi siswa** dan **aplikasi guru** agar mudah dikembangkan. Fitur terus berkembang sejalan dengan Kurikulum dan kebutuhan sekolah.

> 💡 Repo ini berisi aplikasi siswa (`epkl4-siswa-main`) beserta backend PocketBase siap pakai. Fitur Portofolio dan Karya Ilmiah dihilangkan sejak v2.4.

---

## 🆕 Perkembangan Terbaru

| Fitur | Keterangan |
|---|---|
| **Login Siswa & Guru Satu Request** | Endpoint `POST /api/epkl/login` (hook PocketBase `pb_hooks/epkl_login.pb.js`) mengautentikasi `student_users` & `teacher_users` dalam satu panggilan — login akun guru tidak lagi meninggalkan error 400 palsu di console browser; frontend otomatis kembali ke alur lama bila hook tidak tersedia |
| **Tema Terang Halaman Tambah Jurnal** | Textarea & area unggah foto di halaman "Tambah Jurnal" kini mengikuti tema terang/gelap — warna gelap hardcoded diganti variabel tema, konsisten di tampilan mobile maupun desktop |
| **Filter Bulan & Tahun Bergaya Aplikasi** | Dropdown filter di halaman Jurnal & Absen diganti dari `<select>` native — kini tema-aware (terang/gelap), animasi halus, tanda centang opsi aktif; tidak lagi melempar frame popup mentah browser di tampilan mobile |
| **Perbaikan Halaman Login** | Dropdown "akun tersimpan" Chrome yang menimpa kolom password di tampilan mobile ditiadakan (`autocomplete` disetel benar); alur login tidak berubah |
| **Satu Jurnal per Hari** | Siswa hanya dapat meng-upload **satu jurnal per tanggal** — selama belum divalidasi guru, isian masih dapat diubah kembali melalui ikon pensil; setelah divalidasi terkunci |
| **Geofence Jurnal** | Jurnal hanya bisa diisi saat siswa berada dalam radius **±100 meter** dari lokasi IDUKA — kecuali berstatus **Sakit/Izin** |
| **Hari Libur Otomatis (L)** | Minggu & hari libur (daftar di `composables/hariLibur.js`) otomatis muncul sebagai baris bertanda **L** pada tabel absen |
| **Urutan Tabel per Tanggal** | Baris jurnal & baris libur di halaman Proyek kini terurut **sesuai tanggal** — nomor urut 1, 2, 3, … tidak lagi melompat |
| **Perbaikan Edit Nilai** | Akun **guru** & **instansi (IDUKA)** dapat mengedit nilai yang sudah terisi tanpa error — perbaikan API rules PocketBase (perbandingan `?=`) |
| **Mode Terang Menyeluruh** | Halaman validasi, galeri, elemen, dashboard & modal pilih siswa konsisten pada mode terang; animasi pemilihan elemen lebih halus |
| **Filter Absen Bulan Berjalan** | Tabel absen secara default menampilkan **bulan berjalan** |
| **Kontrol Akses Nilai** | Nilai hanya dapat diisi/diperbarui oleh **guru pembimbing** atau **instansi (IDUKA)** — siswa hanya dapat melihat; dijaga di sisi UI maupun aturan akses (API rules) PocketBase |
| **Perbaikan Jurnal SPA** | Jurnal & agenda tidak lagi kosong saat berpindah halaman tanpa refresh — data dimuat otomatis mengikuti identitas user yang masuk |
| **Galeri Foto Kegiatan PKL** | Halaman galeri foto dokumentasi — guru melihat sesuai jurusan pembinaannya, admin melihat semua jurusan, siswa melihat dokumentasi sendiri |
| **Waktu Server Resmi (WIB)** | Endpoint `server/api/server-time.get.ts` + composable `useServerTime` — mencegah manipulasi tanggal/jam dari perangkat siswa; indikator waktu server tampil di halaman validasi guru |
| **Absen Otomatis dari Jurnal** | Setiap kegiatan jurnal yang di-upload otomatis menjadi baris absen (kolom "Jenis Kegiatan" + tanda ✓ pada tanggal terkait) |
| **Batas Pengisian Jurnal** | Setelah pukul **18.00 WIB** jurnal tidak bisa diisi dan siswa otomatis ditandai **ALPHA** |
| **Pengingat Otomatis (Lonceng)** | Notifikasi pengingat absen & jurnal mulai pukul **16.00 WIB** (`usePengingat` + `PengingatBell`) — state sinkron antar perangkat mobile & desktop |
| **Migrasi PocketBase baru** | `1794900073_updated_iduka`, `1794900073_updated_siswa`, `1794987303_updated_jurnal` |

---

## ✨ Fitur Utama

### Siswa
- **Autentikasi** — login, logout, ganti sandi, ubah password (middleware `auth.ts` / `check-auth.ts`)
- **Jurnal Harian** — tulis kegiatan + foto (auto-kompres `compressorjs`, konversi .jpg/.png/.webp, watermark), simpan **draf**, filter per Elemen, pagination load-more, persentase kesesuaian realtime
- **Kehadiran (Absen)** — tabel absen terisi otomatis dari kegiatan jurnal
- **Nilai** — melihat nilai PKL (read-only); pengisian & pembaruan hanya oleh guru pembimbing / instansi
- **Proyek / Self Project** — penyerahan proyek terpetakan dengan PKL & Guru Pembimbing
- **IDUKA** — profil industri tempat PKL, pembimbing, dan pemetaan PKL
- **Elemen & Capaian Pembelajaran (CP)** — referensi elemen CP per jurusan
- **Lokasi PKL** — peta Google Maps (iframe embed) dengan interstitium hemat koneksi
- **PDF** — ekspor dokumen via `jspdf`

### Guru / Admin
- **Validasi Jurnal** — validasi jurnal PKL khusus Guru Pembimbing Jurusan, dengan indikator waktu server resmi
- **Galeri Foto** — pantau dokumentasi kegiatan per jurusan
- **Pemantauan Siswa** (`useSiswaDipantau`) — monitoring siswa yang dibimbing
- **Komentar Jurnal** — guru dapat berkomentar pada jurnal siswa
- **Isi & Perbarui Nilai** — mengisi/memperbarui nilai PKL siswa bimbingannya (halaman `/nilai`)

### Instansi / IDUKA
- **Isi & Perbarui Nilai** — akun instansi (role `instansi` pada `teacher_users`) mengisi/memperbarui nilai peserta yang terpetakan ke IDUKA-nya
- **Pantau Peserta** — melihat jurnal & pemetaan peserta PKL yang ditempatkan di instansinya

---

## 🗂️ Struktur Repo

```
epkl/
├── epkl4-siswa-main/          # Aplikasi web siswa (Nuxt 3, SPA)
│   ├── pages/                 # dashboard, jurnal, nilai, proyek, galeri, iduka, ...
│   ├── components/            # Nav, M3Fab, M3NavigationDrawer, PengingatBell, ...
│   ├── composables/           # absenOtomatis, usePengingat, useServerTime, ...
│   ├── server/api/            # server-time (waktu resmi WIB)
│   ├── middleware/            # auth.ts, check-auth.ts
│   └── assets/css/theme.css   # tema Material Design 3
├── pocketbase/                # Backend PocketBase UTAMA (data produksi)
│   ├── pocketbase / .exe      # Binary server (Linux / Windows)
│   ├── pb_data/               # Database SQLite + file storage
│   ├── pb_migrations/         # Skema database (±300 migrasi)
│   └── _tools/                # Tooling pendukung
├── epkl4-pb/                  # Instance PocketBase kedua (sandbox)
└── _ARSIP_epkl4-pb-main_LAMA/ # Arsip versi lama (tidak dipakai)
```

## 🛠️ Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | [Nuxt 3](https://nuxt.com) (SPA/CSR), [Vue 3](https://vuejs.org), Bootstrap 5 + ikon Bootstrap |
| Backend | [PocketBase](https://pocketbase.io) 0.40 (BaaS berbasis [Go](https://go.dev)) — auth, SQLite, file storage |
| Lainnya | `compressorjs` (kompresi foto), `jspdf` (ekspor PDF), `@nuxtjs/device` (deteksi perangkat) |

## 🚀 Menjalankan

**1. Backend PocketBase** (port `8090`):

```bash
cd pocketbase
./pocketbase serve --http=127.0.0.1:8090        # Linux
pocketbase.exe serve --http=127.0.0.1:8090      # Windows
```

Admin UI tersedia di `http://127.0.0.1:8090/_/`.

**2. Aplikasi siswa** (port `3001` — **JANGAN diubah**, agar tidak rancu dengan instance lain):

```bash
cd epkl4-siswa-main
npm install        # atau: bun install
npm run dev        # atau: bun run dev
```

Buka `http://localhost:3001` — dev server listen di `0.0.0.0` sehingga juga bisa diakses via IP LAN.

**3. Variabel lingkungan** (opsional, ada default lokal):

| Variabel | Default | Keterangan |
|---|---|---|
| `PB_API_BASE_URL` | `http://127.0.0.1` | Alamat PocketBase |
| `PB_API_PORT` | `8090` | Port PocketBase |

## 🗃️ Koleksi Database PocketBase

Skema dikelola lewat migrasi di `pocketbase/pb_migrations/`, antara lain:

`student_users`, `teacher_users`, `iduka` + `iduka_users`, `pembimbing`, `pemetaan_pkl`, `pemetaan_pembimbing`, `pemetaan_group_by_iduka`, `jurnal` + `jurnal_komentar` + `jurnal_publik` + `ttd_jurnal`, `absen`, `rekapan_bulanan`, `nilai`, `proyek`, `cp` + `elemen_cp`, `sertifikat`, `agenda_info`, `lokasi_pkl`, `walikelas`, `rombel`, `pengaturan`, `program_keahlian`, `siswa`

Koleksi `nilai` dilindungi aturan akses: hanya **guru pembimbing** terkait atau **instansi** terpetakan yang dapat membuat/memperbarui nilai (delete dinonaktifkan).

> ⚠️ `pb_data/` berisi **data nyata** — berhati-hatilah saat membagikan atau melakukan commit.

## 📜 Riwayat Versi

Riwayat lengkap ada di [`epkl4-siswa-main/CHANGELOG.md`](epkl4-siswa-main/CHANGELOG.md). Ringkasan:

- **v3.0** (18 Agustus 2026) — major version, perbaikan semua fitur
- **Pembaruan 21 November 2026** — satu jurnal per hari (bisa diedit selama belum divalidasi), geofence jurnal ±100 m, hari libur otomatis, urutan tabel per tanggal, perbaikan edit nilai guru & instansi, filter bulan & tahun bergaya aplikasi, perbaikan tampilan login, mode terang menyeluruh
- **Pembaruan 23 November 2026** — tema terang halaman tambah jurnal; login siswa & guru dalam satu request via hook PocketBase (tanpa error 400 palsu di console saat login akun guru); perbaikan kontras badge status di tabel agenda Jurnal mode gelap & teks menu samping/bawah yang tak terlihat di tema terang
- **v2.10-rc** — pemisahan Guru Pembimbing dengan PIC Sekolah di IDUKA; jurnal & proyek wajib terpetakan
- **v2.8** — fitur Self Project; navigasi elemen ke NavTop, proyek ke NavBottom
- **v2.7** — konversi & kompresi foto jurnal otomatis; filter jurnal per Elemen
- **v2.6** — komentar guru pada jurnal siswa; indikator notifikasi di bottom nav
- **v2.5** — *save as draft* jurnal; fitur Mood siswa
- **v2.4** — rewrite dari Python (Django) ke JavaScript (Vue); migrasi ke PocketBase

## 👤 Penulis & Lisensi

- Author: **Muhammad Nadhif Raka Saputra** (@ndhfrka)
- Aplikasi siswa: lisensi **MIT**
- Dikembangkan untuk kebutuhan sekolah SMK Al Fatah Banjarnegara
