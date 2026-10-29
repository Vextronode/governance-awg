# Mode Tata Kelola: `team` dan `solo`

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/09-operating-modes.md |
| Versi | 2.1.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | [RFC-0002](../rfc/0002-operating-modes.md) Bagian A |

---

## 1. Prinsip

Mode mengubah **siapa** yang memverifikasi, bukan **apa** yang wajib. Katalog kontrol, severity, class, gate, status, threat model, dan exit criteria defect sama persis di kedua mode. Yang berbeda hanya aturan verifikasi dan persetujuan waiver.

## 2. Kapan memakai `team` dan kapan `solo`

| Kondisi proyek | Mode |
|---|---|
| Verifikasi lintas tim tersedia: ada tim lain dan/atau Coordinator terpisah yang dapat memverifikasi (mis. Program Capstone Cibenda) | `team` (SEBAIKNYA, RFC-0002 A.1) |
| **Tidak ada** tim lain maupun Coordinator terpisah yang dapat memverifikasi (mis. proyek di luar program, proyek klien, proyek pribadi) | `solo` |

## 3. Deklarasi mode (A.1)

Mode ditulis di blok `governance` pada `docs/awg/profile.yaml`. Bila blok ini tidak ada, sistem dianggap `team`.

```yaml
governance:
  mode: solo
  since: "2026-11-01"
  reason: "Proyek klien tanpa tim lain yang bisa memverifikasi"
  owner: "Nama Penanggung Jawab"   # harus tercantum di system.team
  external_reviewers: []           # opsional: orang di luar system.team
```

- `team`: seluruh aturan [02](02-tailoring-and-waiver.md), [03](03-verification-and-gates.md), dan [08](08-roles.md) berlaku tanpa perubahan.
- `solo`: aturan verifikasi dan waiver diganti oleh §4 dan §5 di bawah. Aturan lain tetap sama.
- Untuk `solo`, `reason` dan `owner` wajib diisi.

## 4. Verifikasi di mode `solo` (A.2, A.3)

Dua peran verifikator baru:

| `verifier_role` | Dipakai di | Siapa |
|---|---|---|
| `self_review` | hanya `solo` | Anggota `system.team`, dalam sesi terpisah dari implementasi |
| `external_reviewer` | `solo` (di `team` hanya dicatat) | Orang di luar `system.team`: dosen, staf IT mitra, rekan dari organisasi lain |

Entri status di mode `solo` wajib mencatat `implemented_at` (tanggal status menjadi `implemented`) untuk status `implemented` dan `verified`. Di mode `team` field ini opsional.

| Aturan | Penjelasan |
|---|---|
| S-1 | `verified` butuh minimal satu verifikasi `result: verified` dari `self_review` atau `external_reviewer`. |
| S-2 | `self_review` bertanggal minimal **1 hari kalender setelah** `implemented_at`. Review dilakukan di sesi lain, bukan langsung setelah selesai menulis. |
| S-3 | `self_review` wajib punya `note` yang menyebut apa yang diperiksa. |
| S-4 | Bila `system.team` berisi 2 orang atau lebih, `self_review` dilakukan oleh orang selain `owner` entri status itu. Bila tim 1 orang, aturan ini tidak berlaku. |
| S-5 | `external_reviewer` tidak boleh tercantum di `system.team`. |
| S-6 | Kontrol `critical` butuh salah satu: (a) verifikasi `external_reviewer` dengan `result: verified`, atau (b) `self_review` **dan** evidence bertipe `test` atau `ci_run` dengan `ref` konkret, yaitu bukti yang bisa dijalankan ulang mesin. |
| S-7 | Role `rotation`, `devops_coordinator`, `qa_coordinator`, dan `program_coordinator` tidak dipakai di `solo`. Validator memberi peringatan dan tidak menghitungnya. |

## 5. Waiver di mode `solo` (A.4)

| Aturan | Penjelasan |
|---|---|
| W-1 | `approved_by` minimal satu entri: role `owner` (nama sama dengan `governance.owner`) atau role `external_reviewer` (nama tidak tercantum di `system.team`). |
| W-2 | Aturan lain tetap: maksimal 90 hari, `score = likelihood × impact`, kontrol `non_waivable` tidak bisa di-waive, waiver kedaluwarsa membuat kontrol kembali tidak patuh. |
| W-3 | Untuk satu kontrol, paling banyak 2 waiver (asli + 1 perpanjangan) yang disetujui hanya oleh `owner`. Waiver ketiga dan seterusnya untuk kontrol yang sama wajib disetujui `external_reviewer`. |

## 6. Gate, laporan, dan transparansi (A.5)

- Di `solo`, keputusan gate diambil `governance.owner`. Program Gates Guide dipakai bila proyek berada di program tersebut; bila tidak, G3–G7 tetap dipakai sebagai tonggak siklus hidup.
- Output `--summary` dan `--gate` mencetak baris mode di bagian atas (`Mode tata kelola: team` atau `Mode tata kelola: solo (verifikasi mandiri, bukan independen)`), beserta jumlah kontrol `verified` lewat `external_reviewer` dibanding lewat `self_review` saja.
- Laporan gate ([verification-report.md](../templates/reports/verification-report.md)) mencantumkan mode. Di `solo`, laporan memuat kalimat: *"Verifikasi dilakukan secara mandiri. Status `verified` di laporan ini bukan hasil verifikasi independen lintas tim."*

## 7. Pergantian mode (A.6)

- **`solo` → `team`:** verifikasi `self_review` dan `external_reviewer` tidak dihitung. Entri `verified` yang hanya didukung verifikasi tersebut diperlakukan sebagai `implemented` untuk perhitungan gate (menjadi pemblokir). Validator memberi peringatan `solo-verification-in-team`, bukan error, jadi CI tidak langsung gagal. Kontrol tersebut perlu diverifikasi ulang sesuai [framework 03](03-verification-and-gates.md).
- **`team` → `solo`:** `since` dan `reason` diisi. Verifikasi team yang sudah ada tetap sah dan dihitung.
- Riwayat mode tidak disimpan di field khusus; riwayatnya ada di git history `profile.yaml`.

## 8. Sistem baru di luar program (A.7)

- ID sistem bebas selama mengikuti pola `^[A-Z][A-Z0-9]*$`.
- Sistem tanpa `seeds/<id>.yaml` diadopsi tanpa usulan seed: modul, critical path, dan kontrol SYS dirumuskan dari kode dan jawaban pengguna saja.

## 9. Apa yang hilang di mode solo

Mode `solo` lebih lemah daripada `team`. Laporan dan status sistem `solo` dibaca dengan kesadaran atas tiga hal berikut:

1. **Verifikasi tidak independen.** Orang yang memeriksa adalah orang yang sama, atau satu tim dengan yang mengerjakan.
2. **Waiver bisa disetujui sendiri.** Pemilik sistem bisa mengecualikan kontrol untuk dirinya sendiri, dibatasi W-3.
3. **Keputusan gate oleh orang yang sama yang mengerjakan.**

Mitigasinya:

| Mitigasi | Menahan |
|---|---|
| S-2 (masa jeda 1 hari) | Review terburu-buru tepat setelah menulis kode |
| S-6 (critical: reviewer eksternal atau bukti yang bisa dijalankan ulang) | Klaim tanpa bukti pada kontrol paling berdampak |
| W-3 (waiver ke-3 dst. wajib external reviewer) | Waiver yang diperpanjang terus-menerus |
| A.5 (baris mode dan kalimat wajib di laporan) | Pembaca mengira `verified` berarti diverifikasi independen |
