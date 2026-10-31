const BASE = 'http://127.0.0.1:8090';
let pass = 0, fail = 0;
function check(n, c, d = '') { if (c) { pass++; console.log(`  ✅ ${n}${d ? ' — ' + d : ''}`); } else { fail++; console.log(`  ❌ ${n}${d ? ' — ' + d : ''}`); } }
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };

  // susun daftar akun siswa + pemetaan mereka
  const stu = (await (await fetch(BASE + '/api/collections/student_users/records?perPage=50', { headers: H })).json()).items;
  const pem = (await (await fetch(BASE + '/api/collections/pemetaan/records?perPage=50&expand=siswa,iduka', { headers: H })).json()).items;
  const byData = {};
  for (const s of stu) if (s.siswa) byData[s.siswa] = s;
  const petaan = {};
  for (const p of pem) petaan[p.siswa] = p.iduka;

  // buat akun instansi temp lagi (yg tadi terhapus) utk uji isolasi
  const suf = Date.now().toString(36);
  const mk = await (await fetch(BASE + '/api/collections/teacher_users/records', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ti' + suf, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'instansi', nama: 'TEMP INSTANSI', iduka: 'hbter3ym9blunv8', verified: true })
  })).json();
  const T_INS = (await (await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'ti' + suf, password: 'Temp1234!' })
  })).json()).token;

  const q = async (t, col, filter) => {
    const u = `/api/collections/${col}/records?perPage=100${filter ? '&filter=' + encodeURIComponent(filter) : ''}`;
    const r = await fetch(BASE + u, { headers: { Authorization: t } });
    return (await r.json()).totalItems;
  };

  console.log('== isolasi jurnal utk instansi (iduka=Clasnet) ==');
  const ndhAcc = stu.find(x => x.siswa === 'js899cqxe2awkme');
  for (const s of stu) {
    if (!s.siswa || s.id === ndhAcc.id) continue;
    const t = await q(T_INS, 'jurnal', `siswa='${s.id}'`);
    check(`jurnal ${s.nama || s.username} tak terlihat instansi`, t === 0, `total=${t}`);
  }
  const ndhCount = await q(T_INS, 'jurnal', `siswa='${ndhAcc.id}'`);
  check('jurnal ndhfrka terlihat instansi', ndhCount > 0, `total=${ndhCount}`);
  const allIns = await q(T_INS, 'jurnal');
  check('total jurnal instansi = jurnal ndhfrka', allIns === ndhCount, `all=${allIns} ndh=${ndhCount}`);
  const allGuru = await q(tok, 'jurnal');
  console.log(`  (info) total jurnal semua (guru): ${allGuru}`);
  // siswa tanpa pemetaan tidak boleh terlihat
  const tanpaPemetaan = stu.filter(x => x.siswa && !petaan[x.siswa]);
  for (const s of tanpaPemetaan) {
    const t = await q(T_INS, 'jurnal', `siswa='${s.id}'`);
    check(`siswa tanpa pemetaan (${s.nama || s.username}) tak terlihat`, t === 0, `total=${t}`);
  }

  console.log('\n== update nilai oleh instansi pemilik ==');
  const nl = (await (await fetch(BASE + `/api/collections/nilai/records?perPage=50&filter=${encodeURIComponent("siswa='js899cqxe2awkme'")}`, { headers: H })).json()).items;
  if (nl.length) {
    const upd = await fetch(BASE + `/api/collections/nilai/records/${nl[0].id}`, {
      method: 'PATCH', headers: { Authorization: T_INS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ catatan: nl[0].catatan || '' })
    });
    check('instansi update nilai siswanya sendiri boleh', upd.ok, `status=${upd.status}`);
    const others = (await (await fetch(BASE + '/api/collections/nilai/records?perPage=50', { headers: H })).json()).items.filter(x => x.siswa !== 'js899cqxe2awkme');
    if (others.length) {
      const upd2 = await fetch(BASE + `/api/collections/nilai/records/${others[0].id}`, {
        method: 'PATCH', headers: { Authorization: T_INS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: 'HACK UJI' })
      });
      check('instansi update nilai siswa lain DITOLAK', !upd2.ok, `status=${upd2.status}`);
      if (upd2.ok) { // safety: kembalikan
        await fetch(BASE + `/api/collections/nilai/records/${others[0].id}`, { method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ catatan: others[0].catatan }) });
      }
    } else {
      console.log('  (info) tidak ada nilai milik siswa lain utk uji negatif');
    }
  }

  // pastikan cleanup tahap lalu benar-benar terjadi
  console.log('\n== cek sisa data temp sebelumnya ==');
  const sisa = {};
  for (const c of ['jurnal', 'absen']) {
    const items = (await (await fetch(BASE + `/api/collections/${c}/records?perPage=100`, { headers: H })).json()).items;
    sisa[c] = items.filter(x => (x.kegiatan === 'UJI RULE') || (x.uraian === 'UJI RULE'));
    for (const it of sisa[c]) { const d = await fetch(BASE + `/api/collections/${c}/records/${it.id}`, { method: 'DELETE', headers: H }); console.log(`  hapus ${c} temp ${it.id}: ${d.status}`); }
  }
  const tuLeft = (await (await fetch(BASE + '/api/collections/teacher_users/records?perPage=50', { headers: H })).json()).items.filter(x => (x.nama || '').startsWith('TEMP'));
  const suLeft = (await (await fetch(BASE + '/api/collections/student_users/records?perPage=50', { headers: H })).json()).items.filter(x => (x.nama || '').startsWith('TEMP'));
  console.log('  sisa akun teacher temp:', tuLeft.length, '| siswa temp:', suLeft.length);

  // hapus instansi temp uji ini
  await fetch(BASE + `/api/collections/teacher_users/records/${mk.id}`, { method: 'DELETE', headers: H });
  console.log('  hapus instansi temp uji ini: OK');

  console.log(`\n== HASIL: ${pass} PASS, ${fail} FAIL ==`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
