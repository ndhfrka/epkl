#!/usr/bin/env bash
# run.sh - Memulai PocketBase dan menampilkan log secara real‑time

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Jalankan PocketBase (binary be) pada semua interface, port 8090
./be serve --http=0.0.0.0:8090 &
PID=$!

# Tampilkan log (jika ada file log, tail -f) – PocketBase menulis log ke stdout, jadi kita biarkan proses tetap berjalan
wait $PID
