/* Baca email teacher_users + setting domain dari pb_data (READ-ONLY) */
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const rows = db.prepare("SELECT id, email, verified FROM teacher_users").all();
console.log('### teacher_users emails:');
for (const r of rows) console.log(' ', r.id, r.email, 'verified=' + r.verified);
const cols = db.prepare("SELECT id, name FROM _collections WHERE type='auth'").all();
console.log('\n### auth collections:', cols.map(c => c.name).join(', '));
// settings JSON di internal db
try {
  const db2 = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/auxiliary.db', { readOnly: true });
  const ps = db2.prepare("SELECT key, value FROM _params").all();
  for (const p of ps) {
    if (/domain/i.test(p.key) || /domain/i.test(String(p.value))) {
      console.log('\n### _params domain-ish:', p.key, String(p.value).slice(0, 300));
    }
  }
  db2.close();
} catch (e) { console.log('(auxiliary.db tidak ada / err:', e.message, ')'); }
db.close();
