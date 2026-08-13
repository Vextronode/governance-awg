# Threat Model Template & Methodology
## Program Capstone Cibenda - SIGAP, SID, E-Commerce (CibendaMart)

| Field | Value |
|---|---|
| Document ID | AWG-SEC-002 |
| Versi | 1.0.0 |
| Status | Active - Untuk Digunakan Tech Lead Sistem |
| Pemilik | DevOps Coordinator (Architecture Working Group) |
| Berlaku Untuk | SIGAP, SID, E-Commerce |
| Dokumen Pendamping | `SECURITY_BASELINE_POLICY.md`, `security-baseline-controls.yaml`, `threat-model-schema.yaml` |
| Audiens | Tech Lead per sistem (pembuat), DevOps Coordinator (reviewer) |

---

## 1. Tujuan

Dokumen ini mendefinisikan **bagaimana** setiap Tech Lead sistem membuat threat model untuk sistemnya. Ini adalah metodologi dan instruksi - output threat model per sistem yang sebenarnya adalah salinan `threat-model-schema.yaml` yang sudah diisi, diberi nama per sistem (contoh: `threat-model-SID.yaml`).

Template ini tidak membutuhkan network topology/hosting yang sudah final untuk bisa dipakai. Prosesnya dimulai dari **level arsitektur logis** (data apa mengalir ke mana, antar komponen apa) - trust boundary jaringan fisik diperjelas kemudian setelah hosting terkonfirmasi (dilacak terpisah di Security Baseline Policy, Bagian 5).

---

## 2. Metodologi: DFD + STRIDE

Kita menggunakan **Data Flow Diagramming (DFD)** untuk memetakan sistem, lalu menerapkan **STRIDE** untuk mengidentifikasi ancaman pada tiap elemen diagram tersebut. Ini adalah pendekatan threat modeling ringan yang standar dan banyak dipakai - sesuai untuk tim dan timeline seukuran ini, dan cukup untuk mengidentifikasi ancaman realistis yang sudah didefinisikan di Security Baseline Policy (Bagian 1.2), tanpa membutuhkan tooling security khusus.

### 2.1 Tipe Elemen DFD

Setiap sistem wajib dipecah menjadi empat tipe elemen berikut:

| Tipe Elemen | Definisi | Contoh |
|---|---|---|
| **External Entity** | Aktor atau sistem di luar kendali kamu yang berinteraksi dengan sistem | Warga (citizen), RT/RW/Kadus/Kasi/Kaur, node sensor ESP8266, browser eksternal |
| **Process** | Unit logic yang mentransformasi atau bertindak atas data | "Validasi permohonan surat", "Approve/reject di tahap RT", "Generate letter_number" |
| **Data Store** | Tempat data disimpan (persisted) | Database PostgreSQL/MySQL, Firebase RTDB/Firestore, local storage ESP32 |
| **Data Flow** | Pergerakan data antar elemen di atas | "Warga submit permohonan surat", "Pembacaan sensor di-sync ke RTDB", "Dashboard fetch read-only API" |

### 2.2 Trust Boundary

**Trust boundary** digambar di mana pun data melintas dari satu level trust ke level trust lainnya - misalnya, dari pengunjung publik yang belum terautentikasi masuk ke aplikasi yang terautentikasi, dari edge device melalui jaringan publik yang tidak stabil masuk ke backend kamu, atau dari sistem kamu ke lapisan agregasi read-only Village Dashboard.

**Trust boundary minimum yang wajib per sistem** (tambahkan lagi jika sistem kamu punya trust boundary spesifik lainnya):

- **SIGAP:** Edge device (ESP8266/ESP32, jaringan untrusted/tidak stabil) → Titik ingestion Backend; Backend → Village Dashboard read-only API.
- **SID:** Pengunjung publik/belum terautentikasi → Sesi warga terautentikasi; Sesi warga → Sesi role petugas/approval (privilege boundary); Backend SID → Village Dashboard read-only API.
- **E-Commerce:** Pengunjung publik → Sesi pembeli/anggota koperasi terautentikasi; Sesi anggota → Sesi admin koperasi/operator; Backend → Village Dashboard read-only API (bila berlaku).

Setiap perlintasan trust boundary adalah kandidat lokasi ancaman dan wajib muncul minimal sekali di analisis STRIDE kamu.

### 2.3 Kategori STRIDE

Terapkan tiap kategori ke elemen DFD yang relevan (tidak semua kategori berlaku untuk semua tipe elemen - lihat panduan di bawah):

| Kategori | Mengancam | Biasanya Berlaku Pada |
|---|---|---|
| **S**poofing | Authentication | External Entity, Data Flow yang melintasi trust boundary |
| **T**ampering | Integritas | Data Flow, Data Store |
| **R**epudiation | Non-repudiation / accountability | Process yang mengubah state (approval, CRUD) |
| **I**nformation Disclosure | Konfidensialitas | Data Store, Data Flow yang membawa data Tier 1/3 |
| **D**enial of Service | Availability | Process, Data Store, terutama yang bergantung pada konektivitas tidak stabil |
| **E**levation of Privilege | Authorization | Process yang di-gate berdasarkan role (tahap approval, fungsi admin) |

**Ini panduan, bukan checklist kaku:** kamu tidak perlu memaksakan keenam kategori ke setiap elemen. Fokuskan effort proporsional dengan data classification - elemen Tier 1 (PII) dan elemen yang melintasi privilege boundary layak mendapat scrutiny paling besar; elemen Tier 4 (Public) yang read-only jauh lebih ringan.

---

## 3. Contoh yang Sudah Dikerjakan (Sistem Dummy - Hanya Ilustrasi)

Berikut adalah **contoh fiktif**, bukan sistem nyata, disediakan murni untuk mendemonstrasikan level detail yang diharapkan dan cara mengisi `threat-model-schema.yaml`.

