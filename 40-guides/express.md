# Panduan Express

> *Non-normatif. Verifikasi terhadap dokumentasi resmi versi yang dipakai.*
>
> Panduan ini hanya contoh cara mengimplementasikan kontrol katalog di Express. Persyaratan yang mengikat ada di [catalog/](../catalog/).

## helmet dan `x-powered-by` (BASE-SEC-009)

```js
import helmet from 'helmet';

app.disable('x-powered-by');
app.use(helmet());
```

## Batas ukuran body: `express.json({ limit })`

```js
app.use(express.json({ limit: '100kb' }));
```

## express-rate-limit (BASE-SEC-004)

```js
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({ windowMs: 60_000, limit: 5 });
app.post('/auth/login', loginLimiter, loginHandler);
```

## Validasi skema dengan zod/joi (BASE-SEC-006)

```js
import { z } from 'zod';

const ReadingQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

app.get('/readings', (req, res, next) => {
  const parsed = ReadingQuery.safeParse(req.query);
  if (!parsed.success) return res.status(422).json({ error: 'invalid_query' });
  // ...
});
```

## pino dengan opsi `redact` (BASE-OBS-001, BASE-PRIV-003)

```js
import pino from 'pino';

export const logger = pino({
  base: { service: 'sigap', env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ['req.headers.authorization', '*.password', '*.token', '*.nik', '*.no_kk', '*.phone', '*.address'],
});
```

## Middleware correlation ID (BASE-OBS-003)

```js
import { randomUUID } from 'node:crypto';

app.use((req, res, next) => {
  req.correlationId = req.get('X-Correlation-ID') ?? randomUUID();
  res.set('X-Correlation-ID', req.correlationId);
  req.log = logger.child({ correlation_id: req.correlationId });
  next();
});
```

## Error handler terpusat (BASE-SEC-015)

```js
app.use((err, req, res, _next) => {
  req.log.error({ event: 'unhandled_error', err }, 'unhandled error');
  res.status(500).json({ error: 'internal_error' }); // tanpa stack trace
});
```

## node-postgres `Pool` + `statement_timeout` (BASE-PERF-007, BASE-SEC-006)

```js
import pg from 'pg';

export const pool = new pg.Pool({
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 10_000,
});

await pool.query('SELECT * FROM readings WHERE device_id = $1 LIMIT $2', [deviceId, 100]);
```

## `npm audit --audit-level=high` (BASE-SEC-013)

```yaml
# langkah CI
- run: npm ci
- run: npm audit --audit-level=high
```

## Library migration, mis. node-pg-migrate (BASE-REL-004)

```bash
npx node-pg-migrate create add-readings-device-index
npx node-pg-migrate up
```
