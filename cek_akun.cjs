const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.argv[2] || 'C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
console.log('=== SEMUA KOLEKSI AUTH ===');
db.prepare("select id, name, type from _collections where type = 'auth'").all().forEach(r => console.log(' ', r.name, '| id:', r.id));
console.log('');
console.log('=== FIELD KOLEKSI AUTH (lengkap) ===');
for (const name of ['student_users', 'teacher_users']) {
  const row = db.prepare('select fields from _collections where name = ?').get(name);
  if (!row) continue;
  console.log('--- ' + name + ' ---');
  JSON.parse(row.fields).forEach(f => console.log('  -', f.name, '|', f.type, f.required ? '(required)' : ''));
}
console.log('=== DISTRIBUSI PENGGUNA ===');
try {
  const su = db.prepare('select count(*) c from student_users').get().c;
  console.log('student_users total:', su);
  try { console.log('  per role:', JSON.stringify(db.prepare('select role, count(*) c from student_users group by role').all())); } catch (e) { console.log('  (kolom role tidak ada?)', e.message); }
  console.log('teacher_users total:', db.prepare('select count(*) c from teacher_users').get().c);
  try { console.log('  per role:', JSON.stringify(db.prepare('select role, count(*) c from teacher_users group by role').all())); } catch (e) { console.log('  (kolom role tidak ada?)', e.message); }
} catch (e) { console.log('err', e.message); }
console.log('=== SAMPLE user per koleksi (username/role/nama) ===');
try { db.prepare('select id, username, role, nama from student_users limit 6').all().forEach(r => console.log(' student:', JSON.stringify(r))); } catch (e) { console.log('err', e.message); }
try { db.prepare('select id, username, role, nama from teacher_users limit 6').all().forEach(r => console.log(' teacher:', JSON.stringify(r))); } catch (e) { console.log('err', e.message); }
