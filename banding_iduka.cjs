const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  const A = '62i0cwbec62sun2'; // electrosoft milik pemetaan helmiarafa
  const B = '2g801ub4uh0csak'; // electrosoft milik pemetaan yovie

  console.log('=== ISI RECORD IDUKA A (' + A + ') ===');
  const ra = await j(`/api/collections/iduka/records/${A}`);
  console.log(JSON.stringify(ra.data, null, 2));
  console.log('\n=== ISI RECORD IDUKA B (' + B + ') ===');
  const rb = await j(`/api/collections/iduka/records/${B}`);
  console.log(JSON.stringify(rb.data, null, 2));

  // temukan SEMUA koleksi yang punya field relasi ke iduka
  const cols = (await j('/api/collections?perPage=100')).data.items;
  console.log('\n=== KOLEKSI YANG MERUJUK IDUKA ===');
  for (const c of cols) {
    for (const f of (c.fields || [])) {
      if (f.type === 'relation' && f.collectionId === ra.data.collectionId) {
        console.log(`  ${c.name}.${f.name}`);
      }
    }
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
