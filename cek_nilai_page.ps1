$f = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\nilai\index.vue'
Write-Output "### deklarasi user & instansiRows"
Get-Content $f | Select-String -Pattern 'usePocketBaseUser|instansiRows|pemetaanList|nilaiList' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" } | Select-Object -First 20
