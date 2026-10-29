---
description: Adopsi standar AWG v2 di repo sistem (SID / SIGAP / CIMART / VDASH atau sistem lain), mode team atau solo — membuat docs/awg/ beserta gap report
argument-hint: "<SYSTEM_ID, pola ^[A-Z][A-Z0-9]*$, mis. SID|SIGAP|CIMART|VDASH> [versi AWG, default v2.1.0]"
---

# Command: Adopsi AWG v2 di Repo Sistem

Kamu membantu Tech Lead sistem `$ARGUMENTS` mengadopsi standar AWG v2. Hasil akhirnya adalah folder `docs/awg/` yang akurat, plus laporan gap. Kamu **tidak memperbaiki kode aplikasi** di command ini. Temuan dicatat, lalu perbaikannya dikerjakan sebagai task terpisah.

## 0. Aturan wajib

1. **Argumen:** token pertama = SYSTEM_ID, yaitu ID apa pun yang cocok dengan pola `^[A-Z][A-Z0-9]*---
description: Adopsi standar AWG v2 di repo sistem (SID / SIGAP / CIMART / VDASH atau sistem lain), mode team atau solo — membuat docs/awg/ beserta gap report
argument-hint: "<SYSTEM_ID, pola ^[A-Z][A-Z0-9]*$, mis. SID|SIGAP|CIMART|VDASH> [versi AWG, default v2.1.0]"
---

# Command: Adopsi AWG v2 di Repo Sistem

Kamu membantu Tech Lead sistem `$ARGUMENTS` mengadopsi standar AWG v2. Hasil akhirnya adalah folder `docs/awg/` yang akurat, plus laporan gap. Kamu **tidak memperbaiki kode aplikasi** di command ini. Temuan dicatat, lalu perbaikannya dikerjakan sebagai task terpisah.

## 0. Aturan wajib

 (mis. `SID`, `SIGAP`, `CIMART`, `VDASH`, atau ID sistem baru di luar program). Token kedua = versi AWG (default `v2.1.0`). Bila SYSTEM_ID kosong atau tidak cocok dengan pola, tanyakan pengguna.
2. **Anti-halusinasi:**
   - Fakta tentang sistem hanya boleh berasal dari (a) kode/konfigurasi di repo ini, dengan path sebagai bukti, atau (b) jawaban pengguna di chat. Seed di repo pusat hanyalah **usulan**.
   - Jangan pernah mengisi nama orang, URL, hosting, angka beban, atau kontak dari tebakan. Bila tidak diketahui, tulis `TODO(awg): ...`.
   - Jangan pernah menetapkan status `verified`. Verifikasi adalah tugas verifikator manusia: tim rotasi dan Coordinator di mode `team`, atau `self_review`/`external_reviewer` di mode `solo` (framework 09).
   - Status `implemented` hanya boleh ditetapkan bila ada bukti konkret (path file/test/config) **dan** Tech Lead mengonfirmasinya di chat. Selain itu gunakan `in_progress` (bukti parsial) atau `not_started`.
   - Jangan melunakkan atau menafsirkan ulang kontrol katalog. Bila kontrol terasa tidak cocok, catat sebagai kandidat waiver atau pertanyaan, bukan sebagai `not_applicable` untuk kontrol BASE.
3. Ajukan pertanyaan secara berkelompok (maksimal 4 per giliran) dan gunakan pilihan jawaban bila memungkinkan.
4. **Git:** kerjakan di branch `chore/awg-v2-adoption`. Jangan push tanpa persetujuan eksplisit. Jangan commit salinan repo pusat ke repo ini.
5. Buat task list dari langkah-langkah di bawah dan perbarui statusnya.

## 0A. Tentukan mode tata kelola (langkah pertama)

Sebelum langkah lain, tanyakan mode ke pengguna, dengan rujukan ke `00-framework/09-operating-modes.md`:

- **`team`**: sistem diverifikasi tim lain secara rotasi, dengan Coordinator sebagai verifikator kedua dan penyetuju waiver.
- **`solo`**: satu orang atau satu tim memakai standar ini sendiri, tanpa tim lain maupun Coordinator terpisah; verifikasi dilakukan mandiri dan tidak independen.

Bila `solo`, tanyakan juga:
- `owner`: penanggung jawab tunggal (harus termasuk anggota tim);
- `reason`: mengapa verifikasi lintas tim tidak tersedia;
- (opsional) nama `external_reviewers`: orang di luar tim yang bersedia mereview, mis. dosen, staf IT mitra, atau rekan organisasi lain.

Jangan mengisi nama dari tebakan. Hasilnya ditulis ke blok `governance` di `profile.yaml` (langkah 5), dengan `since` = tanggal hari ini.

## 1. Ambil standar pusat (read-only)

1. Clone `https://github.com/Vextronode/governance-awg.git` pada tag versi ke direktori sementara **di luar repo ini** (mis. `$(mktemp -d)/governance-awg`), memakai `git clone --depth 1 --branch <versi>`. Bila tag tidak ada, berhenti dan laporkan. Jangan memakai branch lain diam-diam.
2. Baca seluruh `00-framework/`, `catalog/baseline.yaml`, `catalog/modules/*.yaml`, `seeds/<system>.yaml` (bila ada), `templates/system/`, dan `templates/reports/adoption-gap-report.md`.
   - **Bila `seeds/<system>.yaml` tidak ada** (sistem di luar program, RFC-0002 A.7): katakan ke pengguna bahwa sistem ini diadopsi **tanpa usulan seed**, lalu lewati semua langkah seed (perbandingan `stack_confirmed`, `candidate_critical_paths`, `proposed_sys_controls`). Modul, critical path, dan kontrol SYS dirumuskan dari kode dan jawaban pengguna saja.
