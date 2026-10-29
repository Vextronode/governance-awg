#!/usr/bin/env node
// awg-validate — validator katalog AWG v2 dan folder docs/awg/ repo sistem.
// Spesifikasi: rfc/0001-awg-v2-restructure.md Bagian N.3.
// Exit code: 0 lulus, 1 pelanggaran, 2 error penggunaan.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;

// 30 ID kontrol v1 yang sah (RFC-0001 Bagian O.1).
export const V1_IDS = [
  'AUTH-001', 'AUTH-002', 'AUTH-003', 'AUTH-004', 'AUTH-005',
  'AUTHZ-001', 'AUTHZ-002', 'AUTHZ-003',
  'NET-001', 'NET-002', 'NET-003', 'NET-004',
  'SEC-001', 'SEC-002', 'SEC-003', 'SEC-004',
  'TLS-001', 'TLS-002', 'TLS-003',
  'LOG-001', 'LOG-002', 'LOG-003',
  'BAK-001', 'BAK-002', 'BAK-003', 'BAK-004',
  'TPR-002',
  'IR-001', 'IR-002', 'IR-003',
];

const DOMAINS = ['GOV', 'SEC', 'PRIV', 'QA', 'OBS', 'PERF', 'REL', 'DATA', 'MAINT'];
const GATES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];
const CONTROL_GATES = ['G3', 'G4', 'G5', 'G6', 'G7'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const CLASSES = ['non_waivable', 'waivable'];
const STATUSES = ['not_started', 'in_progress', 'implemented', 'verified', 'rejected', 'waived', 'not_applicable'];
const COORDINATOR_ROLES = ['devops_coordinator', 'qa_coordinator', 'program_coordinator'];
// Mode tata kelola (RFC-0002). Role solo tidak dihitung di team (A.6); role team tidak dihitung di solo (S-7).
const MODES = ['team', 'solo'];
const SOLO_ROLES = ['self_review', 'external_reviewer'];
const MODE_LINE = { team: 'Mode tata kelola: team', solo: 'Mode tata kelola: solo (verifikasi mandiri, bukan independen)' };
const NORMATIVE = /(WAJIB|SEBAIKNYA|BOLEH)/;
const SYSTEM_FILES = ['awg.lock.yaml', 'profile.yaml', 'controls-local.yaml', 'status.yaml', 'waivers.yaml', 'threat-model.yaml'];
const GATE_MATRIX = 'catalog/GATE-MATRIX.md';

// Coordinator domain untuk verifikasi kedua kontrol critical (E.2).
const VERIFY_COORDINATOR_BY_DOMAIN = {
  SEC: 'devops_coordinator', REL: 'devops_coordinator', DATA: 'devops_coordinator', OBS: 'devops_coordinator',
  PERF: 'devops_coordinator', MAINT: 'devops_coordinator', QA: 'qa_coordinator', PRIV: 'program_coordinator',
  GOV: 'program_coordinator',
};
// Coordinator domain penyetuju waiver selain Program Coordinator (D.2).
const WAIVER_COORDINATOR_BY_DOMAIN = {
  SEC: 'devops_coordinator', REL: 'devops_coordinator', DATA: 'devops_coordinator', OBS: 'devops_coordinator',
  PERF: 'devops_coordinator', MAINT: 'devops_coordinator', QA: 'qa_coordinator', PRIV: 'devops_coordinator',
  GOV: 'devops_coordinator',
};

class UsageError extends Error {}

class Report {
  constructor(base) {
    this.base = base;
    this.errors = [];
    this.warnings = [];
  }
  rel(file) {
    return file ? path.relative(this.base, file).split(path.sep).join('/') || '.' : '-';
  }
  error(rule, file, message) {
    this.errors.push(`ERROR [${rule}] ${this.rel(file)}: ${message}`);
  }
  warn(rule, file, message) {
    this.warnings.push(`WARN  [${rule}] ${this.rel(file)}: ${message}`);
  }
  print() {
    for (const line of [...this.errors, ...this.warnings]) console.log(line);
  }
}

// ---------------------------------------------------------------- utilitas

function readYaml(file, report) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    report.error('missing-file', file, 'file tidak ditemukan');
    return null;
  }
  try {
    return parseYaml(text) ?? {};
  } catch (err) {
    report.error('yaml-parse', file, `YAML tidak valid: ${err.message.split('\n')[0]}`);
    return null;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function gateIndex(gate) {
  return GATES.indexOf(gate);
}

function layerOf(id) {
  return String(id).split('-')[0];
}

function riskRating(score) {
  if (score <= 2) return 'low';
  if (score <= 4) return 'medium';
  if (score === 6) return 'high';
  return 'critical';
}

function today() {
  const fixed = process.env.AWG_VALIDATE_TODAY;
  if (fixed) return fixed;
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

function normName(name) {
  return String(name ?? '').trim().toLowerCase();
}

// ---------------------------------------------------------------- schema

function loadSchemas(govRoot) {
  const dir = path.join(govRoot, 'catalog', 'schema');
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, allowUnionTypes: true });
  const names = ['catalog', 'profile', 'status', 'controls-local', 'waivers', 'threat-model'];
  const ids = {};
  for (const name of names) {
    const file = path.join(dir, `${name}.schema.json`);
    if (!fs.existsSync(file)) throw new UsageError(`schema tidak ditemukan: ${file}`);
    const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
    ajv.addSchema(schema);
    ids[name] = schema.$id;
  }
  return {
    validate(name, data, file, report, fragment = '') {
      const validator = ajv.getSchema(ids[name] + fragment);
      if (validator(data)) return true;
      for (const err of validator.errors) {
        // Kegagalan if/then dilaporkan lewat error turunannya; lewati error pembungkus "if".
        if (err.keyword === 'if') continue;
        const extra = err.params?.allowedValues ? ` (${err.params.allowedValues.join(', ')})` : '';
        const where = err.instancePath || '/';
        report.error('schema', file, `${where} ${err.message}${extra}`);
      }
      return false;
    },
  };
}

// ---------------------------------------------------------------- katalog

