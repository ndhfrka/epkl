const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
console.log('=== FIELD RELASI (JSON lengkap) ===');
const map = {};
db.prepare('select id, name, type from _collections').all().forEach(r => { map[r.id] = r.name + '(' + r.type + ')'; });
for (const [col, field] of [['lokasi_pkl','siswa'], ['absen','user'], ['jurnal','siswa']]) {
  const row = db.prepare('select fields from _collections where name = ?').get(col);
  if (!row) { console.log(col + ': tidak ada'); continue; }
  const f = JSON.parse(row.fields).find(x => x.name === field);
  console.log(` ${col}.${field}:`, JSON.stringify(f ? { type: f.type, options: f.options } : null));
  const tId = f?.options?.collectionId || f?.collectionId;
  console.log(`   -> target: ${tId ? (map[tId] || tId) : '?'}`);
}
console.log('=== KEPUTUSAN: id di lokasi_pkl.siswa ada di tabel mana? ===');
const ids = db.prepare('select siswa from lokasi_pkl').all().map(r => r.siswa);
for (const id of ids) {
  const inAuth = db.prepare('select count(*) c from student_users where id = ?').get(id).c;
  const inSiswa = db.prepare('select count(*) c from siswa where id = ?').get(id).c;
  console.log(` ${id}: student_users=${inAuth}, siswa(base)=${inSiswa}`);
}
