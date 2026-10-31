const BASE = 'http://127.0.0.1:8090';
// tanpa header auth sama sekali
const r1 = await fetch(BASE + '/api/collections/lokasi_pkl/records?perPage=1');
const b1 = await r1.text();
console.log('[lokasi_pkl TANPA auth] HTTP', r1.status);
console.log(b1.substring(0, 300));
console.log('');
const r2 = await fetch(BASE + '/api/collections/absen/records?perPage=1');
const b2 = await r2.text();
console.log('[absen TANPA auth] HTTP', r2.status);
console.log(b2.substring(0, 200));
console.log('');
// dengan token superuser — kontrol pembanding
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const token = (await auth.json()).token;
const r3 = await fetch(BASE + '/api/collections/lokasi_pkl/records?perPage=1', { headers: { Authorization: token } });
console.log('[lokasi_pkg DENGAN auth superuser] HTTP', r3.status, '(data tampil =', (await r3.text()).includes('"items"'), ')');
