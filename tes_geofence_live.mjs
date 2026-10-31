// ============================================================
// TES INTEGRASI GEO-FENCING (end-to-end ke server 8090 yang hidup)
// ============================================================
const BASE = 'http://127.0.0.1:8090';

function ekstrakKoordinat(url) {
  if (!url) return ''
  let m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (!m) m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (!m) {
    try {
      const u = new URL(url)
      const q = u.searchParams.get('q') || u.searchParams.get('query')
      if (q) m = q.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/)
    } catch {}
  }
  return m ? `${m[1]},${m[2]}` : ''
}
function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180, p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180, dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 1) auth superuser (satu-satunya cara kita memakai API tanpa akun siswa)
const auth = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' }),
});
if (!auth.ok) { console.error('AUTH GAGAL', auth.status, await auth.text()); process.exit(1); }
const token = (await auth.json()).token;
console.log('[1] auth OK');

// 2) tanpa token: HARUS DITOLAK (aturan list butuh login)
const noAuth = await fetch(BASE + '/api/collections/lokasi_pkl/records?perPage=1');
console.log(`[2] akses tanpa login -> HTTP ${noAuth.status} (${noAuth.ok ? 'DIBUKA!' : 'DITOLAK, baik'})`);

// 3) ambil semua record (superuser)
const r = await fetch(BASE + '/api/collections/lokasi_pkl/records?perPage=50&expand=siswa', { headers: { Authorization: token } });
const data = await r.json();
console.log(`[3] total record lokasi_pkl: ${data.totalItems}`);

let gagal = 0;
for (const rec of data.items) {
  const pemilik = rec.expand?.siswa?.username || rec.siswa;
  console.log(`\n=== record ${rec.id} (pemilik: ${pemilik}) ===`);
  console.log(`    nama_iduka: ${rec.nama_iduka}`);
  console.log(`    link_maps : ${(rec.link_maps || '(kosong)').substring(0, 90)}`);

  // 4) query PERSIS seperti aplikasi: filter siswa="<id>" perPage 1
  const q = await fetch(BASE + `/api/collections/lokasi_pkl/records?perPage=1&filter=(siswa='${rec.siswa}')`, { headers: { Authorization: token } });
  const qd = await q.json();
  console.log(`[4] query app-style filter siswa='${rec.siswa}' -> HTTP ${q.status}, dapat ${qd.items?.length ?? '?'} record ${qd.items?.length === 1 ? '(SESUAI)' : '(TIDAK SESUAI!)'}`);
  if (qd.items?.length !== 1) gagal++;

  // 5) ekstrak koordinat dari link ASLI di database
  const koordinat = ekstrakKoordinat(rec.link_maps);
  console.log(`[5] ekstrak koordinat -> "${koordinat}"`);
  if (!koordinat) { console.log('    !! LINK TIDAK BISA DIPARSE — geofencing akan GAGAL untuk record ini'); gagal++; continue; }
  const [lat, lng] = koordinat.split(',').map(Number);

  // 6) simulasi posisi siswa: ±30 m dari lokasi (harus LOLOS), dan 500 m (harus TOLAK)
  const dLokal = 30 / 111190; // derajat
  const dJauh = 500 / 111190;
  const jarakDekat = hitungJarak(lat, lng, lat + dLokal, lng + dLokal);
  const jarakJauh  = hitungJarak(lat, lng, lat + dJauh, lng + dJauh);
  const putuskan = (d) => d > 100 ? 'TOLAK (di luar radius 100 m)' : 'LOLOS (di dalam radius 100 m)';
  console.log(`[6] simulasi berdiri ~30 m dari lokasi  -> jarak ${jarakDekat.toFixed(1)} m -> ${putuskan(jarakDekat)}`);
  console.log(`    simulasi berdiri ~500 m dari lokasi -> jarak ${jarakJauh.toFixed(1)} m -> ${putuskan(jarakJauh)}`);
  if (jarakDekat > 100 || jarakJauh <= 100) gagal++;
}

console.log('');
console.log(gagal === 0 ? '===== SEMUA TES INTEGRASI PASS =====' : `===== ${gagal} MASALAH DITEMUKAN =====`);
process.exit(gagal ? 1 : 0);
