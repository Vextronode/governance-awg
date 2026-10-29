// Test mode tata kelola solo dan peralihan mode (RFC-0002).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { FIXTURES, REPO_ROOT, miniGovernance, run, tmpDir } from './helpers.mjs';

const gov = miniGovernance();
const system = (awg, ...extra) => run(['system', '--governance', gov, '--awg', awg, ...extra]);

// Salinan fixture dasar, ditimpa overlay bila diberikan.
function fixture(base, overlay) {
  const dir = tmpDir('awg-solo-');
  fs.cpSync(path.join(FIXTURES, base), dir, { recursive: true });
  if (overlay) fs.cpSync(path.join(FIXTURES, overlay), dir, { recursive: true });
  return dir;
}
const soloFixture = (name) => fixture('valid-solo', name && path.join('invalid-solo', name));

test('fixture valid-solo lulus dan --summary memuat baris mode solo', () => {
  const r = system(path.join(FIXTURES, 'valid-solo'), '--summary');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^Mode tata kelola: solo \(verifikasi mandiri, bukan independen\)$/m);
  assert.match(r.out, /Kontrol verified lewat external_reviewer: 1; lewat self_review saja: 2/);
  assert.match(r.out, /## Rekap status AWG — TOKO/);
  assert.ok(r.out.indexOf('Mode tata kelola') < r.out.indexOf('## Rekap'), 'baris mode harus di bagian atas');
});

test('--gate di mode solo mencetak baris mode dan memakai aturan gate yang sama', () => {
  const r = system(path.join(FIXTURES, 'valid-solo'), '--gate', 'G5');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /^Mode tata kelola: solo/m);
  assert.match(r.out, /\| BASE-PRIV-001 \|.*\| implemented \| ya \(utang retroaktif\) \|/);
  assert.match(r.out, /\| BASE-QA-001 \|/);
  for (const id of ['BASE-GOV-001', 'BASE-SEC-001', 'SYS-TOKO-001', 'BASE-SEC-009']) {
    assert.doesNotMatch(r.out, new RegExp(`\\| ${id} \\|`));
  }
});

test('--summary mode team mencetak baris mode team', () => {
  const r = system(path.join(FIXTURES, 'valid'), '--summary');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^Mode tata kelola: team$/m);
  assert.match(r.out, /Kontrol verified lewat external_reviewer: 0; lewat self_review saja: 0/);
});

const invalid = [
  ['governance-mode', 'governance-mode', /duo/],
  ['governance-solo-fields', 'governance-solo-fields', /governance\.reason/],
  ['governance-owner', 'governance-owner', /Sinta/],
  ['solo-verification', 'solo-verification', /BASE-GOV-001/],
  ['solo-cooling-off', 'solo-cooling-off', /BASE-GOV-001/],
  ['solo-note', 'solo-note', /BASE-GOV-001/],
  ['solo-self-owner', 'solo-self-owner', /Rina/],
  ['external-team-member', 'external-team-member', /SYS-TOKO-001/],
  ['solo-critical-evidence', 'solo-critical-evidence', /BASE-SEC-001/],
  ['solo-implemented-at', 'solo-implemented-at', /BASE-PRIV-001/],
  ['solo-waiver-approvers', 'solo-waiver-approvers', /WVR-TOKO-001/],
  ['solo-waiver-renewal', 'solo-waiver-renewal', /WVR-TOKO-003/],
];

for (const [name, rule, detail] of invalid) {
  test(`solo invalid: ${name} -> [${rule}]`, () => {
    const r = system(soloFixture(name));
    assert.equal(r.code, 1, r.out);
    const line = r.out.split('\n').find((l) => l.startsWith(`ERROR [${rule}]`));
    assert.ok(line, `aturan ${rule} tidak terdeteksi:\n${r.out}`);
    assert.match(line, detail);
  });
}