function loadCatalog(govRoot, schemas, report, { full }) {
  const controls = new Map();
  const modules = new Map();
  const catalogDir = path.join(govRoot, 'catalog');
  const baselineFile = path.join(catalogDir, 'baseline.yaml');
  const versions = new Set();

  const addControl = (control, layer, file, extra = {}) => {
    if (!control || typeof control.id !== 'string') return;
    if (controls.has(control.id)) {
      report.error('duplicate-id', file, `ID ${control.id} sudah dipakai di ${report.rel(controls.get(control.id).file)}`);
      return;
    }
    controls.set(control.id, { ...control, layer, file, ...extra });
  };

  const baseline = readYaml(baselineFile, report);
  if (baseline) {
    schemas.validate('catalog', baseline, baselineFile, report, '#/$defs/baselineFile');
    versions.add(String(baseline.version));
    for (const c of asArray(baseline.controls)) {
      if (full && typeof c?.id === 'string' && c.domain && !c.id.startsWith(`BASE-${c.domain}-`)) {
        report.error('id-prefix', baselineFile, `${c.id} tidak sesuai domain ${c.domain} (harus BASE-${c.domain}-NNN)`);
      }
      addControl(c, 'BASE', baselineFile);
    }
  }

  const modDir = path.join(catalogDir, 'modules');
  const modFiles = fs.existsSync(modDir) ? fs.readdirSync(modDir).filter((f) => f.endsWith('.yaml')).sort() : [];
  for (const name of modFiles) {
    const file = path.join(modDir, name);
    const mod = readYaml(file, report);
    if (!mod) continue;
    schemas.validate('catalog', mod, file, report, '#/$defs/moduleFile');
    versions.add(String(mod.version));
    const moduleName = path.basename(name, '.yaml');
    if (mod.module !== moduleName) {
      report.error('module-file-mismatch', file, `field module (${mod.module}) tidak sama dengan nama file (${moduleName})`);
    }
    modules.set(moduleName, mod);
    for (const c of asArray(mod.controls)) {
      if (full && typeof c?.id === 'string') {
        if (!c.id.startsWith(`MOD-${moduleName}-`) || !/^\d{3}$/.test(c.id.slice(`MOD-${moduleName}-`.length))) {
          report.error('id-prefix', file, `${c.id} tidak sesuai modul ${moduleName} (harus MOD-${moduleName}-NNN)`);
        }
        if (c.module !== moduleName) {
          report.error('id-prefix', file, `${c.id}: field module (${c.module}) tidak sama dengan modul file (${moduleName})`);
        }
      }
      addControl(c, 'MOD', file, { moduleName });
    }
  }
  if (versions.size > 1) report.warn('catalog-version', catalogDir, `versi katalog tidak seragam: ${[...versions].join(', ')}`);

  return { controls, modules, version: baseline?.version };
}

function checkControlRules(control, file, report) {
  if (control.severity === 'critical' && control.class !== 'non_waivable') {
    report.error('critical-waivable', file, `${control.id} critical harus non_waivable (C.3)`);
  }
  for (const v1 of asArray(control.supersedes)) {
    if (!V1_IDS.includes(v1)) report.error('supersedes-unknown', file, `${control.id} supersedes ${v1} bukan salah satu dari 30 ID v1`);
  }
}

function loadSeeds(govRoot, catalog, report) {
  const dir = path.join(govRoot, 'seeds');
  const seeds = [];
  const seedIds = new Set();
  if (!fs.existsSync(dir)) {
    report.error('missing-file', dir, 'folder seeds tidak ditemukan');
    return seeds;
  }
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort()) {
    const file = path.join(dir, name);
    const seed = readYaml(file, report);
    if (!seed) continue;
    seeds.push({ file, seed });
    const system = seed.system;
    if (!/^[A-Z][A-Z0-9]*$/.test(String(system))) {
      report.error('seed', file, `system tidak valid: ${system}`);
      continue;
    }
    if (path.basename(name, '.yaml') !== system.toLowerCase()) {
      report.error('seed', file, `nama file harus ${system.toLowerCase()}.yaml`);
    }
    for (const m of asArray(seed.candidate_modules)) {
      if (!catalog.modules.has(m)) report.error('seed', file, `candidate_modules memuat modul yang tidak ada di katalog: ${m}`);
    }
    for (const c of asArray(seed.proposed_sys_controls)) {
      const id = String(c?.id);
      const pattern = new RegExp(`^SYS-${system}-\\d{3}$`);
      if (!pattern.test(id)) report.error('id-prefix', file, `${id} harus berpola SYS-${system}-NNN`);
      for (const field of ['title', 'statement', 'severity', 'class', 'gate']) {
        if (c?.[field] === undefined) report.error('seed', file, `${id}: field ${field} wajib ada`);
      }
      if (typeof c?.title === 'string' && c.title.length > 80) report.error('seed', file, `${id}: title > 80 karakter`);
      if (typeof c?.statement === 'string' && !NORMATIVE.test(c.statement)) {
        report.error('seed', file, `${id}: statement harus memuat WAJIB/SEBAIKNYA/BOLEH`);
      }
      if (c?.severity !== undefined && !SEVERITIES.includes(c.severity)) report.error('seed', file, `${id}: severity tidak valid`);
      if (c?.class !== undefined && !CLASSES.includes(c.class)) report.error('seed', file, `${id}: class tidak valid`);
      if (c?.gate !== undefined && !CONTROL_GATES.includes(c.gate)) report.error('seed', file, `${id}: gate tidak valid`);
      if (catalog.controls.has(id)) {
        report.error('duplicate-id', file, `ID ${id} sudah dipakai di ${report.rel(catalog.controls.get(id).file)}`);
      } else if (seedIds.has(id)) {
        report.error('duplicate-id', file, `ID ${id} duplikat di seed`);
      }
      seedIds.add(id);
      checkControlRules({ ...c, id }, file, report);
    }
  }
  return seeds;
}

function validateTemplates(govRoot, schemas, report) {
  const dir = path.join(govRoot, 'templates', 'system');
  const map = {
    'profile.yaml': 'profile',
    'status.yaml': 'status',
    'controls-local.yaml': 'controls-local',
    'waivers.yaml': 'waivers',
    'threat-model.yaml': 'threat-model',
  };
  for (const [name, schema] of Object.entries(map)) {
    const file = path.join(dir, name);
    const data = readYaml(file, report);
    if (data) schemas.validate(schema, data, file, report);
  }
  const lockFile = path.join(dir, 'awg.lock.yaml');
  const lock = readYaml(lockFile, report);
  if (lock) checkLock(lock, lockFile, report);
}

function checkLock(lock, file, report) {
  if (!nonEmpty(lock.governance_repo)) report.error('lock', file, 'governance_repo wajib diisi');
  if (!/^v\d+\.\d+\.\d+$/.test(String(lock.version))) report.error('lock', file, 'version harus berformat vMAJOR.MINOR.PATCH');
  if (lock.adopted_at === undefined) report.error('lock', file, 'adopted_at wajib ada');
}

