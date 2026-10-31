// buat_iduka_users.cjs
// Membuat koleksi 'iduka_users' di PocketBase dan memindahkan akun 'clasnet' dari 'teacher_users'

const BASE = 'http://127.0.0.1:8090';

async function main() {
  // 1. Login superuser
  const authRes = await fetch(BASE + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'tempadmin2@epkl.local', password: 'Pass1234!' })
  });
  if (!authRes.ok) {
    throw new Error('Gagal login superuser: ' + authRes.status + ' ' + (await authRes.text()));
  }
  const tok = (await authRes.json()).token;
  const H = { 'Content-Type': 'application/json', Authorization: tok };

  // 2. Cek apakah koleksi iduka_users sudah ada
  let idukaColRes = await fetch(BASE + '/api/collections/iduka_users', { headers: H });
  let idukaCol = null;

  if (idukaColRes.status === 404) {
    console.log("Koleksi 'iduka_users' belum ada, sedang membuat koleksi auth baru...");
    const payload = {
      name: 'iduka_users',
      type: 'auth',
      fields: [
        {
          name: 'username',
          type: 'text',
          required: true,
          pattern: '^[\\w][\\w\\.\\-]*$',
          min: 3,
          max: 150,
          autogeneratePattern: 'users[0-9]{6}'
        },
        {
          name: 'nama',
          type: 'text',
          required: false,
          presentable: true
        },
        {
          name: 'role',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['instansi']
        },
        {
          name: 'iduka',
          type: 'relation',
          collectionId: '44myub55g4kvbva', // id koleksi iduka
          maxSelect: 1,
          minSelect: 0,
          cascadeDelete: false,
          required: false
        }
      ],
      indexes: [
        "CREATE UNIQUE INDEX `idx_iduka_users_username` ON `iduka_users` (username COLLATE NOCASE)"
      ],
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: "id = @request.auth.id",
      deleteRule: null,
      authRule: "",
      manageRule: null,
      passwordAuth: {
        enabled: true,
        identityFields: ['username', 'email']
      }
    };

    const createColRes = await fetch(BASE + '/api/collections', {
      method: 'POST',
      headers: H,
      body: JSON.stringify(payload)
    });

    if (!createColRes.ok) {
      throw new Error('Gagal membuat koleksi iduka_users: ' + createColRes.status + ' ' + (await createColRes.text()));
    }
    idukaCol = await createColRes.json();
    console.log("Koleksi 'iduka_users' BERHASIL dibuat! ID:", idukaCol.id);
  } else if (idukaColRes.ok) {
    idukaCol = await idukaColRes.json();
    console.log("Koleksi 'iduka_users' sudah ada! ID:", idukaCol.id);
  } else {
    throw new Error('Gagal cek koleksi: ' + idukaColRes.status + ' ' + (await idukaColRes.text()));
  }

  // 3. Cari akun clasnet di teacher_users
  const findRes = await fetch(BASE + "/api/collections/teacher_users/records?filter=(username='clasnet')", {
    headers: H
  });
  const findData = await findRes.json();
  const clasnetTU = findData.items && findData.items[0];

  if (!clasnetTU) {
    console.log("Akun 'clasnet' tidak ditemukan di teacher_users (mungkin sudah dipindahkan sebelumnya).");
  } else {
    console.log("Ditemukan akun 'clasnet' di teacher_users:", {
      id: clasnetTU.id,
      username: clasnetTU.username,
      nama: clasnetTU.nama,
      role: clasnetTU.role,
      iduka: clasnetTU.iduka
    });

    // 4. Cek apakah di iduka_users sudah ada clasnet
    const checkIdukaRes = await fetch(BASE + "/api/collections/iduka_users/records?filter=(username='clasnet')", {
      headers: H
    });
    const checkIdukaData = await checkIdukaRes.json();

    if (!checkIdukaData.items || checkIdukaData.items.length === 0) {
      console.log("Membuat akun 'clasnet' di koleksi 'iduka_users'...");
      const createAccRes = await fetch(BASE + '/api/collections/iduka_users/records', {
        method: 'POST',
        headers: H,
        body: JSON.stringify({
          id: clasnetTU.id,
          username: clasnetTU.username,
          nama: clasnetTU.nama,
          role: clasnetTU.role || 'instansi',
          iduka: clasnetTU.iduka,
          verified: true,
          password: 'clasnet123',
          passwordConfirm: 'clasnet123'
        })
      });

      if (!createAccRes.ok) {
        console.warn("Gagal buat dengan custom ID, mencoba ID otomatis:", await createAccRes.text());
        const createAccRes2 = await fetch(BASE + '/api/collections/iduka_users/records', {
          method: 'POST',
          headers: H,
          body: JSON.stringify({
            username: clasnetTU.username,
            nama: clasnetTU.nama,
            role: clasnetTU.role || 'instansi',
            iduka: clasnetTU.iduka,
            verified: true,
            password: 'clasnet123',
            passwordConfirm: 'clasnet123'
          })
        });
        if (!createAccRes2.ok) {
          throw new Error('Gagal membuat akun clasnet di iduka_users: ' + (await createAccRes2.text()));
        }
        const createdAcc2 = await createAccRes2.json();
        console.log("Akun 'clasnet' BERHASIL dibuat di iduka_users dengan ID:", createdAcc2.id);
      } else {
        const createdAcc = await createAccRes.json();
        console.log("Akun 'clasnet' BERHASIL dibuat di iduka_users dengan ID:", createdAcc.id);
      }
    } else {
      console.log("Akun 'clasnet' sudah ada di iduka_users.");
    }

    // 5. Hapus akun clasnet dari teacher_users
    console.log("Menghapus akun 'clasnet' dari teacher_users (id: " + clasnetTU.id + ")...");
    const delRes = await fetch(BASE + '/api/collections/teacher_users/records/' + clasnetTU.id, {
      method: 'DELETE',
      headers: H
    });
    console.log("Status hapus dari teacher_users:", delRes.status, delRes.status === 204 ? "(Berhasil terhapus)" : "");
  }

  // 6. Verifikasi hasil akhir
  const checkTU = await fetch(BASE + "/api/collections/teacher_users/records?filter=(username='clasnet')", { headers: H });
  const countTU = (await checkTU.json()).totalItems;
  const checkIU = await fetch(BASE + "/api/collections/iduka_users/records?filter=(username='clasnet')", { headers: H });
  const itemsIU = (await checkIU.json()).items;

  console.log("\n=== HASIL VERIFIKASI ===");
  console.log("Akun 'clasnet' di teacher_users:", countTU === 0 ? "Sudah bersih (0)" : `Masih ada (${countTU})`);
  console.log("Akun 'clasnet' di iduka_users:", itemsIU.length > 0 ? `ADA (id: ${itemsIU[0].id}, nama: ${itemsIU[0].nama}, iduka: ${itemsIU[0].iduka})` : "TIDAK DITEMUKAN");
}

main().catch(e => {
  console.error("ERROR FATAL:", e);
  process.exit(1);
});
