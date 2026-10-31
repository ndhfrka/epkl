// ============================================================
// TES ENDE-KE-END KEBIJAKAN HAK AKSES
//   nilai: hanya instansi boleh create/update
//   jurnal: hanya pemilik (siswa) boleh update; guru/instansi hanya pantau
// ============================================================
const BASE = 'http://127.0.0.1:8090';
let pass = 0, fail = 0;
function cek(nama, hasil, harapan) {
  if (hasil === harapan) { pass++; console.log(`  PASS  ${nama}`); }
  else { fail++; console.log(`  FAIL  ${nama} (hasil=${hasil}, harapan=${harapan})`); }
}

// --- auth superuser ---
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const su = (await auth.json()).token;
const SH = { 'Content-Type': 'application/json', Authorization: su };

// --- buat 3 akun uji ---
async function buatUser(col, payload) {
  const r = await fetch(BASE + '/api/collections/' + col + '/records', { method: 'POST', headers: SH, body: JSON.stringify(payload) });
  if (!r.ok) { console.error('GAGAL buat akun uji', col, r.status, await r.text()); process.exit(1); }
  return (await r.json()).id;
}
const P = 'PassUji123!';
const idGuru = await buatUser('teacher_users', { username: 'akun_tes_guru', password: P, passwordConfirm: P, role: 'guru', nama: 'Akun Tes Guru' });
const idIns = await buatUser('teacher_users', { username: 'akun_tes_instansi', password: P, passwordConfirm: P, role: 'instansi', nama: 'Akun Tes Instansi' });
const idSiswa = await buatUser('student_users', { username: 'akun_tes_siswa', password: P, passwordConfirm: P, nama: 'Akun Tes Siswa' });
console.log('akun uji dibuat: guru/instansi/siswa');

async function login(col, username) {
  const r = await fetch(BASE + '/api/collections/' + col + '/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: username, password: P }),
  });
  if (!r.ok) { console.error('login gagal', col, r.status); process.exit(1); }
  return (await r.json()).token;
}
const Tg = await login('teacher_users', 'akun_tes_guru');
const Ti = await login('teacher_users', 'akun_tes_instansi');
const Ts = await login('student_users', 'akun_tes_siswa');
const Hg = { 'Content-Type': 'application/json', Authorization: Tg };
const Hi = { 'Content-Type': 'application/json', Authorization: Ti };
const Hs = { 'Content-Type': 'application/json', Authorization: Ts };

// --- ambil 1 record jurnal & 1 iduka existing untuk tes ---
const jr = await fetch(BASE + '/api/collections/jurnal/records?perPage=1', { headers: SH }).then(r => r.json());
const iduka = await fetch(BASE + '/api/collections/iduka/records?perPage=1', { headers: SH }).then(r => r.json());
const jurnalAda = jr.items[0], idukaAda = iduka.items[0];

console.log('\n== A. NILAI: hanya instansi ==');
// A1 instansi create → HARUS BOLEH
let r = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: Hi, body: JSON.stringify({ siswa: idSiswa, iduka: idukaAda?.id, program_keahlian: null, nilai_elemen1: 88 }) });
const nilaiOk = r.ok;
const idNilai = nilaiOk ? (await r.json()).id : null;
cek('A1 instansi MEMBUAT nilai', nilaiOk, true);
// A2 guru create → HARUS DITOLAK
r = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: Hg, body: JSON.stringify({ siswa: idSiswa, nilai_elemen1: 77 }) });
cek('A2 guru MEMBUAT nilai (harus ditolak)', r.ok, false);
// A3 siswa create → HARUS DITOLAK
r = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: Hs, body: JSON.stringify({ siswa: idSiswa, nilai_elemen1: 99 }) });
cek('A3 siswa MEMBUAT nilai (harus ditolak)', r.ok, false);
// A4 instansi update nilai sendiri → BOLEH
r = await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'PATCH', headers: Hi, body: JSON.stringify({ nilai_elemen1: 90 }) });
cek('A4 instansi MENGUBAH nilai', r.ok, true);
// A5 guru update nilai → DITOLAK
r = await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'PATCH', headers: Hg, body: JSON.stringify({ nilai_elemen1: 1 }) });
cek('A5 guru MENGUBAH nilai (harus ditolak)', r.ok, false);
// A6 siswa update nilai → DITOLAK
r = await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'PATCH', headers: Hs, body: JSON.stringify({ nilai_elemen1: 2 }) });
cek('A6 siswa MENGUBAH nilai (harus ditolak)', r.ok, false);

