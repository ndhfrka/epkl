const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const ls = await (await fetch(BASE + '/api/collections/teacher_users/records?perPage=50&sort=-created', {
    headers: { Authorization: tok }
  })).json();
  console.log('total teacher_users:', ls.totalItems);
  for (const it of ls.items) {
    console.log(`  username=${it.username} | role=${JSON.stringify(it.role)} | nama=${it.nama} | verified=${it.verified}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
