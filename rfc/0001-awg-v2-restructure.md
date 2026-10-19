# AWG v2 — Spesifikasi Final Restrukturisasi Standar

| Field | Nilai |
|---|---|
| ID | RFC-0001 |
| Judul | Restrukturisasi standar AWG menjadi model 3 lapis (Baseline · Modul · Profil Sistem) |
| Status | Disetujui konsep (Program Coordinator, 2026-10-19) — siap dieksekusi |
| Berlaku untuk | SID (SIDUTama), SIGAP, CibendaMart (CIMART), Village Dashboard (VDASH), dan sistem baru di masa depan |
| Menggantikan | Seluruh isi `governance-awg` v1 (AWG-QC-001, AWG-OBS-001/002, AWG-SEC-001/002/003/005/006, `security-baseline-controls.yaml`) |
| Dokumen terkait (tidak diubah) | Program Gates Guide (PM) — definisi G1–G7 |

> **Aturan untuk pelaksana (Claude Code):** dokumen ini adalah satu-satunya sumber kebenaran. Isi normatif (kontrol, angka, aturan gate, timeline) **disalin apa adanya**. Jangan menambah, mengurangi, atau melunakkan persyaratan. Bila menemukan celah atau kontradiksi, catat di `rfc/OPEN-QUESTIONS.md` dan jangan mengarang solusinya.

---

## Bagian A — Fakta Program yang Sudah Dikonfirmasi

| Sistem | ID | Stack (dikonfirmasi 2026-10-19) | Catatan |
|---|---|---|---|
| Sistem Informasi Desa (SIDUTama) | `SID` | Laravel + Sanctum, React, PostgreSQL | Data pribadi warga (NIK, KK), rantai approval surat RT → RW → Kadus → Kasi/Kaur |
| CibendaMart | `CIMART` | Laravel, React, MySQL | Payment gateway **belum diputuskan mitra** |
| SIGAP | `SIGAP` | React, Express, PostgreSQL | **Tidak lagi memakai Firebase.** Keberadaan perangkat ESP8266/ESP32 dan fitur GIS **belum dikonfirmasi** dan wajib dicek saat adopsi |
| Village Dashboard | `VDASH` | **Belum diketahui** — dideteksi saat adopsi | Sistem terpisah dengan repo sendiri, agregasi read-only dari sistem lain |

Hal-hal berikut dari dokumen v1 **sudah usang** dan tidak boleh muncul lagi sebagai fakta: Firebase (Auth/RTDB/Firestore/Cloud Functions) di SIGAP, Vercel dan `src/data/*.json` sebagai platform Dashboard, referensi ke AWG-SEC-004 / AWG-SEC-007 / `DFD_REVIEW_GUIDE.md` / `ENGINEERING_STANDARDS.md` (tidak pernah ada).

Hosting: production di hosting milik desa, staging di hosting kampus (dari v1). Status ini dipertahankan sebagai asumsi, dan setiap sistem wajib mendokumentasikan kondisi aktualnya di profil (BASE-REL-008).

---

## Bagian B — Prinsip & Ruang Lingkup (sumber untuk `00-framework/00-scope-and-principles.md`)

### B.1 Ruang lingkup ancaman (dipertahankan dari v1, diperbarui)
Standar ini mengatur aplikasi web sektor publik dan komunitas berskala desa yang dikembangkan tim mahasiswa. Populasi ancaman yang realistis:
1. Penyerang oportunistik: kredensial terekspos, konfigurasi salah, dependency belum di-patch, brute-force login.
2. Penyalahgunaan oleh orang dalam atau eksposur tidak sengaja oleh operator berakses sah tetapi luas.
3. Privilege escalation dan IDOR di alur multi-peran (approval surat, penjual vs pembeli).
4. Gangguan ketersediaan akibat hosting yang kekurangan sumber daya dan konektivitas pedesaan.
5. Masalah integritas data dari input manual, import Excel, dan sinkronisasi.
6. **Pembusukan pasca-handoff**: dependency tidak di-patch, domain/sertifikat kedaluwarsa, akun dipegang pribadi mahasiswa.

Di luar ruang lingkup: aktor nation-state/APT, serangan fisik, sertifikasi ISO 27001/SOC 2, dan pentest formal (diganti uji keamanan ringan, BASE-SEC-022).

### B.2 Landasan
- **Hukum:** UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Pasal 46: bila terjadi kegagalan pelindungan data pribadi, **Pengendali Data Pribadi** wajib menyampaikan pemberitahuan tertulis **paling lambat 3×24 jam** kepada (a) subjek data dan (b) lembaga. Isi minimum: data yang terungkap, kapan dan bagaimana data terungkap, serta upaya penanganan dan pemulihan. Dalam hal tertentu, pemberitahuan juga wajib kepada masyarakat.
- **Teknis (referensi, bukan mandat sertifikasi):** OWASP ASVS Level 1–2 dan OWASP Top 10. Rujukan ditulis dengan nama bab (mis. "ASVS – Authentication"), tanpa nomor versi.

### B.3 Peran hukum data (baru)
- Untuk data warga atau pengguna riil, **Pengendali Data adalah mitra (Pemerintah Desa / pengelola koperasi)**. Tim capstone berkedudukan sebagai pihak yang memproses atas nama mitra selama pengembangan dan masa dukungan.
- Keputusan dan pengiriman notifikasi Pasal 46 adalah wewenang Pengendali. Tim berkewajiban **melapor cepat dan menyiapkan draf**, bukan memutuskan.
- Kedudukan ini wajib dikonfirmasi tertulis dengan mitra (BASE-PRIV-008). Interpretasi hukum yang belum pasti dikonfirmasi ke dosen pembimbing atau penasihat hukum mitra, dan dicatat di OPEN-QUESTIONS.

### B.4 Klasifikasi data (dipertahankan dari v1)

| Tier | Label | Contoh | Penanganan minimum |
|---|---|---|---|
| 1 | PII – Restricted | NIK, No. KK, nama + alamat, isi surat, riwayat approval, alamat pengiriman, nomor HP | Enkripsi in transit, akses berbasis peran, log akses, tidak boleh di log / URL / browser storage |
| 2 | Operational – Internal | Pembacaan sensor, telemetri, ID perangkat, threshold | Validasi integritas, log akses |
| 3 | Transactional – Restricted | Order, transaksi, referensi pembayaran, data anggota koperasi | Sama dengan Tier 1; data kartu **tidak pernah** disimpan |
| 4 | Public | Profil desa, berita, pengumuman, katalog produk | Kontrol integritas (cegah perubahan tidak sah) |

### B.5 Prinsip
1. **Proporsional (Delivery > Complexity).** Kontrol harus bisa dikerjakan tim mahasiswa dan bisa diverifikasi. Kontrol yang tidak bisa diverifikasi tidak boleh ditulis.
2. **Bukti mengalahkan klaim.** Status `verified` hanya diberikan oleh verifikator di luar tim pelaksana.
3. **Satu sumber kebenaran.** Kontrol ditulis sekali di katalog. Status hanya ada di repo sistem. Rekap dihitung oleh tool dan tidak pernah diketik manual.
4. **Self-sustaining by design.** Sistem harus tetap aman dan bisa dioperasikan setelah tim capstone pergi.
5. **Jujur atas keterbatasan.** Item yang belum selesai dicatat terbuka (status, waiver, known issues), bukan disembunyikan.

### B.6 Kata kunci normatif
- **WAJIB** — harus dipenuhi. Tidak dipenuhi berarti tidak patuh.
- **SEBAIKNYA** — diharapkan dipenuhi. Bila tidak, alasannya dicatat di `notes` status kontrol.
- **BOLEH** — opsional.

Kalimat seperti "direkomendasikan bila kapasitas memungkinkan" **dilarang** dipakai dalam statement kontrol.

---

## Bagian C — Model Kontrol (sumber untuk `00-framework/01-control-model.md`)

### C.1 Tiga lapis
| Lapis | Lokasi | Prefix ID | Berlaku |
|---|---|---|---|
| L1 Baseline | `governance-awg/catalog/baseline.yaml` | `BASE-<DOMAIN>-<NNN>` | Semua sistem, tanpa kecuali |
| L2 Modul kapabilitas | `governance-awg/catalog/modules/<MODULE>.yaml` | `MOD-<MODULE>-<NNN>` | Sistem yang mendeklarasikan modul tersebut di profilnya |
| L3 Kontrol sistem | `<repo-sistem>/docs/awg/controls-local.yaml` | `SYS-<SYSTEM>-<NNN>` | Satu sistem |

Domain baseline: `GOV` (tata kelola), `SEC` (keamanan), `PRIV` (privasi/UU PDP), `QA` (kualitas & pengujian), `OBS` (observability), `PERF` (performa), `REL` (rilis & deployment), `DATA` (backup & pemulihan), `MAINT` (keberlanjutan & handoff).

Modul: `PII`, `APPROVAL-WORKFLOW`, `PAYMENT`, `FILE-UPLOAD`, `BULK-IMPORT`, `IOT-INGEST`, `PUBLIC-API`, `API-CONSUMER`, `CMS`, `NOTIFY`, `PWA`.

### C.2 Field kontrol (katalog)
| Field | Wajib | Nilai |
|---|---|---|
| `id` | ya | Pola sesuai lapis. Unik global. Tidak boleh dipakai ulang walau kontrol dihapus (gunakan `deprecated: true`). |
| `domain` | ya (BASE) | Salah satu domain C.1 |
| `module` | ya (MOD) | Salah satu modul C.1 |
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

### C.3 Aturan kelas
- `non_waivable` sejalan dengan prinsip Program Gates "kriteria minimum mandatory dan tidak dapat dikurangi". Kontrol kelas ini **tidak bisa** di-waive, dan gate terkait terblokir sampai kontrol `verified`.
- `waivable`: boleh dikecualikan sementara melalui waiver (lihat D).
- Aturan penetapan kelas: kontrol `critical` selalu `non_waivable`, kecuali katalog menyatakan lain secara eksplisit. (Katalog v2.0.0 tidak memuat pengecualian.)

### C.4 Status per kontrol (di `docs/awg/status.yaml` repo sistem)
| Status | Arti | Syarat |
|---|---|---|
| `not_started` | Belum dikerjakan | — |
| `in_progress` | Sedang dikerjakan | `owner` terisi |
| `implemented` | Tim mengklaim selesai | `evidence` ≥ 1 item dengan `ref` konkret (path, URL commit/PR/CI run) |
| `verified` | Dikonfirmasi verifikator | Status sebelumnya `implemented` dan blok `verification` lengkap (lihat E.2) |
| `rejected` | Verifikator menolak klaim | `verification.result: rejected` dan `verification.note` terisi; tim kembali bekerja |
| `waived` | Dikecualikan sementara | Kontrol `waivable`, `waiver` merujuk ke waiver aktif yang belum kedaluwarsa |
| `not_applicable` | Tidak relevan | **Hanya** untuk kontrol MOD/SYS, dengan `reason` dan blok `verification` (verifikator setuju). BASE **tidak boleh** `not_applicable`; gunakan waiver. |

### C.5 Severity (dampak bila kontrol tidak ada)
- `critical`: kebocoran data Tier 1/3 skala luas, pengambilalihan akun berhak tinggi, kehilangan data permanen, atau sistem tidak bisa dipulihkan.
- `high`: eksposur terbatas, eskalasi hak terbatas, gangguan layanan inti berjam-jam, atau insiden yang tidak terdeteksi.
- `medium`: penurunan kualitas atau keandalan yang bisa diatasi, atau risiko yang butuh kondisi tambahan.
- `low`: kerapian, kenyamanan, atau dampak minor.

---

## Bagian D — Tailoring & Waiver (sumber untuk `00-framework/02-tailoring-and-waiver.md`)

### D.1 Tailoring
1. **Menambah** kontrol (SYS-*) atau **memperketat** angka (mis. target performa): bebas, cukup dicatat di profil atau `controls-local.yaml`.
2. **Mengaktifkan / tidak mengaktifkan modul**: wajib disertai `reason` dan bukti (path kode) di `profile.yaml`. Verifikator memeriksa kebenarannya saat verifikasi GOV-003.
3. **Mengurangi atau melonggarkan** kontrol BASE/MOD: hanya lewat waiver. Kontrol `non_waivable` tidak bisa dikurangi.

### D.2 Waiver
Disimpan di `docs/awg/waivers.yaml` repo sistem.

| Field | Isi |
|---|---|
| `id` | `WVR-<SYSTEM>-<NNN>` |
| `control` | ID kontrol `waivable` |
| `reason` | Mengapa belum atau tidak bisa dipenuhi |
| `risk` | `likelihood` dan `impact` (skala 1–3, lihat F.3) beserta `score` |
| `compensating_controls` | Mitigasi pengganti (boleh "tidak ada" dengan alasan) |
| `owner` | Tech Lead sistem |
| `approved_by` | **Dua** penyetuju: Program Coordinator **dan** Coordinator domain terkait (DevOps Coordinator untuk SEC/REL/DATA/OBS/PERF/MAINT, QA Coordinator untuk QA, Program Coordinator + DevOps Coordinator untuk PRIV/GOV) |
| `approved_at` | Tanggal ISO |
| `expires_at` | Paling lambat **90 hari** sejak disetujui **atau** tanggal target G7, mana yang lebih dulu |
| `status` | `active` \| `expired` \| `closed` |

Aturan:
- Waiver kedaluwarsa otomatis membuat kontrol kembali tidak patuh. Validator menandai ini sebagai error.
- Penyetuju tidak boleh berasal dari tim sistem yang mengajukan.
- Semua waiver `active` pada saat G7 wajib tercantum di dokumen handover sebagai **keterbatasan yang diketahui** (BASE-MAINT-005).
- Perpanjangan waiver dihitung sebagai waiver baru dengan ID baru.

---

## Bagian E — Verifikasi & Gate (sumber untuk `00-framework/03-verification-and-gates.md`; menggantikan AWG-QC-001)

### E.1 Alur
1. **Self-assessment:** tim memperbarui `status.yaml` menjadi `implemented` beserta bukti.
2. **Verifikasi independen:** verifikator memeriksa bukti sesuai field `verification` kontrol, lalu mengisi blok `verification`.
3. **Klaim gate:** Tech Lead menjalankan `awg-validate system --gate Gx`. Bila hasilnya bersih, Tech Lead membuat **laporan verifikasi gate** (`docs/awg/reports/gate-Gx-YYYY-MM-DD.md`, template `verification-report.md`) dan mengajukannya ke Program Coordinator.
4. **Keputusan gate:** Program Coordinator memutuskan lulus atau tidak berdasarkan Program Gates Guide **dan** laporan AWG.

### E.2 Independensi verifikator
- Verifikator **bukan** anggota tim sistem yang diverifikasi (dicek terhadap `system.team` di profil).
- Rotasi default: tim CIMART memverifikasi SID, tim SIGAP memverifikasi CIMART, tim VDASH memverifikasi SIGAP, tim SID memverifikasi VDASH. Rotasi boleh diubah oleh AWG dan dicatat di `00-framework/08-roles.md`.
- Kontrol `critical` membutuhkan **dua** verifikasi: satu dari tim rotasi dan satu dari Coordinator domain (DevOps Coordinator untuk SEC/REL/DATA/OBS/PERF/MAINT dan modul teknis, QA Coordinator untuk QA, Program Coordinator untuk PRIV/GOV).
- Program Coordinator memutuskan gate dan menyetujui waiver. Program Coordinator **tidak** menjadi verifikator tunggal kontrol non-PRIV/GOV.
- Format blok:
```yaml
verification:
  - verifier: "<nama>"
    verifier_role: "rotation" # rotation | devops_coordinator | qa_coordinator | program_coordinator
    verifier_system: "CIMART" # sistem asal verifikator, atau "AWG" untuk coordinator
    date: "2026-11-02"
    result: "verified"        # verified | rejected
    note: "Diperiksa: tests/Feature/ApprovalTest.php lulus di CI run #123"
```

### E.3 Aturan gate
Sebuah sistem **boleh mengklaim gate Gx** hanya bila semua kontrol yang berlaku (BASE + MOD aktif + SYS) dengan `gate` ≤ Gx berstatus:
- `verified`, atau
- `waived` (hanya untuk `waivable`, waiver aktif), atau
- `not_applicable` yang terverifikasi (hanya MOD/SYS).

Keterkaitan dengan dokumen PM: overlay ini **tidak mengubah** Program Gates Guide. Overlay ini menambahkan persyaratan kualitas, keamanan, dan privasi pada setiap gate. Ini menggantikan pernyataan v1 bahwa verifikasi "tidak blocking", yang sudah dihapus.

