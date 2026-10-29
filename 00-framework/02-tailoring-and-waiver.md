# Tailoring & Waiver

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/02-tailoring-and-waiver.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian D |

---

## 1. Tailoring

1. **Menambah** kontrol (SYS-*) atau **memperketat** angka (mis. target performa): bebas, cukup dicatat di profil atau `controls-local.yaml`.
2. **Mengaktifkan / tidak mengaktifkan modul**: wajib disertai `reason` dan bukti (path kode) di `profile.yaml`. Verifikator memeriksa kebenarannya saat verifikasi GOV-003.
3. **Mengurangi atau melonggarkan** kontrol BASE/MOD: hanya lewat waiver. Kontrol `non_waivable` tidak bisa dikurangi.

## 2. Waiver

> Aturan penyetuju di bagian ini berlaku untuk mode `team`. Untuk mode `solo`, penyetuju diatur W-1 dan W-3 di [09-operating-modes.md](09-operating-modes.md) §5; aturan waiver lainnya tetap berlaku.

Disimpan di `docs/awg/waivers.yaml` repo sistem, di bawah key `waivers:`. Schema: [catalog/schema/waivers.schema.json](../catalog/schema/waivers.schema.json).

| Field | Isi |
|---|---|
| `id` | `WVR-<SYSTEM>-<NNN>` |
| `control` | ID kontrol `waivable` |
| `reason` | Mengapa belum atau tidak bisa dipenuhi |
| `risk` | `likelihood` dan `impact` (skala 1–3, lihat [04-threat-modeling.md](04-threat-modeling.md) §3) beserta `score` |
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

Format setiap penyetuju di `approved_by` (nama dan peran) mengikuti schema `waivers.schema.json`. Peran yang dikenali: `program_coordinator`, `devops_coordinator`, `qa_coordinator`.
