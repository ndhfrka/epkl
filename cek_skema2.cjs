const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.argv[2] || 'C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const cols = ['iduka', 'pengaturan', 'pemetaan', 'agenda_info', 'siswa'];
for (const name of cols) {
  const rows = db.prepare('select * from _collections where name = ?').all(name);
  if (!rows.length) { console.log('====', name, ': TIDAK ADA ===='); continue; }
  console.log('====', name, '====');
  const j = JSON.parse(rows[0].fields);
  j.forEach(f => console.log(' -', f.name, '|', f.type));
}
console.log('=== DATA pengaturan ===');
try {
  const rows = db.prepare('select * from pengaturan').all();
  rows.slice(0, 5).forEach(r => console.log(JSON.stringify(r)));
  if (!rows.length) console.log('(kosong)');
} catch (e) { console.log('err:', e.message); }
console.log('=== DATA iduka (sample) ===');
try {
  const rows = db.prepare('select * from iduka limit 3').all();
  rows.forEach(r => console.log(JSON.stringify(r).substring(0, 500)));
  if (!rows.length) console.log('(kosong)');
} catch (e) { console.log('err:', e.message); }
console.log('=== DATA pemetaan (sample) ===');
try {
  const rows = db.prepare('select * from pemetaan limit 3').all();
  rows.forEach(r => console.log(JSON.stringify(r).substring(0, 500)));
  if (!rows.length) console.log('(kosong)');
} catch (e) { console.log('err:', e.message); }
