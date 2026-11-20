// [FITUR TEMA] Terapkan mode tersimpan sedini mungkin (sebelum render pertama)
// supaya tidak ada kedipan (flash) tema yang salah saat aplikasi dibuka.
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return
  try {
    const tersimpan = localStorage.getItem('epkl-tema')
    document.documentElement.setAttribute('data-tema', tersimpan === 'terang' ? 'terang' : 'gelap')
  } catch (_) {
    document.documentElement.setAttribute('data-tema', 'gelap')
  }
})