### E.4 Aturan transisi (sistem yang sudah melewati sebagian gate)
- Saat adopsi, profil mencatat `adoption.gate_at_adoption` (gate terakhir yang sudah lulus).
- Kontrol dengan `gate` ≤ gate_at_adoption menjadi **utang retroaktif**. Utang ini tidak membatalkan gate yang sudah lulus, tetapi wajib beres sebelum sistem mengklaim gate **berikutnya**.
- Threat model (GOV-001) termasuk utang retroaktif bagi sistem yang sudah melewati G3.

### E.5 Matriks gate
Matriks kontrol per gate **dihasilkan otomatis** oleh `awg-validate catalog --gate-matrix` ke `catalog/GATE-MATRIX.md`, dan CI memastikan file itu selalu sinkron dengan katalog. Dokumen framework hanya merujuk ke file tersebut dan tidak menyalin tabelnya.

---

## Bagian F — Threat Modeling (sumber untuk `00-framework/04-threat-modeling.md`)

### F.1 Metodologi
DFD + STRIDE, dipertahankan dari v1 (AWG-SEC-002), dengan perubahan berikut:
- Elemen DFD: External Entity, Process, Data Store, Data Flow.
- Trust boundary minimum per sistem:
  - **SID:** publik → sesi warga; sesi warga → sesi petugas/approval (privilege boundary); backend SID → konsumen API (VDASH).
  - **CIMART:** publik → sesi pembeli; sesi pembeli → sesi penjual; sesi penjual → sesi admin koperasi; backend → payment gateway (bila sudah ada); backend → konsumen API (bila ada).
  - **SIGAP:** publik → sesi operator; (bila ada perangkat) perangkat edge → endpoint ingestion; backend → konsumen API (VDASH).
  - **VDASH:** browser publik → aplikasi dashboard; dashboard → API sistem sumber (SID/SIGAP/CIMART).
- Setiap perlintasan trust boundary wajib punya minimal satu finding STRIDE.
- Contoh fiktif "Attendance Kiosk" dari v1 dipertahankan di template sebagai ilustrasi.

### F.2 Lokasi & alur
- File: `<repo-sistem>/docs/awg/threat-model.yaml` (schema `catalog/schema/threat-model.schema.json`).
- Diajukan paling lambat G3 (GOV-001). Tidak boleh ada finding `critical`/`high` dengan `mitigation_status: not_started` saat G6 (GOV-002).
- Setiap finding **wajib** punya `related_controls` (ID kontrol yang memitigasi) atau `mitigation` khusus. Mitigasi khusus yang berkelanjutan sebaiknya dijadikan kontrol SYS.

### F.3 Skala risiko (mengganti `max(likelihood, impact)` di v1)
`likelihood` dan `impact` bernilai 1–3. `score = likelihood × impact`.

| Score | Rating |
|---|---|
| 1–2 | low |
| 3–4 | medium |
| 6 | high |
| 9 | critical |

Panduan likelihood: 1 = butuh kondisi tidak umum atau akses orang dalam; 2 = mungkin lewat salah konfigurasi umum atau aktor berkemampuan sedang; 3 = bisa dieksploitasi dengan tool umum dan kemampuan rendah.
Panduan impact: 1 = hanya data publik, tanpa perubahan hak; 2 = data operasional atau sebagian kecil data Tier 1/3; 3 = eksposur Tier 1/3 luas, eskalasi hak lintas peran, atau kehilangan data.
Skala yang sama dipakai untuk waiver (D.2).

---

## Bagian G — Incident Response (sumber untuk `00-framework/05-incident-response.md`; menggantikan AWG-SEC-005)

### G.1 Severity insiden (dipertahankan dari v1)
| SEV | Kriteria |
|---|---|
| SEV-1 | Data Tier 1/3 terekspos atau berpotensi terekspos ke pihak tidak berwenang; ATAU privilege escalation berhasil dieksploitasi; ATAU kehilangan data tanpa backup yang dapat dipulihkan |
| SEV-2 | Data Tier 1/3 berisiko terekspos tanpa bukti eksploitasi; ATAU fungsi inti tidak tersedia total |
| SEV-3 | Data Tier 2/4 terdampak; ATAU gangguan ketersediaan parsial |
| SEV-4 | Anomali tanpa dampak nyata |

### G.2 Containment (dipertahankan dari v1)
Tabel containment per SEV dan siapa yang berwenang disalin dari v1 AWG-SEC-005 Bagian 4, tanpa perubahan substansi. Prinsip: untuk SEV-1, bila ragu, lakukan containment yang lebih agresif.

### G.3 Timeline eskalasi & notifikasi (DIPERBAIKI — mengikuti Pasal 46 UU PDP)
T0 = saat indikasi insiden pertama kali diketahui siapa pun dalam tim. Untuk tujuan Pasal 46, program memakai interpretasi konservatif: **jam 3×24 dihitung dari T0**.

| Batas | Langkah | Pelaku |
|---|---|---|
| Segera | Mulai containment sesuai G.2. Tidak menunggu eskalasi selesai. | Penemu + Tech Lead |
| ≤ T0 + 2 jam | Lapor ke Tech Lead (semua SEV, termasuk dugaan) | Penemu |
| ≤ T0 + 6 jam | Untuk dugaan SEV-1/SEV-2: lapor **paralel** ke DevOps Coordinator dan Program Coordinator, dengan laporan awal (template `incident-report.md`) | Tech Lead |
| ≤ T0 + 24 jam | Bila data pribadi mungkin terlibat: Program Coordinator memberi tahu **Pengendali Data (kontak resmi mitra)** dan menyerahkan laporan awal | Program Coordinator |
| ≤ T0 + 48 jam | Tim menyerahkan **draf notifikasi Pasal 46** (isi: data yang terungkap; kapan & bagaimana; upaya penanganan & pemulihan) kepada Pengendali | Program Coordinator + Tech Lead |
| ≤ T0 + 72 jam | Pengendali menyampaikan pemberitahuan tertulis kepada subjek data dan lembaga. Pengendali juga menilai kewajiban pemberitahuan kepada masyarakat. | Pengendali (mitra) |

Catatan wajib di dokumen:
- Bila lembaga pengawas PDP atau kanal resminya belum tersedia saat insiden, upaya pemberitahuan dan kanal yang dipakai tetap didokumentasikan.
- Interpretasi titik awal T0 dan kriteria pemberitahuan publik dicatat sebagai open question untuk dikonfirmasi ke dosen pembimbing atau penasihat hukum mitra.
- SIGAP umumnya tidak menangani data pribadi warga, tetapi kebocoran kredensial atau data operator tetap termasuk data pribadi.

### G.4 Post-incident review
Wajib untuk SEV-1/SEV-2 (template `postmortem.md`): root cause, ketepatan containment, kontrol katalog mana yang seharusnya mencegah beserta statusnya saat insiden, dan tindak lanjut (kontrol baru, revisi threat model). Prinsip blameless.

---

## Bagian H — Handoff & Dukungan (sumber untuk `00-framework/06-handoff-and-support.md`; menggantikan AWG-SEC-006)

Dipertahankan dari v1 AWG-SEC-006: catatan tanggung jawab hukum pasca serah terima, support window best-effort (**3 bulan** bila tidak ada dev penerus; **1 bulan** knowledge transfer bila ada dev penerus), decision tree operator berbahasa awam, dan kisi-kisi konten 3 book guide (User, Admin/Operator, Development Selanjutnya).

Perubahan:
1. Kebutuhan engineering pra-handoff (mode maintenance, reset password admin, kontak di aplikasi) dipindah menjadi kontrol BASE-MAINT-004 beserta syarat keamanannya.
2. Daftar dokumen yang diwariskan ke dev penerus diperbarui: seluruh `docs/awg/` repo sistem dan tag versi `governance-awg` yang dipakai. Referensi ke `DFD_REVIEW_GUIDE.md` dihapus.
3. Template `operator-playbook.md` dan `handover-checklist.md` disediakan di `templates/system/`.
4. Kepemilikan akun dan aset serta kalender perpanjangan menjadi kontrol (BASE-MAINT-002, -003).

---

## Bagian I — Klasifikasi Defect & Exit Criteria (sumber untuk `00-framework/07-defect-severity-and-exit-criteria.md`)

### I.1 Severity defect
| Level | Kriteria | Contoh |
|---|---|---|
| S1 Blocker | Kehilangan atau korupsi data; kerentanan keamanan yang dapat dieksploitasi; alur inti tidak bisa dipakai tanpa workaround | Warga bisa melihat surat warga lain; checkout menggandakan pengurangan stok |
| S2 Major | Fitur inti memberi hasil salah atau rusak dengan workaround sulit | Notifikasi approval tidak terkirim; laporan transaksi salah total |
| S3 Minor | Fitur non-inti rusak, atau fitur inti terganggu dengan workaround mudah | Filter daftar tidak menyimpan pilihan |
| S4 Trivial | Kosmetik, typo, tata letak minor | Salah eja label |

### I.2 Exit criteria
| Titik | Kriteria |
|---|---|
| Masuk G6 (UAT) | 0 defect S1 terbuka; seluruh test critical path lulus di CI; kontrol gate ≤ G6 terpenuhi (E.3) |
| Masuk G7 (Deploy) | 0 S1 dan 0 S2 terbuka (S2 boleh di-waive lewat waiver defect berformat sama dengan D.2); seluruh skenario UAT fitur inti lulus; S3/S4 tercatat di Known Issues; kontrol gate ≤ G7 terpenuhi |
| Setiap rilis production setelah G7 | 0 S1 baru; regresi otomatis lulus; go/no-go checklist lengkap (BASE-REL-007) |

---

## Bagian J — Peran (sumber untuk `00-framework/08-roles.md`)

| Aktivitas | Tech Lead sistem | Developer | Verifikator rotasi | DevOps Coord. | QA Coord. | Program Coord. | Documentation Coord. |
|---|---|---|---|---|---|---|---|
| Memelihara katalog & framework (repo pusat) | C | – | – | R (SEC/OBS/PERF/REL/DATA/MAINT) | R (QA) | A | R (struktur dokumen) |
| Profil, status, threat model sistem | A/R | R | – | C | C | I | – |
| Implementasi kontrol | A | R | – | C | C | – | – |
| Verifikasi kontrol | – | – | R | R (critical teknis) | R (critical QA) | R (critical PRIV/GOV) | – |
| Persetujuan waiver | Pengaju | – | – | A (domainnya) | A (QA) | A | – |
| Keputusan gate | Pengaju | – | I | C | C | A | I |
| Insiden | R | R | – | A (teknis) | I | A (notifikasi ke mitra) | – |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

Aturan konflik kepentingan: (1) tidak ada yang memverifikasi kontrol pada sistem tempat ia menjadi anggota tim; (2) Coordinator yang juga anggota tim sebuah sistem tidak boleh menyetujui waiver untuk sistem tersebut. Penggantinya ditunjuk Program Coordinator.

Rotasi verifikator default ada di E.2.

---

## Bagian K — Katalog Kontrol (sumber untuk `catalog/`)

> Pelaksana: salin blok YAML berikut **verbatim** ke file tujuan yang tertera. Field `evidence`, `verification`, `rationale` boleh dirapikan formatnya, tetapi isinya tidak boleh diubah.

### K.1 `catalog/baseline.yaml`

