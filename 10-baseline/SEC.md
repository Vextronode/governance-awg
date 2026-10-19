# SEC — Keamanan

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Melindungi sistem dari populasi ancaman yang realistis untuk aplikasi web berskala desa ([framework 00](../00-framework/00-scope-and-principles.md) §2): penyerang oportunistik, penyalahgunaan orang dalam, privilege escalation/IDOR, dan pembusukan pasca-handoff.

## Konteks program

Materi domain ini berasal dari v1 AWG-SEC-001 §4–§9 (authentication & authorization, segmentasi jaringan, secrets, transport, logging, backup), dengan beberapa perubahan:

- Fakta stack diperbarui: SIGAP memakai Express (tidak lagi memakai layanan auth pihak ketiga v1), CIMART memakai Laravel. Mekanisme auth tiap stack dirujuk lewat BASE-SEC-001.
- Butir v1 yang dulu hanya anjuran (rate limit login, audit dependency) kini menjadi kontrol dengan angka yang bisa diverifikasi (BASE-SEC-004, BASE-SEC-013).
- Pentest formal diganti uji keamanan ringan sebelum UAT (BASE-SEC-022).
- Prinsip arsitektur "independent domain" dipertahankan: database terpisah per sistem dan integrasi hanya lewat API terdokumentasi (BASE-SEC-018, BASE-SEC-019).

Rujukan teknis: OWASP ASVS (Authentication, Access Control, Validation) dan OWASP Top 10.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-SEC-001 | Autentikasi memakai mekanisme framework/library teruji | critical | non_waivable | G5 |
| BASE-SEC-002 | Password di-hash dengan algoritma adaptif | critical | non_waivable | G5 |
| BASE-SEC-003 | Masa berlaku sesi/token dan logout server-side | high | waivable | G5 |
| BASE-SEC-004 | Proteksi brute-force pada endpoint autentikasi | high | non_waivable | G5 |
| BASE-SEC-005 | Otorisasi server-side, deny-by-default, cek kepemilikan objek | critical | non_waivable | G5 |
| BASE-SEC-006 | Validasi input server-side dan query terparameterisasi | critical | non_waivable | G5 |
| BASE-SEC-007 | Pencegahan XSS | high | non_waivable | G5 |
| BASE-SEC-008 | CSRF dan CORS | high | non_waivable | G5 |
| BASE-SEC-009 | Security headers | medium | waivable | G6 |
| BASE-SEC-010 | Tidak ada secret di Git, termasuk history | critical | non_waivable | G5 |
| BASE-SEC-011 | Rotasi segera atas secret yang terekspos | high | non_waivable | G5 |
| BASE-SEC-012 | Pengelolaan secret per environment dan saat pergantian anggota | high | waivable | G7 |
| BASE-SEC-013 | Audit kerentanan dependency di CI | critical | non_waivable | G5 |
| BASE-SEC-014 | Lockfile di-commit | medium | waivable | G5 |
| BASE-SEC-015 | Hardening konfigurasi production | critical | non_waivable | G7 |
| BASE-SEC-016 | HTTPS di semua environment publik | critical | non_waivable | G7 |
| BASE-SEC-017 | Antarmuka administratif tidak terekspos publik | critical | non_waivable | G7 |
| BASE-SEC-018 | Isolasi database dan least privilege | critical | non_waivable | G7 |
| BASE-SEC-019 | Integrasi antar sistem hanya lewat API terdokumentasi | critical | non_waivable | G3 |
| BASE-SEC-020 | Log peristiwa keamanan | high | non_waivable | G5 |
| BASE-SEC-021 | MFA untuk akun administrator sistem dan infrastruktur | high | waivable | G7 |
| BASE-SEC-022 | Uji keamanan ringan sebelum UAT | high | non_waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Autentikasi dan sesi (SEC-001..004):** pakai fitur bawaan framework. Contoh konfigurasi per stack ada di [40-guides/laravel.md](../40-guides/laravel.md) dan [40-guides/express.md](../40-guides/express.md). Nilai idle timeout dicatat di `profile.yaml` (`security.idle_timeout_minutes`).
- **Otorisasi (SEC-005):** susun matriks peran × endpoint sensitif sejak awal; matriks yang sama dipakai untuk test negatif otomatis dan uji manual SEC-022.
- **Validasi dan injection (SEC-006, SEC-007):** grep pemakaian raw query dan rendering HTML mentah, lalu dokumentasikan alasan setiap temuan yang dipertahankan.
- **Secrets (SEC-010..012):** jalankan secret scanner atas seluruh history saat adopsi. Temuan apa pun dirotasi dan dicatat tanpa nilai secret.
- **Dependency (SEC-013, SEC-014):** audit dependency dan install berbasis lockfile dijalankan di CI yang sama dengan test (BASE-QA-003).
- **Production (SEC-015..018):** periksa konfigurasi production dari luar: respons error generik, redirect HTTPS, port admin tertutup, user DB non-superuser.
- **Log keamanan (SEC-020):** catat ID referensi objek, bukan payload data Tier 1/3 (lihat BASE-PRIV-003).

## Kesalahan umum

- Menyembunyikan tombol di UI dan menganggapnya kontrol akses.
- Memeriksa peran tetapi tidak memeriksa kepemilikan objek (IDOR), mis. warga bisa membuka surat warga lain dengan mengganti ID di URL.
- Menghapus file `.env` dari repo tanpa merotasi secret yang pernah ter-commit.
- CORS `*` bersama credentials untuk "mempercepat" pengembangan, lalu terbawa ke production.
- Membiarkan `APP_DEBUG=true` atau `NODE_ENV=development` di production.
