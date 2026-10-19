# Modul PWA — Progressive Web App / service worker

> Narasi pendamping. Definisi kontrol yang mengikat ada di [catalog/modules/PWA.yaml](../catalog/modules/PWA.yaml); narasi ini tidak menambah persyaratan.

## Tujuan

Memanfaatkan service worker untuk caching aset tanpa meninggalkan data pribadi di perangkat bersama dan tanpa menjebak pengguna di versi lama yang rusak.

## Kapan aktif

Lihat `applies_when` dan `detection_hints` di file katalog modul. Di v1, PWA disebut sebagai pendekatan resmi ketiga aplikasi (AWG-OBS-002 §4.2); di v2 modul ini aktif hanya bila aplikasi benar-benar mendaftarkan service worker. Kandidat dari seed (belum terverifikasi): SID, CIMART, SIGAP, VDASH.

## Daftar kontrol

<!-- generated -->
| ID | Judul | Severity | Class | Gate |
|---|---|---|---|---|
| MOD-PWA-001 | Respons berisi data sensitif tidak di-cache | high | non_waivable | G5 |
| MOD-PWA-002 | Strategi pembaruan versi | medium | non_waivable | G6 |
| MOD-PWA-003 | Logout membersihkan cache pengguna | medium | non_waivable | G5 |
<!-- /generated -->

## Panduan penerapan

- **Strategi cache (001):** batasi runtime caching ke aset statis dan konten publik; kecualikan route API terautentikasi. Periksa Cache Storage di DevTools setelah login.
- **Pembaruan versi (002):** cache berversi dan alur pembaruan yang membuat pengguna menerima versi baru setelah deploy; uji di staging.
- **Logout (003):** hapus cache dan storage lokal terkait pengguna saat logout. Lihat juga BASE-PRIV-003 untuk Cache Storage.

## Kesalahan umum

- Konfigurasi workbox default yang meng-cache semua respons GET, termasuk `/api/me`.
- Pengguna terjebak di versi lama karena service worker tidak pernah diperbarui.
