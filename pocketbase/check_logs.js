const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('c:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const tables = db.prepare("select name from sqlite_master where type='table'").all().map(t => t.name).filter(n => !n.startsWith('_') && !n.startsWith('sqlite'));
console.log('TABLES:', tables.join(', '));
for (const t of tables.filter(t => /jurnal|absen|presensi/i.test(t))) {
  const cols = db.prepare('pragma table_info(' + t + ')').all().map(x => x.name);
  console.log('KOLM ' + t + ':', cols.join(', '));
}
