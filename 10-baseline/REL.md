# REL — Rilis & Deployment

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Membuat rilis ke production dapat diulang, dapat di-rollback, dan dapat diwariskan ke orang di luar tim.

## Konteks program

Production berada di hosting milik desa dan staging di hosting kampus (asumsi dari v1). Kondisi aktual hosting setiap sistem didokumentasikan di profil (BASE-REL-008), yang juga mengisi celah ID TPR-001 v1 yang tidak pernah ada. Kontrol rilis selaras dengan artefak G7 Program Gates (Deployment Guide, verifikasi pasca deployment).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-REL-001 | Environment terpisah dan setara | high | non_waivable | G5 |
| BASE-REL-002 | Konfigurasi lewat environment dan .env.example lengkap | medium | non_waivable | G5 |
| BASE-REL-003 | Versi rilis dan changelog | medium | waivable | G7 |
| BASE-REL-004 | Perubahan skema hanya lewat migration | high | non_waivable | G5 |
| BASE-REL-005 | Deployment terdokumentasi dan dapat diulang | high | non_waivable | G7 |
| BASE-REL-006 | Prosedur rollback teruji | high | non_waivable | G7 |
| BASE-REL-007 | Go/no-go checklist | high | non_waivable | G7 |
| BASE-REL-008 | Penilaian kapasitas hosting | high | non_waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Environment (REL-001):** catat versi runtime dan DB per environment di `profile.yaml` (`stack.runtime_versions`, `environments`).
- **Konfigurasi (REL-002):** setiap variabel yang dibaca kode muncul di `.env.example` dengan nilai contoh non-rahasia dan keterangan.
- **Versi (REL-003):** tag SemVer dan entri CHANGELOG untuk setiap deploy production.
- **Migration (REL-004):** semua perubahan skema lewat migration yang direview; backup sesaat sebelum migration destruktif masuk go/no-go checklist.
- **Deployment dan rollback (REL-005, REL-006):** uji Deployment Guide dengan meminta anggota tim lain melakukan deploy ke staging hanya dari guide. Latihan rollback dicatat (tanggal, durasi, hasil).
- **Go/no-go (REL-007):** template [templates/reports/go-no-go-checklist.md](../templates/reports/go-no-go-checklist.md), disimpan per deploy di `docs/awg/reports/`.
- **Hosting (REL-008):** isi `hosting_assessment` di profil: spesifikasi, pengelola, akses (SSH/panel), dukungan backup, auto-renew TLS, keterbatasan.

## Kesalahan umum

- Mengubah skema langsung di database production lewat panel admin.
- Deploy dengan menyalin file manual dari laptop salah satu anggota tim.
- Staging memakai versi mayor PHP/Node/DB yang berbeda dari production.
- Rollback tidak pernah dicoba sampai benar-benar dibutuhkan.
