# RFC-0002 — Mode Tata Kelola `team` dan `solo`

| Field | Nilai |
|---|---|
| ID | RFC-0002 |
| Judul | Mode tata kelola `team` dan `solo` (verifikasi mandiri) |
| Status | Disetujui |
| Tanggal | 2026-10-29 |
| Berlaku mulai | governance-awg v2.1.0 |
| Prinsip | Mode mengubah *siapa* yang memverifikasi, bukan *apa* yang wajib. Katalog kontrol, severity, class, dan gate identik di kedua mode. |
| Dokumen terkait | [RFC-0001](0001-awg-v2-restructure.md), [framework 09](../00-framework/09-operating-modes.md) |

---

## Bagian A — Spesifikasi normatif

### A.1 Deklarasi mode

Mode dideklarasikan di `docs/awg/profile.yaml`:

```yaml
governance:
  mode: solo                  # team | solo. Blok tidak ada = team
  since: "2026-11-01"         # tanggal mode ini mulai berlaku
  reason: ""                  # WAJIB untuk solo: mengapa verifikasi lintas tim tidak tersedia
  owner: ""                   # WAJIB untuk solo: penanggung jawab tunggal; harus tercantum di system.team
  external_reviewers: []      # opsional: nama orang DI LUAR system.team yang bersedia mereview
```

- `team`: seluruh aturan framework 02, 03, dan 08 v2.0.0 berlaku tanpa perubahan.
- `solo`: aturan verifikasi dan waiver diganti oleh A.2–A.4. Aturan lain (kontrol berlaku, status, threat model, gate, exit criteria defect) tetap sama.
- Mode `solo` dipakai bila **tidak ada** tim lain maupun Coordinator terpisah yang dapat memverifikasi. Bila verifikasi lintas tim tersedia, **SEBAIKNYA** memakai `team`.

### A.2 Peran verifikator baru

| `verifier_role` | Mode | Arti |
|---|---|---|
| `self_review` | hanya `solo` | Review oleh anggota `system.team` dalam sesi terpisah dari implementasi |
| `external_reviewer` | `solo` (dan dicatat saja di `team`) | Orang di luar `system.team`, mis. dosen, staf IT mitra, atau rekan dari organisasi lain |

Field status baru: `implemented_at` (tanggal ISO saat status menjadi `implemented`). Wajib di mode `solo` untuk status `implemented` dan `verified`, opsional di mode `team`.

### A.3 Aturan verifikasi mode `solo`

| ID | Aturan |
|---|---|
| S-1 | Status `verified` membutuhkan minimal satu verifikasi `result: verified` dengan role `self_review` atau `external_reviewer`. |
| S-2 | Verifikasi `self_review` WAJIB bertanggal **minimal 1 hari kalender setelah** `implemented_at` (masa jeda: review dilakukan di sesi berbeda, bukan langsung setelah selesai menulis). |
| S-3 | Verifikasi `self_review` WAJIB memiliki `note` yang tidak kosong, berisi apa yang diperiksa. |
| S-4 | Bila `system.team` berisi ≥ 2 orang, verifikator `self_review` WAJIB **bukan** `owner` entri status tersebut. Bila 1 orang, aturan ini tidak berlaku. |
| S-5 | Verifikator `external_reviewer` WAJIB **tidak** tercantum di `system.team` (aturan independensi tetap berlaku). |
| S-6 | Kontrol `critical` WAJIB memenuhi salah satu: (a) minimal satu verifikasi `external_reviewer` dengan `result: verified`; atau (b) `self_review` **dan** `evidence` yang memuat minimal satu item bertipe `test` atau `ci_run` dengan `ref` konkret (bukti yang dapat dijalankan ulang mesin). |
| S-7 | Role `rotation`, `devops_coordinator`, `qa_coordinator`, dan `program_coordinator` tidak dipakai di `solo`. Bila ada, validator memberi peringatan dan role tersebut tidak dihitung. |

### A.4 Aturan waiver mode `solo`

| ID | Aturan |
|---|---|
| W-1 | `approved_by` minimal satu entri dengan role `owner` (nama = `governance.owner`) **atau** `external_reviewer` (nama tidak tercantum di `system.team`). |
| W-2 | Batas 90 hari, `score = likelihood × impact`, larangan waiver untuk kontrol `non_waivable`, dan aturan kedaluwarsa tetap berlaku seperti di `team`. |
| W-3 | Untuk satu kontrol, paling banyak **2 waiver** (asli + 1 perpanjangan) yang disetujui hanya oleh `owner`. Waiver ketiga dan seterusnya untuk kontrol yang sama WAJIB disetujui `external_reviewer`. |

### A.5 Gate, laporan, dan transparansi

- Di `solo`, keputusan gate diambil oleh `governance.owner`. Program Gates Guide dipakai bila proyek berada dalam program tersebut. Bila tidak, gate G3–G7 tetap dipakai sebagai tonggak siklus hidup.
- Output `--summary` dan `--gate` WAJIB mencetak baris mode di bagian atas, yaitu `Mode tata kelola: team` atau `Mode tata kelola: solo (verifikasi mandiri, bukan independen)`, beserta jumlah kontrol yang `verified` lewat `external_reviewer` dibanding lewat `self_review` saja.
- Laporan gate (`verification-report.md`) WAJIB mencantumkan mode. Di `solo`, laporan juga memuat kalimat: *"Verifikasi dilakukan secara mandiri. Status `verified` di laporan ini bukan hasil verifikasi independen lintas tim."*

### A.6 Pergantian mode

- **`solo` → `team`:** di mode `team`, verifikasi berrole `self_review` dan `external_reviewer` **tidak dihitung**. Entri `verified` yang hanya didukung verifikasi tersebut diperlakukan sebagai `implemented` untuk perhitungan gate (menjadi pemblokir), dan validator memberi **peringatan** `solo-verification-in-team` (bukan error), sehingga CI tidak langsung gagal. Kontrol tersebut wajib diverifikasi ulang sesuai framework 03.
- **`team` → `solo`:** `since` dan `reason` wajib diisi. Verifikasi team yang sudah ada tetap sah dan dihitung.
- Riwayat mode tidak disimpan di field khusus. Riwayat ada di git history `profile.yaml`.

### A.7 Sistem baru di luar program

- ID sistem bebas selama mengikuti pola `^[A-Z][A-Z0-9]*$` (schema saat ini sudah demikian).
- Sistem tanpa file `seeds/<id>.yaml` diadopsi **tanpa usulan seed**: modul, critical path, dan kontrol SYS dirumuskan dari kode dan jawaban pengguna saja.
