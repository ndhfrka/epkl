$f = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
Get-Content $f | Select-String -Pattern 'infoValues = |const bulanList|let bulanList|const ttdUrl' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" }
