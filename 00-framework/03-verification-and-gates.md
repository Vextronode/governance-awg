# Verifikasi & Gate

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/03-verification-and-gates.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian E (menggantikan AWG-QC-001) |

---

## 1. Alur

1. **Self-assessment:** tim memperbarui `status.yaml` menjadi `implemented` beserta bukti.
2. **Verifikasi independen:** verifikator memeriksa bukti sesuai field `verification` kontrol, lalu mengisi blok `verification`.
3. **Klaim gate:** Tech Lead menjalankan `awg-validate system --gate Gx`. Bila hasilnya bersih, Tech Lead membuat **laporan verifikasi gate** (`docs/awg/reports/gate-Gx-YYYY-MM-DD.md`, template [verification-report.md](../templates/reports/verification-report.md)) dan mengajukannya ke Program Coordinator.
4. **Keputusan gate:** Program Coordinator memutuskan lulus atau tidak berdasarkan Program Gates Guide **dan** laporan AWG.

## 2. Independensi verifikator

- Verifikator **bukan** anggota tim sistem yang diverifikasi (dicek terhadap `system.team` di profil).
- Rotasi default: tim CIMART memverifikasi SID, tim SIGAP memverifikasi CIMART, tim VDASH memverifikasi SIGAP, tim SID memverifikasi VDASH. Rotasi boleh diubah oleh AWG dan dicatat di [08-roles.md](08-roles.md).
- Kontrol `critical` membutuhkan **dua** verifikasi: satu dari tim rotasi dan satu dari Coordinator domain (DevOps Coordinator untuk SEC/REL/DATA/OBS/PERF/MAINT dan modul teknis, QA Coordinator untuk QA, Program Coordinator untuk PRIV/GOV).
- Program Coordinator memutuskan gate dan menyetujui waiver. Program Coordinator **tidak** menjadi verifikator tunggal kontrol non-PRIV/GOV.
- Format blok:

```yaml
verification:
  - verifier: "<nama>"
    verifier_role: "rotation" # rotation | devops_coordinator | qa_coordinator | program_coordinator
    verifier_system: "CIMART" # sistem asal verifikator, atau "AWG" untuk coordinator
    date: "2026-11-02"
    result: "verified"        # verified | rejected
    note: "Diperiksa: tests/Feature/ApprovalTest.php lulus di CI run #123"
```

## 3. Aturan gate

Sebuah sistem **boleh mengklaim gate Gx** hanya bila semua kontrol yang berlaku (BASE + MOD aktif + SYS) dengan `gate` ≤ Gx berstatus:

- `verified`, atau
- `waived` (hanya untuk `waivable`, waiver aktif), atau
- `not_applicable` yang terverifikasi (hanya MOD/SYS).

Keterkaitan dengan dokumen PM: overlay ini **tidak mengubah** Program Gates Guide. Overlay ini menambahkan persyaratan kualitas, keamanan, dan privasi pada setiap gate. Ini menggantikan pernyataan v1 bahwa verifikasi "tidak blocking", yang sudah dihapus.

## 4. Aturan transisi (sistem yang sudah melewati sebagian gate)

- Saat adopsi, profil mencatat `adoption.gate_at_adoption` (gate terakhir yang sudah lulus).
- Kontrol dengan `gate` ≤ gate_at_adoption menjadi **utang retroaktif**. Utang ini tidak membatalkan gate yang sudah lulus, tetapi wajib beres sebelum sistem mengklaim gate **berikutnya**.
- Threat model (GOV-001) termasuk utang retroaktif bagi sistem yang sudah melewati G3.

## 5. Matriks gate

Matriks kontrol per gate **dihasilkan otomatis** oleh `awg-validate catalog --gate-matrix` ke [catalog/GATE-MATRIX.md](../catalog/GATE-MATRIX.md), dan CI memastikan file itu selalu sinkron dengan katalog. Dokumen ini hanya merujuk ke file tersebut dan tidak menyalin tabelnya.

## 6. Tool

Perintah validator dan arti exit code dijelaskan di [tools/awg-validate/README.md](../tools/awg-validate/README.md).