test('solo: role team diberi peringatan solo-role-ignored dan tidak dihitung', () => {
  const r = system(soloFixture('solo-role-ignored'));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^WARN {2}\[solo-role-ignored\] .*BASE-GOV-001: role rotation/m);
});

test('solo: waiver ke-2 oleh owner masih sah (W-3)', () => {
  const dir = soloFixture('solo-waiver-renewal');
  const file = path.join(dir, 'waivers.yaml');
  const text = fs.readFileSync(file, 'utf8');
  const cut = text.indexOf('  - id: WVR-TOKO-003');
  fs.writeFileSync(file, text.slice(0, cut));
  const status = path.join(dir, 'status.yaml');
  fs.writeFileSync(status, fs.readFileSync(status, 'utf8').replace('WVR-TOKO-003', 'WVR-TOKO-002'));
  const r = system(dir);
  assert.doesNotMatch(r.out, /solo-waiver-renewal/);
});

test('team invalid: self-review-in-team -> [self-review-in-team]', () => {
  const r = system(fixture('valid', path.join('invalid', 'self-review-in-team')));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /^ERROR \[self-review-in-team\] .*BASE-QA-001/m);
});

test('peralihan solo -> team: tanpa --gate exit 0 dengan peringatan solo-verification-in-team (A.6)', () => {
  const r = system(fixture('valid-solo', 'mode-switch-team'));
  assert.equal(r.code, 0, r.out);
  for (const id of ['BASE-GOV-001', 'BASE-SEC-001', 'SYS-TOKO-001']) {
    assert.match(r.out, new RegExp(`^WARN {2}\\[solo-verification-in-team\\] .*${id}`, 'm'));
  }
  assert.doesNotMatch(r.out, /^ERROR/m);
});

test('peralihan solo -> team: --gate mencantumkan kontrol tersebut sebagai pemblokir (A.6)', () => {
  const r = system(fixture('valid-solo', 'mode-switch-team'), '--gate', 'G5');
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /^Mode tata kelola: team$/m);
  for (const id of ['BASE-GOV-001', 'BASE-SEC-001', 'SYS-TOKO-001']) {
    assert.match(r.out, new RegExp(`\\| ${id} \\|.*implemented \\(verified hanya self_review/external_reviewer\\)`));
  }
});

test('templates/system yang diisi data dummy minimal mode solo lulus terhadap katalog nyata', () => {
  const dir = tmpDir('awg-templates-solo-');
  fs.cpSync(path.join(REPO_ROOT, 'templates', 'system'), dir, { recursive: true });
  const load = (name) => parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const save = (name, data) => fs.writeFileSync(path.join(dir, name), stringify(data));

  const profile = load('profile.yaml');
  assert.equal(profile.governance.mode, 'team', 'default template harus team');
  profile.system.id = 'TOKO';
  profile.system.team = ['Rina'];
  profile.governance = { mode: 'solo', since: '2026-11-01', reason: 'Dummy: proyek pribadi', owner: 'Rina', external_reviewers: [] };
  profile.modules.active[0].reason = 'Dummy: menyimpan nomor HP';
  profile.modules.active[0].evidence = ['src/models/customer.js'];
  profile.modules.inactive[0].reason = 'Dummy: tidak ada transaksi';
  save('profile.yaml', profile);

  const ids = [];
  const base = parse(fs.readFileSync(path.join(REPO_ROOT, 'catalog', 'baseline.yaml'), 'utf8'));
  const pii = parse(fs.readFileSync(path.join(REPO_ROOT, 'catalog', 'modules', 'PII.yaml'), 'utf8'));
  for (const c of [...base.controls, ...pii.controls]) ids.push(c.id);
  const status = load('status.yaml');
  const template = status.controls[0];
  status.system = 'TOKO';
  status.controls = ids.map((id) => ({ ...template, id }));
  save('status.yaml', status);

  const r = run(['system', '--governance', REPO_ROOT, '--awg', dir, '--summary']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^Mode tata kelola: solo/m);
});
