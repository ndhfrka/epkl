const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
for (const name of ['student_users', 'teacher_users', 'siswa', 'jurnal', 'nilai']) {
  const r = db.prepare('select fields from _collections where name = ?').get(name);
  if (!r) { console.log(name, 'TIDAK ADA'); continue; }
  console.log('--- ' + name + ' (required only) ---');
  JSON.parse(r.fields).forEach(f => { if (f.required) console.log('  *', f.name, '|', f.type); });
}
console.log('=== sample data untuk relasi tes ===');
console.log('siswa(base) records:', db.prepare('select count(*) c from siswa').get().c);
console.log('iduka records:', db.prepare('select count(*) c from iduka').get().c);
console.log('elemen_cp records:', db.prepare('select count(*) c from elemen_cp').get().c);
console.log('nilai records:', db.prepare('select count(*) c from nilai').get().c);
console.log('jurnal records:', db.prepare('select count(*) c from jurnal').get().c);
db.prepare('select id, nama from iduka limit 2').all().forEach(r => console.log(' iduka:', r.id, r.nama));
db.prepare('select id, nama from siswa limit 2').all().forEach(r => console.log(' siswa:', r.id, r.nama));
db.prepare('select id, nama, deskripsi from elemen_cp limit 2').all().forEach(r => console.log(' elemen:', JSON.stringify(r)));
