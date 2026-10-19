# QA — Kualitas & Pengujian

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memberi definisi "siap rilis" yang objektif dan sama untuk semua tim: critical paths yang diuji otomatis, CI yang menegakkan aturan, klasifikasi defect bersama, dan UAT oleh pengguna nyata.

## Konteks program

v1 AWG-QC-001 mengatur verifikasi kepatuhan tetapi tidak mengatur pengujian itu sendiri, dan menyatakan verifikasi tidak blocking terhadap gate. v2 memindahkan model verifikasi ke [framework 03](../00-framework/03-verification-and-gates.md) (kini memblokir gate) dan menambahkan kontrol QA yang menjadi dasar exit criteria ([framework 07](../00-framework/07-defect-severity-and-exit-criteria.md)).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-QA-001 | Critical paths terdefinisi | high | non_waivable | G5 |
| BASE-QA-002 | Test otomatis untuk critical paths | high | non_waivable | G5 |
| BASE-QA-003 | CI dan proteksi branch utama | high | non_waivable | G5 |
| BASE-QA-004 | Klasifikasi defect bersama | medium | non_waivable | G5 |
| BASE-QA-005 | Exit criteria rilis dipenuhi | critical | non_waivable | G6 |
| BASE-QA-006 | UAT oleh perwakilan pengguna nyata | high | non_waivable | G6 |
| BASE-QA-007 | Regresi dan smoke test sebelum deploy production | high | non_waivable | G7 |
| BASE-QA-008 | Matriks perangkat dan browser | medium | waivable | G6 |
| BASE-QA-009 | Aksesibilitas dasar | low | waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Critical paths (QA-001):** pilih alur yang bila gagal membuat sistem tidak berguna atau merusak data. Kandidat per sistem ada di `seeds/<sistem>.yaml` (usulan, dikonfirmasi saat adopsi). Setiap critical path di `profile.yaml` memetakan file test (`tests`) dan nama event log (`log_events`).
- **Test (QA-002):** untuk setiap critical path, tulis tiga jenis kasus: sukses, penolakan otorisasi (peran/objek salah), dan penolakan validasi. Contoh: Laravel Feature test, atau supertest untuk Express.
- **CI (QA-003):** satu workflow menjalankan install berbasis lockfile, lint, test, build, secret scan (SEC-010), dan audit dependency (SEC-013). Proteksi branch mewajibkan CI hijau dan satu review dari orang selain penulis.
- **Defect (QA-004, QA-005):** gunakan label `S1`–`S4` di issue tracker; jumlah defect terbuka per label dimasukkan ke laporan gate.
- **Rilis (QA-007):** checklist smoke test pasca-deploy ada di [templates/reports/go-no-go-checklist.md](../templates/reports/go-no-go-checklist.md).

## Kesalahan umum

- Test hanya untuk alur sukses; regresi otorisasi lolos tanpa terdeteksi.
- Branch utama tidak terproteksi sehingga commit langsung melewati CI.
- UAT dilakukan oleh anggota tim sendiri, bukan perwakilan peran pengguna nyata.
- Menguji hanya di browser desktop pengembang, padahal pengguna mengakses lewat ponsel kelas menengah-bawah.
