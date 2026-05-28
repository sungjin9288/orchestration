#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

requireNoCliArgs(process.argv.slice(2), { mode: 'harness-consumer-status' });

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

function buildRepoNativeCommandTemplate() {
  if (!summary.primaryHarnessId) {
    return null;
  }

  if (summary.primaryRunner === 'scripts/markitdown-convert.mjs') {
    return `node scripts/harness-run.mjs ${summary.primaryHarnessId} <input-file> [output-file]`;
  }

  return `node scripts/harness-run.mjs ${summary.primaryHarnessId}`;
}

const operatorAction = (() => {
  if (!summary.primaryHarnessId) {
    return {
      kind: 'none',
      harnessId: null,
      repoNativeCommand: null,
      message: 'No representative harness is available in the frozen doctor summary.',
    };
  }

  if (summary.primaryReady) {
    return {
      kind: 'repo-native-run',
      harnessId: summary.primaryHarnessId,
      repoNativeCommand: buildRepoNativeCommandTemplate(),
      message: summary.primaryActionMessage,
    };
  }

  if (summary.primaryInstallReviewRequired) {
    return {
      kind: 'install-review',
      harnessId: summary.primaryHarnessId,
      repoNativeCommand: null,
      message: summary.primaryActionMessage,
    };
  }

  if (summary.primaryHarnessState === 'deferred') {
    return {
      kind: 'deferred',
      harnessId: summary.primaryHarnessId,
      repoNativeCommand: null,
      message: summary.primaryActionMessage,
    };
  }

  if (summary.primaryHarnessState === 'policy-blocked') {
    return {
      kind: 'blocked',
      harnessId: summary.primaryHarnessId,
      repoNativeCommand: null,
      message: summary.primaryActionMessage,
    };
  }

  return {
    kind: 'none',
    harnessId: summary.primaryHarnessId,
    repoNativeCommand: null,
    message: summary.primaryActionMessage,
  };
})();

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'harness-consumer-status',
      sourceMode: payload.mode,
      guidance:
        'Consume the frozen harness doctor.summary contract here; do not recompute host posture from raw harness arrays in downstream operator surfaces.',
      operatorAction,
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
