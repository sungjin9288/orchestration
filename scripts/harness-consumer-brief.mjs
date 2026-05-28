#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

requireNoCliArgs(process.argv.slice(2), { mode: 'harness-consumer-brief' });

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const consumerStatusScript = path.join(repoRoot, 'scripts', 'harness-consumer-status.mjs');

const result = spawnSync(process.execPath, [consumerStatusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (result.status !== 0) {
  console.error(result.stderr?.trim() || `harness consumer status failed with status ${result.status}`);
  process.exit(result.status ?? 1);
}

const payload = JSON.parse(result.stdout);
if (payload.ok !== true || payload.mode !== 'harness-consumer-status' || !payload.statusCard || !payload.operatorAction) {
  console.error('harness consumer status returned an unexpected payload');
  process.exit(1);
}

const { statusCard, operatorAction } = payload;

function buildHeadline() {
  if (!statusCard.primaryHarnessId) {
    return 'No representative harness is available for this host.';
  }

  if (operatorAction.kind === 'repo-native-run') {
    return `${statusCard.primaryHarnessId} is ready on this host.`;
  }

  if (operatorAction.kind === 'install-review') {
    return `${statusCard.primaryHarnessId} still needs install review on this host.`;
  }

  if (operatorAction.kind === 'deferred') {
    return `${statusCard.primaryHarnessId} stays deferred outside the current v1 path.`;
  }

  if (operatorAction.kind === 'blocked') {
    return `${statusCard.primaryHarnessId} stays policy-blocked in the current v1 path.`;
  }

  return `No direct harness action is available for ${statusCard.primaryHarnessId}.`;
}

function buildActionLabel() {
  if (operatorAction.kind === 'repo-native-run') {
    return 'Run approved harness';
  }

  if (operatorAction.kind === 'install-review') {
    return 'Review install guidance';
  }

  if (operatorAction.kind === 'deferred') {
    return 'Keep deferred';
  }

  if (operatorAction.kind === 'blocked') {
    return 'Keep blocked';
  }

  return 'No action';
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'harness-consumer-brief',
      sourceMode: payload.mode,
      guidance:
        'Use this brief for shell-friendly operator or automation surfaces; it stays derived from the frozen consumer payload and does not widen the doctor producer contract.',
      brief: {
        currentHostState: statusCard.currentHostState,
        primaryHarnessId: statusCard.primaryHarnessId,
        headline: buildHeadline(),
        actionLabel: buildActionLabel(),
        actionCommand: operatorAction.repoNativeCommand,
        actionMessage: operatorAction.message,
      },
    },
    null,
    2,
  ),
);
