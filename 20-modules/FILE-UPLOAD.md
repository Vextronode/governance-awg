# Modul FILE-UPLOAD — Unggah file oleh pengguna

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/FILE-UPLOAD.yaml](../catalog/modules/FILE-UPLOAD.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Mencegah unggahan berbahaya (web shell, XSS lewat SVG), path traversal, kebocoran lokasi lewat metadata foto, eksposur file privat, dan disk penuh.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID, CIMART.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-FILE-UPLOAD-001 | Validasi tipe dan ukuran file | critical | non_waivable | G5 |
| MOD-FILE-UPLOAD-002 | Penyimpanan aman | critical | non_waivable | G5 |
| MOD-FILE-UPLOAD-003 | Re-encode gambar | medium | waivable | G5 |
| MOD-FILE-UPLOAD-004 | File privat lewat endpoint berotorisasi | critical | non_waivable | G5 |
| MOD-FILE-UPLOAD-005 | Kuota unggah | medium | waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Validasi (001):** kombinasikan allowlist ekstensi dengan deteksi MIME dari konten; tolak SVG/HTML kecuali disanitasi.
- **Penyimpanan (002):** simpan di luar document root atau di disk yang tidak mengeksekusi skrip; nama file dibangkitkan server (mis. UUID).
- **Re-encode (003):** re-encode dan resize gambar di server; langkah ini juga menghapus EXIF/GPS dan membantu anggaran performa (BASE-PERF-006).
- **File privat (004):** lampiran surat dan bukti transfer disajikan lewat endpoint yang memeriksa otorisasi, atau signed URL berumur pendek.
- **Kuota (005):** masukkan pemakaian storage unggahan ke alert disk (BASE-OBS-006).

## Kesalahan umum

- Hanya memeriksa ekstensi dari nama file.
- Menyimpan bukti transfer di folder `public/` dengan URL permanen.
