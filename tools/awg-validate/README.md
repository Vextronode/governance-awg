# awg-validate

Validator untuk katalog AWG v2 (repo pusat) dan folder `docs/awg/` di repo sistem. Spesifikasi: [RFC-0001 Bagian N.3](../../rfc/0001-awg-v2-restructure.md).

## Instalasi

Butuh Node.js ≥ 18.

```bash
cd tools/awg-validate
npm ci
```

Dependency: `yaml` (parser YAML) dan `ajv` (validasi JSON Schema draft 2020-12).

## Perintah

### Validasi katalog (repo pusat)

```bash
node awg-validate.mjs catalog --root ../..
```

Memeriksa `catalog/baseline.yaml`, `catalog/modules/*.yaml`, `seeds/*.yaml`, dan `templates/system/*.yaml`:

- schema (`catalog/schema/*.schema.json`);
- ID unik global, prefix sesuai lapis/modul/sistem;
- enum `severity`, `class`, `gate`, `evidence`;
- kontrol `critical` harus `non_waivable` (C.3);
- `supersedes` hanya merujuk 30 ID v1 yang sah (Bagian O.1), dan setiap ID v1 tercakup minimal sekali di katalog atau seed.

### Matriks gate

```bash
node awg-validate.mjs catalog --root ../.. --gate-matrix          # tulis catalog/GATE-MATRIX.md
node awg-validate.mjs catalog --root ../.. --gate-matrix --check  # gagal bila file usang
```

`catalog/GATE-MATRIX.md` dihasilkan tool dan tidak diedit manual. Setelah mengubah katalog, jalankan `--gate-matrix` lalu commit hasilnya; CI menjalankan `--check`.

### Validasi repo sistem

```bash
node awg-validate.mjs system --governance <path-governance-awg> --awg <path-docs-awg> [--gate Gx] [--summary]
```

Memeriksa:

- schema semua file `docs/awg/` (`profile`, `status`, `controls-local`, `waivers`, `threat-model`) dan isi `awg.lock.yaml`;
- `awg_version` di profile/status sama dengan `version` di `awg.lock.yaml`;
- modul aktif/tidak aktif ada di katalog, dengan `reason` dan (untuk modul aktif) `evidence`;
- `status.yaml` memuat **tepat sekali** setiap kontrol yang berlaku (semua BASE + MOD aktif + SYS lokal) dan tidak ada ID asing;
- syarat per status (C.4), termasuk larangan `not_applicable` untuk BASE;
- waiver (D.2): hanya untuk kontrol `waivable`, belum kedaluwarsa, maksimal 90 hari, dua penyetuju (Program Coordinator + Coordinator domain), penyetuju bukan anggota tim, `score = likelihood × impact`;
- verifikasi (E.2): verifikator bukan anggota `system.team`/`tech_lead`; kontrol `critical` butuh verifikasi `rotation` dan Coordinator domain; Program Coordinator bukan verifikator tunggal kontrol non-PRIV/GOV;
- threat model: `score = likelihood × impact`, `risk_rating` sesuai F.3, setiap trust boundary punya finding, `done` butuh `verification_evidence`.

Mode tata kelola ([RFC-0002](../../rfc/0002-operating-modes.md), [framework 09](../../00-framework/09-operating-modes.md)) dibaca dari `governance.mode` di `profile.yaml`. Tanpa blok `governance`, mode dianggap `team`, dan pemeriksaan di atas berlaku persis seperti v2.0.0. Di mode `solo`, aturan verifikasi dan penyetuju waiver diganti:

| Kode | Jenis | Aturan |
|---|---|---|
| `governance-mode` | error | `governance.mode` bukan `team`/`solo` |
| `governance-solo-fields` | error | Mode solo tanpa `reason`/`owner` (A.1) |
| `governance-owner` | error | `owner` tidak ada di `system.team` (A.1) |
| `solo-implemented-at` | error | `implemented`/`verified` tanpa `implemented_at` (A.2) |
| `solo-verification` | error | `verified` tanpa `self_review`/`external_reviewer` berhasil (S-1) |
| `solo-cooling-off` | error | `self_review` kurang dari 1 hari setelah `implemented_at` (S-2) |
| `solo-note` | error | `self_review` tanpa `note` (S-3) |
| `solo-self-owner` | error | Tim ≥ 2 orang, `self_review` oleh `owner` entri (S-4) |
| `external-team-member` | error | `external_reviewer` tercantum di `system.team` (S-5) |
| `solo-critical-evidence` | error | Kontrol `critical` tanpa external reviewer maupun `self_review` + evidence `test`/`ci_run` (S-6) |
| `solo-role-ignored` | peringatan | Role `rotation`/Coordinator di mode solo, tidak dihitung (S-7) |
| `solo-waiver-approvers` | error | Waiver tanpa penyetuju `owner` atau `external_reviewer` di luar tim (W-1) |
| `solo-waiver-renewal` | error | Waiver ke-3 dst. untuk kontrol yang sama tanpa `external_reviewer` (W-3) |

