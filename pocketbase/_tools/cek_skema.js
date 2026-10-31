// Detail field koleksi terkait guru -> siswa -> lokasi
const { DatabaseSync } = require('node:sqlite')

const db = new DatabaseSync('c:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db')
const rows = db.prepare('select id, type, name, fields from _collections order by name').all()

const cols = rows.map(r => ({ id: r.id, type: r.type, name: r.name, fields: JSON.parse(r.fields || '[]') }))
const byId = Object.fromEntries(cols.map(c => [c.id, c.name]))

const target = ['lokasi_pkl', 'student_users', 'teacher_users', 'siswa', 'pemetaan', 'pemetaan_pembimbing', 'pembimbing', 'iduka']
for (const c of cols) {
  if (!target.includes(c.name)) continue
  console.log(`\n=== ${c.name} (${c.id}) type=${c.type} ===`)
  for (const f of c.fields) {
    const rel = f.collectionId ? ' -> ' + (byId[f.collectionId] || f.collectionId) : ''
    console.log(`  - ${f.name} : ${f.type}${rel}`)
  }
}
