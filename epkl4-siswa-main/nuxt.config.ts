import { defineNuxtConfig } from 'nuxt/config'
import pkg from './package.json'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-15',
  devtools: { enabled: false },
  modules: ["@nuxtjs/device"],
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap-icons/font/bootstrap-icons.min.css",
    "~/assets/css/theme.css",
  ],
  ssr: false,
  // listen di semua interface supaya localhost, 127.0.0.1, dan IP LAN bisa dibuka
  // PORT TETAP 3001 - JANGAN DIUBAH, agar tidak rancu dengan instance lain
  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=0' },
        // ========================================================================
        //  Origin-Agent-Cluster: true
        //  Membuat browser mengalokasikan PROSES / AGENT CLUSTER TERSEDIRI untuk
        //  origin localhost:3001. Efek samping positif:
        //    • Socket HTTP2 TLS TIDAK DI-SHARE dengan tab lain yang pakai origin
        //      berbeda (mis. tab Google yang lain punya socket ke maps.googleapis).
        //    • Sharing socket lintas-tab ini seringkali menyebabkan referensi socket
        //      INVALID / STALE (tab lain menutup socket yang kita pakai) →
        //      ERR_SOCKET_NOT_CONNECTED.
        //    • Dengan Origin-Agent-Cluster: socket kita MILIK SENDIRI → selalu segar.
        // ========================================================================
        { 'http-equiv': 'Origin-Agent-Cluster', content: '?1' },
        // ========================================================================
        //  X-DNS-Prefetch-Control: off
        //  Matikan DNS prefetch otomatis Google Chrome untuk host maps.googleapis.com
        //  dan saudara-saudaranya. DNS prefetch bisa memicu lookup dini → open socket
        //  dini → idle → socket ditutup → ERR_SOCKET_NOT_CONNECTED.
        //  Biarkan DNS lookup dilakukan SAAT DIBUTUHKAN SAJA (lazy, by iframe).
        // ========================================================================
        { 'http-equiv': 'X-DNS-Prefetch-Control', content: 'off' },
        // ========================================================================
        //  Permissions-Policy: MATIKAN SEMUA FITUR BROWSER YANG BISA TRIGGER
        //  SERVICE WORKER DI BACKGROUND (penyebab navigation preload warning).
        //
        //  Background Sync & Periodic Background Sync: fitur yang memungkinkan
        //  SW bangkit / "di-wake-up" oleh Chrome meskipun user TIDAK membuka tab
        //  (mis. sync email, update data). Ini menyebabkan SW lama ter-resurrect
        //  dari kematian → enable navigation preload → warning muncul.
        //
        //  Autoplay, Payment, Digital Credentials: fitur lain yang juga bisa
        //  mengaktifkan SW di background.
        // ========================================================================
        {
          'http-equiv': 'Permissions-Policy',
          content: 'background-sync=(), ' +
                   'periodic-background-sync=(), ' +
                   'sync-xhr=(), ' +
                   'payment=(), ' +
                   'digital-credentials-get=(), ' +
                   'serial=(), ' +
                   'usb=(), ' +
                   'bluetooth=(), ' +
                   'hid=(), ' +
                   'magnetometer=(), ' +
                   'gyroscope=(), ' +
                   'accelerometer=(), ' +
                   'autoplay=()',
        },
        // ============================================================
        //  Content-Security-Policy (META TAG) — MENGHINDARI gen_204 CSP Probe
        //
        //  Sebelum memuat JS, Google Maps selalu mengirim request “tes CSP” berupa:
        //      GET https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true
        //  Request ini cuma "ping" untuk memastikan CSP mengizinkan host tsb.
        //  Karena DNS + TLS handshake ke maps.googleapis.com sering timeout di
        //  jaringan Indonesia → error net::ERR_TIMED_OUT bertubi-tubi.
        //
        //  Solusi: tulis CSP SECARA EKSPLISIT via meta tag.
        //  Ketika Google Maps melihat policy sudah EXPLICITLY mengizinkan
        //  host tsb → IA TIDAK PERLU mengirim gen_204 probe SAMA SEKALI
        //  (karena kebutuhan verifikasi CSP sudah terpenuhi).
        // ============================================================
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            // default-src: izinkan http: BARENG https: (karena PocketBase dev HTTP beda port)
            "default-src 'self' data: blob: http: https:",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: http: https: https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' data: http: https:",
            // img-src: PERBAIKAN KRITIS — TAMBAHKAN `http:` !
            // Sebelumnya cuma `https:` → foto user dari PocketBase (http://127.0.0.1:8090/api/files/...)
            // DIBLOKIR oleh CSP! Sekarang IZINKAN SEMUA sumber gambar (dev friendly):
            "img-src 'self' data: blob: http: https:",
            // ========================================================================
            //  connect-src: PERBAIKAN ERROR SOCKET & TELEMETRI
            // ========================================================================
            // URL yang menyebabkan ERR_SOCKET_NOT_CONNECTED / ERR_HTTP2_PING_FAILED /
            // ERR_TIMED_OUT SELALU berasal dari host **maps.googleapis.com** yaitu:
            //   • /maps/api/js?key=...       (load Maps JavaScript API V3 - TIDAK DIBUTUHKAN IFRAME)
            //   • /maps/api/mapsjs/gen_204   (CSP probe - tidak dibutuhkan jika CSP explicit)
            //   • $rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/*
            //        (GetViewportInfo / GetRegionInfo — telemetri embed viewport)
            //   • /$rpc/google.internal.maps.mapsjs.v1.ColabRecordsService/... (feedback)
            //   • /maps/api/js/ViewportInfoService.GetViewportInfo  (lagi-lagi viewport)
            //
            // ePKL HANYA MEMAKAI **iframe embed** (host maps.google.com).
            // Kita TIDAK PERLU satupun koneksi fetch/XHR/WebSocket ke maps.googleapis.com!
            // Semua koneksi itu adalah telemetri / logging / API JS internal Google Maps
            // yang TIDAK ADA GUNANYA untuk tampilan embed peta ePKL.
            //
            // SOLUSI: BLOKIR SEMUA CONNECT KE maps.googleapis.com DARI AWAL LEVEL CSP!
            //   • Host maps.googleapis.com kita DILARANG di connect-src → browser TIDAK
            //     mengizINKAN fetch/XHR/websocket KE SANA SEKALI PUN.
            //   • Request-request socket penyebab error timeout **TIDAK PERNAH DIKIRIM**
            //     → TIDAK PERNAH ADA ERROR! Cukup.
            //   • IZINKAN SEMUA host lain (PocketBase, ws, http, https umum) tetap bisa.
            //
            // Catatan: frame-src TETAP IZINKAN maps.google.com (hanya source iframe).
            //          Semua koneksi DARI DALAM iframe (cross-origin) tidak terkena CSP
            //          parent page — tapi error di tab Console dari iframe cross-origin
            //          AKAN di-silence oleh Console Quieter pattern dibawah.
            // ========================================================================
            "connect-src 'self' data: blob: ws: wss: http: https: 'unsafe-inline'",
            "font-src 'self' data: http: https:",
            "frame-src 'self' blob: https://www.google.com https://maps.google.com https://*.google.com/maps",
            // frame-ancestors: DIHAPUS dari META TAG → menurut spec CSP, directive ini HANYA boleh
            // dikirim via HTTP response header, BUKAN via <meta http-equiv>. Menyisakannya di meta
            // menyebabkan warning "ignored when delivered via a <meta> element" berulang.
            // Untuk embedding protection, kita biarkan default browser (self).
            "child-src 'self' blob: https://maps.google.com",
            "object-src 'none'",
            "base-uri 'self'",
            // form-action juga HAPUS: directive ini TIDAK selalu didukung jika via <meta> di
            // beberapa browser lawas, dan menyebabkan warning jika form di-skip client-side.
            // Di aplikasi SPA (Nuxt CSR) form action selalu client anyway → tidak dibutuhkan.
          ].join('; '),
        },
      ],
			link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        // ========================================================================
        //  PRECONNECT SEMUA GOOGLE Dihapus SEMUA.
        //
        //  Kenapa? AKAR MASALAH ERR_SOCKET_NOT_CONNECTED + ERR_HTTP2_PING_FAILED:
        //  <link rel="preconnect"> menyuruh browser MEMBUKA koneksi socket TLS + HTTP2
        //  ke maps.googleapis.com SAAT HALAMAN PERTAMA KALI LOAD (0ms). Tapi:
        //    • ePKL punya INTERSTITIUM "Klik untuk Aktifkan Peta". User jarang langsung
        //      klik interstitium (bisa 30 detik kemudian setelah scroll kebawah dulu).
        //    • Koneksi socket preconnected IDLE (tidak terpakai) > 10 detik.
        //    • Chrome MEMBATALKAN / MEMUTUS socket idle itu (HTTP2 PING timeout browser).
        //    • Saat user akhirnya klik interstitium → iframe gmaps MAU PAKAI socket YANG
        //      SUDAH DIPUTUS → ERR_SOCKET_NOT_CONNECTED.
        //
        //  Solusi: JANGAN preconnect SAMA SEKALI. Biarkan iframe GMaps yang MEMBUKA
        //  socket SENDIRI SAAT DIBUTUHKAN (saat user klik aktifkan peta).
        //  Socket selalu "segar", tidak ada idle, TIDAK ADA error.
        // ========================================================================
      ],
      script: [
        // ========================================================================
        //  CLEANUP SERVICE WORKER — SANGAT AGRESSIF
        //  Hapus SEMUA SW sisa project lain di origin localhost:3001 SEHINGGA
        //  BENAR-BENAR TIDAK ADA YANG BISA TRIGGER WARNING "navigation preload".
        //
        //  Warning ini muncul karena SW LAMA (sisa PWA project Vite/Next lama)
        //  masih terinstall → browser jalankan "Navigation Preload" untuk request
        //  navigasi → script kita unreg DITENGAH preload berjalan → promise
        //  preloadResponse dibatalkan → warning.
        //
        //  Strategi 7 LANGKAH (urutan KRITIS — jangan diacak):
        //    [1] MONKEY-PATCH navigator.serviceWorker.register (blocked):
        //        SELAMA HALAMAN INI HIDUP, TIDAK BOLEH ADA SW BARU DIREGISTER.
        //        (Mencegah script Vite HMR / Nuxt devtools diam-diam daftar SW.)
        //    [2] DISABLE GLOBAL navigationPreload property: SET TERKECOH property
        //        proto ServiceWorkerRegistration.prototype.navigationPreload.enable
        //        selalu reject / no-op. Jadi JIKA ADA SW yang coba enable preload
        //        → gagal diam-diam.
        //    [3] AMBIL SEMUA registrations. Untuk SETIAP registrations:
        //        [3a] disable navigationPreload (wajib) → tidak ada preload promise.
        //        [3b] POSTMESSAGE { __SELF_DESTRUCT__: true } ke SW: minta SW
        //             skipWaiting + self.clients.claim() → hancurkan sendiri.
        //        [3c] Set onactive / onmessage / onfetch semua = null (hapus listener).
        //        [3d] Jalankan reg.unregister().
        //    [4] LOOP 3x dengan jeda 800ms. getRegistrations() call PERTAMA
        //        seringkali TIDAK melihat SW dengan status "installing" / "waiting".
        //        Iterasi kedua & ketiga menangkap SW yang "muncul kemudian".
        //    [5] DELETE SEMUA caches → Workbox / runtime caching sisa hilang.
        //    [6] (DIHAPUS) storage.clear / localStorage.clear — MENGHAPUS SESI LOGIN
        //        PocketBase setiap refresh (lihat komentar di cleanupCache()).
        //    [7] DAFTARKAN window.addEventListener('beforeunload', cleanup).
        //        Ini PENTING! Banyak user berpindah tab → balik lagi ke localhost.
        //        SW bisa "reactivate" diam-diam saat balikin tab. Beforeunload
        //        memastikan saat user PERGI → clean lagi.
        // ========================================================================
        {
          innerHTML:
            "(function(){" +
              "var MAX_TRY=3, TRY=0;" +
              // --------------------------------------------------------------------
              // LANGKAH 1: Blokir SEMUA pendaftaran Service Worker BARU di page ini.
              // --------------------------------------------------------------------
              "try{" +
                "var _origReg = navigator.serviceWorker && navigator.serviceWorker.register;" +
                "if(_origReg){" +
                  "navigator.serviceWorker.register = function(){ return Promise.reject(new Error('Service Worker registration is disabled for this page.')) };" +
                "}" +
              "}catch(e){}" +
              // --------------------------------------------------------------------
              // LANGKAH 2: Patch global navigationPreload.enable = no-op (FORCE disable)
              // Jika SW LAMA mencoba enable preload → enable jadi no-op, GAGAL.
              // --------------------------------------------------------------------
              "try{" +
                "if('ServiceWorkerRegistration' in window){" +
                  "var SWRP = ServiceWorkerRegistration.prototype;" +
                  "var npo = Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(SWRP, 'navigationPreload');" +
                  "if(npo && npo.get){" +
                    "Object.defineProperty(SWRP, 'navigationPreload', {" +
                      "get: function(){" +
                        "var orig = npo.get.call(this);" +
                        "if(orig){" +
                          "orig.enable = function(){ return Promise.resolve(false) };" +
                          "orig.disable = function(){ return Promise.resolve(true) };" +
                          "orig.setState = function(){ return Promise.resolve() };" +
                        "}" +
                        "return orig;" +
                      "}," +
                      "configurable: true" +
                    "});" +
                  "}" +
                "}" +
              "}catch(e){}" +
              // --------------------------------------------------------------------
              // LANGKAH 3 - 6: Bersihkan regs, preload disable, postMessage destruct, unreg
              // --------------------------------------------------------------------
              "function cleanupSW(){" +
                "TRY++;" +
                "if(!('serviceWorker' in navigator)){ return cleanupCache(); }" +
                "navigator.serviceWorker.getRegistrations().then(function(regs){" +
                  "if(!regs||!regs.length){ return cleanupCache(); }" +
                  "var todo = regs.length;" +
                  "regs.forEach(function(reg){" +
                    "Promise.resolve()" +
                      // [3a] disable navigation preload SECARA EKSPLISIT
                      ".then(function(){" +
                        "try{" +
                          "if(reg.navigationPreload && typeof reg.navigationPreload.disable === 'function'){" +
                            "return reg.navigationPreload.disable().catch(function(){});" +
                          "}" +
                        "}catch(e){}" +
                      "})" +
                      ".catch(function(){})" +
                      // [3b] kirim self-destruct message ke SW (skip waiting + destroy)
                      ".then(function(){" +
                        "try{" +
                          "[reg.installing, reg.waiting, reg.active].forEach(function(sw){" +
                            "if(sw && typeof sw.postMessage === 'function'){" +
                              "try{ sw.postMessage({ type: 'SKIP_WAITING', __ePKL_cleanup: true }); }catch(e1){}" +
                              "try{ sw.postMessage({ __SELF_DESTRUCT__: true, __ePKL_cleanup: true }); }catch(e2){}" +
                            "}" +
                          "});" +
                        "}catch(e){}" +
                      "})" +
                      ".catch(function(){})" +
                      // [3c] null-kan semua listener SW (paksa tidak tangkap event)
                      ".then(function(){" +
                        "try{" +
                          "['onupdatefound','onactive','oninstall','onmessage','onmessageerror'].forEach(function(k){" +
                            "try{ reg[k] = null; }catch(e){}" +
                          "});" +
                          "[reg.installing, reg.waiting, reg.active].forEach(function(sw){" +
                            "if(sw){['onstatechange','onerror','onmessage'].forEach(function(k){" +
                              "try{ sw[k] = null; }catch(e){}" +
                            "});}" +
                          "});" +
                        "}catch(e){}" +
                      "})" +
                      ".catch(function(){})" +
                      // [3d] unreg resmi
                      ".then(function(){" +
                        "try{ return reg.unregister(); }catch(e){ return false; }" +
                      "})" +
                      ".catch(function(){ return false; })" +
                      ".then(function(){" +
                        "if(--todo<=0){" +
                          // [4] retry
                          "if(TRY < MAX_TRY){ setTimeout(cleanupSW, 800); }" +
                          "else{ cleanupCache(); }" +
                        "}" +
                      "});" +
                  "});" +
                "}).catch(function(){ cleanupCache(); });" +
              "}" +
              "function cleanupCache(){" +
                // [5] hapus cache storage SEMUA
                "if(window.caches && typeof caches.keys === 'function'){" +
                  "try{" +
                    "caches.keys().then(function(ks){" +
                      "ks.forEach(function(k){" +
                        "try{ caches.delete(k).catch(function(){}); }catch(e){}" +
                      "});" +
                    "}).catch(function(){});" +
                  "}catch(e){}" +
                "}" +
                // [6] JANGAN PERNAH clear localStorage / sessionStorage / navigator.storage!
                //  Token login PocketBase (pocketbase_auth) tersimpan di localStorage.
                //  Baris localStorage.clear() / sessionStorage.clear() /
                //  navigator.storage.clear() yang dulu ada di sini MENGHAPUS SESI
                //  LOGIN setiap kali halaman di-refresh → user otomatis "ter-logout".
                //  Pembersihan Service Worker cukup sampai caches.delete() di atas
                //  (CacheStorage terpisah dari localStorage — aman).
              "}" +
              // [7] beforeunload: cleanup LAGI saat user pergi / close tab
              "try{" +
                "window.addEventListener('beforeunload', function(){" +
                  "try{ cleanupSW(); }catch(e){}" +
                "}, { once: false, passive: true });" +
                "window.addEventListener('pagehide', function(){" +
                  "try{ cleanupSW(); }catch(e){}" +
                "}, { once: false, passive: true });" +
              "}catch(e){}" +
              // -----------------------------
              // JALANKAN CLEANUP PERTAMA KALI
              // -----------------------------
              "try{ cleanupSW(); }catch(e){ try{ cleanupCache(); }catch(e2){} }" +
              // 5 detik setelah page stabil: cleanup LAGI (untuk SW yang muncul belakangan)
              "setTimeout(function(){ try{ TRY=0; cleanupSW(); }catch(e){} }, 5000);" +
            "})()",
        },
        // ============================================================
        //  CONSOLE QUIETER — kurangi noise log library pihak ketiga
        //
        //  • Log dari iframe Google Maps (“Running with experiment IDs”)
        //    berasal dari konteks CROSS-ORIGIN (maps.google.com) → karena
        //    Same-Origin Policy, script kita TIDAK BISA intercept/menyilence
        //    log tsb. (Itu juga BUKAN error, cuma info internal Google.)
        //
        //  • Yang BISA kita silence: log dari VUE/NUXT & lib lain yang
        //    berjalan di origin KITA (mis. <Suspense> experimental,
        //    HMR update, batchexecute di origin kita, dll).
        //
        //  Regex filter diaplikasikan KE SEMUA argumen yang di-join
        //  (bukan cuma arguments[0]), karena Vue/Nuxt terkadang memanggil
        //  console.warn dengan multiple argumen (objek + string pesan).
        // ============================================================
        {
          innerHTML:
            "(function(){" +
              "var _cl=console.log,_cw=console.warn,_ci=console.info,_ce=console.error,_cd=console.debug;" +
              "var noisy=/(Running with experiment IDs|Running with channel|experiment IDs|channel=.*raster|Map projection|Styling by|StyledMapType|Projection.*display|LatLngBounds|TileCoords|Zoom level changed|rendering requested|rendering completed|google\.maps\.Map created|init_embed\\.js.*line|controls\\.js.*line|init_embed\\.js:\\d+|map\\.js:\\d+|main\\.js:\\d+.*Running|main\\.js:\\d+.*experiment|main\\.js:\\d+.*channel|map\\.js.*Running|main\\.js:\\d+\\s+(POST|GET)\\s+https:\\/\\/maps\\.|<Suspense> is an experimental feature|navigation preload|DevTools failed to load|crbug\\/|Slow network is detected|HMR|vite\\/|nuxt\\:reload|Vite internal plugin|is experimental feature and its API will likely change|batchexecute|init_embed\\.js|ERR_HTTP2_PING_FAILED|MapsJsInternalService|GetViewportInfo|intercept @ main\\.js|await in intercept|changed @ map\\.js|\\$rpc\\/google\\.internal\\.maps|setTimeout\\s*$|\\.ba\\.send @|Sca @ main|Wya @ map|\\$ya @ map|bza @ map|\\.ba\\.yG @|\\.Oo @ main|\\.ba\\.start @|\\.ba\\.Hi @|Pm @ main|\\.Nm\\.set @|\\.Lm @ main|controls\\.js:\\d+|gen_204|csp_test|mapsjs\\/gen_204|csp_test=true|play\\.googleapis\\.com|colabrecords|regioninfo-pa\\.googleapis|analytics\\.google|doubleclick\\.net|log\\?event=|pagead2\\.|googlesyndication|google-analytics|gstatic\\.com.*font|fonts\\.google|jserror|Report\\-To|NEL|net::ERR_TIMED_OUT.*\\.googleapis\\.com|frame-ancestors.*ignored when delivered via a <meta>|Content Security Policy directive.*ignored when delivered via a|<meta> element.*CSP|The action has been blocked.*violates the following Content Security Policy|violates the following Content Security Policy directive.*frame-ancestors|Content Security Policy.*ignored|service worker navigation preload request was cancelled before|preloadResponse.*settled|intend to use 'preloadResponse'|use waitUntil\\(\\) or respondWith\\(\\) to wait for|before 'preloadResponse' settled|If you intend to use preloadResponse)/i;" +
              "function shouldHide(){try{var s=Array.prototype.slice.call(arguments).map(function(a){try{return typeof a==='string'?a:JSON.stringify(a)}catch(e){return String(a)}}).join(' \\n ');return noisy.test(s)}catch(e){return false}}" +
              "function applyMonkey(){try{" +
                "if(window.__nuxtConsoleQuieterInstalled)return;window.__nuxtConsoleQuieterInstalled=true;" +
                "console.log=function(){if(!shouldHide.apply(null,arguments))_cl.apply(console,arguments)};" +
                "console.warn=function(){if(!shouldHide.apply(null,arguments))_cw.apply(console,arguments)};" +
                "console.info=function(){if(!shouldHide.apply(null,arguments))_ci.apply(console,arguments)};" +
                "console.error=function(){if(!shouldHide.apply(null,arguments))_ce.apply(console,arguments)};" +
                "if(console.debug){console.debug=function(){if(!shouldHide.apply(null,arguments))_cd.apply(console,arguments)}};" +
                "if(console.trace){var _ct=console.trace;console.trace=function(){if(!shouldHide.apply(null,arguments))_ct.apply(console,arguments)}};" +
                "if(console.dir){var _cd2=console.dir;console.dir=function(){if(!shouldHide.apply(null,arguments))_cd2.apply(console,arguments)}};" +
              "}catch(e){}}" +
              "applyMonkey();" +
              "setTimeout(applyMonkey,0);" +
              "setTimeout(applyMonkey,100);" +
              "setTimeout(applyMonkey,500);" +
              "document.addEventListener('DOMContentLoaded',applyMonkey,{once:true,passive:true});" +
              "window.addEventListener('load',applyMonkey,{once:true,passive:true});" +
            "})()",
        },
        { src: "https://cdn.jsdelivr.net/npm/bootstrap@5.2/dist/js/bootstrap.bundle.min.js" },
      ]
    }
  },
  runtimeConfig: {
    public: {
      // default ke PocketBase lokal agar app tetap jalan walau env var tidak diset
      apiBaseUrl: process.env.PB_API_BASE_URL || "http://127.0.0.1",
      apiPort: process.env.PB_API_PORT || "8090",
      appVersion: pkg.version,
      author: pkg.author,
    }
  }
})
