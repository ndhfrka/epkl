const BASE = 'http://127.0.0.1:8090';
const SU = { identity: 'tempadmin2@epkl.local', password: 'Pass1234!' };
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SU)
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  // 1. Rules koleksi siswa (viewRule/listRule) — sering jadi penghalang guru
  const col = await j('/api/collections/siswa');
  console.log('### siswa rules:');
  console.log('  listRule:', JSON.stringify(col.data.listRule));
  console.log('  viewRule:', JSON.stringify(col.data.viewRule));

  // 2. Roles guru yang ada
  const tu = await j('/api/collections/teacher_users/records?perPage=100');
  console.log('\n### teacher_users roles:', tu.data.items.map(x => x.role).join(', '));

  // 3. Buat guru TEMP dengan domain yang diizinkan
  const tmpEmail = `tmpguru_${Date.now()}@epkl.local`;
  const mk = await fetch(BASE + '/api/collections/teacher_users/records', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: tmpEmail, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', verified: true })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('GAGAL buat guru temp:', JSON.stringify(mkData)); return; }
  console.log('guru temp dibuat:', mkData.id, tmpEmail);

  try {
    const lg = await (await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: tmpEmail, password: 'Temp1234!' })
    })).json();
    const GH = { Authorization: lg.token };
    const jj = async (u) => { const x = await fetch(BASE + u, { headers: GH }); return { status: x.status, data: await x.json() }; };
    console.log('\nlogin guru temp OK, role =', lg.record.role);

    // 4. REPRO fetchSiswaOptions
    const p = await jj('/api/collections/pemetaan/records?perPage=200&sort=-created&expand=siswa');
    const u2 = await jj('/api/collections/student_users/records?perPage=200');
    console.log(`fetchSiswaOptions: pemetaan=${p.data.totalItems} student_users=${u2.data.totalItems}`);
    const options = [];
    for (const pp of (p.data.items || [])) {
      if (pp.expand?.siswa) {
        const s = pp.expand.siswa;
        const acc = (u2.data.items || []).find(x => x.siswa === s.id);
        if (acc) options.push({ userId: acc.id, siswaId: s.id, nama: s.nama });
      }
    }
    console.log('options:', JSON.stringify(options.map(o => `${o.nama} (userId=${o.userId}, siswaId=${o.siswaId})`)));
    if (!options.length) { console.log('>>> GAGAL: options kosong untuk guru'); }

    // 5. REPRO getInfo: getOne siswa + pemetaan getList (TOKEN GURU)
    for (const o of options) {
      const rs = await jj(`/api/collections/siswa/records/${o.siswaId}?expand=program_keahlian,guru_pembimbing`);
      console.log(`\n[${o.nama}] getOne siswa: status=${rs.status} ${rs.status !== 200 ? JSON.stringify(rs.data) : 'nama=' + rs.data.nama}`);
      const ri = await jj(`/api/collections/pemetaan/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.siswaId}')`)}&expand=iduka,iduka.pembimbing_sekolah,program_keahlian,siswa`);
      const it = ri.data.items?.[0];
      console.log(`[${o.nama}] pemetaan getList: status=${ri.status} iduka=${it?.expand?.iduka?.nama || 'KOSONG'}`);
      const rp = await jj(`/api/collections/pemetaan/records?perPage=200&filter=${encodeURIComponent(`(iduka='${it?.iduka}' && siswa!='${o.siswaId}')`)}&expand=iduka,siswa`);
      console.log(`[${o.nama}] pemetaan teman se-iduka: status=${rp.status} total=${rp.data.totalItems}`);
      const rj = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.userId}')`)}`);
      console.log(`[${o.nama}] jurnal (account id): status=${rj.status} total=${rj.data.totalItems}`);
    }
  } finally {
    const del = await fetch(BASE + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: H });
    console.log('\ncleanup guru temp:', del.status === 204 ? 'OK' : 'status ' + del.status);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
