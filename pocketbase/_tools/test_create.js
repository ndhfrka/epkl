const BASE = 'http://127.0.0.1:8090';

async function main() {
  // 1. login superuser
  let r = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'devfix@epkl.local', password: 'TestFix123456' })
  });
  const su = await r.json();
  if (!su.token) { console.log('SU LOGIN GAGAL:', JSON.stringify(su)); return; }
  console.log('superuser OK');

  // 2. impersonate yovie (student_users)
  r = await fetch(BASE + '/api/collections/student_users/impersonate/vwtji0jc310ppj4', {
    method: 'POST',
    headers: { Authorization: su.token }
  });
  const imp = await r.json();
  if (!imp.token) { console.log('IMPERSONATE GAGAL:', JSON.stringify(imp)); return; }
  console.log('impersonate yovie OK');

  // 3. tes create lokasi_pkl sebagai yovie
  r = await fetch(BASE + '/api/collections/lokasi_pkl/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: imp.token },
    body: JSON.stringify({
      siswa: 'vwtji0jc310ppj4',
      nama_iduka: 'TEST-DIAG',
      alamat: 'Jl. Test No.1, Banjarnegara'
    })
  });
  const res = await r.json();
  console.log('CREATE status:', r.status);
  console.log('CREATE response:', JSON.stringify(res, null, 2));

  // 4. hapus record tes jika sukses
  if (r.status === 200 && res.id) {
    const d = await fetch(BASE + '/api/collections/lokasi_pkl/records/' + res.id, {
      method: 'DELETE',
      headers: { Authorization: su.token }
    });
    console.log('hapus record tes:', d.status);
  }

  // 5. tes list sebagai yovie
  r = await fetch(BASE + '/api/collections/lokasi_pkl/records?expand=siswa', {
    headers: { Authorization: imp.token }
  });
  const list = await r.json();
  console.log('LIST status:', r.status, '| totalItems:', list.totalItems, '| items:', JSON.stringify((list.items || []).map(i => ({ id: i.id, nama: i.nama_iduka, siswa: i.siswa, expand: !!i.expand }))));
}
main().catch(e => console.log('ERR', e.message));
