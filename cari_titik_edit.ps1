$f = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
$lines = Get-Content $f
Write-Output "### sekitar deklarasi ref (cari isDeleting/viewMode)"
Get-Content $f | Select-String -Pattern 'let viewMode|let isDeleting|let ttdMap|let agendaItems|let isSaving|const ttdUrl|async function getJurnalAgenda|let filterBulan|let filterTahun|const bulanList' | ForEach-Object { "  $($_.LineNumber): $($_.Line.Trim())" }
Write-Output ""
Write-Output "### baris 390-418 (akhir getJurnalAgenda?)"
for ($i = 390; $i -le 418; $i++) { "{0,4}: {1}" -f $i, $lines[$i-1] }
