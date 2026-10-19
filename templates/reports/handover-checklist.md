# Handover Checklist — `<SISTEM>`

> Paket handover (BASE-MAINT-005). Lengkapi bersama artefak G7 Program Gates, lalu serahkan dan minta konfirmasi penerimaan dari mitra.

| Field | Nilai |
|---|---|
| Sistem | |
| Versi aplikasi | |
| Versi AWG (`awg.lock.yaml`) | |
| Tanggal serah terima | |

## 1. Artefak G7 Program Gates

| Artefak | Lokasi | Status |
|---|---|---|
| `<sesuai Program Gates Guide>` | | ☐ |

## 2. Kontrol BASE-MAINT

| Kontrol | Isi yang diserahkan | Lokasi | Status |
|---|---|---|---|
| BASE-MAINT-001 | Tabel versi runtime/framework/DB + tanggal EOL | | ☐ |
| BASE-MAINT-002 | Inventaris aset dan akun (pemilik akun, tanpa password), dikonfirmasi mitra | | ☐ |
| BASE-MAINT-003 | Kalender perpanjangan + mekanisme pengingat ke operator | | ☐ |
| BASE-MAINT-004 | Fitur containment operator (mode maintenance, pemulihan akses admin, kontak di halaman admin) | | ☐ |
| BASE-MAINT-005 | Paket handover: runbook, Deployment Guide, prosedur backup/restore, Known Issues, snapshot status, waiver aktif, operator playbook | | ☐ |
| BASE-MAINT-006 | Berita acara serah terima kredensial (daftar, tanpa nilai) + rencana pencabutan akses tim | | ☐ |
| BASE-MAINT-007 | Jenis support window, PIC, tanggal berakhir (handover + halaman admin) | | ☐ |
| BASE-MAINT-008 | Panduan patching di book guide Development Selanjutnya | | ☐ |

## 3. Waiver aktif sebagai keterbatasan yang diketahui

| ID waiver | Kontrol | Alasan | Kedaluwarsa | Mitigasi pengganti |
|---|---|---|---|---|
| | | | | |

## 4. Snapshot status

Lampirkan output `awg-validate system --governance <path> --awg docs/awg --summary` pada tanggal serah terima dan salinan `docs/awg/status.yaml` pada commit/tag yang diserahkan.

```text
<tempel output --summary>
```

## 5. Penerimaan

| Pihak | Nama | Tanggal | Tanda tangan |
|---|---|---|---|
| Tech Lead | | | |
| Mitra | | | |
