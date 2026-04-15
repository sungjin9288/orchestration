#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const result = spawnSync(process.execPath, [runScript, 'doctor'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (result.status !== 0) {
  console.error(result.stderr?.trim() || `harness doctor failed with status ${result.status}`);
  process.exit(result.status ?? 1);
}

const payload = JSON.parse(result.stdout);
if (payload.ok !== true || payload.mode !== 'harness-run-doctor' || !payload.summary) {
  console.error('harness doctor returned an unexpected payload');
  process.exit(1);
}

const { summary } = payload;

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'harness-consumer-status',
      sourceMode: payload.mode,
      guidance:
        'Consume the frozen harness doctor.summary contract here; do not recompute host posture from raw harness arrays in downstream operator surfaces.',
      statusCard: {
        currentHostState: summary.currentHostState,
        primaryHarnessId: summary.primaryHarnessId,
        primaryPosture: summary.primaryPosture,
        primaryKind: summary.primaryKind,
        primaryHarnessState: summary.primaryHarnessState,
        primaryCommand: summary.primaryCommand,
        primaryRunner: summary.primaryRunner,
        primaryExecutable: summary.primaryExecutable,
        primaryAvailable: summary.primaryAvailable,
        primaryReady: summary.primaryReady,
        primaryActionShort: summary.primaryActionShort,
        primaryActionMessage: summary.primaryActionMessage,
      },
    },
    null,
    2,
  ),
);
