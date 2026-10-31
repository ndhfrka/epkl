// Fokus: kenapa instansi gagal create nilai? (tampilkan pesan validasi PB)
const BASE = 'http://127.0.0.1:8090';
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const su = (await auth.json()).token;
const SH = { 'Content-Type': 'application/json', Authorization: su };
const P = 'PassUji123!';

// buat akun instansi uji (bersih jika sudah ada)
let r = await fetch(BASE + '/api/collections/teacher_users/records', { method: 'POST', headers: SH, body: JSON.stringify({ username: 'akun_tes_instansi', password: P, passwordConfirm: P, role: 'instansi', nama: 'Akun Tes Instansi' }) });
const akun = await r.json();
if (!r.ok && akun.data?.username?.code === 'validation_invalid_username') {
  // sudah ada → pakai yang ada
  const lst = await fetch(BASE + "/api/collections/teacher_users/records?filter=(username='akun_tes_instansi')", { headers: SH }).then(x => x.json());
  akun.id = lst.items[0].id;
}
const idIns = akun.id;
const Ti = await fetch(BASE + '/api/collections/teacher_users/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'akun_tes_instansi', password: P }) }).then(x => x.json());
const Hi = { 'Content-Type': 'application/json', Authorization: Ti.token };

// coba create nilai minimal → tampilkan error validasi lengkap
r = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: Hi, body: JSON.stringify({ siswa: 'vwtji0jc310ppj4', nilai_elemen1: 88 }) });
console.log('create minimal → HTTP', r.status);
console.log(JSON.stringify(await r.json(), null, 2));