export function gateMatrixMarkdown(catalog) {
  const lines = [
    '<!-- DIHASILKAN oleh tools/awg-validate (catalog --gate-matrix). Jangan diedit manual. -->',
    '',
    `# Matriks Gate AWG v${catalog.version}`,
    '',
    'Kontrol katalog (BASE dan MOD) per gate paling awal di mana kontrol harus `verified` (atau `waived` bila waivable).',
    'Untuk mengklaim gate Gx, semua kontrol yang berlaku dengan gate <= Gx harus terpenuhi (framework 03 §3).',
    'Kontrol MOD hanya berlaku bila modulnya aktif di profil sistem. Kontrol SYS tiap sistem tidak tercantum di sini.',
    '',
  ];
  const active = [...catalog.controls.values()].filter((c) => c.deprecated !== true);
  const summary = [];
  for (const gate of CONTROL_GATES) {
    const rows = active.filter((c) => c.gate === gate);
    const base = rows.filter((c) => c.layer === 'BASE');
    const mod = rows.filter((c) => c.layer === 'MOD');
    summary.push(`| ${gate} | ${base.length} | ${mod.length} | ${rows.length} |`);
    lines.push(`## ${gate}`, '');
    if (rows.length === 0) {
      lines.push('Tidak ada kontrol.', '');
      continue;
    }
    lines.push('| ID | Judul | Severity | Class | Lapis/Modul |', '|---|---|---|---|---|');
    for (const c of [...base, ...mod]) {
      const where = c.layer === 'BASE' ? `BASE/${c.domain}` : `MOD/${c.moduleName}`;
      lines.push(`| ${c.id} | ${c.title} | ${c.severity} | ${c.class} | ${where} |`);
    }
    lines.push('');
  }
  lines.push('## Ringkasan', '', '| Gate | BASE | MOD | Total |', '|---|---|---|---|', ...summary);
  const totalBase = active.filter((c) => c.layer === 'BASE').length;
  const totalMod = active.filter((c) => c.layer === 'MOD').length;
  lines.push(`| Total | ${totalBase} | ${totalMod} | ${totalBase + totalMod} |`, '');
  return lines.join('\n');
}

function runCatalog(opts) {
  if (!opts.root) throw new UsageError('opsi --root wajib diisi');
  if (opts.check && !opts['gate-matrix']) throw new UsageError('--check hanya bisa dipakai bersama --gate-matrix');
  const root = path.resolve(opts.root);
  if (!fs.existsSync(root)) throw new UsageError(`path tidak ditemukan: ${root}`);
  const report = new Report(root);
  const schemas = loadSchemas(root);
  const catalog = loadCatalog(root, schemas, report, { full: true });
  for (const c of catalog.controls.values()) checkControlRules(c, c.file, report);
  const seeds = loadSeeds(root, catalog, report);

  // Setiap ID v1 tercakup minimal sekali di katalog atau seed.
  const covered = new Set();
  for (const c of catalog.controls.values()) asArray(c.supersedes).forEach((id) => covered.add(id));
  for (const { seed } of seeds) {
    for (const c of asArray(seed.proposed_sys_controls)) asArray(c?.supersedes).forEach((id) => covered.add(id));
  }
  for (const id of V1_IDS) {
    if (!covered.has(id)) report.error('v1-uncovered', path.join(root, 'catalog'), `ID v1 ${id} tidak tercakup di katalog maupun seed`);
  }

  validateTemplates(root, schemas, report);

  if (opts['gate-matrix'] && report.errors.length === 0) {
    const file = path.join(root, GATE_MATRIX);
    const expected = gateMatrixMarkdown(catalog);
    if (opts.check) {
      if (!fs.existsSync(file)) {
        report.error('gate-matrix-missing', file, 'file belum ada; jalankan catalog --gate-matrix');
      } else if (fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== expected) {
        report.error('gate-matrix-stale', file, 'file berbeda dari hasil generate; jalankan catalog --gate-matrix lalu commit');
      }
    } else {
      fs.writeFileSync(file, expected);
      console.log(`Ditulis: ${report.rel(file)}`);
    }
  }

  report.print();
  const nBase = [...catalog.controls.values()].filter((c) => c.layer === 'BASE').length;
  const nMod = catalog.controls.size - nBase;
  const nSys = seeds.reduce((n, s) => n + asArray(s.seed.proposed_sys_controls).length, 0);
  console.log(`Katalog v${catalog.version}: ${nBase} BASE, ${nMod} MOD (${catalog.modules.size} modul), ${nSys} SYS seed.`);
  return finish(report);
}

// ---------------------------------------------------------------- sistem

// Verifikasi yang dihitung pada mode tertentu: team mengabaikan role solo, solo hanya memakai role solo.
function countedVerifications(entry, mode = 'team') {
  const list = asArray(entry?.verification).filter(Boolean);
  return mode === 'solo' ? list.filter((v) => SOLO_ROLES.includes(v.verifier_role)) : list.filter((v) => !SOLO_ROLES.includes(v.verifier_role));
}

function verifiedEntries(entry, mode = 'team') {
  return countedVerifications(entry, mode).filter((v) => v?.result === 'verified');
}

function lastVerification(entry, mode = 'team') {
  const list = countedVerifications(entry, mode);
  return list.length ? list[list.length - 1] : null;
}

// Entri verified di mode team yang hanya didukung verifikasi role solo (A.6).
function onlySoloVerified(entry) {
  return entry?.status === 'verified' && verifiedEntries(entry, 'team').length === 0 && verifiedEntries(entry, 'solo').length > 0;
}

function requiredVerifyCoordinator(control) {
  if (control.layer === 'BASE') return VERIFY_COORDINATOR_BY_DOMAIN[control.domain];
  if (control.layer === 'MOD') return 'devops_coordinator';
  return null; // SYS: Coordinator domain tidak ditetapkan RFC-0001; cukup salah satu Coordinator (lihat OPEN-QUESTIONS).
}

function requiredWaiverCoordinator(control) {
  if (control.layer === 'BASE') return WAIVER_COORDINATOR_BY_DOMAIN[control.domain];
  return null; // MOD/SYS: tidak ditetapkan RFC-0001; cukup satu Coordinator selain Program Coordinator.
}

