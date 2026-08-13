# AWG-OBS-001: Observability Standard

**Program:** Capstone Cibenda - Universitas Widyatama, Teknik Informatika

**Ruang Lingkup:** SIGAP, SID, CibendaMart

**Diterbitkan oleh:** Architecture Working Group (AWG)

**Status:** Draft - menunggu review AWG

**Versi:** 1.0

**Terakhir diperbarui:** [diisi saat finalisasi]

---

## 1. Tujuan & Ruang Lingkup

### 1.1 Tujuan

Dokumen ini menetapkan standar observability yang wajib diterapkan secara konsisten di seluruh sistem dalam ekosistem Program Capstone Cibenda (SIGAP, SID, CibendaMart). Tujuannya adalah memastikan setiap sistem dapat:

1. Mendeteksi kegagalan operasional sebelum berdampak signifikan ke pengguna akhir (warga, wisatawan, perangkat desa).
2. Menyediakan jejak audit yang cukup untuk investigasi masalah tanpa bergantung pada kehadiran developer asli.
3. Tetap dapat dipantau dan dipelihara oleh mitra pengelola (pihak desa) pasca-handoff, tanpa memerlukan keahlian teknis mendalam.

### 1.2 Relasi dengan Dokumen Governance Lain

Dokumen ini melengkapi, bukan menggantikan, seri dokumen keamanan **AWG-SEC-001 s.d. AWG-SEC-007**. Observability berfokus pada *keandalan dan visibilitas operasional* (apakah sistem bekerja sebagaimana mestinya, dan apakah kita tahu jika tidak), sementara AWG-SEC berfokus pada *keamanan* (apakah sistem terlindungi dari akses tidak sah dan kebocoran data). Kedua domain ini saling melengkapi dalam memenuhi tanggung jawab program kepada mitra desa.

### 1.3 Kepatuhan

Standar dalam dokumen ini bersifat **wajib** untuk elemen yang ditandai sebagai standar lintas sistem (logging format, level, dan struktur alerting), mengikuti prinsip Standardisasi Lintas Sistem yang telah ditetapkan dalam konteks program. Implementasi teknis spesifik (pilihan tool, detail kode) tetap menjadi kewenangan Tech Lead masing-masing sistem, selama tetap memenuhi standar yang ditetapkan di sini.

---

## 2. Prinsip Dasar

### 2.1 Delivery > Complexity Diterapkan pada Observability

Observability yang dibangun harus proporsional terhadap risiko dan kapasitas tim, bukan mengejar kelengkapan teknis maksimal. Instrumentasi yang tidak memiliki konsumen yang jelas (tidak ada yang membaca, tidak ada yang bertindak atasnya) adalah bentuk over-engineering dan sebaiknya ditunda.

### 2.2 Desain untuk Keberlanjutan Pasca-Handoff (Self-Sustaining by Design)

Sesuai dengan ketentuan post-handoff support (AWG-SEC-006) - jendela kontak best-effort 3 bulan tanpa pengganti tim pengembang, atau 1 bulan knowledge-transfer jika ada tim penerus - desain observability **tidak boleh mengasumsikan keberadaan developer aktif yang memantau dashboard secara berkelanjutan**. Implikasinya:

- Alerting harus bersifat *push* (notifikasi otomatis ke pihak yang relevan), bukan *pull* (mengharuskan seseorang membuka dashboard secara rutin).
- Retensi dan rotasi log harus otomatis, tidak memerlukan pembersihan manual berkala.
- Dokumentasi interpretasi log (lihat Bagian 7) harus dapat dipahami oleh mitra pengelola non-teknis atau tim penerus yang tidak familiar dengan riwayat pengembangan sistem.

### 2.3 Prioritas Berbasis Risiko, Bukan Keseragaman Kedalaman

Ketiga sistem memiliki tingkat kematangan dan risiko yang berbeda. Kedalaman implementasi observability dapat berbeda antar sistem, selama standar format dan struktur (Bagian 3-6) tetap seragam.

---

## 3. Logging Standard

### 3.1 Format Terstruktur

Seluruh log peristiwa **wajib** dalam format terstruktur (JSON), bukan teks bebas. Log dalam format teks bebas tidak dapat dikueri secara efektif dan menghambat proses debugging lintas sistem.

### 3.2 Skema Field Wajib

Setiap entri log wajib menyertakan field berikut, dengan nama field yang konsisten di seluruh sistem:

