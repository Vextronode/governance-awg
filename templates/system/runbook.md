# Runbook — `<SISTEM>`

> Template runbook sistem (BASE-OBS-009). Isi setiap bagian dengan kondisi aktual; bagian yang belum diketahui ditandai `TODO(awg): ...`. Runbook diuji dengan dry-run: anggota tim lain menjalankan satu prosedur tanpa bantuan penulis.

| Field | Nilai |
|---|---|
| Sistem | `<ID>` — `<nama>` |
| Versi aplikasi | `<tag>` |
| Terakhir diperbarui | `<YYYY-MM-DD>` |
| Penanggung jawab | `<peran>` |

## 1. Lokasi log

| Log | Lokasi (path / dashboard) | Format | Retensi (BASE-OBS-008) |
|---|---|---|---|
| Aplikasi | | JSON (BASE-OBS-001) | |
| Keamanan (BASE-SEC-020) | | | |
| Web server | | | |
| Database | | | |

Cara menelusuri satu request: cari nilai `correlation_id` (header `X-Correlation-ID`, BASE-OBS-003).

## 2. Cara cek health

| Endpoint | URL production | Respons normal |
|---|---|---|
| `/health` | | |
| `/ready` | | |

Monitor eksternal (BASE-OBS-005): `<layanan>`, interval `<menit>`, pemilik akun `<organisasi mitra>`.

## 3. Event normal vs perlu investigasi

| Event (`event`) | Level | Arti | Normal / investigasi |
|---|---|---|---|
| | INFO | | Normal |
| | WARN | | |
| | ERROR | | Investigasi |

## 4. Tindakan per jenis error

| Jenis error / gejala | Langkah awal | Eskalasi ke |
|---|---|---|
| Situs tidak bisa diakses | | |
| Database tidak terjangkau (`/ready` gagal) | | |
| Disk ≥ 85% | | |
| Backup gagal (BASE-DATA-005) | | |
| Lonjakan ERROR | | |

## 5. Routing alert (BASE-OBS-007)

| Alert | Jalur | Penerima | Kanal | Contoh pesan |
|---|---|---|---|---|
| Situs tidak bisa diakses | Operator (bahasa awam) | | | "Sistem `<nama>` tidak dapat diakses sejak pukul [waktu], mohon segera hubungi [kontak]." |
| Situs tidak bisa diakses | Teknis | | | |
| Lonjakan ERROR | Teknis | | | |
| Disk ≥ 85% | Teknis | | | |
| Backup gagal | Teknis | | | |
| Sertifikat TLS hampir kedaluwarsa | Teknis | | | |

Jalur teknis: tim selama support window, lalu dev penerus atau penyedia hosting.

## 6. Kontak eskalasi

| Peran | Kontak | Berlaku sampai |
|---|---|---|
| Kontak teknis insiden (`contacts.incident_tech`) | | |
| Tech Lead | | |
| DevOps Coordinator | | |
| Program Coordinator | | |
| Pengendali Data — kontak resmi mitra (BASE-PRIV-008) | | |
| Penyedia hosting | | |
| PIC support window (BASE-MAINT-007) | | |

Timeline insiden dan notifikasi Pasal 46: framework 05 §4. Template laporan awal: `templates/reports/incident-report.md`.

## 7. Backup & restore (BASE-DATA-001..005)

- Jadwal backup: 
- Lokasi salinan offsite: 
- Enkripsi dan lokasi kunci (tanpa nilai kunci): 
- Retensi: 
- Prosedur restore langkah demi langkah:
  1. 
- Uji restore terakhir: `<tanggal>` — laporan di `docs/awg/reports/` (target RTO ≤ 8 jam).

## 8. Deploy & rollback (BASE-REL-005, BASE-REL-006)

- Deployment Guide: `<path>`
- Prosedur rollback aplikasi:
  1. 
- Prosedur rollback database:
  1. 
- Latihan rollback terakhir: `<tanggal, durasi, hasil>`