function soloApproverEligible(a, govOwner, team) {
  if (a.role === 'owner') return nonEmpty(govOwner) && normName(a.name) === normName(govOwner);
  if (a.role === 'external_reviewer') return !team.has(normName(a.name));
  return false;
}

// W-3: untuk satu kontrol, waiver ke-3 dan seterusnya (urut approved_at, semua status) wajib disetujui external_reviewer.
function checkSoloWaiverRenewals(waivers, team, file, report) {
  const byControl = new Map();
  for (const w of waivers.values()) {
    if (!byControl.has(w.control)) byControl.set(w.control, []);
    byControl.get(w.control).push(w);
  }
  for (const [control, list] of byControl) {
    list.sort((a, b) => String(a.approved_at).localeCompare(String(b.approved_at)) || String(a.id).localeCompare(String(b.id)));
    list.slice(2).forEach((w, i) => {
      const external = asArray(w.approved_by).some((a) => a?.role === 'external_reviewer' && nonEmpty(a.name) && !team.has(normName(a.name)));
      if (!external) {
        report.error('solo-waiver-renewal', file,
          `${w.id}: waiver ke-${i + 3} untuk ${control} wajib disetujui external_reviewer di luar system.team (W-3)`);
      }
    });
  }
}

function waiverIsValid(waiver, controlId, now) {
  return Boolean(waiver) && waiver.control === controlId && waiver.status === 'active' && String(waiver.expires_at) >= now;
}