Di mode `team`, role `self_review`/`external_reviewer` tidak dihitung (A.6):

| Kode | Jenis | Aturan |
|---|---|---|
| `self-review-in-team` | error | `self_review` pada entri yang bukan `verified` |
| `solo-verification-in-team` | peringatan | Entri `verified` yang hanya didukung role solo; dihitung sebagai pemblokir di `--gate` |

Opsi:

- `--gate Gx` — daftar kontrol pemblokir untuk klaim gate Gx (framework 03 §3), dengan penanda **utang retroaktif** untuk kontrol yang gate-nya ≤ `adoption.gate_at_adoption` (§4). Mulai G6, finding threat model `critical`/`high` yang `not_started` juga memblokir (BASE-GOV-002).
- `--summary` — rekap per status, severity, dan domain/modul dalam format markdown ke stdout. Rekap ini **bukan** sumber kebenaran dan tidak disimpan.
- Dengan `--gate` atau `--summary`, baris pertama output adalah mode tata kelola beserta jumlah kontrol `verified` lewat `external_reviewer` dibanding lewat `self_review` saja (RFC-0002 A.5).

Contoh dari repo sistem (governance-awg di-checkout ke `.governance-awg`):

```bash
node .governance-awg/tools/awg-validate/awg-validate.mjs system \
  --governance .governance-awg --awg docs/awg --gate G5 --summary
```

## Exit code

| Kode | Arti |
|---|---|
| 0 | Lulus (peringatan `WARN` tidak menggagalkan) |
| 1 | Ada pelanggaran (`ERROR`) atau pemblokir gate |
| 2 | Error penggunaan (perintah/opsi salah, path tidak ada, schema tidak ditemukan) |

Setiap pelanggaran dicetak sebagai `ERROR [kode-aturan] <file>: <pesan>`.

## Interpretasi yang dipakai validator

Bagian berikut tidak ditetapkan eksplisit oleh RFC-0001; validator memakai interpretasi paling longgar yang tidak melanggar teks RFC, dan semuanya tercatat di [rfc/OPEN-QUESTIONS.md](../../rfc/OPEN-QUESTIONS.md):

- Verifikasi kedua kontrol `critical` untuk kontrol SYS: cukup salah satu Coordinator (RFC tidak menetapkan domain kontrol SYS). Untuk MOD dipakai DevOps Coordinator ("modul teknis").
- Penyetuju waiver untuk kontrol MOD/SYS: Program Coordinator + salah satu Coordinator lain.
- Batas `expires_at` hanya diperiksa terhadap 90 hari; tanggal target G7 belum ada di format profil.
- Seed diperiksa dengan aturan bawaan validator (tidak ada schema seed di RFC).

## Test

```bash
npm test
```

Test memakai `node:test` dengan fixture di `test/fixtures/`:

- `governance-mini/` — subset katalog untuk test perintah `system` (schema diambil dari `catalog/schema/` repo);
- `valid/` — `docs/awg/` valid dengan semua jenis status;
- `invalid/<aturan>/` — file yang menimpa `valid/` (atau salinan governance untuk `catalog-*`) dengan satu pelanggaran.
- `valid-solo/` — `docs/awg/` valid mode solo (RFC-0002);
- `invalid-solo/<aturan>/` — file yang menimpa `valid-solo/` dengan satu pelanggaran aturan solo;
- `mode-switch-team/` — overlay `valid-solo/` dengan mode diganti `team` (A.6).

Variabel `AWG_VALIDATE_TODAY=YYYY-MM-DD` menetapkan "hari ini" untuk pemeriksaan kedaluwarsa waiver; dipakai test agar hasilnya tidak berubah seiring waktu.
