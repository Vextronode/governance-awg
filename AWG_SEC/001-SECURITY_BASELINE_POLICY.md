# Security Baseline Policy
## Program Capstone Cibenda - SIGAP, SID, E-Commerce (CibendaMart)

| Field | Value |
|---|---|
| Document ID | AWG-SEC-001 |
| Versi | 1.0.0 |
| Status | Draft - Menunggu Governance Review |
| Pemilik | DevOps Coordinator (Architecture Working Group) |
| Berlaku Untuk | SIGAP, SID, E-Commerce (CibendaMart) |
| Klasifikasi | Internal - Program Governance |
| Tanggal Berlaku | Setelah governance sign-off |
| Siklus Review | Setiap phase gate program (minimum G3, G5, G7), atau saat ada perubahan arsitektur material |
| Dokumen Terkait | ENGINEERING_STANDARDS.md, Village Dashboard Integration Spec |

---

## 1. Tujuan dan Ruang Lingkup

Dokumen ini mendefinisikan kebutuhan keamanan minimum yang berlaku untuk ketiga sistem yang dikembangkan dalam program Capstone Cibenda: **SIGAP** (Village Environmental Monitoring Platform), **SID** (Sistem Informasi Desa), dan **E-Commerce/CibendaMart** (marketplace koperasi desa).

### 1.1 Pernyataan Ruang Lingkup

Kebijakan ini mengatur sekumpulan **aplikasi web sektor-publik dan komunitas yang beroperasi pada skala desa**, dikembangkan oleh tim capstone mahasiswa, dan di-hosting pada kombinasi infrastruktur milik desa dan kampus. Kebijakan ini **tidak** mengatur, dan tidak boleh disamakan dengan, framework proteksi infrastruktur kritis nasional atau protokol penanganan rahasia negara. Perbedaan ini disengaja dan dicatat di sini untuk mencegah scope inflation pada review berikutnya (lihat Bagian 1.3).

### 1.2 Orientasi Threat Model

Populasi ancaman yang realistis untuk sistem-sistem ini terdiri dari:

- Penyerang oportunistik yang men-scan credential yang terekspos, storage yang salah konfigurasi, atau dependency yang belum di-patch (ancaman commodity, bukan targeted).
- Insider misuse atau eksposur data warga secara tidak sengaja oleh operator dengan akses yang legitimate namun luas (role RT/RW/Kadus/Kasi/Kaur).
- Gangguan availability akibat konektivitas rural yang tidak stabil (edge device SIGAP) atau hosting yang under-resourced.
- Privilege escalation di sepanjang alur approval multi-tahap SID (RT → RW → Kadus → Kasi/Kaur).
- Masalah integritas data akibat input manual, import Excel, dan sinkronisasi offline-first.

Kebijakan ini secara eksplisit **tidak** dirancang untuk menghadapi nation-state adversary, advanced persistent threat, atau skenario serangan fisik/kinetik. Merancang kontrol untuk populasi ancaman yang tidak dihadapi program ini akan salah mengalokasikan waktu engineering mahasiswa yang terbatas dan bertentangan dengan prinsip delivery-over-complexity yang sudah dianut program.

### 1.3 Landasan Hukum dan Rasionalisasi Data Classification

Data yang ditangani SID (NIK warga, nomor KK, dan data permohonan administratif) adalah **data pribadi** dan tunduk pada **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP Law)**. Data ini tidak memenuhi definisi hukum *rahasia negara* menurut UU No. 17 Tahun 2011 tentang Intelijen Negara, yang cakupannya adalah pertahanan, intelijen, hubungan luar negeri, ketahanan ekonomi nasional, dan sumber daya alam strategis.

Sistem-sistem ini juga tidak memenuhi ambang operasional atau sektoral yang digunakan BSSN untuk menetapkan *Infrastruktur Informasi Vital/Kritis Nasional*, yang berlaku untuk sistem energi, keuangan, transportasi, kesehatan, atau telekomunikasi berskala nasional. Platform administrasi dan monitoring untuk satu desa tidak masuk kategori ini.

Karena itu, kebijakan ini dibangun di atas **kewajiban kepatuhan UU PDP** (dasar hukum pemrosesan data, data minimization, purpose limitation, breach notification kepada data subject dan, bila diwajibkan, kepada otoritas pengawas terkait) sebagai landasan hukum yang berlaku, dikombinasikan dengan praktik engineering aplikasi web yang aman secara standar (OWASP ASVS Level 1-2 sebagai referensi praktis, bukan compliance mandate).

---

## 2. Data Classification

