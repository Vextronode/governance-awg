// Helper test: menjalankan CLI dan menyiapkan direktori kerja sementara dari fixture.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const TOOL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = path.resolve(TOOL_DIR, '..', '..');
export const CLI = path.join(TOOL_DIR, 'awg-validate.mjs');
export const FIXTURES = path.join(TOOL_DIR, 'test', 'fixtures');

// Tanggal tetap agar status waiver (aktif/kedaluwarsa) di fixture tidak berubah seiring waktu.
export const FIXED_TODAY = '2026-11-01';

export function run(args, env = {}) {
  const res = spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, AWG_VALIDATE_TODAY: FIXED_TODAY, ...env },
  });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

export function tmpDir(prefix = 'awg-validate-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function overlay(target, name) {
  if (!name) return;
  const src = path.join(FIXTURES, 'invalid', name);
  if (!fs.existsSync(src)) throw new Error(`fixture tidak ada: ${src}`);
  fs.cpSync(src, target, { recursive: true });
}

// Root governance mini (fixture) + schema nyata dari repo.
export function miniGovernance() {
  const dir = tmpDir('awg-gov-mini-');
  fs.cpSync(path.join(FIXTURES, 'governance-mini'), dir, { recursive: true });
  fs.cpSync(path.join(REPO_ROOT, 'catalog', 'schema'), path.join(dir, 'catalog', 'schema'), { recursive: true });
  return dir;
}

// Salinan fixture docs/awg valid, ditimpa file dari fixtures/invalid/<name> bila diberikan.
export function systemFixture(name) {
  const dir = tmpDir('awg-system-');
  fs.cpSync(path.join(FIXTURES, 'valid'), dir, { recursive: true });
  overlay(dir, name);
  return dir;
}

// Salinan governance nyata (catalog, seeds, templates), ditimpa fixtures/invalid/<name> bila diberikan.
export function repoGovernance(name) {
  const dir = tmpDir('awg-gov-');
  for (const sub of ['catalog', 'seeds', 'templates']) {
    fs.cpSync(path.join(REPO_ROOT, sub), path.join(dir, sub), { recursive: true });
  }
  overlay(dir, name);
  return dir;
}
