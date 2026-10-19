# Panduan PostgreSQL

> *Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai.*
>
> Panduan ini hanya contoh cara mengimplementasikan kontrol katalog di PostgreSQL. Persyaratan yang mengikat ada di [catalog/](../catalog/).

## Role aplikasi non-superuser dengan GRANT minimal (BASE-SEC-018)

```sql
CREATE ROLE app_sid LOGIN PASSWORD '<dari secret store>';
GRANT CONNECT ON DATABASE sid TO app_sid;
GRANT USAGE ON SCHEMA public TO app_sid;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_sid;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_sid;
-- migration dijalankan dengan role terpisah pemilik skema
```

## Foreign key tidak otomatis diindeks (BASE-PERF-004)

PostgreSQL membuat indeks untuk primary key dan constraint unik, tetapi **tidak** untuk kolom foreign key. Buat indeksnya secara eksplisit:

```sql
CREATE INDEX letters_rt_id_idx ON letters (rt_id);
```

## `EXPLAIN (ANALYZE, BUFFERS)` (BASE-PERF-004)

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM letters WHERE rt_id = 12 AND status = 'submitted' ORDER BY created_at DESC LIMIT 20;
```

Cari `Seq Scan` pada tabel besar dan selisih besar antara estimasi dan baris aktual. `ANALYZE` benar-benar menjalankan query; hati-hati untuk query tulis.

## `pg_dump -Fc` + `pg_restore` (BASE-DATA-001, BASE-DATA-004)

```bash
pg_dump -Fc -d sid -f sid-$(date +%F).dump
pg_restore --clean --if-exists -d sid_restore_test sid-2026-11-01.dump
```

Format custom (`-Fc`) terkompresi dan mendukung restore selektif.

## `statement_timeout` (BASE-PERF-007)

```sql
ALTER ROLE app_sid SET statement_timeout = '10s';
```

Atau per koneksi dari aplikasi (lihat [express.md](express.md)).
