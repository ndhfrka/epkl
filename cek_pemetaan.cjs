const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const pick = (r, keys) => { const o = {}; for (const k of keys) o[k] = r[k]; return JSON.stringify(o); };

console.log('=== akun ndhfrka? ===');
db.prepare("select * from student_users where username like '%ndhfrka%'").all().forEach(r => console.log(' student_users:', pick(r, ['id', 'username', 'siswa', 'verified'])));
db.prepare("select * from teacher_users where username like '%ndhfrka%'").all().forEach(r => console.log(' teacher_users:', pick(r, ['id', 'username', 'role', 'nama'])));

console.log('\n=== SEMUA student_users ===');
db.prepare('select * from student_users').all().forEach(r => console.log(' ', pick(r, ['id', 'username', 'siswa'])));

console.log('\n=== SEMUA pemetaan ===');
db.prepare('select id, siswa, iduka, program_keahlian from pemetaan').all().forEach(r => console.log(' ', JSON.stringify(r)));

console.log('\n=== pemetaan relasi target ===');
const f = JSON.parse(db.prepare("select fields from _collections where name='pemetaan'").get().fields);
const map = {}; db.prepare('select id, name from _collections').all().forEach(r => map[r.id] = r.name);
for (const name of ['siswa', 'iduka', 'program_keahlian', 'guru_pembimbing']) {
  const x = f.find(z => z.name === name);
  const t = x ? (x.options?.collectionId || x.collectionId) : null;
  console.log(` pemetaan.${name} -> ${t ? (map[t] || t) : (x ? 'BUKAN RELASI (' + x.type + ')' : 'TIDAK ADA')}`);
}

console.log('\n=== validasi pemetaan ===');
for (const p of db.prepare('select id, siswa, iduka from pemetaan').all()) {
  const inSiswa = p.siswa ? db.prepare('select count(*) c from siswa where id = ?').get(p.siswa).c : 0;
  const inAcc = p.siswa ? db.prepare('select count(*) c from student_users where id = ?').get(p.siswa).c : 0;
  const idukaOk = p.iduka ? db.prepare('select count(*) c from iduka where id = ?').get(p.iduka).c : 0;
  console.log(` pemetaan ${p.id}: siswa=${p.siswa} (siswa-base=${inSiswa}, student_users=${inAcc}), iduka=${p.iduka} (valid=${idukaOk})`);
}

console.log('\n=== iduka terbaru ===');
db.prepare('select id, nama, alamat, created from iduka order by created desc limit 5').all().forEach(r => console.log(' ', JSON.stringify(r)));
console.log('\n=== teacher_users (semua) ===');
db.prepare('select * from teacher_users').all().forEach(r => console.log(' ', pick(r, ['id', 'username', 'role', 'nama'])));
