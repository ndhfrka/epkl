// Tambahkan field jam_mulai & jam_selesai ke koleksi iduka (live, via Admin API)
const BASE = 'http://127.0.0.1:8090';
const EMAIL = 'tempadmin2@epkl.local';
const PASS = 'Pass1234!';

const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: EMAIL, password: PASS }),
});
if (!auth.ok) { console.error('AUTH GAGAL:', auth.status, await auth.text()); process.exit(1); }
const token = (await auth.json()).token;
console.log('auth OK');

const cur = await fetch(BASE + '/api/collections/iduka', {
  headers: { Authorization: token },
});
if (!cur.ok) { console.error('GET GAGAL:', cur.status, await cur.text()); process.exit(1); }
const col = await cur.json();
const fields = col.fields || [];
console.log('field iduka sekarang:', fields.map(f => f.name).join(', '));

const fields2 = fields.filter(f => !['jam_mulai', 'jam_selesai'].includes(f.name));
fields2.push({ type: 'text', name: 'jam_mulai' }, { type: 'text', name: 'jam_selesai' });

const patch = await fetch(BASE + '/api/collections/iduka', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', Authorization: token },
  body: JSON.stringify({ fields: fields2 }),
});
if (!patch.ok) { console.error('PATCH GAGAL:', patch.status, await patch.text()); process.exit(1); }
const patched = await patch.json();
console.log('field iduka SETELAH:', patched.fields.map(f => f.name).join(', '));
console.log('SELESAI');
