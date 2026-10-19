# Modul PII — Data pribadi Tier 1

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/PII.yaml](../catalog/modules/PII.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Membatasi eksposur data pribadi Tier 1 (NIK, KK, nama + alamat, nomor HP, alamat pengiriman) terhadap penyalahgunaan orang dalam, kebocoran lewat layar/ekspor, dan dump database.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID, CIMART.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-PII-001 | Log akses baca data pribadi oleh petugas | high | waivable | G5 |
| MOD-PII-002 | Masking identitas di tampilan daftar | medium | waivable | G5 |
| MOD-PII-003 | Ekspor data pribadi terkontrol | high | non_waivable | G5 |
| MOD-PII-004 | Enkripsi at-rest kolom identitas | medium | waivable | G6 |
| MOD-PII-005 | Penonaktifan dan penghapusan akun | medium | waivable | G7 |
<!-- /generated -->

## Panduan penerapan

- **Log akses baca (PII-001):** catat siapa membuka halaman detail data pribadi milik orang lain, dengan ID referensi subjek (bukan NIK).
- **Masking (PII-002):** tampilkan `3201********0001` di tabel; nilai penuh hanya di halaman detail untuk peran berwenang.
- **Ekspor (PII-003):** simpan file hasil ekspor di storage privat dan catat setiap ekspor di log audit.
- **Enkripsi kolom (PII-004):** di Laravel, cast `encrypted` ([40-guides/laravel.md](../40-guides/laravel.md)); bila kolom perlu dicari, gunakan blind index. Keputusan tidak mengenkripsi dicatat sebagai ADR.
- **Penghapusan akun (PII-005):** putuskan bersama mitra apa yang terjadi pada data pribadi saat akun dinonaktifkan, terutama bila berbenturan dengan kewajiban arsip administrasi desa.

## Kesalahan umum

- Endpoint ekspor menulis file ke folder publik dengan nama yang bisa ditebak.
- Masking dilakukan di frontend saja, sementara API tetap mengirim nilai penuh.
