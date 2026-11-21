import PocketBase from 'pocketbase';

export const usePocketBaseClient = () => {
  // composable harus dipanggil di dalam setup/plugin/middleware,
  // jadi useRuntimeConfig dipanggil di sini (bukan di tingkat atas modul)
  const config = useRuntimeConfig()
  const port = config.public.apiPort || "8090"

  // [FIX AKSES LAN] Nilai default apiBaseUrl adalah http://127.0.0.1 — itu
  // hanya benar bila browser berjalan DI MESIN SERVER. Di HP/laptop lain
  // 127.0.0.1 berarti perangkat itu sendiri sehingga PocketBase tidak pernah
  // terjangkau (login/data gagal). Di browser, host PocketBase mengikuti host
  // aplikasi (sama satu mesin dengan PocketBase). Nilai PB_API_BASE_URL yang
  // di-set lewat env tetap dihormati untuk deployment khusus.
  let host = config.public.apiBaseUrl || ""
  const kustom = (process.env.PB_API_BASE_URL || "").trim()
  if (kustom) {
    host = kustom
  } else if (import.meta.client) {
    host = window.location.protocol + "//" + window.location.hostname
  }

  // singleton: semua file memakai satu client supaya sesi login (authStore) tidak terpecah
  if (!globalThis.__epklPbClient) {
    globalThis.__epklPbClient = new PocketBase(host + ":" + port)
  }
  return globalThis.__epklPbClient
}
