#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { harnesses } from './harness-registry.mjs';

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
