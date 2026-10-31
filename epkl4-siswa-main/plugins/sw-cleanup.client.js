// Aplikasi ini TIDAK memakai service worker.
// Plugin ini menghapus service worker "nyasar" yang masih terdaftar di origin
// (sisa project/PWA lain yang pernah berjalan di host:port yang sama).
// Tanpa ini, SW lama ikut mengendalikan navigasi dan memunculkan warning
// "The service worker navigation preload request was cancelled...".
export default defineNuxtPlugin(() => {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.getRegistrations()
    .then((regs) => {
      for (const reg of regs) reg.unregister()
    })
    .catch(() => {})
})
