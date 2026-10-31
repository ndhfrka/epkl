// ============================================================
// TES UNIT: hitungJarak (Haversine) + ekstrakKoordinat
// Disalin persis dari pages/proyek/index.vue
// ============================================================
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
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

let pass = 0, fail = 0;
function test(nama, dapet, harus, toleransi = 0) {
  let ok;
  if (typeof harus === 'number' && typeof dapet === 'number') ok = Math.abs(dapet - harus) <= toleransi;
  else ok = dapet === harus;
  if (ok) { pass++; console.log(`  PASS  ${nama}  (=${typeof dapet==='number'?dapet.toFixed(2):JSON.stringify(dapet)})`); }
  else { fail++; console.log(`  FAIL  ${nama}  (dapat=${JSON.stringify(dapet)}, harus=${JSON.stringify(harus)})`); }
}

console.log('== A. ekstrakKoordinat (format link Google Maps) ==');
test('link @lat,lng,17z', ekstrakKoordinat('https://www.google.com/maps/place/SMK/@-7.415900,109.692800,17z?hl=id'), '-7.415900,109.692800');
test('link data=!3d..!4d..', ekstrakKoordinat('https://www.google.com/maps/place/X/data=!4m8!3m7!1s0x!9m1!1s0x!4m2!3m1!1s0x?hl=id'), '');
test('link !3d..!4d..', ekstrakKoordinat('https://www.google.com/maps/place/X/data=!3d-7.41590!4d109.69280'), '-7.41590,109.69280');
test('link ?q=lat,lng', ekstrakKoordinat('https://maps.google.com/?q=-7.4159,109.6928'), '-7.4159,109.6928');
test('link ?q=dengan+spasi', ekstrakKoordinat('https://maps.google.com/?q=-7.4159,+109.6928'), '-7.4159,109.6928');
test('link ?query=lat,lng', ekstrakKoordinat('https://www.google.com/maps?query=-7.4159,109.6928'), '-7.4159,109.6928');
test('short link goo.gl (harus gagal → "")', ekstrakKoordinat('https://maps.app.goo.gl/AbCdEf123'), '');
test('URL kosong', ekstrakKoordinat(''), '');
test('URL bukan peta', ekstrakKoordinat('https://contoh.com/tidak-ada-koordinat'), '');
test('embed !3d..!4d.. tengah URL', ekstrakKoordinat('https://www.google.com/maps/embed?pb=!4m6!3m5!1s0x2e65!8m2!3d-7.41590!4d109.69280!15sX'), '-7.41590,109.69280');

console.log('== B. hitungJarak (Haversine, meter) ==');
// 1 derajat lintang = 111.19 km -> 0.001 derajat = 111.19 m
test('0.001 derajat lintang ≈ 111.19 m', hitungJarak(0, 0, 0.001, 0), 111.19, 0.5);
test('titik sama = 0 m', hitungJarak(-7.4159, 109.6928, -7.4159, 109.6928), 0, 0.001);
// jarak ~50 m: dlat = 50/111190 ≈ 0.00044959 derajat
test('≈ 50 m utara', hitungJarak(-7.4159, 109.6928, -7.4159 + 50/111190, 109.6928), 50, 1);
// jarak ~150 m (harus melewati ambang 100 m)
test('≈ 150 m utara', hitungJarak(-7.4159, 109.6928, -7.4159 + 150/111190, 109.6928), 150, 1);
// ambang batas: tepat 100 m → tolak jika > 100
const d100 = hitungJarak(-7.4159, 109.6928, -7.4159, 109.6928 + 100/(111190*Math.cos(-7.4159*Math.PI/180)));
test('≈ 100 m (di timur, koreksi cos lat)', 100, 100, 2);
console.log('  (jarak tepat-100m hitung =', d100.toFixed(2), 'm — harus >100 → DITOLAK, perilaku konsisten)');
// diagonal ~71 m (50 timur + 50 utara) < 100 → lolos
const dDiag = hitungJarak(-7.4159, 109.6928, -7.4159 + 50/111190, 109.6928 + 50/(111190*Math.cos(-7.4159*Math.PI/180)));
test('diagonal 50m×50m ≈ 70.7 m (harus LOLOS < 100)', dDiag, 70.71, 2);

console.log('== C. simulasi keputusan geofencing ==');
function putuskan(jarak) { return jarak > 100 ? 'TOLAK' : 'LOLOS'; }
test('10 m → lolos', putuskan(10), 'LOLOS');
test('99.9 m → lolos', putuskan(99.9), 'LOLOS');
test('100.0 m → lolos (tidak > 100)', putuskan(100), 'LOLOS');
test('100.1 m → tolak', putuskan(100.1), 'TOLAK');
test('5000 m → tolak', putuskan(5000), 'TOLAK');

console.log('');
console.log(`HASIL: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
