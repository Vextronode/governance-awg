# AWG-OBS-002: Performance Standard

**Program:** Capstone Cibenda - Universitas Widyatama, Teknik Informatika

**Ruang Lingkup:** SIGAP, SID, CibendaMart

**Diterbitkan oleh:** Architecture Working Group (AWG)

**Status:** Draft - menunggu review AWG

**Versi:** 1.0

**Terakhir diperbarui:** [diisi saat finalisasi]

---

## 1. Tujuan & Ruang Lingkup

### 1.1 Tujuan

Dokumen ini menetapkan standar performa minimum yang wajib diperhatikan dalam pengembangan dan pemeliharaan ketiga sistem dalam ekosistem Program Capstone Cibenda. Tujuannya adalah mencegah degradasi performa yang berdampak langsung pada pengalaman pengguna (warga, wisatawan, perangkat desa) serta memastikan sistem tetap dapat beroperasi dalam batasan kapasitas hosting yang tersedia.

### 1.2 Posisi Dokumen

Dokumen ini beroperasi **di luar Program Gates (G1-G7)** - tidak menjadi syarat kelulusan gate manapun, melainkan standar praktik yang berlaku sepanjang siklus pengembangan dan pemeliharaan. Keputusan ini diambil untuk menjaga fleksibilitas Definition of Done pada tiap gate yang telah ditetapkan, sekaligus tetap menjadikan performa sebagai perhatian berkelanjutan, bukan pemeriksaan satu kali.

### 1.3 Kepatuhan

Checklist dalam dokumen ini bersifat panduan wajib yang diterapkan pada level code review dan praktik pengembangan sehari-hari, dengan penyesuaian teknis spesifik diserahkan kepada Tech Lead masing-masing sistem.

---

## 2. Baseline & Capacity Planning

### 2.1 Prinsip

Degradasi performa hanya dapat dikenali jika terdapat pembanding terhadap kondisi normal. Tanpa baseline, keluhan "sistem lambat" tidak dapat diverifikasi secara objektif.

### 2.2 Ketentuan Baseline

Setiap sistem wajib mencatat baseline berikut segera setelah mencapai kondisi stabil pertama kali (pasca Phase 1 - Operational Stability):

- Response time (p50/p95/p99) untuk endpoint kritis (lihat Bagian 5, AWG-OBS-001).
- Penggunaan resource (CPU, RAM, disk) pada kondisi operasional normal, baik di lingkungan staging (hosting kampus) maupun production (hosting desa).

### 2.3 Load Testing Skala Kecil

Pengujian beban dilakukan menggunakan tool ringan (contoh: k6, Apache Bench) sebelum sistem memasuki fase production, dengan skala pengujian yang proporsional terhadap perkiraan jumlah pengguna aktual (bukan skala enterprise). Tujuannya adalah memverifikasi kapasitas hosting desa dapat menangani beban yang realistis, bukan mensimulasikan skala yang tidak relevan dengan konteks program.

---

## 3. Database Performance Checklist

### 3.1 Pencegahan N+1 Query

Query N+1 (memuat daftar data lalu melakukan query relasi satu per satu dalam perulangan) merupakan sumber degradasi performa paling umum, khususnya pada aplikasi berbasis Laravel. Ketentuan:

- Penggunaan eager loading (`with()`) wajib diterapkan pada setiap query yang memuat data beserta relasinya.
- Pemeriksaan N+1 query menjadi bagian dari checklist code review, bukan ditemukan setelah sistem berjalan di production.

### 3.2 Indexing

Kolom yang sering digunakan sebagai filter query wajib diberi index, termasuk namun tidak terbatas pada:

| Sistem | Kolom yang Wajib Diindeks |
|---|---|
| **SID** | `rt_id`, `status`, `hamlet_id`, foreign key rantai approval |
| **SIGAP** | Kolom timestamp/device identifier yang digunakan untuk query time-series |
| **CibendaMart** | Kolom filter produk/kategori, foreign key transaksi |

### 3.3 Pagination

Seluruh endpoint yang menampilkan daftar data (daftar surat, daftar warga, daftar produk) wajib menerapkan pagination. Pemuatan seluruh baris data tanpa batas tidak diperkenankan, mengingat volume data akan terus bertambah seiring waktu.

---

## 4. Frontend/Asset Performance

### 4.1 Konteks

CibendaMart menyasar pengguna warga Cibenda dan wisatawan Pangandaran, yang secara realistis mengakses aplikasi melalui koneksi data seluler di lokasi wisata, bukan jaringan stabil semacam WiFi kampus. Standar performa frontend harus mempertimbangkan konteks ini.

### 4.2 Ketentuan

- Optimasi gambar (kompresi) wajib diterapkan pada seluruh gambar produk yang diunggah oleh penjual.
- Lazy loading diterapkan pada elemen non-kritis di luar viewport awal.
- Pemanfaatan service worker untuk asset caching, memanfaatkan kapabilitas PWA yang telah menjadi pendekatan resmi ke 3 aplikasi.

---

## 5. Concurrency Handling

### 5.1 SIGAP - Connection Pooling

Mengingat jalur ingestion data dari beberapa perangkat edge (ESP8266/ESP32) menuju PostgreSQL dapat terjadi secara bersamaan, connection pooling wajib diterapkan pada layer proxy untuk mencegah exhaustion koneksi basis data.

### 5.2 CibendaMart - Row-Level Locking

Kondisi race condition pada pengurangan stok saat proses checkout bersamaan (dua transaksi mengakses produk dengan stok terbatas secara simultan) wajib ditangani menggunakan row-level locking atau mekanisme optimistic locking pada level query, bukan hanya validasi di level aplikasi.

---

## 6. Review & Update Trigger

Dokumen ini ditinjau ulang oleh AWG apabila salah satu kondisi berikut terpenuhi:

1. Terjadi insiden performa signifikan yang menunjukkan celah pada standar ini.
2. Terdapat perubahan skala pengguna yang material terhadap asumsi kapasitas awal (contoh: peningkatan signifikan jumlah penjual/pembeli CibendaMart, atau jumlah perangkat SIGAP yang tervalidasi untuk deployment lapangan).
3. Perubahan infrastruktur hosting (kampus/desa) yang memengaruhi asumsi kapasitas pada Bagian 2.

---

*Dokumen ini merupakan bagian dari seri dokumen governance Program Capstone Cibenda, dikelola oleh Architecture Working Group.*