3. Install validator: `npm ci` di `<pusat>/tools/awg-validate`.

## 2. Kenali sistem dari kode

1. Deteksi stack (composer.json, package.json, konfigurasi DB, `.env.example`, Dockerfile, workflow CI) beserta versi runtime dan framework. Bila ada seed, bandingkan dengan `stack_confirmed` di seed. Bila berbeda, tampilkan perbedaannya dan tanyakan mana yang benar.
2. Untuk **setiap** modul katalog (11 modul), cari bukti memakai `detection_hints` modul tersebut. Susun tabel: `Modul | Terdeteksi? | Bukti (path) | Usulan aktif/tidak`.
3. Khusus per sistem, wajib ditanyakan walau kode sepertinya sudah menjawab. Pertanyaan ini **hanya** untuk ID yang tercantum di bawah; sistem lain tidak ditanya:
   - **SIGAP:** apakah ada perangkat ESP8266/ESP32 yang mengirim data (modul IOT-INGEST)? apakah ada fitur GIS/peta? apakah SIGAP mengirim peringatan ke warga (SYS-SIGAP-004, NOTIFY)? bagaimana autentikasi setelah lepas dari Firebase?
   - **CIMART:** status keputusan payment gateway; apakah saat ini memakai transfer manual (MOD-PAYMENT-007)?
   - **VDASH:** stack dan hosting; sistem sumber mana yang sudah terhubung; apakah ada login?
   - **SID:** apakah ada import/ekspor Excel data warga (BULK-IMPORT)? apakah ada notifikasi WhatsApp/email (NOTIFY)?
4. Konfirmasi daftar modul aktif/tidak aktif ke Tech Lead. Setiap modul **wajib** punya `reason`, dan modul aktif wajib punya `evidence` path.

## 3. Lengkapi data profil (tanyakan pengguna)