Seluruh data yang diproses ketiga sistem harus diklasifikasikan ke dalam salah satu tier berikut. Klasifikasi ini menentukan kontrol minimum yang diwajibkan pada Bagian 4-9.

| Tier | Label | Contoh | Sistem Utama | Kebutuhan Handling Minimum |
|---|---|---|---|---|
| 1 | **PII - Restricted** | NIK, nomor KK, nama lengkap + alamat warga, isi surat, riwayat approval | SID | Encryption in transit, access logging, role-based access, tidak ada PII di application logs |
| 2 | **Operational - Internal** | Pembacaan sensor, telemetry device, node identifier, threshold lingkungan | SIGAP | Validasi integritas, access logging, safeguard offline buffering |
| 3 | **Transactional - Restricted** | Data anggota koperasi, catatan order/transaksi, referensi pembayaran | E-Commerce | Encryption in transit, access logging, handling setara PCI bila ada data pembayaran tersimpan |
| 4 | **Public** | Profil desa, pengumuman, peraturan yang dipublikasikan, katalog tipe surat | Semua | Kontrol integritas saja (cegah modifikasi tidak sah); tidak ada kebutuhan konfidensialitas |

**Aturan:** Data Tier 1 dan Tier 3 tidak boleh di-log dalam bentuk plaintext, di-cache di browser local storage, atau ditransmisikan melalui channel yang tidak terenkripsi, dalam kondisi apapun. Ini adalah hard requirement, bukan rekomendasi.

---

## 3. Batasan Peran dan Tanggung Jawab

| Tanggung Jawab | Pemilik |
|---|---|
| Mendefinisikan dan menjaga baseline ini, network topology, dan secrets policy | DevOps Coordinator (AWG) |
| Membuat Data Flow Diagram dan asset inventory per sistem | Tech Lead per sistem |
| Mengidentifikasi ancaman spesifik sistem (STRIDE analysis) | Tech Lead per sistem, menggunakan template bersama |
| Menyetujui apakah mitigasi yang diajukan memenuhi baseline ini | DevOps Coordinator (AWG) |
| Implementasi kontrol sehari-hari di kode | Developer, direview Tech Lead |
| Sign-off akhir sebelum sebuah gate (G3, G5, G7) dinyatakan lulus dari sisi keamanan | DevOps Coordinator + Tech Lead bersama |

Ini mencerminkan model governance program yang sudah ada: standardisasi dimiliki secara terpusat (AWG/DevOps), sementara implementasi spesifik sistem dimiliki per sistem (Tech Lead), konsisten dengan prinsip "governance consistency, bukan technology uniformity" yang sudah diadopsi program.

---

## 4. Standar Authentication dan Authorization

### 4.1 Authentication

- Semua sesi terautentikasi wajib menggunakan mekanisme framework yang sudah teruji - Laravel Sanctum (SID), Firebase Authentication (SIGAP), dan mekanisme setara yang dipilih untuk E-Commerce. Authentication custom buatan sendiri dilarang.
- Password, bila digunakan, wajib di-hash menggunakan algoritma adaptif modern (bcrypt atau argon2id pada cost factor default framework atau lebih tinggi). Penyimpanan password dalam bentuk plaintext atau enkripsi yang bisa dibalik (reversible) dilarang.
- Session token wajib punya masa berlaku (expire); idle timeout diwajibkan untuk role dengan wewenang approval (RT, RW, Kadus, Kasi, Kaur, Petugas Desa).
- Multi-factor authentication (MFA) **diwajibkan** untuk role berikut karena privilege tinggi atau wewenang approval final: Petugas Desa (administrasi sistem penuh), Kasi Pelayanan / Kaur TU (approval surat final, generate nomor surat resmi), dan akun administrator DevOps/infrastruktur mana pun. MFA **direkomendasikan namun tidak wajib** untuk RT/RW/Kadus pada tahap MVP, untuk dinaikkan menjadi wajib pada fase maturity berikutnya.

### 4.2 Authorization

- Access control wajib berbasis role dan ditegakkan **server-side** pada setiap request - tidak boleh hanya mengandalkan client-side state. Ini secara langsung melindungi rantai approval SID (RT → RW → Kadus → Kasi/Kaur), di mana logic gating tiap tahap sudah didefinisikan di use-case diagram (misalnya gating wilayah berbasis `rt_id`, gating status `rw_approved` untuk akses Kadus).
- Setiap endpoint yang mengubah state (aksi approve/reject, konfigurasi tipe surat, CRUD data warga) wajib memvalidasi ulang secara independen bahwa role dan yurisdiksi user yang bertindak (rt_id/rw_id/hamlet_id) cocok dengan resource yang diaksesnya, sekalipun UI sudah menyembunyikan aksi yang tidak sah.
- Prinsip least privilege berlaku untuk service account: Firebase Cloud Functions proxy (SIGAP) dan kredensial service backend mana pun wajib dibatasi hanya untuk operasi yang mereka butuhkan, bukan hak admin project-wide.

