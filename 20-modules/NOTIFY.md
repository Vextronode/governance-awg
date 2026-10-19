# Modul NOTIFY — Notifikasi keluar

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/NOTIFY.yaml](../catalog/modules/NOTIFY.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Membuat pengiriman notifikasi (WhatsApp/email/SMS/push) tahan terhadap gangguan gateway, tidak membocorkan data Tier 1 lewat isi pesan, dan risikonya terdokumentasi untuk masa setelah handoff.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID, CIMART, SIGAP. Untuk SIGAP, keberadaan peringatan ke warga belum dikonfirmasi.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-NOTIFY-001 | Kegagalan tercatat dan diulang terbatas | medium | waivable | G5 |
| MOD-NOTIFY-002 | Isi notifikasi minimal | high | non_waivable | G5 |
| MOD-NOTIFY-003 | Risiko penyedia didokumentasikan | medium | waivable | G6 |
<!-- /generated -->

## Panduan penerapan

- **Queue dan retry (001):** kirim notifikasi lewat job dengan retry terbatas; kegagalan akhir dicatat sebagai event ERROR (BASE-OBS-002) tanpa menggagalkan transaksi utama.
- **Isi pesan (002):** cukup informasi status dan tautan ke aplikasi yang memerlukan login.
- **Penyedia (003):** catat pilihan penyedia sebagai ADR, termasuk risiko gateway WhatsApp non-resmi yang bisa diblokir dan rencana cadangannya.

## Kesalahan umum

- Mengirim notifikasi secara sinkron di dalam request approval sehingga approval gagal saat gateway down.
- Pesan WhatsApp memuat NIK dan alamat lengkap pemohon.
