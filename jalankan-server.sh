#!/usr/bin/env bash
# Nyalakan server ePKL (PocketBase) + tunnel ngrok untuk deploy online.
#
# Pemakaian:
#   bash jalankan-server.sh              -> domain statis otomatis dari ngrok
#   bash jalankan-server.sh <domain>     -> paksa domain tertentu, mis.
#                                           bash jalankan-server.sh epkl-sekolah.ngrok-free.dev
#
# Lakukan SEKALI sebelum pemakaian pertama (autentikasi ngrok, disimpan permanen):
#   ./ngrok/ngrok config add-authtoken <AUTHTOKEN_ANDA>
#
# Server tetap berjalan setelah jendela terminal ditutup (setsid + nohup).
# Log: /tmp/pb-epkl.log (PocketBase) dan /tmp/ngrok-epkl.log (tunnel).
set -u
cd "$(dirname "$0")"

DOMAIN="${1:-}"

# 1) PocketBase di port 8090
if curl -fsS http://127.0.0.1:8090/api/health >/dev/null 2>&1; then
  echo "PocketBase sudah berjalan, dilewati."
else
  setsid nohup ./pocketbase/pocketbase serve --http=0.0.0.0:8090 </dev/null >/tmp/pb-epkl.log 2>&1 &
  echo "PocketBase dinyalakan (log: /tmp/pb-epkl.log)"
  sleep 2
fi

# 2) Tunnel ngrok -> PC, dengan traffic policy (lapisan tambahan header)
if curl -fsS http://127.0.0.1:4040/api/tunnels >/dev/null 2>&1; then
  echo "Tunnel ngrok sudah berjalan, dilewati."
else
  if [ -n "$DOMAIN" ]; then
    setsid nohup ./ngrok/ngrok http --url="$DOMAIN" --traffic-policy-file=ngrok-policy.yml 8090 </dev/null >/tmp/ngrok-epkl.log 2>&1 &
  else
    setsid nohup ./ngrok/ngrok http --traffic-policy-file=ngrok-policy.yml 8090 </dev/null >/tmp/ngrok-epkl.log 2>&1 &
  fi
  sleep 4
fi

# 3) Tampilkan URL publik yang aktif + uji kesehatan
URL_PUBLIK=$(curl -fsS http://127.0.0.1:4040/api/tunnels 2>/dev/null \
  | python3 -c "import json,sys
try:
    d=json.load(sys.stdin); ts=d.get('tunnels',[])
    print(ts[0].get('public_url','') if ts else '')
except Exception:
    print('')" 2>/dev/null)

if [ -n "$URL_PUBLIK" ]; then
  echo "URL publik API : $URL_PUBLIK"
  if curl -fsS -H "ngrok-skip-browser-warning: ePKL" "$URL_PUBLIK/api/health" 2>/dev/null | grep -q '{'; then
    echo "UJI: $URL_PUBLIK/api/health OK ✓"
  else
    echo "PERINGATAN: uji kesehatan belum berhasil — tunggu 10 detik lalu jalankan lagi," >&2
    echo "atau periksa /tmp/ngrok-epkl.log" >&2
  fi
else
  echo "PERINGATAN: tunnel belum aktif — periksa /tmp/ngrok-epkl.log" >&2
fi