---

## 5. Network Segmentation dan Topology

### 5.1 Lanskap Hosting

| Environment | Tujuan | Lokasi |
|---|---|---|
| Production | Sistem live yang dipakai operator desa dan warga | Hosting Desa |
| Staging | Testing pra-rilis, environment demo, QA/UAT | Hosting Kampus |

### 5.2 Kebutuhan Segmentasi

- SIGAP, SID, dan E-Commerce **tidak boleh** berbagi satu instance database, konsisten dengan keputusan arsitektur "independent domain" yang sudah ada di program. Baseline ini memperkuat keputusan itu dari sisi keamanan: kompromi atau salah konfigurasi pada database satu sistem tidak boleh membuka jalan ke data sistem lain.
- Jika beberapa sistem di-deploy pada hosting fisik atau virtual yang sama (skenario yang mungkin terjadi mengingat keterbatasan resource di hosting desa), setiap sistem wajib berjalan di bawah **user account OS-level atau container yang terpisah**, dengan firewall rule yang membatasi akses jaringan antar-sistem secara default (deny-by-default, allow eksplisit hanya untuk integrasi read-only API Village Dashboard yang sudah didokumentasikan).
- Interface administratif (panel admin database, SSH server, panel kontrol hosting) tidak boleh terekspos ke internet publik tanpa IP allow-listing atau lapisan VPN/bastion. Ini berlaku baik untuk hosting Desa (production) maupun Kampus (staging).
- Integrasi Village Dashboard (agregasi read-only API lintas data SIGAP, SID, dan koperasi) wajib terhubung melalui kontrak API read-only yang terdokumentasi dan terautentikasi - tidak pernah melalui akses database langsung atau credential sharing antar sistem. Ini adalah hard constraint yang diturunkan dari keputusan arsitektur yang sudah ada dan diperkuat di sini sebagai kebutuhan keamanan.

---

## 6. Secrets Management

- Firebase service account key, kredensial database, API key, dan Sanctum/session secret tidak boleh di-commit ke version control (GitHub), termasuk di commit history. File `.env` dan yang setara wajib di-`.gitignore` sejak commit pertama di setiap repository.
- Secret wajib disimpan menggunakan environment variable atau secrets manager yang sesuai dengan hosting environment (misalnya, environment variable store dari hosting provider); tidak boleh di-hardcode di source aplikasi, file konfigurasi yang di-commit ke Git, atau dibagikan melalui chat yang tidak terenkripsi.
- Setiap sistem menjaga kredensialnya masing-masing. Credential sharing antara anggota tim SIGAP, SID, dan E-Commerce di luar kebutuhan role mereka tidak diperbolehkan.
- Kredensial mana pun yang terekspos secara tidak sengaja (misalnya, accidental commit, kebocoran di chat) wajib segera dirotasi, bukan hanya dihapus dari file yang terlihat - eksposur di Git history tetap membutuhkan rotasi, bukan sekadar penghapusan.
- Cadence rotasi minimum sebaiknya didefinisikan per tipe kredensial (rekomendasi: setiap phase gate, atau segera saat ada offboarding/perubahan role anggota tim) begitu tim sudah terisi; ini ditandai sebagai open item bagi DevOps Coordinator untuk diformalkan dengan kepemilikan yang jelas.

---

## 7. Transport Security

