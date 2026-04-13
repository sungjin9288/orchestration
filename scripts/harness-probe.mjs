import { spawnSync } from 'node:child_process';

export function probeHarness(harness) {
  const result = spawnSync(harness.command, harness.checkArgs, {
    stdio: 'ignore',
  });

  return {
    available: result.status === 0,
    status: result.status,
    signal: result.signal,
  };
}

export function isExecutableHarness(harness) {
  return harness.posture === 'approved-now' && Boolean(harness.runner);
}
