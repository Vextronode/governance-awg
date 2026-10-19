# Handoff & Dukungan Pasca Serah Terima

| Field | Nilai |
|---|---|
| Dokumen | 00-framework/06-handoff-and-support.md |
| Versi | 2.0.0 |
| Status | Berlaku |
| Pemilik | Architecture Working Group (AWG) |
| Sumber | RFC-0001 Bagian H (menggantikan AWG-SEC-006; materi dari v1 AWG-SEC-006) |

---

## 1. Kenapa diatur terpisah

[05-incident-response.md](05-incident-response.md) mengasumsikan struktur governance program (Developer → Tech Lead → DevOps Coordinator → Program Coordinator) **masih aktif**. Struktur itu bubar begitu tim capstone lulus dan serah terima selesai. Dokumen ini mengatur penanganan insiden ketika tim pembangun sudah tidak ada, dan penerimanya adalah operator yang kemampuan teknisnya **diasumsikan rendah secara default**.

Kontrol terkait: BASE-MAINT-001 s.d. BASE-MAINT-008, BASE-SEC-012, BASE-SEC-021, BASE-OBS-007, BASE-OBS-009.

## 2. Catatan tanggung jawab hukum pasca serah terima

Begitu serah terima selesai, kendali atas data (termasuk data pribadi warga dan pengguna) berada di tangan **mitra (Pemerintah Desa / pengelola koperasi)** sebagai Pengendali Data ([00-scope-and-principles.md](00-scope-and-principles.md) §4). Kewajiban notifikasi Pasal 46 UU PDP pasca serah terima melekat pada pihak yang memegang kendali sistem saat insiden terjadi, bukan otomatis kembali ke tim capstone yang sudah tidak mengoperasikan sistem.

Poin ini sebaiknya dinyatakan eksplisit dalam dokumen serah terima formal ke mitra (di luar lingkup dokumen teknis ini) agar tidak ada ambiguitas tanggung jawab hukum atas insiden setelah tim capstone tidak lagi mengelola sistem. Kedudukan Pengendali sendiri wajib disepakati tertulis sebelum data riil diproses (BASE-PRIV-008).

## 3. Support window

Dua skenario, dengan durasi dan tujuan berbeda:

| Skenario | Durasi | Tujuan kontak | Sifat |
|---|---|---|---|
| **Tidak ada dev penerus** | **3 bulan** sejak tanggal serah terima | Tim capstone bersedia dihubungi untuk membantu insiden teknis (malfungsi, dugaan serangan, pertanyaan operasional) | Guarantee window — komitmen aktif tim saat ini |
| **Ada dev penerus** | **1 bulan** sejak tanggal serah terima | Tim capstone bersedia dihubungi **oleh dev penerus** (bukan operator langsung) untuk menjelaskan arsitektur, keputusan desain, dan konteks yang tidak tercakup dokumentasi tertulis | Knowledge transfer window — bukan on-call insiden |

Batasan yang wajib dikomunikasikan ke mitra sejak awal:

- Kedua window bersifat **best-effort**, bukan kontrak SLA formal dengan kewajiban hukum/finansial. Tim capstone adalah mahasiswa yang sudah lulus, bukan vendor berbayar.
- Setelah window berakhir, tim capstone **tidak lagi bertanggung jawab** memberi dukungan.
- Kontak selama window melalui **satu titik kontak yang disepakati** (satu PIC tim), bukan seluruh anggota tim secara individual.

Jenis window, PIC, dan tanggal berakhirnya wajib tertulis di handover dan halaman admin aplikasi (BASE-MAINT-007). Tanggal dihitung relatif terhadap tanggal serah terima masing-masing sistem.

## 4. Decision tree untuk operator

Ditulis untuk operator dengan asumsi kemampuan teknis rendah: bahasa awam, tanpa istilah teknis containment. Versi siap pakai ada di template [operator-playbook.md](../templates/reports/operator-playbook.md).

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