| Field | Tipe | Deskripsi |
|---|---|---|
| `timestamp` | ISO 8601 | Waktu kejadian, dengan zona waktu eksplisit |
| `level` | string | Salah satu dari: `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `event` | string | Nama peristiwa dalam format `snake_case` (contoh: `letter_approval_created`, `notification_send_failed`) |
| `correlation_id` | string | Lihat Bagian 4 |
| `service` | string | Nama sistem/layanan asal log (`sigap`, `sid`, `cibendamart`) |
| `actor` | string/null | Identitas aktor yang memicu peristiwa (user ID, device ID, atau `system` untuk proses otomatis) |
| `context` | object | Data tambahan spesifik peristiwa (contoh: `letter_id`, `rt_id`, `status_from`, `status_to`) |

### 3.3 Konvensi Level Log

| Level | Kriteria Penggunaan |
|---|---|
| `DEBUG` | Hanya untuk lingkungan pengembangan/staging. Tidak boleh aktif secara default di production. |
| `INFO` | Peristiwa bisnis normal yang berhasil (surat diajukan, approval disetujui, transaksi berhasil). |
| `WARN` | Kondisi tidak normal namun belum menyebabkan kegagalan (deadline approval terlewati/`is_overdue`, retry percobaan ulang). |
| `ERROR` | Kegagalan yang memerlukan perhatian (notifikasi gagal terkirim, kegagalan insert basis data, kegagalan koneksi perangkat edge). |

Pencampuran level tanpa disiplin (misalnya seluruh peristiwa dicatat sebagai `INFO`) akan menghilangkan efektivitas alerting berbasis level dan tidak diperkenankan.

### 3.4 Cakupan Minimum per Sistem

| Sistem | Titik Instrumentasi Wajib |
|---|---|
| **SID** | Setiap transisi status approval (RT/RW/Kadus/Kasi-Kaur), setiap pemicu notifikasi (berhasil/gagal), kegagalan generate `letter_number` |
| **SIGAP** | Status koneksi/keterputusan perangkat edge, kegagalan ingestion data ke PostgreSQL |
| **CibendaMart** | Status transaksi (berhasil/gagal/pending), perubahan status stok saat checkout |

---

## 4. Correlation ID Convention

### 4.1 Tujuan

Correlation ID memungkinkan penelusuran satu alur kejadian yang melintasi beberapa layer atau tahap proses (contoh: pengajuan surat SID → notifikasi RW → approval Kadus), tanpa memerlukan infrastruktur distributed tracing formal.

### 4.2 Format

Correlation ID dibangkitkan sekali di titik awal alur (misalnya saat surat diajukan, atau saat perangkat edge mengirim data pertama kali dalam satu siklus), menggunakan UUID v4, dan disertakan pada setiap entri log yang merupakan bagian dari alur yang sama.

### 4.3 Propagasi

- **SID:** Correlation ID dibangkitkan saat `UC-03: Ajukan Permohonan Surat` dan disertakan pada seluruh entri log sepanjang siklus approval hingga status terminal (`kasi_approved` atau status rejected pada tahap manapun).
- **SIGAP:** Correlation ID dibangkitkan di sisi perangkat edge (atau di titik masuk proxy jika keterbatasan perangkat) dan disertakan sepanjang jalur edge → proxy → PostgreSQL.
- **CibendaMart:** Correlation ID dibangkitkan saat inisiasi transaksi dan disertakan hingga status transaksi final.

---

## 5. Metrics Standard

### 5.1 Kategori Metrics Wajib

| Kategori | Contoh Metrik | Relevansi |
|---|---|---|
| **Request/Error Rate** | Jumlah request per endpoint, rasio error per endpoint | Deteksi dini degradasi layanan |
| **Latency** | p50, p95, p99 response time per endpoint kritis | p95/p99 lebih representatif daripada rata-rata untuk mendeteksi pengalaman buruk pada sebagian pengguna |
| **Resource Metrics** | CPU, RAM, disk usage (hosting kampus/staging dan hosting desa/production) | Kapasitas hosting desa kemungkinan terbatas; deteksi dini sebelum terjadi downtime |
| **Business Metrics** | Jumlah surat diproses/hari, rata-rata waktu approval per tahap (SID); jumlah perangkat aktif vs offline (SIGAP); jumlah transaksi/hari (CibendaMart) | Dapat dikomunikasikan ke stakeholder non-teknis sebagai bukti sistem berjalan |

### 5.2 Endpoint Kritis yang Wajib Dipantau

| Sistem | Endpoint/Proses Kritis |
|---|---|
| **SID** | Submit permohonan surat, daftar approval per tahap (RT/RW/Kadus/Kasi-Kaur) |
| **SIGAP** | Endpoint ingestion data dari proxy ke PostgreSQL |
| **CibendaMart** | Checkout/proses transaksi |

### 5.3 Catatan Skala

Distributed tracing formal (contoh: Jaeger) secara sadar **tidak diadopsi** pada tahap ini, mengingat arsitektur independent-domain program ini tidak berbentuk deep microservices yang memerlukan tracing lintas layanan kompleks. Correlation ID (Bagian 4) berfungsi sebagai pengganti yang proporsional untuk kebutuhan penelusuran alur saat ini. Keputusan ini dapat ditinjau ulang apabila kompleksitas integrasi antar sistem meningkat pada Phase 2.

---

## 6. Alerting Standard

### 6.1 Prinsip

Alerting bersifat **push**, bukan **pull** - notifikasi dikirim aktif ke pihak yang bertanggung jawab, bukan mengharuskan pemantauan dashboard secara manual. Ini konsisten dengan prinsip keberlanjutan pasca-handoff pada Bagian 2.2.

### 6.2 Penerima Alert

Alert dikirimkan kepada **pihak desa/mitra pengelola** yang ditunjuk sebagai penanggung jawab operasional pasca-handoff, melalui kanal yang telah disepakati (WhatsApp/Telegram/email). Kanal dan daftar penerima harus didokumentasikan dan diperbarui setiap kali terjadi pergantian penanggung jawab di sisi mitra.

### 6.3 Threshold Minimum

| Kategori | Kondisi Trigger | Tingkat Urgensi |
|---|---|---|
| Error rate | Error rate melampaui ambang batas dalam rentang waktu tertentu (nilai spesifik ditetapkan oleh Tech Lead per sistem sesuai baseline masing-masing) | Tinggi |
| Perangkat SIGAP tidak lapor | Tidak ada data masuk dari perangkat melebihi durasi ambang batas (contoh: 24 jam) | Sedang-Tinggi |
| Resource usage | Disk usage atau resource lain melampaui ambang batas kapasitas (contoh: 85%) | Sedang |
| Kegagalan transaksi berulang | Kegagalan transaksi CibendaMart melampaui jumlah tertentu dalam rentang waktu tertentu | Tinggi |

### 6.4 Bahasa Notifikasi

Notifikasi yang dikirim ke pihak mitra desa harus menggunakan bahasa yang dapat dipahami tanpa latar belakang teknis (contoh: "Sistem SID tidak dapat memproses surat baru sejak pukul [waktu], mohon segera hubungi [kontak]" - bukan pesan berisi stack trace atau kode error mentah).

---

## 7. Runbook / Log Interpretation Guide

### 7.1 Tujuan

Runbook menjembatani kesenjangan antara "log tersedia" dan "log dapat dipahami dan ditindaklanjuti" oleh pihak yang tidak familiar dengan riwayat pengembangan sistem, termasuk mitra pengelola desa maupun tim penerus.

### 7.2 Struktur Wajib Runbook per Sistem

Setiap sistem (SIGAP, SID, CibendaMart) wajib memiliki runbook yang memuat:

1. **Lokasi log** - di mana log dapat diakses (path, dashboard, atau sistem agregasi).
2. **Daftar event umum** - event yang bersifat normal (tidak memerlukan tindakan) versus event yang memerlukan investigasi.
3. **Panduan tindakan per jenis error** - langkah awal yang perlu diambil untuk setiap kategori error yang telah diidentifikasi.
4. **Kontak eskalasi** - siapa yang perlu dihubungi untuk setiap kategori masalah, sesuai struktur post-handoff yang berlaku (AWG-SEC-006).

### 7.3 Kepemilikan dan Pemutakhiran

Runbook disusun oleh Tech Lead masing-masing sistem dan menjadi bagian dari deliverable dokumentasi wajib per sistem (selaras dengan Architecture Document dan Deployment Guide yang telah ditetapkan sebagai dokumen minimum program).

---

## 8. Retention & Storage

### 8.1 Prinsip

Retensi dan rotasi log harus berjalan otomatis, mengingat keterbatasan kapasitas hosting desa (production) dan tidak adanya jaminan pemeliharaan manual pasca-handoff.

### 8.2 Ketentuan Umum

- Log operasional disimpan dengan jangka waktu retensi yang ditetapkan oleh masing-masing Tech Lead berdasarkan kapasitas storage yang tersedia, dengan mekanisme rotasi/penghapusan otomatis (bukan manual).
- Log yang berkaitan dengan data pribadi (PII) warga pada SID mengikuti ketentuan retensi yang selaras dengan UU PDP 27/2022.

---

## 9. Review & Update Trigger

Dokumen ini ditinjau ulang oleh AWG apabila salah satu kondisi berikut terpenuhi:

1. Validasi lapangan SIGAP selesai dan lokasi/skala deployment perangkat menjadi final - memicu peninjauan cakupan observability SIGAP dari minimum viable menjadi standar penuh.
2. Terjadi insiden operasional yang menunjukkan celah pada standar ini (log tidak mencukupi untuk investigasi, atau alert tidak terkirim pada kondisi yang seharusnya memicu).
3. Perubahan struktur post-handoff support yang memengaruhi desain alerting (Bagian 2.2 dan Bagian 6).

---

*Dokumen ini merupakan bagian dari seri dokumen governance Program Capstone Cibenda, dikelola oleh Architecture Working Group.*
