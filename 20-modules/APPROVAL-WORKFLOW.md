# Modul APPROVAL-WORKFLOW — Alur persetujuan multi-tahap

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/APPROVAL-WORKFLOW.yaml](../catalog/modules/APPROVAL-WORKFLOW.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Mencegah lompat tahap, eskalasi hak antar yurisdiksi, persetujuan oleh diri sendiri, transisi ganda akibat aksi bersamaan, dan nomor resmi ganda pada alur persetujuan berbasis peran/yurisdiksi.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Contoh utama di program: rantai approval surat SID (RT → RW → Kadus → Kasi/Kaur). Kandidat dari seed (belum terverifikasi): SID.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-APPROVAL-WORKFLOW-001 | State machine eksplisit | critical | non_waivable | G5 |
| MOD-APPROVAL-WORKFLOW-002 | Re-validasi peran dan yurisdiksi pada setiap aksi | critical | non_waivable | G5 |
| MOD-APPROVAL-WORKFLOW-003 | Pemisahan tugas | high | waivable | G5 |
| MOD-APPROVAL-WORKFLOW-004 | Jejak audit transisi tidak dapat diubah | high | non_waivable | G5 |
| MOD-APPROVAL-WORKFLOW-005 | Aman terhadap aksi bersamaan | high | non_waivable | G5 |
| MOD-APPROVAL-WORKFLOW-006 | Nomor resmi dibangkitkan atomik | high | non_waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **State machine (001):** definisikan enum status dan peta transisi di satu tempat; endpoint approve/reject hanya memanggil fungsi transisi tersebut.
- **Re-validasi (002):** periksa peran **dan** yurisdiksi (mis. `rt_id`, `rw_id`, `hamlet_id`) di server pada setiap aksi, dan scope query antrean di level query. Ini menggantikan AUTHZ-002 v1, risiko utama SID.
- **Konkurensi (005):** contoh pola `UPDATE ... WHERE id = ? AND status = <status_diharapkan>` lalu periksa jumlah baris yang berubah; atau row lock di dalam transaksi.
- **Nomor resmi (006):** bangkitkan di dalam transaksi yang sama dengan transisi terakhir dan lindungi dengan constraint unik di database.

## Kesalahan umum

- Mengandalkan UI yang hanya menampilkan tombol approve untuk peran tertentu.
- Daftar antrean memfilter yurisdiksi di frontend setelah semua data diambil.
- Nomor surat dihitung dengan `MAX(nomor) + 1` di luar transaksi.
