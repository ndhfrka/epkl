// ePKL — Netlify Function proxy API (runtime Deno/Functions v2, streaming)
// Meneruskan semua request /api/* ke tunnel ngrok (PocketBase di PC) sambil
// menyuntikkan header ngrok-skip-browser-warning SECARA SERVER-SIDE, sehingga
// interstitial ngrok tidak pernah tersentuh browser (fetch, <img>, EventSource).
// Seluruh trafik API kini berjalan di origin yang sama dengan UI: satu URL.
const NGROK = "https://nervous-ferret-squander.ngrok-free.dev";

export default async (req) => {
  const url = new URL(req.url);

  // Path asli biasanya dipertahankan (/api/...), tetapi jika Netlify
  // meneruskannya sebagai /.netlify/functions/epkl-api/... kita normalkan.
  let path = url.pathname;
  if (!path.startsWith("/api/")) {
    const m = path.match(/^\/\.netlify\/functions\/epkl-api(\/.*)?$/);
    path = "/api" + (m && m[1] ? m[1] : "");
  }

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("ngrok-skip-browser-warning", "ePKL");

  const init = { method: req.method, headers, redirect: "follow" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    init.duplex = "half";
  }

  const res = await fetch(NGROK + path + url.search, init);

  // Header respons: larang cache edge/browser untuk API (file foto jurnal &
  // galeri ikut no-store — konsisten dengan perbaikan cache Safari/iOS).
  const out = new Headers(res.headers);
  out.set("cache-control", "no-store");
  out.delete("content-security-policy");
  out.delete("x-frame-options");

  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
};