function runSystem(opts) {
  if (!opts.governance) throw new UsageError('opsi --governance wajib diisi');
  if (!opts.awg) throw new UsageError('opsi --awg wajib diisi');
  if (opts.gate !== undefined && !GATES.includes(opts.gate)) throw new UsageError(`--gate harus salah satu dari ${GATES.join(', ')}`);
  const govRoot = path.resolve(opts.governance);
  const awgDir = path.resolve(opts.awg);
  if (!fs.existsSync(govRoot)) throw new UsageError(`path tidak ditemukan: ${govRoot}`);
  if (!fs.existsSync(awgDir)) throw new UsageError(`path tidak ditemukan: ${awgDir}`);

  const report = new Report(process.cwd());
  const schemas = loadSchemas(govRoot);
  const catalog = loadCatalog(govRoot, schemas, report, { full: false });
  const now = today();

  const files = {};
  const data = {};
  for (const name of SYSTEM_FILES) {
    files[name] = path.join(awgDir, name);
    data[name] = readYaml(files[name], report);
  }
  const lock = data['awg.lock.yaml'];
  const profile = data['profile.yaml'];
  const local = data['controls-local.yaml'];
  const status = data['status.yaml'];
  const waiversDoc = data['waivers.yaml'];
  const tm = data['threat-model.yaml'];

  // Schema
  if (lock) checkLock(lock, files['awg.lock.yaml'], report);
  if (profile) schemas.validate('profile', profile, files['profile.yaml'], report);
  if (local) schemas.validate('controls-local', local, files['controls-local.yaml'], report);
  if (status) schemas.validate('status', status, files['status.yaml'], report);
  if (waiversDoc) schemas.validate('waivers', waiversDoc, files['waivers.yaml'], report);
  if (tm) schemas.validate('threat-model', tm, files['threat-model.yaml'], report);

  const systemId = profile?.system?.id;
  const team = new Set([...asArray(profile?.system?.team), profile?.system?.tech_lead].filter(nonEmpty).map(normName));

  // Mode tata kelola (RFC-0002 A.1). Blok governance tidak ada = team.
  const governance = profile?.governance;
  let mode = 'team';
  if (governance !== undefined && governance !== null) {
    if (MODES.includes(governance.mode)) mode = governance.mode;
    else report.error('governance-mode', files['profile.yaml'], `governance.mode harus team atau solo (diterima: ${governance.mode})`);
  }
  const teamList = new Set(asArray(profile?.system?.team).filter(nonEmpty).map(normName));
  const govOwner = governance?.owner;
  if (mode === 'solo') {
    if (!nonEmpty(governance.reason) || !nonEmpty(govOwner)) {
      report.error('governance-solo-fields', files['profile.yaml'], 'mode solo wajib mengisi governance.reason dan governance.owner (RFC-0002 A.1)');
    }
    if (nonEmpty(govOwner) && !teamList.has(normName(govOwner))) {
      report.error('governance-owner', files['profile.yaml'], `governance.owner ${govOwner} tidak tercantum di system.team (RFC-0002 A.1)`);
    }
  }

  // Versi
  if (lock && profile && profile.awg_version !== lock.version) {
    report.error('version-mismatch', files['profile.yaml'], `awg_version ${profile.awg_version} berbeda dengan awg.lock.yaml (${lock.version})`);
  }
  if (lock && status && status.awg_version !== lock.version) {
    report.error('version-mismatch', files['status.yaml'], `awg_version ${status.awg_version} berbeda dengan awg.lock.yaml (${lock.version})`);
  }
  if (status && systemId && status.system !== systemId) {
    report.error('system-mismatch', files['status.yaml'], `system ${status.system} berbeda dengan profile (${systemId})`);
  }
  if (local && nonEmpty(local.system) && systemId && local.system !== systemId) {
    report.error('system-mismatch', files['controls-local.yaml'], `system ${local.system} berbeda dengan profile (${systemId})`);
  }

  // Modul
  const activeModules = new Set();
  const declared = new Map();
  for (const [kind, list] of [['active', profile?.modules?.active], ['inactive', profile?.modules?.inactive]]) {
    for (const m of asArray(list)) {
      if (!m || typeof m.id !== 'string') continue;
      if (declared.has(m.id)) report.error('module-duplicate', files['profile.yaml'], `modul ${m.id} dideklarasikan lebih dari sekali`);
      declared.set(m.id, kind);
      if (!catalog.modules.has(m.id)) {
        report.error('module-unknown', files['profile.yaml'], `modul ${m.id} tidak ada di katalog`);
        continue;
      }
      if (!nonEmpty(m.reason)) report.error('module-reason', files['profile.yaml'], `modul ${m.id} wajib punya reason (D.1)`);
      if (kind === 'active') {
        activeModules.add(m.id);
        if (!asArray(m.evidence).some(nonEmpty)) {
          report.error('module-evidence', files['profile.yaml'], `modul aktif ${m.id} wajib punya evidence path kode (D.1)`);
        }
      }
    }
  }
  if (profile) {
    for (const m of catalog.modules.keys()) {
      if (!declared.has(m)) report.warn('module-undeclared', files['profile.yaml'], `modul ${m} belum dideklarasikan aktif/tidak aktif`);
    }
  }

  // Kontrol lokal SYS
  const localControls = new Map();
  for (const c of asArray(local?.controls)) {
    if (!c || typeof c.id !== 'string') continue;
    if (systemId && !new RegExp(`^SYS-${systemId}-\\d{3}$`).test(c.id)) {
      report.error('id-prefix', files['controls-local.yaml'], `${c.id} harus berpola SYS-${systemId}-NNN`);
    }
    if (localControls.has(c.id) || catalog.controls.has(c.id)) {
      report.error('duplicate-id', files['controls-local.yaml'], `ID ${c.id} duplikat`);
      continue;
    }
    checkControlRules(c, files['controls-local.yaml'], report);
    localControls.set(c.id, { ...c, layer: 'SYS', file: files['controls-local.yaml'] });
  }

  // Kontrol yang berlaku
  const applicable = new Map();
  for (const c of catalog.controls.values()) {
    if (c.deprecated === true) continue;
    if (c.layer === 'BASE' || activeModules.has(c.moduleName)) applicable.set(c.id, c);
  }
  for (const c of localControls.values()) if (c.deprecated !== true) applicable.set(c.id, c);

  // Waiver
  const waivers = new Map();
  const statusFile = files['status.yaml'];
  const waiverFile = files['waivers.yaml'];
  for (const w of asArray(waiversDoc?.waivers)) {
    if (!w || typeof w.id !== 'string') continue;
    if (waivers.has(w.id)) report.error('waiver-duplicate-id', waiverFile, `ID waiver ${w.id} duplikat`);
    waivers.set(w.id, w);
    if (systemId && !w.id.startsWith(`WVR-${systemId}-`)) report.error('waiver-id', waiverFile, `${w.id} harus berpola WVR-${systemId}-NNN`);
    const control = applicable.get(w.control);
    if (!control) {
      report.error('waiver-control-unknown', waiverFile, `${w.id}: kontrol ${w.control} tidak berlaku untuk sistem ini`);
    } else if (control.class !== 'waivable') {
      report.error('waiver-nonwaivable', waiverFile, `${w.id}: kontrol ${w.control} non_waivable tidak bisa di-waive`);
    }
    const risk = w.risk ?? {};
    if (Number.isInteger(risk.likelihood) && Number.isInteger(risk.impact) && risk.score !== risk.likelihood * risk.impact) {
      report.error('waiver-score', waiverFile, `${w.id}: score ${risk.score} harus = likelihood x impact (${risk.likelihood * risk.impact})`);
    }
    if (w.status === 'active' && typeof w.expires_at === 'string' && w.expires_at < now) {
      report.error('waiver-expired', waiverFile, `${w.id}: kedaluwarsa sejak ${w.expires_at}; kontrol ${w.control} kembali tidak patuh`);
    }
    if (typeof w.approved_at === 'string' && typeof w.expires_at === 'string') {
      const days = daysBetween(w.approved_at, w.expires_at);
      if (days < 0) report.error('waiver-duration', waiverFile, `${w.id}: expires_at sebelum approved_at`);
      else if (days > 90) report.error('waiver-duration', waiverFile, `${w.id}: masa berlaku ${days} hari melebihi 90 hari (D.2)`);
    }
    const approvers = asArray(w.approved_by).filter((a) => a && nonEmpty(a.name));
    if (mode === 'solo') {
      // W-1: minimal satu penyetuju owner (= governance.owner) atau external_reviewer di luar system.team.
      if (!approvers.some((a) => soloApproverEligible(a, govOwner, team))) {
        report.error('solo-waiver-approvers', waiverFile,
          `${w.id}: mode solo butuh penyetuju role owner (${govOwner || 'governance.owner'}) atau external_reviewer di luar system.team (W-1)`);
      }
      continue;
    }
    const names = new Set(approvers.map((a) => normName(a.name)));
    const roles = approvers.map((a) => a.role);
    const needed = control ? requiredWaiverCoordinator(control) : null;
    const hasPc = roles.includes('program_coordinator');
    const hasDomain = needed
      ? approvers.some((a) => a.role === needed && normName(a.name) !== normName(approvers.find((p) => p.role === 'program_coordinator')?.name))
      : roles.some((r) => r !== 'program_coordinator' && COORDINATOR_ROLES.includes(r));
    if (names.size < 2 || !hasPc || !hasDomain) {
      const domainText = needed ?? 'Coordinator lain';
      report.error('waiver-approvers', waiverFile, `${w.id}: butuh dua penyetuju berbeda: program_coordinator dan ${domainText} (D.2)`);
    }
    for (const a of approvers) {
      if (team.has(normName(a.name))) report.error('waiver-team-approver', waiverFile, `${w.id}: penyetuju ${a.name} adalah anggota tim sistem`);
    }
  }
  if (mode === 'solo') checkSoloWaiverRenewals(waivers, team, waiverFile, report);

  // Status
  const entries = new Map();
  for (const e of asArray(status?.controls)) {
    if (!e || typeof e.id !== 'string') continue;
    if (entries.has(e.id)) {
      report.error('status-duplicate', statusFile, `${e.id} muncul lebih dari sekali`);
      continue;
    }
    entries.set(e.id, e);
    const control = applicable.get(e.id);
    if (!control) {
      const known = catalog.controls.get(e.id) ?? localControls.get(e.id);
      const why = known?.deprecated ? 'deprecated' : known ? 'modulnya tidak aktif' : 'tidak ada di katalog maupun controls-local';
      report.error('status-unknown', statusFile, `${e.id} bukan kontrol yang berlaku (${why})`);
      continue;
    }
    const ctx = { report, statusFile, waivers, team, systemId, mode, teamSize: teamList.size };
    if (mode === 'solo') checkSoloStatusEntry(e, control, ctx);
    else checkStatusEntry(e, control, ctx);
  }
  if (status) {
    for (const id of applicable.keys()) {
      if (!entries.has(id)) report.error('status-missing', statusFile, `kontrol berlaku ${id} tidak ada di status.yaml`);
    }
  }

  // Threat model
  if (tm) checkThreatModel(tm, files['threat-model.yaml'], applicable, report);

  // A.5: baris mode dan rekap jalur verifikasi di bagian atas output --summary/--gate.
  if (opts.summary || opts.gate) printMode(mode, applicable, entries);

  report.print();

  if (opts.summary) printSummary(applicable, entries, systemId);

  let blockers = [];
  if (opts.gate) blockers = gateBlockers(opts.gate, applicable, entries, waivers, tm, profile, now, mode);
  if (opts.gate) printGate(opts.gate, blockers, profile);

  return finish(report, blockers.length);
}

