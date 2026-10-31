const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const info = db.prepare("PRAGMA table_info(teacher_users)").all();
console.log('### kolom teacher_users:');
for (const c of info) console.log(' ', c.name, c.type);
const r = db.prepare("SELECT * FROM teacher_users").all();
console.log('\n### rows (mask token-like):');
for (const row of r) {
  const o = {};
  for (const [k, v] of Object.entries(row)) o[k] = (typeof v === 'string' && v.length > 40) ? v.slice(0, 20) + '…' : v;
  console.log(JSON.stringify(o));
}
db.close();
