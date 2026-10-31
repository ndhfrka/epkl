const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.argv[2] || 'C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const tables = db.prepare("select name from sqlite_master where type='table'").all().map(x => x.name);
console.log('TABLES:', tables.join(', '));
const tname = tables.includes('_collections') ? '_collections' : (tables.includes('collections') ? 'collections' : null);
if (tname) {
  const cols = db.prepare(`pragma table_info(${tname})`).all().map(c => c.name);
  console.log('KOlOM ' + tname + ':', cols.join(', '));
  const rows = db.prepare(`select * from ${tname} where name in ('absen','jurnal')`).all();
  for (const r of rows) {
    console.log('====', r.name, '====');
    for (const key of ['fields', 'schema']) {
      if (r[key]) {
        try {
          const j = JSON.parse(r[key]);
          if (Array.isArray(j)) { j.forEach(f => console.log(' -', f.name, '|', f.type || '')); break; }
        } catch (e) {}
      }
    }
  }
}
