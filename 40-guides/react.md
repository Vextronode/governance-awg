# Panduan React

> *Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai.*
>
> Panduan ini hanya contoh cara mengimplementasikan kontrol katalog di React. Persyaratan yang mengikat ada di [catalog/](../catalog/).

## Escaping default React (BASE-SEC-007)

React meng-escape nilai yang dirender lewat JSX secara default:

```jsx
<p>{announcement.title}</p> {/* aman: teks di-escape */}
```

## `dangerouslySetInnerHTML` hanya dengan DOMPurify (BASE-SEC-007, MOD-CMS-001)

```jsx
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }} />
```

Jangan memakai `dangerouslySetInnerHTML` tanpa sanitasi. Sanitasi di frontend tidak menggantikan sanitasi di server untuk konten CMS.

## Env yang dibundel itu publik (MOD-API-CONSUMER-001)

Variabel seperti `VITE_*` atau `REACT_APP_*` ditanam ke bundle JavaScript dan bisa dibaca siapa pun. Jangan menaruh API key atau kredensial di sana; panggil API berkredensial lewat server/proxy.

```js
// buruk: kredensial ikut ter-bundle
fetch(`${import.meta.env.VITE_SID_API}/stats`, { headers: { 'X-Api-Key': import.meta.env.VITE_SID_KEY } });

// baik: frontend memanggil backend sendiri, backend yang memegang kredensial
fetch('/api/stats');
```

## Jangan simpan token/data Tier 1 di localStorage (BASE-PRIV-003)

`localStorage` dan `sessionStorage` bisa dibaca skrip apa pun di origin yang sama dan tertinggal di perangkat bersama. Untuk Laravel Sanctum, pakai autentikasi cookie (SPA mode) alih-alih menyimpan token di storage browser.

## Code splitting / lazy (BASE-PERF-006)

```jsx
import { lazy, Suspense } from 'react';

const ReportsPage = lazy(() => import('./pages/ReportsPage'));

<Suspense fallback={<Spinner />}>
  <ReportsPage />
</Suspense>
```

## Lighthouse (BASE-PERF-006, BASE-QA-009)

Jalankan Lighthouse mode mobile untuk setiap halaman critical path (Chrome DevTools atau CLI):

```bash
npx lighthouse https://staging.example/halaman --preset=perf --form-factor=mobile --output=html
```
