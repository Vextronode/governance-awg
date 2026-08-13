# Post-Handoff Incident Response & Support Guarantee
## Program Capstone Cibenda - SIGAP, SID, E-Commerce (CibendaMart)

| Field | Value |
|---|---|
| Document ID | AWG-SEC-006 |
| Versi | 1.0.0 |
| Status | Draft - Menunggu Governance Review |
| Pemilik | DevOps Coordinator (Architecture Working Group) |
| Berlaku Untuk | SIGAP, SID, E-Commerce - periode **setelah** serah terima ke mitra |
| Companion Files | `INCIDENT_RESPONSE_BREACH_NOTIFICATION.md` (AWG-SEC-005 - berlaku selama development, diwariskan ke dev penerus bila ada) |
| Audiens | Operator mitra, dev penerus (bila ada), tim capstone saat ini |

---

## 1. Kenapa Dokumen Terpisah dari AWG-SEC-005

`INCIDENT_RESPONSE_BREACH_NOTIFICATION.md` (AWG-SEC-005) mengasumsikan struktur governance program (Developer → Tech Lead → DevOps Coordinator → Program Coordinator) **masih aktif**. Struktur itu bubar begitu tim capstone lulus dan serah terima selesai. Dokumen ini menutup gap tersebut: bagaimana insiden ditangani ketika struktur teknis yang membangun sistem sudah tidak ada, dan penerimanya adalah operator dengan kemampuan teknis yang **diasumsikan rendah secara default** (bukan optimis), sesuai keterbatasan SDM yang sudah diakui program ini.

---

## 2. Catatan Tanggung Jawab Hukum Pasca Serah Terima

Ini bukan detail teknis, tapi perlu dinyatakan eksplisit karena berdampak nyata: begitu serah terima selesai, kendali atas data (termasuk data pribadi warga di SID dan E-Commerce) berpindah ke **Pemerintah Desa** sebagai pengelola/pengendali operasional. Kewajiban breach notification UU PDP pasca serah terima melekat pada pihak yang memegang kendali sistem saat insiden terjadi - bukan otomatis kembali ke tim capstone yang sudah tidak lagi mengoperasikan sistem tersebut.

**Rekomendasi ke PM/Coordinator:** poin ini sebaiknya dinyatakan eksplisit dalam dokumen serah terima formal ke mitra (di luar scope dokumen teknis ini), supaya tidak ada ambiguitas siapa yang bertanggung jawab secara hukum atas insiden yang terjadi setelah tim capstone tidak lagi mengelola sistem.

---

## 3. Support Window yang Dijamin Tim Capstone

Dua skenario, dengan durasi dan tujuan berbeda:

| Skenario | Durasi | Tujuan Kontak | Sifat |
|---|---|---|---|
| **Tidak ada dev penerus** | **3 bulan** sejak tanggal serah terima | Tim capstone bersedia dihubungi untuk membantu insiden teknis (malfunction, dugaan serangan, pertanyaan operasional) | Guarantee window - komitmen aktif tim saat ini |
| **Ada dev penerus** | **1 bulan** sejak tanggal serah terima | Tim capstone bersedia dihubungi **oleh dev penerus** (bukan operator langsung) untuk menjelaskan arsitektur, keputusan desain, dan konteks yang tidak tercakup di dokumentasi tertulis | Knowledge transfer window - bukan on-call insiden |

**Penting - batasan yang wajib dikomunikasikan ke mitra sejak awal:**
- Kedua window ini adalah **best-effort**, bukan kontrak SLA formal dengan kewajiban hukum/finansial. Tim capstone adalah mahasiswa yang sudah lulus, bukan vendor berbayar.
- Setelah window berakhir (3 bulan tanpa dev penerus, atau 1 bulan dengan dev penerus), tim capstone **tidak lagi bertanggung jawab** memberi dukungan - ini harus jelas dari awal supaya tidak ada ekspektasi tidak realistis dari mitra di kemudian hari.
- Kontak selama window tetap melalui **satu titik kontak yang disepakati** (misal: satu nomor/email PIC dari tim capstone), bukan mengharapkan seluruh anggota tim merespons individual.

---

## 4. Jalur Eskalasi Pasca Serah Terima (Decision Tree untuk Operator)

Playbook ini ditulis untuk operator dengan asumsi kemampuan teknis rendah - bahasa awam, tanpa istilah teknis containment seperti di AWG-SEC-005.

```
Terjadi sesuatu yang tidak biasa 
(situs tidak bisa diakses, data hilang/berubah aneh,
ada laporan warga tidak bisa login, dsb.)
        │
        ▼
JANGAN coba utak-atik sendiri (jangan hapus data,
jangan restart server, jangan ubah setting) -
tindakan yang salah bisa memperparah masalah
atau menghilangkan bukti penyebabnya
        │
        ▼
Apakah masih dalam periode support window? ── TIDAK ──→ Hubungi hosting provider
        │ YA                                                (first line teknis) dan/atau
        ▼                                                    dev penerus bila ada dan
Ada dev penerus?                                              masih bisa dikontak
    │           │
   YA          TIDAK
    │           │
    ▼           ▼
Hubungi     Hubungi PIC tim
dev         capstone (dalam
penerus     window 3 bulan)
```

