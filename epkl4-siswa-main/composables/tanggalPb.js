// [FIX IPHONE 7 PLUS / SAFARI] Helper aman untuk mem-parsing datetime PocketBase.
//
// PocketBase menyimpan field `created`/`updated` sebagai string berformat
//   "2026-09-10 07:55:24.402Z"  (pemisah SPASI, bukan huruf T)
//
// Chrome/Node masih bersedia mem-parsing format itu, tetapi Safari/iOS
// (termasuk iPhone 7 Plus / iOS 15) mengembalikan **Invalid Date** untuk
// pemisah spasi. Di banyak halaman tanggal mentah itu langsung dimasukkan ke
// `Intl.DateTimeFormat().format(tanggal)` yang kemudian MELEMPAR
// "RangeError: Invalid time value" — dan bila lemparan itu terjadi di dalam
// pemetaan daftar (mis. tabel agenda jurnal), SELURUH daftar gagal dirender
// dan tabel tampak kosong di HP, padahal normal di Chrome/desktop.
//
// Helper ini mem-parsing dengan aman di semua browser:
//  - ganti spasi pertama menjadi "T" agar jadi ISO valid,
//  - dukung juga date-only "YYYY-MM-DD",
//  - kembalikan `null` (bukan Invalid Date) bila benar-benar tak bisa diparsing.
export function tanggalPb(nilai) {
  if (nilai === null || nilai === undefined) return null
  const s = String(nilai).trim()
  if (!s) return null
  // "YYYY-MM-DD HH:MM:SS(.mmm)(Z)" -> "YYYY-MM-DDTHH:MM:SS(.mmm)(Z)"
  let d = s.includes(' ') ? new Date(s.replace(' ', 'T')) : new Date(s)
  if (!isNaN(d.getTime())) return d
  // cadangan: date-only "YYYY-MM-DD"
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) {
    d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    if (!isNaN(d.getTime())) return d
  }
  return null
}
