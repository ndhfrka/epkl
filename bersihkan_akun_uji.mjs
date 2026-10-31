// Bersihkan akun uji tersisa
const BASE = 'http://127.0.0.1:8090';
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const su = (await auth.json()).token;
const SH = { Authorization: su };
const lst = await fetch(BASE + "/api/collections/teacher_users/records?filter=(username='akun_tes_instansi')", { headers: SH }).then(x => x.json());
for (const it of lst.items) {
  const d = await fetch(BASE + `/api/collections/teacher_users/records/${it.id}`, { method: 'DELETE', headers: SH });
  console.log('hapus akun uji', it.username, '→', d.status === 204 ? 'OK' : d.status);
}
const su2 = await fetch(BASE + "/api/collections/student_users/records?filter=(username~'akun_tes')", { headers: SH }).then(x => x.json());
for (const it of su2.items) {
  const d = await fetch(BASE + `/api/collections/student_users/records/${it.id}`, { method: 'DELETE', headers: SH });
  console.log('hapus akun uji', it.username, '→', d.status === 204 ? 'OK' : d.status);
}
console.log('selesai');
