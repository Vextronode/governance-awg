# Panduan MySQL

> *Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai.*
>
> Panduan ini hanya contoh cara mengimplementasikan kontrol katalog di MySQL. Persyaratan yang mengikat ada di [catalog/](../catalog/).

## InnoDB, `sql_mode` strict, utf8mb4

InnoDB mendukung transaksi dan row lock; MyISAM tidak. Mode strict membuat MySQL menolak data tidak valid alih-alih memotongnya diam-diam. `utf8mb4` menyimpan seluruh karakter Unicode (`utf8` lama hanya 3 byte).

```ini
# my.cnf
[mysqld]
default-storage-engine = InnoDB
sql_mode = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

Di Laravel, `config/database.php` koneksi `mysql` memakai `'strict' => true`, `'engine' => 'InnoDB'`, dan `'charset' => 'utf8mb4'`.

Periksa tabel yang belum InnoDB:

```sql
SELECT table_name, engine FROM information_schema.tables
WHERE table_schema = DATABASE() AND engine <> 'InnoDB';
```

## InnoDB otomatis membuat indeks untuk FK (BASE-PERF-004)

Berbeda dengan PostgreSQL, InnoDB otomatis membuat indeks pada kolom foreign key bila belum ada. Kolom filter dan urutan lain tetap perlu diperiksa dengan `EXPLAIN`.

## `mysqldump --single-transaction` (BASE-DATA-001)

```bash
mysqldump --single-transaction --routines --triggers cimart > cimart-$(date +%F).sql
```

`--single-transaction` menghasilkan snapshot konsisten untuk tabel InnoDB tanpa mengunci tabel.

## `SELECT ... FOR UPDATE` butuh transaksi InnoDB

Row lock hanya berlaku di dalam transaksi pada tabel InnoDB. Contoh pengurangan stok (lihat usulan SYS-CIMART-001 di `seeds/cimart.yaml`):

```sql
START TRANSACTION;
SELECT stock FROM products WHERE id = 42 FOR UPDATE;
-- periksa stok cukup di aplikasi
UPDATE products SET stock = stock - 2 WHERE id = 42;
COMMIT;
```

Alternatif satu pernyataan: `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`, lalu periksa jumlah baris yang berubah.
