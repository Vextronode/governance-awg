# Peran

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/08-roles.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian J (rotasi verifikator dari Bagian E.2) |

---

## 1. Matriks tanggung jawab

| Aktivitas | Tech Lead sistem | Developer | Verifikator rotasi | DevOps Coord. | QA Coord. | Program Coord. | Documentation Coord. |
|---|---|---|---|---|---|---|---|
| Memelihara katalog & framework (repo pusat) | C | – | – | R (SEC/OBS/PERF/REL/DATA/MAINT) | R (QA) | A | R (struktur dokumen) |
| Profil, status, threat model sistem | A/R | R | – | C | C | I | – |
| Implementasi kontrol | A | R | – | C | C | – | – |
| Verifikasi kontrol | – | – | R | R (critical teknis) | R (critical QA) | R (critical PRIV/GOV) | – |
| Persetujuan waiver | Pengaju | – | – | A (domainnya) | A (QA) | A | – |
| Keputusan gate | Pengaju | – | I | C | C | A | I |
| Insiden | R | R | – | A (teknis) | I | A (notifikasi ke mitra) | – |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

## 2. Aturan konflik kepentingan

1. Tidak ada yang memverifikasi kontrol pada sistem tempat ia menjadi anggota tim.
2. Coordinator yang juga anggota tim sebuah sistem tidak boleh menyetujui waiver untuk sistem tersebut. Penggantinya ditunjuk Program Coordinator.

## 3. Rotasi verifikator

Rotasi default ([03-verification-and-gates.md](03-verification-and-gates.md) §2):

| Sistem yang diverifikasi | Tim verifikator rotasi |
|---|---|
| SID | CIMART |
| CIMART | SIGAP |
| SIGAP | VDASH |
| VDASH | SID |

Rotasi boleh diubah oleh AWG. Setiap perubahan dicatat di bagian ini.

Riwayat perubahan rotasi: belum ada (rotasi default berlaku).

## 4. Verifikasi ganda kontrol critical

Kontrol `critical` membutuhkan **dua** verifikasi: satu dari tim rotasi dan satu dari Coordinator domain:

| Lapis / domain | Coordinator verifikator kedua |
|---|---|
| SEC, REL, DATA, OBS, PERF, MAINT, dan modul teknis | DevOps Coordinator |
| QA | QA Coordinator |
| PRIV, GOV | Program Coordinator |

Program Coordinator memutuskan gate dan menyetujui waiver, tetapi **tidak** menjadi verifikator tunggal kontrol non-PRIV/GOV.

## 5. Peran di mode solo

Bagian 1–4 berlaku untuk mode `team`. Di mode `solo` ([09-operating-modes.md](09-operating-modes.md)) tidak ada tim rotasi maupun Coordinator terpisah; perannya menjadi:

| Peran | Siapa | Tugas |
|---|---|---|
| Owner (`governance.owner`) | Penanggung jawab tunggal, tercantum di `system.team` | Memutuskan gate; menyetujui waiver (dibatasi W-3) |
| Anggota tim (`system.team`) | Orang yang mengerjakan sistem | Implementasi kontrol; `self_review` di sesi terpisah (S-2 s.d. S-4) |
| External reviewer | Orang di luar `system.team` (mis. dosen, staf IT mitra, rekan organisasi lain) | Verifikasi `external_reviewer` (S-5, S-6); persetujuan waiver ke-3 dan seterusnya (W-3) |
