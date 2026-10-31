# README.md - PocketBase jurnal pkl

## Deskripsi Proyek
Aplikasi **PocketBase** ini berada di `c:/Users/ASUS/Downloads/jurnal pkl/epkl4-pb-main`.  
Tujuannya adalah menyediakan backend ringan dengan SQLite, autentikasi, dan realtime.

## Cara Menjalankan Secara Lokal
```bash
cd "c:/Users/ASUS/Downloads/jurnal pkl/epkl4-pb-main"
./be serve --http=0.0.0.0:8090
```
Akses dashboard di `http://localhost:8090/_/`.

## Backup Otomatis
Skrip backup berada di `scripts/backup.sh`.  
Script ini akan membuat zip timestamp dari folder `pb_data/` dan menyimpan maksimal 7 backup terbaru.

### Menjadwalkan Backup (Cron)
Jika Anda menggunakan **Windows Task Scheduler** atau **Linux cron**, jalankan skrip setiap hari pukul 02:00.
Contoh entry cron (Linux):
```
0 2 * * * /usr/bin/bash "c:/Users/ASUS/Downloads/jurnal pkl/epkl4-pb-main/scripts/backup.sh"
```

## Konfigurasi Apache (Proxy & SSL)
Berikut contoh konfigurasi VirtualHost Apache untuk mem‑proxy PocketBase yang berjalan pada port 8090.
```apacheconf
<VirtualHost *:80>
    ServerName contoh.domain.id
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8090/
    ProxyPassReverse / http://127.0.0.1:8090/
</VirtualHost>

# Jika menggunakan HTTPS
<VirtualHost *:443>
    ServerName contoh.domain.id
    SSLEngine on
    SSLCertificateFile "/path/to/cert.pem"
    SSLCertificateKeyFile "/path/to/key.pem"
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8090/
    ProxyPassReverse / http://127.0.0.1:8090/
</VirtualHost>
```
Pastikan modul `mod_proxy` dan `mod_ssl` di‑enable.

## Pengujian Keamanan
- Cookie `pb_auth` memiliki atribut **Secure** dan **SameSite=Strict** (lihat `config/security.json`).
- Pastikan server hanya menerima koneksi lewat Apache (trustedProxy).

## Skrip Pendukung
- `scripts/run.sh` – memulai PocketBase dan menampilkan log secara real‑time.
- `scripts/backup.sh` – backup otomatis.
