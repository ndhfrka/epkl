// ============================================================
// JEMBATAN ePKL — Cloudflare Worker → ngrok → PocketBase di PC
// ============================================================
// Kenapa perlu? Akun gratis ngrok menampilkan halaman peringatan
// "You are about to visit …" (ERR_NGROK_6024) untuk setiap request
// yang User-Agent-nya terlihat seperti browser. Panggilan fetch dari
// aplikasi sudah ditangani lewat header `ngrok-skip-browser-warning`
// (lihat composables/pocketBaseClient.js), TAPI <img> (foto jurnal,
// TTD, logo) dan EventSource (realtime) tidak bisa membawa header
// dari sisi browser. Worker ini menjadi jembatan: semua request ke
// domain *.workers.dev diteruskan ke ngrok dengan header khusus itu
// sudah dipasang, sehingga SEMUA jenis request lolos — foto tampil,
// realtime jalan, tidak ada halaman peringatan.
//
// Cara pakai (lihat README bagian Deploy Online Gratis):
//  1. Ganti nilai TARGET di bawah dengan domain ngrok Anda.
//  2. Deploy ke Cloudflare Workers (paket gratis, tanpa kartu kredit).
//  3. Arahkan PB_API_BASE_URL aplikasi ke URL Worker, mis.:
//     PB_API_BASE_URL=https://epkl-api.contoh.workers.dev  PB_API_PORT=443
// ============================================================

const TARGET = "https://nervous-ferret-squander.ngrok-free.dev"

export default {
  async fetch(req) {
    const u = new URL(req.url)
    const target = TARGET + u.pathname + u.search

    // salin request apa adanya (metode, header, body) lalu tambahkan
    // header bypass ngrok — nilai header bebas, yang penting ada
    const r = new Request(target, req)
    r.headers.set("ngrok-skip-browser-warning", "ePKL")

    // respons diteruskan apa adanya, termasuk streaming SSE realtime
    return fetch(r)
  },
}
