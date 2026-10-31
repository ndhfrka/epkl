const { DatabaseSync } = require('node:sqlite')
const db = new DatabaseSync('c:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true })

function ekstrakKoordinat(url) {
  if (!url) return ''
  let m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (!m) m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (!m) {
    try {
      const u = new URL(url)
      const q = u.searchParams.get('q') || u.searchParams.get('query')
      if (q) m = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/)
    } catch {}
  }
  return m ? `${m[1]},${m[2]}` : ''
}

function ekstrakNamaTempat(url) {
  if (!url) return ''
  try {
    const m = url.match(/\/place\/([^/]+)/)
    return m ? decodeURIComponent(m[1]).replace(/\+/g, ' ').trim() : ''
  } catch {
    return ''
  }
}

const rows = db.prepare('SELECT id, nama_iduka, alamat, link_maps FROM lokasi_pkl').all()
const unik = new Set()
for (const r of rows) {
  const nama = ekstrakNamaTempat(r.link_maps)
  const q = (nama && r.alamat ? `${nama}, ${r.alamat}` : '')
    || nama
    || ekstrakKoordinat(r.link_maps)
    || [r.nama_iduka, r.alamat].map(x => (x || '').trim()).filter(Boolean).join(', ')
    || 'Indonesia'
  const embed = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=17&t=k&hl=id&output=embed'
  if (unik.has(embed)) continue
  unik.add(embed)
  console.log(`iduka=${r.nama_iduka}`)
  console.log(`  query =${q}`)
  console.log(`  embed =${embed}`)
}
db.close()
