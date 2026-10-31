const BASE = 'http://127.0.0.1:8090';
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
const token = (await auth.json()).token;
console.log('=== ATURAN KOLEKSI (live server) ===');
for (const c of ['lokasi_pkl', 'absen', 'jurnal']) {
  const r = await fetch(BASE + '/api/collections/' + c, { headers: { Authorization: token } });
  const j = await r.json();
  console.log(`--- ${c} ---`);
  console.log('  listRule  :', JSON.stringify(j.listRule));
  console.log('  viewRule  :', JSON.stringify(j.viewRule));
  console.log('  createRule:', JSON.stringify(j.createRule));
  console.log('  updateRule:', JSON.stringify(j.updateRule));
  console.log('  deleteRule:', JSON.stringify(j.deleteRule));
}
console.log('\n=== VERIFIKASI KOORDINAT via Nominatim (OpenStreetMap) ===');
async function cari(q) {
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(q) + '&format=json&limit=1', { headers: { 'User-Agent': 'epkl-tes/1.0' }, signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return j[0] ? j[0].lat + ',' + j[0].lon : null;
  } catch (e) { return 'GAGAL: ' + e.message; }
}
console.log('Clasnet CCTV Banjarnegara ->', await cari('Clasnet CCTV Banjarnegara'));
console.log('Electrosoft Banjarnegara  ->', await cari('Electrosoft Banjarnegara'));
