$f1 = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
Write-Output "### jurnal/index.vue (semua baris)"
Get-Content $f1 | ForEach-Object -Begin { $i = 0 } -Process { $i++; "{0,4}: {1}" -f $i, $_ }
