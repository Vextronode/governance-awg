# Panduan Laravel

> *Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai.*
>
> Panduan ini hanya contoh cara mengimplementasikan kontrol katalog di Laravel. Persyaratan yang mengikat ada di [catalog/](../catalog/).

## Sanctum (BASE-SEC-001, BASE-SEC-003, BASE-SEC-008)

- **SPA cookie:** frontend memanggil `/sanctum/csrf-cookie` sebelum login agar cookie XSRF tersedia; request berikutnya membawa header `X-XSRF-TOKEN`.
- **`SANCTUM_STATEFUL_DOMAINS`:** daftar domain frontend yang memakai autentikasi cookie (stateful). Jangan isi wildcard.
- **`expiration` di `config/sanctum.php`:** masa berlaku token (menit). `null` berarti token tidak pernah kedaluwarsa.
- **`SESSION_LIFETIME`:** masa idle sesi (menit) untuk autentikasi cookie; dipakai untuk idle timeout peran approval/admin (nilai dicatat di profil).

```php
// config/sanctum.php
'expiration' => 60 * 8, // menit
```

## FormRequest untuk validasi (BASE-SEC-006)

```php
class StoreLetterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'letter_type_id' => ['required', 'integer', 'exists:letter_types,id'],
            'purpose'        => ['required', 'string', 'max:500'],
        ];
    }
}
```

## Policy/Gate untuk otorisasi objek (BASE-SEC-005, MOD-APPROVAL-WORKFLOW-002)

```php
class LetterPolicy
{
    public function view(User $user, Letter $letter): bool
    {
        return $user->id === $letter->citizen_id
            || ($user->hasRole('rt') && $user->rt_id === $letter->rt_id);
    }
}

// controller
$this->authorize('view', $letter);
```

## Rate limit: `RateLimiter::for` + middleware `throttle` (BASE-SEC-004)

```php
// AppServiceProvider::boot()
RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(5)->by($request->input('email')),
        Limit::perMinute(5)->by($request->ip()),
    ];
});

// routes
Route::post('/login', LoginController::class)->middleware('throttle:login');
```

## Deteksi lazy loading (BASE-PERF-003)

```php
// AppServiceProvider::boot()
Model::preventLazyLoading(! app()->isProduction());
```

## Cast `encrypted` (MOD-PII-004)

```php
protected function casts(): array
{
    return ['nik' => 'encrypted', 'no_kk' => 'encrypted'];
}
```

Kolom terenkripsi tidak bisa dicari langsung; gunakan blind index (mis. kolom hash terpisah) bila perlu pencarian.

## Channel log dengan `JsonFormatter` (BASE-OBS-001)

```php
// config/logging.php
'json' => [
    'driver'    => 'daily',
    'path'      => storage_path('logs/app.log'),
    'days'      => 30,
    'formatter' => Monolog\Formatter\JsonFormatter::class,
],
```

Field skema bersama (`event`, `correlation_id`, `service`, `env`, `actor`, `context`) ditambahkan lewat processor atau `Log::withContext()`.

## `composer audit` (BASE-SEC-013)

```yaml
# langkah CI
- run: composer install --no-interaction --prefer-dist
- run: composer audit
```

## Maintenance mode (BASE-MAINT-004)

Laravel menyediakan maintenance mode bawaan lewat CLI:

```bash
php artisan down --secret="<token-acak>"
php artisan up
```

Perintah ini butuh akses server/CLI, sehingga tidak bisa dipakai operator awam. BASE-MAINT-004 membutuhkan pengaktifan lewat UI admin yang terlindungi autentikasi dan tercatat di log audit, mis. tombol di halaman admin yang memanggil service internal setara `php artisan down` dan mencatat aktor serta waktunya.

## `APP_DEBUG=false` (BASE-SEC-015)

```dotenv
APP_ENV=production
APP_DEBUG=false
```

Dengan `APP_DEBUG=true`, Laravel menampilkan stack trace dan nilai konfigurasi ke klien.
