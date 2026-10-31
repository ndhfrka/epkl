// ============================================================
// LANGKAH 1 — Kunci aturan sesuai kebijakan user:
//   nilai: create/update HANYA instansi
//   jurnal: update HANYA pemilik (siswa sendiri); guru/instansi hanya pantau
// ============================================================
const BASE = 'http://127.0.0.1:8090';
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
if (!auth.ok) { console.error('AUTH GAGAL'); process.exit(1); }
const token = (await auth.json()).token;
const H = { 'Content-Type': 'application/json', Authorization: token };

async function patch(name, body) {
  const r = await fetch(BASE + '/api/collections/' + name, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
  if (!r.ok) { console.error('PATCH ' + name + ' GAGAL:', r.status, await r.text()); return false; }
  const j = await r.json();
  console.log(`[${name}] create = ${j.createRule}`);
  console.log(`[${name}] update = ${j.updateRule}`);
  return true;
}
const ok1 = await patch('nilai', {
  createRule: `@request.auth.role = 'instansi'`,
  updateRule: `@request.auth.role = 'instansi'`,
});
const ok2 = await patch('jurnal', {
  updateRule: `siswa = @request.auth.id`,
});
process.exit(ok1 && ok2 ? 0 : 1);
