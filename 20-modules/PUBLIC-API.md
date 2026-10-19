# Modul PUBLIC-API — API yang dikonsumsi sistem lain

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/PUBLIC-API.yaml](../catalog/modules/PUBLIC-API.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Menyediakan data ke sistem lain (terutama Village Dashboard) lewat kontrak yang terdokumentasi, terautentikasi per konsumen, hanya-baca, dan hanya memuat data yang disepakati.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID, CIMART, SIGAP. Modul ini adalah sisi penyedia dari BASE-SEC-019 (integrasi hanya lewat API terdokumentasi); sisi konsumennya adalah modul API-CONSUMER.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-PUBLIC-API-001 | Kontrak API terdokumentasi dan berversi | high | non_waivable | G3 |
| MOD-PUBLIC-API-002 | Autentikasi per konsumen, hanya-baca | critical | non_waivable | G5 |
| MOD-PUBLIC-API-003 | Hanya data yang disepakati | critical | non_waivable | G5 |
| MOD-PUBLIC-API-004 | Rate limit API | medium | waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **Kontrak (001):** file OpenAPI di repo, versi di path (`/api/v1`). Selaras dengan artefak API Specification di G3.
- **Kredensial (002):** satu kredensial per konsumen, ber-scope hanya-baca, bisa dicabut. Menggantikan NET-004 v1 bersama BASE-SEC-019.
- **Data (003):** kirim data agregat; data Tier 1 hanya bila kontrak menyetujuinya secara eksplisit dengan dasar inventaris data (BASE-PRIV-001).
- **Rate limit (004):** per konsumen, agar konsumen yang salah konfigurasi tidak membebani sistem sumber.

## Kesalahan umum

- Endpoint untuk dashboard mengembalikan seluruh kolom model, termasuk NIK.
- Konsumen memakai akun admin aplikasi sebagai kredensial API.