```yaml
catalog: baseline
version: 2.0.0
controls:

  # ---------------- GOV ----------------
  - id: BASE-GOV-001
    domain: GOV
    title: Threat model sistem diajukan dan direview
    statement: >-
      Setiap sistem WAJIB memiliki docs/awg/threat-model.yaml (DFD + STRIDE, skala risiko F.3)
      yang mencakup seluruh trust boundary minimum dan telah direview DevOps Coordinator.
    rationale: Ancaman harus dikenali sebelum dimitigasi; menggantikan AWG-SEC-002/003.
    severity: high
    class: non_waivable
    gate: G3
    verification: >-
      Validator lulus untuk threat-model.yaml; setiap perlintasan trust boundary punya >=1 finding;
      ada catatan review DevOps Coordinator (tanggal + nama) di file.
    evidence: [document]
    supersedes: []

  - id: BASE-GOV-002
    domain: GOV
    title: Tidak ada risiko critical/high yang belum dimitigasi saat UAT
    statement: >-
      Saat klaim G6, threat model WAJIB tidak memiliki finding dengan rating critical atau high
      yang mitigation_status-nya not_started.
    rationale: Memperbaiki aturan v1 yang merujuk rating "critical" yang tidak ada di skala.
    severity: high
    class: non_waivable
    gate: G6
    verification: Validator gate G6 lulus untuk threat-model.yaml.
    evidence: [document]

  - id: BASE-GOV-003
    domain: GOV
    title: Profil AWG akurat dan mutakhir
    statement: >-
      docs/awg/profile.yaml dan status.yaml WAJIB mencerminkan kondisi aktual (stack, modul aktif
      beserta bukti, anggota tim, critical paths) dan WAJIB lulus validator sebelum setiap klaim gate.
    rationale: Kepatuhan tidak bisa dinilai dari profil yang salah.
    severity: high
    class: non_waivable
    gate: G5
    verification: >-
      Verifikator mencocokkan modul aktif/tidak aktif dengan kode (bukti path) dan menjalankan validator.
    evidence: [document, ci_run]

  - id: BASE-GOV-004
    domain: GOV
    title: Laporan verifikasi per gate
    statement: >-
      Setiap klaim gate (G3-G7) WAJIB disertai laporan docs/awg/reports/gate-<Gx>-<tanggal>.md
      berbasis template verification-report.md, berisi output validator dan daftar waiver aktif.
    rationale: Jejak audit keputusan gate.
    severity: medium
    class: non_waivable
    gate: G5
    verification: File laporan ada untuk setiap gate yang diklaim sejak adopsi.
    evidence: [report]

  # ---------------- SEC ----------------
  - id: BASE-SEC-001
    domain: SEC
    title: Autentikasi memakai mekanisme framework/library teruji
    statement: >-
      Autentikasi WAJIB memakai mekanisme framework atau library yang teruji dan terpelihara
      (mis. Laravel Sanctum/Fortify; untuk Express: library mapan untuk session atau JWT).
      Logika kriptografi dan penyimpanan kredensial buatan sendiri dilarang.
    rationale: Autentikasi buatan sendiri adalah sumber kerentanan klasik.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Review kode modul auth; daftar dependency auth dan versinya.
    evidence: [code]
    refs: ["ASVS - Authentication"]
    supersedes: [AUTH-001]

  - id: BASE-SEC-002
    domain: SEC
    title: Password di-hash dengan algoritma adaptif
    statement: >-
      Password WAJIB di-hash dengan bcrypt atau argon2id pada cost default framework atau lebih tinggi.
      Plaintext dan enkripsi reversibel dilarang.
    rationale: Membatasi dampak bila database bocor.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Cek konfigurasi hashing dan sampel kolom password di DB staging (format hash).
    evidence: [code, config]
    refs: ["ASVS - Authentication"]
    supersedes: [AUTH-002]

  - id: BASE-SEC-003
    domain: SEC
    title: Masa berlaku sesi/token dan logout server-side
    statement: >-
      Sesi dan token WAJIB memiliki masa berlaku. Logout WAJIB menginvalidasi sesi/token di server.
      Peran dengan wewenang approval atau admin WAJIB memiliki idle timeout (nilai ditetapkan di profil, maksimal 60 menit).
    rationale: Mengurangi risiko sesi dicuri atau ditinggal terbuka di perangkat bersama kantor desa.
    severity: high
    class: waivable
    gate: G5
    verification: Uji manual - token lama ditolak setelah logout; idle timeout terjadi sesuai konfigurasi.
    evidence: [config, test]
    supersedes: [AUTH-003]

  - id: BASE-SEC-004
    domain: SEC
    title: Proteksi brute-force pada endpoint autentikasi
    statement: >-
      Endpoint login, reset password, dan verifikasi OTP WAJIB diberi rate limit per akun dan per IP
      (default maksimal 5 percobaan gagal per menit) dan percobaan gagal WAJIB dicatat di log keamanan.
    rationale: Brute-force adalah ancaman commodity (B.1 #1); di v1 hanya berstatus rekomendasi.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test otomatis atau uji manual - percobaan ke-6 dalam 1 menit ditolak (HTTP 429).
    evidence: [code, test]
    refs: ["ASVS - Authentication"]

  - id: BASE-SEC-005
    domain: SEC
    title: Otorisasi server-side, deny-by-default, cek kepemilikan objek
    statement: >-
      Setiap request WAJIB diotorisasi di server berdasarkan peran DAN kepemilikan/yurisdiksi objek
      (mencegah IDOR). Akses yang tidak diizinkan eksplisit WAJIB ditolak. Menyembunyikan tombol di UI
      bukan kontrol akses.
    rationale: Eskalasi hak dan IDOR adalah risiko utama sistem multi-peran.
    severity: critical
    class: non_waivable
    gate: G5
    verification: >-
      Matriks uji otorisasi (peran x endpoint sensitif) termasuk akses objek milik pengguna lain;
      test negatif otomatis untuk endpoint Tier 1/3.
    evidence: [code, test]
    refs: ["ASVS - Access Control"]
    supersedes: [AUTHZ-001]

  - id: BASE-SEC-006
    domain: SEC
    title: Validasi input server-side dan query terparameterisasi
    statement: >-
      Semua input WAJIB divalidasi di server (tipe, panjang, format, nilai yang diizinkan).
      Akses database WAJIB memakai ORM/query builder atau parameterized query; penyusunan SQL dengan
      penggabungan string dari input pengguna dilarang.
    rationale: Mencegah injection dan data korup.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Grep raw query (DB::raw, whereRaw, string template SQL) dan review masing-masing; cek validator per endpoint tulis.
    evidence: [code]
    refs: ["ASVS - Validation, Sanitization and Encoding"]

  - id: BASE-SEC-007
    domain: SEC
    title: Pencegahan XSS
    statement: >-
      Output WAJIB di-escape secara default. Rendering HTML mentah (dangerouslySetInnerHTML, {!! !!})
      hanya BOLEH untuk konten yang sudah disanitasi dengan sanitizer allowlist (mis. DOMPurify/HTMLPurifier)
      dan setiap pemakaiannya tercatat di review.
    rationale: Stored XSS dari konten admin/penjual dapat mengambil alih sesi petugas.
    severity: high
    class: non_waivable
    gate: G5
    verification: Grep pemakaian render HTML mentah; tiap temuan punya sanitasi.
    evidence: [code]

  - id: BASE-SEC-008
    domain: SEC
    title: CSRF dan CORS
    statement: >-
      Autentikasi berbasis cookie WAJIB dilindungi CSRF. CORS WAJIB memakai allowlist origin eksplisit;
      wildcard (*) bersama credentials dilarang.
    rationale: Mencegah aksi atas nama pengguna dari situs lain.
    severity: high
    class: non_waivable
    gate: G5
    verification: Cek konfigurasi CORS/CSRF; uji request lintas origin ditolak.
    evidence: [config, test]

  - id: BASE-SEC-009
    domain: SEC
    title: Security headers
    statement: >-
      Respons production WAJIB menyertakan HSTS, X-Content-Type-Options: nosniff, proteksi framing
      (frame-ancestors atau X-Frame-Options) dan Referrer-Policy. Content-Security-Policy SEBAIKNYA diterapkan.
    rationale: Lapisan pertahanan murah terhadap clickjacking, sniffing, downgrade.
    severity: medium
    class: waivable
    gate: G6
    verification: Pemeriksaan header pada URL staging/production (curl -I atau scanner).
    evidence: [screenshot, report]

  - id: BASE-SEC-010
    domain: SEC
    title: Tidak ada secret di Git, termasuk history
    statement: >-
      Kredensial, API key, dan secret WAJIB tidak ada di repository maupun history-nya. .env dan
      setaranya WAJIB di-.gitignore. Secret scanning (mis. gitleaks) WAJIB dijalankan atas seluruh history
      sekali saat adopsi dan pada setiap PR di CI.
    rationale: Kredensial terekspos adalah ancaman commodity utama.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Laporan scan history bersih (atau temuan sudah dirotasi per SEC-011); job CI secret scan aktif.
    evidence: [report, ci_run]
    supersedes: [SEC-001]

  - id: BASE-SEC-011
    domain: SEC
    title: Rotasi segera atas secret yang terekspos
    statement: >-
      Secret yang pernah terekspos (commit, chat, screenshot) WAJIB segera dirotasi; menghapus dari file
      atau history saja tidak cukup. Rotasi dicatat (tanggal, secret apa, oleh siapa - tanpa nilai secret).
    rationale: Secret yang pernah publik harus dianggap sudah diketahui penyerang.
    severity: high
    class: non_waivable
    gate: G5
    verification: Log rotasi untuk setiap temuan scan SEC-010.
    evidence: [document]
    supersedes: [SEC-003]

  - id: BASE-SEC-012
    domain: SEC
    title: Pengelolaan secret per environment dan saat pergantian anggota
    statement: >-
      Secret WAJIB disimpan sebagai environment variable atau secret store hosting, terpisah per
      environment (dev/staging/production). Secret production WAJIB hanya diketahui peran yang tercatat,
      dan WAJIB dirotasi saat anggota dengan akses keluar dari tim serta saat handoff (MAINT-006).
    rationale: Memformalkan open item rotasi di v1.
    severity: high
    class: waivable
    gate: G7
    verification: Daftar secret (nama saja) + pemegang akses + tanggal rotasi terakhir.
    evidence: [document, config]
    supersedes: [SEC-002, SEC-004]

  - id: BASE-SEC-013
    domain: SEC
    title: Audit kerentanan dependency di CI
    statement: >-
      CI WAJIB menjalankan audit kerentanan dependency (composer audit, npm audit) pada setiap PR dan
      WAJIB gagal bila ada temuan high/critical tanpa waiver. Bot pembaruan dependency (Dependabot/Renovate)
      SEBAIKNYA diaktifkan.
    rationale: Dependency tidak di-patch adalah ancaman #1 di v1 tetapi tidak punya kontrol.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Konfigurasi CI + tautan run yang menunjukkan langkah audit.
    evidence: [config, ci_run]
    refs: ["OWASP Top 10 - Vulnerable and Outdated Components"]

  - id: BASE-SEC-014
    domain: SEC
    title: Lockfile di-commit
    statement: >-
      Lockfile (composer.lock, package-lock.json atau setaranya) WAJIB di-commit dan instalasi di CI/production
      WAJIB memakai lockfile (composer install, npm ci).
    rationale: Build yang dapat direproduksi dan diaudit.
    severity: medium
    class: waivable
    gate: G5
    verification: Lockfile ada di repo; skrip CI/deploy memakai perintah berbasis lockfile.
    evidence: [code, config]

  - id: BASE-SEC-015
    domain: SEC
    title: Hardening konfigurasi production
    statement: >-
      Production WAJIB berjalan dengan mode debug mati (APP_DEBUG=false / NODE_ENV=production), tanpa stack
      trace atau detail error ke klien, tanpa akun default/demo, dan tanpa seeder data demo.
    rationale: Kebocoran informasi dan akun default adalah salah konfigurasi paling umum.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Picu error di production-like env, pastikan respons generik; cek daftar akun.
    evidence: [config, screenshot]

  - id: BASE-SEC-016
    domain: SEC
    title: HTTPS di semua environment publik
    statement: >-
      Staging dan production WAJIB HTTPS dengan redirect HTTP->HTTPS, termasuk API antar sistem.
      Sertifikat WAJIB diperpanjang otomatis bila platform mendukung, dan masa berlakunya WAJIB dimonitor (OBS-005).
    rationale: Data Tier 1/3 tidak boleh lewat kanal plaintext.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Uji akses HTTP ter-redirect; cek mekanisme renewal dan monitor sertifikat.
    evidence: [config, screenshot]
    supersedes: [TLS-001, TLS-003]

  - id: BASE-SEC-017
    domain: SEC
    title: Antarmuka administratif tidak terekspos publik
    statement: >-
      Panel admin DB, SSH, dan panel hosting WAJIB tidak terbuka ke internet tanpa IP allowlist atau VPN/bastion.
      SSH WAJIB berbasis key; login root dengan password dilarang.
    rationale: Target scan otomatis paling umum.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Scan port dari luar jaringan; cek konfigurasi sshd.
    evidence: [config, report]
    supersedes: [NET-003]

  - id: BASE-SEC-018
    domain: SEC
    title: Isolasi database dan least privilege
    statement: >-
      Setiap sistem WAJIB memakai instance atau database terpisah dengan kredensial sendiri. User database
      aplikasi WAJIB bukan superuser dan hanya punya hak yang dibutuhkan. Bila beberapa sistem berbagi host,
      masing-masing WAJIB berjalan di user OS atau container terpisah dengan firewall deny-by-default antar sistem.
    rationale: Kompromi satu sistem tidak boleh membuka sistem lain.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Daftar user DB beserta grant; konfigurasi host/container.
    evidence: [config]
    supersedes: [NET-001, NET-002, AUTHZ-003]

  - id: BASE-SEC-019
    domain: SEC
    title: Integrasi antar sistem hanya lewat API terdokumentasi
    statement: >-
      Pertukaran data antar sistem WAJIB melalui API terdokumentasi dan terautentikasi (modul PUBLIC-API/API-CONSUMER).
      Akses langsung ke database sistem lain dan berbagi kredensial antar sistem dilarang.
    rationale: Mempertahankan arsitektur independent-domain.
    severity: critical
    class: non_waivable
    gate: G3
    verification: Architecture document dan konfigurasi koneksi tidak memuat kredensial DB sistem lain.
    evidence: [document, config]
    supersedes: [NET-004]

  - id: BASE-SEC-020
    domain: SEC
    title: Log peristiwa keamanan
    statement: >-
      Login berhasil/gagal, kegagalan otorisasi, perubahan peran/hak, dan semua aksi yang mengubah data Tier 1/3
      WAJIB dicatat dengan actor, waktu, aksi, objek (ID referensi), dan hasil.
    rationale: Investigasi dan non-repudiation.
    severity: high
    class: non_waivable
    gate: G5
    verification: Sampel entri log untuk tiap jenis peristiwa di staging.
    evidence: [code, screenshot]
    supersedes: [LOG-001]

  - id: BASE-SEC-021
    domain: SEC
    title: MFA untuk akun administrator sistem dan infrastruktur
    statement: >-
      Akun administrator sistem (hak penuh) dan akun infrastruktur (hosting, DNS, repository, registrar domain)
      WAJIB memakai MFA, disertai prosedur pemulihan terdokumentasi (recovery code tersimpan aman oleh mitra).
    rationale: Akun paling berharga; tanpa prosedur pemulihan MFA mengunci mitra setelah handoff.
    severity: high
    class: waivable
    gate: G7
    verification: Screenshot pengaturan MFA per akun (tanpa secret) + dokumen prosedur pemulihan.
    evidence: [screenshot, document]
    supersedes: [AUTH-004]

  - id: BASE-SEC-022
    domain: SEC
    title: Uji keamanan ringan sebelum UAT
    statement: >-
      Sebelum G6 WAJIB dilakukan: (1) scan otomatis OWASP ZAP baseline terhadap staging, dan (2) eksekusi matriks
      uji otorisasi manual (peran x endpoint sensitif). Temuan high dicatat sebagai defect S1/S2.
    rationale: Pengganti proporsional pentest formal.
    severity: high
    class: non_waivable
    gate: G6
    verification: Laporan ZAP + matriks uji terisi + tautan defect untuk temuan.
    evidence: [report]

  # ---------------- PRIV ----------------
  - id: BASE-PRIV-001
    domain: PRIV
    title: Inventaris dan klasifikasi data
    statement: >-
      Setiap entitas/field di Data Dictionary (artefak G2) WAJIB diberi label Tier 1-4, dan field data pribadi
      WAJIB ditandai beserta tujuan pemrosesannya.
    rationale: Kontrol lain bergantung pada klasifikasi.
    severity: high
    class: non_waivable
    gate: G3
    verification: Data Dictionary memuat kolom tier dan tujuan untuk setiap field.
    evidence: [document]

  - id: BASE-PRIV-002
    domain: PRIV
    title: Minimisasi data
    statement: >-
      Sistem WAJIB hanya mengumpulkan data pribadi yang tujuannya terdokumentasi di PRIV-001. Field tanpa
      tujuan WAJIB dihapus dari formulir dan skema.
    rationale: Prinsip UU PDP; data yang tidak dikumpulkan tidak bisa bocor.
    severity: medium
    class: waivable
    gate: G3
    verification: Bandingkan formulir/skema dengan Data Dictionary.
    evidence: [document, code]

  - id: BASE-PRIV-003
    domain: PRIV
    title: Data Tier 1/3 tidak bocor ke kanal sekunder
    statement: >-
      Data Tier 1/3 WAJIB tidak muncul di log aplikasi/error, URL atau query string, browser localStorage/sessionStorage,
      Cache Storage service worker, alat analitik/error tracker pihak ketiga, maupun file statis publik atau bundle frontend.
      Logger WAJIB dikonfigurasi dengan redaksi field sensitif (minimal: password, token, nik, no_kk, phone, address).
    rationale: Menggabungkan LOG-002 dan TPR-002 v1 serta menambah kanal yang terlewat.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test redaksi logger; grep pemakaian storage browser; inspeksi bundle dan file publik.
    evidence: [code, test]
    supersedes: [LOG-002, TPR-002]

  - id: BASE-PRIV-004
    domain: PRIV
    title: Tidak ada data pribadi asli di dev/staging
    statement: >-
      Environment dev dan staging WAJIB memakai data sintetis atau tersamarkan. Penggunaan data asli untuk UAT
      hanya BOLEH dengan persetujuan tertulis mitra, dengan kontrol setara production, dan WAJIB dihapus
      setelah UAT (dicatat tanggalnya).
    rationale: Hosting kampus (staging) bukan tempat data warga.
    severity: critical
    class: non_waivable
    gate: G6
    verification: Cek seeder/factory dan sampel data staging; bila ada data asli, cek dokumen persetujuan dan bukti penghapusan.
    evidence: [code, document]

  - id: BASE-PRIV-005
    domain: PRIV
    title: Pemberitahuan privasi
    statement: >-
      Sebelum data pribadi dikumpulkan, aplikasi WAJIB menampilkan atau menautkan pemberitahuan privasi berbahasa
      Indonesia yang memuat identitas Pengendali (mitra), tujuan, jenis data, masa retensi, dan kontak untuk hak subjek data.
    rationale: Kewajiban transparansi UU PDP.
    severity: high
    class: waivable
    gate: G6
    verification: Screenshot halaman/tautan pada formulir pengumpulan data.
    evidence: [screenshot]

  - id: BASE-PRIV-006
    domain: PRIV
    title: Prosedur hak subjek data
    statement: >-
      WAJIB ada prosedur terdokumentasi (boleh manual oleh operator) untuk permintaan akses, perbaikan, dan
      penghapusan data pribadi, termasuk siapa yang memproses dan cara memverifikasi identitas pemohon.
    rationale: Hak subjek data UU PDP.
    severity: medium
    class: waivable
    gate: G7
    verification: Dokumen prosedur di book guide Admin/Operator.
    evidence: [document]

  - id: BASE-PRIV-007
    domain: PRIV
    title: Retensi data pribadi
    statement: >-
      Masa retensi per kategori data pribadi WAJIB ditetapkan bersama mitra dan dijalankan (otomatis, atau prosedur
      manual terjadwal yang terdokumentasi).
    rationale: Di v1 retensi hanya diatur untuk log.
    severity: medium
    class: waivable
    gate: G7
    verification: Tabel retensi + implementasi/prosedur.
    evidence: [document, code]

  - id: BASE-PRIV-008
    domain: PRIV
    title: Kedudukan Pengendali dan pemroses ditetapkan tertulis
    statement: >-
      Sebelum data pribadi riil diproses, kedudukan mitra sebagai Pengendali Data dan tim sebagai pihak yang memproses
      atas namanya, beserta kontak resmi Pengendali untuk insiden, WAJIB disepakati tertulis.
    rationale: Notifikasi Pasal 46 adalah kewajiban Pengendali; harus jelas sebelum insiden.
    severity: high
    class: non_waivable
    gate: G6
    verification: Dokumen kesepakatan/berita acara dengan mitra.
    evidence: [document]

  - id: BASE-PRIV-009
    domain: PRIV
    title: Kesiapan notifikasi kegagalan pelindungan data
    statement: >-
      Tim WAJIB memiliki kontak eskalasi terisi dan template incident-report serta draf notifikasi Pasal 46 siap pakai
      sesuai timeline G.3, dan WAJIB menjalankan satu simulasi tabletop sebelum G7.
    rationale: Batas 3x24 jam tidak bisa dipenuhi bila proses baru dirancang saat insiden.
    severity: high
    class: non_waivable
    gate: G6
    verification: Kontak terisi di runbook; catatan simulasi tabletop (tanggal, peserta, temuan).
    evidence: [document]
    supersedes: [IR-001, IR-002, IR-003]

  # ---------------- QA ----------------
  - id: BASE-QA-001
    domain: QA
    title: Critical paths terdefinisi
    statement: >-
      Profil sistem WAJIB mendaftar critical paths (alur yang bila gagal membuat sistem tidak berguna atau merusak data),
      minimal 3, disetujui Program Coordinator.
    rationale: Dasar untuk test wajib, monitoring, dan UAT.
    severity: high
    class: non_waivable
    gate: G5
    verification: Daftar di profile.yaml beserta tanda persetujuan.
    evidence: [document]

  - id: BASE-QA-002
    domain: QA
    title: Test otomatis untuk critical paths
    statement: >-
      Setiap critical path WAJIB memiliki test otomatis level integrasi/feature (mis. Laravel Feature test, supertest)
      yang mencakup: alur sukses, penolakan otorisasi (peran/objek salah), dan penolakan validasi.
      Laporan coverage SEBAIKNYA dihasilkan di CI.
    rationale: Tanpa test, setiap perbaikan berisiko regresi diam-diam.
    severity: high
    class: non_waivable
    gate: G5
    verification: Pemetaan critical path -> file test; test lulus di CI.
    evidence: [test, ci_run]

  - id: BASE-QA-003
    domain: QA
    title: CI dan proteksi branch utama
    statement: >-
      Setiap PR WAJIB menjalankan CI (install berbasis lockfile, lint, test, build, SEC-010 secret scan, SEC-013 audit).
      Branch utama WAJIB terproteksi: merge hanya lewat PR dengan CI hijau dan minimal 1 review dari orang selain penulis.
    rationale: Penegakan otomatis lebih andal daripada disiplin manual.
    severity: high
    class: non_waivable
    gate: G5
    verification: Screenshot aturan proteksi branch + tautan run CI.
    evidence: [config, ci_run, screenshot]

  - id: BASE-QA-004
    domain: QA
    title: Klasifikasi defect bersama
    statement: >-
      Seluruh defect WAJIB diklasifikasikan S1-S4 sesuai framework 07 dan dilacak di issue tracker dengan label severity.
    rationale: Exit criteria membutuhkan bahasa severity yang sama lintas tim.
    severity: medium
    class: non_waivable
    gate: G5
    verification: Issue tracker memakai label S1-S4.
    evidence: [screenshot]

  - id: BASE-QA-005
    domain: QA
    title: Exit criteria rilis dipenuhi
    statement: >-
      Klaim G6 dan G7 WAJIB memenuhi exit criteria framework 07 (I.2).
    rationale: Mendefinisikan "siap rilis" secara objektif.
    severity: critical
    class: non_waivable
    gate: G6
    verification: Laporan gate memuat jumlah defect terbuka per severity dari issue tracker.
    evidence: [report]

  - id: BASE-QA-006
    domain: QA
    title: UAT oleh perwakilan pengguna nyata
    statement: >-
      UAT WAJIB dilakukan oleh perwakilan setiap peran pengguna nyata, memakai skenario per peran yang mencakup semua
      critical path, di staging dengan data sesuai PRIV-004; hasil dicatat sesuai artefak G6 Program Gates.
    rationale: Selaras G6 Program Gates; menambah cakupan per peran dan critical path.
    severity: high
    class: non_waivable
    gate: G6
    verification: Dokumen UAT execution berisi skenario per peran dan hasil.
    evidence: [document]

  - id: BASE-QA-007
    domain: QA
    title: Regresi dan smoke test sebelum deploy production
    statement: >-
      Sebelum setiap deploy production WAJIB: suite test otomatis lulus pada commit yang dirilis, dan setelah deploy
      WAJIB dijalankan smoke test checklist (critical paths) di production.
    rationale: Mencegah rilis merusak fitur yang sudah berjalan.
    severity: high
    class: non_waivable
    gate: G7
    verification: Go/no-go checklist terisi dengan tautan CI dan hasil smoke test.
    evidence: [ci_run, document]

  - id: BASE-QA-008
    domain: QA
    title: Matriks perangkat dan browser
    statement: >-
      Critical paths WAJIB diuji pada: Chrome Android (perangkat kelas menengah-bawah atau emulasi), serta Chrome
      dan Firefox desktop terbaru; tampilan WAJIB responsif pada lebar 360px.
    rationale: Warga dan wisatawan mengakses lewat ponsel.
    severity: medium
    class: waivable
    gate: G6
    verification: Catatan uji per perangkat/browser.
    evidence: [document, screenshot]

  - id: BASE-QA-009
    domain: QA
    title: Aksesibilitas dasar
    statement: >-
      Formulir SEBAIKNYA memiliki label yang terhubung ke input, kontras teks cukup, ukuran teks dasar minimal 16px
      pada mobile, dan pesan error berbahasa awam.
    rationale: Operator dan warga berlatar non-teknis.
    severity: low
    class: waivable
    gate: G6
    verification: Audit Lighthouse aksesibilitas atau checklist manual.
    evidence: [report]

  # ---------------- OBS ----------------
  - id: BASE-OBS-001
    domain: OBS
    title: Log terstruktur dengan skema bersama
    statement: >-
      Log aplikasi WAJIB berformat JSON dengan field: timestamp (ISO 8601 dengan offset), level (DEBUG|INFO|WARN|ERROR),
      event (snake_case), correlation_id, service (sid|sigap|cimart|vdash), env, actor (user ID/device ID/"system"), context (object).
      DEBUG WAJIB nonaktif di production.
    rationale: Dipertahankan dari OBS-001 v1 §3; ditambah field env.
    severity: high
    class: non_waivable
    gate: G5
    verification: Sampel log staging tervalidasi terhadap skema.
    evidence: [code, screenshot]

  - id: BASE-OBS-002
    domain: OBS
    title: Disiplin level log dan cakupan event
    statement: >-
      Level log WAJIB mengikuti konvensi OBS v1 §3.3. Setiap critical path WAJIB menghasilkan event INFO saat sukses dan
      ERROR saat gagal.
    rationale: Alerting berbasis level hanya berguna bila level dipakai benar.
    severity: medium
    class: waivable
    gate: G5
    verification: Pemetaan critical path -> nama event.
    evidence: [code]

  - id: BASE-OBS-003
    domain: OBS
    title: Correlation ID
    statement: >-
      Correlation ID (UUID v4) WAJIB dibangkitkan di titik masuk request (middleware) bila belum ada, dikembalikan di header
      X-Correlation-ID, disertakan di setiap entri log alur tersebut, dan diteruskan pada panggilan antar sistem.
    rationale: Penelusuran alur tanpa distributed tracing (keputusan v1 dipertahankan).
    severity: medium
    class: waivable
    gate: G5
    verification: Satu request staging dapat ditelusuri lewat correlation_id di log.
    evidence: [code, screenshot]

  - id: BASE-OBS-004
    domain: OBS
    title: Endpoint health dan readiness
    statement: >-
      Sistem WAJIB menyediakan /health (proses hidup) dan /ready (dependensi utama seperti DB dapat dijangkau),
      tanpa autentikasi dan tanpa membocorkan versi, konfigurasi, atau data.
    rationale: Dasar monitoring ketersediaan; v1 tidak punya sinyal "situs mati".
    severity: high
    class: non_waivable
    gate: G7
    verification: Request ke kedua endpoint di production; respons minimal.
    evidence: [code, screenshot]

  - id: BASE-OBS-005
    domain: OBS
    title: Uptime monitoring eksternal
    statement: >-
      Layanan monitoring eksternal (di luar host production) WAJIB memeriksa /health maksimal setiap 5 menit dan memantau
      masa berlaku sertifikat TLS, dengan alert push (OBS-007).
    rationale: Alert error-rate tidak akan menyala bila server mati total.
    severity: high
    class: non_waivable
    gate: G7
    verification: Screenshot konfigurasi monitor + bukti uji alert.
    evidence: [screenshot]

  - id: BASE-OBS-006
    domain: OBS
    title: Alert error dan resource
    statement: >-
      WAJIB ada alert untuk: lonjakan event ERROR (ambang ditetapkan di profil), penggunaan disk >= 85%, dan kegagalan
      backup (DATA-005).
    rationale: Deteksi sebelum berdampak ke warga.
    severity: medium
    class: waivable
    gate: G7
    verification: Konfigurasi alert + bukti uji tiap jenis alert.
    evidence: [config, screenshot]

  - id: BASE-OBS-007
    domain: OBS
    title: Routing alert dua jalur
    statement: >-
      Alert WAJIB dirutekan dua jalur: (1) alert teknis ke kontak teknis (tim selama support window, lalu dev penerus atau
      penyedia hosting); (2) hanya alert yang bisa ditindaklanjuti operator (mis. situs tidak bisa diakses) dikirim ke operator
      mitra dalam bahasa awam tanpa istilah teknis. Daftar penerima WAJIB tercatat di runbook.
    rationale: Mengirim alert teknis ke operator non-teknis menimbulkan alert fatigue (kritik v1 §6.2).
    severity: high
    class: non_waivable
    gate: G7
    verification: Tabel routing di runbook + contoh pesan operator.
    evidence: [document]

  - id: BASE-OBS-008
    domain: OBS
    title: Rotasi dan retensi log otomatis
    statement: >-
      Log WAJIB dirotasi dan dihapus otomatis. Retensi default: log keamanan (SEC-020) 90 hari, log aplikasi 30 hari;
      boleh diubah di profil sesuai kapasitas disk dan retensi PRIV-007.
    rationale: Hosting desa terbatas dan tidak ada pemeliharaan manual setelah handoff.
    severity: high
    class: non_waivable
    gate: G7
    verification: Konfigurasi rotasi (logrotate/channel daily/transport) + bukti file lama terhapus.
    evidence: [config]
    supersedes: [LOG-003]

  - id: BASE-OBS-009
    domain: OBS
    title: Runbook sistem
    statement: >-
      Setiap sistem WAJIB memiliki docs/awg/runbook.md (template) berisi: lokasi log, cara cek health, daftar event normal vs
      perlu investigasi, tindakan per jenis error, routing alert, kontak eskalasi, serta prosedur backup/restore dan rollback.
    rationale: Dipertahankan dari OBS-001 v1 §7, diperluas.
    severity: high
    class: non_waivable
    gate: G7
    verification: Dry-run - anggota tim lain menjalankan satu prosedur runbook tanpa bantuan penulis.
    evidence: [document]

  - id: BASE-OBS-010
    domain: OBS
    title: Metrik bisnis minimum
    statement: >-
      Sistem SEBAIKNYA menyajikan metrik bisnis minimum yang ditetapkan di profil (mis. surat diproses/hari, perangkat aktif,
      transaksi/hari) untuk laporan ke mitra.
    rationale: Bukti nilai sistem bagi stakeholder non-teknis.
    severity: low
    class: waivable
    gate: G7
    verification: Halaman admin/laporan menampilkan metrik.
    evidence: [screenshot]

  # ---------------- PERF ----------------
  - id: BASE-PERF-001
    domain: PERF
    title: Target respons endpoint kritis
    statement: >-
      Endpoint critical path WAJIB memenuhi p95 waktu respons server <= 1000 ms untuk baca dan <= 2000 ms untuk tulis
      pada konkurensi target (PERF-002) di environment setara production. Profil BOLEH memperketat; pelonggaran hanya via waiver.
    rationale: Mengganti "ditetapkan Tech Lead" di v1 dengan angka yang bisa diverifikasi.
    severity: high
    class: waivable
    gate: G6
    verification: Hasil uji beban PERF-002 menunjukkan p95 per endpoint.
    evidence: [report]

  - id: BASE-PERF-002
    domain: PERF
    title: Uji beban berbasis estimasi beban riil
    statement: >-
      Profil WAJIB mencantumkan estimasi puncak pengguna konkuren beserta dasar estimasinya. Uji beban (mis. k6) WAJIB
      dijalankan pada 2x estimasi puncak terhadap critical paths sebelum G7, dan hasilnya disimpan di docs/awg/reports/.
    rationale: Kata "proporsional" di v1 tidak bisa diverifikasi tanpa angka.
    severity: high
    class: waivable
    gate: G6
    verification: Skrip uji beban di repo + laporan hasil.
    evidence: [code, report]

  - id: BASE-PERF-003
    domain: PERF
    title: Pencegahan N+1 query
    statement: >-
      Query daftar beserta relasi WAJIB memakai eager loading/join. Deteksi lazy loading SEBAIKNYA diaktifkan di non-production
      (mis. Model::preventLazyLoading di Laravel). Pemeriksaan N+1 masuk checklist review.
    rationale: Dipertahankan dari PERF v1 §3.1.
    severity: medium
    class: waivable
    gate: G5
    verification: Konfigurasi deteksi atau log query halaman daftar critical path.
    evidence: [code, config]

  - id: BASE-PERF-004
    domain: PERF
    title: Indeks untuk kolom filter dan foreign key
    statement: >-
      Kolom yang dipakai sebagai filter, urutan, atau join pada critical path WAJIB diindeks; query critical path WAJIB diperiksa
      dengan EXPLAIN. (Catatan: PostgreSQL tidak otomatis mengindeks kolom foreign key.)
    rationale: Dipertahankan dari PERF v1 §3.2, digeneralisasi.
    severity: medium
    class: waivable
    gate: G5
    verification: Daftar indeks di migration + output EXPLAIN query utama.
    evidence: [code, report]

  - id: BASE-PERF-005
    domain: PERF
    title: Pagination dengan batas
    statement: >-
      Semua endpoint daftar WAJIB memakai pagination dengan ukuran halaman maksimum di sisi server (default maks 100).
    rationale: Volume data terus bertambah.
    severity: high
    class: non_waivable
    gate: G5
    verification: Request dengan per_page besar dibatasi server.
    evidence: [code, test]

  - id: BASE-PERF-006
    domain: PERF
    title: Anggaran performa frontend mobile
    statement: >-
      Halaman critical path WAJIB mencapai LCP <= 4.0 dtk pada Lighthouse mode mobile (target SEBAIKNYA <= 2.5 dtk);
      gambar WAJIB terkompresi dan responsif, dan elemen di luar viewport awal SEBAIKNYA lazy-load.
    rationale: Akses lewat data seluler di desa dan lokasi wisata (PERF v1 §4).
    severity: medium
    class: waivable
    gate: G6
    verification: Laporan Lighthouse per halaman critical path.
    evidence: [report]

  - id: BASE-PERF-007
    domain: PERF
    title: Connection pooling dan timeout
    statement: >-
      Koneksi database WAJIB memakai pool dengan batas maksimum terkonfigurasi. Panggilan keluar (DB, HTTP ke sistem lain,
      gateway) WAJIB memiliki timeout eksplisit.
    rationale: Mencegah habisnya koneksi dan request menggantung (generalisasi PERF v1 §5.1).
    severity: medium
    class: waivable
    gate: G5
    verification: Konfigurasi pool dan timeout.
    evidence: [config, code]

  - id: BASE-PERF-008
    domain: PERF
    title: Baseline performa production
    statement: >-
      Dalam 30 hari setelah deploy production pertama WAJIB dicatat baseline p50/p95/p99 critical path dan pemakaian
      CPU/RAM/disk normal.
    rationale: Dipertahankan dari PERF v1 §2.2.
    severity: low
    class: waivable
    gate: G7
    verification: Laporan baseline di docs/awg/reports/.
    evidence: [report]

  # ---------------- REL ----------------
  - id: BASE-REL-001
    domain: REL
    title: Environment terpisah dan setara
    statement: >-
      Dev, staging, dan production WAJIB terpisah (kode, DB, secret). Staging WAJIB memakai versi mayor runtime dan DB yang
      sama dengan production.
    rationale: Bug yang hanya muncul di production sering berasal dari beda versi.
    severity: high
    class: non_waivable
    gate: G5
    verification: Tabel versi per environment di profil.
    evidence: [document]

  - id: BASE-REL-002
    domain: REL
    title: Konfigurasi lewat environment dan .env.example lengkap
    statement: >-
      Konfigurasi yang berbeda antar environment WAJIB lewat environment variable. .env.example WAJIB memuat semua variabel
      dengan nilai contoh non-rahasia dan keterangan.
    rationale: Dev penerus harus bisa menjalankan sistem.
    severity: medium
    class: non_waivable
    gate: G5
    verification: Bandingkan variabel yang dibaca kode dengan .env.example.
    evidence: [code]

  - id: BASE-REL-003
    domain: REL
    title: Versi rilis dan changelog
    statement: >-
      Setiap deploy production WAJIB berasal dari tag versi (SemVer) dengan entri CHANGELOG.
    rationale: Rollback dan dukungan pasca-handoff butuh versi yang jelas.
    severity: medium
    class: waivable
    gate: G7
    verification: Tag dan CHANGELOG di repo.
    evidence: [code]

  - id: BASE-REL-004
    domain: REL
    title: Perubahan skema hanya lewat migration
    statement: >-
      Perubahan skema DB WAJIB lewat migration di repo yang direview. Migration destruktif (drop/rename/alter tipe) WAJIB
      didahului backup sesaat sebelum dijalankan di production.
    rationale: Skema yang dapat direproduksi dan perubahan yang aman.
    severity: high
    class: non_waivable
    gate: G5
    verification: Tidak ada perubahan skema manual; folder migration lengkap dari nol.
    evidence: [code]

  - id: BASE-REL-005
    domain: REL
    title: Deployment terdokumentasi dan dapat diulang
    statement: >-
      Deployment WAJIB dijalankan lewat skrip atau pipeline yang ada di repo, dengan Deployment Guide yang bisa dijalankan
      orang di luar tim.
    rationale: Selaras G7; deployment manual ad hoc tidak bisa diwariskan.
    severity: high
    class: non_waivable
    gate: G7
    verification: Anggota tim lain melakukan deploy ke staging hanya dari guide.
    evidence: [code, document]

  - id: BASE-REL-006
    domain: REL
    title: Prosedur rollback teruji
    statement: >-
      Prosedur rollback (versi aplikasi dan DB) WAJIB terdokumentasi dan dilatih minimal sekali di staging sebelum G7.
    rationale: Deploy gagal tanpa rollback = downtime panjang.
    severity: high
    class: non_waivable
    gate: G7
    verification: Catatan latihan rollback (tanggal, durasi, hasil).
    evidence: [document]

  - id: BASE-REL-007
    domain: REL
    title: Go/no-go checklist
    statement: >-
      Setiap deploy production WAJIB didahului go/no-go checklist (template) yang ditandatangani Tech Lead dan diketahui
      Program Coordinator, dan diakhiri verifikasi pasca-deploy (QA-007).
    rationale: Selaras G7 "verifikasi pasca deployment".
    severity: high
    class: non_waivable
    gate: G7
    verification: Checklist terisi per deploy di docs/awg/reports/.
    evidence: [document]

  - id: BASE-REL-008
    domain: REL
    title: Penilaian kapasitas hosting
    statement: >-
      Kondisi hosting production dan staging WAJIB didokumentasikan: spesifikasi (CPU/RAM/disk), pengelola, akses yang tersedia
      (SSH/panel), dukungan backup, auto-renew TLS, serta keterbatasan yang diketahui.
    rationale: Mengisi kontrol hosting yang hilang di v1 (TPR-001 tidak pernah ada).
    severity: high
    class: non_waivable
    gate: G6
    verification: Bagian hosting di profil/Architecture Document.
    evidence: [document]

  # ---------------- DATA ----------------
  - id: BASE-DATA-001
    domain: DATA
    title: Backup otomatis harian
    statement: >-
      Database dan file unggahan WAJIB di-backup otomatis minimal harian (RPO <= 24 jam).
    rationale: Di v1 hanya SID; transaksi CibendaMart dan data SIGAP juga bernilai.
    severity: critical
    class: non_waivable
    gate: G6
    verification: Jadwal backup + daftar file backup 7 hari terakhir.
    evidence: [config, screenshot]
    supersedes: [BAK-001]

  - id: BASE-DATA-002
    domain: DATA
    title: Backup offsite dan terenkripsi
    statement: >-
      Minimal satu salinan backup WAJIB disimpan di luar host production (lokasi atau penyedia berbeda). Backup yang memuat
      Tier 1/3 WAJIB terenkripsi, dan kuncinya disimpan terpisah dari backup.
    rationale: Backup di server yang sama ikut hilang bila server rusak.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Konfigurasi tujuan backup + bukti enkripsi.
    evidence: [config]
    supersedes: [BAK-003]

  - id: BASE-DATA-003
    domain: DATA
    title: Retensi backup
    statement: >-
      Retensi backup WAJIB minimal 7 harian, 4 mingguan, 3 bulanan. Profil BOLEH memperpanjang selama konsisten dengan
      PRIV-007; pengurangan karena kapasitas hanya lewat waiver.
    rationale: Memulihkan dari korupsi data yang baru disadari beberapa hari kemudian.
    severity: medium
    class: waivable
    gate: G7
    verification: Konfigurasi retensi.
    evidence: [config]

  - id: BASE-DATA-004
    domain: DATA
    title: Uji restore dan target RTO
    statement: >-
      Restore penuh dari backup offsite WAJIB diuji minimal sekali sebelum G7 ke environment terpisah, dengan RTO target
      <= 8 jam tercatat. Prosedur restore WAJIB ada di runbook, dan uji ulang SEBAIKNYA tiap 3 bulan.
    rationale: Backup yang tidak pernah di-restore belum terbukti.
    severity: high
    class: non_waivable
    gate: G7
    verification: Catatan uji restore (tanggal, durasi, verifikasi data).
    evidence: [document]
    supersedes: [BAK-004]

  - id: BASE-DATA-005
    domain: DATA
    title: Alert kegagalan backup
    statement: >-
      Kegagalan atau ketiadaan backup terjadwal WAJIB memicu alert ke jalur teknis (OBS-007).
    rationale: Backup yang diam-diam gagal baru diketahui saat dibutuhkan.
    severity: high
    class: waivable
    gate: G7
    verification: Bukti uji alert (simulasi backup gagal).
    evidence: [screenshot]

  # ---------------- MAINT ----------------
  - id: BASE-MAINT-001
    domain: MAINT
    title: Versi runtime dan framework masih didukung
    statement: >-
      Saat G7, versi runtime (PHP/Node), framework (Laravel/Express/React), dan DB WAJIB masih dalam masa dukungan keamanan.
      Tanggal EOL masing-masing WAJIB tercatat di handover (rujukan: endoflife.date).
    rationale: Sistem tanpa patch keamanan akan membusuk setelah handoff.
    severity: high
    class: waivable
    gate: G7
    verification: Tabel versi + tanggal EOL di handover.
    evidence: [document]

  - id: BASE-MAINT-002
    domain: MAINT
    title: Aset dan akun milik mitra
    statement: >-
      Domain, DNS, hosting, email layanan, repository, dan akun pihak ketiga (gateway, monitoring, notifikasi) WAJIB terdaftar
      atas nama atau akun organisasi mitra, bukan akun pribadi anggota tim, dan WAJIB tercantum di inventaris aset handover.
    rationale: Akun pribadi mahasiswa = sistem tersandera setelah lulus.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Inventaris aset (nama layanan, pemilik akun, tanpa password) dikonfirmasi mitra.
    evidence: [document]

  - id: BASE-MAINT-003
    domain: MAINT
    title: Kalender perpanjangan
    statement: >-
      Tanggal kedaluwarsa domain, hosting, sertifikat (bila manual), dan langganan berbayar WAJIB tercatat di handover beserta
      pengingat ke operator mitra.
    rationale: Kedaluwarsa domain/hosting = downtime total yang bisa dicegah.
    severity: high
    class: non_waivable
    gate: G7
    verification: Tabel kalender di handover + mekanisme pengingat.
    evidence: [document]

  - id: BASE-MAINT-004
    domain: MAINT
    title: Fitur containment untuk operator awam
    statement: >-
      Sistem SEBAIKNYA menyediakan: (1) mode maintenance yang dapat diaktifkan admin lewat UI, terlindungi autentikasi + log audit;
      (2) pemulihan akses admin yang aman tanpa akses DB langsung (mis. admin kedua atau recovery code, tercatat di log audit,
      tanpa reset via pertanyaan rahasia/email yang tidak terverifikasi); (3) kontak dukungan dan tanggal akhir support window
      di halaman admin.
    rationale: Dari AWG-SEC-006 §5; ditambah syarat keamanan karena fitur ini sendiri adalah permukaan serangan.
    severity: medium
    class: waivable
    gate: G7
    verification: Demo fitur + review keamanan alur pemulihan.
    evidence: [screenshot, code]

  - id: BASE-MAINT-005
    domain: MAINT
    title: Paket handover lengkap
    statement: >-
      Paket handover WAJIB memenuhi artefak G7 Program Gates dan template handover-checklist, termasuk: runbook, Deployment Guide,
      prosedur backup/restore, Known Issues, snapshot status.yaml, daftar waiver aktif sebagai keterbatasan, dan operator playbook.
    rationale: Menyatukan kebutuhan G7 dan AWG-SEC-006.
    severity: high
    class: non_waivable
    gate: G7
    verification: Checklist handover terisi dan diterima mitra.
    evidence: [document]

  - id: BASE-MAINT-006
    domain: MAINT
    title: Serah terima kredensial
    statement: >-
      Saat handoff semua kredensial production WAJIB dirotasi, diserahkan ke mitra lewat kanal aman (bukan chat biasa), dan
      akses anggota tim WAJIB dicabut paling lambat di akhir support window.
    rationale: Mencegah akses tersisa yang tidak terkendali.
    severity: critical
    class: non_waivable
    gate: G7
    verification: Berita acara serah terima (daftar kredensial, tanpa nilai) + bukti pencabutan akses.
    evidence: [document]

  - id: BASE-MAINT-007
    domain: MAINT
    title: Support window dideklarasikan
    statement: >-
      Jenis support window (3 bulan tanpa dev penerus / 1 bulan knowledge transfer), PIC tim, dan tanggal berakhirnya WAJIB
      tertulis di handover dan halaman admin aplikasi.
    rationale: Mencegah ekspektasi tidak realistis (AWG-SEC-006 §3).
    severity: medium
    class: non_waivable
    gate: G7
    verification: Dokumen handover + screenshot halaman admin.
    evidence: [document, screenshot]

  - id: BASE-MAINT-008
    domain: MAINT
    title: Panduan patching untuk penerus
    statement: >-
      Book guide Development Selanjutnya WAJIB memuat langkah memperbarui dependency dengan aman (cek audit, update, jalankan test,
      deploy staging, deploy production) dan rekomendasi frekuensi pemeriksaan keamanan bulanan.
    rationale: Pemeliharaan keamanan jangka panjang.
    severity: medium
    class: waivable
    gate: G7
    verification: Bagian panduan di book guide.
    evidence: [document]
```

