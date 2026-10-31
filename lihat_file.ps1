Get-Content 'C:\Users\ASUS\Downloads\jurnal pkl\epkl4-siswa-main\composables\useSiswaDipantau.js'
Write-Output '=====TEACHER_USERS====='
$pb = 'http://127.0.0.1:8090'
$b = @{ identity = 'tempadmin2@epkl.local'; password = 'Pass1234!' } | ConvertTo-Json
$t = (Invoke-RestMethod -Uri "$pb/api/collections/_superusers/auth-with-password" -Method Post -Body $b -ContentType 'application/json').token
$h = @{ Authorization = $t }
$ls = Invoke-RestMethod -Uri "$pb/api/collections/teacher_users/records?perPage=50" -Headers $h
$ls.items | ForEach-Object { "{0} {1} role={2} nama={3} iduka={4}" -f $_.id, $_.username, $_.role, $_.nama, $_.iduka }