function checkStatusEntry(e, control, ctx) {
  const { report, statusFile, waivers, team, systemId } = ctx;
  const id = e.id;
  const verified = verifiedEntries(e);
  const last = lastVerification(e);

  switch (e.status) {
    case 'in_progress':
      if (!nonEmpty(e.owner)) report.error('status-owner', statusFile, `${id}: in_progress wajib punya owner (C.4)`);
      break;
    case 'implemented':
      if (!asArray(e.evidence).some((ev) => nonEmpty(ev?.ref))) {
        report.error('status-evidence', statusFile, `${id}: implemented wajib punya evidence dengan ref konkret (C.4)`);
      }
      break;
    case 'verified':
      if (!asArray(e.evidence).some((ev) => nonEmpty(ev?.ref))) {
        report.error('status-evidence', statusFile, `${id}: verified wajib punya evidence dengan ref konkret (C.4)`);
      }
      if (onlySoloVerified(e)) {
        // A.6: verifikasi role solo tidak dihitung di team; entri menjadi pemblokir gate, bukan error.
        report.warn('solo-verification-in-team', statusFile,
          `${id}: verified hanya didukung self_review/external_reviewer; di mode team tidak dihitung dan wajib diverifikasi ulang (framework 03)`);
      } else if (verified.length === 0 || last?.result !== 'verified') {
        report.error('status-verification', statusFile, `${id}: verified wajib punya blok verification dengan result verified (C.4, E.2)`);
      } else {
        if (control.severity === 'critical') {
          const coordinator = requiredVerifyCoordinator(control);
          const hasRotation = verified.some((v) => v.verifier_role === 'rotation');
          const hasCoordinator = coordinator
            ? verified.some((v) => v.verifier_role === coordinator)
            : verified.some((v) => COORDINATOR_ROLES.includes(v.verifier_role));
          if (!hasRotation || !hasCoordinator) {
            report.error('critical-dual-verification', statusFile,
              `${id}: kontrol critical butuh verifikasi rotation dan ${coordinator ?? 'Coordinator'} (E.2)`);
          }
        }
        const pcAllowed = control.layer === 'BASE' && (control.domain === 'PRIV' || control.domain === 'GOV');
        if (!pcAllowed && verified.every((v) => v.verifier_role === 'program_coordinator')) {
          report.error('pc-sole-verifier', statusFile, `${id}: Program Coordinator tidak boleh menjadi verifikator tunggal kontrol non-PRIV/GOV (E.2)`);
        }
      }
      break;
    case 'rejected':
      if (!last || last.result !== 'rejected' || !nonEmpty(last.note)) {
        report.error('status-rejected', statusFile, `${id}: rejected wajib punya verification terakhir dengan result rejected dan note (C.4)`);
      }
      break;
    case 'waived': {
      if (control.class !== 'waivable') {
        report.error('status-waiver', statusFile, `${id}: kontrol non_waivable tidak boleh berstatus waived (C.3)`);
        break;
      }
      const waiver = waivers.get(e.waiver);
      if (!waiver) report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} tidak ada di waivers.yaml`);
      else if (waiver.control !== id) report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} untuk kontrol ${waiver.control}`);
      else if (waiver.status !== 'active') report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} berstatus ${waiver.status}, bukan active`);
      break;
    }
    case 'not_applicable':
      if (control.layer === 'BASE') {
        report.error('status-na-base', statusFile, `${id}: kontrol BASE tidak boleh not_applicable; gunakan waiver (C.4)`);
      } else if (!nonEmpty(e.reason) || verified.length === 0) {
        report.error('status-na', statusFile, `${id}: not_applicable wajib punya reason dan verification yang menyetujui (C.4)`);
      }
      break;
    default:
      break;
  }

  for (const v of asArray(e.verification)) {
    if (!v) continue;
    if (SOLO_ROLES.includes(v.verifier_role)) {
      // A.6: role solo tidak dihitung di team. self_review di luar entri verified adalah error.
      if (v.verifier_role === 'self_review' && e.status !== 'verified') {
        report.error('self-review-in-team', statusFile, `${id}: verifikasi self_review oleh ${v.verifier} tidak berlaku di mode team (RFC-0002 A.2)`);
      }
      continue;
    }
    if (team.has(normName(v.verifier)) || (v.verifier_role === 'rotation' && systemId && v.verifier_system === systemId)) {
      report.error('verifier-team-member', statusFile, `${id}: verifikator ${v.verifier} adalah anggota tim sistem (E.2)`);
    }
  }
}

function checkSoloStatusEntry(e, control, ctx) {
  const { report, statusFile, waivers, team, teamSize } = ctx;
  const id = e.id;
  const counted = countedVerifications(e, 'solo');
  const verified = counted.filter((v) => v.result === 'verified');
  const last = counted.length ? counted[counted.length - 1] : null;
  const hasRef = asArray(e.evidence).some((ev) => nonEmpty(ev?.ref));
  const implementedAt = typeof e.implemented_at === 'string' ? e.implemented_at : null;

  if (['implemented', 'verified'].includes(e.status) && !implementedAt) {
    report.error('solo-implemented-at', statusFile, `${id}: mode solo wajib mengisi implemented_at untuk status ${e.status} (RFC-0002 A.2)`);
  }

  switch (e.status) {
    case 'in_progress':
      if (!nonEmpty(e.owner)) report.error('status-owner', statusFile, `${id}: in_progress wajib punya owner (C.4)`);
      break;
    case 'implemented':
      if (!hasRef) report.error('status-evidence', statusFile, `${id}: implemented wajib punya evidence dengan ref konkret (C.4)`);
      break;
    case 'verified':
      if (!hasRef) report.error('status-evidence', statusFile, `${id}: verified wajib punya evidence dengan ref konkret (C.4)`);
      if (verified.length === 0 || last?.result !== 'verified') {
        report.error('solo-verification', statusFile, `${id}: verified butuh verifikasi self_review atau external_reviewer dengan result verified (S-1)`);
      } else if (control.severity === 'critical') {
        const external = verified.some((v) => v.verifier_role === 'external_reviewer' && !team.has(normName(v.verifier)));
        const self = verified.some((v) => v.verifier_role === 'self_review');
        const runnable = asArray(e.evidence).some((ev) => ['test', 'ci_run'].includes(ev?.type) && nonEmpty(ev?.ref));
        if (!external && !(self && runnable)) {
          report.error('solo-critical-evidence', statusFile,
            `${id}: kontrol critical butuh verifikasi external_reviewer, atau self_review dengan evidence test/ci_run (S-6)`);
        }
      }
      break;
    case 'rejected':
      if (!last || last.result !== 'rejected' || !nonEmpty(last.note)) {
        report.error('status-rejected', statusFile, `${id}: rejected wajib punya verification terakhir dengan result rejected dan note (C.4)`);
      }
      break;
    case 'waived': {
      if (control.class !== 'waivable') {
        report.error('status-waiver', statusFile, `${id}: kontrol non_waivable tidak boleh berstatus waived (C.3)`);
        break;
      }
      const waiver = waivers.get(e.waiver);
      if (!waiver) report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} tidak ada di waivers.yaml`);
      else if (waiver.control !== id) report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} untuk kontrol ${waiver.control}`);
      else if (waiver.status !== 'active') report.error('status-waiver', statusFile, `${id}: waiver ${e.waiver} berstatus ${waiver.status}, bukan active`);
      break;
    }
    case 'not_applicable':
      if (control.layer === 'BASE') {
        report.error('status-na-base', statusFile, `${id}: kontrol BASE tidak boleh not_applicable; gunakan waiver (C.4)`);
      } else if (!nonEmpty(e.reason) || verified.length === 0) {
        report.error('status-na', statusFile, `${id}: not_applicable wajib punya reason dan verification yang menyetujui (C.4)`);
      }
      break;
    default:
      break;
  }

  for (const v of asArray(e.verification)) {
    if (!v) continue;
    if (!SOLO_ROLES.includes(v.verifier_role)) {
      report.warn('solo-role-ignored', statusFile, `${id}: role ${v.verifier_role} (${v.verifier}) tidak dipakai di mode solo dan tidak dihitung (S-7)`);
      continue;
    }
    if (v.verifier_role === 'external_reviewer') {
      if (team.has(normName(v.verifier))) {
        report.error('external-team-member', statusFile, `${id}: external_reviewer ${v.verifier} tercantum di system.team (S-5)`);
      }
      continue;
    }
    // self_review
    if (implementedAt && typeof v.date === 'string' && daysBetween(implementedAt, v.date) < 1) {
      report.error('solo-cooling-off', statusFile,
        `${id}: self_review ${v.date} harus minimal 1 hari kalender setelah implemented_at ${implementedAt} (S-2)`);
    }
    if (!nonEmpty(v.note)) report.error('solo-note', statusFile, `${id}: self_review wajib punya note berisi apa yang diperiksa (S-3)`);
    if (teamSize >= 2 && nonEmpty(e.owner) && normName(v.verifier) === normName(e.owner)) {
      report.error('solo-self-owner', statusFile, `${id}: self_review oleh ${v.verifier}, owner entri ini; tim ${teamSize} orang wajib direview orang lain (S-4)`);
    }
  }
}

function checkThreatModel(tm, file, applicable, report) {
  const findings = asArray(tm.stride_findings);
  const seen = new Set();
  for (const f of findings) {
    if (!f) continue;
    const id = f.finding_id;
    if (seen.has(id)) report.error('tm-finding-duplicate', file, `finding ${id} duplikat`);
    seen.add(id);
    if (Number.isInteger(f.likelihood) && Number.isInteger(f.impact) && f.score !== f.likelihood * f.impact) {
      report.error('tm-score', file, `${id}: score ${f.score} harus = likelihood x impact (${f.likelihood * f.impact}) (F.3)`);
    }
    if (Number.isInteger(f.score) && f.risk_rating !== riskRating(f.score)) {
      report.error('tm-rating', file, `${id}: risk_rating ${f.risk_rating} tidak sesuai score ${f.score} (harus ${riskRating(f.score)}, F.3)`);
    }
    if (f.mitigation_status === 'done' && !nonEmpty(f.verification_evidence)) {
      report.error('tm-done-evidence', file, `${id}: mitigation_status done wajib punya verification_evidence`);
    }
    for (const c of asArray(f.related_controls)) {
      if (!applicable.has(c)) report.warn('tm-control-unknown', file, `${id}: related_controls ${c} bukan kontrol yang berlaku`);
    }
  }
  const boundaryIds = new Set();
  for (const b of asArray(tm.trust_boundaries)) {
    if (!b) continue;
    boundaryIds.add(b.boundary_id);
    if (!findings.some((f) => f?.trust_boundary_ref === b.boundary_id)) {
      report.error('tm-boundary-finding', file, `trust boundary ${b.boundary_id} belum punya finding STRIDE (F.1)`);
    }
  }
  for (const f of findings) {
    if (f && nonEmpty(f.trust_boundary_ref) && !boundaryIds.has(f.trust_boundary_ref)) {
      report.warn('tm-boundary-unknown', file, `${f.finding_id}: trust_boundary_ref ${f.trust_boundary_ref} tidak ada di trust_boundaries`);
    }
  }
}

function gateBlockers(gate, applicable, entries, waivers, tm, profile, now, mode = 'team') {
  const target = gateIndex(gate);
  const adoptionGate = profile?.adoption?.gate_at_adoption;
  const adoptionIdx = GATES.includes(adoptionGate) ? gateIndex(adoptionGate) : -1;
  const blockers = [];
  for (const control of applicable.values()) {
    const idx = gateIndex(control.gate);
    if (idx < 0 || idx > target) continue;
    const entry = entries.get(control.id);
    let st = entry?.status ?? 'tidak ada di status.yaml';
    let ok = false;
    if (st === 'verified') {
      // A.6: di team, verified yang hanya didukung role solo dihitung sebagai implemented.
      ok = !(mode === 'team' && onlySoloVerified(entry));
      if (!ok) st = 'implemented (verified hanya self_review/external_reviewer)';
    } else if (st === 'waived') ok = control.class === 'waivable' && waiverIsValid(waivers.get(entry.waiver), control.id, now);
    else if (st === 'not_applicable') ok = control.layer !== 'BASE' && verifiedEntries(entry, mode).length > 0;
    if (!ok) {
      blockers.push({ id: control.id, title: control.title, gate: control.gate, severity: control.severity, status: st, retro: idx <= adoptionIdx });
    }
  }
  // BASE-GOV-002: saat G6 tidak boleh ada finding critical/high yang not_started.
  if (target >= gateIndex('G6')) {
    for (const f of asArray(tm?.stride_findings)) {
      if (f && ['critical', 'high'].includes(f.risk_rating) && f.mitigation_status === 'not_started') {
        blockers.push({
          id: `threat-model:${f.finding_id}`,
          title: `Finding ${f.risk_rating} belum dimitigasi (BASE-GOV-002)`,
          gate: 'G6',
          severity: f.risk_rating,
          status: 'not_started',
          retro: gateIndex('G6') <= adoptionIdx,
        });
      }
    }
  }
  return blockers;
}

function printMode(mode, applicable, entries) {
  let external = 0;
  let selfOnly = 0;
  for (const id of applicable.keys()) {
    const entry = entries.get(id);
    if (entry?.status !== 'verified') continue;
    const solo = verifiedEntries(entry, 'solo');
    if (solo.some((v) => v.verifier_role === 'external_reviewer')) external += 1;
    else if (solo.some((v) => v.verifier_role === 'self_review')) selfOnly += 1;
  }
  console.log(MODE_LINE[mode]);
  console.log(`Kontrol verified lewat external_reviewer: ${external}; lewat self_review saja: ${selfOnly}`);
  console.log('');
}

function printGate(gate, blockers, profile) {
  const adoptionGate = profile?.adoption?.gate_at_adoption || '-';
  console.log('');
  console.log(`## Klaim gate ${gate}`);
  console.log('');
  console.log(`Gate saat adopsi: ${adoptionGate}`);
  console.log('');
  if (blockers.length === 0) {
    console.log(`Tidak ada pemblokir: semua kontrol berlaku dengan gate <= ${gate} terpenuhi (framework 03 §3).`);
    return;
  }
  console.log(`Pemblokir: ${blockers.length} kontrol/finding.`);
  console.log('');
  console.log('| ID | Judul | Gate | Severity | Status | Utang retroaktif |');
  console.log('|---|---|---|---|---|---|');
  for (const b of blockers) {
    console.log(`| ${b.id} | ${b.title} | ${b.gate} | ${b.severity} | ${b.status} | ${b.retro ? 'ya (utang retroaktif)' : 'tidak'} |`);
  }
}

