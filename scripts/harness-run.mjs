#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getHarness, harnesses } from './harness-registry.mjs';
import { getHarnessState, isExecutableHarness } from './harness-probe.mjs';

const args = process.argv.slice(2);
const harnessId = args[0];
const harnessArgs = args.slice(1);
const usage = 'harness-run.mjs <harness-id> [args...]';
const hint = 'harness-run.mjs list | harness-run.mjs info <harness-id> | harness-run.mjs doctor';

function exitHarnessRunFailure(error, message, details = {}) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'harness-run',
        error,
        message,
        ...details,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

function exitInvalidArguments(message, details = {}) {
  exitHarnessRunFailure('invalid-arguments', message, details);
}

function rejectUnexpectedArgs(command, commandArgs, usage) {
  if (commandArgs.length === 0) {
    return;
  }

  exitInvalidArguments(`${command} does not accept extra arguments`, {
    usage,
    unexpectedArgs: commandArgs,
  });
}

function getExecutableHarnesses() {
  return harnesses.filter((harness) => isExecutableHarness(harness));
}

function buildDoctorActionQueue(harnessStates) {
  const statePriority = {
    'install-required': 0,
    ready: 1,
    deferred: 2,
    'policy-blocked': 3,
  };

  return harnessStates
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

function buildDoctorPolicyBlockedHarnessIds(harnessStates) {
  return harnessStates
    .filter((harness) => harness.state === 'policy-blocked')
    .map((harness) => harness.id);
}

function buildPrimaryRepoNativeCommandTemplate(primaryHarnessId, primaryHarness) {
  if (!primaryHarnessId) {
    return null;
  }

  if (primaryHarness?.runner === 'scripts/markitdown-convert.mjs') {
    return `node scripts/harness-run.mjs ${primaryHarnessId} <input-file> [output-file]`;
  }

  return `node scripts/harness-run.mjs ${primaryHarnessId}`;
}

function buildDoctorSummary({
  harnessStates,
  nextAction,
  readyHarnessIds,
  installRequiredHarnessIds,
  deferredHarnessIds,
  policyBlockedHarnessIds,
}) {
  const primaryHarnessId =
    nextAction?.harnessId ??
    readyHarnessIds[0] ??
    deferredHarnessIds[0] ??
    policyBlockedHarnessIds[0] ??
    null;
  const primaryHarness =
    primaryHarnessId === null
      ? null
      : harnessStates.find((harness) => harness.id === primaryHarnessId) ?? null;
  const primaryHarnessState =
    nextAction?.state ??
    (readyHarnessIds.length > 0
      ? 'ready'
      : deferredHarnessIds.length > 0
        ? 'deferred'
        : policyBlockedHarnessIds.length > 0
          ? 'policy-blocked'
          : 'none');
  const primaryRecommendedAction =
    nextAction?.recommendedAction ??
    (readyHarnessIds.length > 0
      ? 'run-approved-harness'
      : deferredHarnessIds.length > 0
        ? 'keep-outside-current-v1-path'
        : policyBlockedHarnessIds.length > 0
          ? 'do-not-run'
          : 'none');
  const primaryActionMessage =
    primaryHarnessId === null
      ? 'No representative harness action is required for the current host.'
      : primaryHarnessState === 'ready'
        ? `Run ${primaryHarnessId} now through ${buildPrimaryRepoNativeCommandTemplate(primaryHarnessId, primaryHarness)}.`
        : primaryHarnessState === 'install-required'
          ? primaryHarness?.installReview
            ? `Review ${primaryHarness.installReview} and install ${primaryHarnessId} locally before running it through the repo-native gate.`
            : `Install ${primaryHarnessId} locally before running it through the repo-native gate.`
          : primaryHarnessState === 'deferred'
            ? `Keep ${primaryHarnessId} outside the current v1 path and treat it as future-post-v1 only.`
            : primaryHarnessState === 'policy-blocked'
              ? `Do not run ${primaryHarnessId} in the current repo posture; keep it as signal-only.`
              : 'No representative harness action is required for the current host.';

  return {
    totalHarnesses: harnessStates.length,
    readyHarnessCount: readyHarnessIds.length,
    installRequiredHarnessCount: installRequiredHarnessIds.length,
    deferredHarnessCount: deferredHarnessIds.length,
    policyBlockedHarnessCount: policyBlockedHarnessIds.length,
    runnableNow: readyHarnessIds.length > 0,
    setupRequiredNow: installRequiredHarnessIds.length > 0,
    nextActionState: nextAction?.state ?? 'none',
    currentHostState:
      installRequiredHarnessIds.length > 0
        ? 'setup-required'
        : readyHarnessIds.length > 0
          ? 'runnable'
          : deferredHarnessIds.length > 0
            ? 'deferred-only'
            : policyBlockedHarnessIds.length > 0
              ? 'blocked-only'
              : 'no-harnesses',
    primaryHarnessId,
    primaryHarnessState,
    primaryRecommendedAction,
    primaryInstallReview: primaryHarness?.installReview ?? null,
    primaryNote: primaryHarness?.note ?? null,
    primaryPosture: primaryHarness?.posture ?? null,
    primaryKind: primaryHarness?.kind ?? null,
    primaryCommand: primaryHarness?.command ?? null,
    primaryRunner: primaryHarness?.runner ?? null,
    primaryExecutable: primaryHarness?.executable ?? null,
    primaryAvailable: primaryHarness?.available ?? null,
    primaryInstallReviewRequired: primaryHarness?.installReview != null,
    primaryReady: primaryHarness?.state === 'ready',
    primaryActionShort:
      primaryHarnessState === 'ready'
        ? 'run-now'
        : primaryHarnessState === 'install-required'
          ? 'install'
          : primaryHarnessState === 'deferred'
            ? 'defer'
        : primaryHarnessState === 'policy-blocked'
          ? 'blocked'
          : 'none',
    primaryActionMessage,
  };
}

if (!harnessId) {
  exitInvalidArguments('Missing required harness id.', {
    usage,
    hint,
    allowedSubcommands: ['list', 'info', 'doctor'],
  });
}

if (harnessId === 'list' || harnessId === '--list') {
  rejectUnexpectedArgs('list', harnessArgs, 'harness-run.mjs list');

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
    exitInvalidArguments('info requires a harness id', {
      usage: 'harness-run.mjs info <harness-id>',
    });
  }

  if (harnessArgs.length > 1) {
    exitInvalidArguments('info accepts exactly one harness id', {
      usage: 'harness-run.mjs info <harness-id>',
      unexpectedArgs: harnessArgs.slice(1),
    });
  }

  const harness = getHarness(infoHarnessId);
  if (!harness) {
    exitInvalidArguments(`Unknown harness: ${infoHarnessId}`, {
      usage: 'harness-run.mjs info <harness-id>',
      harnessId: infoHarnessId,
    });
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
  rejectUnexpectedArgs('doctor', harnessArgs, 'harness-run.mjs doctor');

  const harnessStates = harnesses.map((harness) => getHarnessState(harness));
  const actionQueue = buildDoctorActionQueue(harnessStates);
  const nextAction = buildDoctorNextAction(actionQueue);
  const readyHarnessIds = buildDoctorReadyHarnessIds(harnessStates);
  const installRequiredHarnessIds = buildDoctorInstallRequiredHarnessIds(harnessStates);
  const deferredHarnessIds = buildDoctorDeferredHarnessIds(harnessStates);
  const policyBlockedHarnessIds = buildDoctorPolicyBlockedHarnessIds(harnessStates);
  const summary = buildDoctorSummary({
    harnessStates,
    nextAction,
    readyHarnessIds,
    installRequiredHarnessIds,
    deferredHarnessIds,
    policyBlockedHarnessIds,
  });
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
        policyBlockedHarnessIds,
        summary,
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
  exitInvalidArguments(`Unknown harness: ${harnessId}`, {
    usage,
    hint,
    harnessId,
  });
}

if (!isExecutableHarness(harness)) {
  const harnessState = getHarnessState(harness);
  exitHarnessRunFailure(
    'harness-not-executable',
    `Harness ${harnessId} is not executable in the current repo posture.`,
    {
      harnessId,
      posture: harness.posture,
      state: harnessState.state,
      executable: harnessState.executable,
      runner: harnessState.runner,
      guidance: harness.note,
    },
  );
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runnerPath = path.join(repoRoot, harness.runner);
const result = spawnSync(process.execPath, [runnerPath, ...harnessArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
