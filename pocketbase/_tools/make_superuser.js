const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const email = 'devfix@epkl.local';
const pass = 'TestFix123456';
const hash = bcrypt.hashSync(pass, 10);
const tokenKey = require('crypto').randomBytes(25).toString('hex');

const db = new DatabaseSync('c:/Users/ASUS/Downloads/jurnal pkl/pocketbase/pb_data/data.db');
const existing = db.prepare('select id from _superusers where email=?').get(email);
if (existing) {
  db.prepare('update _superusers set password=?, tokenKey=?, verified=1 where id=?').run(hash, tokenKey, existing.id);
  console.log('updated existing', existing.id);
} else {
  const id = Array.from({ length: 15 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
  db.prepare("insert into _superusers (id, email, emailVisibility, verified, password, tokenKey, username, created, updated) values (?,?,?,?,?,?, 'devfix_su', datetime('now'), datetime('now'))").run(id, email, 0, 1, hash, tokenKey);
  console.log('inserted', id);
}
console.log('LOGIN: devfix@epkl.local / ' + pass);
