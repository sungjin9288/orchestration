#!/usr/bin/env node
import { harnesses } from './harness-registry.mjs';
import { isExecutableHarness, probeHarness } from './harness-probe.mjs';

const checks = harnesses.map((harness) => {
  const probe = probeHarness(harness);
  return {
    id: harness.id,
    posture: harness.posture,
    kind: harness.kind,
    command: harness.command,
    available: probe.available,
    executable: isExecutableHarness(harness),
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
