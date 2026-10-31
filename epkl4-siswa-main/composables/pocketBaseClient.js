import PocketBase from 'pocketbase';

export const usePocketBaseClient = () => {
  // composable harus dipanggil di dalam setup/plugin/middleware,
  // jadi useRuntimeConfig dipanggil di sini (bukan di tingkat atas modul)
  const config = useRuntimeConfig()
  const host = config.public.apiBaseUrl
  const port = config.public.apiPort

  // singleton: semua file memakai satu client supaya sesi login (authStore) tidak terpecah
  if (!globalThis.__epklPbClient) {
    globalThis.__epklPbClient = new PocketBase(host + ":" + port)
  }
  return globalThis.__epklPbClient
}
