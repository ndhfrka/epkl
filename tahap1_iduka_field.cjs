const BASE = 'http://127.0.0.1:8090';
const fs = require('fs');

async function main() {
  const tok = (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  })).json()).token;
  const H = { Authorization: tok, 'Content-Type': 'application/json' };
  const j = async (u, o = {}) => { const x = await fetch(BASE + u, { headers: H, ...o }); return { status: x.status, data: await x.json() }; };

  // id koleksi iduka
  const cols = (await j('/api/collections?perPage=100')).data.items;
  const idukaId = cols.find(c => c.name === 'iduka').id;
  console.log('iduka collection id:', idukaId);

  // 1) tambah field relasi iduka (maxSelect 1) ke teacher_users bila belum ada
  const tu = await j('/api/collections/teacher_users');
  const fields = tu.data.fields.filter(f => f.name !== 'iduka');
  if (tu.data.fields.some(f => f.name === 'iduka')) {
    console.log('field iduka sudah ada');
  } else {
    fields.push({
      name: 'iduka', type: 'relation', required: false, maxSelect: 1,
      collectionId: idukaId, cascadeDelete: false, minSelect: null
    });
    const patch = await fetch(BASE + '/api/collections/teacher_users', {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ fields })
    });
    const patchData = await patch.json();
    console.log('tambah field iduka:', patch.status === 200 ? 'OK' : JSON.stringify(patchData).slice(0, 400));
  }

  // 2) hubungkan akun clasnet ke iduka Clasnet
  const recs = await j('/api/collections/teacher_users/records?perPage=50');
  const clasnet = recs.data.items.find(x => x.username === 'clasnet');
  if (clasnet) {
    const set = await fetch(BASE + `/api/collections/teacher_users/records/${clasnet.id}`, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({ iduka: 'hbter3ym9blunv8' })
    });
    const setData = await set.json();
    console.log('clasnet.iduka =', set.status === 200 ? setData.iduka : JSON.stringify(setData).slice(0, 300));
  } else {
    console.log('akun clasnet tidak ditemukan!');
  }

  // 3) backup & cetak rule lama utk rollback
  const backup = {};
  for (const nm of ['pemetaan', 'jurnal', 'absen', 'nilai']) {
    const c = await j('/api/collections/' + nm);
    backup[nm] = {
      listRule: c.data.listRule, viewRule: c.data.viewRule,
      createRule: c.data.createRule, updateRule: c.data.updateRule
    };
  }
  fs.writeFileSync('C:/Users/ASUS/Downloads/jurnal pkl/backup_rules_instansi.json', JSON.stringify(backup, null, 2));
  console.log('\nbackup rule lama tersimpan: backup_rules_instansi.json');
  console.log(JSON.stringify(backup, null, 2));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