### K.2 Modul — masing-masing ke `catalog/modules/<MODULE>.yaml`

Setiap file berformat:
```yaml
catalog: module
module: <MODULE>
version: 2.0.0
title: <judul>
applies_when: <kriteria aktivasi>
detection_hints: [<petunjuk di kode untuk deteksi saat adopsi>]
controls: [...]
```

#### `PII.yaml`
```yaml
catalog: module
module: PII
version: 2.0.0
title: Data pribadi Tier 1
applies_when: Sistem menyimpan data pribadi Tier 1 (NIK, KK, nama+alamat, nomor HP, alamat pengiriman) milik warga atau pengguna.
detection_hints: [kolom nik/no_kk/phone/address di migration, formulir pendaftaran warga/pembeli]
controls:
  - id: MOD-PII-001
    module: PII
    title: Log akses baca data pribadi oleh petugas
    statement: >-
      Akses petugas/admin ke halaman detail data pribadi Tier 1 milik orang lain WAJIB dicatat (actor, subjek berupa ID referensi, waktu).
    rationale: Mendeteksi penyalahgunaan oleh orang dalam (B.1 #2).
    severity: high
    class: waivable
    gate: G5
    verification: Sampel log akses di staging.
    evidence: [code, screenshot]
  - id: MOD-PII-002
    module: PII
    title: Masking identitas di tampilan daftar
    statement: >-
      NIK dan No. KK WAJIB ditampilkan tersamarkan di daftar dan tabel (mis. 3201********0001); nilai penuh hanya pada detail
      untuk peran yang berwenang.
    rationale: Mengurangi eksposur lewat layar dan screenshot.
    severity: medium
    class: waivable
    gate: G5
    verification: Screenshot daftar dan detail per peran.
    evidence: [screenshot]
  - id: MOD-PII-003
    module: PII
    title: Ekspor data pribadi terkontrol
    statement: >-
      Ekspor (Excel/PDF/CSV) berisi data pribadi WAJIB dibatasi peran berwenang, dicatat di log audit, dan file hasil ekspor
      WAJIB tidak disimpan di storage publik.
    rationale: Ekspor adalah jalur kebocoran massal termudah.
    severity: high
    class: non_waivable
    gate: G5
    verification: Uji ekspor oleh peran tidak berwenang ditolak; lokasi file ekspor.
    evidence: [code, test]
  - id: MOD-PII-004
    module: PII
    title: Enkripsi at-rest kolom identitas
    statement: >-
      Kolom NIK dan No. KK SEBAIKNYA dienkripsi di level aplikasi (mis. cast encrypted Laravel) dengan blind index bila perlu
      pencarian; minimal, volume disk dan backup WAJIB terenkripsi (DATA-002).
    rationale: Membatasi dampak bila dump DB bocor.
    severity: medium
    class: waivable
    gate: G6
    verification: Skema/cast kolom atau dokumentasi keputusan (ADR) bila tidak dienkripsi.
    evidence: [code, document]
  - id: MOD-PII-005
    module: PII
    title: Penonaktifan dan penghapusan akun
    statement: >-
      WAJIB terdefinisi apa yang terjadi pada data pribadi saat akun dinonaktifkan atau dihapus (dihapus, dianonimkan, atau
      disimpan karena kewajiban arsip, dengan alasan), selaras PRIV-006/007.
    rationale: Hak penghapusan berbenturan dengan kewajiban arsip administrasi desa; harus diputuskan eksplisit.
    severity: medium
    class: waivable
    gate: G7
    verification: Dokumen keputusan + implementasi.
    evidence: [document, code]
```