Tanyakan hal yang tidak bisa diketahui dari kode:
- Nama Tech Lead dan **daftar anggota tim** (dipakai untuk cek independensi verifikator).
- Gate terakhir yang sudah lulus (`adoption.gate_at_adoption`), mengacu ke Program Gates Guide.
- Hosting production dan staging: penyedia, pengelola, URL. Bila belum ada, tulis TODO.
- Critical paths: tampilkan `candidate_critical_paths` dari seed (bila ada seed) dan rute/fitur yang terdeteksi, lalu minta Tech Lead memilih atau merevisi (minimal 3, BASE-QA-001).
- Estimasi puncak pengguna konkuren beserta dasarnya (BASE-PERF-002). Bila belum tahu, tulis TODO; jangan isi angka sendiri.
- Kontak resmi Pengendali Data di sisi mitra (BASE-PRIV-008). Bila belum ada, tulis TODO.

## 4. Kontrol lokal (SYS)

1. Bila ada seed, tampilkan setiap `proposed_sys_controls` dari seed, beserta bukti relevan dari kode bila ada. Bila tidak ada seed, lewati langkah 1–2 ini.
2. Untuk setiap usulan, tanyakan: terima apa adanya / terima dengan revisi / tolak (dengan alasan). Kontrol `conditional: true` hanya dimasukkan bila kondisinya terkonfirmasi.
3. Tanyakan apakah ada kelemahan khusus sistem yang belum tercakup katalog maupun seed. Tulis hanya yang dirumuskan atau disetujui Tech Lead.
4. Tulis `docs/awg/controls-local.yaml` dengan field sesuai katalog (`source: seed|team`). Usulan yang ditolak dicatat di gap report beserta alasannya.

## 5. Scaffold `docs/awg/`

Salin dari `templates/system/` lalu isi:
- `awg.lock.yaml`: versi dan tanggal hari ini.
- `profile.yaml`: hasil langkah 0A dan 2–3. Mode `team` boleh memakai blok `governance` default template (`mode: team`); mode `solo` mengisi `mode: solo`, `since`, `reason`, `owner`, dan `external_reviewers`.
- `waivers.yaml`: kosong (`waivers: []`). Jangan membuat waiver; kandidat waiver cukup dicatat di gap report.
- `runbook.md`: isi bagian yang bisa dipastikan dari kode (lokasi/konfigurasi log, ada/tidaknya endpoint health, perintah deploy bila ada skrip). Selebihnya TODO.
- `README.md`: ringkasan dan cara menjalankan validator secara lokal.

## 6. Penilaian awal per kontrol → `status.yaml` + gap report

Untuk **setiap** kontrol yang berlaku (BASE semua, MOD aktif, SYS lokal):
1. Baca `statement` dan `verification`, lalu cari bukti di repo (kode, test, config CI, dokumen). Contoh pemeriksaan:
   - SEC-010: jalankan `gitleaks detect` bila tersedia. Bila tidak, catat sebagai TODO dan **jangan** menyatakan bersih.
   - SEC-013: cek workflow CI untuk `composer audit` / `npm audit`.
   - SEC-006: grep raw query (`DB::raw`, `whereRaw`, `selectRaw`, template string SQL, `query(` dengan penggabungan string).
   - SEC-007: grep `dangerouslySetInnerHTML`, `{!!`.
   - PRIV-003: grep `localStorage`, `sessionStorage`, logging payload request.
   - PERF-005: periksa endpoint daftar untuk pagination.
   - QA-002: petakan critical path ke file test.
2. Tetapkan status awal sesuai aturan 0.2, dan isi `evidence` dengan path yang ditemukan.
3. Tandai kontrol yang `gate`-nya ≤ `gate_at_adoption` sebagai **utang retroaktif** di gap report (framework 03 §E.4).
4. Jalankan secret scan dan audit dependency hanya dalam mode **baca**. Jangan memperbaiki apa pun; temuan dicatat.

