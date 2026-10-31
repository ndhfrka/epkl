const BASE = 'http://127.0.0.1:8090';
const SU = { identity: 'tempadmin2@epkl.local', password: 'Pass1234!' };
async function main() {
  const lr = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(SU)
  });
  console.log('login superuser status:', lr.status);
  const tok = (await lr.json()).token;
  if (!tok) { console.log('TOKEN KOSONG!'); process.exit(1); }
  const H = { Authorization: tok };
  const j = async (u) => { const x = await fetch(BASE + u, { headers: H }); return { status: x.status, data: await x.json() }; };

  const col = await j('/api/collections/jurnal');
  console.log('jurnal status:', col.status, 'name:', col.data.name, 'type:', col.data.type);
  console.log('fields:', (col.data.fields || []).map(x => `${x.name}:${x.type}${x.collectionId ? '(rel=' + x.collectionId + ')' : ''}`).join(' | '));
  console.log('listRule:', JSON.stringify(col.data.listRule));

  const jr = await j('/api/collections/jurnal/records?perPage=5&sort=-created');
  console.log('\njurnal list status:', jr.status, 'totalItems:', jr.data.totalItems, 'items:', (jr.data.items || []).length);
  for (const it of (jr.data.items || [])) console.log(' ', it.id, JSON.stringify(Object.keys(it)).slice(0, 200));

  // daftar semua koleksi utk cross-check
  const cols = await j('/api/collections?perPage=100');
  if (cols.status !== 200) { console.log('gagal daftar koleksi:', cols.status, JSON.stringify(cols.data)); return; }
  console.log('\nsemua koleksi:', cols.data.items.map(c => c.name).join(', '));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
