// Ekspor "Agenda Harian PKL" ke PDF (A4 landscape) — unduhan langsung.
// Murni client-side, jsPDF dimuat dinamis agar tidak membebani bundle awal.
//
// items  : [{ tanggal: 'Senin, 5/10/2026', uraian: '...', ttdUrl: 'http://...' }]
// info   : { nama, nis, iduka, alamat }
// periode: 'Oktober 2026' atau 'Semua Bulan 2026'

// karakter di luar latin/cp1252 (emoji dll) membuat teks kacau di PDF -> rapikan
function rapikanTeks(s) {
  return String(s ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2026]/g, '...')
    .replace(/[^\x00-\xFF\n]/g, '')
}

function slug(s) {
  return String(s || 'siswa').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'siswa'
}

async function gambarKeDataUrl(url) {
  if (!url) return null
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    const blob = await r.blob()
    let fmt = null
    if (blob.type.includes('png')) fmt = 'PNG'
    else if (blob.type.includes('jpeg') || blob.type.includes('jpg')) fmt = 'JPEG'
    else if (blob.type.includes('webp')) fmt = 'WEBP'
    if (!fmt) return null
    const dataUrl = await new Promise((resolve) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => resolve(null)
      fr.readAsDataURL(blob)
    })
    if (!dataUrl) return null
    const dim = await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = dataUrl
    })
    if (!dim || !dim.w || !dim.h) return null
    return { dataUrl, fmt, w: dim.w, h: dim.h }
  } catch (e) {
    return null
  }
}

