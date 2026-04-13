#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const harnesses = [
  {
    id: 'markitdown',
    posture: 'approved-now',
    kind: 'local-cli-wrapper',
    command: 'markitdown',
    checkArgs: ['--version'],
    note: 'Document-to-Markdown preprocessing only. Keep explicit and local.',
    installReview: 'pipx install markitdown',
  },
  {
    id: 'mempalace',
    posture: 'future-post-v1',
    kind: 'local-memory-harness',
    command: 'mempalace',
    checkArgs: ['status'],
    note: 'Local memory harness signal. Not part of the v1 runtime path.',
    installReview: 'pip install mempalace',
  },
  {
    id: 'hermes-agent',
    posture: 'signal-only',
    kind: 'multi-provider-agent-platform',
    command: 'hermes',
    checkArgs: ['--help'],
    note: 'Reference only. Do not adopt its multi-provider or messaging gateway posture into v1.',
    installReview: 'review upstream install flow before any local experiment',
  },
  {
    id: 'free-code',
    posture: 'signal-only',
    kind: 'multi-provider-cli-fork',
    command: 'free-code',
    checkArgs: ['--help'],
    note: 'Reference only. Avoid making curl|bash or guardrail removal the default repo guidance.',
    installReview: 'review install.sh locally before any manual trial',
  },
];

function probeCommand(command, checkArgs) {
  const result = spawnSync(command, checkArgs, {
    stdio: 'ignore',
  });

  return {
    available: result.status === 0,
    status: result.status,
    signal: result.signal,
  };
}

const checks = harnesses.map((harness) => {
  const probe = probeCommand(harness.command, harness.checkArgs);
  return {
    id: harness.id,
    posture: harness.posture,
    kind: harness.kind,
    command: harness.command,
    available: probe.available,
    note: harness.note,
    installReview: harness.installReview,
  };
});

const counts = checks.reduce(
  (accumulator, harness) => {
    accumulator.total += 1;
    accumulator.byPosture[harness.posture] = (accumulator.byPosture[harness.posture] || 0) + 1;
    if (harness.available) {
      accumulator.available += 1;
    } else {
      accumulator.missing += 1;
    }
    return accumulator;
  },
  {
    total: 0,
    available: 0,
    missing: 0,
    byPosture: {},
  },
);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'harness-status',
      guidance: 'Availability does not imply adoption. Follow posture and source-of-truth docs first.',
      counts,
      harnesses: checks,
    },
    null,
    2,
  ),
);
