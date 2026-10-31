# Mobile View Material Design 3 (M3) Implementation Plan

## Repository Research

### Stack & Arsitektur Saat Ini
- **Frontend**: Nuxt 3.21 (SSR false / SPA), Vue 3, Bootstrap 5.2, Bootstrap Icons 1.13
- **Tema saat ini**: Dark theme biru-hitam modern di `assets/css/theme.css` (Plus Jakarta Sans, radial gradient backgrounds)
- **Breakpoint**: Mobile = `max-width: 992px`, Desktop = `min-width: 992px`
- **Font aktif**: Plus Jakarta Sans (utama), Quicksand, Lexend Mega, Romana BT, Metropolis

### Layout Mobile Saat Ini (< 992px)
- **Top**: `NavbarTop.vue` — Bootstrap navbar-expand dengan 3-dots toggle (collapse menu: Elemen, Absen, Ubah Password, Keluar)
- **Bottom**: `NavFixedBottom.vue` — `fixed-bottom` Bootstrap, 5 tab (Home, IDUKA, Jurnal, Nilai, Absen), badge draft/komentar, border-top border-dark 3px, bg-white
- **Main slot**: Layout `default.vue` — `container-fluid` + `row`, kolom content full-width (side-nav display:none), margin-bottom 5.5em (`.mb-6`) untuk memberi ruang bottom nav
- **Safe-area**: Belum ada notch/safe-area support (iOS/Android notch)

### Halaman Aktif yang Perlu Tercakup Mobile UX
1. `/login` — Login form (card login)
2. `/` (index) — Dashboard profil + info PKL + rekapan bulanan + statistik
3. `/jurnal` & `/jurnal/tambah` — List jurnal + form buat jurnal
4. `/nilai` & `/nilai/tambah` — List nilai + form penilaian
5. `/proyek` (Absen PKL) — Grid absen bulanan
6. `/iduka`, `/elemen` — List IDUKA, Elemen CP
7. `/ubah-password`, `/logout` — Pengaturan akun

---

## Material Design 3 (M3) yang akan Diadopsi
Mengadopsi **M3 Dark theme** (agar cocok dengan tema biru-hitam eksisting) dengan menyesuaikan color tokens:

### 1. Color Tokens M3 (Dark Scheme)
Disesuaikan dengan palet biru `#3b82f6` sebagai Primary:
- `--md-sys-color-primary`: biru accent (#60a5fa / light primary)
- `--md-sys-color-on-primary`: #001f36 (tulisan di atas primary)
- `--md-sys-color-primary-container`: #004a77
- `--md-sys-color-on-primary-container`: #d4e3ff
- `--md-sys-color-secondary`: #bbc7db
- `--md-sys-color-surface`: #05080f (background)
- `--md-sys-color-surface-dim`: #03060c
- `--md-sys-color-surface-bright`: #1b2238
- `--md-sys-color-surface-container-lowest`: #03060c
- `--md-sys-color-surface-container-low`: #0a1120
- `--md-sys-color-surface-container`: #0d1424 (sesuai --epkl-surface)
- `--md-sys-color-surface-container-high`: #18213a
- `--md-sys-color-surface-container-highest`: #232d4a
- `--md-sys-color-on-surface`: #e2e8f0
- `--md-sys-color-on-surface-variant`: #c3c7d2
- `--md-sys-color-outline`: #8d9199
- `--md-sys-color-outline-variant`: #43474e
- `--md-sys-color-error`: #f87171
- `--md-sys-color-on-error`: #410002

### 2. Shape System M3
- Extra-small: 4dp, Small: 8dp, **Medium (default card/input): 12dp**, Large: 16dp, Extra-large: 28dp
- **Full-rounded buttons**: 40dp / full-bleed pill (sesuai M3 Filled / Outlined button)
- Navigation Bar container: shape large (top corners 16dp)
- Navigation active indicator: pill shape 16dp radius vertical, 28dp horizontal

### 3. Typography Scale M3 (menggunakan Plus Jakarta Sans)
- `display-small`: 36px / 44dp / Regular
- `headline-large`: 32px / 40dp
- `headline-medium`: 28px / 36dp
- `title-large`: 22px / 28dp / Medium
- `title-medium`: 16px / 24dp / Medium
- `title-small`: 14px / 20dp / Medium
- `body-large`: 16px / 24dp / Regular
- `body-medium`: 14px / 20dp / Regular
- `body-small`: 12px / 16dp / Regular
- `label-large`: 14px / 20dp / Medium
- `label-medium`: 12px / 16dp / Medium
- `label-small`: 11px / 16dp / Medium

### 4. Elevation M3 (Level 0 - 5)
Setiap level = shadow + surface tint blending:
- Level 0 (Flat): 0 shadow, surface
- Level 1 (Cards default): 0 1px 2px rgba(0,0,0,.3), 0 1px 3px 1px rgba(0,0,0,.15)
- Level 2 (Navigation Bar / elevated cards): 0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15)
- Level 3 (FAB): 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3)
- Level 4-5: untuk modal / dialog

