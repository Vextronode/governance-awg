<!-- DIHASILKAN oleh tools/awg-validate (catalog --gate-matrix). Jangan diedit manual. -->

# Matriks Gate AWG v2.0.0

Kontrol katalog (BASE dan MOD) per gate paling awal di mana kontrol harus `verified` (atau `waived` bila waivable).
Untuk mengklaim gate Gx, semua kontrol yang berlaku dengan gate <= Gx harus terpenuhi (framework 03 §3).
Kontrol MOD hanya berlaku bila modulnya aktif di profil sistem. Kontrol SYS tiap sistem tidak tercantum di sini.

## G3

| ID | Judul | Severity | Class | Lapis/Modul |
|---|---|---|---|---|
| BASE-GOV-001 | Threat model sistem diajukan dan direview | high | non_waivable | BASE/GOV |
| BASE-SEC-019 | Integrasi antar sistem hanya lewat API terdokumentasi | critical | non_waivable | BASE/SEC |
| BASE-PRIV-001 | Inventaris dan klasifikasi data | high | non_waivable | BASE/PRIV |
| BASE-PRIV-002 | Minimisasi data | medium | waivable | BASE/PRIV |
| MOD-PUBLIC-API-001 | Kontrak API terdokumentasi dan berversi | high | non_waivable | MOD/PUBLIC-API |

## G4

Tidak ada kontrol.

## G5