#### `APPROVAL-WORKFLOW.yaml`
```yaml
catalog: module
module: APPROVAL-WORKFLOW
version: 2.0.0
title: Alur persetujuan multi-tahap berbasis peran/yurisdiksi
applies_when: Sistem memiliki entitas yang berpindah status melalui persetujuan beberapa peran (mis. surat RT -> RW -> Kadus -> Kasi/Kaur).
detection_hints: [kolom status dengan nilai *_approved/*_rejected, tabel approval/riwayat, middleware peran per tahap]
controls:
  - id: MOD-APPROVAL-WORKFLOW-001
    module: APPROVAL-WORKFLOW
    title: State machine eksplisit
    statement: >-
      Transisi status yang diizinkan WAJIB didefinisikan di satu tempat (state machine/enum + peta transisi). Server WAJIB
      menolak transisi yang tidak terdaftar, dan setiap transisi valid maupun minimal satu transisi tidak valid per status
      WAJIB memiliki test.
    rationale: Mencegah lompat tahap.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Lokasi definisi transisi + daftar test transisi.
    evidence: [code, test]
  - id: MOD-APPROVAL-WORKFLOW-002
    module: APPROVAL-WORKFLOW
    title: Re-validasi peran dan yurisdiksi pada setiap aksi
    statement: >-
      Setiap aksi approve/reject WAJIB memvalidasi ulang di server bahwa peran DAN yurisdiksi aktor (mis. rt_id/rw_id/hamlet_id)
      cocok dengan objek, terlepas dari gating UI. Query daftar antrean per tahap WAJIB di-scope ke yurisdiksi aktor di level query.
    rationale: Risiko utama SID di v1 (AUTHZ-002).
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test negatif - aktor yurisdiksi lain ditolak (403) dan tidak melihat objek di daftar.
    evidence: [test]
    supersedes: [AUTHZ-002]
  - id: MOD-APPROVAL-WORKFLOW-003
    module: APPROVAL-WORKFLOW
    title: Pemisahan tugas
    statement: >-
      Aktor WAJIB tidak dapat menyetujui pengajuannya sendiri. Satu akun yang memegang lebih dari satu peran tahap SEBAIKNYA
      tidak dapat menyetujui dua tahap berurutan pada objek yang sama, kecuali kebijakan mitra mengizinkan dan dicatat di profil.
    rationale: Mencegah satu orang meloloskan seluruh rantai.
    severity: high
    class: waivable
    gate: G5
    verification: Test atau uji manual.
    evidence: [test]
  - id: MOD-APPROVAL-WORKFLOW-004
    module: APPROVAL-WORKFLOW
    title: Jejak audit transisi tidak dapat diubah
    statement: >-
      Setiap transisi WAJIB tercatat (aktor, waktu, status asal -> tujuan, catatan) di tabel riwayat append-only yang tidak
      dapat diubah atau dihapus lewat aplikasi.
    rationale: Riwayat approval adalah catatan resmi tindakan administratif.
    severity: high
    class: non_waivable
    gate: G5
    verification: Tidak ada endpoint update/delete untuk riwayat; review model.
    evidence: [code]
  - id: MOD-APPROVAL-WORKFLOW-005
    module: APPROVAL-WORKFLOW
    title: Aman terhadap aksi bersamaan
    statement: >-
      Transisi WAJIB atomik dengan pemeriksaan status saat ini di dalam transaksi (mis. UPDATE ... WHERE status = <status_diharapkan>
      atau row lock), sehingga dua aksi bersamaan tidak menghasilkan dua transisi.
    rationale: Dua petugas menekan approve hampir bersamaan.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test konkurensi atau review kode transaksi.
    evidence: [code, test]
  - id: MOD-APPROVAL-WORKFLOW-006
    module: APPROVAL-WORKFLOW
    title: Nomor resmi dibangkitkan atomik
    statement: >-
      Nomor/identifier resmi yang diterbitkan di akhir alur WAJIB dibangkitkan atomik di dalam transaksi dan dijamin unik oleh
      constraint unik di database; kebijakan celah nomor (boleh/tidak) WAJIB didokumentasikan.
    rationale: Nomor ganda pada dokumen resmi merusak keabsahan.
    severity: high
    class: non_waivable
    gate: G5
    verification: Constraint unik di migration + test pembangkitan bersamaan.
    evidence: [code, test]
```

