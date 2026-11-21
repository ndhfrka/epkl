# ePKL — Aplikasi Peserta (Siswa)

Aplikasi web peserta PKL untuk SMK (PPLG, TKR, AKL) — dibangun dengan [Nuxt 3](https://nuxt.com) (SPA) dan [PocketBase](https://pocketbase.io) sebagai backend. Aplikasi ini sengaja dipisah dari aplikasi guru agar mudah dikembangkan.

> 📘 Dokumentasi lengkap (struktur repo, backend PocketBase, variabel lingkungan, cara menjalankan) ada di [`README.md`](../README.md) di root repo.

## Fitur Utama

- **Jurnal Harian** — kegiatan + foto (auto-kompres & watermark), simpan draf, filter per Elemen
- **Kehadiran (Absen)** — otomatis terisi dari kegiatan jurnal
- **Nilai** — melihat nilai PKL (read-only); pengisian & pembaruan hanya oleh guru pembimbing / instansi
- **Proyek / Self Project** — penyerahan proyek terpetakan dengan PKL & Guru Pembimbing
- **IDUKA** — profil industri tempat PKL, pembimbing, dan pemetaan PKL
- **Galeri & Lokasi PKL** — dokumentasi kegiatan dan peta lokasi
- **Mode Gelap / Terang** — tema mengikuti preferensi sistem

## Ingredients

- [Node.js](https://nodejs.org) or [Bun](https://bun.dev) or [Deno](https://deno.com)

## Setup

```bash
bun install
```
or
```bash
npm install
```

## Development Server

```bash
bun run dev
```
or
```bash
npm run dev
```

> Dev server berjalan di port `3001` — jangan diubah agar tidak rancu dengan instance lain.

## Production

```bash
bun run build
```
or
```bash
npm run build
```

## Backend PocketBase

Aplikasi ini membutuhkan server PocketBase (0.40) yang berjalan di `127.0.0.1:8090` — langkah lengkapnya (unduh binary, seeding data, dsb.) ada di [`README.md`](../README.md) di root repo.
