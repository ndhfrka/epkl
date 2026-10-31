const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db');
const users = db.prepare('select email, username from _superusers').all();
console.log('username existing:', JSON.stringify(users));
db.exec('DROP INDEX IF EXISTS idx_532rs7fzrx');
console.log('indeks legacy idx_532rs7fzrx dihapus. sisa index:');
console.log(JSON.stringify(db.prepare('pragma index_list(_superusers)').all().map(i => i.name)));
