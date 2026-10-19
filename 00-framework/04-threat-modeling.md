# Threat Modeling

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/04-threat-modeling.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian F (metodologi dari v1 AWG-SEC-002, menggantikan AWG-SEC-002/003) |

---

## 1. Tujuan

Dokumen ini mendefinisikan **bagaimana** Tech Lead setiap sistem membuat threat model. Output-nya adalah `docs/awg/threat-model.yaml` di repo sistem, mengikuti schema [catalog/schema/threat-model.schema.json](../catalog/schema/threat-model.schema.json) dan template [templates/system/threat-model.yaml](../templates/system/threat-model.yaml).

Proses dimulai dari **level arsitektur logis** (data apa mengalir ke mana, antar komponen apa). Trust boundary jaringan fisik diperjelas setelah kondisi hosting terdokumentasi (BASE-REL-008).

Kontrol terkait: BASE-GOV-001 (threat model diajukan dan direview, gate G3) dan BASE-GOV-002 (tidak ada risiko critical/high yang belum dimitigasi saat UAT, gate G6).

## 2. Metodologi: DFD + STRIDE

Metodologi DFD + STRIDE dipertahankan dari v1. **Data Flow Diagramming (DFD)** dipakai untuk memetakan sistem, lalu **STRIDE** diterapkan untuk mengidentifikasi ancaman pada tiap elemen diagram. Pendekatan ini ringan, tidak membutuhkan tooling security khusus, dan cukup untuk ancaman realistis yang didefinisikan di [00-scope-and-principles.md](00-scope-and-principles.md) §2.

### 2.1 Elemen DFD

Setiap sistem dipecah menjadi empat tipe elemen:

| Tipe Elemen | Definisi | Contoh |
|---|---|---|
| **External Entity** | Aktor atau sistem di luar kendali tim yang berinteraksi dengan sistem | Warga, RT/RW/Kadus/Kasi/Kaur, pembeli/penjual, perangkat edge (bila ada), sistem lain yang mengonsumsi API |
| **Process** | Unit logika yang mentransformasi atau bertindak atas data | "Validasi permohonan surat", "Approve/reject di tahap RT", "Generate letter_number" |
| **Data Store** | Tempat data disimpan (persisted) | Database PostgreSQL/MySQL, storage file unggahan, buffer lokal perangkat (bila ada) |
| **Data Flow** | Pergerakan data antar elemen di atas | "Warga submit permohonan surat", "Dashboard mengambil data lewat API read-only" |

### 2.2 Trust boundary

**Trust boundary** digambar di mana pun data melintas dari satu level trust ke level lain: dari pengunjung publik yang belum terautentikasi ke aplikasi terautentikasi, dari perangkat edge melalui jaringan publik ke backend, atau dari sistem ke konsumen API.

Trust boundary minimum per sistem (tambahkan boundary lain yang spesifik sistem):

- **SID:** publik → sesi warga; sesi warga → sesi petugas/approval (privilege boundary); backend SID → konsumen API (VDASH).
- **CIMART:** publik → sesi pembeli; sesi pembeli → sesi penjual; sesi penjual → sesi admin koperasi; backend → payment gateway (bila sudah ada); backend → konsumen API (bila ada).
- **SIGAP:** publik → sesi operator; (bila ada perangkat) perangkat edge → endpoint ingestion; backend → konsumen API (VDASH).
- **VDASH:** browser publik → aplikasi dashboard; dashboard → API sistem sumber (SID/SIGAP/CIMART).

**Setiap perlintasan trust boundary wajib punya minimal satu finding STRIDE.**

### 2.3 Kategori STRIDE

Terapkan tiap kategori ke elemen DFD yang relevan:

| Kategori | Mengancam | Biasanya berlaku pada |
|---|---|---|
| **S**poofing | Autentikasi | External Entity, Data Flow yang melintasi trust boundary |
| **T**ampering | Integritas | Data Flow, Data Store |
| **R**epudiation | Non-repudiation / akuntabilitas | Process yang mengubah state (approval, CRUD) |
| **I**nformation Disclosure | Kerahasiaan | Data Store, Data Flow yang membawa data Tier 1/3 |
| **D**enial of Service | Ketersediaan | Process, Data Store, terutama yang bergantung pada konektivitas tidak stabil |
| **E**levation of Privilege | Otorisasi | Process yang di-gate berdasarkan peran (tahap approval, fungsi admin) |

Ini panduan, bukan checklist kaku: tidak perlu memaksakan keenam kategori ke setiap elemen. Fokuskan usaha sesuai klasifikasi data. Elemen Tier 1 dan elemen yang melintasi privilege boundary layak mendapat perhatian paling besar; elemen Tier 4 yang read-only jauh lebih ringan.

## 3. Skala risiko

Skala ini mengganti aturan `max(likelihood, impact)` di v1.

`likelihood` dan `impact` bernilai 1–3. `score = likelihood × impact`.

| Score | Rating |
|---|---|
| 1–2 | low |
| 3–4 | medium |
| 6 | high |
| 9 | critical |

Panduan likelihood: 1 = butuh kondisi tidak umum atau akses orang dalam; 2 = mungkin lewat salah konfigurasi umum atau aktor berkemampuan sedang; 3 = bisa dieksploitasi dengan tool umum dan kemampuan rendah.

