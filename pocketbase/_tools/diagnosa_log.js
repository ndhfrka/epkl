// diagnosa_log.js — lihat request jurnal & absen hari ini dari log PocketBase
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('c:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/auxiliary.db', { readOnly: true });

const total = db.prepare("select count(*) n from _logs where created >= '2026-10-08'").get();
console.log('TOTAL LOG HARI INI:', total.n);

const sampel = db.prepare('select created,data from _logs order by created desc limit 6').all();
console.log('=== SAMPEL LOG TERBARU ===');
for (const r of sampel) console.log(r.created, String(r.data).slice(0, 170));

function dump(label, like) {
  console.log('=== ' + label + ' ===');
  const rows = db
    .prepare("select created,data from _logs where created >= '2026-10-08' and data like ? order by created desc limit 30")
    .all(like);
  if (!rows.length) console.log('(tidak ada)');
  for (const r of rows) {
    try {
      const d = JSON.parse(r.data);
      console.log(r.created, d.method || d.type || '', d.url || '', d.status || '');
    } catch (e) {
      console.log(r.created, '(parse gagal)');
    }
  }
}

dump('JURNAL RECORDS', '%collections%jurnal%');
dump('ABSEN RECORDS', '%collections%absen%');
