# Modul CMS — Konten publik yang dikelola admin

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/CMS.yaml](../catalog/modules/CMS.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Mencegah stored XSS dari konten rich text dan menjaga integritas konten publik Tier 4 (pencegahan defacement atau hoaks atas nama desa).

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Kandidat dari seed (belum terverifikasi): SID, CIMART, VDASH.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-CMS-001 | Sanitasi rich text di server | high | non_waivable | G5 |
| MOD-CMS-002 | Hak terbit dan jejak perubahan | medium | non_waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **Sanitasi (001):** sanitasi di server dengan allowlist tag/atribut (mis. HTMLPurifier di PHP, DOMPurify di Node); sanitasi di editor frontend saja tidak cukup karena request bisa dikirim langsung ke API. Lihat juga BASE-SEC-007.
- **Hak terbit (002):** batasi peran yang bisa menerbitkan/mengubah konten dan catat siapa serta kapan setiap perubahan dilakukan.

## Kesalahan umum

- Merender HTML dari editor dengan `dangerouslySetInnerHTML` atau `{!! !!}` tanpa sanitasi.
- Semua akun petugas bisa mengubah halaman profil desa tanpa jejak perubahan.
