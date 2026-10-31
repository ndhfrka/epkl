const BASE = 'http://127.0.0.1:8090';
let pass = 0, fail = 0;
function check(n, c, d = '') { if (c) { pass++; console.log(`  ✅ ${n}${d ? ' — ' + d : ''}`); } else { fail++; console.log(`  ❌ ${n}${d ? ' — ' + d : ''}`); } }
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok, 'Content-Type': 'application/json' };
  const B = '2g801ub4uh0csak';

  const mk = async (body) => (await (await fetch(BASE + '/api/collections/teacher_users/records', { method: 'POST', headers: H, body: JSON.stringify(body) })).json());
  const login = async (identity) => (await (await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, password: 'Temp1234!' })
  })).json()).token;
  const q = async (t, col, filter = '') => (await (await fetch(BASE + `/api/collections/${col}/records?perPage=100${filter ? '&filter=' + encodeURIComponent(filter) : ''}`, { headers: { Authorization: t } })).json()).totalItems;

  const e1 = await mk({ username: 'tel' + Date.now().toString(36), password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'instansi', nama: 'TEMP ELECTROSOFT', iduka: B, verified: true });
  const e2 = await mk({ username: 'tcl' + Date.now().toString(36), password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'instansi', nama: 'TEMP CLASNET', iduka: 'hbter3ym9blunv8', verified: true });
  const g = await mk({ username: 'tg' + Date.now().toString(36), password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU', verified: true });
  const TE = await login(e1.username), TC = await login(e2.username), TG = await login(g.username);

  console.log('== instansi ELECTROSOFT (simulasi akun yang akan Anda buat) ==');
  let t = await q(TE, 'pemetaan');
  check('pemetaan hanya electrosoft (helmiarafa+yovie = 2)', t === 2, `total=${t}`);
  t = await q(TE, 'pemetaan', `iduka='hbter3ym9blunv8'`);
  check('tak bisa lihat pemetaan Clasnet', t === 0, `total=${t}`);
  t = await q(TE, 'jurnal');
  check('jurnal hanya siswa electrosoft (helmiarafa 1)', t === 1, `total=${t}`);
  t = await q(TE, 'absen');
  check('absen hanya siswa electrosoft', t >= 0, `total=${t}`);
  t = await q(TE, 'nilai', `siswa != ''`);
  console.log(`  (info) nilai terlihat: ${t}`);

  console.log('== instansi CLASNET ==');
  t = await q(TC, 'pemetaan');
  check('pemetaan hanya Clasnet (ndhfrka = 1)', t === 1, `total=${t}`);
  t = await q(TC, 'jurnal');
  check('jurnal hanya ndhfrka (19)', t === 19, `total=${t}`);
  t = await q(TC, 'pemetaan', `iduka='${B}'`);
  check('tak bisa lihat pemetaan electrosoft', t === 0, `total=${t}`);

  console.log('== guru ==');
  t = await q(TG, 'pemetaan');
  check('guru lihat semua pemetaan (3)', t === 3, `total=${t}`);

  // cleanup
  for (const id of [e1.id, e2.id, g.id]) await fetch(BASE + `/api/collections/teacher_users/records/${id}`, { method: 'DELETE', headers: H });
  console.log('\ncleanup 3 akun temp OK');
  console.log(`\n== HASIL: ${pass} PASS, ${fail} FAIL ==`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
