import fs from 'fs'
const base = 'http://127.0.0.1:8090'
const auth = await fetch(base + '/api/collections/_superusers/auth-with-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'admin@epkl.local', password: 'Admin123!' })
}).then(r => r.json())
const h = { Authorization: 'Token ' + auth.token, 'Content-Type': 'application/json' }
const c = await fetch(base + '/api/collections/nilai', { headers: { Authorization: 'Token ' + auth.token } }).then(r => r.json())
const ada = c.fields.map(f => f.name)
const baru = [
  { name: 'materi', type: 'text' },
  { name: 'k_disiplin', type: 'number' },
  { name: 'k_kerjasama', type: 'number' },
  { name: 'k_inisiatif', type: 'number' },
  { name: 'k_kerajinan', type: 'number' },
  { name: 'k_tanggung_jawab', type: 'number' },
  { name: 'k_sikap', type: 'number' },
  { name: 'k_praktek', type: 'number' }
].filter(f => !ada.includes(f.name))
for (const f of baru) {
  f.min = 0
  f.max = 100
}
const fields = [...c.fields, ...baru]
const res = await fetch(base + '/api/collections/' + c.id, {
  method: 'PATCH',
  headers: h,
  body: JSON.stringify({ fields })
}).then(async r => {
  const j = await r.json()
  return { status: r.status, err: j.data ? JSON.stringify(j.data) : null, names: j.fields ? j.fields.map(f => f.name).join(',') : null }
})
fs.writeFileSync('c:/Users/ASUS/Downloads/jurnal pkl/upd_nilai_out.txt', JSON.stringify(res, null, 2))
