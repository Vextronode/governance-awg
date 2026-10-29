# Changelog

Format mengikuti SemVer (RFC-0001 N.5): MAJOR untuk penghapusan kontrol atau pengetatan yang bisa membuat sistem patuh menjadi tidak patuh; MINOR untuk kontrol/modul baru yang opsional atau gate di masa depan; PATCH untuk perbaikan teks tanpa perubahan makna.

## [2.1.0] — 2026-10-29

Mode tata kelola `team` dan `solo` sesuai [RFC-0002](rfc/0002-operating-modes.md) dan [framework 09](00-framework/09-operating-modes.md). Mode mengubah *siapa* yang memverifikasi, bukan *apa* yang wajib.

**Alasan versi MINOR:** semua perubahan bersifat opsional. Profil tanpa blok `governance` diperlakukan sebagai `team` dengan perilaku identik v2.0.0, sehingga sistem yang patuh v2.0.0 tetap patuh.

### Ditambahkan

- Mode `solo` untuk proyek yang memakai standar ini secara mandiri: blok `governance` di `profile.yaml` (A.1), aturan verifikasi S-1 s.d. S-7 (A.3), aturan waiver W-1 s.d. W-3 (A.4), baris mode di output `--summary`/`--gate` dan laporan gate (A.5), serta aturan pergantian mode (A.6).
- Role verifikator baru `self_review` dan `external_reviewer`; role penyetuju waiver baru `owner` dan `external_reviewer`.
- Field status `implemented_at` (wajib di mode `solo` untuk `implemented`/`verified`, opsional di `team`).
- Adopsi sistem tanpa seed (A.7): command adopsi menerima ID sistem apa pun yang cocok dengan `^[A-Z][A-Z0-9]*$` dan melewati langkah seed bila `seeds/<id>.yaml` tidak ada.
- Validator: kode error dan peringatan baru untuk mode solo dan peralihan mode (lihat `tools/awg-validate/README.md`), beserta 21 test baru.
- `00-framework/09-operating-modes.md`, `rfc/0002-operating-modes.md`, dan open questions bagian C.

### Diubah

- Template `templates/system/` memakai `v2.1.0` dan memuat blok `governance` (default `team`) serta `implemented_at`. Template laporan gate mencantumkan mode, dan command adopsi menanyakan mode sebagai langkah pertama.

### Tidak berubah

- Katalog kontrol: `catalog/baseline.yaml`, `catalog/modules/*.yaml`, `seeds/`, dan `catalog/GATE-MATRIX.md` identik dengan v2.0.0. Field `version: 2.0.0` di file katalog tetap, karena isinya tidak berubah.
- Perilaku mode `team`: seluruh 38 test v2.0.0 lulus tanpa diubah.

## [2.0.0] — 2026-10-19

Restrukturisasi total standar AWG menjadi model 3 lapis (Baseline · Modul · Profil Sistem) sesuai [RFC-0001](rfc/0001-awg-v2-restructure.md). Menggantikan seluruh isi v1 (AWG-QC-001, AWG-OBS-001/002, AWG-SEC-001/002/003/005/006, `security-baseline-controls.yaml`); isi v1 tersedia di tag `v1-final`. Panduan migrasi: [MIGRATION.md](MIGRATION.md).

### Ditambahkan

- Framework `00-framework/` (9 dokumen): ruang lingkup & prinsip, model kontrol, tailoring & waiver, verifikasi & gate, threat modeling, incident response, handoff & dukungan, severity defect & exit criteria, peran.
- Katalog kontrol mesin-terbaca: `catalog/baseline.yaml` (83 kontrol BASE di 9 domain) dan `catalog/modules/*.yaml` (49 kontrol MOD di 11 modul), beserta JSON Schema di `catalog/schema/`.
- `catalog/GATE-MATRIX.md` yang dihasilkan tool.
- Narasi per domain (`10-baseline/`) dan per modul (`20-modules/`); panduan stack non-normatif (`40-guides/`: Laravel, Express, React, PostgreSQL, MySQL).
- Seed usulan profil per sistem (`seeds/`: SID, CIMART, SIGAP, VDASH; 15 usulan kontrol SYS, belum terverifikasi).
- Template repo sistem (`templates/system/`), template laporan (`templates/reports/`), template CI (`templates/ci/awg-validate.yml`), dan command adopsi (`templates/claude/awg-adopt.md`).
- Validator `tools/awg-validate` (perintah `catalog` dan `system`) dengan test `node:test` dan CI pusat `.github/workflows/validate.yml`.
- `rfc/0001-awg-v2-restructure.md` dan `rfc/OPEN-QUESTIONS.md`.

### Diubah

- Verifikasi kepatuhan kini **memblokir** klaim gate (framework 03 §3), dengan verifikator independen lintas tim dan verifikasi ganda untuk kontrol `critical`.
- Skala risiko threat model dan waiver: `score = likelihood × impact` (1–3), menggantikan `max(likelihood, impact)`.
- Timeline notifikasi kegagalan pelindungan data mengikuti 3×24 jam Pasal 46 UU PDP, dihitung dari T0.
- Kedudukan mitra sebagai Pengendali Data dan tim sebagai pihak yang memproses ditetapkan eksplisit.

### Dihapus

- Folder v1 `AWG_QC/`, `AWG_OBS/`, `AWG_SEC/` (riwayat di tag `v1-final`).

### Inkonsistensi v1 yang diperbaiki

1. Summary kontrol 27 vs aktual 30; severity 12/11 vs 13/13 → rekap kini dihitung tool.
2. ID TPR-001 hilang → kontrol hosting ditambahkan (BASE-REL-008).
3. Rujukan ke dokumen yang tidak ada (AWG-SEC-004/007, DFD_REVIEW_GUIDE.md, ENGINEERING_STANDARDS.md, template QC) → dihapus atau disediakan.
4. Nama file rujukan tidak cocok dengan nama file aktual → rujukan memakai path aktual.
5. Aturan G6 merujuk rating "critical" yang tidak ada di skala → skala F.3.
6. QC-001 berstatus "Disetujui" di atas standar "Draft" → seluruh v2 dirilis bersamaan sebagai v2.0.0.
7. QC-001 (tidak blocking) vs SEC-002 (blocking) → E.3 menetapkan blocking.
8. Timeline notifikasi tidak sesuai 3×24 jam Pasal 46 → G.3.
9. Fakta stack usang (Firebase, Vercel) → Bagian A.
