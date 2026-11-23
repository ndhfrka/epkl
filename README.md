# ePKL — elektronik Praktik Kerja Lapangan

![version](https://img.shields.io/badge/version-3.0-blue) ![frontend](https://img.shields.io/badge/Nuxt-3.x-00DC82) ![backend](https://img.shields.io/badge/PocketBase-0.40-brightgreen) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

**ePKL** adalah aplikasi **Kehadiran & Jurnal Peserta PKL** untuk SMK (PPLG, TKR, AKL). Aplikasi ini ditulis ulang dari Python/Django menjadi JavaScript (Vue/Nuxt) dan memakai **PocketBase** sebagai backend, serta sengaja dipisah antara **aplikasi siswa** dan **aplikasi guru** agar mudah dikembangkan. Fitur terus berkembang sejalan dengan Kurikulum dan kebutuhan sekolah.

> 💡 Repo ini berisi aplikasi siswa (`epkl4-siswa-main`) beserta backend PocketBase siap pakai. Fitur Portofolio dan Karya Ilmiah dihilangkan sejak v2.4.

---

## 🆕 Perkembangan Terbaru

| Fitur | Keterangan |
|---|---|
| **Siap iPhone & "Add to Home Screen" (PWA)** | Ikon Home Screen iOS (`apple-touch-icon.png` 180×180 dari logo sekolah) + manifest PWA (`icon-192/512`, `display: standalone`, tema gelap #09101e) + `theme-color`. Ditambah ke Home Screen, ePKL tampil layar penuh seperti aplikasi native — di atas dukungan safe-area iPhone yang sudah ada (`--m3-safe-*`, nav bawah tidak tertimpa home indicator) |
| **Siap Deploy Online Gratis (Netlify + ngrok + Cloudflare Worker)** | Aplikasi dapat dibuka dari mana saja tanpa biaya: frontend statis di-hosting Netlify, PocketBase tetap berjalan di PC sekolah dan dijangkau lewat **domain statis ngrok** (alamat tidak berubah walau tunnel direstart). Client PocketBase otomatis menyuntik header `ngrok-skip-browser-warning` bila host API adalah domain ngrok, dan jembatan `cf-worker-proxy.js` (Cloudflare Worker gratis, 100 ribu request/hari) menyuntik header yang sama di sisi server sehingga **realtime (`EventSource`) serta foto (`<img>`) lolos halaman peringatan akun gratis ngrok**. Skrip `jalankan-server.sh` menyalakan PocketBase + tunnel dalam satu perintah |
| **Item Menu Aktif Drawer Lebih Jelas (Tema Terang)** | Di HP (menu ☰), item menu yang sedang aktif memakai warna `secondary-container` yang di tema terang pucat (#dae0f6) di atas latar drawer #dde3ed — nyaris tak berbeda sehingga sulit tahu sedang di halaman apa. Kini di tema terang item aktif memakai pil biru brand (#2563eb → #1d4ed8) dengan teks & ikon putih, sama tegas dengan sidebar desktop; mode gelap tetap memakai secondary-container #3b4758 |
| **Perbaikan Teks Tak Terlihat Setelah Login** | Akar masalah: pola `:global(html…)` di `<style scoped>` halaman login dimangkai compiler Vue menjadi rule global `html { … }` — `-webkit-text-fill-color` warna terang melanda seluruh halaman sehingga teks kertas putih agenda `/jurnal` lenyap setelah login. Rule input login kini scoped murni lewat variabel tema baru (`--md-sys-color-input-text` / `--md-sys-color-input-fill-bg`), badge galeri dipindah ke theme.css, dan kertas agenda diberi sawar `-webkit-text-fill-color: currentColor` |
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

## 🌐 Deploy Online Gratis (Netlify + ngrok)

Cara agar aplikasi bisa dibuka dari mana saja (bukan hanya jaringan sekolah) **tanpa biaya**: PocketBase tetap berjalan di PC, dijangkau publik lewat **domain statis ngrok**, dilindungi dari halaman peringatan ngrok oleh **jembatan Cloudflare Worker**, dan **aplikasi jadi disajikan langsung dari PocketBase** (folder `pocketbase/pb_public`) sehingga cukup **satu URL** untuk semuanya.

> **Status: SUDAH LIVE** — build statis sudah ditempatkan di `pb_public` dan aplikasi bisa dibuka di **https://epkl-api.nadhifbasmalah00.workers.dev** (aplikasi + API + realtime + foto dalam satu origin, tanpa CORS). Langkah B (Netlify) menjadi **opsional**.

> Syarat: PC tempat PocketBase berjalan harus menyala saat aplikasi dipakai. Seluruh langkah di bawah ini **Rp0**.

### A. Sisi PC — tunnel ngrok untuk PocketBase

1. Daftar gratis di [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup), lalu salin **authtoken** dari menu *Your Authtoken*.
2. **Domain statis gratis dialokasikan otomatis** untuk endpoint pertama akun Anda — contoh nyata: `nervous-ferret-squander.ngrok-free.dev`. Alamatnya bisa dilihat di dashboard (menu *Endpoints*/*Domains*) atau di antarmuka lokal `http://127.0.0.1:4040` saat tunnel berjalan.
3. Autentikasi ngrok (sekali saja, disimpan permanen di folder konfigurasi pengguna):
   ```bash
   ./ngrok/ngrok config add-authtoken <AUTHTOKEN_ANDA>
   ```
4. Jalankan PocketBase + tunnel sekaligus dari folder repo ini:
   ```bash
   bash jalankan-server.sh            # domain otomatis dari ngrok
   bash jalankan-server.sh <domain>   # atau paksa domain tertentu
   ```
   Skrip ini menyalakan `pocketbase serve --http=0.0.0.0:8090` dan `ngrok http --traffic-policy-file=ngrok-policy.yml 8090`, lalu menampilkan URL publik aktif dan menguji `/api/health`.

   > **Tentang `ngrok-policy.yml`** — akun gratis ngrok menyisipkan halaman peringatan *"You are about to visit …"* (ERR_NGROK_6024) untuk request yang User-Agent-nya terlihat seperti browser dan tidak membawa header `ngrok-skip-browser-warning`. Traffic policy **tidak cukup** menghilangkannya (pemeriksaan berjalan sebelum policy), tetapi dipertahankan sebagai lapisan tambahan. Yang benar-benar menolong: (1) `composables/pocketBaseClient.js` menyuntik header tersebut untuk semua panggilan `fetch` bila host API adalah domain ngrok; (2) **jembatan Cloudflare Worker** di bawah menangani sisa request yang tidak bisa membawa header dari browser (`<img>` foto/TTD dan `EventSource` realtime).
5. Uji cepat manual (pakai User-Agent browser + header): `curl -A "Mozilla/5.0" -H "ngrok-skip-browser-warning: ePKL" https://<domain-ngrok>/api/health` harus membalas JSON, bukan halaman peringatan.

### A+. Jembatan Cloudflare Worker (disarankan, Rp0)

Cloudflare Workers paket gratis (100.000 request/hari, tanpa kartu kredit) menjadi perantara: browser → `*.workers.dev` → ngrok → PocketBase. Worker menyuntik header bypass ngrok di sisi server sehingga **foto (`<img>`) dan realtime (`EventSource`) ikut lolos halaman peringatan** — sesuatu yang mustahil dilakukan dari sisi browser.

1. Daftar gratis di [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) (bisa login pakai Google/GitHub).
2. Dashboard → *Workers & Pages* → *Create* → pilih template *Hello World* → beri nama, mis. `epkl-api` → *Deploy* → *Edit code*.
3. Ganti seluruh isi editor dengan kode dari [`cf-worker-proxy.js`](cf-worker-proxy.js) (sesuaikan `TARGET` bila domain ngrok Anda berbeda) → *Deploy*.
4. URL Worker menjadi pintu API: `https://epkl-api.nadhifbasmalah00.workers.dev` — simpan alamat ini untuk langkah B. (Catatan: sertifikat `*.workers.dev` diproses beberapa menit setelah deploy pertama; bila sempat gagal TLS, tunggu lalu ulangi.)

### A++. Memperbarui aplikasi yang sudah live (mode satu-URL)

Setelah mengubah kode aplikasi, bangun ulang versi statis lalu tempatkan ke folder yang disajikan PocketBase:

```bash
cd epkl4-siswa-main
PB_API_PORT=443 npm run generate          # port 443 = jalur Worker
rm -rf ../pocketbase/pb_public/*
cp -r .output/public/. ../pocketbase/pb_public/
```

Tidak perlu env `PB_API_BASE_URL` — aplikasi memakai origin-nya sendiri. Untuk dipakai di LAN tanpa internet, `http://<ip-pc>:8090` kini juga menyajikan aplikasi jadi yang sama.

### B. Sisi Netlify — frontend statis (opsional)

1. Pastikan seluruh perubahan sudah **di-push ke GitHub** (Netlify membangun dari repo).
2. Masuk [app.netlify.com](https://app.netlify.com) (bisa login pakai akun GitHub) → *Add new site* → *Import an existing project* → pilih repo.
3. Isi konfigurasi build:
   - **Base directory**: `epkl4-siswa-main`
   - Build command & publish directory otomatis terbaca dari `epkl4-siswa-main/netlify.toml` (`npm run generate` → `.output/public`, lengkap dengan redirect SPA).
4. Tambahkan **environment variables** sebelum build pertama (*Site configuration → Environment variables*, kemudian *Clear cache & deploy site*):
   - `PB_API_BASE_URL` = `https://epkl-api.nadhifbasmalah00.workers.dev` ← URL jembatan Worker, **tanpa** `:port`
   - `PB_API_PORT` = `443`
5. Setelah build selesai, aplikasi live di `https://<nama-situs>.netlify.app` — daftar/diakses siswa & guru dari mana saja.

> **Catatan**: di deploy statis, waktu server (`/api/server-time`) tidak tersedia sehingga aplikasi otomatis memakai waktu perangkat (label *"Waktu Lokal"*) — perilaku ini sudah tertangani di `composables/useServerTime.js`. Dasbor admin PocketBase ikut terekspos publik di `https://<domain>/_/` — gunakan kata sandi superuser yang kuat.

## 🗃️ Koleksi Database PocketBase

Skema dikelola lewat migrasi di `pocketbase/pb_migrations/`, antara lain:

`student_users`, `teacher_users`, `iduka` + `iduka_users`, `pembimbing`, `pemetaan_pkl`, `pemetaan_pembimbing`, `pemetaan_group_by_iduka`, `jurnal` + `jurnal_komentar` + `jurnal_publik` + `ttd_jurnal`, `absen`, `rekapan_bulanan`, `nilai`, `proyek`, `cp` + `elemen_cp`, `sertifikat`, `agenda_info`, `lokasi_pkl`, `walikelas`, `rombel`, `pengaturan`, `program_keahlian`, `siswa`

Koleksi `nilai` dilindungi aturan akses: hanya **guru pembimbing** terkait atau **instansi** terpetakan yang dapat membuat/memperbarui nilai (delete dinonaktifkan).

> ⚠️ `pb_data/` berisi **data nyata** — berhati-hatilah saat membagikan atau melakukan commit.

## 📜 Riwayat Versi

Riwayat lengkap ada di [`epkl4-siswa-main/CHANGELOG.md`](epkl4-siswa-main/CHANGELOG.md). Ringkasan:

- **v3.0** (18 Agustus 2026) — major version, perbaikan semua fitur
- **Pembaruan 21 November 2026** — satu jurnal per hari (bisa diedit selama belum divalidasi), geofence jurnal ±100 m, hari libur otomatis, urutan tabel per tanggal, perbaikan edit nilai guru & instansi, filter bulan & tahun bergaya aplikasi, perbaikan tampilan login, mode terang menyeluruh
- **Pembaruan 23 November 2026** — tema terang halaman tambah jurnal; login siswa & guru dalam satu request via hook PocketBase (tanpa error 400 palsu di console saat login akun guru); perbaikan kontras badge status di tabel agenda Jurnal mode gelap & teks menu samping/bawah yang tak terlihat di tema terang; **perbaikan akar bug teks tak terlihat setelah login** — rule `-webkit-text-fill-color` liar dari `:global(html…)` yang dimangkai compiler Vue menimpa warna teks seluruh halaman, kini input login scoped murni via variabel tema & kertas agenda diberi sawar teks; **item menu aktif drawer (menu ☰ HP) tema terang kini pil biru brand dengan teks putih** agar jelas sedang berada di halaman apa; dukungan **deploy online gratis** (frontend Netlify + tunnel ngrok domain statis untuk PocketBase dengan `jalankan-server.sh` + `ngrok-policy.yml`, serta jembatan `cf-worker-proxy.js` Cloudflare Worker untuk melewati halaman peringatan ngrok pada foto & realtime)
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
