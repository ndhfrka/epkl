$f = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
$lines = Get-Content $f
Write-Output "### definisi ttdUrl & infoValues"
Get-Content $f | Select-String -Pattern 'ttdUrl|infoValues|import \{' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" } | Select-Object -First 15
