# Modul API-CONSUMER — Mengonsumsi API sistem lain

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/API-CONSUMER.yaml](../catalog/modules/API-CONSUMER.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Menjaga kredensial API sistem lain tetap di server, membuat konsumen tetap berguna saat sistem sumber terganggu, dan mencegah salinan data pribadi yang tidak terkendali.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): VDASH. Stack VDASH belum diketahui dan dideteksi saat adopsi.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-API-CONSUMER-001 | Kredensial tidak di bundle frontend | critical | non_waivable | G5 |
| MOD-API-CONSUMER-002 | Toleran terhadap gangguan sumber | medium | waivable | G5 |
| MOD-API-CONSUMER-003 | Tidak menyimpan ulang data Tier 1 | high | non_waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **Kredensial (001):** variabel env yang dibundel ke frontend (mis. `VITE_*`, `REACT_APP_*`) bersifat publik ([40-guides/react.md](../40-guides/react.md)). Panggilan berkredensial dilakukan lewat server/proxy.
- **Toleransi gangguan (002):** timeout, retry terbatas dengan backoff, dan tampilan data terakhir beserta penanda waktu.
- **Penyimpanan (003):** cache data agregat boleh, tetapi data Tier 1 dari sistem lain tidak disimpan permanen.

## Kesalahan umum

- API key sistem sumber ditaruh di `.env` frontend lalu ikut ter-bundle.
- Satu sistem sumber down membuat seluruh halaman dashboard kosong.
