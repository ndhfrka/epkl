const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db', { readOnly: true });
for (const name of ['nilai', 'jurnal']) {
  const r = db.prepare('select listRule, viewRule, createRule, updateRule, deleteRule from _collections where name = ?').get(name);
  console.log('--- ' + name + ' ---');
  console.log(' list  :', r.listRule);
  console.log(' view  :', r.viewRule);
  console.log(' create:', r.createRule);
  console.log(' update:', r.updateRule);
  console.log(' delete:', r.deleteRule);
  const f = JSON.parse(db.prepare('select fields from _collections where name = ?').get(name).fields);
  console.log(' fields:', f.map(x => x.name + ':' + x.type).join(', '));
}
