# Modul IOT-INGEST — Ingestion data dari perangkat

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/IOT-INGEST.yaml](../catalog/modules/IOT-INGEST.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memperlakukan data perangkat fisik sebagai input tidak tepercaya: kredensial per perangkat, validasi ketat, integritas transport, anti-duplikasi saat sinyal putus-sambung, dan deteksi perangkat yang berhenti melapor.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed: SIGAP. **Keberadaan perangkat ESP8266/ESP32 di SIGAP belum dikonfirmasi** dan wajib dicek saat adopsi; modul ini hanya aktif bila perangkat terkonfirmasi.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-IOT-INGEST-001 | Kredensial per perangkat | high | non_waivable | G5 |
| MOD-IOT-INGEST-002 | Endpoint tulis-saja dengan validasi ketat | high | non_waivable | G5 |
| MOD-IOT-INGEST-003 | Integritas transport | high | waivable | G5 |
| MOD-IOT-INGEST-004 | Rate limit, ukuran payload, dan anti-duplikasi | medium | non_waivable | G5 |
| MOD-IOT-INGEST-005 | Alert perangkat tidak melapor | high | waivable | G7 |
| MOD-IOT-INGEST-006 | Perilaku buffer offline teruji | high | waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Kredensial (001):** tabel perangkat menyimpan kredensial per perangkat yang bisa dicabut satu per satu.
- **Validasi (002):** endpoint ingestion hanya menerima penulisan; tentukan rentang nilai fisik yang masuk akal per jenis sensor. Menggantikan TLS-002 v1.
- **Transport (003):** bila perangkat tidak andal memakai TLS, payload ditandatangani (mis. HMAC per perangkat dengan timestamp) dan keputusannya dicatat sebagai ADR.
- **Anti-duplikasi (004):** kunci unik `device_id + timestamp/sequence`; simpan waktu terima server di kolom terpisah.
- **Alert perangkat diam (005):** ambang ditetapkan di profil (default 24 jam, dari v1 AWG-OBS-001 §6.3).
- **Buffer offline (006):** dokumentasikan kapasitas buffer dan perilaku saat penuh; menggantikan BAK-002 v1.

## Kesalahan umum

- Satu API key yang sama di-flash ke semua perangkat.
- Endpoint ingestion juga bisa dipakai untuk membaca data.
- Nilai sensor mustahil (mis. suhu 900 °C) diterima diam-diam.