function printSummary(applicable, entries, systemId) {
  const counts = new Map();
  const bump = (key, st) => {
    if (!counts.has(key)) counts.set(key, Object.fromEntries([...STATUSES, 'missing'].map((s) => [s, 0])));
    counts.get(key)[st] += 1;
  };
  const byStatus = Object.fromEntries([...STATUSES, 'missing'].map((s) => [s, 0]));
  for (const control of applicable.values()) {
    const st = entries.get(control.id)?.status;
    const key = STATUSES.includes(st) ? st : 'missing';
    byStatus[key] += 1;
    bump(`sev:${control.severity}`, key);
    const group = control.layer === 'BASE' ? `BASE-${control.domain}` : control.layer === 'MOD' ? `MOD-${control.moduleName}` : 'SYS';
    bump(`grp:${group}`, key);
  }
  const cols = [...STATUSES, 'missing'];
  const header = `| | ${cols.join(' | ')} | total |`;
  const sep = `|---|${cols.map(() => '---').join('|')}|---|`;
  const row = (label, c) => `| ${label} | ${cols.map((s) => c[s]).join(' | ')} | ${cols.reduce((n, s) => n + c[s], 0)} |`;

  console.log('');
  console.log(`## Rekap status AWG — ${systemId ?? '-'}`);
  console.log('');
  console.log('_Dihitung dari status.yaml saat ini; bukan sumber kebenaran dan tidak untuk disimpan._');
  console.log('');
  console.log('### Per status');
  console.log('');
  console.log('| Status | Jumlah |');
  console.log('|---|---|');
  for (const s of cols) console.log(`| ${s} | ${byStatus[s]} |`);
  console.log(`| total | ${applicable.size} |`);
  console.log('');
  console.log('### Per severity');
  console.log('');
  console.log(header);
  console.log(sep);
  for (const sev of SEVERITIES) if (counts.has(`sev:${sev}`)) console.log(row(sev, counts.get(`sev:${sev}`)));
  console.log('');
  console.log('### Per domain / modul');
  console.log('');
  console.log(header);
  console.log(sep);
  const groups = [...counts.keys()].filter((k) => k.startsWith('grp:')).map((k) => k.slice(4));
  const order = (g) => (g.startsWith('BASE-') ? DOMAINS.indexOf(g.slice(5)) : g === 'SYS' ? 1000 : 100);
  groups.sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  for (const g of groups) console.log(row(g, counts.get(`grp:${g}`)));
}

