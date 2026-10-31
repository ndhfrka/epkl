const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  for (const nm of ['pemetaan', 'jurnal', 'absen', 'nilai']) {
    const c = await j('/api/collections/' + nm);
    console.log(`### ${nm}`);
    console.log('  listRule  :', JSON.stringify(c.data.listRule));
    console.log('  viewRule  :', JSON.stringify(c.data.viewRule));
    console.log('  createRule:', JSON.stringify(c.data.createRule));
    console.log('  updateRule:', JSON.stringify(c.data.updateRule));
  }

  // pemetaan -> iduka untuk tiap siswa
  const p = await j('/api/collections/pemetaan/records?perPage=20&expand=siswa,iduka&sort=-created');
  console.log('\n### pemetaan (siswa -> iduka):');
  for (const it of p.data.items) {
    console.log(`  ${it.expand?.siswa?.nama || '?'} -> ${it.expand?.iduka?.nama || '?'} (idukaId=${it.iduka})`);
  }

  // teacher_users fields
  const t = await j('/api/collections/teacher_users');
  console.log('\n### teacher_users fields:', t.data.fields.map(f => f.name + ':' + f.type).join(', '));
}
main().catch(e => { console.error(e); process.exit(1); });
