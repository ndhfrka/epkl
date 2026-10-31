import fs from 'fs'
const base = 'http://127.0.0.1:8090'
const auth = await fetch(base + '/api/collections/_superusers/auth-with-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'admin@epkl.local', password: 'Admin123!' })
}).then(r => r.json())
const h = { Authorization: auth.token }
const c = await fetch(base + '/api/collections/nilai', { headers: h }).then(r => r.json())
let out = 'id=' + c.id + ' name=' + c.name + '\n'
for (const f of c.fields) out += `- ${f.name} (${f.type})${f.required ? ' required' : ''}\n`
out += 'createRule=' + JSON.stringify(c.createRule) + '\nupdateRule=' + JSON.stringify(c.updateRule) + '\nlistRule=' + JSON.stringify(c.listRule) + '\n'
const recs = await fetch(base + '/api/collections/nilai/records?perPage=5', { headers: h }).then(r => r.json())
out += 'total=' + recs.totalItems + '\n'
for (const r of recs.items) out += JSON.stringify(r).slice(0, 300) + '\n'
fs.writeFileSync('c:/Users/ASUS/Downloads/jurnal pkl/cek_nilai_out.txt', out)