// ---------------------------------------------------------------- CLI

function finish(report, blockers = 0) {
  const failed = report.errors.length > 0 || blockers > 0;
  console.log('');
  const parts = [`${report.errors.length} error`, `${report.warnings.length} peringatan`];
  if (blockers) parts.push(`${blockers} pemblokir gate`);
  console.log(`HASIL: ${failed ? 'GAGAL' : 'LULUS'} (${parts.join(', ')})`);
  return failed ? EXIT_FAIL : EXIT_OK;
}

const USAGE = `Penggunaan:
  node awg-validate.mjs catalog --root <path-governance> [--gate-matrix [--check]]
  node awg-validate.mjs system --governance <path-governance> --awg <path-docs-awg> [--gate Gx] [--summary]

Exit code: 0 lulus, 1 pelanggaran, 2 error penggunaan.`;

export function main(argv) {
  const [command, ...rest] = argv;
  try {
    if (command === 'catalog') {
      const { values } = parseArgs({
        args: rest,
        options: { root: { type: 'string' }, 'gate-matrix': { type: 'boolean' }, check: { type: 'boolean' } },
        strict: true,
      });
      return runCatalog(values);
    }
    if (command === 'system') {
      const { values } = parseArgs({
        args: rest,
        options: {
          governance: { type: 'string' },
          awg: { type: 'string' },
          gate: { type: 'string' },
          summary: { type: 'boolean' },
        },
        strict: true,
      });
      return runSystem(values);
    }
    if (command === '--help' || command === '-h') {
      console.log(USAGE);
      return EXIT_OK;
    }
    throw new UsageError(command ? `perintah tidak dikenal: ${command}` : 'perintah wajib diisi');
  } catch (err) {
    if (err instanceof UsageError || err?.code?.startsWith?.('ERR_PARSE_ARGS')) {
      console.error(`Error penggunaan: ${err.message}`);
      console.error(USAGE);
      return EXIT_USAGE;
    }
    throw err;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
