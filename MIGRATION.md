# Migrasi AWG v1 → v2

Dokumen ini memetakan isi `governance-awg` v1 ke struktur AWG v2 (Baseline · Modul · Profil Sistem). Sumber: [RFC-0001 Bagian O](rfc/0001-awg-v2-restructure.md).

**Riwayat v1:** seluruh file v1 (`AWG_QC/`, `AWG_OBS/`, `AWG_SEC/`) dihapus dari branch utama di v2.0.0. Isinya tetap tersedia lewat tag git `v1-final` (HEAD terakhir sebelum refactor), mis. `git show v1-final:AWG_SEC/001-SECURITY_BASELINE_POLICY.md`.

## v2.0.0 → v2.1.0

v2.1.0 menambahkan mode tata kelola `solo` ([RFC-0002](rfc/0002-operating-modes.md)). Katalog kontrol tidak berubah.

- Repo sistem **tidak wajib** upgrade.
- Bila ingin upgrade, buat PR di repo sistem yang mengubah `version` di `docs/awg/awg.lock.yaml` serta `awg_version` di `profile.yaml` dan `status.yaml` menjadi `v2.1.0`.
- Bila tetap memakai mode `team`, tidak ada perubahan lain: profil tanpa blok `governance` dianggap `team`.
- Bila pindah ke mode `solo`, tambahkan blok `governance` (`mode: solo`, `since`, `reason`, `owner`) sesuai [framework 09](00-framework/09-operating-modes.md). Verifikasi team yang sudah ada tetap sah dan dihitung (A.6).

## v1 → v2.0.0

## 1. Pemetaan kontrol v1 (30 kontrol)

Summary v1 yang menyebut 27 kontrol adalah salah hitung; jumlah sebenarnya 30.

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

Field `supersedes` di katalog dan seed mencatat pemetaan ini; `awg-validate catalog` memastikan setiap ID v1 tercakup minimal sekali.

## 2. Pemetaan dokumen v1

| v1 | v2 |
|---|---|
| AWG-QC-001 | [00-framework/03-verification-and-gates.md](00-framework/03-verification-and-gates.md) (verifikasi kini memblokir gate; template laporan tersedia) |
| AWG-OBS-001 | [10-baseline/OBS.md](10-baseline/OBS.md) + BASE-OBS-* |
| AWG-OBS-002 | [10-baseline/PERF.md](10-baseline/PERF.md) + BASE-PERF-* + SYS-CIMART-001 (seed) |
| AWG-SEC-001 | [00-framework/00](00-framework/00-scope-and-principles.md) + [10-baseline/SEC.md](10-baseline/SEC.md) + [PRIV.md](10-baseline/PRIV.md) |
| AWG-SEC-002 | [00-framework/04-threat-modeling.md](00-framework/04-threat-modeling.md) |
| AWG-SEC-003 (schema) | [catalog/schema/threat-model.schema.json](catalog/schema/threat-model.schema.json) + [templates/system/threat-model.yaml](templates/system/threat-model.yaml) |
| AWG-SEC-005 | [00-framework/05-incident-response.md](00-framework/05-incident-response.md) |
| AWG-SEC-006 | [00-framework/06-handoff-and-support.md](00-framework/06-handoff-and-support.md) + BASE-MAINT-* |
| security-baseline-controls.yaml | [catalog/](catalog/) (definisi) + `docs/awg/status.yaml` per repo (status) |

## 3. Inkonsistensi v1 yang diperbaiki

1. Summary kontrol 27 vs aktual 30; severity 12/11 vs 13/13 → rekap kini dihitung tool.
2. ID TPR-001 hilang → kontrol hosting ditambahkan (BASE-REL-008).
3. Rujukan ke dokumen yang tidak ada (AWG-SEC-004/007, DFD_REVIEW_GUIDE.md, ENGINEERING_STANDARDS.md, template QC) → dihapus atau disediakan.
4. Nama file rujukan tidak cocok dengan nama file aktual → rujukan memakai path aktual.
5. Aturan G6 merujuk rating "critical" yang tidak ada di skala → skala F.3.
6. QC-001 berstatus "Disetujui" di atas standar "Draft" → seluruh v2 dirilis bersamaan sebagai v2.0.0.
7. QC-001 (tidak blocking) vs SEC-002 (blocking) → E.3 menetapkan blocking.
8. Timeline notifikasi tidak sesuai 3×24 jam Pasal 46 → G.3.
9. Fakta stack usang (Firebase, Vercel) → Bagian A.

## 4. Langkah untuk repo sistem (SID, SIGAP, CIMART, VDASH)

Status kontrol v1 di `security-baseline-controls.yaml` **tidak** dipindahkan otomatis. Setiap sistem mengadopsi v2 dari kondisi kodenya saat ini:

1. Salin [templates/claude/awg-adopt.md](templates/claude/awg-adopt.md) ke `.claude/commands/awg-adopt.md` di repo sistem.
2. Di repo sistem, jalankan:

   ```text
   /awg-adopt <SYSTEM>
   ```

   dengan `<SYSTEM>` = `SID`, `SIGAP`, `CIMART`, atau `VDASH`. Command ini membaca standar dari tag `v2.0.0`, mendeteksi modul dari kode, mengonfirmasi seed ke Tech Lead, membuat `docs/awg/` (profil, status, kontrol lokal, threat model draf, runbook), dan menulis adoption gap report.
3. Bila sistem punya threat model v1 (`threat-model-<system>.yaml`), command adopsi memigrasikannya ke format v2 (skala 1–3, `score`, `related_controls`).
4. Kontrol dengan gate ≤ `adoption.gate_at_adoption` menjadi utang retroaktif ([framework 03 §4](00-framework/03-verification-and-gates.md)).
5. Pasang workflow [templates/ci/awg-validate.yml](templates/ci/awg-validate.yml) (warn-only selama adopsi).
