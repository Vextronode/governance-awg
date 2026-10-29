# Open Questions

Pertanyaan yang belum bisa diputuskan oleh pelaksana refactor dan butuh keputusan manusia. Bagian A berasal dari [RFC-0001 Bagian P](0001-awg-v2-restructure.md); Bagian B muncul selama refactor v2.0.0; Bagian C muncul saat menambahkan mode tata kelola di v2.1.0 ([RFC-0002](0002-operating-modes.md)). Isi normatif katalog **tidak** diubah untuk menjawab pertanyaan ini; perubahan dilakukan lewat PR sesuai aturan SemVer (RFC-0001 N.5).

## A. Dari RFC-0001 Bagian P

1. Konfirmasi interpretasi titik awal 3×24 jam (G.3) dan kriteria pemberitahuan publik (Pasal 46 ayat 3) ke dosen pembimbing atau penasihat hukum mitra.
2. Dokumen kesepakatan kedudukan Pengendali dengan Pemdes dan koperasi (PRIV-008): siapa penandatangan di sisi mitra?
3. SIGAP: perangkat ESP, GIS, peringatan ke warga, mekanisme auth (diselesaikan saat adopsi SIGAP).
4. VDASH: stack dan hosting (diselesaikan saat adopsi VDASH).
5. CIMART: payment gateway (keputusan mitra), kemudian ADR SYS-CIMART-004.
6. Angka default (PERF-001 p95, PERF-006 LCP, retensi OBS-008/DATA-003, idle timeout) adalah usulan AWG. Bila tim membantahnya dengan data, ubah lewat PR ke katalog (MAJOR bila memperketat).
7. Program Gates Guide (dokumen PM): bagian G3 "API Specification (Draft)" berisi poin yang sama dengan Architecture Document, dan "Village Dashboard Gate" disebut tanpa definisi. Usulkan revisi ke PM; dokumen PM tidak diubah oleh refactor ini.
8. Username GitHub untuk CODEOWNERS. Saat ini `.github/CODEOWNERS` berisi placeholder `TODO(awg)` (pengguna memilih placeholder saat refactor).
   **Selesai (2026-10-29):** `/catalog/`, `/00-framework/`, dan `/seeds/` dimiliki `@spectraVal` (satu orang untuk semua peran Coordinator, keputusan sadar pengguna).

## B. Muncul selama refactor v2.0.0

9. **Lokasi template operator-playbook dan handover-checklist.** RFC Bagian H.3 menyebut `templates/system/`, sedangkan Bagian N dan command refactor menempatkannya di `templates/reports/`. **Diputuskan pengguna (2026-10-19): `templates/reports/`.** Usulan: perbaiki teks H.3 di revisi RFC berikutnya (PATCH).
10. **Gate vs teks statement yang menyebut "sebelum G7".** Katalog disalin verbatim, tetapi tiga kontrol berpotensi membingungkan verifikator:
    - BASE-PRIV-009 ber-`gate: G6`, sedangkan statement mewajibkan simulasi tabletop "sebelum G7".
    - BASE-PERF-002 ber-`gate: G6`, sedangkan statement mewajibkan uji beban "sebelum G7".
    - BASE-GOV-004 ber-`gate: G5`, sedangkan statement berlaku untuk "setiap klaim gate (G3-G7)".
    Validator mengikuti field `gate`. Perlu keputusan AWG apakah gate atau teks statement yang diubah.
11. **Coordinator verifikator kedua untuk kontrol SYS `critical`.** E.2 memetakan Coordinator per domain BASE dan "modul teknis", tetapi kontrol SYS tidak punya domain. Validator saat ini menerima salah satu Coordinator untuk SYS, dan DevOps Coordinator untuk semua MOD.
12. **Penyetuju waiver untuk kontrol MOD/SYS.** D.2 memetakan Coordinator per domain BASE saja. Validator saat ini mensyaratkan Program Coordinator + salah satu Coordinator lain untuk MOD/SYS.
13. **Batas `expires_at` waiver terhadap tanggal target G7.** D.2 membatasi waiver pada 90 hari **atau** tanggal target G7, mana yang lebih dulu, tetapi format `profile.yaml` (M.2) tidak punya field tanggal target G7. Validator hanya memeriksa 90 hari. Perlu field baru di profil (MINOR) atau sumber lain.
14. **Persetujuan critical paths (BASE-QA-001).** M.2 menulis `# approved_by: ""` sebagai komentar di dalam daftar `critical_paths`, sehingga tidak ada field YAML yang sah untuk mencatat persetujuan Program Coordinator. Schema profil saat ini tidak menyediakan field tersebut.
15. **Waiver defect S2 (I.2).** Exit criteria G7 mengizinkan S2 di-waive "lewat waiver defect berformat sama dengan D.2", tetapi lokasi penyimpanan dan pola ID (field `control` merujuk kontrol, bukan defect) belum ditetapkan. Validator belum memeriksa waiver defect.
16. **Verifikasi `not_applicable` untuk kontrol MOD/SYS `critical`.** C.4 mensyaratkan blok verifikasi (verifikator setuju) tanpa menyebut verifikasi ganda. Validator saat ini mensyaratkan minimal satu verifikasi `verified` dari luar tim.
17. **Schema seed.** N.3 meminta seed divalidasi "terhadap schema", tetapi Bagian N tidak mencantumkan schema seed dan `proposed_sys_controls` di seed tidak memuat semua field C.2 (`rationale`, `verification`, `evidence`). Validator memeriksa seed dengan aturan bawaan (pola ID, field minimum, enum, C.3, `supersedes`).
18. **Header threat model v1.** Field header v1 (`document_id`, `version`, `policy_reference`, `methodology_reference`) merujuk nama file v1 yang tidak lagi ada; schema v2 menggantinya dengan `awg_version` opsional. Mohon konfirmasi.
19. **Penegakan BASE-GOV-002 oleh validator.** Verifikasi BASE-GOV-002 berbunyi "Validator gate G6 lulus untuk threat-model.yaml". Validator menafsirkannya sebagai: `--gate G6` (atau lebih tinggi) memblokir bila ada finding `critical`/`high` dengan `mitigation_status: not_started`.

