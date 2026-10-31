/* Simulasi persis alur fetchSiswaOptions + getInfo guru di pages/index.vue */
const BASE = 'http://127.0.0.1:8090';

async function main() {
  // login superuser
  let r = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  const tok = (await r.json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  console.log('=== 1. pemetaan getFullList (expand=siswa, sort=-created) ===');
  let p = await j('/api/collections/pemetaan/records?perPage=200&sort=-created&expand=siswa');
  console.log('status:', p.status, 'totalItems:', p.data.totalItems);
  for (const it of (p.data.items || [])) {
    console.log(`  pemetaan=${it.id} siswaField=${it.siswa} expandNama=${it.expand?.siswa?.nama || 'TIDAK-EXPAND'} iduka=${it.iduka}`);
  }

  console.log('\n=== 2. student_users getFullList ===');
  let u = await j('/api/collections/student_users/records?perPage=200');
  console.log('status:', u.status, 'totalItems:', u.data.totalItems);
  for (const it of (u.data.items || [])) {
    console.log(`  user=${it.id} nama=${it.nama} siswaField=${it.siswa} role=${it.role}`);
  }

  console.log('\n=== 3. matching persis seperti fetchSiswaOptions ===');
  const options = [];
  for (const pp of (p.data.items || [])) {
    if (pp.expand?.siswa) {
      const s = pp.expand.siswa;
      const acc = (u.data.items || []).find(x => x.siswa === s.id);
      if (acc) options.push({ userId: acc.id, siswaId: s.id, nama: s.nama, kelas: s.kelas });
      else console.log(`  !! TIDAK ADA AKUN untuk siswa data ${s.id} (${s.nama})`);
    } else {
      console.log(`  !! pemetaan ${pp.id} gagal expand siswa (siswaField=${pp.siswa})`);
    }
  }
  console.log('options hasil match:', JSON.stringify(options, null, 2));

  console.log('\n=== 4. getInfo guru-branch: pemetaan getList(1,1) filter siswa=<DATA id> expand iduka dll ===');
  for (const o of options) {
    const f = `(siswa='${o.siswaId}')`;
    const g = await j(`/api/collections/pemetaan/records?perPage=1&filter=${encodeURIComponent(f)}&expand=iduka,iduka.pembimbing_sekolah,program_keahlian,siswa`);
    const it = g.data.items?.[0];
    console.log(`  ${o.nama}: status=${g.status} items=${g.data.items?.length || 0} iduka=${it?.expand?.iduka?.nama || 'KOSONG!'}`);
  }

  console.log('\n=== 5. pemetaan dengan filter siswa=<ACCOUNT id> (cara LAMA yang salah) ===');
  for (const o of options) {
    const f = `(siswa='${o.userId}')`;
    const g = await j(`/api/collections/pemetaan/records?perPage=1&filter=${encodeURIComponent(f)}`);
    console.log(`  filter pakai accountId ${o.userId}: items=${g.data.items?.length || 0}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
