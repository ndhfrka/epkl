import { usePocketBaseClient } from "./pocketBaseClient"
import { usePocketBaseUser } from "./pocketBaseUser"
import { usePengingat } from "./usePengingat"
import { apakahTanggalMerah, parseHariPkl } from './hariLibur'

// JAM BATAS PENGISIAN JURNAL (WIB) — siswa tidak boleh mengisi setelah jam ini.
// Jika belum mengisi sampai jam ini, otomatis ditandai ALPHA.
export const JAM_BATAS_JURNAL = 18

// Isi otomatis tabel absen dari kegiatan jurnal:
// setiap kegiatan yang di-upload (Tambah Kegiatan) menjadi 1 baris baru
// di tabel absen — kolom "Jenis Kegiatan" terisi nama kegiatannya dan
// tanda diletakkan tepat di kolom tanggal kegiatan tersebut (sejajar barisnya).
// Jenis tanda otomatis: ✓ hadir, S jika teks kegiatan mengandung kata "sakit",
// I jika mengandung kata "izin". Alpa ('A') ditandai otomatis oleh
// tandaiAlphaOtomatis() saat lewat jam 18.00 tanpa jurnal.
export const useAbsenOtomatis = () => {
  let client = usePocketBaseClient()
  let user = usePocketBaseUser()

  // [PERBAIKAN REKURSI] JANGAN memanggil usePengingat() di sini (setup).
  // usePengingat() juga memanggil useAbsenOtomatis() di setup-nya — jika keduanya
  // saling memanggil saat setup, terjadi rekursi tak berujung:
  //   RangeError: Maximum call stack size exceeded (saat <PengingatBell> mount).
  // Solusi: ambil cekPengingat secara LAZY, hanya saat benar-benar dipakai.
  function refreshPengingat(paksa = true) {
    try {
      const { cekPengingat } = usePengingat()
      cekPengingat(paksa)
    } catch (e) {
      console.error('Gagal memicu refresh pengingat:', e)
    }
  }

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
      // [FITUR SAKIT/IZIN] deteksi kata "sakit" / "izin" pada teks kegiatan:
      // baris absen akan menandai S (sakit) atau I (izin) alih-alih ✓ (hadir).
      // \b (word boundary) supaya tidak salah tangkap pada kata lain, mis. "mengizinkan".
      const teksLower = teks.toLowerCase()
      const markBaru = /\bsakit\b/.test(teksLower) ? 's' : (/\bizin\b/.test(teksLower) ? 'i' : 'v')
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
          marks: { [String(hari)]: markBaru },
          bulan,
          tahun
        })
        refreshPengingat(true) // absen terisi → segarkan notif pengingat seketika
        return
      }
      const marks = (rec.marks && typeof rec.marks === 'object' && !Array.isArray(rec.marks)) ? { ...rec.marks } : {}
      if (marks[hari]) return
      marks[String(hari)] = markBaru
      await client.collection('absen').update(rec.id, { marks })
      refreshPengingat(true) // absen terisi → segarkan notif pengingat seketika
    } catch (e) {
      console.error('Gagal mengisi absen otomatis:', e)
    }
  }

  /**
   * Hapus jejak absen otomatis dari kegiatan jurnal yang dihapus siswa.
   * Dipanggil dari halaman jurnal (hapusJurnal) supaya baris di halaman absen
   * ikut terhapus — konsisten dengan tandaiAbsenOtomatis() yang membuat barisnya.
   *
   * Cara kerja:
   * - Cocokkan baris absen milik user yang uraiannya = teks kegiatan jurnal.
   * - Jika tanggal diketahui: cukup hapus tanda (✓) pada hari tanggal tersebut.
   * - Jika setelah itu tidak ada tanda tersisa sama sekali → baris absen
   *   dihapus seluruhnya (baris di halaman absen hilang).
   * - Jika tanggal tidak diketahui: baris absen dengan uraian tsb dihapus langsung.
   */
  async function hapusAbsenOtomatis(tgl, teksKegiatan = '') {
    try {
      const teks = String(teksKegiatan || '').trim()
      if (!teks || !user.user.value?.id) return
      if (user.user.value.role === 'guru') return
      client.autoCancellation(false)
      const d = (tgl instanceof Date && !isNaN(tgl.getTime())) ? tgl : parseTanggalAgenda(tgl)
      const filterBulanTahun = d ? ` && bulan=${d.getMonth() + 1} && tahun=${d.getFullYear()}` : ''
      const existing = await client.collection('absen').getFullList({
        filter: `user="${user.user.value.id}"${filterBulanTahun}`
      })
      let berubah = false
      for (const rec of existing) {
        if (String(rec.uraian || '').trim() !== teks) continue
        // [ATURAN VALIDASI] baris yang sudah memiliki tanda APA PUN (✓ hadir /
        // S sakit / I izin / x alfa — dari upload jurnal atau validasi guru)
        // tidak boleh dihapus atau dikurangi tandanya lewat jalur ini.
        // Kalau tidak, siswa bisa menghapus jurnalnya untuk membersihkan
        // catatan absen yang sudah tercatat.
        const marksRec = (rec.marks && typeof rec.marks === 'object' && !Array.isArray(rec.marks)) ? rec.marks : {}
        if (Object.values(marksRec).some(v => String(v ?? '').trim() !== '')) continue
        if (!d) {
          await client.collection('absen').delete(rec.id)
          berubah = true
          continue
        }
        const marks = (rec.marks && typeof rec.marks === 'object' && !Array.isArray(rec.marks)) ? { ...rec.marks } : {}
        delete marks[String(d.getDate())]
        const sisaMark = Object.values(marks).some(v => String(v ?? '').trim() !== '')
        if (sisaMark) {
          await client.collection('absen').update(rec.id, { marks })
        } else {
          await client.collection('absen').delete(rec.id)
        }
        berubah = true
      }
      if (berubah) refreshPengingat(true)
    } catch (e) {
      console.error('Gagal menghapus absen otomatis:', e)
    }
  }

  /**
   * Tandai ALPHA otomatis pada hari ini jika siswa belum mengisi jurnal
   * dan sudah melewati JAM_BATAS_JURNAL (18.00 WIB).
   * Dipanggil oleh usePengingat tepat saat jam 18.00 atau saat app dibuka setelah jam tersebut.
   */
  async function tandaiAlphaOtomatis() {
    try {
      if (!user.user.value?.id || user.user.value?.role === 'guru') return
      const now = new Date()
      const hari = now.getDate()
      const bulan = now.getMonth() + 1
      const tahun = now.getFullYear()
      client.autoCancellation(false)

      // [FITUR LIBUR] hari ini libur (bukan jadwal PKL siswa / tanggal merah)
      // -> JANGAN tandai ALPA; kolom absen menampilkan "L" otomatis dan
      //    jurnal tetap kosong tanpa dianggap buruk.
      try {
        // pemetaan.siswa menunjuk koleksi SISWA (bukan id akun)
        const sidSiswa = user.user.value?.siswa || ''
        const resPem = sidSiswa ? await client.collection('pemetaan').getList(1, 1, {
          filter: `siswa='${sidSiswa}'`,
          expand: 'iduka',
          requestKey: null
        }) : null
        const jadwal = parseHariPkl(resPem?.items?.[0]?.expand?.iduka?.hari_pkl)
        const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        if (!jadwal.includes(NAMA_HARI[now.getDay()]) || apakahTanggalMerah(now)) return
      } catch (_) { /* jadwal gagal dimuat -> lanjut perilaku lama */ }

      // Cek apakah sudah ada jurnal final (bukan draft) hari ini
      let sudahAdaJurnal = false
      try {
        const jurnalHariIni = await client.collection('jurnal').getList(1, 5, {
          filter: `siswa="${user.user.value.id}" && isDraft=false`,
          sort: '-created',
          fields: 'id,created,tanggal_agenda,isDraft',
          requestKey: null
        })
        sudahAdaJurnal = (jurnalHariIni?.items || []).some(j => {
          // cocokkan tanggal agenda atau tanggal dibuat
          const tgl = j.tanggal_agenda
            ? String(j.tanggal_agenda).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
            : null
          if (tgl) {
            const t = new Date(+tgl[3], +tgl[2] - 1, +tgl[1])
            if (t.getDate() === hari && t.getMonth() + 1 === bulan && t.getFullYear() === tahun) return true
          }
          const buat = j.created ? new Date(String(j.created).replace(' ', 'T')) : null
          return !!(buat && !isNaN(buat) && buat.getDate() === hari && buat.getMonth() + 1 === bulan && buat.getFullYear() === tahun)
        })
      } catch (_) {}

      // Jika sudah ada jurnal → tidak perlu alpha
      if (sudahAdaJurnal) return

      // Cek apakah sudah ada mark (apapun) di absen hari ini
      const existing = await client.collection('absen').getFullList({
        filter: `user="${user.user.value.id}" && bulan=${bulan} && tahun=${tahun}`
      })
      const sudahAdaMark = existing.some(r => {
        if (!r.marks || typeof r.marks !== 'object') return false
        const val = r.marks[String(hari)]
        if (val === null || val === undefined) return false
        return String(val).trim() !== ''
      })

      if (sudahAdaMark) return // sudah ada tanda apapun, skip

      // Belum ada jurnal & belum ada mark → tandai ALPA ('x'):
      // kolom "Jenis Kegiatan" bertuliskan Alpa, kolom absen menampilkan A
      await client.collection('absen').create({
        user: user.user.value.id,
        uraian: 'Alpa — tidak mengisi jurnal PKL',
        marks: { [String(hari)]: 'x' },
        bulan,
        tahun
      })
      refreshPengingat(true)
    } catch (e) {
      console.error('Gagal menandai alpha otomatis:', e)
    }
  }

  return { tandaiAbsenOtomatis, hapusAbsenOtomatis, tandaiAlphaOtomatis }
}