console.log('\n== B. JURNAL: hanya pemilik bisa ubah, lainnya memantau ==');
// B1 siswa buat jurnal sendiri → BOLEH
r = await fetch(BASE + '/api/collections/jurnal/records', { method: 'POST', headers: Hs, body: JSON.stringify({ siswa: idSiswa, deskripsi: 'tes uji', isDraft: true }) });
const jurnalTes = r.ok ? (await r.json()).id : null;
cek('B1 siswa MEMBUAT jurnal miliknya', r.ok, true);
// B2 siswa update jurnal miliknya → BOLEH
r = await fetch(BASE + `/api/collections/jurnal/records/${jurnalTes}`, { method: 'PATCH', headers: Hs, body: JSON.stringify({ deskripsi: 'tes uji revisi' }) });
cek('B2 siswa MENGUBAH jurnal miliknya', r.ok, true);
// B3 guru update jurnal siswa → DITOLAK
r = await fetch(BASE + `/api/collections/jurnal/records/${jurnalAda.id}`, { method: 'PATCH', headers: Hg, body: JSON.stringify({ deskripsi: 'hack guru' }) });
cek('B3 guru MENGUBAH jurnal siswa (harus ditolak)', r.ok, false);
// B4 instansi update jurnal siswa → DITOLAK
r = await fetch(BASE + `/api/collections/jurnal/records/${jurnalAda.id}`, { method: 'PATCH', headers: Hi, body: JSON.stringify({ deskripsi: 'hack instansi' }) });
cek('B4 instansi MENGUBAH jurnal siswa (harus ditolak)', r.ok, false);
// B5 guru & instansi MASIH bisa MEMANTAU (list jurnal) → BOLEH
r = await fetch(BASE + '/api/collections/jurnal/records?perPage=1', { headers: Hg });
const jg = await r.json();
cek('B5 guru MEMANTAU (list jurnal)', r.ok && (jg.items?.length || 0) > 0, true);
r = await fetch(BASE + '/api/collections/jurnal/records?perPage=1', { headers: Hi });
const ji = await r.json();
cek('B6 instansi MEMANTAU (list jurnal)', r.ok && (ji.items?.length || 0) > 0, true);
// B7 instansi CREATE jurnal → DITOLAK (rule: siswa = @request.auth.id)
r = await fetch(BASE + '/api/collections/jurnal/records', { method: 'POST', headers: Hi, body: JSON.stringify({ siswa: idSiswa, deskripsi: 'x', isDraft: true }) });
cek('B7 instansi MEMBUAT jurnal (harus ditolak)', r.ok, false);

// --- CLEANUP ---
await fetch(BASE + `/api/collections/nilai/records/${idNilai}`, { method: 'DELETE', headers: SH });
await fetch(BASE + `/api/collections/jurnal/records/${jurnalTes}`, { method: 'DELETE', headers: SH });
for (const id of [idGuru, idIns]) await fetch(BASE + `/api/collections/teacher_users/records/${id}`, { method: 'DELETE', headers: SH });
await fetch(BASE + `/api/collections/student_users/records/${idSiswa}`, { method: 'DELETE', headers: SH });
console.log('\n(semua akun & data uji dihapus)');

console.log(`\n===== HASIL: ${pass} PASS, ${fail} FAIL =====`);