---

## Files and Modules to Modify

| File | Change |
|------|--------|
| `epkl4-siswa-main/assets/css/theme.css` | Tambah tokens M3 lengkap (color, shape, elevation, type scale, state layer), override Bootstrap classes (.btn, .card, .form-control, .modal, .badge, .alert, .navbar, .nav, .list-group, .table, .form-select, dll.) ke gaya M3. Tambah safe-area insets notch. Tambah utility classes `.m3-*` (m3-btn-filled, m3-surface-container, dll). |
| `epkl4-siswa-main/components/NavFixedBottom.vue` | **OVERHAUL** menjadi **Navigation Bar M3** (spesifikasi M3 Navigation Bar): container elevation level 2, 3-5 destination dengan icon + label, active indicator pill-shape horizontal 28dp (warna secondary-container + on-secondary-container), ripple state, spacing 12dp antar item, height 80dp. Tambah safe-area-bottom untuk notch. Tetap support badge counter (draft/komentar) di atas icon. |
| `epkl4-siswa-main/components/NavbarTop.vue` | **OVERHAUL** menjadi **Small Top App Bar M3** (height 64dp, title left-aligned, icon leading + trailing actions): icon menu (untuk open drawer) di kiri, 1-2 icon actions (contoh: notif) di kanan, title app. Hapus navbar-toggle collapse Bootstrap (ganti dengan Navigation Drawer popup M3 untuk overflow menu: Elemen, Ubah Password, Keluar). Safe-area-top untuk notch. Container warna surface-container atau surface (default) dengan elevation level 0 scrolled → level 2. |
| `epkl4-siswa-main/layouts/default.vue` | Terapkan safe-area inset (top/bottom) di wrapper, hitung padding bottom otomatis sesuai tinggi Navigation Bar (80dp + env(safe-area-inset-bottom)). Tambahkan Navigation Drawer component (modal drawer M3) yang dipanggil oleh Top App Bar. Atur layout mobile agar content area memiliki max-width dan padding sesuai M3 (16dp kiri-kanan). |
| `epkl4-siswa-main/components/Header.vue` | Hapus border tebal, ubah menjadi card surface-container M3. Terapkan headline typography (title-large / headline-small) sesuai M3. Tetap fungsi sebagai brand header. |
| `epkl4-siswa-main/layouts/login.vue` | Terapkan M3 surface container + safe area. Gunakan component M3 style pada slot form login. |
| `epkl4-siswa-main/pages/index.vue` | Mobile layout: Profile card dengan M3 shape/elevation, Info PKL gunakan Assist chips / List items M3, Rekapan bulanan card M3, Stat card grid sesuai M3. Tambahkan **Extended FAB** (`+ Tambah Jurnal`) yang ditampilkan jika user peran siswa dan belum buat jurnal hari ini. |
| `epkl4-siswa-main/pages/jurnal/index.vue` | Tambah **FAB** di kanan-bawah (hanya mobile) untuk aksi `Buat Jurnal`. Card header ubah jadi M3 Medium Top App Bar section header. Chips filter (Agenda/List) ganti jadi Assist Chips M3. |
| `epkl4-siswa-main/pages/jurnal/tambah.vue` | Sesuaikan input form dengan M3 Outlined Text Fields. Buttons: Submit = Filled Button M3 (warna primary), Simpan Draft = Tonal Button M3. |
| `epkl4-siswa-main/pages/nilai/index.vue` | Card list siswa ubah menjadi M3 List Item dengan 3-line layout + trailing actions (Filled/Tonal buttons). |
| `epkl4-siswa-main/pages/proyek/index.vue` | Klik tanggal absen: tambah ripple M3 state, elevation/shape highlight untuk cell terpilih. Legend absen jadi Filter Chips M3. |
| `epkl4-siswa-main/components/M3NavigationDrawer.vue` | **COMPONENT BARU** (opsional tapi disarankan): Navigation Modal Drawer M3 yang muncul dari kiri (width max 360dp, 80% viewport). Isi: Header (profil user), list destinations (termasuk yang ada di Top App Bar overflow: Elemen, Ubah Password, Keluar). Gunakan typography label-large untuk items, active item = primary-container background. |
| `epkl4-siswa-main/components/M3Fab.vue` | **COMPONENT BARU**: FAB (Floating Action Button) M3 — ukuran Small (40x40), Regular (56x56), Large (96x96), Extended (dengan label). Support warna primary / secondary / tertiary container, elevation level 3 + state hover/pressed. Safe area bottom otomatis. |

