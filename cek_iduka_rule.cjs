const BASE = 'http://127.0.0.1:8090';
async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok };
  const c = await (await fetch(BASE + '/api/collections/iduka', { headers: H })).json();
  console.log('iduka rules: create=', JSON.stringify(c.createRule), '| update=', JSON.stringify(c.updateRule), '| delete=', JSON.stringify(c.deleteRule), '| list=', JSON.stringify(c.listRule));
  const t = await (await fetch(BASE + '/api/collections/teacher_users', { headers: H })).json();
  console.log('teacher_users fields:', t.fields.map(f => f.name).join(', '));
}
main().catch(e => { console.error(e); process.exit(1); });
