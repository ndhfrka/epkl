foreach ($f in @('nilai\index.vue','jurnal\index.vue','proyek\index.vue')) {
  $p = Join-Path 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages' $f
  Write-Output "### $f"
  Select-String -Path $p -Pattern 'instansi|iduka|pemetaan' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" } | Select-Object -First 25
}