export async function eksporAgendaHarianPdf({ items, info = {}, periode = '', tahunPelajaran = '2026/2027', sekolah = 'SMK AL FATAH BANJARNEGARA', judul = 'AGENDA HARIAN PRAKTEK KERJA LAPANGAN (PKL)', namaBerkas = '' } = {}) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // ===== geometri halaman =====
  const PAGE_W = 297, PAGE_H = 210
  const M = 12                     // margin kiri/kanan/atas
  const X = M                      // awal konten
  const W = PAGE_W - M * 2         // lebar konten = 273
  const W_NO = 12, W_TGL = 44, W_TTD = 49
  const W_URAIAN = W - W_NO - W_TGL - W_TTD
  const X_TGL = X + W_NO, X_URAIAN = X_TGL + W_TGL, X_TTD = X_URAIAN + W_URAIAN
  const Y_BAWAH = PAGE_H - 12      // batas bawah isi
  const LH = 4.6                   // tinggi baris teks uraian (mm)
  const ROW_MIN = 9

  const warnaGaris = [17, 24, 39]      // hampir hitam seperti formulir
  const warnaHeaderFill = [229, 231, 235]

  // ===== muat semua gambar ttd dulu (paralel) =====
  const ttdImgs = await Promise.all((items || []).map(j => gambarKeDataUrl(j.ttdUrl)))

  // ===== helper =====
  function headerLembar() {
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13.5)
    doc.text(rapikanTeks(judul), PAGE_W / 2, M + 2, { align: 'center' })
    doc.setFontSize(11)
    doc.text(rapikanTeks(sekolah), PAGE_W / 2, M + 7.5, { align: 'center' })
    doc.text(rapikanTeks('TAHUN PELAJARAN ' + tahunPelajaran), PAGE_W / 2, M + 13, { align: 'center' })
    if (periode) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)
      doc.text(rapikanTeks('Periode: ' + periode), PAGE_W / 2, M + 18, { align: 'center' })
      doc.setTextColor(17, 24, 39)
    }
  }

  function blokInfo(y) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(17, 24, 39)
    const barisInfo = [
      ['Nama Siswa', info.nama],
      ['NIS', info.nis],
      ['Tempat PKL / Instansi', info.iduka],
      ['Alamat', info.alamat],
    ]
    const lebarLabel = 40
    for (const [label, val] of barisInfo) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(55, 65, 81)
      doc.text(rapikanTeks(label), X, y)
      doc.text(':', X + lebarLabel - 2, y)
      const teks = rapikanTeks(val || '')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(17, 24, 39)
      doc.text(teks, X + lebarLabel + 3, y)
      // garis titik-titik di bawah nilai seperti formulir
      doc.setDrawColor(156, 163, 175)
      doc.setLineWidth(0.25)
      doc.setLineDashPattern([0.8, 0.9], 0)
      doc.line(X + lebarLabel + 2, y + 1.6, X + 160, y + 1.6)
      doc.setLineDashPattern([], 0)
      y += 6.5
    }
    doc.setTextColor(17, 24, 39)
    return y
  }

  function headerTabel(y) {
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setDrawColor(...warnaGaris)
    doc.setLineWidth(0.35)
    doc.setFillColor(...warnaHeaderFill)
    doc.rect(X, y, W_NO, 8, 'FD')
    doc.rect(X_TGL, y, W_TGL, 8, 'FD')
    doc.rect(X_URAIAN, y, W_URAIAN, 8, 'FD')
    doc.rect(X_TTD, y, W_TTD, 8, 'FD')
    doc.text('No.', X + W_NO / 2, y + 5.4, { align: 'center' })
    doc.text('Hari/Tanggal', X_TGL + 2, y + 5.4)
    doc.text('Uraian kegiatan yang dilakukan', X_URAIAN + 2, y + 5.4)
    doc.text('Tanda tangan Instansi', X_TTD + 2, y + 5.4)
    return y + 8
  }

  // gambar satu baris; kembalikan tinggi baris
  function baris(no, tgl, uraian, ttdImg, y) {
    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.8)
    const teksUraian = rapikanTeks(uraian || '')
    const lines = teksUraian ? doc.splitTextToSize(teksUraian, W_URAIAN - 4) : []
    const rowH = Math.max(ROW_MIN, lines.length * LH + 4)

    doc.setDrawColor(...warnaGaris)
    doc.setLineWidth(0.35)
    doc.rect(X, y, W_NO, rowH)
    doc.rect(X_TGL, y, W_TGL, rowH)
    doc.rect(X_URAIAN, y, W_URAIAN, rowH)
    doc.rect(X_TTD, y, W_TTD, rowH)

    if (no !== null && no !== undefined) doc.text(String(no), X + W_NO / 2, y + 5.2, { align: 'center' })
    if (tgl) doc.text(rapikanTeks(tgl), X_TGL + 2, y + 5.2)
    lines.forEach((l, i) => doc.text(l, X_URAIAN + 2, y + 5.2 + i * LH))

    if (ttdImg) {
      const maxW = W_TTD - 9, maxH = rowH - 3.5
      const fit = Math.min(maxW / ttdImg.w, maxH / ttdImg.h)
      const w = ttdImg.w * fit, h = ttdImg.h * fit
      try {
        doc.addImage(ttdImg.dataUrl, ttdImg.fmt, X_TTD + (W_TTD - w) / 2, y + (rowH - h) / 2, w, h)
      } catch (e) { /* gambar gagal -> biarkan sel kosong */ }
    }
    return rowH
  }

  // ===== susun dokumen =====
  headerLembar()
  let y = blokInfo(M + (periode ? 24 : 20))
  y = headerTabel(y)

  const daftar = items || []
  for (let i = 0; i < daftar.length; i++) {
    const it = daftar[i]
    const uraianLines = rapikanTeks(it.uraian || '') ? doc.splitTextToSize(rapikanTeks(it.uraian), W_URAIAN - 4) : []
    const rowH = Math.max(ROW_MIN, uraianLines.length * LH + 4)
    if (y + rowH > Y_BAWAH) {
      doc.addPage()
      headerLembar()
      y = headerTabel(M + (periode ? 22 : 18))
    }
    y += baris(i + 1, it.tanggal, it.uraian, ttdImgs[i], y)
  }

  // lengkapi baris kosong sampai minimal 27 baris seperti formulir asli
  let jumlahBaris = daftar.length
  while (jumlahBaris < 27 && y + ROW_MIN <= Y_BAWAH) {
    y += baris(null, '', '', null, y)
    jumlahBaris++
  }

  // ===== footer nomor halaman (digambar setelah semua halaman jadi) =====
  const total = doc.getNumberOfPages()
  const tglEkspor = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(rapikanTeks(`Diekspor dari e-PKL - ${tglEkspor}`), M, PAGE_H - 5)
    doc.text(`Halaman ${p} dari ${total}`, PAGE_W - M, PAGE_H - 5, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  const nama = namaBerkas || `agenda-pkl_${slug(info.nama)}_${slug(periode || tahunPelajaran)}.pdf`
  doc.save(nama)
  return nama
}