| ID | Judul | Severity | Class | Lapis/Modul |
|---|---|---|---|---|
| BASE-GOV-003 | Profil AWG akurat dan mutakhir | high | non_waivable | BASE/GOV |
| BASE-GOV-004 | Laporan verifikasi per gate | medium | non_waivable | BASE/GOV |
| BASE-SEC-001 | Autentikasi memakai mekanisme framework/library teruji | critical | non_waivable | BASE/SEC |
| BASE-SEC-002 | Password di-hash dengan algoritma adaptif | critical | non_waivable | BASE/SEC |
| BASE-SEC-003 | Masa berlaku sesi/token dan logout server-side | high | waivable | BASE/SEC |
| BASE-SEC-004 | Proteksi brute-force pada endpoint autentikasi | high | non_waivable | BASE/SEC |
| BASE-SEC-005 | Otorisasi server-side, deny-by-default, cek kepemilikan objek | critical | non_waivable | BASE/SEC |
| BASE-SEC-006 | Validasi input server-side dan query terparameterisasi | critical | non_waivable | BASE/SEC |
| BASE-SEC-007 | Pencegahan XSS | high | non_waivable | BASE/SEC |
| BASE-SEC-008 | CSRF dan CORS | high | non_waivable | BASE/SEC |
| BASE-SEC-010 | Tidak ada secret di Git, termasuk history | critical | non_waivable | BASE/SEC |
| BASE-SEC-011 | Rotasi segera atas secret yang terekspos | high | non_waivable | BASE/SEC |
| BASE-SEC-013 | Audit kerentanan dependency di CI | critical | non_waivable | BASE/SEC |
| BASE-SEC-014 | Lockfile di-commit | medium | waivable | BASE/SEC |
| BASE-SEC-020 | Log peristiwa keamanan | high | non_waivable | BASE/SEC |
| BASE-PRIV-003 | Data Tier 1/3 tidak bocor ke kanal sekunder | critical | non_waivable | BASE/PRIV |
| BASE-QA-001 | Critical paths terdefinisi | high | non_waivable | BASE/QA |
| BASE-QA-002 | Test otomatis untuk critical paths | high | non_waivable | BASE/QA |
| BASE-QA-003 | CI dan proteksi branch utama | high | non_waivable | BASE/QA |
| BASE-QA-004 | Klasifikasi defect bersama | medium | non_waivable | BASE/QA |
| BASE-OBS-001 | Log terstruktur dengan skema bersama | high | non_waivable | BASE/OBS |
| BASE-OBS-002 | Disiplin level log dan cakupan event | medium | waivable | BASE/OBS |
| BASE-OBS-003 | Correlation ID | medium | waivable | BASE/OBS |
| BASE-PERF-003 | Pencegahan N+1 query | medium | waivable | BASE/PERF |
| BASE-PERF-004 | Indeks untuk kolom filter dan foreign key | medium | waivable | BASE/PERF |
| BASE-PERF-005 | Pagination dengan batas | high | non_waivable | BASE/PERF |
| BASE-PERF-007 | Connection pooling dan timeout | medium | waivable | BASE/PERF |
| BASE-REL-001 | Environment terpisah dan setara | high | non_waivable | BASE/REL |
| BASE-REL-002 | Konfigurasi lewat environment dan .env.example lengkap | medium | non_waivable | BASE/REL |
| BASE-REL-004 | Perubahan skema hanya lewat migration | high | non_waivable | BASE/REL |
| MOD-API-CONSUMER-001 | Kredensial tidak di bundle frontend | critical | non_waivable | MOD/API-CONSUMER |
| MOD-API-CONSUMER-002 | Toleran terhadap gangguan sumber | medium | waivable | MOD/API-CONSUMER |
| MOD-API-CONSUMER-003 | Tidak menyimpan ulang data Tier 1 | high | non_waivable | MOD/API-CONSUMER |
| MOD-APPROVAL-WORKFLOW-001 | State machine eksplisit | critical | non_waivable | MOD/APPROVAL-WORKFLOW |
| MOD-APPROVAL-WORKFLOW-002 | Re-validasi peran dan yurisdiksi pada setiap aksi | critical | non_waivable | MOD/APPROVAL-WORKFLOW |
| MOD-APPROVAL-WORKFLOW-003 | Pemisahan tugas | high | waivable | MOD/APPROVAL-WORKFLOW |
| MOD-APPROVAL-WORKFLOW-004 | Jejak audit transisi tidak dapat diubah | high | non_waivable | MOD/APPROVAL-WORKFLOW |
| MOD-APPROVAL-WORKFLOW-005 | Aman terhadap aksi bersamaan | high | non_waivable | MOD/APPROVAL-WORKFLOW |
| MOD-APPROVAL-WORKFLOW-006 | Nomor resmi dibangkitkan atomik | high | non_waivable | MOD/APPROVAL-WORKFLOW |
| MOD-BULK-IMPORT-001 | Validasi per baris dengan laporan | high | non_waivable | MOD/BULK-IMPORT |
| MOD-BULK-IMPORT-002 | Atomik dan deteksi duplikat | high | non_waivable | MOD/BULK-IMPORT |
| MOD-BULK-IMPORT-003 | Cegah formula injection pada ekspor | medium | non_waivable | MOD/BULK-IMPORT |
| MOD-BULK-IMPORT-004 | Batas ukuran dan pemrosesan | medium | waivable | MOD/BULK-IMPORT |
| MOD-CMS-001 | Sanitasi rich text di server | high | non_waivable | MOD/CMS |
| MOD-CMS-002 | Hak terbit dan jejak perubahan | medium | non_waivable | MOD/CMS |
| MOD-FILE-UPLOAD-001 | Validasi tipe dan ukuran file | critical | non_waivable | MOD/FILE-UPLOAD |
| MOD-FILE-UPLOAD-002 | Penyimpanan aman | critical | non_waivable | MOD/FILE-UPLOAD |
| MOD-FILE-UPLOAD-003 | Re-encode gambar | medium | waivable | MOD/FILE-UPLOAD |
| MOD-FILE-UPLOAD-004 | File privat lewat endpoint berotorisasi | critical | non_waivable | MOD/FILE-UPLOAD |
| MOD-IOT-INGEST-001 | Kredensial per perangkat | high | non_waivable | MOD/IOT-INGEST |
| MOD-IOT-INGEST-002 | Endpoint tulis-saja dengan validasi ketat | high | non_waivable | MOD/IOT-INGEST |
| MOD-IOT-INGEST-003 | Integritas transport | high | waivable | MOD/IOT-INGEST |
| MOD-IOT-INGEST-004 | Rate limit, ukuran payload, dan anti-duplikasi | medium | non_waivable | MOD/IOT-INGEST |
| MOD-NOTIFY-001 | Kegagalan tercatat dan diulang terbatas | medium | waivable | MOD/NOTIFY |
| MOD-NOTIFY-002 | Isi notifikasi minimal | high | non_waivable | MOD/NOTIFY |
| MOD-PAYMENT-001 | Tidak menyimpan data kartu | critical | non_waivable | MOD/PAYMENT |
| MOD-PAYMENT-002 | Status pembayaran diverifikasi server-side | critical | non_waivable | MOD/PAYMENT |
| MOD-PAYMENT-003 | Idempotensi webhook | high | non_waivable | MOD/PAYMENT |
| MOD-PAYMENT-004 | Nominal dihitung di server | critical | non_waivable | MOD/PAYMENT |
| MOD-PAYMENT-005 | State machine order dan kedaluwarsa | high | non_waivable | MOD/PAYMENT |
| MOD-PAYMENT-007 | Pembayaran manual (bila dipakai) | high | non_waivable | MOD/PAYMENT |
| MOD-PII-001 | Log akses baca data pribadi oleh petugas | high | waivable | MOD/PII |
| MOD-PII-002 | Masking identitas di tampilan daftar | medium | waivable | MOD/PII |
| MOD-PII-003 | Ekspor data pribadi terkontrol | high | non_waivable | MOD/PII |
| MOD-PUBLIC-API-002 | Autentikasi per konsumen, hanya-baca | critical | non_waivable | MOD/PUBLIC-API |
| MOD-PUBLIC-API-003 | Hanya data yang disepakati | critical | non_waivable | MOD/PUBLIC-API |
| MOD-PUBLIC-API-004 | Rate limit API | medium | waivable | MOD/PUBLIC-API |
| MOD-PWA-001 | Respons berisi data sensitif tidak di-cache | high | non_waivable | MOD/PWA |
| MOD-PWA-003 | Logout membersihkan cache pengguna | medium | non_waivable | MOD/PWA |

