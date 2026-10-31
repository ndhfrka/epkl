$f = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
$lines = Get-Content $f
Write-Output "### cek duplikat impor & handler"
Get-Content $f | Select-String -Pattern 'eksporAgendaHarianPdf|isEksporPdf' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" }