**Aturan sederhana untuk operator (tanpa istilah teknis):**
1. Kalau ragu, **jangan lakukan apa-apa ke sistem** - cukup laporkan dan tunggu arahan.
2. Kalau situs/aplikasi bermasalah parah (tidak bisa diakses sama sekali, atau ada indikasi data warga bocor), **segera hubungi kontak di atas**, jangan tunda menunggu jam kerja kalau kelihatannya serius.
3. Kalau hanya gangguan kecil (misal halaman lambat), boleh menunggu jam kerja normal untuk melapor.

---

## 5. Kebutuhan Engineering Sebelum Serah Terima (Backlog, Bukan Sekadar Dokumentasi)

Karena operator tidak akan mampu melakukan containment manual seperti yang dijelaskan di AWG-SEC-005 (isolasi endpoint, revoke credential via command line, dst.), sebagian kemampuan containment **wajib disederhanakan menjadi aksi yang bisa dilakukan operator awam** sebelum serah terima. Ini menjadi item backlog untuk Tech Lead per sistem, bukan hanya catatan dokumentasi:

- **Mode maintenance on/off** yang bisa diaktifkan operator lewat satu tombol/panel sederhana (bukan lewat server/CLI) - untuk situasi "matikan dulu sementara" tanpa perlu dev.
- **Tombol/mekanisme reset password admin** yang tidak butuh akses database langsung, untuk kasus credential admin dicurigai bocor.
- Kontak default (hosting provider, PIC tim capstone) dicantumkan **di dalam aplikasi itu sendiri** (misalnya di halaman admin), bukan hanya di dokumen terpisah yang bisa hilang/terlupakan.

**Catatan:** ini adalah rekomendasi kebutuhan fitur, keputusan final tetap ada di Tech Lead masing-masing sistem mengingat keterbatasan waktu yang mungkin ada.

---

## 6. Kisi-Kisi Konten Keamanan untuk 3 Book Guide

Dokumen ini **tidak** menulis isi book guide (itu scope Documentation Coordinator/Tech Lead) - ini hanya daftar konten keamanan yang wajib masuk ke masing-masing, supaya tidak terlewat:

### 6.1 Book Guide - User (Warga/Pembeli/Penjual)
- Cara mengenali hal yang mencurigakan sederhana (contoh: diminta password lewat WhatsApp/telepon itu tidak sah).
- Kontak resmi untuk melaporkan masalah (bukan link/nomor yang bisa dipalsukan).

### 6.2 Book Guide - Admin/Operator
- Seluruh isi Bagian 4 dokumen ini (decision tree eskalasi).
- Cara memakai fitur containment sederhana dari Bagian 5 (mode maintenance, reset password admin) - sebagai instruksi step-by-step bergambar, bukan penjelasan teknis.
- Daftar kontak: hosting provider, dev penerus (bila ada), PIC tim capstone beserta **tanggal berakhirnya window support** yang eksplisit tertulis (supaya operator tahu kapan support ini tidak lagi berlaku).
- Pengingat eksplisit: "Jangan berikan akses admin ke pihak yang tidak dikenal", "Jangan bagikan kredensial lewat chat".

### 6.3 Book Guide - Development Selanjutnya (bila ada dev penerus)
- Pewarisan penuh `SECURITY_BASELINE_POLICY.md`, `THREAT_MODEL_TEMPLATE.md`, `threat-model-<system>.yaml` (kondisi terakhir), `security-baseline-controls.yaml`, `DFD_REVIEW_GUIDE.md`, dan `INCIDENT_RESPONSE_BREACH_NOTIFICATION.md` (AWG-SEC-005) - seluruh dokumen governance security tim saat ini diserahkan utuh, bukan diringkas.
- Status kontrol terakhir (kolom `status` dan `verification_evidence` di `security-baseline-controls.yaml`) sebagai starting point, bukan mulai dari nol.
- Catatan eksplisit soal keterbatasan yang sudah diketahui tim saat ini (item yang statusnya masih `not_started` atau `in_progress` saat serah terima) - supaya dev penerus tahu itu bukan celah yang mereka lewatkan, tapi memang belum sempat dikerjakan.
- Jendela 1 bulan untuk bertanya langsung ke tim capstone (Bagian 3) - dorong dev penerus memanfaatkan window ini untuk klarifikasi keputusan desain yang tidak jelas dari dokumen saja.

---

## 7. Versioning dan Review

| Versi | Tanggal | Perubahan | Author |
|---|---|---|---|
| 1.0.0 | Draft | Dokumen awal: catatan tanggung jawab hukum pasca serah terima, support window (3 bulan tanpa dev penerus / 1 bulan dengan dev penerus), decision tree operator, kebutuhan engineering pre-handoff, kisi-kisi konten 3 book guide | DevOps Coordinator |

**Open item:** tanggal pasti serah terima belum ditentukan - window 3 bulan/1 bulan di dokumen ini dihitung relatif terhadap tanggal itu, bukan tanggal kalender tetap. Perbarui dokumen ini begitu tanggal serah terima final dan PIC kontak tim capstone sudah ditunjuk secara resmi.