## G6

| ID | Judul | Severity | Class | Lapis/Modul |
|---|---|---|---|---|
| BASE-GOV-002 | Tidak ada risiko critical/high yang belum dimitigasi saat UAT | high | non_waivable | BASE/GOV |
| BASE-SEC-009 | Security headers | medium | waivable | BASE/SEC |
| BASE-SEC-022 | Uji keamanan ringan sebelum UAT | high | non_waivable | BASE/SEC |
| BASE-PRIV-004 | Tidak ada data pribadi asli di dev/staging | critical | non_waivable | BASE/PRIV |
| BASE-PRIV-005 | Pemberitahuan privasi | high | waivable | BASE/PRIV |
| BASE-PRIV-008 | Kedudukan Pengendali dan pemroses ditetapkan tertulis | high | non_waivable | BASE/PRIV |
| BASE-PRIV-009 | Kesiapan notifikasi kegagalan pelindungan data | high | non_waivable | BASE/PRIV |
| BASE-QA-005 | Exit criteria rilis dipenuhi | critical | non_waivable | BASE/QA |
| BASE-QA-006 | UAT oleh perwakilan pengguna nyata | high | non_waivable | BASE/QA |
| BASE-QA-008 | Matriks perangkat dan browser | medium | waivable | BASE/QA |
| BASE-QA-009 | Aksesibilitas dasar | low | waivable | BASE/QA |
| BASE-PERF-001 | Target respons endpoint kritis | high | waivable | BASE/PERF |
| BASE-PERF-002 | Uji beban berbasis estimasi beban riil | high | waivable | BASE/PERF |
| BASE-PERF-006 | Anggaran performa frontend mobile | medium | waivable | BASE/PERF |
| BASE-REL-008 | Penilaian kapasitas hosting | high | non_waivable | BASE/REL |
| BASE-DATA-001 | Backup otomatis harian | critical | non_waivable | BASE/DATA |
| MOD-FILE-UPLOAD-005 | Kuota unggah | medium | waivable | MOD/FILE-UPLOAD |
| MOD-IOT-INGEST-006 | Perilaku buffer offline teruji | high | waivable | MOD/IOT-INGEST |
| MOD-NOTIFY-003 | Risiko penyedia didokumentasikan | medium | waivable | MOD/NOTIFY |
| MOD-PII-004 | Enkripsi at-rest kolom identitas | medium | waivable | MOD/PII |
| MOD-PWA-002 | Strategi pembaruan versi | medium | non_waivable | MOD/PWA |

## G7

