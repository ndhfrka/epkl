# Backup.ps1 - Membuat backup zip dari folder pb_data dan menyimpan maksimum 7 backup terbaru (PowerShell)
param(
    [string]$ProjectRoot = (Split-Path -Parent $MyInvocation.MyCommand.Path) + "..",
    [int]$MaxBackups = 7
)

$ProjectRoot = Resolve-Path $ProjectRoot
$PbData = Join-Path $ProjectRoot "pb_data"
$BackupDir = Join-Path $PbData "backups"

# Pastikan folder backup ada
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }

# Nama file backup dengan timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "backup_${Timestamp}.zip"

# Buat zip (kecuali folder backups itu sendiri)
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($PbData, $BackupFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Write-Host "Backup selesai: $BackupFile"

# Hapus backup lama, sisakan maksimal $MaxBackups file terbaru
$backups = Get-ChildItem -Path $BackupDir -Filter "backup_*.zip" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt $MaxBackups) {
    $backupsToDelete = $backups[$MaxBackups..($backups.Count-1)]
    foreach ($file in $backupsToDelete) { Remove-Item $file.FullName }
    Write-Host "Backup lama yang berlebih telah dihapus, hanya menyisakan $MaxBackups backup terbaru."
}
