# Modul BULK-IMPORT — Import/ekspor massal Excel/CSV

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/BULK-IMPORT.yaml](../catalog/modules/BULK-IMPORT.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Menjaga integritas data dari import massal (ancaman integritas data di [framework 00](../00-framework/00-scope-and-principles.md) §2 butir 5, yang tidak punya kontrol di v1) dan mencegah formula injection saat ekspor.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-BULK-IMPORT-001 | Validasi per baris dengan laporan | high | non_waivable | G5 |
| MOD-BULK-IMPORT-002 | Atomik dan deteksi duplikat | high | non_waivable | G5 |
| MOD-BULK-IMPORT-003 | Cegah formula injection pada ekspor | medium | non_waivable | G5 |
| MOD-BULK-IMPORT-004 | Batas ukuran dan pemrosesan | medium | waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **Validasi baris (001):** pakai aturan validasi yang sama dengan formulir input manual; hasilkan laporan baris ditolak beserta alasannya.
- **Atomik (002):** bungkus import dalam satu transaksi, atau nyatakan eksplisit sebagai parsial dengan laporan; deteksi duplikat berdasarkan kunci alami seperti NIK.
- **Formula injection (003):** prefiks tanda kutip tunggal untuk sel yang diawali `=`, `+`, `-`, `@`.
- **Batas (004):** batasi ukuran file dan jumlah baris; import besar diproses di queue.

## Kesalahan umum

- Import berhenti di baris ke-500 karena error, meninggalkan 499 baris tersimpan tanpa laporan.
- Ekspor nama warga yang diawali `=` langsung dieksekusi Excel di komputer petugas.
