'use strict';

const {
  SPECIALIST_CELL_RETRY_STATUS,
  assertSpecialistCellRetryRecord,
} = require('../runtime/specialist-cell-retries');
const {
  SPECIALIST_CELL_ATTEMPT_STATUS,
  assertSpecialistCellAttemptRecord,
} = require('../runtime/specialist-cell-attempts');
const {
  normalizeWorkerOutcome,
  runSpecialistQaLocal,
} = require('./specialist-batch-coordinator');
const {
  runSpecialistResearcherLocal,
} = require('./specialist-researcher-local-runner');

function assertCoordinatorInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('SpecialistCellRetry coordinator input must be an object');
  }
  assertSpecialistCellRetryRecord(input.retry);
  assertSpecialistCellAttemptRecord(input.sourceCellAttempt, {
    expectedAttemptNumber: 1,
  });
  assertSpecialistCellAttemptRecord(input.retryCellAttempt, {
    expectedAttemptNumber: 2,
  });
  if (
    input.retry.status !== SPECIALIST_CELL_RETRY_STATUS.ACTIVE ||
    input.sourceCellAttempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.FAILED ||
    input.retryCellAttempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
    input.retry.specialistBatchId !== input.sourceCellAttempt.specialistBatchId ||
    input.retry.specialistBatchId !== input.retryCellAttempt.specialistBatchId ||
    input.retry.sourceCellAttemptId !== input.sourceCellAttempt.id ||
    input.retry.retryCellAttemptId !== input.retryCellAttempt.id ||
    input.sourceCellAttempt.role !== input.retryCellAttempt.role ||
    input.sourceCellAttempt.cellId !== input.retryCellAttempt.cellId ||
    input.sourceCellAttempt.agentProfileId !==
      input.retryCellAttempt.agentProfileId ||
    input.sourceCellAttempt.position !== input.retryCellAttempt.position ||
    input.sourceCellAttempt.cellSpecDigest !==
      input.retryCellAttempt.cellSpecDigest ||
    input.sourceCellAttempt.sourceDigest !==
      input.retryCellAttempt.sourceDigest ||
    input.sourceCellAttempt.inputDigest !== input.retryCellAttempt.inputDigest ||
    JSON.stringify(input.sourceCellAttempt.inputPathDigests) !==
      JSON.stringify(input.retryCellAttempt.inputPathDigests)
  ) {
    throw new Error('SpecialistCellRetry coordinator lineage is invalid');
  }
  if (typeof input.settle !== 'function') {
    throw new Error('SpecialistCellRetry coordinator requires a settlement callback');
  }
}

async function runSpecialistCellRetry(input, options = {}) {
  assertCoordinatorInput(input);
  const researcherRunner =
    options.researcherRunner || runSpecialistResearcherLocal;

  let workerOutcome;
  try {
    workerOutcome =
      input.retryCellAttempt.role === 'researcher'
        ? await researcherRunner(
            {
              projectRoot: input.projectRoot,
              cellAttempt: input.retryCellAttempt,
            },
            options,
          )
        : await runSpecialistQaLocal(
            {
              projectRoot: input.projectRoot,
              cellAttempt: input.retryCellAttempt,
              qaInput: input.qaInput,
            },
            options,
          );
  } catch {
    workerOutcome = null;
  }

  const transition = normalizeWorkerOutcome(
    workerOutcome,
    input.retryCellAttempt,
  );
  const value = await input.settle({
    specialistCellRetryId: input.retry.id,
    retryCellAttemptId: input.retryCellAttempt.id,
    sourceCellAttemptId: input.sourceCellAttempt.id,
    sourceDigest: input.retryCellAttempt.sourceDigest,
    inputDigest: input.retryCellAttempt.inputDigest,
    transition,
  });
  return {
    specialistCellRetryId: input.retry.id,
    retryCellAttemptId: input.retryCellAttempt.id,
    settlement: {
      status: 'fulfilled',
      value,
    },
  };
}

module.exports = {
  assertCoordinatorInput,
  runSpecialistCellRetry,
};
