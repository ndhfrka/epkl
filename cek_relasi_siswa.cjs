const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  // id semua koleksi
  const cols = (await j('/api/collections?perPage=100')).data.items;
  const idMap = {};
  for (const c of cols) idMap[c.id] = c.name;

  console.log('### Mapping collectionId -> nama (koleksi kunci):');
  for (const nm of ['student_users', 'siswa', 'teacher_users', 'pemetaan', 'jurnal', 'absen', 'lokasi_pkl', 'nilai']) {
    const c = cols.find(x => x.name === nm);
    console.log(`  ${nm} = ${c.id}`);
  }
  console.log('\n### _pb_users_auth_ =', idMap['_pb_users_auth_'] || 'TIDAK ADA');

  // field siswa/user di koleksi2 penting -> target mana
  console.log('\n### Target relation field siswa/user:');
  for (const nm of ['jurnal', 'pemetaan', 'absen', 'lokasi_pkl', 'nilai']) {
    const c = cols.find(x => x.name === nm);
    for (const f of (c.fields || [])) {
      if (f.name === 'siswa' || f.name === 'user') {
        console.log(`  ${nm}.${f.name} -> ${idMap[f.collectionId] || f.collectionId}`);
      }
    }
  }

  // bukti dengan DATA: nilai field siswa di jurnal vs id student_users vs id siswa-data
  const jr = await j('/api/collections/jurnal/records?perPage=5&sort=-created');
  const su = await j('/api/collections/student_users/records?perPage=100');
  const sd = await j('/api/collections/siswa/records?perPage=100');
  const suIds = new Set(su.data.items.map(x => x.id));
  const sdIds = new Set(sd.data.items.map(x => x.id));
  console.log('\n### Bukti nilai field jurnal.siswa:');
  for (const it of (jr.data.items || [])) {
    const inAcc = suIds.has(it.siswa) ? '= id student_users (AKUN)' : '';
    const inDat = sdIds.has(it.siswa) ? '= id siswa (DATA)' : '';
    console.log(`  jurnal ${it.id}: siswa=${it.siswa} ${inAcc} ${inDat}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