Tulis `docs/awg/reports/adoption-gap-report-<YYYY-MM-DD>.md` dari template, berisi:
- tabel per kontrol (ID, judul, severity, gate, status awal, bukti/temuan, utang retroaktif ya/tidak);
- **Top prioritas**: kontrol `critical` dan `non_waivable` yang belum `implemented`, diurutkan menurut gate;
- kandidat waiver, beserta alasan mengapa layak diajukan (bukan keputusan);
- semua TODO(awg) dan pertanyaan terbuka.

## 7. Threat model

1. Bila repo sudah punya threat model (format v1 `threat-model-<system>.yaml` atau lainnya), migrasikan ke format v2 (skala 1–3, `score`, `related_controls`), lalu tunjukkan perubahan rating ke Tech Lead.
2. Bila belum ada, buat draf `docs/awg/threat-model.yaml`:
   - Elemen DFD disusun dari kode (rute/controller, model/tabel, integrasi eksternal), dengan trust boundary minimum sesuai framework 04 untuk sistem ini.
   - Finding STRIDE boleh disusulkan dengan `source: claude-draft`, minimal satu per perlintasan boundary, dan setiap finding diisi `related_controls`.
   - Field `review` dibiarkan kosong. Tulis di gap report bahwa draf **wajib** direview Tech Lead dan DevOps Coordinator (BASE-GOV-001). Di mode `solo` tidak ada DevOps Coordinator; cara memenuhi BASE-GOV-001 di mode solo belum ditetapkan (`rfc/OPEN-QUESTIONS.md` bagian C), jadi catat sebagai pertanyaan terbuka di gap report.

## 8. Validasi & CI

1. Jalankan `node <pusat>/tools/awg-validate/awg-validate.mjs system --governance <pusat> --awg docs/awg --summary`.
2. Perbaiki **hanya error struktural** (format, field wajib, cakupan ID). Pelanggaran substantif (mis. kontrol belum dikerjakan) memang diharapkan dan tidak "diperbaiki" dengan mengubah status.
3. Jalankan juga `--gate <gate berikutnya setelah gate_at_adoption>` dan tempel daftar pemblokirnya ke gap report.
4. Tanyakan apakah workflow `templates/ci/awg-validate.yml` perlu dipasang ke `.github/workflows/awg-validate.yml` (warn-only). Pasang hanya bila disetujui. Bila repo tidak di GitHub, catat sebagai TODO.

## 9. Commit & laporan

1. Commit di branch `chore/awg-v2-adoption`: `docs(awg): adopt AWG v2 profile, status, threat model draft, gap report`.
2. Laporkan di chat:
   - modul aktif dan kontrol SYS yang diterima;
   - rekap status (dari `--summary`);
   - 10 prioritas teratas dari gap report;
   - pemblokir gate berikutnya;
   - TODO(awg) yang butuh jawaban manusia;
   - **di mode `solo`**: nyatakan bahwa verifikasi akan dilakukan sendiri sesuai aturan S-1 s.d. S-7 (framework 09 §4) dan **bukan** verifikasi independen. Jelaskan cara mengajak external reviewer untuk kontrol `critical`: tambahkan namanya ke `governance.external_reviewers`, minta ia memeriksa bukti sesuai field `verification` kontrol, lalu catat hasilnya sebagai entri `verification` dengan `verifier_role: external_reviewer` (S-6a). Tanpa external reviewer, kontrol `critical` butuh `self_review` plus evidence `test`/`ci_run` (S-6b);
   - langkah berikutnya: review threat model (oleh DevOps Coordinator di mode `team`; di mode `solo` lihat pertanyaan terbuka BASE-GOV-001); push branch dan PR (**tunggu persetujuan**); pembagian kontrol prioritas menjadi issue/task per developer; penjadwalan verifikasi dengan tim rotasi (mode `team`) atau jadwal `self_review` minimal 1 hari setelah `implemented_at` dan permintaan ke external reviewer (mode `solo`).
3. Hapus direktori sementara clone repo pusat.
