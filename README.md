# ePKL — elektronik Praktik Kerja Lapangan

![version](https://img.shields.io/badge/version-3.0-blue) ![frontend](https://img.shields.io/badge/Nuxt-3.x-00DC82) ![backend](https://img.shields.io/badge/PocketBase-0.21-brightgreen) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

**ePKL** adalah aplikasi **Kehadiran & Jurnal Peserta PKL** untuk SMK (PPLG, TKR, AKL). Aplikasi ini ditulis ulang dari Python/Django menjadi JavaScript (Vue/Nuxt) dan memakai **PocketBase** sebagai backend, serta sengaja dipisah antara **aplikasi siswa** dan **aplikasi guru** agar mudah dikembangkan. Fitur terus berkembang sejalan dengan Kurikulum dan kebutuhan sekolah.

> 💡 Repo ini berisi aplikasi siswa (`epkl4-siswa-main`) beserta backend PocketBase siap pakai. Fitur Portofolio dan Karya Ilmiah dihilangkan sejak v2.4.

---

## 🆕 Perkembangan Terbaru

| Fitur | Keterangan |
|---|---|
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
- **Nilai** — lihat & input nilai PKL
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
| Backend | [PocketBase](https://pocketbase.io) 0.21 (BaaS berbasis [Go](https://go.dev)) — auth, SQLite, file storage |
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

> ⚠️ `pb_data/` berisi **data nyata** — berhati-hatilah saat membagikan atau melakukan commit.

## 📜 Riwayat Versi

Riwayat lengkap ada di [`epkl4-siswa-main/CHANGELOG.md`](epkl4-siswa-main/CHANGELOG.md). Ringkasan:

- **v3.0** (18 Agustus 2026) — major version, perbaikan semua fitur
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
