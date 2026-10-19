# docs/awg — Kepatuhan Standar AWG

Folder ini berisi profil, status, dan bukti kepatuhan sistem ini terhadap standar AWG (Architecture Working Group). Definisi kontrol tidak disalin ke sini; definisi ada di repo pusat `governance-awg` pada versi yang tercatat di `awg.lock.yaml`.

## Ringkasan

| Field | Nilai |
|---|---|
| Sistem | `<ID>` — `<nama sistem>` |
| Versi standar AWG | lihat `awg.lock.yaml` |
| Tech Lead | lihat `profile.yaml` |
| Gate terakhir yang lulus | lihat `profile.yaml` (`current_gate`) |

## Isi folder

| File | Isi |
|---|---|
| `awg.lock.yaml` | Repo pusat dan tag versi standar yang dipakai |
| `profile.yaml` | Identitas, stack, tim, gate, modul aktif, critical paths, target, hosting |
| `controls-local.yaml` | Kontrol khusus sistem (`SYS-<SYSTEM>-NNN`) |
| `status.yaml` | Status setiap kontrol yang berlaku (BASE + MOD aktif + SYS) |
| `waivers.yaml` | Waiver aktif dan riwayatnya |
| `threat-model.yaml` | Threat model DFD + STRIDE |
| `runbook.md` | Runbook operasional |
| `reports/` | Laporan gate, gap report adopsi, uji beban, uji restore, ZAP, tabletop, go/no-go |

## Menjalankan validator secara lokal

```bash
# ambil repo pusat pada tag yang tercatat di awg.lock.yaml
git clone --depth 1 --branch <versi> https://github.com/Vextronode/governance-awg.git /tmp/governance-awg
cd /tmp/governance-awg/tools/awg-validate && npm ci && cd -

# validasi seluruh file docs/awg/
node /tmp/governance-awg/tools/awg-validate/awg-validate.mjs system \
  --governance /tmp/governance-awg --awg docs/awg --summary

# periksa pemblokir sebelum mengklaim gate (contoh G5)
node /tmp/governance-awg/tools/awg-validate/awg-validate.mjs system \
  --governance /tmp/governance-awg --awg docs/awg --gate G5
```

Exit code: `0` lulus, `1` ada pelanggaran, `2` error penggunaan.

## Tautan

- Framework AWG: `00-framework/` di repo pusat (ruang lingkup, model kontrol, waiver, verifikasi & gate, threat modeling, incident response, handoff, defect, peran)
- Matriks gate: `catalog/GATE-MATRIX.md` di repo pusat
- Template laporan: `templates/reports/` di repo pusat
