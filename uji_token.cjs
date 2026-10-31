const BASE = 'http://127.0.0.1:8090';
async function main() {
  const lr = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  const body = await lr.json();
  console.log('login status:', lr.status, '| token len:', (body.token || '').length);
  const tok = body.token;
  // decode JWT payload
  const p = JSON.parse(Buffer.from(tok.split('.')[1], 'base64').toString());
  console.log('JWT payload:', JSON.stringify(p));
  console.log('now:', Math.floor(Date.now() / 1000), 'exp:', p.exp);

  const t1 = await fetch(BASE + '/api/collections?perPage=1', { headers: { Authorization: tok } });
  console.log('\n/api/collections status:', t1.status, (await t1.text()).slice(0, 120));

  const t2 = await fetch(BASE + '/api/collections/jurnal/records?perPage=1', { headers: { Authorization: tok } });
  console.log('/api/collections/jurnal/records status:', t2.status, (await t2.text()).slice(0, 200));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
