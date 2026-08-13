# AWG-QC-001: Model Verifikasi Kepatuhan Standar AWG

| | |
|---|---|
| **Kode Dokumen** | AWG-QC-001 |
| **Kategori** | Architecture Working Group - Quality Control |
| **Status** | Disetujui |
| **Pemilik** | Architecture Working Group (Program Coordinator & DevOps Coordinator) |
| **Berlaku untuk** | Seluruh standar yang diterbitkan AWG (AWG-SEC series, AWG-OBS series, dan seri AWG lain yang diterbitkan di masa mendatang) |

---

## 1. Tujuan

Dokumen ini menetapkan model verifikasi kepatuhan terhadap standar yang diterbitkan Architecture Working Group (AWG), agar setiap sistem dalam program (SIGAP, SID, CibendaMart) dapat dipastikan mematuhi standar wajib yang berlaku, tanpa menimbulkan duplikasi proses dengan mekanisme quality assurance yang sudah berjalan.

Model ini terdiri dari dua tahap yang saling melengkapi:

1. **Self-Review** - penilaian mandiri oleh tim pelaksana masing-masing sistem.
2. **Independent Verification** - verifikasi lanjutan yang dilakukan secara independen dari tim pelaksana.

Tujuan pemisahan dua tahap ini adalah untuk memastikan bahwa kepatuhan terhadap standar tidak hanya diklaim oleh tim yang mengimplementasikannya, tetapi juga dikonfirmasi oleh pihak yang tidak terlibat langsung dalam implementasi tersebut.

## 2. Ruang Lingkup

Model ini berlaku untuk setiap standar yang diterbitkan AWG, termasuk namun tidak terbatas pada:

- **AWG-SEC series** (Security Baseline Policy, Threat Model, DFD Review Guide, Incident Response, dan dokumen turunannya)
- **AWG-OBS series** (Observability Standard, Performance Standard)
- Standar AWG lain yang akan diterbitkan di masa mendatang (mis. API Convention, Deployment Blueprint, Identifier Convention), tanpa memerlukan revisi terhadap dokumen ini.

Dokumen ini **tidak** mencakup:

- **Quality flow fungsional kode** (Developer → Internal Review → Tech Lead Review → QA Validation → Merge), yang tetap berjalan sebagaimana adanya dan tidak digantikan oleh model ini.
- **Program Gates (G1–G7)**, yang merupakan mekanisme kelulusan milestone tersendiri dan tidak bergantung pada hasil verifikasi di dokumen ini (lihat Bagian 5).

## 3. Self-Review

**Pelaksana**

Tim/Tech Lead masing-masing sistem, terhadap sistemnya sendiri.

**Acuan Penilaian**

Control matrix dan/atau checklist dari standar AWG yang berlaku untuk area yang dinilai (mis. control matrix AWG-SEC-001, requirement AWG-OBS-001/002, atau standar AWG lain yang relevan).

**Pemicu (Trigger)**

Self-Review dilakukan atas dua jenis pemicu, digunakan secara kombinasi:

- **Terjadwal** - dilakukan secara berkala mengikuti siklus program (mis. per sprint atau per milestone).
- **Berbasis kejadian (event-based)** - dilakukan setiap kali terjadi perubahan yang menyentuh area yang diatur standar AWG terkait (mis. perubahan security control, perubahan struktur logging, perubahan arsitektur deployment).

**Output**

Laporan Self-Review yang memuat, untuk setiap item pada checklist yang berlaku: status kepatuhan, bukti pendukung (evidence), dan catatan gap bila ada ketidaksesuaian.

**Distribusi**

Laporan Self-Review disampaikan secara utuh dan bersamaan kepada QA Coordinator dan Program Coordinator, tanpa penyaringan.

## 4. Independent Verification

**Pelaksana**

QA Coordinator dan Program Coordinator, berkedudukan setara.

**Kedudukan**

Independent Verification adalah tahap lanjutan setelah Self-Review, dilaksanakan secara independen dari tim yang melakukan Self-Review.

**Hasil dan Konsekuensi**

Setiap Self-Review yang telah disampaikan akan menerima salah satu status berikut, beserta tindak lanjut yang berlaku bagi tim pelaksana:

| Status | Tindak Lanjut bagi Tim |
|---|---|
| **Verified** | Tidak ada tindak lanjut diperlukan. |
| **Verified with Exceptions** | Remediasi terhadap catatan pengecualian yang diberikan. |
| **Rejected** | Remediasi menyeluruh dan pengajuan ulang Self-Review untuk area terkait. |

## 5. Hubungan dengan Program Gates (G1–G7)

Independent Verification bersifat **independen dari Program Gates** dan tidak menjadi syarat kelulusan gate manapun. Laporan Independent Verification dapat digunakan sebagai bukti pendukung (supporting evidence) pada saat peninjauan gate tertentu apabila dibutuhkan, namun tidak bersifat blocking terhadap proses kelulusan gate.

## 6. Prinsip Penerapan

- Model ini bersifat category-level dan berlaku seragam untuk seluruh sistem dalam program, tanpa penyesuaian per sistem yang dapat menimbulkan beban pemeliharaan di kemudian hari.
- Model ini akan berlaku otomatis terhadap standar AWG baru yang diterbitkan setelah dokumen ini disahkan, tanpa memerlukan revisi dokumen.
- Template Laporan Self-Review dan Laporan Independent Verification akan diterbitkan sebagai dokumen terpisah, menyusul dokumen ini.