# Klasifikasi Defect & Exit Criteria

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/07-defect-severity-and-exit-criteria.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian I |

---

Kontrol terkait: BASE-QA-004 (klasifikasi defect bersama), BASE-QA-005 (exit criteria rilis dipenuhi), BASE-QA-007 (regresi dan smoke test), BASE-REL-007 (go/no-go checklist).

## 1. Severity defect

| Level | Kriteria | Contoh |
|---|---|---|
| S1 Blocker | Kehilangan atau korupsi data; kerentanan keamanan yang dapat dieksploitasi; alur inti tidak bisa dipakai tanpa workaround | Warga bisa melihat surat warga lain; checkout menggandakan pengurangan stok |
| S2 Major | Fitur inti memberi hasil salah atau rusak dengan workaround sulit | Notifikasi approval tidak terkirim; laporan transaksi salah total |
| S3 Minor | Fitur non-inti rusak, atau fitur inti terganggu dengan workaround mudah | Filter daftar tidak menyimpan pilihan |
| S4 Trivial | Kosmetik, typo, tata letak minor | Salah eja label |

## 2. Exit criteria

| Titik | Kriteria |
|---|---|
| Masuk G6 (UAT) | 0 defect S1 terbuka; seluruh test critical path lulus di CI; kontrol gate ≤ G6 terpenuhi ([03-verification-and-gates.md](03-verification-and-gates.md) §3) |
| Masuk G7 (Deploy) | 0 S1 dan 0 S2 terbuka (S2 boleh di-waive lewat waiver defect berformat sama dengan waiver kontrol, [02-tailoring-and-waiver.md](02-tailoring-and-waiver.md) §2); seluruh skenario UAT fitur inti lulus; S3/S4 tercatat di Known Issues; kontrol gate ≤ G7 terpenuhi |
| Setiap rilis production setelah G7 | 0 S1 baru; regresi otomatis lulus; go/no-go checklist lengkap (BASE-REL-007) |

Template terkait: [verification-report.md](../templates/reports/verification-report.md) (jumlah defect terbuka per S1–S4) dan [go-no-go-checklist.md](../templates/reports/go-no-go-checklist.md).
