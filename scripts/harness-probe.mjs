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

export function getHarnessState(harness) {
  const probe = probeHarness(harness);
  const executable = isExecutableHarness(harness);

  let state = 'policy-blocked';
  let recommendedAction = 'do-not-run';

  if (executable && probe.available) {
    state = 'ready';
    recommendedAction = 'run-approved-harness';
  } else if (executable) {
    state = 'install-required';
    recommendedAction = 'review-install-and-install-locally';
  } else if (harness.posture === 'future-post-v1') {
    state = 'deferred';
    recommendedAction = 'keep-outside-current-v1-path';
  }

  return {
    id: harness.id,
    posture: harness.posture,
    kind: harness.kind,
    command: harness.command,
    runner: harness.runner ?? null,
    available: probe.available,
    executable,
    state,
    recommendedAction,
    note: harness.note,
    installReview: harness.installReview,
  };
}
