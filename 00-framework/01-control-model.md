# Model Kontrol

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/01-control-model.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian C |

---

## 1. Tiga lapis

| Lapis | Lokasi | Prefix ID | Berlaku |
|---|---|---|---|
| L1 Baseline | `governance-awg/catalog/baseline.yaml` | `BASE-<DOMAIN>-<NNN>` | Semua sistem, tanpa kecuali |
| L2 Modul kapabilitas | `governance-awg/catalog/modules/<MODULE>.yaml` | `MOD-<MODULE>-<NNN>` | Sistem yang mendeklarasikan modul tersebut di profilnya |
| L3 Kontrol sistem | `<repo-sistem>/docs/awg/controls-local.yaml` | `SYS-<SYSTEM>-<NNN>` | Satu sistem |

Domain baseline: `GOV` (tata kelola), `SEC` (keamanan), `PRIV` (privasi/UU PDP), `QA` (kualitas & pengujian), `OBS` (observability), `PERF` (performa), `REL` (rilis & deployment), `DATA` (backup & pemulihan), `MAINT` (keberlanjutan & handoff).

Modul: `PII`, `APPROVAL-WORKFLOW`, `PAYMENT`, `FILE-UPLOAD`, `BULK-IMPORT`, `IOT-INGEST`, `PUBLIC-API`, `API-CONSUMER`, `CMS`, `NOTIFY`, `PWA`.

Narasi per domain ada di [10-baseline/](../10-baseline/) dan per modul di [20-modules/](../20-modules/). Definisi kontrol yang mengikat hanya ada di [catalog/](../catalog/).

## 2. Field kontrol (katalog)

| Field | Wajib | Nilai |
|---|---|---|
| `id` | ya | Pola sesuai lapis. Unik global. Tidak boleh dipakai ulang walau kontrol dihapus (gunakan `deprecated: true`). |
| `domain` | ya (BASE) | Salah satu domain di atas |
| `module` | ya (MOD) | Salah satu modul di atas |
| `title` | ya | ≤ 80 karakter |
| `statement` | ya | Memuat WAJIB / SEBAIKNYA / BOLEH |
| `rationale` | ya | Alasan singkat |
| `severity` | ya | `critical` \| `high` \| `medium` \| `low` — dampak bila kontrol **tidak ada**, bukan usaha implementasi |
| `class` | ya | `non_waivable` \| `waivable` |
| `gate` | ya | `G3`–`G7` — gate paling awal di mana kontrol harus `verified` (atau `waived` bila waivable) |
| `verification` | ya | Cara konkret verifikator memeriksa |
| `evidence` | ya | Daftar dari: `code`, `config`, `test`, `ci_run`, `document`, `screenshot`, `report` |
| `refs` | tidak | Rujukan eksternal (nama bab ASVS, pasal UU PDP) |
| `supersedes` | tidak | ID kontrol v1 yang digantikan |
| `deprecated` | tidak | `true` bila tidak berlaku lagi |

Schema: [catalog/schema/catalog.schema.json](../catalog/schema/catalog.schema.json).

## 3. Aturan kelas

- `non_waivable` sejalan dengan prinsip Program Gates "kriteria minimum mandatory dan tidak dapat dikurangi". Kontrol kelas ini **tidak bisa** di-waive, dan gate terkait terblokir sampai kontrol `verified`.
- `waivable`: boleh dikecualikan sementara melalui waiver (lihat [02-tailoring-and-waiver.md](02-tailoring-and-waiver.md)).
- Aturan penetapan kelas: kontrol `critical` selalu `non_waivable`, kecuali katalog menyatakan lain secara eksplisit. (Katalog v2.0.0 tidak memuat pengecualian.)

## 4. Status per kontrol (di `docs/awg/status.yaml` repo sistem)

| Status | Arti | Syarat |
|---|---|---|
| `not_started` | Belum dikerjakan | — |
| `in_progress` | Sedang dikerjakan | `owner` terisi |
| `implemented` | Tim mengklaim selesai | `evidence` ≥ 1 item dengan `ref` konkret (path, URL commit/PR/CI run) |
| `verified` | Dikonfirmasi verifikator | Status sebelumnya `implemented` dan blok `verification` lengkap (lihat [03-verification-and-gates.md](03-verification-and-gates.md) §2) |
| `rejected` | Verifikator menolak klaim | `verification.result: rejected` dan `verification.note` terisi; tim kembali bekerja |
| `waived` | Dikecualikan sementara | Kontrol `waivable`, `waiver` merujuk ke waiver aktif yang belum kedaluwarsa |
| `not_applicable` | Tidak relevan | **Hanya** untuk kontrol MOD/SYS, dengan `reason` dan blok `verification` (verifikator setuju). BASE **tidak boleh** `not_applicable`; gunakan waiver. |

Schema: [catalog/schema/status.schema.json](../catalog/schema/status.schema.json).

## 5. Severity (dampak bila kontrol tidak ada)

- `critical`: kebocoran data Tier 1/3 skala luas, pengambilalihan akun berhak tinggi, kehilangan data permanen, atau sistem tidak bisa dipulihkan.
- `high`: eksposur terbatas, eskalasi hak terbatas, gangguan layanan inti berjam-jam, atau insiden yang tidak terdeteksi.
- `medium`: penurunan kualitas atau keandalan yang bisa diatasi, atau risiko yang butuh kondisi tambahan.
- `low`: kerapian, kenyamanan, atau dampak minor.
