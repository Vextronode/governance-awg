# Incident Response & Notifikasi Kegagalan Pelindungan Data

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/05-incident-response.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian G (menggantikan AWG-SEC-005; tabel containment dari v1 AWG-SEC-005 Bagian 4) |

---

## 1. Tujuan

Dokumen ini mengatur klasifikasi severity insiden, keputusan containment, timeline eskalasi dan notifikasi sesuai Pasal 46 UU PDP, serta post-incident review. Berlaku selama pengembangan dan masa dukungan. Penanganan setelah serah terima diatur di [06-handoff-and-support.md](06-handoff-and-support.md).

Kontrol terkait: BASE-PRIV-008 (kedudukan Pengendali ditetapkan tertulis), BASE-PRIV-009 (kesiapan notifikasi dan simulasi tabletop), BASE-SEC-020 (log peristiwa keamanan), BASE-DATA-004 (uji restore).

## 2. Severity insiden

| SEV | Kriteria |
|---|---|
| SEV-1 | Data Tier 1/3 terekspos atau berpotensi terekspos ke pihak tidak berwenang; ATAU privilege escalation berhasil dieksploitasi; ATAU kehilangan data tanpa backup yang dapat dipulihkan |
| SEV-2 | Data Tier 1/3 berisiko terekspos tanpa bukti eksploitasi; ATAU fungsi inti tidak tersedia total |
| SEV-3 | Data Tier 2/4 terdampak; ATAU gangguan ketersediaan parsial |
| SEV-4 | Anomali tanpa dampak nyata |

## 3. Containment

Tabel berikut disalin dari v1 AWG-SEC-005 Bagian 4 tanpa perubahan substansi. Keputusan dipetakan ke severity, bukan diputuskan ad hoc saat panik.

| Severity | Aksi Containment | Siapa yang Berwenang Memutuskan |
|---|---|---|
| **SEV-1** | **Isolasi/take down segera** komponen yang terdampak (bukan seluruh sistem jika bisa diisolasi lebih sempit - misal disable satu endpoint, bukan matikan seluruh aplikasi, jika itu cukup untuk menghentikan eksposur). Revoke seluruh credential yang berpotensi terlibat. Jika tidak yakin bisa diisolasi sebagian, **matikan seluruh sistem yang terdampak** - availability yang hilang sementara lebih murah daripada eksposur data pribadi berkelanjutan. | Tech Lead sistem terkait + DevOps Coordinator, keputusan bersama, **tidak perlu menunggu approval berjenjang lain** mengingat urgensi |
| **SEV-2** | Terapkan mitigasi/patch secepatnya; sistem **boleh tetap berjalan** jika kerentanan belum terbukti dieksploitasi dan mitigasi bisa di-deploy dalam hitungan jam; jika mitigasi butuh waktu lebih dari 24 jam, pertimbangkan disable fitur spesifik yang rentan (bukan seluruh sistem) sampai patch siap | Tech Lead sistem terkait, dengan notifikasi ke DevOps Coordinator |
| **SEV-3** | Perbaikan dalam siklus kerja normal (sprint/maintenance window berikutnya); tidak perlu tindakan darurat | Tech Lead sistem terkait |
| **SEV-4** | Catat dan pantau; tidak ada aksi containment aktif diperlukan | Developer/Tech Lead, dicatat di log insiden |

**Prinsip:** untuk SEV-1, bila ragu, lakukan containment yang lebih agresif (matikan komponen/sistem). Konsekuensi eksposur data pribadi warga jauh lebih sulit dipulihkan dibanding downtime beberapa jam.

## 4. Timeline eskalasi & notifikasi (Pasal 46 UU PDP)

T0 = saat indikasi insiden pertama kali diketahui siapa pun dalam tim. Untuk tujuan Pasal 46, program memakai interpretasi konservatif: **jam 3×24 dihitung dari T0**.

| Batas | Langkah | Pelaku |
|---|---|---|
| Segera | Mulai containment sesuai §3. Tidak menunggu eskalasi selesai. | Penemu + Tech Lead |
| ≤ T0 + 2 jam | Lapor ke Tech Lead (semua SEV, termasuk dugaan) | Penemu |
| ≤ T0 + 6 jam | Untuk dugaan SEV-1/SEV-2: lapor **paralel** ke DevOps Coordinator dan Program Coordinator, dengan laporan awal (template [incident-report.md](../templates/reports/incident-report.md)) | Tech Lead |
| ≤ T0 + 24 jam | Bila data pribadi mungkin terlibat: Program Coordinator memberi tahu **Pengendali Data (kontak resmi mitra)** dan menyerahkan laporan awal | Program Coordinator |
| ≤ T0 + 48 jam | Tim menyerahkan **draf notifikasi Pasal 46** (isi: data yang terungkap; kapan & bagaimana; upaya penanganan & pemulihan) kepada Pengendali | Program Coordinator + Tech Lead |
| ≤ T0 + 72 jam | Pengendali menyampaikan pemberitahuan tertulis kepada subjek data dan lembaga. Pengendali juga menilai kewajiban pemberitahuan kepada masyarakat. | Pengendali (mitra) |

Catatan:

- Bila lembaga pengawas PDP atau kanal resminya belum tersedia saat insiden, upaya pemberitahuan dan kanal yang dipakai tetap didokumentasikan.
- Interpretasi titik awal T0 dan kriteria pemberitahuan publik masih menjadi open question untuk dikonfirmasi ke dosen pembimbing atau penasihat hukum mitra (lihat [rfc/OPEN-QUESTIONS.md](../rfc/OPEN-QUESTIONS.md)).
- SIGAP umumnya tidak menangani data pribadi warga, tetapi kebocoran kredensial atau data operator tetap termasuk data pribadi.

## 5. Isi minimum laporan insiden

Laporan awal (template [incident-report.md](../templates/reports/incident-report.md)) memuat:

1. Sistem yang terdampak.
2. Waktu deteksi dan, bila diketahui, waktu insiden sebenarnya mulai.
3. Tier data yang terdampak dan estimasi jumlah subjek data (bila relevan).
4. Severity awal (§2) dan aksi containment yang sudah diambil (§3).
5. Status: masih berlangsung / sudah di-contain / sudah selesai.
6. Timeline §4 (target vs aktual) dan lampiran draf notifikasi Pasal 46.

## 6. Post-incident review

Wajib untuk SEV-1/SEV-2 (template [postmortem.md](../templates/reports/postmortem.md)): root cause, ketepatan containment, kontrol katalog mana yang seharusnya mencegah beserta statusnya saat insiden, dan tindak lanjut (kontrol baru, revisi threat model). Prinsip blameless: kontrol yang masih `not_started` saat insiden adalah sinyal prioritas ulang, bukan kegagalan individu.
