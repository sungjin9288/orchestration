import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const scriptsRoot = path.join(repoRoot, 'scripts');
const DEFAULT_TIMEOUT_MS = 120_000;

function readPositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseArgs(args) {
  const options = {
    all: false,
    dryRun: false,
    failFast: false,
    filter: null,
    list: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--fail-fast') {
      options.failFast = true;
    } else if (arg === '--filter') {
      index += 1;
      options.filter = args[index] || null;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--timeout-ms') {
      index += 1;
      options.timeoutMs = readPositiveInteger(args[index], DEFAULT_TIMEOUT_MS);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function discoverSmokeScripts() {
  return fs
    .readdirSync(scriptsRoot)
    .filter((name) => /^smoke-.*\.mjs$/.test(name))
    .sort()
    .map((name) => `scripts/${name}`);
}

function selectSmokeScripts(scripts, options) {
  if (options.all) {
    return scripts;
  }
  if (options.filter) {
    return scripts.filter((script) => path.basename(script).includes(options.filter));
  }
  return [];
}

function trimOutput(value) {
  if (!value) {
    return '';
  }
  return value.length > 4000 ? value.slice(-4000) : value;
}

function writeJson(payload, stream = process.stdout) {
  stream.write(`${JSON.stringify(payload, null, 2)}\n`);
}

function fail(message, details = {}) {
  writeJson(
    {
      ok: false,
      mode: 'smoke-runner-error',
      message,
      ...details,
    },
    process.stderr,
  );
  process.exit(2);
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  fail(error.message);
}

const scripts = discoverSmokeScripts();

if (options.list) {
  writeJson({
    ok: true,
    mode: 'smoke-runner-list',
    count: scripts.length,
    scripts,
  });
  process.exit(0);
}

if (!options.all && !options.filter) {
  fail('Pass --filter <text> for a targeted run, --all for the full smoke set, or --list to inspect scripts.');
}

const selectedScripts = selectSmokeScripts(scripts, options);

if (selectedScripts.length === 0) {
  fail('No smoke scripts matched the requested selection.', {
    filter: options.filter,
    all: options.all,
  });
}

if (options.dryRun) {
  writeJson({
    ok: true,
    mode: 'smoke-runner-dry-run',
    count: selectedScripts.length,
    scripts: selectedScripts,
  });
  process.exit(0);
}

const results = [];

for (const script of selectedScripts) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, [script], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: options.timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  });
  const durationMs = Date.now() - startedAt;
  const timedOut = result.error?.code === 'ETIMEDOUT';
  const ok = result.status === 0 && !result.signal && !result.error;
  const record = {
    script,
    ok,
    status: result.status,
    signal: result.signal,
    durationMs,
    timedOut,
  };

  if (!ok) {
    record.error = result.error?.message || null;
    record.stdoutTail = trimOutput(result.stdout);
    record.stderrTail = trimOutput(result.stderr);
  }

  results.push(record);

  if (!ok && options.failFast) {
    break;
  }
}

const failures = results.filter((result) => !result.ok);

writeJson({
  ok: failures.length === 0,
  mode: 'smoke-runner',
  selection: {
    all: options.all,
    filter: options.filter,
    timeoutMs: options.timeoutMs,
    failFast: options.failFast,
  },
  counts: {
    matched: selectedScripts.length,
    executed: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
  },
  results,
  failures,
});

process.exit(failures.length === 0 ? 0 : 1);
