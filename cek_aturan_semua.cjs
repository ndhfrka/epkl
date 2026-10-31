const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
console.log('=== koleksi bernama akun_instansi? ===');
const ak = db.prepare("select name from _collections where name like '%instansi%'").all();
console.log(ak.length ? JSON.stringify(ak) : 'TIDAK ADA');
console.log('=== ATURAN API SEMUA KOLEKSI ===');
db.prepare('select name, listRule, viewRule, createRule, updateRule, deleteRule from _collections order by name').all().forEach(r => {
  console.log(`--- ${r.name} ---`);
  console.log('   list  :', r.listRule);
  console.log('   view  :', r.viewRule);
  console.log('   create:', r.createRule);
  console.log('   update:', r.updateRule);
  console.log('   delete:', r.deleteRule);
});
