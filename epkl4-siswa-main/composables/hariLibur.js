// ====== TANGGAL MERAH (HARI LIBUR NASIONAL) ======
// Daftar libur nasional Indonesia per tahun. PERBARUI SETIAP TAHUN begitu
// SKB 3 Menteri terbit; tanggal berlabel "perkiraan" perlu dicek ulang.
// Hari Minggu tidak perlu dicantumkan: Minggu otomatis libur bila bukan
// jadwal PKL siswa (lihat hari_pkl).
export const LIBUR_NASIONAL = {
  2025: [],
  2026: [
    '2026-01-01', // Tahun Baru Masehi
    '2026-01-16', // Isra Mikraj Nabi Muhammad SAW (perkiraan - periksa SKB)
    '2026-02-17', // Tahun Baru Imlek (perkiraan - periksa SKB)
    '2026-03-19', // Hari Raya Nyepi (perkiraan - periksa SKB)
    '2026-03-20', // Idul Fitri 1447 H (perkiraan - periksa SKB)
    '2026-03-21', // Idul Fitri 1447 H (perkiraan - periksa SKB)
    '2026-04-03', // Wafat Isa Almasih (Jumat Agung)
    '2026-05-01', // Hari Buruh Internasional
    '2026-05-14', // Kenaikan Isa Almasih
    '2026-05-27', // Idul Adha 1447 H (perkiraan - periksa SKB)
    '2026-06-01', // Hari Lahir Pancasila
    '2026-06-16', // Tahun Baru Islam 1448 H (perkiraan - periksa SKB)
    '2026-08-17', // Hari Kemerdekaan RI
    '2026-08-25', // Maulid Nabi Muhammad SAW (perkiraan - periksa SKB)
    '2026-12-25', // Kelahiran Isa Almasih (Natal)
  ],
  2027: [],
}

// Apakah `d` (objek Date) termasuk tanggal merah?
export function apakahTanggalMerah(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) return false
  const kunci = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return (LIBUR_NASIONAL[d.getFullYear()] || []).includes(kunci)
}

// Urai kolom "hari_pkl" (JSON array atau daftar dipisah koma) menjadi
// daftar nama hari; default Senin-Jumat bila belum pernah diisi.
export function parseHariPkl(raw) {
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch (_) {}
    const parts = String(raw).split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts
  }
  return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
}
