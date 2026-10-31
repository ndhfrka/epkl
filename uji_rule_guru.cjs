/* Cek rules koleksi + uji query dgn token GURU & INSTANSI asli (bukan superuser) */
const BASE = 'http://127.0.0.1:8090';
const fs = require('fs');

async function main() {
  let r = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  const tok = (await r.json()).token;
  const H = { Authorization: tok };

  // 1. Rules pemetaan & student_users
  for (const c of ['pemetaan', 'student_users', 'jurnal', 'iduka']) {
    const d = await (await fetch(BASE + `/api/collections/${c}`, { headers: H })).json();
    console.log(`\n### ${c}`);
    console.log('  listRule   :', JSON.stringify(d.listRule));
    console.log('  viewRule   :', JSON.stringify(d.viewRule));
    console.log('  createRule :', JSON.stringify(d.createRule));
  }

  // 2. Cari akun guru utk uji login
  const tu = await (await fetch(BASE + '/api/collections/teacher_users/records?perPage=50', { headers: H })).json();
  console.log('\n### teacher_users:');
  for (const it of tu.items) console.log(`  ${it.id} email=${it.email} role=${it.role} nama=${it.nama}`);

  // 3. Login sbg guru (ambil yg role=guru) lalu jalankan query persis seperti app
  const guru = tu.items.find(x => x.role === 'guru') || tu.items[0];
  console.log(`\n### Login sbg guru: ${guru.email} (role=${guru.role})`);
  const lg = await fetch(BASE + '/api/collections/teacher_users/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: guru.email, password: 'Guru1234!' })
  });
  if (!lg.ok) {
    console.log('  login gagal status', lg.status, await lg.text());
    return;
  }
  const gtok = (await lg.json()).token;
  const GH = { Authorization: gtok };
  const jj = async (u) => { const x = await fetch(BASE + u, { headers: GH }); return { status: x.status, data: await x.json() }; };

  const p = await jj('/api/collections/pemetaan/records?perPage=200&sort=-created&expand=siswa');
  console.log('  pemetaan list status=', p.status, 'totalItems=', p.data.totalItems);
  const u2 = await jj('/api/collections/student_users/records?perPage=200');
  console.log('  student_users list status=', u2.status, 'totalItems=', u2.data.totalItems);

  const options = [];
  for (const pp of (p.data.items || [])) {
    if (pp.expand?.siswa) {
      const s = pp.expand.siswa;
      const acc = (u2.data.items || []).find(x => x.siswa === s.id);
      if (acc) options.push({ userId: acc.id, siswaId: s.id, nama: s.nama });
    }
  }
  console.log('  options yg didapat guru:', JSON.stringify(options));
  console.log('  >>> Jika options kosong -> dropdown siswa hilang -> iduka kosong. INI PENYEBABNYA.');

  // 4. Jurnal filter dgn DATA id vs ACCOUNT id (pakai token guru)
  for (const o of options) {
    const a = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.siswaId}')`)}`);
    const b = await jj(`/api/collections/jurnal/records?perPage=1&filter=${encodeURIComponent(`(siswa='${o.userId}')`)}`);
    console.log(`  ${o.nama}: jurnal dgn DATA id=${a.data.totalItems} | dgn ACCOUNT id=${b.data.totalItems}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
