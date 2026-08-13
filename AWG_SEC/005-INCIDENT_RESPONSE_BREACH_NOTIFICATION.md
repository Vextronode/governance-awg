# Incident Response & Breach Notification Flow
## Program Capstone Cibenda - SIGAP, SID, E-Commerce (CibendaMart)

| Field | Value |
|---|---|
| Document ID | AWG-SEC-005 |
| Versi | 1.0.0 |
| Status | Draft - Menunggu Governance Review |
| Pemilik | DevOps Coordinator (Architecture Working Group) |
| Berlaku Untuk | SIGAP, SID, E-Commerce - dengan penekanan berbeda per sistem (lihat Bagian 2) |
| Companion Files | `SECURITY_BASELINE_POLICY.md` Section 8 (Logging), Section 9 (Backup/Recovery), Section 11 (Baseline lama - digantikan dokumen ini) |
| Landasan Hukum | UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP Law) |

---

## 1. Tujuan

Dokumen ini melengkapi `SECURITY_BASELINE_POLICY.md` Bagian 11 dengan detail yang sebelumnya belum ada: **keputusan containment** (apa yang harus dilakukan secara teknis saat insiden terjadi - isolasi, take down, atau cukup dipantau) dan **proses notifikasi lengkap** (bukan sekadar daftar kontak). Dokumen ini tidak mengulang Deteksi (sudah dibahas di Security Baseline Section 8) dan Recovery (sudah dibahas di Security Baseline Section 9) - di sini keduanya hanya dirujuk sebagai bagian dari alur besar incident response.

---

## 2. Ruang Lingkup - Tidak Seragam Antar Sistem

Kewajiban dokumen ini berbeda intensitas per sistem, karena data classification yang mereka tangani berbeda:

| Sistem | Data Tier Dominan | Kewajiban Breach Notification UU PDP | Kebutuhan Incident Response Teknis |
|---|---|---|---|
| **SID** | Tier 1 (PII penuh - NIK, KK, isi surat) | **Penuh berlaku** - ini adalah data pribadi inti | Penuh |
| **E-Commerce** | Tier 3 (transaksional), sebagian menyentuh Tier 1 (alamat pengiriman, kontak pembeli/penjual) | **Berlaku** untuk komponen data pribadi (alamat, kontak) - bukan untuk data transaksional teknis murni | Penuh |
| **SIGAP** | Tier 2 (operational/sensor) | **Tidak berlaku** - data sensor/lingkungan bukan data pribadi | Berlaku, tapi berfokus pada availability & integrity, bukan notifikasi data subject |

Konsekuensi praktis: SID dan E-Commerce menjalankan seluruh alur di Bagian 3-6 (termasuk notifikasi data subject). SIGAP menjalankan Bagian 3-4 (klasifikasi & containment) tapi Bagian 5 (notifikasi UU PDP) umumnya tidak relevan kecuali insiden ternyata menyentuh data operator/pengguna manusia (misalnya kredensial login operator lapangan bocor - itu tetap data pribadi terbatas).

---

## 3. Klasifikasi Severity

Severity ditentukan oleh **data tier yang terdampak** dan **luas dampak**, bukan oleh seberapa "menakutkan" insidennya terdengar.

| Severity | Kriteria | Contoh |
|---|---|---|
| **SEV-1 (Kritis)** | Data Tier 1/3 terekspos atau berpotensi terekspos ke pihak tidak berwenang; ATAU privilege escalation berhasil dieksploitasi (misal warga biasa mendapat akses approval Kasi/Kaur) | Database `letters`/data warga bisa diakses tanpa autentikasi; credential admin bocor di publik |
| **SEV-2 (Tinggi)** | Data Tier 1/3 berisiko terekspos tapi bukti eksploitasi belum ada; ATAU availability sistem terganggu total untuk fungsi kritis | Kerentanan ditemukan (misal endpoint approval tidak validasi `rt_id`) sebelum ada bukti disalahgunakan; sistem SID down total |
| **SEV-3 (Sedang)** | Data Tier 2/4 terdampak; ATAU gangguan availability parsial/sementara | Dashboard SIGAP tidak update sementara karena sync gagal; halaman publik down tapi sesi warga tetap jalan |
| **SEV-4 (Rendah)** | Anomali terdeteksi tanpa indikasi dampak nyata | Percobaan login gagal berulang tapi tidak ada bukti berhasil |

