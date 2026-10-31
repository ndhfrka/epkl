/* Reproduksi PERSIS: token guru asli (akun temp), cek schema jurnal.siswa, nilai field di record nyata */
const BASE = 'http://127.0.0.1:8090';
const SU = { identity: 'tempadmin2@epkl.local', password: 'Pass1234!' };

async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SU)
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  // 1. Schema jurnal: field siswa target koleksi apa?
  const col = await j('/api/collections/jurnal');
  const f = (col.data.fields || []).find(x => x.name === 'siswa');
  console.log('### jurnal.siswa field:', JSON.stringify(f));

  // 2. Record jurnal nyata: isi field siswa = id apa?
  const jr = await j('/api/collections/jurnal/records?perPage=5&sort=-created');
  console.log('\n### jurnal records (siswa field = nilai tersimpan):');
  for (const it of (jr.data.items || [])) {
    console.log(`  jurnal=${it.id} siswa=${it.siswa} tanggal=${it.tanggal || '-'} status=${it.status || it.publish || '-'}`);
  }

  // 3. Buat akun guru TEMP utk login persis seperti app
  const tu = await (await fetch(BASE + '/api/collections/teacher_users/records?perPage=50', { headers: H })).json();
  console.log('\n### teacher_users (semua field list):');
  console.log('  keys record pertama:', Object.keys(tu.items[0] || {}).join(','));
  for (const it of tu.items) console.log(`  ${it.id} role=${it.role} nama=${it.nama} emailVis=${it.emailVisibility}`);

  // cek schema teacher_users utk field wajib
  const tuCol = await j('/api/collections/teacher_users');
  const req = (tuCol.data.fields || []).filter(x => x.required).map(x => x.name);
  console.log('  field required:', req.join(','));

  const tmpEmail = `tmpguru_${Date.now()}@epkl.local`;
  const mk = await fetch(BASE + '/api/collections/teacher_users/records', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tmpEmail, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', name: 'TEMP GURU UJI' })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('GAGAL buat guru temp:', JSON.stringify(mkData)); return; }
  console.log(`\n### guru temp dibuat: ${mkData.id} ${tmpEmail}`);

  try {
    // 4. Login guru temp
    const lg = await (await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: tmpEmail, password: 'Temp1234!' })
    })).json();
    const GH = { Authorization: lg.token };
    const jj = async (u) => { const x = await fetch(BASE + u, { headers: GH }); return { status: x.status, data: await x.json() }; };
    console.log('login guru OK, role =', lg.record.role);

    // 5. fetchSiswaOptions persis
    const p = await jj('/api/collections/pemetaan/records?perPage=200&sort=-created&expand=siswa');
    const u2 = await jj('/api/collections/student_users/records?perPage=200');
    console.log(`pemetaan (guru): status=${p.status} total=${p.data.totalItems}`);
    console.log(`student_users (guru): status=${u2.status} total=${u2.data.totalItems}`);
    const options = [];
    for (const pp of (p.data.items || [])) {
      if (pp.expand?.siswa) {
        const s = pp.expand.siswa;
        const acc = (u2.data.items || []).find(x => x.siswa === s.id);
        if (acc) options.push({ userId: acc.id, siswaId: s.id, nama: s.nama });
      }
    }
    console.log('options guru:', JSON.stringify(options));
    if (!options.length) { console.log('>>> PENYEBAB: guru TIDAK dapat options (fetchSiswaOptions kosong)'); }

    // 6. getInfo + hitung jurnal: DATA id vs ACCOUNT id (dgn token guru)
    for (const o of options) {
      const g = await jj(`/api/collections/pemetaan/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.siswaId}')`)}&expand=iduka,iduka.pembimbing_sekolah,program_keahlian,siswa`);
      const it = g.data.items?.[0];
      console.log(`  [${o.nama}] pemetaan OK, iduka expand = ${it?.expand?.iduka?.nama || 'KOSONG'}`);
      const jd = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.siswaId}')`)}`);
      const ja = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.userId}')`)}`);
      console.log(`     jurnal DATA id (${o.siswaId}) = ${jd.data.totalItems} | ACCOUNT id (${o.userId}) = ${ja.data.totalItems}`);
    }
  } finally {
    // 7. bersihkan akun temp
    const del = await fetch(BASE + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: H });
    console.log('\ncleanup guru temp:', del.status === 204 ? 'OK dihapus' : 'status ' + del.status);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
