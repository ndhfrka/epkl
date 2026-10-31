/* Reproduksi DENGAN SDK yang sama persis dipakai browser (node_modules pocketbase) */
const PocketBase = require('C:/Users/ASUS/Downloads/jurnal pkl/epkl4-siswa-main/node_modules/pocketbase/dist/pocketbase.cjs');
const BASE = 'http://127.0.0.1:8090';

async function main() {
  // token superuser utk buat/hapus guru temp
  const su = new PocketBase(BASE);
  await su.collection('_superusers').authWithPassword('tempadmin2@epkl.local', 'Pass1234!');

  const un = 'tmpg' + Math.floor(Math.random() * 1e6);
  let tmpId;
  try {
    const mk = await su.collection('teacher_users').create({ username: un, password: 'Temp1234!', passwordConfirm: 'Temp1234!', role: 'guru', nama: 'TEMP GURU UJI', verified: true });
    tmpId = mk.id;
  } catch (e) { console.log('gagal buat guru temp:', e.response?.data || e.message); return; }

  try {
    // === persis seperti client app ===
    const client = new PocketBase(BASE);
    await client.collection('teacher_users').authWithPassword(un, 'Temp1234!');
    console.log('login SDK guru OK, role =', client.authStore.model?.role);

    client.autoCancellation(false);

    // fetchSiswaOptions persis
    const pem = await client.collection('pemetaan').getFullList({ expand: 'siswa', sort: '-created' });
    const userAccs = await client.collection('student_users').getFullList();
    console.log('SDK getFullList: pemetaan=' + pem.length + ' student_users=' + userAccs.length);

    const options = [];
    for (const p of pem) {
      if (p.expand?.siswa) {
        const s = p.expand.siswa;
        const u = userAccs.find(x => x.siswa === s.id);
        if (u) options.push({ userId: u.id, siswaId: s.id, nama: s.nama, kelas: s.kelas });
      }
    }
    console.log('options:', options.map(o => `${o.nama} (kelas=${o.kelas})`).join(' | '));

    // getInfo persis untuk opsi pertama & tiap opsi
    for (const o of options) {
      const selected = o.userId;
      const opt = options.find(x => x.userId === selected);
      const siswaId = opt ? opt.siswaId : '';
      if (!siswaId) { console.log(`[${o.nama}] siswaId KOSONG -> "Belum pemetaan"`); continue; }
      const res_siswa = await client.collection('siswa').getOne(siswaId, { expand: 'program_keahlian, guru_pembimbing' });
      const res_iduka = await client.collection('pemetaan').getList(1, 1, {
        filter: `siswa='${siswaId}'`,
        expand: 'iduka, iduka.pembimbing_sekolah, program_keahlian, siswa'
      });
      console.log(`[${o.nama}] getOne siswa OK (${res_siswa.nama}) | pemetaan items=${res_iduka.items.length} iduka=${res_iduka.items[0]?.expand?.iduka?.nama || 'TIDAK ADA'}`);
      if (res_iduka.items.length > 0) {
        const res_pemetaan = await client.collection('pemetaan').getFullList({
          filter: `iduka='${res_iduka.items[0].iduka}' && siswa!='${siswaId}'`,
          expand: 'iduka, siswa'
        });
        console.log(`   teman se-iduka=${res_pemetaan.length}`);
      }
    }
  } finally {
    await su.collection('teacher_users').delete(tmpId);
    console.log('\ncleanup guru temp OK');
  }
}
main().catch(e => { console.error('FATAL', e.response?.data || e.message); process.exit(1); });
