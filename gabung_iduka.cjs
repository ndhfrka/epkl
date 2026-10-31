const BASE = 'http://127.0.0.1:8090';
const A = '62i0cwbec62sun2'; // duplikat yang akan dihapus
const B = '2g801ub4uh0csak'; // record electrosoft yang dipertahankan

async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok, 'Content-Type': 'application/json' };

  const get = async (u) => { const r = await fetch(BASE + u, { headers: H }); return (await r.json()); };

  // 1. temukan semua record yang merujuk A
  const targets = ['pemetaan', 'jurnal', 'nilai', 'proyek'];
  const found = {};
  for (const c of targets) {
    const f = await get(`/api/collections/${c}/records?perPage=200&filter=${encodeURIComponent(`iduka='${A}'`)}`);
    found[c] = (f.items || []).map(x => x.id);
    console.log(`${c} merujuk A: ${found[c].length} record`, found[c].join(', '));
  }

  // 2. pindahkan semua ke B
  for (const c of targets) {
    for (const id of found[c]) {
      const r = await fetch(BASE + `/api/collections/${c}/records/${id}`, {
        method: 'PATCH', headers: H, body: JSON.stringify({ iduka: B })
      });
      console.log(`  pindah ${c}/${id} -> B: ${r.status}`);
    }
  }

  // 3. pastikan tak ada lagi yang merujuk A
  console.log('\n-- verifikasi tidak ada referensi A tersisa --');
  let sisa = 0;
  for (const c of targets) {
    const f = await get(`/api/collections/${c}/records?perPage=200&filter=${encodeURIComponent(`iduka='${A}'`)}`);
    sisa += (f.items || []).length;
  }
  const teacherA = await get(`/api/collections/teacher_users/records?perPage=100&filter=${encodeURIComponent(`iduka='${A}'`)}`);
  sisa += (teacherA.items || []).length;
  console.log(`referensi A tersisa: ${sisa} (harus 0)`);
  if (sisa > 0) { console.log('BATALKAN penghapusan!'); return; }

  // 4. hapus record duplikat A
  const del = await fetch(BASE + `/api/collections/iduka/records/${A}`, { method: 'DELETE', headers: H });
  console.log(`\nhapus iduka A: ${del.status === 204 ? 'OK terhapus' : 'GAGAL ' + del.status}`);
  if (del.status !== 204) { console.log(await del.text()); return; }

  // 5. verifikasi akhir
  console.log('\n-- verifikasi akhir --');
  const pem = await get('/api/collections/pemetaan/records?perPage=20&expand=siswa,iduka&sort=-created');
  for (const p of pem.items) {
    console.log(`  pemetaan: ${p.expand?.siswa?.nama || p.siswa} -> ${p.expand?.iduka?.nama} (${p.iduka})`);
  }
  const b = await get(`/api/collections/iduka/records/${B}`);
  console.log(`  iduka B utuh: nama=${b.nama} alamat=${b.alamat} jam=${b.jam_mulai}-${b.jam_selesai}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