Aturan sederhana untuk operator:

1. Kalau ragu, **jangan lakukan apa-apa ke sistem** — cukup laporkan dan tunggu arahan.
2. Kalau situs/aplikasi bermasalah parah (tidak bisa diakses sama sekali, atau ada indikasi data warga bocor), **segera hubungi kontak di atas**; jangan menunda sampai jam kerja kalau kelihatannya serius.
3. Kalau hanya gangguan kecil (misal halaman lambat), boleh menunggu jam kerja normal untuk melapor.

## 5. Kebutuhan engineering pra-handoff

Kebutuhan fitur containment untuk operator awam (mode maintenance, pemulihan akses admin tanpa akses DB langsung, kontak dukungan di aplikasi) di v1 berupa rekomendasi backlog. Di v2 kebutuhan ini menjadi kontrol **BASE-MAINT-004** beserta syarat keamanannya, karena fitur tersebut sendiri adalah permukaan serangan. Lihat [10-baseline/MAINT.md](../10-baseline/MAINT.md).

Kepemilikan akun dan aset (BASE-MAINT-002) serta kalender perpanjangan (BASE-MAINT-003) juga menjadi kontrol.

## 6. Kisi-kisi konten keamanan untuk 3 book guide

Dokumen ini **tidak** menulis isi book guide (lingkup Documentation Coordinator/Tech Lead). Berikut daftar konten keamanan yang harus masuk ke masing-masing.

### 6.1 Book Guide — User (warga/pembeli/penjual)

- Cara mengenali hal mencurigakan sederhana (contoh: diminta password lewat WhatsApp/telepon itu tidak sah).
- Kontak resmi untuk melaporkan masalah (bukan tautan/nomor yang bisa dipalsukan).

### 6.2 Book Guide — Admin/Operator

- Seluruh isi §4 (decision tree eskalasi).
- Cara memakai fitur containment sederhana (BASE-MAINT-004: mode maintenance, pemulihan akses admin) sebagai instruksi langkah demi langkah bergambar, bukan penjelasan teknis.
- Daftar kontak: hosting provider, dev penerus (bila ada), PIC tim capstone beserta **tanggal berakhirnya support window** yang tertulis eksplisit.
- Pengingat eksplisit: "Jangan berikan akses admin ke pihak yang tidak dikenal", "Jangan bagikan kredensial lewat chat".
- Prosedur hak subjek data (BASE-PRIV-006).

### 6.3 Book Guide — Development Selanjutnya (bila ada dev penerus)

- Pewarisan penuh seluruh folder `docs/awg/` repo sistem (profil, status, kontrol lokal, waiver, threat model kondisi terakhir, runbook, laporan) dan **tag versi `governance-awg`** yang dipakai (tercatat di `docs/awg/awg.lock.yaml`). Dokumen diserahkan utuh, bukan diringkas.
- Status kontrol terakhir (`status.yaml`) sebagai titik awal, bukan mulai dari nol.
- Catatan eksplisit soal keterbatasan yang diketahui: kontrol yang belum `verified` dan waiver aktif saat serah terima, agar dev penerus tahu itu memang belum dikerjakan, bukan celah yang mereka lewatkan.
- Panduan patching dependency (BASE-MAINT-008).
- Jendela 1 bulan untuk bertanya langsung ke tim capstone (§3).

## 7. Template

- [templates/reports/operator-playbook.md](../templates/reports/operator-playbook.md) — playbook operator berbahasa awam.
- [templates/reports/handover-checklist.md](../templates/reports/handover-checklist.md) — checklist paket handover (BASE-MAINT-005).

Catatan: RFC-0001 Bagian H.3 menyebut kedua template ini berada di `templates/system/`, sedangkan struktur repo (Bagian N) menempatkannya di `templates/reports/`. Diputuskan memakai `templates/reports/` (lihat [rfc/OPEN-QUESTIONS.md](../rfc/OPEN-QUESTIONS.md)).
