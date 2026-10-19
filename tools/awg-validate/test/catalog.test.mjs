import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { REPO_ROOT, repoGovernance, run } from './helpers.mjs';

test('katalog nyata di repo lulus', () => {
  const r = run(['catalog', '--root', REPO_ROOT]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /83 BASE, 49 MOD \(11 modul\), 15 SYS seed/);
});

test('GATE-MATRIX.md di repo sinkron dengan katalog', () => {
  const r = run(['catalog', '--root', REPO_ROOT, '--gate-matrix', '--check']);
  assert.equal(r.code, 0, r.out);
});

test('--gate-matrix menulis file yang lalu lulus --check', () => {
  const root = repoGovernance();
  const write = run(['catalog', '--root', root, '--gate-matrix']);
  assert.equal(write.code, 0, write.out);
  const check = run(['catalog', '--root', root, '--gate-matrix', '--check']);
  assert.equal(check.code, 0, check.out);
});

const invalid = [
  ['catalog-duplicate-id', 'duplicate-id', /MOD-CMS-001/],
  ['catalog-wrong-prefix', 'id-prefix', /MOD-PWA-009/],
  ['catalog-critical-waivable', 'critical-waivable', /MOD-CMS-001/],
  ['catalog-foreign-supersedes', 'supersedes-unknown', /TPR-001/],
  ['catalog-v1-uncovered', 'v1-uncovered', /AUTH-005/],
];

for (const [fixture, rule, detail] of invalid) {
  test(`katalog invalid: ${fixture} -> [${rule}]`, () => {
    const r = run(['catalog', '--root', repoGovernance(fixture)]);
    assert.equal(r.code, 1, r.out);
    assert.ok(r.out.includes(`[${rule}]`), r.out);
    assert.match(r.out, detail);
  });
}

test('--gate-matrix --check mendeteksi file usang', () => {
  const r = run(['catalog', '--root', repoGovernance('catalog-gate-matrix-stale'), '--gate-matrix', '--check']);
  assert.equal(r.code, 1, r.out);
  assert.ok(r.out.includes('[gate-matrix-stale]'), r.out);
});

test('error penggunaan menghasilkan exit 2', () => {
  assert.equal(run([]).code, 2);
  assert.equal(run(['unknown']).code, 2);
  assert.equal(run(['catalog']).code, 2);
  assert.equal(run(['catalog', '--root', REPO_ROOT, '--check']).code, 2);
  assert.equal(run(['catalog', '--root', path.join(REPO_ROOT, 'tidak-ada')]).code, 2);
  assert.equal(run(['catalog', '--root', REPO_ROOT, '--opsi-asing']).code, 2);
});