#### `PAYMENT.yaml`
```yaml
catalog: module
module: PAYMENT
version: 2.0.0
title: Transaksi dan pembayaran
applies_when: Sistem membuat order/transaksi berbayar, baik lewat payment gateway maupun transfer manual.
detection_hints: [tabel orders/transactions/payments, endpoint checkout, konfigurasi gateway, unggah bukti transfer]
controls:
  - id: MOD-PAYMENT-001
    module: PAYMENT
    title: Tidak menyimpan data kartu
    statement: >-
      Data kartu (nomor kartu, CVV, tanggal kedaluwarsa) WAJIB tidak pernah melewati atau tersimpan di server sistem; pembayaran
      WAJIB memakai halaman hosted/tokenisasi penyedia jasa pembayaran berizin Bank Indonesia.
    rationale: Mengganti "setara PCI" di v1 yang tidak realistis.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Review alur checkout dan skema DB.
    evidence: [code]
  - id: MOD-PAYMENT-002
    module: PAYMENT
    title: Status pembayaran diverifikasi server-side
    statement: >-
      Status lunas WAJIB hanya ditetapkan dari notifikasi server-to-server (webhook) yang tanda tangannya diverifikasi dan/atau
      dari pemeriksaan status ke API penyedia; parameter redirect di sisi klien WAJIB tidak dipercaya.
    rationale: Pemalsuan status bayar.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test webhook dengan tanda tangan salah ditolak.
    evidence: [code, test]
  - id: MOD-PAYMENT-003
    module: PAYMENT
    title: Idempotensi webhook
    statement: >-
      Pemrosesan webhook/konfirmasi pembayaran WAJIB idempoten (referensi transaksi unik); notifikasi ganda tidak boleh memproses
      order dua kali.
    rationale: Penyedia mengirim ulang notifikasi.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test mengirim notifikasi yang sama dua kali.
    evidence: [test]
  - id: MOD-PAYMENT-004
    module: PAYMENT
    title: Nominal dihitung di server
    statement: >-
      Total, harga, ongkos, dan diskon WAJIB dihitung di server dari data DB; nilai harga dari klien WAJIB diabaikan.
    rationale: Manipulasi harga lewat request.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test mengirim harga palsu tidak memengaruhi total.
    evidence: [test]
  - id: MOD-PAYMENT-005
    module: PAYMENT
    title: State machine order dan kedaluwarsa
    statement: >-
      Order WAJIB memiliki state machine eksplisit (mis. pending -> paid -> processing -> shipped -> completed, serta cancelled/expired),
      dan order belum bayar WAJIB kedaluwarsa otomatis serta melepas reservasi stok.
    rationale: Stok terkunci oleh order yang ditinggalkan.
    severity: high
    class: non_waivable
    gate: G5
    verification: Lokasi definisi state + test kedaluwarsa.
    evidence: [code, test]
  - id: MOD-PAYMENT-006
    module: PAYMENT
    title: Rekonsiliasi
    statement: >-
      WAJIB ada laporan atau prosedur rekonsiliasi berkala antara order di sistem dan catatan penyedia pembayaran/rekening.
    rationale: Selisih uang harus terdeteksi.
    severity: medium
    class: waivable
    gate: G7
    verification: Prosedur di book guide admin + contoh laporan.
    evidence: [document]
  - id: MOD-PAYMENT-007
    module: PAYMENT
    title: Pembayaran manual (bila dipakai)
    statement: >-
      Bila memakai transfer manual: bukti transfer WAJIB mengikuti modul FILE-UPLOAD, konfirmasi hanya oleh peran berwenang,
      dan setiap konfirmasi/penolakan WAJIB tercatat di log audit.
    rationale: Jalur sementara selama gateway belum diputuskan.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test peran tidak berwenang ditolak + sampel log audit.
    evidence: [test, screenshot]
  - id: MOD-PAYMENT-008
    module: PAYMENT
    title: Pemisahan kunci sandbox dan production
    statement: >-
      Non-production WAJIB memakai kunci sandbox penyedia; kunci production WAJIB hanya ada di environment production.
    rationale: Transaksi uji tidak boleh menyentuh uang nyata, dan kunci production tidak boleh bocor ke staging.
    severity: high
    class: non_waivable
    gate: G7
    verification: Konfigurasi per environment (nama variabel, tanpa nilai).
    evidence: [config]
```

#### `FILE-UPLOAD.yaml`
```yaml
catalog: module
module: FILE-UPLOAD
version: 2.0.0
title: Unggah file oleh pengguna
applies_when: Pengguna dapat mengunggah file (gambar produk, lampiran surat, bukti transfer, dokumen).
detection_hints: [input type=file, multer, $request->file(), Storage::put, kolom *_path/*_url]
controls:
  - id: MOD-FILE-UPLOAD-001
    module: FILE-UPLOAD
    title: Validasi tipe dan ukuran file
    statement: >-
      File WAJIB divalidasi dengan allowlist ekstensi DAN deteksi tipe dari konten (MIME sniffing), dengan batas ukuran.
      SVG/HTML WAJIB ditolak kecuali disanitasi.
    rationale: Unggahan berbahaya (web shell, XSS via SVG).
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test unggah file berbahaya dan file kebesaran ditolak.
    evidence: [code, test]
  - id: MOD-FILE-UPLOAD-002
    module: FILE-UPLOAD
    title: Penyimpanan aman
    statement: >-
      File WAJIB disimpan di lokasi yang tidak dapat dieksekusi server, dengan nama acak buatan server; nama file dari pengguna
      WAJIB tidak dipakai sebagai path.
    rationale: Path traversal dan eksekusi file.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Review konfigurasi storage dan kode penamaan.
    evidence: [code, config]
  - id: MOD-FILE-UPLOAD-003
    module: FILE-UPLOAD
    title: Re-encode gambar
    statement: >-
      Gambar SEBAIKNYA di-re-encode dan diubah ukurannya di server (menghapus metadata EXIF termasuk lokasi GPS).
    rationale: Privasi (lokasi rumah dari foto) dan performa (PERF-006).
    severity: medium
    class: waivable
    gate: G5
    verification: Unggah foto ber-EXIF, unduh hasil, metadata hilang.
    evidence: [test]
  - id: MOD-FILE-UPLOAD-004
    module: FILE-UPLOAD
    title: File privat lewat endpoint berotorisasi
    statement: >-
      File yang memuat data Tier 1/3 (lampiran surat, bukti transfer) WAJIB disajikan lewat endpoint berotorisasi atau signed URL
      berumur pendek, bukan URL publik permanen.
    rationale: URL publik bisa ditebak atau tersebar.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Akses URL file oleh pengguna lain/tanpa login ditolak.
    evidence: [test]
  - id: MOD-FILE-UPLOAD-005
    module: FILE-UPLOAD
    title: Kuota unggah
    statement: >-
      Unggahan SEBAIKNYA dibatasi kuota/rate per pengguna, dan pemakaian storage unggahan WAJIB masuk pemantauan disk (OBS-006).
    rationale: Disk hosting desa terbatas.
    severity: medium
    class: waivable
    gate: G6
    verification: Konfigurasi limit.
    evidence: [config]
```

#### `BULK-IMPORT.yaml`
```yaml
catalog: module
module: BULK-IMPORT
version: 2.0.0
title: Import/ekspor massal Excel/CSV
applies_when: Sistem mengimpor atau mengekspor data massal via Excel/CSV.
detection_hints: [maatwebsite/excel, phpspreadsheet, xlsx/exceljs/papaparse, endpoint import]
controls:
  - id: MOD-BULK-IMPORT-001
    module: BULK-IMPORT
    title: Validasi per baris dengan laporan
    statement: >-
      Import WAJIB memvalidasi setiap baris dengan aturan yang sama dengan input manual dan menghasilkan laporan baris yang ditolak beserta alasannya.
    rationale: Integritas data dari import (ancaman B.1 #5, tanpa kontrol di v1).
    severity: high
    class: non_waivable
    gate: G5
    verification: Test file dengan baris rusak.
    evidence: [test]
  - id: MOD-BULK-IMPORT-002
    module: BULK-IMPORT
    title: Atomik dan deteksi duplikat
    statement: >-
      Import WAJIB atomik (semua atau tidak sama sekali) atau eksplisit parsial dengan laporan, dan WAJIB mendeteksi duplikat
      berdasarkan kunci alami (mis. NIK).
    rationale: Import setengah jalan meninggalkan data tidak konsisten.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test import gagal di tengah tidak meninggalkan data parsial.
    evidence: [test]
  - id: MOD-BULK-IMPORT-003
    module: BULK-IMPORT
    title: Cegah formula injection pada ekspor
    statement: >-
      Ekspor CSV/Excel WAJIB menetralkan sel yang diawali =, +, -, @ (mis. prefiks tanda kutip tunggal).
    rationale: Formula berbahaya dijalankan di komputer petugas.
    severity: medium
    class: non_waivable
    gate: G5
    verification: Test ekspor nilai berawalan =.
    evidence: [test]
  - id: MOD-BULK-IMPORT-004
    module: BULK-IMPORT
    title: Batas ukuran dan pemrosesan
    statement: >-
      Import WAJIB memiliki batas ukuran file dan jumlah baris; import besar SEBAIKNYA diproses di queue.
    rationale: Mencegah request timeout dan kehabisan memori.
    severity: medium
    class: waivable
    gate: G5
    verification: Konfigurasi batas.
    evidence: [config]
```

#### `IOT-INGEST.yaml`
```yaml
catalog: module
module: IOT-INGEST
version: 2.0.0
title: Ingestion data dari perangkat (edge/IoT)
applies_when: Perangkat fisik (mis. ESP8266/ESP32) mengirim data ke backend sistem.
detection_hints: [endpoint ingest/telemetry/sensor, tabel readings, kode firmware di repo, API key perangkat]
controls:
  - id: MOD-IOT-INGEST-001
    module: IOT-INGEST
    title: Kredensial per perangkat
    statement: >-
      Setiap perangkat WAJIB memiliki kredensial sendiri yang bisa dicabut individual; satu kunci bersama untuk semua perangkat dilarang.
    rationale: Satu perangkat dicuri tidak boleh membuka semua.
    severity: high
    class: non_waivable
    gate: G5
    verification: Skema tabel perangkat + uji pencabutan.
    evidence: [code, test]
  - id: MOD-IOT-INGEST-002
    module: IOT-INGEST
    title: Endpoint tulis-saja dengan validasi ketat
    statement: >-
      Endpoint ingestion WAJIB hanya menerima penulisan (tanpa akses baca) dan WAJIB memvalidasi skema serta rentang nilai fisik
      yang masuk akal; nilai di luar rentang WAJIB ditolak atau ditandai, bukan diterima diam-diam.
    rationale: Data perangkat adalah input tidak tepercaya (TLS-002 v1).
    severity: high
    class: non_waivable
    gate: G5
    verification: Test payload rusak dan di luar rentang.
    evidence: [test]
    supersedes: [TLS-002]
  - id: MOD-IOT-INGEST-003
    module: IOT-INGEST
    title: Integritas transport
    statement: >-
      Perangkat WAJIB mengirim via TLS. Bila perangkat terbukti tidak mampu TLS secara andal, payload WAJIB ditandatangani
      (mis. HMAC per perangkat dengan timestamp) dan keputusan itu dicatat sebagai ADR.
    rationale: Kemampuan TLS ESP8266 terbatas; integritas tetap wajib.
    severity: high
    class: waivable
    gate: G5
    verification: Konfigurasi firmware/endpoint atau ADR + verifikasi signature di server.
    evidence: [code, document]
  - id: MOD-IOT-INGEST-004
    module: IOT-INGEST
    title: Rate limit, ukuran payload, dan anti-duplikasi
    statement: >-
      Ingestion WAJIB dibatasi rate per perangkat dan ukuran payload; setiap pembacaan WAJIB punya kunci unik
      (device_id + timestamp/sequence) agar kiriman ulang tidak menggandakan data. Waktu terima server WAJIB disimpan terpisah.
    rationale: Kiriman ulang saat sinyal putus-sambung.
    severity: medium
    class: non_waivable
    gate: G5
    verification: Test kiriman ganda.
    evidence: [test]
  - id: MOD-IOT-INGEST-005
    module: IOT-INGEST
    title: Alert perangkat tidak melapor
    statement: >-
      WAJIB ada alert bila perangkat tidak mengirim data melebihi ambang yang ditetapkan di profil (default 24 jam).
    rationale: Dari OBS v1 §6.3.
    severity: high
    class: waivable
    gate: G7
    verification: Bukti uji alert.
    evidence: [screenshot]
  - id: MOD-IOT-INGEST-006
    module: IOT-INGEST
    title: Perilaku buffer offline teruji
    statement: >-
      Kapasitas buffer lokal perangkat dan perilaku saat penuh (overwrite/stop) WAJIB didokumentasikan dan diuji; kehilangan data
      WAJIB tidak terjadi diam-diam (perangkat melaporkan jumlah data yang terbuang).
    rationale: Dari BAK-002 v1.
    severity: high
    class: waivable
    gate: G6
    verification: Laporan uji offline.
    evidence: [report]
    supersedes: [BAK-002]
```

#### `PUBLIC-API.yaml`
```yaml
catalog: module
module: PUBLIC-API
version: 2.0.0
title: API yang dikonsumsi sistem lain
applies_when: Sistem menyediakan API untuk dikonsumsi sistem lain (mis. data agregat untuk Village Dashboard).
detection_hints: [route /api/v*/ untuk konsumen eksternal, API key konsumen, dokumen OpenAPI]
controls:
  - id: MOD-PUBLIC-API-001
    module: PUBLIC-API
    title: Kontrak API terdokumentasi dan berversi
    statement: >-
      API untuk sistem lain WAJIB didokumentasikan (OpenAPI atau setara) dan berversi di path (mis. /api/v1); perubahan
      yang merusak kompatibilitas WAJIB memakai versi baru.
    rationale: Selaras G3 API Specification.
    severity: high
    class: non_waivable
    gate: G3
    verification: File spesifikasi di repo.
    evidence: [document]
  - id: MOD-PUBLIC-API-002
    module: PUBLIC-API
    title: Autentikasi per konsumen, hanya-baca
    statement: >-
      Setiap konsumen WAJIB memakai kredensial sendiri ber-scope hanya-baca yang dapat dicabut.
    rationale: NET-004 v1.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Test tanpa/dengan kredensial salah ditolak; test operasi tulis ditolak.
    evidence: [test]
  - id: MOD-PUBLIC-API-003
    module: PUBLIC-API
    title: Hanya data yang disepakati
    statement: >-
      Respons WAJIB hanya memuat field yang tercantum di kontrak; data Tier 1 WAJIB tidak dikirim kecuali kontrak secara eksplisit
      menyetujuinya dengan dasar PRIV-001, dan data agregat WAJIB diutamakan.
    rationale: Dashboard tidak butuh data individu.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Bandingkan respons aktual dengan kontrak.
    evidence: [test]
  - id: MOD-PUBLIC-API-004
    module: PUBLIC-API
    title: Rate limit API
    statement: >-
      API WAJIB diberi rate limit per konsumen.
    rationale: Melindungi sistem sumber dari konsumen yang salah konfigurasi.
    severity: medium
    class: waivable
    gate: G5
    verification: Konfigurasi rate limit.
    evidence: [config]
```

