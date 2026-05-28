#!/usr/bin/env node
import { harnesses } from './harness-registry.mjs';
import { getHarnessState } from './harness-probe.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

requireNoCliArgs(process.argv.slice(2), { mode: 'harness-status' });

const checks = harnesses.map((harness) => getHarnessState(harness));

const counts = checks.reduce(
  (accumulator, harness) => {
    accumulator.total += 1;
    accumulator.byPosture[harness.posture] = (accumulator.byPosture[harness.posture] || 0) + 1;
    accumulator.byState[harness.state] = (accumulator.byState[harness.state] || 0) + 1;
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
    byState: {},
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
