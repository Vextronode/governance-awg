# Modul PAYMENT — Transaksi dan pembayaran

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/PAYMENT.yaml](../catalog/modules/PAYMENT.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Mencegah pemalsuan status bayar, manipulasi harga, pemrosesan ganda, dan stok terkunci, serta menjaga data kartu tidak pernah menyentuh server sistem.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): CIMART. Payment gateway CIMART **belum diputuskan mitra**; selama itu jalur transfer manual (MOD-PAYMENT-007) dan usulan SYS-CIMART-004 di `seeds/cimart.yaml` relevan.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-PAYMENT-001 | Tidak menyimpan data kartu | critical | non_waivable | G5 |
| MOD-PAYMENT-002 | Status pembayaran diverifikasi server-side | critical | non_waivable | G5 |
| MOD-PAYMENT-003 | Idempotensi webhook | high | non_waivable | G5 |
| MOD-PAYMENT-004 | Nominal dihitung di server | critical | non_waivable | G5 |
| MOD-PAYMENT-005 | State machine order dan kedaluwarsa | high | non_waivable | G5 |
| MOD-PAYMENT-006 | Rekonsiliasi | medium | waivable | G7 |
| MOD-PAYMENT-007 | Pembayaran manual (bila dipakai) | high | non_waivable | G5 |
| MOD-PAYMENT-008 | Pemisahan kunci sandbox dan production | high | non_waivable | G7 |
<!-- /generated -->

## Panduan penerapan

- **Data kartu (001):** gunakan halaman hosted atau tokenisasi penyedia jasa pembayaran berizin Bank Indonesia. Ini mengganti "handling setara PCI" di v1 yang tidak realistis.
- **Status lunas (002, 003):** tetapkan dari webhook yang tanda tangannya diverifikasi; simpan referensi transaksi unik agar notifikasi ganda diabaikan.
- **Nominal (004):** hitung total dari harga di DB, abaikan harga yang dikirim klien.
- **Order (005):** definisikan state order dan job kedaluwarsa yang melepas reservasi stok.
- **Kunci (008):** nama variabel env yang sama per environment, nilainya kunci sandbox di non-production.

## Kesalahan umum

- Menandai order lunas dari parameter redirect `?status=success`.
- Menerima `total` dari body request checkout.
- Memakai kunci production di staging "agar mirip production".
