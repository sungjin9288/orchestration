'use strict';

const {
  SPECIALIST_BATCH_STATUS,
  assertSpecialistBatchRecord,
} = require('../runtime/specialist-batches');
const {
  FIXED_CELL_CONTRACTS,
  SPECIALIST_CELL_ATTEMPT_STATUS,
  SPECIALIST_CELL_FAILURE_REASON,
  assertResultSummaryMatchesCell,
  assertSpecialistCellAttemptRecord,
  normalizeResultSummary,
} = require('../runtime/specialist-cell-attempts');
const {
  runSpecialistResearcherLocal,
} = require('./specialist-researcher-local-runner');
const {
  runSpecialistSourceBoundNodeChecks,
} = require('./qa-node-check-runner');

function assertCoordinatorInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('SpecialistBatch coordinator input must be an object');
  }
  assertSpecialistBatchRecord(input.batch);
  if (input.batch.status !== SPECIALIST_BATCH_STATUS.ACTIVE) {
    throw new Error('SpecialistBatch must be active before worker dispatch');
  }
  if (!Array.isArray(input.cellAttempts) || input.cellAttempts.length !== 2) {
    throw new Error('SpecialistBatch coordinator requires exactly two cell attempts');
  }
  for (const [position, attempt] of input.cellAttempts.entries()) {
    assertSpecialistCellAttemptRecord(attempt, { batchDeadlineAt: input.batch.deadlineAt });
    const expected = FIXED_CELL_CONTRACTS[position];
    if (
      attempt.id !== input.batch.cellAttemptIds[position] ||
      attempt.specialistBatchId !== input.batch.id ||
      attempt.position !== position ||
      attempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
      attempt.cellId !== expected.cellId ||
      attempt.agentProfileId !== expected.agentProfileId ||
      attempt.role !== expected.role ||
      attempt.sourceDigest !== input.batch.sourceDigest
    ) {
      throw new Error('SpecialistBatch coordinator cell contract is invalid');
    }
  }
  if (typeof input.settle !== 'function') {
    throw new Error('SpecialistBatch coordinator requires a settlement callback');
  }
}

function createFailureIsolatedSettlementQueue(settle) {
  if (typeof settle !== 'function') throw new Error('settle must be a function');
  let tail = Promise.resolve();

  function enqueue(payload) {
    const task = tail.catch(() => undefined).then(() => settle(payload));
    tail = task.catch(() => undefined);
    return task;
  }

  return { enqueue, drain: () => tail };
}

function runnerFailure() {
  return {
    status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
    observedInputDigest: null,
    failureReason: SPECIALIST_CELL_FAILURE_REASON.RUNNER_CONTRACT_FAILED,
  };
}

function normalizeWorkerOutcome(outcome, cellAttempt) {
  if (!outcome || typeof outcome !== 'object' || Array.isArray(outcome)) {
    return runnerFailure();
  }
  if (outcome.status === SPECIALIST_CELL_ATTEMPT_STATUS.FAILED) {
    if (!Object.values(SPECIALIST_CELL_FAILURE_REASON).includes(outcome.failureReason)) {
      return runnerFailure();
    }
    if (
      outcome.observedInputDigest !== null &&
      !/^[a-f0-9]{64}$/.test(outcome.observedInputDigest)
    ) {
      return runnerFailure();
    }
    return {
      status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
      observedInputDigest: outcome.observedInputDigest,
      failureReason: outcome.failureReason,
    };
  }
  if (outcome.status !== SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED) {
    return runnerFailure();
  }
  if (outcome.observedInputDigest !== cellAttempt.inputDigest) {
    return runnerFailure();
  }
  try {
    const resultSummary = normalizeResultSummary(outcome.resultSummary);
    assertResultSummaryMatchesCell(resultSummary, cellAttempt);
    return {
      status: SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED,
      observedInputDigest: outcome.observedInputDigest,
      resultSummary,
    };
  } catch {
    return runnerFailure();
  }
}

function redactQaResult(result, preparedChecks) {
  if (!result || typeof result !== 'object' || !Array.isArray(result.checks)) {
    throw new Error('QA result is invalid');
  }
  if (result.checks.length !== preparedChecks.length) {
    throw new Error('QA result check count is invalid');
  }
  const checks = result.checks.map((check, index) => ({
    relativePath: preparedChecks[index].relativePath,
    exitCode: Number.isInteger(check.exitCode) ? check.exitCode : null,
    timedOut: check.timedOut === true,
    truncated: check.truncated === true,
    passed: check.passed === true,
    stdoutDigest: check.stdoutDigest,
    stderrDigest: check.stderrDigest,
  }));
  return {
    kind: 'node-syntax-check',
    checks,
    mutationDetected: result.mutationDetected === true,
    verdict: result.verdict === 'passed' ? 'passed' : 'failed',
  };
}