**Skenario:** Sistem hipotetis "Attendance Kiosk" di mana sebuah kiosk device mengirim data absensi ke backend, yang kemudian direview admin.

| Elemen DFD | Tipe | Melintasi Trust Boundary? |
|---|---|---|
| Kiosk Device | External Entity | Ya - device untrusted di jaringan lokal |
| `submit_attendance` | Process | Ya - menerima data dari device untrusted |
| Attendance DB | Data Store | Tidak (internal) |
| Admin Review UI | Process | Ya - privilege boundary (admin-only) |

**Contoh entry STRIDE untuk process `submit_attendance`:**

```yaml
- element: "submit_attendance (process)"
  system: "Attendance Kiosk (CONTOH SAJA)"
  trust_boundary: "Kiosk device (untrusted) -> Backend"
  stride_category: "Spoofing"
  threat_description: >
    Device selain kiosk resmi bisa mengirim data absensi palsu jika
    endpoint menerima request tanpa verifikasi identitas device.
  likelihood: medium
  impact: medium
  risk_rating: medium
  mitigation: >
    Wajibkan API key atau certificate khusus per kiosk; tolak
    submission tanpa credential device yang valid.
  mitigation_status: not_started
  owner: "Tech Lead - Attendance Kiosk (CONTOH)"
```

Ini adalah level spesifisitas yang diharapkan: deskripsi ancaman yang konkret dan terkait elemen nyata, bukan pernyataan generik seperti "penyerang mungkin meng-hack sistem."

---

## 4. Kriteria Submission yang Lengkap

Submission threat model Tech Lead (file `threat-model-<system>.yaml` yang sudah diisi) dianggap lengkap ketika mencakup:

1. Inventory elemen DFD yang lengkap (seluruh external entity, process, data store, data flow untuk sistemnya).
2. Semua trust boundary teridentifikasi, minimal set seperti yang tercantum di Bagian 2.2.
3. Minimal satu entry STRIDE per elemen yang melintasi trust boundary, dengan entry diprioritaskan ke arah data Tier 1/3 sesuai data classification di Security Baseline Policy.
4. Setiap entry punya field `mitigation` yang tidak kosong - "no mitigation identified" adalah jawaban yang bisa diterima kalau memang beralasan jujur, tapi field-nya tidak boleh dibiarkan kosong.
5. `likelihood`, `impact`, dan `risk_rating` diisi menggunakan skala di Bagian 5 di bawah - bukan dibiarkan sebagai teks placeholder.

---

## 5. Skala Risk Rating

Untuk menjaga rating tetap bisa dibandingkan lintas tiga sistem (kebutuhan standardisasi program-wide), gunakan skala bersama ini alih-alih tiap Tech Lead membuat skalanya sendiri:

| Rating | Panduan Likelihood | Panduan Impact |
|---|---|---|
| **low** | Membutuhkan kondisi tidak umum atau akses insider untuk dieksploitasi | Hanya mempengaruhi data publik/non-sensitif, tidak ada perubahan privilege |
| **medium** | Plausible melalui misconfiguration umum atau aktor dengan skill sedang | Mempengaruhi data operational atau sebagian kecil data Tier 1/3 |
| **high** | Bisa dieksploitasi dengan tool/teknik commodity, skill rendah cukup | Mempengaruhi eksposur data Tier 1/3 secara luas atau privilege escalation lintas tahap approval |

`risk_rating` umumnya adalah yang lebih tinggi antara `likelihood` dan `impact`, disesuaikan dengan judgment Tech Lead - jika likelihood dan impact berbeda jauh, catat alasannya di `threat_description` alih-alih diam-diam dirata-rata.

---

## 6. Proses Review

1. Tech Lead melengkapi `threat-model-<system>.yaml` menggunakan template ini.
2. DevOps Coordinator mereview untuk: (a) kelengkapan sesuai Bagian 4, (b) apakah ancaman yang diidentifikasi realistis dan spesifik, bukan generik, (c) apakah mitigasi yang diajukan konsisten dengan `SECURITY_BASELINE_POLICY.md` dan benar-benar feasible untuk diimplementasikan tim dalam timeline program.
3. Entry tidak disetujui berdasarkan self-report; `mitigation_status` berpindah menjadi `done` hanya setelah ada evidence yang selaras dengan `SECURITY_BASELINE_POLICY.md` dan dirujuk di field `verification_evidence` (link ke kode, konfigurasi, atau test - mengikuti pola yang dipakai di `security-baseline-controls.yaml`).
4. Checkpoint review disejajarkan dengan gate program - sebuah sistem tidak boleh dinyatakan lulus **G3 (Architecture Review)** tanpa threat model yang sudah disubmit, dan tidak boleh dinyatakan lulus **G6 (UAT Ready)** jika masih ada item rating `critical` atau `high` yang berstatus `not_started`.

---

## 7. Yang Secara Eksplisit di Luar Ruang Lingkup Latihan Ini

Konsisten dengan framing Security Baseline Policy (Bagian 1.1–1.3), hal-hal berikut **tidak** diwajibkan dan sebaiknya tidak dibuat:

- Threat modeling terhadap nation-state / APT actor.
- Physical security assessment di luar apa yang sudah dicakup ketentuan hosting provider.
- Laporan formal penetration testing (review manual ringan terhadap threat model ini sudah cukup untuk tahap maturity program ini; formal pentesting bisa jadi rekomendasi fase mendatang, bukan kebutuhan saat ini).
- Compliance mapping ke framework di luar UU PDP dan praktik standar aplikasi web (contoh: jangan mencoba mapping ke ISO 27001 atau SOC 2 - tidak proporsional untuk ruang lingkup program ini).