#### `API-CONSUMER.yaml`
```yaml
catalog: module
module: API-CONSUMER
version: 2.0.0
title: Mengonsumsi API sistem lain
applies_when: Sistem mengambil data dari API sistem lain (mis. Village Dashboard).
detection_hints: [fetch/axios ke domain sistem lain, variabel env URL/API key sistem lain]
controls:
  - id: MOD-API-CONSUMER-001
    module: API-CONSUMER
    title: Kredensial tidak di bundle frontend
    statement: >-
      Kredensial API sistem lain WAJIB disimpan dan dipakai di sisi server/proxy; variabel env yang dibundel ke frontend
      (mis. VITE_*, REACT_APP_*) bersifat publik dan WAJIB tidak berisi kredensial.
    rationale: Kesalahan paling umum pada dashboard berbasis React.
    severity: critical
    class: non_waivable
    gate: G5
    verification: Inspeksi bundle produksi untuk string kredensial.
    evidence: [code, report]
  - id: MOD-API-CONSUMER-002
    module: API-CONSUMER
    title: Toleran terhadap gangguan sumber
    statement: >-
      Panggilan ke sistem sumber WAJIB memiliki timeout dan retry terbatas dengan backoff; saat sumber tidak tersedia, tampilan
      WAJIB menunjukkan data terakhir beserta penanda waktu/"data tidak terbaru", bukan error kosong.
    rationale: Satu sistem sumber down tidak boleh menjatuhkan dashboard.
    severity: medium
    class: waivable
    gate: G5
    verification: Uji dengan sumber dimatikan.
    evidence: [test, screenshot]
  - id: MOD-API-CONSUMER-003
    module: API-CONSUMER
    title: Tidak menyimpan ulang data Tier 1
    statement: >-
      Konsumen WAJIB tidak menyimpan permanen data Tier 1 yang diterima dari sistem lain.
    rationale: Mencegah salinan data pribadi tak terkendali.
    severity: high
    class: non_waivable
    gate: G5
    verification: Review skema/penyimpanan konsumen.
    evidence: [code]
```

#### `CMS.yaml`
```yaml
catalog: module
module: CMS
version: 2.0.0
title: Konten publik yang dikelola admin
applies_when: Admin/operator menerbitkan konten publik (berita, pengumuman, profil, produk) dengan editor teks/rich text.
detection_hints: [tabel posts/news/announcements/pages, editor rich text (TipTap/Quill/CKEditor/TinyMCE)]
controls:
  - id: MOD-CMS-001
    module: CMS
    title: Sanitasi rich text di server
    statement: >-
      Konten rich text WAJIB disanitasi di server dengan allowlist tag/atribut sebelum disimpan atau dirender.
    rationale: Stored XSS ke pengunjung publik dan petugas.
    severity: high
    class: non_waivable
    gate: G5
    verification: Test menyimpan <script>/onerror tidak tereksekusi.
    evidence: [test]
  - id: MOD-CMS-002
    module: CMS
    title: Hak terbit dan jejak perubahan
    statement: >-
      Hanya peran berwenang yang dapat menerbitkan/mengubah konten publik, dan setiap perubahan WAJIB tercatat (siapa, kapan).
    rationale: Integritas konten Tier 4 (pencegahan defacement/hoaks atas nama desa).
    severity: medium
    class: non_waivable
    gate: G5
    verification: Test peran tanpa hak ditolak + sampel log.
    evidence: [test]
```

#### `NOTIFY.yaml`
```yaml
catalog: module
module: NOTIFY
version: 2.0.0
title: Notifikasi keluar (WhatsApp/email/SMS/push)
applies_when: Sistem mengirim notifikasi ke pengguna melalui layanan pihak ketiga.
detection_hints: [mailer config, WhatsApp/SMS gateway SDK, queue job notifikasi]
controls:
  - id: MOD-NOTIFY-001
    module: NOTIFY
    title: Kegagalan tercatat dan diulang terbatas
    statement: >-
      Pengiriman notifikasi WAJIB lewat queue/job dengan retry terbatas; kegagalan akhir WAJIB tercatat sebagai ERROR (OBS-002)
      dan tidak menggagalkan transaksi utama.
    rationale: Gateway eksternal tidak andal.
    severity: medium
    class: waivable
    gate: G5
    verification: Uji dengan gateway dimatikan.
    evidence: [test]
  - id: MOD-NOTIFY-002
    module: NOTIFY
    title: Isi notifikasi minimal
    statement: >-
      Isi notifikasi WAJIB tidak memuat data Tier 1 melebihi yang perlu (mis. tanpa NIK); gunakan tautan ke aplikasi yang
      memerlukan login untuk detail.
    rationale: Pesan WhatsApp/email mudah diteruskan dan dibaca orang lain.
    severity: high
    class: non_waivable
    gate: G5
    verification: Review template notifikasi.
    evidence: [code]
  - id: MOD-NOTIFY-003
    module: NOTIFY
    title: Risiko penyedia didokumentasikan
    statement: >-
      Pilihan penyedia notifikasi WAJIB dicatat sebagai ADR, termasuk risiko layanan tidak resmi (mis. gateway WhatsApp
      non-resmi dapat diblokir) dan rencana cadangan.
    rationale: Ketergantungan pihak ketiga setelah handoff.
    severity: medium
    class: waivable
    gate: G6
    verification: ADR.
    evidence: [document]
```

#### `PWA.yaml`
```yaml
catalog: module
module: PWA
version: 2.0.0
title: Progressive Web App / service worker
applies_when: Aplikasi mendaftarkan service worker (PWA).
detection_hints: [navigator.serviceWorker.register, vite-plugin-pwa, workbox, manifest.webmanifest]
controls:
  - id: MOD-PWA-001
    module: PWA
    title: Respons berisi data sensitif tidak di-cache
    statement: >-
      Service worker WAJIB tidak menyimpan respons API terautentikasi yang memuat data Tier 1/3 di Cache Storage; strategi
      cache hanya untuk aset statis dan konten publik.
    rationale: Data pribadi tertinggal di perangkat bersama.
    severity: high
    class: non_waivable
    gate: G5
    verification: Inspeksi Cache Storage setelah login di DevTools.
    evidence: [screenshot, code]
  - id: MOD-PWA-002
    module: PWA
    title: Strategi pembaruan versi
    statement: >-
      Cache WAJIB berversi, dan pengguna WAJIB menerima versi baru setelah deploy (tidak terjebak di versi lama yang rusak).
    rationale: Masalah PWA paling umum setelah rilis.
    severity: medium
    class: non_waivable
    gate: G6
    verification: Uji deploy versi baru di staging.
    evidence: [test, document]
  - id: MOD-PWA-003
    module: PWA
    title: Logout membersihkan cache pengguna
    statement: >-
      Logout WAJIB menghapus cache dan storage lokal yang terkait pengguna.
    rationale: Perangkat bersama di kantor desa.
    severity: medium
    class: non_waivable
    gate: G5
    verification: Inspeksi storage setelah logout.
    evidence: [screenshot]
```

---

## Bagian L — Seed Profil Sistem (sumber untuk `seeds/<system>.yaml`)

> Seed adalah **usulan yang belum terverifikasi**. Command adopsi wajib mengonfirmasi setiap modul dan kontrol SYS ke Tech Lead berdasarkan bukti di kode. Seed tidak boleh disalin langsung sebagai fakta.

```yaml
# seeds/sid.yaml
system: SID
name: Sistem Informasi Desa (SIDUTama)
stack_confirmed: {backend: "Laravel + Sanctum", frontend: React, database: PostgreSQL}
candidate_modules: [PII, APPROVAL-WORKFLOW, FILE-UPLOAD, CMS, PUBLIC-API, NOTIFY, BULK-IMPORT, PWA]
candidate_critical_paths:
  - Warga mengajukan permohonan surat
  - Approval berjenjang RT -> RW -> Kadus -> Kasi/Kaur hingga nomor surat terbit
  - Login petugas dan warga
  - Pengelolaan data warga oleh petugas
proposed_sys_controls:
  - id: SYS-SID-001
    title: Urutan rantai approval ditegakkan
    statement: >-
      Urutan RT -> RW -> Kadus -> Kasi/Kaur WAJIB ditegakkan state machine server; status terminal (terbit/ditolak) WAJIB tidak dapat diubah.
    severity: critical
    class: non_waivable
    gate: G5
  - id: SYS-SID-002
    title: letter_number unik per jenis dan periode
    statement: >-
      letter_number WAJIB dibangkitkan atomik, unik per jenis surat dan periode penomoran yang ditetapkan desa, dijamin constraint unik DB, dengan test pembangkitan bersamaan.
    severity: high
    class: non_waivable
    gate: G5
  - id: SYS-SID-003
    title: Antrean approval di-scope ke wilayah
    statement: >-
      Daftar antrean RT/RW/Kadus WAJIB difilter wilayah aktor (rt_id/rw_id/hamlet_id) di level query; warga WAJIB hanya melihat permohonannya sendiri.
    severity: critical
    class: non_waivable
    gate: G5
  - id: SYS-SID-004
    title: MFA peran approval final dan admin desa
    statement: >-
      Petugas Desa, Kasi Pelayanan, dan Kaur TU WAJIB memakai MFA dengan prosedur pemulihan; MFA untuk RT/RW/Kadus SEBAIKNYA menyusul pada fase berikutnya.
    severity: high
    class: waivable
    gate: G7
    supersedes: [AUTH-004, AUTH-005]
  - id: SYS-SID-005
    title: Verifikasi keaslian surat (usulan baru)
    statement: >-
      Surat yang diterbitkan SEBAIKNYA memuat QR/kode verifikasi yang mengarah ke halaman publik berisi nomor, jenis, tanggal, dan status surat tanpa data pribadi.
    severity: medium
    class: waivable
    gate: G6
  - id: SYS-SID-006
    title: Idle timeout peran approval
    statement: >-
      Peran RT, RW, Kadus, Kasi, Kaur, dan Petugas Desa WAJIB memiliki idle timeout <= 30 menit.
    severity: high
    class: waivable
    gate: G5
    supersedes: [AUTH-003]
```

```yaml
# seeds/cimart.yaml
system: CIMART
name: CibendaMart
stack_confirmed: {backend: Laravel, frontend: React, database: MySQL}
open_facts: [payment gateway belum diputuskan mitra]
candidate_modules: [PII, PAYMENT, FILE-UPLOAD, CMS, PUBLIC-API, NOTIFY, PWA]
candidate_critical_paths:
  - Pembeli checkout hingga order tercatat dan stok berkurang
  - Konfirmasi pembayaran (gateway atau manual)
  - Penjual mengelola produk dan stok
  - Login pembeli/penjual/admin
proposed_sys_controls:
  - id: SYS-CIMART-001
    title: Pengurangan stok atomik
    statement: >-
      Pengurangan stok saat checkout WAJIB atomik di dalam transaksi DB (SELECT ... FOR UPDATE, atau UPDATE ... SET stock = stock - ? WHERE id = ? AND stock >= ?) dan WAJIB diuji dengan checkout bersamaan pada stok terbatas.
    severity: critical
    class: non_waivable
    gate: G5
  - id: SYS-CIMART-002
    title: Isolasi data antar penjual
    statement: >-
      Penjual WAJIB hanya dapat melihat dan mengubah produk, stok, dan order miliknya (cek kepemilikan di server + test negatif lintas penjual).
    severity: critical
    class: non_waivable
    gate: G5
  - id: SYS-CIMART-003
    title: Konfigurasi MySQL aman untuk transaksi
    statement: >-
      Semua tabel WAJIB memakai engine InnoDB, sql_mode strict (STRICT_TRANS_TABLES), dan charset utf8mb4.
    severity: medium
    class: non_waivable
    gate: G5
  - id: SYS-CIMART-004
    title: Keputusan payment gateway tercatat
    statement: >-
      Pemilihan payment gateway WAJIB dicatat sebagai ADR sebelum integrasi; sampai diputuskan, checkout WAJIB memakai jalur MOD-PAYMENT-007 (manual) atau berada di balik feature flag yang mati di production.
    severity: high
    class: waivable
    gate: G5
```

```yaml
# seeds/sigap.yaml
system: SIGAP
name: SIGAP
stack_confirmed: {backend: Express, frontend: React, database: PostgreSQL}
unconfirmed_facts:
  - Apakah masih ada perangkat ESP8266/ESP32 (menentukan modul IOT-INGEST)
  - Apakah ada fitur GIS/peta dan data spasial
  - Apakah SIGAP mengirim peringatan/notifikasi ke warga (menentukan SYS-SIGAP-004 dan NOTIFY)
  - Mekanisme autentikasi pengganti Firebase Auth
candidate_modules: [IOT-INGEST, PUBLIC-API, NOTIFY, PWA]
candidate_critical_paths: [ditentukan saat adopsi dari kode dan wawancara Tech Lead]
proposed_sys_controls:
  - id: SYS-SIGAP-001
    title: Hardening Express
    statement: >-
      Aplikasi Express WAJIB: memakai helmet (atau header setara SEC-009), menonaktifkan x-powered-by, membatasi ukuran body request, memakai error handler terpusat yang tidak mengirim stack trace di production, dan rate limit pada endpoint auth.
    severity: high
    class: non_waivable
    gate: G5
  - id: SYS-SIGAP-002
    title: Konfigurasi node-postgres
    statement: >-
      Koneksi PostgreSQL WAJIB memakai Pool dengan max, idleTimeoutMillis, connectionTimeoutMillis, dan statement_timeout terkonfigurasi; semua query WAJIB memakai placeholder ($1, $2, ...).
    severity: high
    class: non_waivable
    gate: G5
  - id: SYS-SIGAP-003
    title: Autentikasi pasca-migrasi dari Firebase
    statement: >-
      Autentikasi WAJIB memakai library mapan; bila memakai JWT: algoritma ditetapkan eksplisit saat verifikasi, secret minimal 256-bit dari env, masa berlaku access token pendek (<= 60 menit), dan refresh token (bila ada) dirotasi serta dapat dicabut.
    severity: critical
    class: non_waivable
    gate: G5
  - id: SYS-SIGAP-004
    title: Kebenaran logika peringatan (kondisional)
    statement: >-
      Bila SIGAP menghasilkan peringatan lingkungan/bencana: logika ambang WAJIB diuji termasuk kasus batas, dan kegagalan pengiriman peringatan WAJIB memicu alert teknis.
    severity: high
    class: waivable
    gate: G6
    conditional: true
```

```yaml
# seeds/vdash.yaml
system: VDASH
name: Village Dashboard
stack_confirmed: {}
unconfirmed_facts: [stack, hosting, sistem sumber yang sudah terintegrasi, ada/tidaknya login]
candidate_modules: [API-CONSUMER, CMS, PWA]
candidate_critical_paths: [ditentukan saat adopsi]
proposed_sys_controls:
  - id: SYS-VDASH-001
    title: Hanya data agregat
    statement: >-
      Dashboard WAJIB hanya menampilkan data agregat; drill-down ke individu warga/pembeli dilarang.
    severity: critical
    class: non_waivable
    gate: G5
```

---

## Bagian M — Format File Repo Sistem (`<repo-sistem>/docs/awg/`)

```
docs/awg/
├── README.md              # ringkasan: sistem, versi standar, cara menjalankan validator, tautan dokumen
├── awg.lock.yaml          # repo pusat + tag versi yang dipakai
├── profile.yaml           # identitas, stack, tim, gate, modul, critical paths, target, hosting
├── controls-local.yaml    # kontrol SYS-*
├── status.yaml            # status per kontrol yang berlaku
├── waivers.yaml
├── threat-model.yaml
├── runbook.md
└── reports/               # gate reports, adoption gap report, uji beban, restore, ZAP, tabletop
```

### M.1 `awg.lock.yaml`
```yaml
governance_repo: https://github.com/Vextronode/governance-awg.git
version: v2.0.0
adopted_at: "YYYY-MM-DD"
```