---

## 4. Panduan Keputusan Containment

Ini bagian yang menjawab langsung pertanyaan "apakah harus down atau bagaimana" - keputusan dipetakan ke severity, bukan diputuskan ad hoc saat panik.

| Severity | Aksi Containment | Siapa yang Berwenang Memutuskan |
|---|---|---|
| **SEV-1** | **Isolasi/take down segera** komponen yang terdampak (bukan seluruh sistem jika bisa diisolasi lebih sempit - misal disable satu endpoint, bukan matikan seluruh aplikasi, jika itu cukup untuk menghentikan eksposur). Revoke seluruh credential yang berpotensi terlibat. Jika tidak yakin bisa diisolasi sebagian, **matikan seluruh sistem yang terdampak** - availability yang hilang sementara lebih murah daripada eksposur data pribadi berkelanjutan. | Tech Lead sistem terkait + DevOps Coordinator, keputusan bersama, **tidak perlu menunggu approval berjenjang lain** mengingat urgensi |
| **SEV-2** | Terapkan mitigasi/patch secepatnya; sistem **boleh tetap berjalan** jika kerentanan belum terbukti dieksploitasi dan mitigasi bisa di-deploy dalam hitungan jam; jika mitigasi butuh waktu lebih dari 24 jam, pertimbangkan disable fitur spesifik yang rentan (bukan seluruh sistem) sampai patch siap | Tech Lead sistem terkait, dengan notifikasi ke DevOps Coordinator |
| **SEV-3** | Perbaikan dalam siklus kerja normal (sprint/maintenance window berikutnya); tidak perlu tindakan darurat | Tech Lead sistem terkait |
| **SEV-4** | Catat dan pantau; tidak ada aksi containment aktif diperlukan | Developer/Tech Lead, dicatat di log insiden |

**Prinsip pengambilan keputusan:** untuk SEV-1, **default ke containment yang lebih agresif** (matikan komponen/sistem) ketika ragu, karena konsekuensi dari eksposur data pribadi warga jauh lebih sulit dipulihkan dibanding downtime beberapa jam. Ini konsisten dengan orientasi threat model program (Security Baseline Section 1.2) - ancaman realistis di program ini adalah PII leak dan privilege escalation, bukan ancaman yang butuh sistem tetap hidup demi alasan strategis/keamanan nasional.

---

## 5. Proses Notifikasi

### 5.1 Escalation Path Internal (memperdalam Security Baseline Section 11)

```
Developer/siapa pun yang menemukan indikasi insiden
        ↓ (segera, maksimal dalam hitungan jam)
Tech Lead sistem terkait
        ↓ (untuk SEV-1/SEV-2, maksimal 24 jam)
DevOps Coordinator
        ↓ (untuk SEV-1 yang melibatkan data pribadi, maksimal 24 jam setelah containment)
Program Coordinator (PM)
        ↓ (jika PM menilai perlu, sesuai kewajiban UU PDP)
Data subject terdampak + otoritas pengawas terkait (bila diwajibkan)
```

### 5.2 Timeline Notifikasi

