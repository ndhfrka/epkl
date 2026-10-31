const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };

  const st = await (await fetch(BASE + '/api/settings', { headers: H })).json();
  console.log('### settings keys:', Object.keys(st).join(', '));
  for (const k of Object.keys(st)) {
    const v = JSON.stringify(st[k]);
    if (/domain/i.test(k) || /domain/i.test(v)) console.log(`  >> ${k}:`, v.slice(0, 400));
  }

  const col = await (await fetch(BASE + '/api/collections/teacher_users', { headers: H })).json();
  console.log('\n### teacher_users collection keys:', Object.keys(col).join(', '));
  for (const k of Object.keys(col)) {
    const v = JSON.stringify(col[k]);
    if (/domain/i.test(k) || /domain/i.test(String(v))) console.log(`  >> ${k}:`, v.slice(0, 300));
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
