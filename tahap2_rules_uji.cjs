const BASE = 'http://127.0.0.1:8090';
const fs = require('fs');
let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok, 'Content-Type': 'application/json' };
  const patch = async (col, body) => {
    const r = await fetch(BASE + '/api/collections/' + col, { method: 'PATCH', headers: H, body: JSON.stringify(body) });
    return { ok: r.status === 200, data: await r.json() };
  };

  const ROLES = `@request.auth.role = 'guru' || @request.auth.role = 'admin' || @request.auth.role = 'jurusan' || @request.auth.role = 'tu' || @request.auth.role = 'wakasek'`;
  const rules = {
    pemetaan: {
      listRule: `(${ROLES} || (@request.auth.role = 'instansi' && iduka = @request.auth.iduka) || siswa = @request.auth.siswa)`,
      viewRule: `(${ROLES} || (@request.auth.role = 'instansi' && iduka = @request.auth.iduka) || siswa = @request.auth.siswa)`,
    },
    jurnal: {
      listRule: `(${ROLES} || siswa = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa.siswa))`,
      viewRule: `(${ROLES} || siswa = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa.siswa))`,
    },
    absen: {
      listRule: `(${ROLES} || user = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= user.siswa))`,
      viewRule: `(${ROLES} || user = @request.auth.id || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= user.siswa))`,
    },
    nilai: {
      listRule: `(${ROLES} || siswa = @request.auth.siswa || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa))`,
      viewRule: `(${ROLES} || siswa = @request.auth.siswa || (@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa))`,
      createRule: `(@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa)`,
      updateRule: `(@request.auth.role = 'instansi' && @collection.pemetaan.iduka ?= @request.auth.iduka && @collection.pemetaan.siswa ?= siswa)`,
    },
  };

  console.log('== TERAPKAN RULE ==');
  for (const [col, r] of Object.entries(rules)) {
    const res = await patch(col, r);
    check(`rule ${col}`, res.ok, res.ok ? '' : JSON.stringify(res.data).slice(0, 200));
    if (!res.ok) { console.log('!!! hentikan — rollback:'); return; }
  }

  // ===== data & akun uji =====
  console.log('\n== SIAPKAN AKUN TEMP ==');
  const suf = Date.now().toString(36);
  const mkT = async (body) => { const r = await fetch(BASE + '/api/collections/teacher_users/records', { method: 'POST', headers: H, body: JSON.stringify(body) }); return { status: r.status, data: await r.json() }; };
  const g = await mkT({ username: 'tg' + suf, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU', verified: true });
  const i = await mkT({ username: 'ti' + suf, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'instansi', nama: 'TEMP INSTANSI (Clasnet)', iduka: 'hbter3ym9blunv8', verified: true });
  const s = await fetch(BASE + '/api/collections/student_users/records', { method: 'POST', headers: H, body: JSON.stringify({ username: 'ts' + suf, password: 'Temp1234!', passwordConfirm: 'Temp1234!', verified: true, siswa: 'js899cqxe2awkme', nama: 'TEMP SISWA' }) });
  const sData = await s.json();
  check('akun temp guru/instansi/siswa', g.status === 200 && i.status === 200 && s.status === 200, `g=${g.status} i=${i.status} s=${s.status}`);
  if (s.status !== 200) { console.log('detail siswa:', JSON.stringify(sData).slice(0, 300)); }
  const gId = g.data.id, iId = i.data.id, sId = sData.id;

  // data temp milik siswa temp (jurnal/absen/nilai)
  const mkJ = await fetch(BASE + '/api/collections/jurnal/records', { method: 'POST', headers: H, body: JSON.stringify({ siswa: sId, tanggal: '2026-10-14', kegiatan: 'UJI RULE', isValid: false }) });
  const mkA = await fetch(BASE + '/api/collections/absen/records', { method: 'POST', headers: H, body: JSON.stringify({ user: sId, tanggal: '2026-10-14', status: 'hadir' }) });
  const mkN = await fetch(BASE + '/api/collections/nilai/records', { method: 'POST', headers: H, body: JSON.stringify({ siswa: 'js899cqxe2awkme', iduka: 'hbter3ym9blunv8', nilai: 90, catatan: 'UJI RULE' }) });
  const jData = await mkJ.json(), aData = await mkA.json(), nData = await mkN.json();
  check('data temp jurnal/absen/nilai', mkJ.status === 200 && mkA.status === 200 && mkN.status === 200, `j=${mkJ.status} a=${mkA.status} n=${mkN.status}`);
  console.log('  (detail bila gagal) jurnal:', JSON.stringify(jData).slice(0, 200), '| absen:', JSON.stringify(aData).slice(0, 200), '| nilai:', JSON.stringify(nData).slice(0, 200));

  const login = async (col, identity) => (await (await fetch(BASE + `/api/collections/${col}/auth-with-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity, password: 'Temp1234!' })
  })).json()).token;

  const T_GURU = await login('teacher_users', 'tg' + suf);
  const T_INS = await login('teacher_users', 'ti' + suf);
  const T_SISWA = await login('student_users', 'ts' + suf);

  const list = async (t, col, filter = '') => {
    const u = `/api/collections/${col}/records?perPage=100${filter ? '&filter=' + encodeURIComponent(filter) : ''}`;
    const r = await fetch(BASE + u, { headers: { Authorization: t } });
    const d = await r.json();
    return { status: r.status, total: d.totalItems ?? -1 };
  };

  // akun pemilik data pembanding
  const stu = await (await fetch(BASE + '/api/collections/student_users/records?perPage=50', { headers: H })).json();
  const ndh = stu.items.find(x => x.siswa === 'js899cqxe2awkme');
  const helmi = stu.items.find(x => x.siswa && x.siswa !== 'js899cqxe2awkme');

  console.log('\n== MATRIKS UJI ==');
  console.log('-- tanpa login --');
  for (const c of ['pemetaan', 'jurnal', 'absen', 'nilai']) {
    const r = await list('', c);
    check(`anon ${c} = 0 item`, r.status === 200 && r.total === 0, `status=${r.status} total=${r.total}`);
  }

  console.log('-- siswa temp (data = ndhfrka) --');
  let r = await list(T_SISWA, 'pemetaan');
  check('siswa pemetaan hanya miliknya', r.total === 1, `total=${r.total}`);
  r = await list(T_SISWA, 'jurnal');
  check('siswa jurnal hanya milik akunnya (temp 1)', r.total === 1, `total=${r.total}`);
  r = await list(T_SISWA, 'absen');
  check('siswa absen hanya milik akunnya (temp 1)', r.total === 1, `total=${r.total}`);
  r = await list(T_SISWA, 'nilai');
  check('siswa nilai data-nya sendiri (>=1)', r.total >= 1, `total=${r.total}`);

  console.log('-- instansi temp (terhubung Clasnet) --');
  r = await list(T_INS, 'pemetaan');
  check('instansi pemetaan hanya Clasnet (1)', r.total === 1, `total=${r.total}`);
  r = await list(T_INS, 'pemetaan', `iduka='62i0cwbec62sun2'`);
  check('instansi tak bisa ambil pemetaan electrosoft', r.total === 0, `total=${r.total}`);
  r = await list(T_INS, 'jurnal');
  check('instansi jurnal hanya siswa Clasnet (ndhfrka 18 + temp 1 = 19)', r.total === 19, `total=${r.total}`);
  r = await list(T_INS, 'jurnal', `siswa='${helmi.id}'`);
  check('instansi tak bisa ambil jurnal siswa lain', r.total === 0, `total=${r.total}`);
  r = await list(T_INS, 'absen');
  check('instansi absen hanya siswa Clasnet', r.total >= 1, `total=${r.total}`);
  r = await list(T_INS, 'absen', `user='${helmi.id}'`);
  check('instansi tak bisa ambil absen siswa lain', r.total === 0, `total=${r.total}`);
  r = await list(T_INS, 'nilai');
  check('instansi nilai hanya siswa Clasnet', r.total >= 1, `total=${r.total}`);
  r = await list(T_INS, 'nilai', `siswa != 'js899cqxe2awkme'`);
  check('instansi tak bisa ambil nilai siswa lain', r.total === 0, `total=${r.total}`);

  // create/update nilai lintas instansi harus ditolak
  const nFail = await fetch(BASE + '/api/collections/nilai/records', {
    method: 'POST', headers: { Authorization: T_INS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siswa: 'ID_SISWA_LAIN', iduka: 'hbter3ym9blunv8', nilai: 1 })
  });
  check('instansi create nilai utk siswa lain ditolak', !nFail.ok, `status=${nFail.status}`);
  const nFail2 = await fetch(BASE + `/api/collections/nilai/records/${nData.id}`, {
    method: 'PATCH', headers: { Authorization: T_INS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ nilai: 1 })
  });
  check('instansi update nilai miliknya sendiri boleh', nFail2.ok, `status=${nFail2.status}`);
  const nFail3 = await fetch(BASE + '/api/collections/nilai/records', {
    method: 'POST', headers: { Authorization: T_GURU, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siswa: 'js899cqxe2awkme', iduka: 'hbter3ym9blunv8', nilai: 1 })
  });
  check('guru create nilai ditolak (kebijakan)', !nFail3.ok, `status=${nFail3.status}`);

  console.log('-- guru temp --');
  r = await list(T_GURU, 'pemetaan');
  check('guru pemetaan semua', r.total === 3, `total=${r.total}`);
  r = await list(T_GURU, 'jurnal');
  check('guru jurnal semua', r.total >= 19, `total=${r.total}`);
  r = await list(T_GURU, 'nilai');
  check('guru nilai semua', r.total >= 1, `total=${r.total}`);

  console.log(`\n== HASIL: ${pass} PASS, ${fail} FAIL ==`);

  // ===== cleanup =====
  console.log('\n== CLEANUP ==');
  const del = async (col, id) => { const d = await fetch(BASE + `/api/collections/${col}/records/${id}`, { method: 'DELETE', headers: H }); return d.status === 204; };
  if (nFail2.ok) console.log('  hapus nilai temp:', del('nilai', nData.id));
  console.log('  hapus jurnal temp:', del('jurnal', jData.id));
  console.log('  hapus absen temp:', del('absen', aData.id));
  console.log('  hapus akun guru temp:', del('teacher_users', gId));
  console.log('  hapus akun instansi temp:', del('teacher_users', iId));
  console.log('  hapus akun siswa temp:', del('student_users', sId));
  fs.writeFileSync('C:/Users/ASUS/Downloads/jurnal pkl/backup_rules_instansi.json.backup2', JSON.stringify({ applied: rules }, null, 2));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
