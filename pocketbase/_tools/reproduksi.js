// reproduksi.js — coba create jurnal persis seperti tabel agenda kirim, pakai token siswa
const base = 'http://127.0.0.1:8090';

(async () => {
  // 1. login superuser
  const su = await fetch(base + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'devfix@epkl.local', password: 'TestFix123456' }),
  }).then((r) => r.json());
  if (!su.token) { console.log('SUPERUSER LOGIN GAGAL', su); return; }
  const H = { Authorization: su.token, 'Content-Type': 'application/json' };

  // 2. impersonate siswa ndhfrka
  const imp = await fetch(base + '/api/collections/student_users/impersonate/qgextew7gwutwi2', {
    method: 'POST', headers: H,
  }).then((r) => r.json());
  console.log('IMPERSONATE:', imp.token ? 'OK' : JSON.stringify(imp));
  if (!imp.token) return;
  const SH = { Authorization: imp.token, 'Content-Type': 'application/json' };

  // 3. create jurnal persis seperti saveCell tabel agenda
  const res = await fetch(base + '/api/collections/jurnal/records', {
    method: 'POST', headers: SH,
    body: JSON.stringify({ siswa: 'qgextew7gwutwi2', deskripsi: 'TES DIAGNOSA - dihapus otomatis', isDraft: false, tanggal_agenda: 'Rabu, 8/10/2026' }),
  });
  const rec = await res.json();
  console.log('CREATE JURNAL STATUS:', res.status);
  console.log(JSON.stringify(rec, null, 2));

  // 4. hapus lagi kalau berhasil (jangan sisakan data tes)
  if (res.status === 200 && rec.id) {
    const del = await fetch(base + '/api/collections/jurnal/records/' + rec.id, { method: 'DELETE', headers: H });
    console.log('CLEANUP DELETE:', del.status);
  }
})();