function prepareQaChecks(qaInput, cellAttempt) {
  const commands = qaInput?.commands;
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('QA commands are required');
  }
  const allowedPaths = new Set(cellAttempt.inputPathDigests.map((entry) => entry.path));
  const checks = commands.map((command) => {
    const match = /^node --check ([A-Za-z0-9][A-Za-z0-9._/-]*)$/.exec(command);
    if (!match || !allowedPaths.has(match[1])) {
      throw new Error('QA command is outside the source-bound cell contract');
    }
    return { relativePath: match[1] };
  });
  if (new Set(checks.map((check) => check.relativePath)).size !== checks.length) {
    throw new Error('QA commands must not repeat paths');
  }
  return checks;
}

async function runSpecialistQaLocal(input, options = {}) {
  try {
    prepareQaChecks(input.qaInput, input.cellAttempt);
  } catch {
    return runnerFailure();
  }
  const qaRunner = options.qaRunner || runSpecialistSourceBoundNodeChecks;
  try {
    const result = await qaRunner({
      projectRoot: input.projectRoot,
      inputPathDigests: input.cellAttempt.inputPathDigests,
      inputDigest: input.cellAttempt.inputDigest,
      deadlineAt: input.cellAttempt.deadlineAt,
      commands: input.qaInput.commands,
      targetPathAllowlist: input.qaInput.targetPathAllowlist,
    }, {
      spawnImpl: options.spawnImpl,
      maxChecks: options.maxChecks,
      outputCapBytes: options.outputCapBytes,
      now: options.now,
    });
    return {
      status: SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED,
      observedInputDigest: result?.observedInputDigest,
      resultSummary: result?.resultSummary,
    };
  } catch (error) {
    const failureReason = Object.values(SPECIALIST_CELL_FAILURE_REASON).includes(error?.code)
      ? error.code
      : SPECIALIST_CELL_FAILURE_REASON.RUNNER_CONTRACT_FAILED;
    return {
      status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
      observedInputDigest: /^[a-f0-9]{64}$/.test(error?.observedInputDigest || '')
        ? error.observedInputDigest
        : null,
      failureReason,
    };
  }
}

async function runSpecialistBatch(input, options = {}) {
  assertCoordinatorInput(input);
  const [researcherAttempt, qaAttempt] = input.cellAttempts;
  const queue = createFailureIsolatedSettlementQueue(input.settle);
  const researcherRunner = options.researcherRunner || runSpecialistResearcherLocal;

  const researcherWorker = Promise.resolve().then(() => researcherRunner({
    projectRoot: input.projectRoot,
    cellAttempt: researcherAttempt,
    batchDeadlineAt: input.batch.deadlineAt,
  }, options));
  const qaWorker = Promise.resolve().then(() => runSpecialistQaLocal({
    projectRoot: input.projectRoot,
    batch: input.batch,
    cellAttempt: qaAttempt,
    qaInput: input.qaInput,
  }, options));

  const settleWorker = (cellAttempt, worker) => worker
    .catch(() => runnerFailure())
    .then((outcome) => queue.enqueue({
      specialistBatchId: input.batch.id,
      cellAttemptId: cellAttempt.id,
      sourceDigest: input.batch.sourceDigest,
      inputDigest: cellAttempt.inputDigest,
      transition: normalizeWorkerOutcome(outcome, cellAttempt),
    }));

  const settlements = await Promise.allSettled([
    settleWorker(researcherAttempt, researcherWorker),
    settleWorker(qaAttempt, qaWorker),
  ]);
  await queue.drain();
  return {
    specialistBatchId: input.batch.id,
    settlements: settlements.map((settlement) => settlement.status === 'fulfilled'
      ? { status: 'fulfilled', value: settlement.value }
      : {
          status: 'rejected',
          reason:
            settlement.reason?.name === 'StateConflictError'
              ? 'state-conflict'
              : 'settlement-failed',
        }),
  };
}

module.exports = {
  assertCoordinatorInput,
  createFailureIsolatedSettlementQueue,
  normalizeWorkerOutcome,
  prepareQaChecks,
  redactQaResult,
  runSpecialistBatch,
  runSpecialistQaLocal,
};
