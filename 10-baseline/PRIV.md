# PRIV — Privasi & UU PDP

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memenuhi kewajiban UU No. 27 Tahun 2022 (UU PDP) yang relevan bagi sistem desa: klasifikasi dan minimisasi data, transparansi, hak subjek data, retensi, serta kesiapan notifikasi kegagalan pelindungan data (Pasal 46).

## Konteks program

- Pengendali Data untuk data riil adalah mitra (Pemerintah Desa / pengelola koperasi); tim berkedudukan sebagai pihak yang memproses atas nama mitra ([framework 00](../00-framework/00-scope-and-principles.md) §4).
- Klasifikasi Tier 1–4 dipertahankan dari v1 AWG-SEC-001 §2.
- v1 hanya mengatur retensi log dan menganggap alur notifikasi cukup "tanpa penundaan yang tidak wajar". v2 menetapkan timeline 3×24 jam dari T0 ([framework 05](../00-framework/05-incident-response.md) §4) dan mewajibkan kesiapan sebelum insiden (BASE-PRIV-009).
- Staging berada di hosting kampus, sehingga data pribadi asli tidak ditempatkan di sana (BASE-PRIV-004).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-PRIV-001 | Inventaris dan klasifikasi data | high | non_waivable | G3 |
| BASE-PRIV-002 | Minimisasi data | medium | waivable | G3 |
| BASE-PRIV-003 | Data Tier 1/3 tidak bocor ke kanal sekunder | critical | non_waivable | G5 |
| BASE-PRIV-004 | Tidak ada data pribadi asli di dev/staging | critical | non_waivable | G6 |
| BASE-PRIV-005 | Pemberitahuan privasi | high | waivable | G6 |
| BASE-PRIV-006 | Prosedur hak subjek data | medium | waivable | G7 |
| BASE-PRIV-007 | Retensi data pribadi | medium | waivable | G7 |
| BASE-PRIV-008 | Kedudukan Pengendali dan pemroses ditetapkan tertulis | high | non_waivable | G6 |
| BASE-PRIV-009 | Kesiapan notifikasi kegagalan pelindungan data | high | non_waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Inventaris (PRIV-001):** tambahkan kolom tier dan tujuan pemrosesan ke Data Dictionary (artefak G2). Kontrol lain (PRIV-002, PRIV-003, MOD-PUBLIC-API-003) merujuk ke inventaris ini.
- **Kanal sekunder (PRIV-003):** periksa log aplikasi/error, URL, `localStorage`/`sessionStorage`, Cache Storage service worker, error tracker pihak ketiga, file statis publik, dan bundle frontend. Logger dikonfigurasi dengan redaksi field sensitif.
- **Data uji (PRIV-004):** gunakan seeder/factory dengan data sintetis. Bila data asli dipakai untuk UAT, simpan dokumen persetujuan mitra dan catat tanggal penghapusannya.
- **Kesiapan insiden (PRIV-008, PRIV-009):** kontak resmi Pengendali dicatat di `profile.yaml` (`contacts.data_controller_contact`) dan runbook; simulasi tabletop dicatat dengan [templates/reports/tabletop-report.md](../templates/reports/tabletop-report.md).

## Kesalahan umum

- Mencatat NIK lengkap di log error saat validasi gagal.
- Menyimpan token atau profil pengguna (berisi nomor HP/alamat) di `localStorage`.
- Mengimpor data warga asli ke staging "sementara" untuk demo.
- Menunggu insiden terjadi untuk mencari tahu siapa kontak resmi di sisi mitra.
