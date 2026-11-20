// [FITUR TEMA] Mode gelap / terang aplikasi
// - Disimpan di localStorage (kunci 'epkl-tema') agar persisten antar kunjungan
// - Diterapkan lewat atribut data-tema pada <html>:
//     <html data-tema="gelap"> (default) / <html data-tema="terang">
// - theme.css mendefinisikan palet terang di bawah html[data-tema='terang']
export const useTema = () => {
  const mode = useState('tema-mode', () => 'gelap')

  const terapkan = (m) => {
    if (import.meta.client) document.documentElement.setAttribute('data-tema', m)
  }

  // Baca pilihan tersimpan (dipanggil onMounted pada komponen tombol)
  const inisialisasi = () => {
    if (!import.meta.client) return
    const tersimpan = localStorage.getItem('epkl-tema')
    mode.value = tersimpan === 'terang' ? 'terang' : 'gelap'
    terapkan(mode.value)
  }

  // Ganti mode & simpan pilihan
  const toggle = () => {
    mode.value = mode.value === 'gelap' ? 'terang' : 'gelap'
    if (import.meta.client) localStorage.setItem('epkl-tema', mode.value)
    terapkan(mode.value)
  }

  return { mode, inisialisasi, toggle }
}
