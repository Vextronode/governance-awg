# OBS — Observability

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memastikan setiap sistem dapat (1) mendeteksi kegagalan sebelum berdampak luas ke warga, wisatawan, dan perangkat desa, (2) menyediakan jejak yang cukup untuk investigasi tanpa bergantung pada developer asli, dan (3) tetap terpantau setelah handoff tanpa keahlian teknis mendalam.

## Konteks program

Materi berasal dari v1 AWG-OBS-001 §3–§6. Prinsip v1 yang dipertahankan:

- **Proporsional:** instrumentasi tanpa konsumen yang jelas (tidak ada yang membaca, tidak ada yang bertindak) adalah over-engineering.
- **Push, bukan pull:** alert dikirim aktif; tidak ada asumsi seseorang membuka dashboard secara rutin setelah handoff.
- **Otomatis:** rotasi dan retensi log berjalan sendiri.
- Distributed tracing formal tidak diadopsi; correlation ID menjadi pengganti yang proporsional untuk arsitektur independent-domain.

Perubahan v2: field `env` ditambahkan ke skema log; `service` kini `sid|sigap|cimart|vdash`; ada sinyal "situs mati" lewat health endpoint dan uptime monitoring eksternal (BASE-OBS-004, BASE-OBS-005); alert dirutekan dua jalur agar operator non-teknis tidak menerima alert teknis (BASE-OBS-007, menjawab kritik v1 §6.2).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-OBS-001 | Log terstruktur dengan skema bersama | high | non_waivable | G5 |
| BASE-OBS-002 | Disiplin level log dan cakupan event | medium | waivable | G5 |
| BASE-OBS-003 | Correlation ID | medium | waivable | G5 |
| BASE-OBS-004 | Endpoint health dan readiness | high | non_waivable | G7 |
| BASE-OBS-005 | Uptime monitoring eksternal | high | non_waivable | G7 |
| BASE-OBS-006 | Alert error dan resource | medium | waivable | G7 |
| BASE-OBS-007 | Routing alert dua jalur | high | non_waivable | G7 |
| BASE-OBS-008 | Rotasi dan retensi log otomatis | high | non_waivable | G7 |
| BASE-OBS-009 | Runbook sistem | high | non_waivable | G7 |
| BASE-OBS-010 | Metrik bisnis minimum | low | waivable | G7 |
<!-- /generated -->

## Panduan penerapan

### Skema log (OBS-001)

| Field | Tipe | Keterangan |
|---|---|---|
| `timestamp` | ISO 8601 | Waktu kejadian dengan offset zona waktu |
| `level` | string | `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `event` | string | `snake_case`, mis. `letter_approval_created`, `notification_send_failed` |
| `correlation_id` | string | UUID v4 (OBS-003) |
| `service` | string | `sid`, `sigap`, `cimart`, `vdash` |
| `env` | string | Environment asal log |
| `actor` | string/null | User ID, device ID, atau `system` |
| `context` | object | Data tambahan, mis. `letter_id`, `rt_id`, `status_from`, `status_to` (ID referensi, bukan data Tier 1/3) |

### Konvensi level (OBS-002, dari v1 §3.3)

| Level | Kriteria |
|---|---|
| `DEBUG` | Hanya untuk development/staging; tidak aktif di production |
| `INFO` | Peristiwa bisnis normal yang berhasil (surat diajukan, approval disetujui, transaksi berhasil) |
| `WARN` | Kondisi tidak normal yang belum menyebabkan kegagalan (deadline approval terlewati, retry) |
| `ERROR` | Kegagalan yang memerlukan perhatian (notifikasi gagal, insert DB gagal, koneksi perangkat edge gagal) |

### Contoh titik instrumentasi critical path (dari v1 §3.4, disesuaikan)

- **SID:** setiap transisi status approval, pemicu notifikasi (berhasil/gagal), kegagalan generate `letter_number`.
- **CIMART:** status transaksi (berhasil/gagal/pending), perubahan stok saat checkout.
- **SIGAP:** kegagalan penyimpanan data ke PostgreSQL; status koneksi perangkat edge bila keberadaannya terkonfirmasi saat adopsi.
- **VDASH:** ditentukan saat adopsi.

Pemetaan critical path → nama event dicatat di `profile.yaml` (`critical_paths[].log_events`).

### Correlation ID (OBS-003, dari v1 §4)

Dibangkitkan di titik masuk request (middleware) bila header `X-Correlation-ID` belum ada, dikembalikan di header respons, disertakan di setiap entri log, dan diteruskan pada panggilan antar sistem (mis. VDASH → API sistem sumber).

### Metrik (dari v1 §5)

Kategori yang berguna: request/error rate per endpoint, latency p50/p95/p99 (lebih representatif daripada rata-rata), resource (CPU/RAM/disk), dan metrik bisnis (OBS-010; nilai ditetapkan di profil `observability.business_metrics`).

### Alert dan runbook (OBS-005..009)

- Ambang lonjakan ERROR ditetapkan di profil (`observability.error_alert_threshold`).
- Pesan ke operator berbahasa awam, contoh dari v1 §6.4: "Sistem SID tidak dapat memproses surat baru sejak pukul [waktu], mohon segera hubungi [kontak]" — bukan stack trace atau kode error mentah.
- Runbook memakai template [templates/system/runbook.md](../templates/system/runbook.md).

## Kesalahan umum

- Semua event dicatat sebagai `INFO`, sehingga alert berbasis level tidak berguna.
- Alert error-rate dianggap cukup; bila server mati total, tidak ada error yang tercatat dan tidak ada alert yang menyala.
- Mengirim stack trace ke grup WhatsApp operator desa.
- Log tidak pernah dirotasi sampai disk hosting penuh.
