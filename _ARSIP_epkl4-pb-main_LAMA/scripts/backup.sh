#!/usr/bin/env bash
# backup.sh - Membuat backup zip dari folder pb_data dan menyimpan maksimum 7 backup terbaru.

set -euo pipefail

# Direktori proyek
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PB_DATA="$PROJECT_ROOT/pb_data"
BACKUP_DIR="$PB_DATA/backups"

# Pastikan folder backup ada
mkdir -p "$BACKUP_DIR"

# Nama file backup dengan timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.zip"

# Buat zip (menyertakan seluruh isi pb_data kecuali folder backups itu sendiri)
cd "$PB_DATA"
zip -r "$BACKUP_FILE" . -x "backups/*"
cd - > /dev/null

echo "Backup selesai: $BACKUP_FILE"

# Hapus backup lama, sisakan maksimal 7 file terbaru
cd "$BACKUP_DIR"
ls -1t backup_*.zip | tail -n +8 | xargs -r rm --
cd - > /dev/null

echo "Backup lama yang berlebih telah dihapus, hanya menyisakan 7 backup terbaru."
