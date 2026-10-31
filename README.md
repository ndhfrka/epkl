# 📚 EPKL – Sistem Jurnal Praktik Kerja Lapangan

## Deskripsi Singkat
`epkl` adalah aplikasi **Jurnal PKL** (Praktek Kerja Lapangan) berbasis **React Native**/Flutter (untuk mobile) dan **Nuxt 3** (untuk web) yang memungkinkan guru, siswa, dan institusi memantau, mencatat, serta menilai kegiatan PKL secara real‑time.

## Fitur Utama
- **Geofencing**: memeriksa lokasi perangkat dengan GPS dan menampilkan status berada di zona PKL.
- **Manajemen Akun**: akun guru, siswa, dan instansi dengan role‑based access.
- **Monitoring Jurusan**: tiap jurusan (PPLG, TKR, AKL) dapat dipantau oleh guru masing‑masing.
- **Ekspor PDF**: jurnal dapat diekspor menjadi PDF yang siap di‑upload.
- **API PocketBase**: backend ringan berbasis SQLite, mudah di‑deploy.
- **Responsive UI**: desain modern dengan dark mode, mengikuti standar aksesibilitas (kontras ≥ 4.5:1, fokus visual, dll.).

## Cara Instalasi
```bash
# Clone repo
git clone https://github.com/ndhfrka/epkl.git
cd epkl

# Backend (PocketBase)
cd pocketbase
./pocketbase serve   # jalankan pada http://127.0.0.1:8090

# Frontend (Web – Nuxt 3)
cd epkl4-pb   # contoh folder Nuxt
npm install
npm run dev   # http://localhost:3000

# Mobile (React Native – Expo)
cd epkl4-siswa-main
npm install -g expo-cli
expo start
```
> **Catatan:** Pastikan Node ≥ 18 dan Git terinstal.

## Penggunaan
1. **Login** dengan akun yang telah terdaftar (guru, siswa, atau admin).
2. Pada halaman **Home**, pilih jurusan untuk melihat data siswa terkait.
3. Pada halaman **Geofence**, aplikasi akan otomatis memeriksa lokasi dan menampilkan status:
   - `Berada di lokasi PKL` – bila berada dalam radius yang telah ditentukan.
   - `Di luar lokasi PKL` – bila di luar.
4. Gunakan tombol **Ekspor PDF** pada jurnal untuk menghasilkan file PDF.

## Screenshot (contoh)
![Home Dashboard](https://raw.githubusercontent.com/ndhfrka/epkl/main/docs/home.png)
![Geofence Status](https://raw.githubusercontent.com/ndhfrka/epkl/main/docs/geofence.png)

## Kontribusi
Kami mengundang kontributor untuk memperbaiki bug, menambah fitur, atau meningkatkan UI/UX.
1. Fork repositori ini.
2. Buat branch baru: `git checkout -b fitur-baru`.
3. Commit perubahan Anda dan push ke fork.
4. Buat Pull Request ke branch `master`.

## Lisensi
Proyek ini dilisensikan di bawah **MIT License** – lihat file `LICENSE` untuk detail.

---

*Didukung oleh **PocketBase** dan **Expo** – solusi cepat untuk aplikasi mobile dan web.*