### M.2 `profile.yaml`
```yaml
awg_version: v2.0.0
system:
  id: SID                     # SID | SIGAP | CIMART | VDASH | <baru, disetujui AWG>
  name: ""
  repo: ""
  tech_lead: ""
  team: []                    # nama anggota; dipakai untuk cek independensi verifikator
stack:
  backend: ""
  frontend: ""
  database: ""
  runtime_versions: {}        # mis. php: "8.3", node: "20"
  other: []
adoption:
  date: ""
  gate_at_adoption: ""        # gate terakhir yang sudah lulus (E.4)
current_gate: ""              # gate terakhir yang lulus
environments:
  production: {hosting: "", url: "", managed_by: ""}
  staging:    {hosting: "", url: "", managed_by: ""}
hosting_assessment: {}        # BASE-REL-008
modules:
  active:
    - id: PII
      reason: ""
      evidence: []            # path kode
  inactive:
    - id: PAYMENT
      reason: ""
critical_paths:               # BASE-QA-001
  - id: CP-01
    name: ""
    tests: []                 # path test (BASE-QA-002)
    log_events: []            # BASE-OBS-002
  # approved_by: ""
performance:
  expected_peak_concurrent_users: null
  basis: ""
  overrides: []               # hanya memperketat
security:
  idle_timeout_minutes: null  # BASE-SEC-003
observability:
  error_alert_threshold: ""
  business_metrics: []
contacts:                     # berbasis peran
  incident_tech: ""
  data_controller_contact: "" # kontak resmi Pengendali (PRIV-008)
```

### M.3 `status.yaml`
```yaml
awg_version: v2.0.0
system: SID
controls:
  - id: BASE-SEC-001
    status: not_started       # C.4
    owner: ""
    evidence: []              # [{type: test, ref: "tests/Feature/AuthTest.php", note: ""}]
    waiver: null
    reason: null              # wajib untuk not_applicable
    verification: []          # E.2
    notes: ""
```

### M.4 `controls-local.yaml`
Format kontrol sama dengan katalog (C.2) dengan prefix `SYS-<SYSTEM>-`. Field tambahan opsional: `conditional: true` dan `source: seed|team`.

### M.5 `waivers.yaml`
Daftar waiver sesuai D.2 di bawah key `waivers:`.

### M.6 `threat-model.yaml`
Berbasis `003-threat-model-schema.yaml` v1, dengan perubahan:
- `likelihood` / `impact` bernilai integer 1–3, ditambah `score` dan `risk_rating` (low/medium/high/critical sesuai F.3).
- Ditambah `related_controls: []` per finding.
- Ditambah `review: {reviewer: "", date: "", note: ""}`.
- Ditambah `source: team|claude-draft` per finding (draf buatan Claude wajib direview).
- `mitigation_status`: `not_started` | `in_progress` | `done`; `done` mensyaratkan `verification_evidence`.

---

## Bagian N — Struktur Repo Pusat & Tooling

```
governance-awg/
├── README.md
├── CHANGELOG.md
├── MIGRATION.md
├── .github/
│   ├── CODEOWNERS
│   └── workflows/validate.yml
├── 00-framework/
│   ├── 00-scope-and-principles.md       # Bagian B
│   ├── 01-control-model.md              # Bagian C
│   ├── 02-tailoring-and-waiver.md       # Bagian D
│   ├── 03-verification-and-gates.md     # Bagian E
│   ├── 04-threat-modeling.md            # Bagian F
│   ├── 05-incident-response.md          # Bagian G
│   ├── 06-handoff-and-support.md        # Bagian H
│   ├── 07-defect-severity-and-exit-criteria.md  # Bagian I
│   └── 08-roles.md                      # Bagian J
├── 10-baseline/                         # narasi per domain; kontrol dirujuk via ID
│   ├── GOV.md  SEC.md  PRIV.md  QA.md  OBS.md  PERF.md  REL.md  DATA.md  MAINT.md
├── 20-modules/                          # narasi per modul
│   ├── PII.md  APPROVAL-WORKFLOW.md  PAYMENT.md  FILE-UPLOAD.md  BULK-IMPORT.md
│   ├── IOT-INGEST.md  PUBLIC-API.md  API-CONSUMER.md  CMS.md  NOTIFY.md  PWA.md
├── 40-guides/                           # NON-normatif: cara implementasi per stack
│   ├── laravel.md  express.md  react.md  postgresql.md  mysql.md
├── catalog/
│   ├── baseline.yaml
│   ├── modules/*.yaml
│   ├── GATE-MATRIX.md                   # DIHASILKAN tool, jangan diedit manual
│   └── schema/
│       ├── catalog.schema.json  profile.schema.json  status.schema.json
│       ├── controls-local.schema.json  waivers.schema.json  threat-model.schema.json
├── seeds/   sid.yaml  cimart.yaml  sigap.yaml  vdash.yaml
├── templates/
│   ├── system/                          # scaffold docs/awg/ (M.1–M.6) + runbook.md + README.md
│   ├── reports/  verification-report.md  adoption-gap-report.md  incident-report.md  postmortem.md
│   │             go-no-go-checklist.md  handover-checklist.md  operator-playbook.md
│   │             load-test-report.md  restore-test-report.md  tabletop-report.md
│   ├── ci/awg-validate.yml              # contoh workflow untuk repo sistem
│   └── claude/awg-adopt.md              # command adopsi untuk repo sistem
├── rfc/
│   ├── 0001-awg-v2-restructure.md       # salinan dokumen ini
│   └── OPEN-QUESTIONS.md
└── tools/awg-validate/
    ├── package.json  awg-validate.mjs  README.md
    └── test/  (fixtures valid/invalid + node:test)
```

### N.1 Narasi `10-baseline/*.md` dan `20-modules/*.md`
Setiap file memuat: tujuan domain/modul, konteks program, **daftar ID + judul kontrol** (tanpa menyalin statement, cukup merujuk ke katalog), panduan penerapan singkat, dan kesalahan umum. Isi narasi boleh memakai materi v1 yang relevan (mis. OBS v1 §3–§6, PERF v1 §3–§5). **Tidak boleh ada persyaratan baru di narasi.**

### N.2 `40-guides/` (non-normatif) — isi minimum
- **laravel.md:** Sanctum (SPA cookie + `/sanctum/csrf-cookie`, `SANCTUM_STATEFUL_DOMAINS`, `expiration` di config/sanctum.php, `SESSION_LIFETIME`); FormRequest untuk validasi; Policy/Gate untuk otorisasi objek; `RateLimiter::for` + middleware `throttle`; `Model::preventLazyLoading(! app()->isProduction())`; cast `encrypted`; channel log dengan `JsonFormatter`; `composer audit`; maintenance mode bawaan via CLI (`php artisan down`) dan kebutuhan UI untuk MAINT-004; `APP_DEBUG=false`.
- **express.md:** helmet, `app.disable('x-powered-by')`, `express.json({ limit })`, express-rate-limit, validasi skema (mis. zod/joi), pino dengan opsi `redact`, middleware correlation ID, error handler terpusat, node-postgres `Pool` + `statement_timeout`, `npm audit --audit-level=high`, library migration (mis. node-pg-migrate).
- **react.md:** escaping default React; larangan `dangerouslySetInnerHTML` tanpa DOMPurify; env yang dibundel itu publik; tidak menyimpan token/data Tier 1 di localStorage; code splitting/lazy; Lighthouse.
- **postgresql.md:** role aplikasi non-superuser dengan GRANT minimal; FK tidak otomatis diindeks; `EXPLAIN (ANALYZE, BUFFERS)`; `pg_dump -Fc` + `pg_restore`; `statement_timeout`.
- **mysql.md:** InnoDB; `sql_mode` strict; utf8mb4; InnoDB otomatis membuat indeks untuk FK; `mysqldump --single-transaction` untuk backup konsisten; `SELECT ... FOR UPDATE` butuh transaksi InnoDB.

Setiap guide diawali catatan: *"Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai."*

### N.3 Validator `tools/awg-validate`
- Node.js ≥ 18, ESM, satu dependency: `yaml` (paket npm `yaml`). Validasi schema JSON boleh memakai `ajv` (dependency kedua yang diizinkan).
- Perintah:
  - `node awg-validate.mjs catalog --root <path-governance>`: validasi baseline + modul + seeds + template YAML terhadap schema; ID unik global; prefix sesuai lapis/modul; enum valid; aturan C.3 (critical ⇒ non_waivable); `supersedes` hanya merujuk 30 ID v1 yang sah (lihat Bagian O), dan setiap ID v1 tercakup minimal sekali di katalog **atau** seed.
  - `node awg-validate.mjs catalog --root <path> --gate-matrix`: menulis `catalog/GATE-MATRIX.md` (tabel per gate: ID, judul, severity, class, lapis/modul). Mode `--check` gagal bila file berbeda dari hasil generate.
  - `node awg-validate.mjs system --governance <path-governance> --awg <path-docs-awg> [--gate Gx] [--summary]`:
    - validasi schema semua file sistem;
    - `awg_version` di profile/status sama dengan `awg.lock.yaml`;
    - modul aktif ada di katalog;
    - status mencakup **tepat sekali** setiap kontrol yang berlaku (BASE semua + MOD aktif + SYS lokal) dan tidak ada ID asing;
    - aturan C.4 (syarat per status), D.2 (waiver hanya untuk waivable, belum kedaluwarsa, 2 penyetuju, penyetuju bukan anggota tim), E.2 (verifikator bukan anggota `system.team`; critical butuh verifikasi rotation + coordinator);
    - threat model: score = likelihood × impact, rating sesuai F.3, setiap boundary punya finding, `done` butuh evidence;
    - `--gate Gx`: daftar kontrol pemblokir (E.3), termasuk penanda utang retroaktif (E.4), dan exit code 1 bila ada pemblokir;
    - `--summary`: rekap per status/severity/domain ke stdout (markdown). Rekap **tidak** disimpan sebagai sumber kebenaran.
  - Exit code: 0 lulus, 1 pelanggaran, 2 error penggunaan.
- Test: `node --test` dengan fixture valid dan fixture invalid untuk setiap aturan di atas.
- CI pusat (`.github/workflows/validate.yml`): jalankan test validator, `catalog`, dan `catalog --gate-matrix --check` pada setiap PR dan push ke branch utama.
- Template CI sistem (`templates/ci/awg-validate.yml`): checkout governance-awg pada tag di `awg.lock.yaml`, lalu jalankan `system`. Mode default *warn-only* (`continue-on-error: true`) selama masa adopsi; diubah menjadi blocking oleh Tech Lead setelah utang retroaktif beres.

### N.4 CODEOWNERS
Path `catalog/`, `00-framework/`, dan `seeds/` dimiliki AWG. Username GitHub **tidak boleh dikarang**: command meminta username ke pengguna, atau menulis placeholder berkomentar `# TODO(awg): isi username GitHub ...` bila tidak diberikan.

### N.5 Versi
- governance-awg memakai SemVer. Refactor ini = `v2.0.0`. Sebelum refactor, HEAD lama diberi tag `v1-final`.
- MAJOR: menghapus kontrol atau memperketat persyaratan yang bisa membuat sistem patuh menjadi tidak patuh. MINOR: kontrol/modul baru yang opsional atau gate di masa depan. PATCH: perbaikan teks tanpa perubahan makna.
- Repo sistem meng-upgrade versi lewat PR yang mengubah `awg.lock.yaml`, `awg_version`, dan status.

---

## Bagian O — Pemetaan Migrasi v1 → v2 (sumber untuk `MIGRATION.md`)

### O.1 Kontrol v1 (30 kontrol; summary v1 yang menyebut 27 adalah salah hitung)
| v1 | v2 |
|---|---|
| AUTH-001 | BASE-SEC-001 |
| AUTH-002 | BASE-SEC-002 |
| AUTH-003 | BASE-SEC-003; SYS-SID-006 (seed) |
| AUTH-004 | BASE-SEC-021 (admin sistem/infra); SYS-SID-004 (seed, peran desa) |
| AUTH-005 | SYS-SID-004 (seed, sebagai SEBAIKNYA) |
| AUTHZ-001 | BASE-SEC-005 |
| AUTHZ-002 | MOD-APPROVAL-WORKFLOW-002; SYS-SID-003 (seed) |
| AUTHZ-003 | BASE-SEC-018 (konteks Firebase dihapus) |
| NET-001 | BASE-SEC-018 |
| NET-002 | BASE-SEC-018 |
| NET-003 | BASE-SEC-017 |
| NET-004 | BASE-SEC-019; MOD-PUBLIC-API-002 |
| SEC-001 | BASE-SEC-010 |
| SEC-002 | BASE-SEC-012 |
| SEC-003 | BASE-SEC-011 |
| SEC-004 | BASE-SEC-012 |
| TLS-001 | BASE-SEC-016 |
| TLS-002 | MOD-IOT-INGEST-002 |
| TLS-003 | BASE-SEC-016 |
| LOG-001 | BASE-SEC-020 |
| LOG-002 | BASE-PRIV-003 |
| LOG-003 | BASE-OBS-008 |
| BAK-001 | BASE-DATA-001 (kini semua sistem) |
| BAK-002 | MOD-IOT-INGEST-006 |
| BAK-003 | BASE-DATA-002 |
| BAK-004 | BASE-DATA-004 |
| TPR-002 | BASE-PRIV-003 (konteks Vercel dihapus) |
| IR-001 | BASE-PRIV-009 + framework 05 |
| IR-002 | BASE-PRIV-009 + framework 05 |
| IR-003 | BASE-PRIV-009 + framework 05 (timeline diperbaiki ke Pasal 46) |

### O.2 Dokumen v1
| v1 | v2 |
|---|---|
| AWG-QC-001 | 00-framework/03-verification-and-gates.md (verifikasi kini memblokir gate; template laporan tersedia) |
| AWG-OBS-001 | 10-baseline/OBS.md + BASE-OBS-* |
| AWG-OBS-002 | 10-baseline/PERF.md + BASE-PERF-* + SYS-CIMART-001 (seed) |
| AWG-SEC-001 | 00-framework/00 + 10-baseline/SEC.md + PRIV.md |
| AWG-SEC-002 | 00-framework/04-threat-modeling.md |
| AWG-SEC-003 (schema) | catalog/schema/threat-model.schema.json + templates/system/threat-model.yaml |
| AWG-SEC-005 | 00-framework/05-incident-response.md |
| AWG-SEC-006 | 00-framework/06-handoff-and-support.md + BASE-MAINT-* |
| security-baseline-controls.yaml | catalog/ (definisi) + docs/awg/status.yaml per repo (status) |

### O.3 Inkonsistensi v1 yang diperbaiki (dicatat di CHANGELOG)
1. Summary kontrol 27 vs aktual 30; severity 12/11 vs 13/13 → rekap kini dihitung tool.
2. ID TPR-001 hilang → kontrol hosting ditambahkan (BASE-REL-008).
3. Rujukan ke dokumen yang tidak ada (AWG-SEC-004/007, DFD_REVIEW_GUIDE.md, ENGINEERING_STANDARDS.md, template QC) → dihapus atau disediakan.
4. Nama file rujukan tidak cocok dengan nama file aktual → rujukan memakai path aktual.
5. Aturan G6 merujuk rating "critical" yang tidak ada di skala → skala F.3.
6. QC-001 berstatus "Disetujui" di atas standar "Draft" → seluruh v2 dirilis bersamaan sebagai v2.0.0.
7. QC-001 (tidak blocking) vs SEC-002 (blocking) → E.3 menetapkan blocking.
8. Timeline notifikasi tidak sesuai 3×24 jam Pasal 46 → G.3.
9. Fakta stack usang (Firebase, Vercel) → Bagian A.

---

## Bagian P — Open Questions Awal (sumber untuk `rfc/OPEN-QUESTIONS.md`)
1. Konfirmasi interpretasi titik awal 3×24 jam (G.3) dan kriteria pemberitahuan publik (Pasal 46 ayat 3) ke dosen pembimbing atau penasihat hukum mitra.
2. Dokumen kesepakatan kedudukan Pengendali dengan Pemdes dan koperasi (PRIV-008): siapa penandatangan di sisi mitra?
3. SIGAP: perangkat ESP, GIS, peringatan ke warga, mekanisme auth (diselesaikan saat adopsi SIGAP).
4. VDASH: stack dan hosting (diselesaikan saat adopsi VDASH).
5. CIMART: payment gateway (keputusan mitra), kemudian ADR SYS-CIMART-004.
6. Angka default (PERF-001 p95, PERF-006 LCP, retensi OBS-008/DATA-003, idle timeout) adalah usulan AWG. Bila tim membantahnya dengan data, ubah lewat PR ke katalog (MAJOR bila memperketat).
7. Program Gates Guide (dokumen PM): bagian G3 "API Specification (Draft)" berisi poin yang sama dengan Architecture Document, dan "Village Dashboard Gate" disebut tanpa definisi. Usulkan revisi ke PM; dokumen PM tidak diubah oleh refactor ini.
8. Username GitHub untuk CODEOWNERS.
