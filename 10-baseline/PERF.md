# PERF — Performa

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Mencegah degradasi performa yang dirasakan langsung oleh warga, wisatawan, dan perangkat desa, dan memastikan sistem berjalan dalam batas kapasitas hosting desa.

## Konteks program

Materi berasal dari v1 AWG-OBS-002 §3–§5. Perubahan v2:

- v1 berada di luar Program Gates; v2 menempatkan kontrol PERF pada gate (lihat [catalog/GATE-MATRIX.md](../catalog/GATE-MATRIX.md)).
- Target "ditetapkan Tech Lead" dan beban "proporsional" di v1 diganti angka yang bisa diverifikasi (BASE-PERF-001, BASE-PERF-002). Profil boleh memperketat; pelonggaran hanya lewat waiver.
- Row-level locking stok CibendaMart (v1 §5.2) kini menjadi usulan kontrol SYS-CIMART-001 di `seeds/cimart.yaml`.
- Connection pooling (v1 §5.1, sebelumnya khusus SIGAP) digeneralisasi ke semua sistem (BASE-PERF-007).

Konteks akses (v1 §4.1): pengguna CibendaMart dan warga mengakses lewat data seluler di desa dan lokasi wisata, bukan jaringan stabil.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-PERF-001 | Target respons endpoint kritis | high | waivable | G6 |
| BASE-PERF-002 | Uji beban berbasis estimasi beban riil | high | waivable | G6 |
| BASE-PERF-003 | Pencegahan N+1 query | medium | waivable | G5 |
| BASE-PERF-004 | Indeks untuk kolom filter dan foreign key | medium | waivable | G5 |
| BASE-PERF-005 | Pagination dengan batas | high | non_waivable | G5 |
| BASE-PERF-006 | Anggaran performa frontend mobile | medium | waivable | G6 |
| BASE-PERF-007 | Connection pooling dan timeout | medium | waivable | G5 |
| BASE-PERF-008 | Baseline performa production | low | waivable | G7 |
<!-- /generated -->

## Panduan penerapan

- **N+1 (PERF-003, v1 §3.1):** query N+1 (memuat daftar lalu query relasi satu per satu dalam perulangan) adalah sumber degradasi paling umum, khususnya di Laravel. Gunakan eager loading (`with()`) atau join; aktifkan deteksi lazy loading di non-production.
- **Indeks (PERF-004, v1 §3.2):** contoh kolom kandidat dari v1: SID `rt_id`, `status`, `hamlet_id`, dan foreign key rantai approval; SIGAP kolom timestamp/identifier untuk query time-series; CIMART kolom filter produk/kategori dan foreign key transaksi. Konfirmasi dengan `EXPLAIN`. Di PostgreSQL, foreign key tidak otomatis diindeks.
- **Pagination (PERF-005, v1 §3.3):** daftar surat, daftar warga, dan daftar produk akan terus bertambah; batasi ukuran halaman di server.
- **Frontend (PERF-006, v1 §4.2):** kompres gambar produk yang diunggah penjual, lazy-load elemen di luar viewport awal, dan ukur dengan Lighthouse mode mobile.
- **Uji beban (PERF-002):** estimasi puncak pengguna konkuren dan dasarnya dicatat di `profile.yaml` (`performance`); hasil uji memakai [templates/reports/load-test-report.md](../templates/reports/load-test-report.md). Tool ringan seperti k6 sudah cukup.
- **Baseline (PERF-008, v1 §2.2):** tanpa baseline, keluhan "sistem lambat" tidak bisa diverifikasi secara objektif.

## Kesalahan umum

- Menguji performa di laptop pengembang dengan data kosong.
- Mengembalikan seluruh baris tabel karena "datanya masih sedikit".
- Mengunggah foto produk langsung dari kamera ponsel (beberapa MB) tanpa kompresi.
- Panggilan HTTP ke sistem lain tanpa timeout sehingga request menggantung.
