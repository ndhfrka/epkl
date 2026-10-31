// Retest A1 & A4: instansi create/update nilai — dengan siswa id yang BENAR (koleksi data 'siswa')
const BASE = 'http://127.0.0.1:8090';
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const su = (await auth.json()).token;
const SH = { 'Content-Type': 'application/json', Authorization: su };
const P = 'PassUji123!';

const Ti = await fetch(BASE + '/api/collections/teacher_users/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'akun_tes_instansi', password: P }) });
if (!Ti.ok) { console.log('login instansi uji gagal — buat ulang akun'); const cr = await fetch(BASE + '/api/collections/teacher_users/records', { method: 'POST', headers: SH, body: JSON.stringify({ username: 'akun_tes_instansi', password: P, passwordConfirm: P, role: 'instansi', nama: 'Akun Tes Instansi' }) }); console.log('buat:', cr.status); }
const tok = await fetch(BASE + '/api/collections/teacher_users/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'akun_tes_instansi', password: P }) }).then(x => x.json());
const Hi = { 'Content-Type': 'application/json', Authorization: tok.token };

const siswaBaseId = 'g77izjvbug06a2v';
let r = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: Hi, body: JSON.stringify({ siswa: siswaBaseId, nilai_elemen1: 88 }) });
console.log('A1 RETRY instansi CREATE nilai → HTTP', r.status, r.ok ? 'PASS ✓' : 'FAIL: ' + JSON.stringify(await r.json()).substring(0, 200));
const idNilai = r.ok ? (await r.json()).id : null;

if (idNilai) {
  r = await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'PATCH', headers: Hi, body: JSON.stringify({ nilai_elemen1: 90 }) });
  console.log('A4 RETRY instansi UPDATE nilai → HTTP', r.status, r.ok ? 'PASS ✓' : 'FAIL: ' + JSON.stringify(await r.json()).substring(0, 200));
  // bersihkan
  await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'DELETE', headers: SH });
  console.log('(nilai uji dihapus)');
}