- TLS (HTTPS) wajib untuk seluruh endpoint production dan staging di ketiga sistem, termasuk API call internal antara Village Dashboard dan API yang diekspos tiap sistem. Tidak ada endpoint HTTP plaintext yang boleh melayani sesi terautentikasi atau data Tier 1/3.
- Certificate wajib dijaga tetap current dengan auto-renewal di mana platform hosting mendukungnya (misalnya, Let's Encrypt via hosting provider); certificate expiry manual adalah kegagalan availability yang bisa dicegah dan wajib dimonitor.

---

## 8. Logging dan Monitoring

- Event authentication (login sukses/gagal), authorization failure, dan seluruh aksi yang mengubah state pada data Tier 1 (approval/reject surat, CRUD data warga, perubahan konfigurasi tipe surat) wajib di-log dengan identitas aktor, timestamp, dan aksi yang dilakukan.
- **Log tidak boleh pernah memuat data mentah Tier 1 atau Tier 3** (misalnya, jangan log nomor NIK lengkap atau isi surat lengkap di application/error log). Reference ID sebaiknya di-log sebagai gantinya, bukan payload sensitifnya.
- Percobaan authentication yang gagal melebihi ambang wajar sebaiknya memicu minimal sebuah log flag; automated lockout atau rate-limiting direkomendasikan begitu kapasitas tim memungkinkan implementasinya.
- Retensi log sebaiknya didefinisikan per sistem (retensi log ditentukan dan dikelola DevOps Coordinator, tidak dipublikasikan sebagai angka tetap) - periode retensi final dikonfirmasi oleh DevOps Coordinator terhadap batasan storage hosting.

---

## 9. Backup dan Recovery

- Data warga dan catatan approval SID membutuhkan backup rutin mengingat perannya sebagai catatan resmi tindakan administratif desa; frekuensi dan retensi backup wajib didefinisikan sebelum sistem mencapai G6 (UAT Ready).
- Desain offline-first SIGAP (local storage dengan sync-on-reconnect) wajib memastikan kehilangan data di edge device tidak terjadi secara diam-diam - batas kapasitas local storage dan perilaku overwrite wajib didokumentasikan dan diuji sebagai bagian dari evaluasi offline resilience yang sudah direncanakan untuk sistem ini.
- File backup, di mana pun disimpan, tunduk pada kontrol data classification yang sama dengan data live yang dikandungnya (yaitu, backup dari data Tier 1 tetap berstatus Tier 1 dan tidak boleh disimpan tanpa enkripsi di infrastruktur bersama atau pribadi).
- Prosedur recovery sebaiknya diuji minimal sekali sebelum production go-live untuk SID, mengingat statusnya sebagai critical path di fase program saat ini.

---

## 10. Third-Party dan Platform Risk

| Dependency | Sistem | Pertimbangan |
|---|---|---|
| Vercel | Dashboard (read-only) | Data static/JSON yang publik-facing wajib direview untuk memastikan tidak ada data Tier 1/3 yang tidak sengaja terekspos lewat file publik `src/data/*.json` |
| Hosting (Desa/Kampus) | Semua | Keamanan fisik dan platform-level dibatasi oleh apa yang ditawarkan hosting provider; dokumentasikan keterbatasan yang diketahui alih-alih mengasumsikan setara dengan commercial cloud provider |

---

## 11. Incident Response (Baseline)

Prosedur incident response dan breach notification yang lengkap ditangani sebagai item governance terpisah (lihat companion tracking item: alur incident response cross-cutting, dimiliki DevOps Coordinator dengan masukan feasibility teknis dari Tech Lead SID). Sebagai minimum, baseline ini mewajibkan:

- Point of contact yang ditunjuk (berbasis role, tidak harus individu bernama) untuk melaporkan dugaan security incident.
- Escalation path yang terdokumentasi dari Developer → Tech Lead → DevOps Coordinator → Program Coordinator untuk insiden apa pun yang melibatkan data Tier 1 atau Tier 3.
- Berdasarkan UU PDP, jika terjadi pelanggaran data pribadi (personal data breach), kewajiban notifikasi kepada data subject yang terdampak (dan berpotensi kepada otoritas pengawas terkait) berlaku - program tidak boleh menunggu insiden terjadi baru mengetahui seperti apa proses ini seharusnya.

---

## 12. Versioning dan Review

Dokumen ini mengikuti disiplin lifecycle yang sama dengan ADR log program: direview dan diberi versi, bukan diedit secara diam-diam. Perubahan material wajib dicatat beserta alasannya, konsisten dengan prinsip "honest documentation over polished completeness" yang sudah dipraktikkan program ini (mempertahankan item yang masih terbuka/belum selesai alih-alih menampilkan kepastian palsu).

| Versi | Tanggal | Perubahan | Author |
|---|---|---|---|
| 1.0.0 | Draft | Baseline awal mencakup authentication, network segmentation, secrets, transport, logging, backup, third-party risk, dan scaffolding incident response | DevOps Coordinator |

**Open item yang dibawa ke control matrix pendamping (`security-baseline-controls.yaml`):**
- Status kontrol per sistem (not_started / in_progress / done)
- Verification evidence tracking per kontrol
- Timeline penegakan MFA untuk role RT/RW/Kadus
- Formalisasi cadence rotasi kredensial
- Konfirmasi periode retensi log terhadap batasan storage hosting