# Ruang Lingkup & Prinsip AWG v2

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/00-scope-and-principles.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian A dan B |

---

## 1. Sistem dalam program

Fakta program yang sudah dikonfirmasi (RFC-0001 Bagian A):

| Sistem | ID | Stack (dikonfirmasi 2026-10-19) | Catatan |
|---|---|---|---|
| Sistem Informasi Desa (SIDUTama) | `SID` | Laravel + Sanctum, React, PostgreSQL | Data pribadi warga (NIK, KK), rantai approval surat RT → RW → Kadus → Kasi/Kaur |
| CibendaMart | `CIMART` | Laravel, React, MySQL | Payment gateway **belum diputuskan mitra** |
| SIGAP | `SIGAP` | React, Express, PostgreSQL | **Tidak lagi memakai Firebase.** Keberadaan perangkat ESP8266/ESP32 dan fitur GIS **belum dikonfirmasi** dan wajib dicek saat adopsi |
| Village Dashboard | `VDASH` | **Belum diketahui** — dideteksi saat adopsi | Sistem terpisah dengan repo sendiri, agregasi read-only dari sistem lain |

**Fakta v1 yang sudah usang (historis, tidak berlaku lagi):** Firebase (Auth/RTDB/Firestore/Cloud Functions) di SIGAP, Vercel dan `src/data/*.json` sebagai platform Dashboard, serta referensi ke AWG-SEC-004 / AWG-SEC-007 / `DFD_REVIEW_GUIDE.md` / `ENGINEERING_STANDARDS.md` (dokumen-dokumen tersebut tidak pernah ada). Istilah ini disebut di sini hanya sebagai catatan historis dan tidak boleh dipakai sebagai fakta.

**Hosting:** production di hosting milik desa, staging di hosting kampus (dari v1). Status ini dipertahankan sebagai asumsi, dan setiap sistem wajib mendokumentasikan kondisi aktualnya di profil (BASE-REL-008).

## 2. Ruang lingkup ancaman

Standar ini mengatur aplikasi web sektor publik dan komunitas berskala desa yang dikembangkan tim mahasiswa. Populasi ancaman yang realistis:

1. Penyerang oportunistik: kredensial terekspos, konfigurasi salah, dependency belum di-patch, brute-force login.
2. Penyalahgunaan oleh orang dalam atau eksposur tidak sengaja oleh operator berakses sah tetapi luas.
3. Privilege escalation dan IDOR di alur multi-peran (approval surat, penjual vs pembeli).
4. Gangguan ketersediaan akibat hosting yang kekurangan sumber daya dan konektivitas pedesaan.
5. Masalah integritas data dari input manual, import Excel, dan sinkronisasi.
6. **Pembusukan pasca-handoff**: dependency tidak di-patch, domain/sertifikat kedaluwarsa, akun dipegang pribadi mahasiswa.

Di luar ruang lingkup: aktor nation-state/APT, serangan fisik, sertifikasi ISO 27001/SOC 2, dan pentest formal (diganti uji keamanan ringan, BASE-SEC-022).

## 3. Landasan

- **Hukum:** UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP). Pasal 46: bila terjadi kegagalan pelindungan data pribadi, **Pengendali Data Pribadi** wajib menyampaikan pemberitahuan tertulis **paling lambat 3×24 jam** kepada (a) subjek data dan (b) lembaga. Isi minimum: data yang terungkap, kapan dan bagaimana data terungkap, serta upaya penanganan dan pemulihan. Dalam hal tertentu, pemberitahuan juga wajib kepada masyarakat.
- **Teknis (referensi, bukan mandat sertifikasi):** OWASP ASVS Level 1–2 dan OWASP Top 10. Rujukan ditulis dengan nama bab (mis. "ASVS – Authentication"), tanpa nomor versi.

## 4. Peran hukum data

- Untuk data warga atau pengguna riil, **Pengendali Data adalah mitra (Pemerintah Desa / pengelola koperasi)**. Tim capstone berkedudukan sebagai pihak yang memproses atas nama mitra selama pengembangan dan masa dukungan.
- Keputusan dan pengiriman notifikasi Pasal 46 adalah wewenang Pengendali. Tim berkewajiban **melapor cepat dan menyiapkan draf**, bukan memutuskan.
- Kedudukan ini wajib dikonfirmasi tertulis dengan mitra (BASE-PRIV-008). Interpretasi hukum yang belum pasti dikonfirmasi ke dosen pembimbing atau penasihat hukum mitra, dan dicatat di [rfc/OPEN-QUESTIONS.md](../rfc/OPEN-QUESTIONS.md).

## 5. Klasifikasi data

| Tier | Label | Contoh | Penanganan minimum |
|---|---|---|---|
| 1 | PII – Restricted | NIK, No. KK, nama + alamat, isi surat, riwayat approval, alamat pengiriman, nomor HP | Enkripsi in transit, akses berbasis peran, log akses, tidak boleh di log / URL / browser storage |
| 2 | Operational – Internal | Pembacaan sensor, telemetri, ID perangkat, threshold | Validasi integritas, log akses |
| 3 | Transactional – Restricted | Order, transaksi, referensi pembayaran, data anggota koperasi | Sama dengan Tier 1; data kartu **tidak pernah** disimpan |
| 4 | Public | Profil desa, berita, pengumuman, katalog produk | Kontrol integritas (cegah perubahan tidak sah) |

## 6. Prinsip

1. **Proporsional (Delivery > Complexity).** Kontrol harus bisa dikerjakan tim mahasiswa dan bisa diverifikasi. Kontrol yang tidak bisa diverifikasi tidak boleh ditulis.
2. **Bukti mengalahkan klaim.** Status `verified` hanya diberikan oleh verifikator di luar tim pelaksana.
3. **Satu sumber kebenaran.** Kontrol ditulis sekali di katalog. Status hanya ada di repo sistem. Rekap dihitung oleh tool dan tidak pernah diketik manual.
4. **Self-sustaining by design.** Sistem harus tetap aman dan bisa dioperasikan setelah tim capstone pergi.
5. **Jujur atas keterbatasan.** Item yang belum selesai dicatat terbuka (status, waiver, known issues), bukan disembunyikan.

## 7. Kata kunci normatif

- **WAJIB** — harus dipenuhi. Tidak dipenuhi berarti tidak patuh.
- **SEBAIKNYA** — diharapkan dipenuhi. Bila tidak, alasannya dicatat di `notes` status kontrol.
- **BOLEH** — opsional.

Kalimat seperti "direkomendasikan bila kapasitas memungkinkan" **dilarang** dipakai dalam statement kontrol.

## 8. Dokumen framework lainnya

- [01-control-model.md](01-control-model.md) — model kontrol tiga lapis
- [02-tailoring-and-waiver.md](02-tailoring-and-waiver.md) — tailoring dan waiver
- [03-verification-and-gates.md](03-verification-and-gates.md) — verifikasi dan aturan gate
- [04-threat-modeling.md](04-threat-modeling.md) — threat modeling
- [05-incident-response.md](05-incident-response.md) — incident response dan notifikasi
- [06-handoff-and-support.md](06-handoff-and-support.md) — handoff dan dukungan
- [07-defect-severity-and-exit-criteria.md](07-defect-severity-and-exit-criteria.md) — severity defect dan exit criteria
- [08-roles.md](08-roles.md) — peran
- [09-operating-modes.md](09-operating-modes.md) — mode tata kelola `team` dan `solo`
