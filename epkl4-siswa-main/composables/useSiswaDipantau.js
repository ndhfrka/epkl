// id akun student_users milik siswa yang dipantau guru/instansi.
// - guru: pilihan terakhir yang dipantau (localStorage) bila masih valid,
//   atau siswa pemilik pemetaan terbaru.
// - instansi: HANYA siswa yang pemetaannya menunjuk ke iduka milik akun
//   instansi tersebut — akun instansi tidak boleh memantau siswa tempat lain.
// return null jika bukan guru/instansi, atau akun instansi belum terhubung
// ke tempat PKL, atau tidak ada siswa yang bisa dipantau.
export async function useSiswaDipantauAkunId() {
  let user = usePocketBaseUser()
  let client = usePocketBaseClient()
  const role = user.user.value?.role
  if (role !== 'instansi' && role !== 'guru') return null

  // Instansi hanya boleh melihat siswa yang dipetakan ke iduka miliknya.
  if (role === 'instansi') {
    const idukaId = user.user.value?.iduka
    if (!idukaId) return null // akun instansi belum dihubungkan ke tempat PKL
    try {
      const pem = await client.collection('pemetaan').getList(1, 50, {
        filter: `iduka='${idukaId}'`,
        sort: '-created',
        expand: 'siswa'
      })
      const items = pem.items || []
      if (!items.length) return null

      const siswaIds = items.map(p => p.expand?.siswa?.id).filter(Boolean)
      if (!siswaIds.length) return null
      const filterAkun = siswaIds.map(id => `siswa='${id}'`).join(' || ')
      const akun = await client.collection('student_users').getList(1, 50, { filter: filterAkun })
      const bySiswaId = {}
      for (const a of (akun.items || [])) {
        if (a.siswa) bySiswaId[a.siswa] = a.id
      }
      const valid = []
      for (const p of items) {
        const sid = p.expand?.siswa?.id
        if (sid && bySiswaId[sid]) valid.push(bySiswaId[sid])
      }
      if (!valid.length) return null

      if (import.meta.client) {
        const saved = localStorage.getItem('selectedSiswaUserId')
        if (saved && valid.includes(saved)) return saved
      }
      return valid[0]
    } catch (e) {
      console.error('[siswaDipantau] gagal menentukan siswa instansi:', e)
      return null
    }
  }

  // Guru memantau siswa per jurusan (program_keahlian)
  if (role === 'guru') {
    try {
      let guruPk = user.user.value?.program_keahlian || []
      if (!Array.isArray(guruPk)) guruPk = guruPk ? [guruPk] : []

      // Fallback deteksi jurusan dari username/nama bila belum diset
      if (!guruPk.length) {
        const uname = (user.user.value?.username || user.user.value?.nama || '').toLowerCase()
        const allPk = await client.collection('program_keahlian').getFullList()
        for (const pk of allPk) {
          const nm = (pk.nama || '').toLowerCase()
          if (nm && uname.includes(nm)) {
            guruPk.push(pk.id)
            break
          }
        }
      }

      let filterAkun = ''
      if (guruPk.length > 0) {
        filterAkun = guruPk.map(id => `program_keahlian='${id}' || siswa.program_keahlian='${id}'`).join(' || ')
      }

      const accs = await client.collection('student_users').getFullList({
        filter: filterAkun || undefined,
        sort: 'username'
      })

      const valid = accs.map(a => a.id)
      if (!valid.length) return null

      if (import.meta.client) {
        const saved = localStorage.getItem('selectedSiswaUserId')
        if (saved && valid.includes(saved)) return saved
      }
      return valid[0]
    } catch (e) {
      console.error('[siswaDipantau] gagal menentukan siswa guru per jurusan:', e)
      return null
    }
  }

  return null
}