Panduan impact: 1 = hanya data publik, tanpa perubahan hak; 2 = data operasional atau sebagian kecil data Tier 1/3; 3 = eksposur Tier 1/3 luas, eskalasi hak lintas peran, atau kehilangan data.

Skala yang sama dipakai untuk waiver ([02-tailoring-and-waiver.md](02-tailoring-and-waiver.md)).

## 4. Lokasi & alur

- File: `<repo-sistem>/docs/awg/threat-model.yaml` (schema `catalog/schema/threat-model.schema.json`).
- Diajukan paling lambat G3 (GOV-001). Tidak boleh ada finding `critical`/`high` dengan `mitigation_status: not_started` saat G6 (GOV-002).
- Setiap finding **wajib** punya `related_controls` (ID kontrol yang memitigasi) atau `mitigation` khusus. Mitigasi khusus yang berkelanjutan sebaiknya dijadikan kontrol SYS.
- Setiap finding mencatat `source: team|claude-draft`. Finding berstatus `claude-draft` wajib direview.
- `mitigation_status`: `not_started` | `in_progress` | `done`. Status `done` mensyaratkan `verification_evidence`.
- Review DevOps Coordinator dicatat di blok `review: {reviewer, date, note}` dalam file.

## 5. Contoh (sistem fiktif — hanya ilustrasi)

Contoh berikut **fiktif**, bukan sistem nyata, dan hanya menunjukkan tingkat detail yang diharapkan.

**Skenario:** sistem hipotetis "Attendance Kiosk" di mana sebuah perangkat kiosk mengirim data absensi ke backend, lalu direview admin.

| Elemen DFD | Tipe | Melintasi trust boundary? |
|---|---|---|
| Kiosk Device | External Entity | Ya — perangkat tidak tepercaya di jaringan lokal |
| `submit_attendance` | Process | Ya — menerima data dari perangkat tidak tepercaya |
| Attendance DB | Data Store | Tidak (internal) |
| Admin Review UI | Process | Ya — privilege boundary (khusus admin) |

Contoh finding STRIDE untuk process `submit_attendance` dalam format v2:

```yaml
- finding_id: "KIOSK-001"
  element: "submit_attendance (process)"
  trust_boundary_ref: "TB-01"   # Kiosk device (untrusted) -> Backend
  stride_category: "Spoofing"
  threat_description: >-
    Perangkat selain kiosk resmi bisa mengirim data absensi palsu bila
    endpoint menerima request tanpa verifikasi identitas perangkat.
  likelihood: 2
  impact: 2
  score: 4
  risk_rating: medium
  related_controls: [MOD-IOT-INGEST-001]
  mitigation: >-
    Wajibkan API key atau sertifikat khusus per kiosk; tolak submission
    tanpa kredensial perangkat yang valid.
  mitigation_status: not_started
  owner: "Tech Lead - Attendance Kiosk (CONTOH)"
  verification_evidence: ""
  source: team
```

Ini tingkat spesifisitas yang diharapkan: deskripsi ancaman konkret yang terkait elemen nyata, bukan pernyataan generik seperti "penyerang mungkin meng-hack sistem". Contoh lengkap ada di template [templates/system/threat-model.yaml](../templates/system/threat-model.yaml).

## 6. Kriteria submission lengkap

Threat model dianggap lengkap bila:

1. Inventaris elemen DFD lengkap (seluruh external entity, process, data store, data flow).
2. Semua trust boundary teridentifikasi, minimal sesuai §2.2.
3. Setiap perlintasan trust boundary punya minimal satu finding STRIDE, diprioritaskan ke data Tier 1/3.
4. Setiap finding punya `related_controls` atau `mitigation` yang tidak kosong. "Belum ada mitigasi yang teridentifikasi" bisa diterima bila beralasan jujur, tetapi field tidak boleh dibiarkan kosong.
5. `likelihood`, `impact`, `score`, dan `risk_rating` diisi sesuai skala §3.

## 7. Proses review

1. Tech Lead melengkapi `docs/awg/threat-model.yaml`.
2. DevOps Coordinator mereview: (a) kelengkapan sesuai §6, (b) apakah ancaman realistis dan spesifik, (c) apakah mitigasi konsisten dengan katalog dan bisa dikerjakan tim dalam timeline program. Hasil review dicatat di blok `review`.
3. Finding tidak disetujui berdasarkan klaim sendiri. `mitigation_status` menjadi `done` hanya setelah ada bukti yang dirujuk di `verification_evidence` (tautan ke kode, konfigurasi, atau test).
4. Checkpoint review mengikuti gate: sistem tidak boleh lulus G3 tanpa threat model (BASE-GOV-001), dan tidak boleh lulus G6 bila masih ada finding `critical` atau `high` berstatus `not_started` (BASE-GOV-002).

## 8. Di luar ruang lingkup

- Threat modeling terhadap aktor nation-state / APT.
- Penilaian keamanan fisik di luar ketentuan penyedia hosting.
- Laporan penetration testing formal (diganti uji keamanan ringan, BASE-SEC-022).
- Pemetaan kepatuhan ke framework di luar UU PDP dan praktik standar aplikasi web (mis. ISO 27001 atau SOC 2).
