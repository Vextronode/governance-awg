# DATA — Backup & Pemulihan

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memastikan data setiap sistem bisa dipulihkan setelah kerusakan server, korupsi data, atau kesalahan operator, dalam waktu yang terukur.

## Konteks program

Di v1, backup hanya diatur untuk SID (BAK-001). v2 memberlakukannya untuk semua sistem karena transaksi CibendaMart dan data SIGAP juga bernilai. Backup yang memuat data Tier 1 tetap berstatus Tier 1 (prinsip v1 AWG-SEC-001 §9), sehingga perlu enkripsi dan kunci yang disimpan terpisah. Perilaku buffer offline perangkat edge (BAK-002 v1) dipindah ke modul IOT-INGEST (MOD-IOT-INGEST-006).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-DATA-001 | Backup otomatis harian | critical | non_waivable | G6 |
| BASE-DATA-002 | Backup offsite dan terenkripsi | critical | non_waivable | G7 |
| BASE-DATA-003 | Retensi backup | medium | waivable | G7 |
| BASE-DATA-004 | Uji restore dan target RTO | high | non_waivable | G7 |
| BASE-DATA-005 | Alert kegagalan backup | high | waivable | G7 |
<!-- /generated -->

## Panduan penerapan

- **Jadwal (DATA-001):** cakup database dan file unggahan. Contoh perintah: `pg_dump -Fc` ([40-guides/postgresql.md](../40-guides/postgresql.md)) atau `mysqldump --single-transaction` ([40-guides/mysql.md](../40-guides/mysql.md)).
- **Offsite dan enkripsi (DATA-002):** salinan disimpan di lokasi atau penyedia berbeda dari host production; kunci enkripsi tidak disimpan bersama backup.
- **Retensi (DATA-003):** skema 7 harian, 4 mingguan, 3 bulanan; konsistenkan dengan retensi data pribadi (BASE-PRIV-007).
- **Uji restore (DATA-004):** restore penuh dari salinan offsite ke environment terpisah, catat durasi terhadap target RTO ≤ 8 jam dengan [templates/reports/restore-test-report.md](../templates/reports/restore-test-report.md). Prosedurnya masuk runbook.
- **Alert (DATA-005):** simulasikan backup gagal untuk membuktikan alert sampai ke jalur teknis (BASE-OBS-007).

## Kesalahan umum

- Backup disimpan di disk yang sama dengan database.
- Backup berjalan tetapi gagal diam-diam selama berminggu-minggu.
- Hanya database yang di-backup; file unggahan (lampiran surat, bukti transfer) terlupakan.
- Restore tidak pernah diuji sehingga format atau versi backup ternyata tidak kompatibel.
