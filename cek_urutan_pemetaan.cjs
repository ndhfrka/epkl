const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };
  const p = await j('/api/collections/pemetaan/records?perPage=20&sort=-created&expand=siswa,iduka');
  console.log('pemetaan urut -created:');
  for (const it of p.data.items) {
    console.log(`  created=${it.created} | siswa=${it.expand?.siswa?.nama || it.siswa} | iduka=${it.expand?.iduka?.nama || it.iduka}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
