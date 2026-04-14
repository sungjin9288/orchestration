#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHarness, harnesses } from './harness-registry.mjs';
import { getHarnessState, isExecutableHarness } from './harness-probe.mjs';

const args = process.argv.slice(2);
const harnessId = args[0];
const harnessArgs = args.slice(1);

function getExecutableHarnesses() {
  return harnesses.filter((harness) => isExecutableHarness(harness));
}

function buildDoctorActionQueue(harnessStates) {
  const statePriority = {
    'install-required': 0,
    deferred: 1,
    'policy-blocked': 2,
    ready: 3,
  };

  return harnessStates
    .filter((harness) => harness.state !== 'ready')
    .sort((left, right) => statePriority[left.state] - statePriority[right.state])
    .map((harness) => ({
      harnessId: harness.id,
      state: harness.state,
      recommendedAction: harness.recommendedAction,
      installReview: harness.installReview,
      note: harness.note,
    }));
}

function buildDoctorNextAction(actionQueue) {
  return actionQueue[0] ?? null;
}

function buildDoctorReadyHarnessIds(harnessStates) {
  return harnessStates.filter((harness) => harness.state === 'ready').map((harness) => harness.id);
}

function buildDoctorInstallRequiredHarnessIds(harnessStates) {
  return harnessStates
    .filter((harness) => harness.state === 'install-required')
    .map((harness) => harness.id);
}

function buildDoctorDeferredHarnessIds(harnessStates) {
  return harnessStates.filter((harness) => harness.state === 'deferred').map((harness) => harness.id);
}

if (!harnessId) {
  console.error('Usage: harness-run.mjs <harness-id> [args...]');
  console.error('Hint: harness-run.mjs list | harness-run.mjs info <harness-id>');
  process.exit(2);
}

if (harnessId === 'list' || harnessId === '--list') {
  const executableHarnesses = getExecutableHarnesses().map((harness) => ({
    id: harness.id,
    posture: harness.posture,
    runner: harness.runner,
    note: harness.note,
  }));
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'harness-run-list',
        executableHarnesses,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (harnessId === 'info' || harnessId === '--info') {
  const infoHarnessId = harnessArgs[0];
  if (!infoHarnessId) {
    console.error('Usage: harness-run.mjs info <harness-id>');
    process.exit(2);
  }

  const harness = getHarness(infoHarnessId);
  if (!harness) {
    console.error(`Unknown harness: ${infoHarnessId}`);
    process.exit(2);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'harness-run-info',
        harness: getHarnessState(harness),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (harnessId === 'doctor' || harnessId === '--doctor') {
  const harnessStates = harnesses.map((harness) => getHarnessState(harness));
  const actionQueue = buildDoctorActionQueue(harnessStates);
  const nextAction = buildDoctorNextAction(actionQueue);
  const readyHarnessIds = buildDoctorReadyHarnessIds(harnessStates);
  const installRequiredHarnessIds = buildDoctorInstallRequiredHarnessIds(harnessStates);
  const deferredHarnessIds = buildDoctorDeferredHarnessIds(harnessStates);
  const counts = harnessStates.reduce(
    (accumulator, harness) => {
      accumulator.total += 1;
      accumulator.byState[harness.state] = (accumulator.byState[harness.state] || 0) + 1;
      return accumulator;
    },
    {
      total: 0,
      byState: {},
    },
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'harness-run-doctor',
        guidance: 'Use ready for immediate repo-native execution, install-required for approved harness setup, deferred for future-post-v1, and policy-blocked for signal-only references.',
        nextAction,
        readyHarnessIds,
        installRequiredHarnessIds,
        deferredHarnessIds,
        actionQueue,
        counts,
        harnesses: harnessStates,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const harness = getHarness(harnessId);
if (!harness) {
  console.error(`Unknown harness: ${harnessId}`);
  process.exit(2);
}

if (!isExecutableHarness(harness)) {
  console.error(`Harness ${harnessId} is not executable in the current repo posture.`);
  console.error(`Posture: ${harness.posture}`);
  console.error(`Guidance: ${harness.note}`);
  process.exit(2);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runnerPath = path.join(repoRoot, harness.runner);
const result = spawnSync(process.execPath, [runnerPath, ...harnessArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
