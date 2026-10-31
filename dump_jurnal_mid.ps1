$f1 = 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\pages\jurnal\index.vue'
$lines = Get-Content $f1
for ($i = 418; $i -le 630; $i++) { "{0,4}: {1}" -f $i, $lines[$i-1] }
