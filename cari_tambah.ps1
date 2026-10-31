Write-Output "### nilai\tambah.vue"
Get-Content 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\nilai\tambah.vue' | Select-String -Pattern 'pemetaan|instansi|iduka|siswa|siswaId|getFullList|getList' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" } | Select-Object -First 30
Write-Output ""
Write-Output "### ukuran file:"
Get-ChildItem 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\nilai\*.vue' | ForEach-Object { "$($_.Name) = $($_.Length) bytes" }
