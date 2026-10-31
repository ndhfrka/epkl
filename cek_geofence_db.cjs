const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.argv[2] || 'C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
const row = db.prepare("select * from _collections where name = 'lokasi_pkl'").all()[0];
if (!row) { console.log('KOLEKSI lokasi_pkl TIDAK ADA'); process.exit(1); }
console.log('=== SKEMA lokasi_pkl ===');
JSON.parse(row.fields).forEach(f => console.log(' -', f.name, '|', f.type, f.required ? '(required)' : ''));
console.log('iduka field? lihat di atas. ATURAN API:');
console.log(' listRule  :', row.listRule);
console.log(' viewRule  :', row.viewRule);
console.log(' createRule:', row.createRule);
console.log(' updateRule:', row.updateRule);
console.log(' deleteRule:', row.deleteRule);
console.log('=== DATA ===');
const n = db.prepare('select count(*) c from lokasi_pkl').get().c;
console.log('jumlah record:', n);
try {
  db.prepare('select * from lokasi_pkl limit 5').all().forEach(r => {
    console.log(JSON.stringify({ id: r.id, user: r.user, siswa: r.siswa, link_maps: (r.link_maps||'').substring(0,80), radius: r.radius, created: r.created }));
  });
} catch (e) { console.log('(gagal sampling record:', e.message, ')'); }
// tabel kolom asli (untuk memastikan nama field fisik)
console.log('kolom fisik tabel:', db.prepare('pragma table_info(lokasi_pkl)').all().map(c => c.name).join(', '));
