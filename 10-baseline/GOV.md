# GOV — Tata Kelola

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/baseline.yaml](../catalog/baseline.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memastikan kepatuhan setiap sistem bisa dinilai secara objektif: ancaman dikenali sejak arsitektur, profil sistem mencerminkan kondisi nyata, dan setiap klaim gate meninggalkan jejak audit.

## Konteks program

Empat sistem (SID, CIMART, SIGAP, VDASH) dikembangkan tim berbeda dengan tingkat kematangan berbeda. Tanpa profil yang akurat, verifikator tidak tahu kontrol mana yang berlaku; tanpa laporan gate, keputusan Program Coordinator tidak bisa ditelusuri. Threat model menggantikan AWG-SEC-002/003 v1 dan kini memakai skala risiko 1–3 ([framework 04](../00-framework/04-threat-modeling.md)).

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| BASE-GOV-001 | Threat model sistem diajukan dan direview | high | non_waivable | G3 |
| BASE-GOV-002 | Tidak ada risiko critical/high yang belum dimitigasi saat UAT | high | non_waivable | G6 |
| BASE-GOV-003 | Profil AWG akurat dan mutakhir | high | non_waivable | G5 |
| BASE-GOV-004 | Laporan verifikasi per gate | medium | non_waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- Threat model ditulis di `docs/awg/threat-model.yaml` mulai dari template [templates/system/threat-model.yaml](../templates/system/threat-model.yaml). Trust boundary minimum per sistem ada di framework 04 §2.2.
- Jalankan `awg-validate system --awg docs/awg` setiap kali `profile.yaml` atau `status.yaml` berubah, dan sebelum setiap klaim gate.
- Laporan gate dibuat dari [templates/reports/verification-report.md](../templates/reports/verification-report.md) dengan output validator ditempel apa adanya.
- Modul aktif/tidak aktif selalu disertai `reason`, dan modul aktif disertai path kode sebagai bukti ([framework 02](../00-framework/02-tailoring-and-waiver.md) §1).

## Kesalahan umum

- Menganggap threat model sebagai dokumen sekali jadi; finding dengan status `not_started` yang ratingnya high/critical memblokir G6 (BASE-GOV-002).
- Profil yang menyatakan modul tidak aktif padahal kodenya ada (mis. ada endpoint unggah file tetapi FILE-UPLOAD dinyatakan tidak aktif).
- Daftar `system.team` yang tidak mutakhir, sehingga cek independensi verifikator tidak bermakna.
- Rekap status diketik manual di dokumen lain; rekap selalu diambil dari `awg-validate --summary`.