| ID | Judul | Severity | Class | Lapis/Modul |
|---|---|---|---|---|
| BASE-SEC-012 | Pengelolaan secret per environment dan saat pergantian anggota | high | waivable | BASE/SEC |
| BASE-SEC-015 | Hardening konfigurasi production | critical | non_waivable | BASE/SEC |
| BASE-SEC-016 | HTTPS di semua environment publik | critical | non_waivable | BASE/SEC |
| BASE-SEC-017 | Antarmuka administratif tidak terekspos publik | critical | non_waivable | BASE/SEC |
| BASE-SEC-018 | Isolasi database dan least privilege | critical | non_waivable | BASE/SEC |
| BASE-SEC-021 | MFA untuk akun administrator sistem dan infrastruktur | high | waivable | BASE/SEC |
| BASE-PRIV-006 | Prosedur hak subjek data | medium | waivable | BASE/PRIV |
| BASE-PRIV-007 | Retensi data pribadi | medium | waivable | BASE/PRIV |
| BASE-QA-007 | Regresi dan smoke test sebelum deploy production | high | non_waivable | BASE/QA |
| BASE-OBS-004 | Endpoint health dan readiness | high | non_waivable | BASE/OBS |
| BASE-OBS-005 | Uptime monitoring eksternal | high | non_waivable | BASE/OBS |
| BASE-OBS-006 | Alert error dan resource | medium | waivable | BASE/OBS |
| BASE-OBS-007 | Routing alert dua jalur | high | non_waivable | BASE/OBS |
| BASE-OBS-008 | Rotasi dan retensi log otomatis | high | non_waivable | BASE/OBS |
| BASE-OBS-009 | Runbook sistem | high | non_waivable | BASE/OBS |
| BASE-OBS-010 | Metrik bisnis minimum | low | waivable | BASE/OBS |
| BASE-PERF-008 | Baseline performa production | low | waivable | BASE/PERF |
| BASE-REL-003 | Versi rilis dan changelog | medium | waivable | BASE/REL |
| BASE-REL-005 | Deployment terdokumentasi dan dapat diulang | high | non_waivable | BASE/REL |
| BASE-REL-006 | Prosedur rollback teruji | high | non_waivable | BASE/REL |
| BASE-REL-007 | Go/no-go checklist | high | non_waivable | BASE/REL |
| BASE-DATA-002 | Backup offsite dan terenkripsi | critical | non_waivable | BASE/DATA |
| BASE-DATA-003 | Retensi backup | medium | waivable | BASE/DATA |
| BASE-DATA-004 | Uji restore dan target RTO | high | non_waivable | BASE/DATA |
| BASE-DATA-005 | Alert kegagalan backup | high | waivable | BASE/DATA |
| BASE-MAINT-001 | Versi runtime dan framework masih didukung | high | waivable | BASE/MAINT |
| BASE-MAINT-002 | Aset dan akun milik mitra | critical | non_waivable | BASE/MAINT |
| BASE-MAINT-003 | Kalender perpanjangan | high | non_waivable | BASE/MAINT |
| BASE-MAINT-004 | Fitur containment untuk operator awam | medium | waivable | BASE/MAINT |
| BASE-MAINT-005 | Paket handover lengkap | high | non_waivable | BASE/MAINT |
| BASE-MAINT-006 | Serah terima kredensial | critical | non_waivable | BASE/MAINT |
| BASE-MAINT-007 | Support window dideklarasikan | medium | non_waivable | BASE/MAINT |
| BASE-MAINT-008 | Panduan patching untuk penerus | medium | waivable | BASE/MAINT |
| MOD-IOT-INGEST-005 | Alert perangkat tidak melapor | high | waivable | MOD/IOT-INGEST |
| MOD-PAYMENT-006 | Rekonsiliasi | medium | waivable | MOD/PAYMENT |
| MOD-PAYMENT-008 | Pemisahan kunci sandbox dan production | high | non_waivable | MOD/PAYMENT |
| MOD-PII-005 | Penonaktifan dan penghapusan akun | medium | waivable | MOD/PII |

## Ringkasan

| Gate | BASE | MOD | Total |
|---|---|---|---|
| G3 | 4 | 1 | 5 |
| G4 | 0 | 0 | 0 |
| G5 | 30 | 39 | 69 |
| G6 | 16 | 5 | 21 |
| G7 | 33 | 4 | 37 |
| Total | 83 | 49 | 132 |
