const BASE = 'http://127.0.0.1:8090';
const SU = { identity: 'tempadmin2@epkl.local', password: 'Pass1234!' };
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SU)
  })).json()).token;
  const H = { Authorization: tok };

  const un = 'tmpg' + Math.floor(Math.random() * 1e6);
  const mk = await fetch(BASE + '/api/collections/teacher_users/records', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: un, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', verified: true })
  });
  const mkData = await mk.json();
  if (!mk.ok) { console.log('GAGAL buat guru temp:', JSON.stringify(mkData)); return; }
  console.log('guru temp dibuat:', mkData.id, 'username=' + un);

  try {
    const lg = await (await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: un, password: 'Temp1234!' })
    })).json();
    if (!lg.token) { console.log('login gagal:', JSON.stringify(lg)); return; }
    const GH = { Authorization: lg.token };
    const jj = async (u) => { const x = await fetch(BASE + u, { headers: GH }); return { status: x.status, data: await x.json() }; };
    console.log('login guru temp OK, role =', lg.record.role);

    // REPRO fetchSiswaOptions
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
    console.log('options:', JSON.stringify(options.map(o => `${o.nama} (userId=${o.userId.slice(0, 8)}…, siswaId=${o.siswaId.slice(0, 8)}…)`)));
    if (!options.length) { console.log('>>> GAGAL: options kosong untuk guru'); return; }

    // REPRO getInfo
    for (const o of options) {
      const rs = await jj(`/api/collections/siswa/records/${o.siswaId}?expand=program_keahlian,guru_pembimbing`);
      const ri = await jj(`/api/collections/pemetaan/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.siswaId}')`)}&expand=iduka,iduka.pembimbing_sekolah,program_keahlian,siswa`);
      const it = ri.data.items?.[0];
      console.log(`\n[${o.nama}] getOne siswa=${rs.status} | pemetaan iduka=${it?.expand?.iduka?.nama || 'KOSONG'} (${ri.status})`);
      if (it) {
        const rp = await jj(`/api/collections/pemetaan/records?perPage=200&filter=${encodeURIComponent(`(iduka='${it.iduka}' && siswa!='${o.siswaId}')`)}&expand=iduka,siswa`);
        console.log(`     teman se-iduka=${rp.data.totalItems} (${rp.status})`);
      }
      const rj = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.userId}')`)}`);
      console.log(`     jurnal(account id)=${rj.data.totalItems} (${rj.status})`);
    }
    console.log('\n>>> SEMUA QUERY GURU BERFUNGSI DI SERVER — masalahnya di sisi client.');
  } finally {
    const del = await fetch(BASE + `/api/collections/teacher_users/records/${mkData.id}`, { method: 'DELETE', headers: H });
    console.log('cleanup guru temp:', del.status === 204 ? 'OK' : 'status ' + del.status);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
