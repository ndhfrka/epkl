// Perbaiki 2 aturan API:
// 1) teacher_users.updateRule — tambah izin instansi mengubah rekamannya SENDIRI
// 2) student_users.deleteRule — 'admin' && 'jurusan' mustahil (role tunggal) → '||'
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
  console.log(`OK ${name}:\n  updateRule = ${j.updateRule}\n  deleteRule = ${j.deleteRule}`);
  return true;
}

const tu = await fetch(BASE + '/api/collections/teacher_users', { headers: H }).then(r => r.json());
const newUpdate =
  tu.updateRule +
  ` || (id = @request.auth.id && @request.auth.role = 'instansi')`;
const ok1 = await patch('teacher_users', { updateRule: newUpdate });

const su = await fetch(BASE + '/api/collections/student_users', { headers: H }).then(r => r.json());
const newDelete = su.deleteRule.replace("= 'admin' && @request.auth.role = 'jurusan'", "= 'admin' || @request.auth.role = 'jurusan'");
const ok2 = newDelete !== su.deleteRule
  ? await patch('student_users', { deleteRule: newDelete })
  : (console.log('deleteRule student_users tidak berubah — pola tidak ketemu!'), false);

process.exit(ok1 && ok2 ? 0 : 1);