| Tahap | Target Waktu | Catatan |
|---|---|---|
| Deteksi → laporan ke Tech Lead | Sesegera mungkin, target < 4 jam sejak ditemukan | Tidak perlu menunggu investigasi lengkap - laporkan indikasi awal dulu |
| Tech Lead → DevOps Coordinator (untuk SEV-1/SEV-2) | < 24 jam | Sertakan severity awal dan aksi containment yang sudah/akan diambil |
| DevOps Coordinator → Program Coordinator (untuk insiden data pribadi SEV-1) | < 24 jam setelah containment awal | Program Coordinator yang menilai kebutuhan notifikasi ke data subject/otoritas |
| Program Coordinator → data subject/otoritas (bila diwajibkan UU PDP) | Tanpa penundaan yang tidak wajar sejak insiden diketahui merupakan pelanggaran data pribadi | Rujuk kewajiban spesifik UU PDP; dokumen ini tidak menggantikan konsultasi hukum bila diperlukan untuk kasus yang kompleks |

### 5.3 Isi Minimum Laporan Insiden (Internal)

Setiap laporan insiden ke atas rantai eskalasi wajib memuat:

1. Sistem yang terdampak (SIGAP/SID/E-Commerce).
2. Waktu deteksi dan (bila diketahui) waktu insiden sebenarnya mulai terjadi.
3. Data tier yang terdampak dan estimasi jumlah data subject (bila relevan).
4. Severity awal (Bagian 3) dan aksi containment yang sudah diambil (Bagian 4).
5. Status: masih berlangsung / sudah di-contain / sudah selesai.

### 5.4 Isi Minimum Notifikasi ke Data Subject (Bila Diwajibkan)

Rujuk kewajiban UU PDP - notifikasi kepada warga/pengguna yang terdampak minimal mencakup: jenis data yang terdampak, perkiraan waktu kejadian, langkah yang sudah diambil untuk mengatasi, dan langkah yang disarankan bagi data subject (misalnya waspada terhadap penyalahgunaan data). Template komunikasi spesifik disusun oleh Program Coordinator saat insiden terjadi, disesuaikan konteks - dokumen ini tidak menyediakan template siap pakai karena isi pastinya bergantung sifat insiden.

---

## 6. Post-Incident Review

Untuk setiap insiden SEV-1/SEV-2, wajib ada review singkat (tidak perlu formal/panjang, sesuai skala program ini) yang mencatat:

- Root cause.
- Apakah containment yang diambil sudah tepat (terlalu agresif/kurang agresif dibanding Bagian 4).
- Kontrol apa dari `security-baseline-controls.yaml` yang seharusnya mencegah ini, dan apakah statusnya `done` saat insiden terjadi (jika masih `not_started`, ini adalah sinyal prioritas ulang, bukan kegagalan individu).
- Perubahan apa (kontrol baru, revisi threat model sistem terkait) yang perlu masuk sebagai tindak lanjut.

---

## 7. Perbedaan Penerapan Per Sistem - Ringkasan

| Aspek | SID | E-Commerce | SIGAP |
|---|---|---|---|
| Klasifikasi severity (Bagian 3) | Penuh | Penuh | Penuh |
| Containment decision (Bagian 4) | Penuh | Penuh | Penuh |
| Notifikasi ke data subject (Bagian 5.4) | Berlaku penuh | Berlaku untuk komponen data pribadi (alamat/kontak), tidak untuk data transaksi murni | Umumnya tidak berlaku, kecuali insiden menyentuh kredensial/data pribadi operator |
| Kewajiban UU PDP formal | Ya | Ya (sebagian) | Tidak, kecuali kasus di atas |

---

## 8. Versioning dan Review

| Versi | Tanggal | Perubahan | Author |
|---|---|---|---|
| 1.0.0 | Draft | Dokumen awal: klasifikasi severity, panduan containment, proses notifikasi lengkap, ringkasan penerapan per sistem | DevOps Coordinator |

**Catatan:** Bagian 11 di `SECURITY_BASELINE_POLICY.md` tetap ada sebagai baseline ringkas, tapi untuk keputusan operasional saat insiden nyata terjadi, dokumen ini (AWG-SEC-005) yang menjadi rujukan utama.
