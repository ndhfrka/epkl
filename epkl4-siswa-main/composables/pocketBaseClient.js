import PocketBase from 'pocketbase';

// [HELPER URL DASAR] Alamat PocketBase (host:port) yang benar untuk SEMUA konteks:
//  • Deploy online: env PB_API_BASE_URL dipetakan nuxt.config ke runtimeConfig.public
//    — itulah satu-satunya jalur yang BENAR-BENAR sampai ke bundle browser
//    (process.env tidak tersedia di client, pernah bikin login gagal di deploy).
//  • Akses LAN: HP/laptop lain harus mengikuti hostname halaman (bukan 127.0.0.1,
//    yang di perangkat lain berarti "diri sendiri" sehingga API tak terjangkau).
export const urlDasarPocketBase = () => {
  const config = useRuntimeConfig()
  const host = (config.public.apiBaseUrl || "").trim()
  const port = String(config.public.apiPort || "").trim()
  // [DEPLOY A] PB_API_BASE_URL di-set: host eksplisit + port dari PB_API_PORT
  if (host) return host + ":" + (port || "8090")
  // [DEPLOY B] hanya PB_API_PORT di-set (tanpa host): same-origin — dipakai
  // saat aplikasi jadi disajikan langsung dari PocketBase (pb_public) lewat
  // tunnel/Worker, mis. build dengan PB_API_PORT=443
  if (port) {
    if (import.meta.client) {
      return window.location.protocol + "//" + window.location.hostname + ":" + port
    }
    return "http://127.0.0.1:" + port
  }
  // [LAN/DEV] keduanya kosong: PocketBase selalu di port bawaan 8090
  if (import.meta.client) {
    return window.location.protocol + "//" + window.location.hostname + ":8090"
  }
  return "http://127.0.0.1:8090"
}

export const usePocketBaseClient = () => {
  const url = urlDasarPocketBase()

  // singleton: semua file memakai satu client supaya sesi login (authStore) tidak terpecah
  if (!globalThis.__epklPbClient) {
    globalThis.__epklPbClient = new PocketBase(url)

    // [DEPLOY ONLINE — NGROK] Akun ngrok gratis menyisipkan halaman peringatan
    // ("You are about to visit …") untuk setiap request dari browser yang tidak
    // membawa header khusus `ngrok-skip-browser-warning`. Tanpa header ini,
    // semua panggilan API dari frontend yang di-deploy (mis. Netlify) akan
    // menerima halaman HTML peringatan alih-alih JSON sehingga login/data gagal.
    // Header hanya dipasang bila host API memang domain ngrok — akses LAN
    // (mis. http://192.168.x.x:8090) tidak berubah sama sekali. PocketBase aman:
    // header tak dikenal diabaikan, dan preflight CORS-nya meng-echo header yang
    // diminta browser. CATATAN: EventSource (realtime) dan <img> tidak bisa
    // membawa header dari sisi browser — keduanya ditangani jembatan
    // Cloudflare Worker (cf-worker-proxy.js, lihat README bagian Deploy Online).
    if (/ngrok/i.test(url)) {
      globalThis.__epklPbClient.beforeSend = (urlReq, opsi) => {
        opsi.headers = Object.assign({}, opsi.headers, {
          "ngrok-skip-browser-warning": "ePKL",
        })
        // format baru SDK 0.21+: { url, options } (format lama memicu warning)
        return { url: urlReq, options: opsi }
      }
    }
  }
  return globalThis.__epklPbClient
}
