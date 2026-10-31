import { usePocketBaseClient } from "./pocketBaseClient"
import { usePocketBaseUser } from "./pocketBaseUser"
import { usePengingat } from "./usePengingat"

// Isi otomatis tabel absen dari kegiatan jurnal:
// setiap kegiatan yang di-upload (Tambah Kegiatan) menjadi 1 baris baru
// di tabel absen — kolom "Jenis Kegiatan" terisi nama kegiatannya dan
// tanda ✓ diletakkan tepat di kolom tanggal kegiatan tersebut (sejajar barisnya).
export const useAbsenOtomatis = () => {
  let client = usePocketBaseClient()
  let user = usePocketBaseUser()
  const { cekPengingat } = usePengingat()

  // format tanggal agenda: "Hari, D/M/YYYY"
  function parseTanggalAgenda(s) {
    if (!s) return null
    const m = String(s).match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/)
    if (!m) return null
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
    return isNaN(d.getTime()) ? null : d
  }

  async function tandaiAbsenOtomatis(tgl, teksKegiatan = '') {
    try {
      const d = tgl instanceof Date ? tgl : parseTanggalAgenda(tgl)
      const teks = String(teksKegiatan || '').trim()
      if (!d || !teks || !user.user.value?.id) return
      if (user.user.value.role === 'guru') return
      const hari = d.getDate()
      const bulan = d.getMonth() + 1
      const tahun = d.getFullYear()
      client.autoCancellation(false)
      const existing = await client.collection('absen').getFullList({
        filter: `user="${user.user.value.id}" && bulan=${bulan} && tahun=${tahun}`
      })
      // pakai baris dengan uraian kegiatan yang sama; kalau belum ada, buat baris baru sejajar
      let rec = existing.find(r => String(r.uraian || '').trim() === teks)
      if (!rec) {
        await client.collection('absen').create({
          user: user.user.value.id,
          uraian: teks,
          marks: { [String(hari)]: 'v' },
          bulan,
          tahun
        })
        cekPengingat(true) // absen terisi → segarkan notif pengingat seketika
        return
      }
      const marks = (rec.marks && typeof rec.marks === 'object' && !Array.isArray(rec.marks)) ? { ...rec.marks } : {}
      if (marks[hari]) return
      marks[String(hari)] = 'v'
      await client.collection('absen').update(rec.id, { marks })
      cekPengingat(true) // absen terisi → segarkan notif pengingat seketika
    } catch (e) {
      console.error('Gagal mengisi absen otomatis:', e)
    }
  }

  return { tandaiAbsenOtomatis }
}
