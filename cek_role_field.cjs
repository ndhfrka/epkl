const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const c = await (await fetch(BASE + '/api/collections/teacher_users', { headers: H })).json();
  const role = (c.fields || []).find(f => f.name === 'role');
  console.log('teacher_users.role field:', JSON.stringify(role, null, 2));

  // nilai role aktual di record
  const ls = await (await fetch(BASE + '/api/collections/teacher_users/records?perPage=5', { headers: H })).json();
  for (const it of ls.items) console.log(`  ${it.username} role=${JSON.stringify(it.role)} tipe=${Array.isArray(it.role) ? 'ARRAY' : typeof it.role}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