## C. Muncul di v2.1.0

20. **A.6 vs instruksi `self-review-in-team`.** A.6 menyatakan verifikasi `self_review`/`external_reviewer` di mode `team` "tidak dihitung" dan hanya memicu peringatan, sedangkan instruksi implementasi meminta `self_review` di team menjadi error. **Diputuskan pengguna (2026-10-29): ikuti A.6.** Entri `verified` yang hanya didukung role solo menghasilkan peringatan `solo-verification-in-team` dan menjadi pemblokir `--gate`. Error `self-review-in-team` hanya untuk `self_review` pada entri yang **bukan** `verified`.
21. **Waiver solo setelah pindah ke team.** A.6 tidak mengatur waiver yang disetujui `owner`/`external_reviewer` ketika mode diganti `team`. Validator tetap menerapkan aturan penyetuju team (error `waiver-approvers`), sehingga fixture peralihan memakai salinan `valid-solo` tanpa waiver (keputusan pengguna 2026-10-29). Perlu keputusan AWG apakah waiver tersebut tetap sah sampai kedaluwarsa.
22. **Tafsir W-3.** **Diputuskan pengguna (2026-10-29):** waiver ke-3 dan seterusnya untuk satu kontrol (diurutkan `approved_at`, semua status) wajib disetujui `external_reviewer`, apa pun persetujuan waiver sebelumnya.
23. **`self_review` oleh orang di luar `system.team`.** A.2 mendefinisikan `self_review` sebagai review oleh anggota `system.team`, tetapi tidak ada kode error untuk pelanggarannya. Validator belum menegakkannya.
24. **`external_reviewer` di luar daftar `governance.external_reviewers`.** A.1 menyebut daftar ini opsional. Validator tidak mensyaratkan verifikator `external_reviewer` tercantum di daftar tersebut.
25. **`since` wajib saat `team` → `solo` (A.6).** Validator tidak bisa mendeteksi peralihan (riwayat hanya ada di git), sehingga `since` tidak diwajibkan validator. Template menandainya sebagai wajib saat pindah ke solo.
26. **Kontrol katalog yang menyebut peran team.** BASE-GOV-001 (threat model "direview DevOps Coordinator"), BASE-QA-001 (critical paths "disetujui Program Coordinator"), dan BASE-REL-007 (go/no-go "diketahui Program Coordinator") tidak punya padanan di mode `solo`. Hal yang sama berlaku untuk eskalasi ke Coordinator di timeline insiden (framework 05 §4). Katalog tidak diubah di v2.1.0 (prinsip RFC-0002). Perlu keputusan AWG, mis. addendum RFC yang memetakan peran tersebut ke `governance.owner`/`external_reviewer` di mode solo.
27. **`verifier_system`.** Instruksi v2.1.0 menyebut field ini "opsional/bebas seperti sekarang", padahal schema v2.0.0 mewajibkannya dengan pola `^[A-Z][A-Z0-9]*$`. Schema tidak diubah. Untuk `self_review` dipakai ID sistem sendiri; untuk `external_reviewer` dipakai kode bebas berpola sama (fixture memakai `EXT`).
28. **Penyetuju waiver ber-role Coordinator di mode solo.** W-1 hanya menghitung `owner` dan `external_reviewer`. Persetujuan ber-role Coordinator tidak dihitung, dan tidak ada peringatannya (S-7 hanya mengatur verifikasi).
29. **External reviewer anggota tim pada S-6(a).** Validator memberi error `external-team-member` (S-5) dan tidak menghitung verifikasi tersebut untuk S-6(a).
30. **Versi katalog vs `awg.lock.yaml`.** Validator tidak membandingkan field `version` di file katalog dengan `awg.lock.yaml`/`awg_version`. Yang dibandingkan hanya `awg_version` di profile/status dengan `awg.lock.yaml`, sehingga katalog tetap `version: 2.0.0` di v2.1.0 tanpa memicu error. Belum ada pemeriksaan bahwa tag governance yang di-checkout sama dengan `awg.lock.yaml`.