---

## Implementation Steps (Dependency Order)

1. **Tambahkan CSS Design Tokens M3 di `theme.css`**
   - Semua variable `--md-sys-color-*`, `--md-sys-shape-corner-*`, `--md-sys-typescale-*`, `--md-sys-elevation-*`
   - Utility helpers: `.m3-surface-container`, `.m3-headline-medium`, `.m3-ripple`, dll.
   - Safe area utilities: `.m3-safe-top`, `.m3-safe-bottom`, `.m3-padding-content`
   - **Override** Bootstrap classes agar otomatis tampil M3: `.btn` → filled/tonal/outlined/text variants, `.card` → M3 card, `.form-control`, `.form-select` → M3 outlined text fields, `.modal`, `.badge`, `.alert`, `.navbar`, `.nav-link`, `.list-group-item`, `.table`

2. **Buat komponen baru `M3Fab.vue`** (reusable FAB) — agar bisa dipakai di banyak halaman

3. **Buat komponen baru `M3NavigationDrawer.vue`** (drawer menu) — reusable untuk overflow

4. **Overhaul `NavFixedBottom.vue` → Navigation Bar M3**
   - Container surface-container-highest, elevation level 2, height 80px + safe-bottom
   - 5 destinations: icon (24dp) + label (label-small), spacing 12dp
   - Active indicator pill: secondary-container, width mengikuti label
   - State layer + ripple hover/pressed
   - Badge counter tetap muncul di corner kanan atas icon
   - Hanya tampil di mobile (sesuai breakpoints lama)

5. **Overhaul `NavbarTop.vue` → Small Top App Bar M3**
   - Height 64px + safe-top
   - Leading: icon menu (bi-list) → klik buka Navigation Drawer
   - Title: nama user / "e-PKL"
   - Trailing: 1 action (contoh: notifikasi)
   - Scrolled behaviour: shadow muncul (elevation 0 → 2)
   - Menu collapse Bootstrap dihapus (diganti Drawer)

6. **Update `layouts/default.vue`**
   - Tambahkan M3NavigationDrawer, emit buka/tutup dari NavbarTop
   - Terapkan padding: top 64px (height top app bar) + safe-top, bottom 80px + safe-bottom
   - Content wrapper: padding horizontal 16dp (M3 body padding), max-width 100% mobile

7. **Update `Header.vue` dan `layouts/login.vue`** sesuai M3 surface & shape

8. **Halaman utama (mobile polish)**:
   - `/pages/index.vue` — Extended FAB, cards container tinggi
   - `/pages/jurnal/index.vue` — FAB aksi Buat Jurnal, chips filter
   - `/pages/jurnal/tambah.vue`, `/pages/nilai/tambah.vue` — form M3 text fields
   - `/pages/nilai/index.vue` — M3 list items with actions
   - `/pages/proyek/index.vue` — legend chips & cell ripple state

9. **Verifikasi lint/build** Nuxt tanpa error

---

