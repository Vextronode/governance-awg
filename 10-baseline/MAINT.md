# MAINT — Keberlanjutan & Handoff

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Menjaga sistem tetap aman dan bisa dioperasikan setelah tim capstone lulus (prinsip *self-sustaining by design*), dan mencegah "pembusukan pasca-handoff": dependency tidak di-patch, domain/sertifikat kedaluwarsa, dan akun yang dipegang pribadi mahasiswa.

## Konteks program

Domain ini menyatukan kebutuhan artefak G7 Program Gates dan materi v1 AWG-SEC-006 (kini [framework 06](../00-framework/06-handoff-and-support.md)). Kebutuhan engineering pra-handoff yang di v1 hanya berupa rekomendasi backlog (mode maintenance, reset password admin, kontak di aplikasi) kini menjadi BASE-MAINT-004 beserta syarat keamanannya.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-MAINT-001 | Versi runtime dan framework masih didukung | high | waivable | G7 |
| BASE-MAINT-002 | Aset dan akun milik mitra | critical | non_waivable | G7 |
| BASE-MAINT-003 | Kalender perpanjangan | high | non_waivable | G7 |
| BASE-MAINT-004 | Fitur containment untuk operator awam | medium | waivable | G7 |
| BASE-MAINT-005 | Paket handover lengkap | high | non_waivable | G7 |
| BASE-MAINT-006 | Serah terima kredensial | critical | non_waivable | G7 |
| BASE-MAINT-007 | Support window dideklarasikan | medium | non_waivable | G7 |
| BASE-MAINT-008 | Panduan patching untuk penerus | medium | waivable | G7 |
<!-- /generated -->

## Panduan penerapan

- **Versi didukung (MAINT-001):** catat tanggal EOL runtime, framework, dan DB dari endoflife.date di handover.
- **Aset (MAINT-002, MAINT-003):** buat inventaris aset (layanan, pemilik akun, tanggal kedaluwarsa, tanpa password) sejak awal, bukan di minggu terakhir. Daftarkan domain, hosting, repository, dan akun layanan pihak ketiga atas nama organisasi mitra.
- **Fitur containment (MAINT-004):** mode maintenance lewat UI admin (dengan autentikasi dan log audit), pemulihan akses admin tanpa akses DB langsung, serta kontak dukungan dan tanggal akhir support window di halaman admin. Contoh implementasi Laravel ada di [40-guides/laravel.md](../40-guides/laravel.md).
- **Paket handover (MAINT-005):** template [templates/reports/handover-checklist.md](../templates/reports/handover-checklist.md); waiver aktif dicantumkan sebagai keterbatasan yang diketahui.
- **Kredensial (MAINT-006):** rotasi semua kredensial production saat handoff dan serahkan lewat kanal aman; cabut akses anggota tim paling lambat di akhir support window.
- **Support window (MAINT-007):** 3 bulan tanpa dev penerus atau 1 bulan knowledge transfer bila ada dev penerus ([framework 06](../00-framework/06-handoff-and-support.md) §3).
- **Patching (MAINT-008):** langkah aman pembaruan dependency di book guide Development Selanjutnya: cek audit, update, jalankan test, deploy staging, deploy production.

## Kesalahan umum

- Domain didaftarkan dengan email pribadi ketua tim.
- Akun monitoring atau notifikasi berjalan di free tier akun pribadi anggota tim.
- MFA diaktifkan tanpa menyerahkan recovery code ke mitra, sehingga mitra terkunci setelah handoff.
- Kredensial production diserahkan lewat grup chat.
