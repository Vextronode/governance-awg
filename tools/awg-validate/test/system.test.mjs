import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { FIXTURES, REPO_ROOT, miniGovernance, run, systemFixture, tmpDir } from './helpers.mjs';

const gov = miniGovernance();
const system = (awg, ...extra) => run(['system', '--governance', gov, '--awg', awg, ...extra]);

test('fixture valid lulus beserta --summary', () => {
  const r = system(path.join(FIXTURES, 'valid'), '--summary');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /## Rekap status AWG — SID/);
  assert.match(r.out, /\| verified \| 3 \|/);
  assert.match(r.out, /\| total \| 9 \|/);
});

test('--gate G3 tanpa pemblokir', () => {
  const r = system(path.join(FIXTURES, 'valid'), '--gate', 'G3');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Tidak ada pemblokir/);
});

test('--gate G5 mendeteksi pemblokir', () => {
  const r = system(path.join(FIXTURES, 'valid'), '--gate', 'G5');
  assert.equal(r.code, 1, r.out);
  for (const id of ['BASE-QA-001', 'MOD-CMS-001', 'MOD-CMS-002', 'SYS-SID-001']) assert.match(r.out, new RegExp(`\\| ${id} \\|`));
  assert.doesNotMatch(r.out, /\| BASE-SEC-009 \|/); // waived dengan waiver aktif, dan gate G6
  assert.doesNotMatch(r.out, /\| SYS-SID-002 \|/);
});

test('--gate G6 memblokir finding high yang not_started (BASE-GOV-002)', () => {
  const r = system(path.join(FIXTURES, 'valid'), '--gate', 'G6');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /threat-model:SID-001/);
});

test('--gate menandai utang retroaktif', () => {
  const r = system(systemFixture('gate-retro'), '--gate', 'G5');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\| BASE-GOV-001 \|.*\| ya \(utang retroaktif\) \|/);
  assert.match(r.out, /\| BASE-QA-001 \|.*\| tidak \|/);
});

const invalid = [
  ['status-missing', 'status-missing', /MOD-CMS-002/],
  ['status-unknown', 'status-unknown', /BASE-SEC-999/],
  ['status-duplicate', 'status-duplicate', /MOD-CMS-002/],
  ['implemented-no-evidence', 'status-evidence', /BASE-QA-001/],
  ['verified-no-verification', 'status-verification', /BASE-QA-001/],
  ['verifier-team-member', 'verifier-team-member', /Budi/],
  ['critical-no-coordinator', 'critical-dual-verification', /BASE-SEC-001/],
  ['pc-sole-verifier', 'pc-sole-verifier', /BASE-QA-001/],
  ['na-on-base', 'status-na-base', /BASE-QA-001/],
  ['waiver-nonwaivable', 'waiver-nonwaivable', /BASE-QA-001/],
  ['waiver-expired', 'waiver-expired', /WVR-SID-001/],
  ['waiver-single-approver', 'waiver-approvers', /WVR-SID-001/],
  ['waiver-team-approver', 'waiver-team-approver', /Budi/],
  ['tm-score', 'tm-score', /SID-002/],
  ['tm-rating', 'tm-rating', /SID-002/],
  ['tm-boundary-no-finding', 'tm-boundary-finding', /TB-03/],
  ['tm-done-no-evidence', 'tm-done-evidence', /SID-002/],
  ['version-mismatch', 'version-mismatch', /v2\.1\.0/],
  ['module-unknown', 'module-unknown', /GIS/],
];

for (const [fixture, rule, detail] of invalid) {
  test(`sistem invalid: ${fixture} -> [${rule}]`, () => {
    const r = system(systemFixture(fixture));
    assert.equal(r.code, 1, r.out);
    assert.ok(r.out.includes(`[${rule}]`), r.out);
    assert.match(r.out, detail);
  });
}

test('waiver yang sama lulus sebelum tanggal kedaluwarsa dan gagal sesudahnya', () => {
  const awg = path.join(FIXTURES, 'valid');
  assert.equal(run(['system', '--governance', gov, '--awg', awg], { AWG_VALIDATE_TODAY: '2026-12-15' }).code, 0);
  const late = run(['system', '--governance', gov, '--awg', awg], { AWG_VALIDATE_TODAY: '2026-12-16' });
  assert.equal(late.code, 1, late.out);
  assert.ok(late.out.includes('[waiver-expired]'), late.out);
});

test('error penggunaan system menghasilkan exit 2', () => {
  const awg = path.join(FIXTURES, 'valid');
  assert.equal(run(['system', '--awg', awg]).code, 2);
  assert.equal(run(['system', '--governance', gov]).code, 2);
  assert.equal(run(['system', '--governance', gov, '--awg', awg, '--gate', 'G9']).code, 2);
});

test('templates/system yang diisi data dummy minimal lulus terhadap katalog nyata', () => {
  const dir = tmpDir('awg-templates-');
  fs.cpSync(path.join(REPO_ROOT, 'templates', 'system'), dir, { recursive: true });
  const load = (name) => parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const save = (name, data) => fs.writeFileSync(path.join(dir, name), stringify(data));

  const profile = load('profile.yaml');
  profile.modules.active[0].reason = 'Dummy: menyimpan NIK';
  profile.modules.active[0].evidence = ['database/migrations/dummy.php'];
  profile.modules.inactive[0].reason = 'Dummy: tidak ada transaksi';
  save('profile.yaml', profile);

  // Status mencakup semua BASE + modul aktif (PII), semuanya not_started.
  const ids = [];
  const base = parse(fs.readFileSync(path.join(REPO_ROOT, 'catalog', 'baseline.yaml'), 'utf8'));
  const pii = parse(fs.readFileSync(path.join(REPO_ROOT, 'catalog', 'modules', 'PII.yaml'), 'utf8'));
  for (const c of [...base.controls, ...pii.controls]) ids.push(c.id);
  const status = load('status.yaml');
  const template = status.controls[0];
  status.controls = ids.map((id) => ({ ...template, id }));
  save('status.yaml', status);

  const r = run(['system', '--governance', REPO_ROOT, '--awg', dir]);
  assert.equal(r.code, 0, r.out);
});