## Dependencies and Considerations
- **Tidak menambah library eksternal**: Semua styling M3 murni via CSS tokens dan override Bootstrap (Bootstrap 5.2 sudah ter-install, Bootstrap Icons 1.13 sudah ada). Tidak perlu `material-components-web` / `vuetify` / `quasar` agar tidak bertabrakan dengan struktur saat ini.
- **Tetap kompatibel Desktop**: Semua selector CSS mobile-scoped via `@media (max-width: 992px)` untuk M3-specific. Desktop view menggunakan side-nav seperti semula (tidak dipengaruhi overhaul mobile — minimal perubahan).
- **State layer & Ripple**: Ripple sederhana via CSS `::after` + `:active` transform (tidak perlu JS complex). M3 state layer (opacity) via `:hover`, `:focus`, `:pressed` dengan color tokens (`--md-sys-color-on-primary` 8% overlay).
- **`useDevice()` / `$device.isMobile`**: Tetap pakai @nuxtjs/device (sudah aktif). Komponen NavFixedBottom dan NavbarTop hanya display di mobile, side-nav di desktop — *tidak berubah logic-nya*.
- **Bootstrap JS components (modal, collapse, tooltip)**: Tetap bisa dipakai. CSS M3 hanya meng-override styling tampilan, tidak merusak API Bootstrap JS.
- **Font**: Pertahankan Plus Jakarta Sans (sudah sesuai M3 sans-serif). Lexend Mega hanya untuk brand.
- **`theme.css` size**: Akan bertambah ~400-700 baris. Struktur dipecah dalam section komentar agar rapi: `/* === M3 COLOR TOKENS === */`, `/* === M3 TYPE SCALE === */`, `/* === M3 SHAPE === */`, `/* === M3 ELEVATION === */`, `/* === M3 STATE LAYER & RIPPLE === */`, `/* === M3 OVERRIDE BOOTSTRAP === */`, `/* === M3 SAFE AREA === */`.
- **Backward compatibility**: Semua kelas Bootstrap standar (`btn btn-primary`, `card`, `form-control`) TETAP BERFUNGSI — hanya tampilannya yang berubah jadi M3. Jadi halaman lama tidak perlu diedit satu-satu, perubahan otomatis dari theme.css override.

---

## Validation
1. **Visual check via browser (view mobile 360x800 / 390x844 / 412x915)**:
   - `/login` — form login tampil M3, safe area top/bottom, keyboard focus
   - `/` setelah login — Top App Bar + Navigation Bar + konten tidak terpotong notch
   - `/jurnal` — FAB muncul, Navigation Bar active state benar, cards tidak terpotong
   - `/jurnal/tambah` — text field outline M3, buttons filled/tonal terlihat benar
   - `/nilai`, `/nilai/tambah` — list & form M3
   - `/proyek` (Absen) — chips legend, cell state, tidak terpotong bottom
2. **Lint & type check**: Jalankan `npx nuxi prepare`, pastikan tidak ada Vue/Nuxt error di console browser
3. **Periksa desktop view**: Pastikan side-nav + desktop cards tidak hancur (hanya ada peningkatan minor M3 shape/elevation yang tidak mengganggu)
4. **Periksa safe-area**: Buka via mobile atau DevTools device iPhone 14 Pro / Samsung S24 — notch area tidak tertutup konten
5. **Test breakpoint rotasi landscape mobile**: Navigation Bar / Top App Bar behaviour sesuai

---

## Risks
| Risk | Mitigation |
|------|-----------|
| CSS override Bootstrap terlalu agresif merusak desktop layout | Semua selector mobile-M3 scoped dengan `@media (max-width: 992px)`. Desktop hanya get shape/elevation minor (misal border-radius card 12→16dp) yang tidak merusak struktur. |
| Navigation Drawer / FAB conflict dengan Bootstrap `fixed-bottom` NavBar | Padding bottom content sudah dihitung: 80px (NavBar) + 24px (FAB offset). FAB diposisikan `bottom: calc(80px + 16px + env(safe-area-inset-bottom))`. |
| Performance degradation akibat banyak CSS variables | CSS variables di-browser sangat cepat (native), penambahan tokens tidak terasa. Hanya perlu pastikan tidak ada nested shadow berat di loop. |
| Existing halaman custom styling bentrok dengan override M3 | Urutan `@import` CSS sudah benar: Bootstrap di nuxt.config → kemudian theme.css. Dalam theme.css, section override Bootstrap diletakkan SETELAH tokens, sehingga specificity sama tapi order terakhir menang. Jika ada halaman yang pakai `.btn.btn-dark` eksplisit, tetap biarkan bekerja via fallback selector. |
| iOS Safari safe-area tidak berlaku | Tambahkan `viewport-fit=cover` via `app.head.meta` di `nuxt.config.ts` (ditambahkan pada step 1 jika belum ada) + `env(safe-area-inset-*)` dengan fallback `0px`. |
