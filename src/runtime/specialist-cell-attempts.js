'use strict';

const crypto = require('crypto');
const path = require('path');

const SPECIALIST_CELL_ATTEMPT_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

const SPECIALIST_CELL_FAILURE_REASON = Object.freeze({
  DEADLINE_EXPIRED_BEFORE_WORKER: 'deadline-expired-before-worker',
  CELL_DEADLINE_EXCEEDED: 'cell-deadline-exceeded',
  SOURCE_DRIFT_BEFORE_WORKER: 'source-drift-before-worker',
  SOURCE_DRIFT_DURING_WORKER: 'source-drift-during-worker',
  SOURCE_UNAVAILABLE_AFTER_START: 'source-unavailable-after-start',
  SOURCE_BYTE_CAP_EXCEEDED_AFTER_START: 'source-byte-cap-exceeded-after-start',
  QA_SPAWN_FAILED: 'qa-spawn-failed',
  QA_OUTPUT_CAP_EXCEEDED: 'qa-output-cap-exceeded',
  RUNNER_CONTRACT_FAILED: 'runner-contract-failed',
});

const SPECIALIST_CELL_ATTEMPT_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'specialistBatchId',
  'cellId',
  'agentProfileId',
  'role',
  'position',
  'attemptNumber',
  'status',
  'cellSpecDigest',
  'sourceDigest',
  'inputPathDigests',
  'inputDigest',
  'observedInputDigest',
  'cellDeadlineMs',
  'deadlineAt',
  'resultSummary',
  'resultDigest',
  'failureReason',
  'startedAt',
  'completedAt',
  'recordDigest',
]);

const CREATE_INPUT_KEYS = Object.freeze([
  'id',
  'specialistBatchId',
  'cellId',
  'agentProfileId',
  'role',
  'position',
  'cellSpecDigest',
  'sourceDigest',
  'inputPathDigests',
  'cellDeadlineMs',
  'batchDeadlineAt',
  'startedAt',
]);

const COMPLETED_TRANSITION_KEYS = Object.freeze([
  'completedAt',
  'observedInputDigest',
  'resultSummary',
  'status',
]);

const FAILED_TRANSITION_KEYS = Object.freeze([
  'completedAt',
  'failureReason',
  'observedInputDigest',
  'status',
]);

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_INPUT_PATHS = 16;
const MAX_TOTAL_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_CELL_DEADLINE_MS = 300000;
const MAX_RESULT_SUMMARY_BYTES = 64 * 1024;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;

const FIXED_CELL_CONTRACTS = Object.freeze([
  Object.freeze({
    agentProfileId: 'agent-researcher',
    cellId: 'research-source-evidence',
    role: 'researcher',
  }),
  Object.freeze({
    agentProfileId: 'agent-qa',
    cellId: 'verify-plan-evidence',
    role: 'qa',
  }),
]);

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label, { nullable = false, maxLength = 1024 } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  const normalized = value.trim();
  if (/[^\x20-\x7E]/.test(normalized) || normalized.length > maxLength) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeIdentifier(value, label) {
  const normalized = normalizeText(value, label);
  if (!IDENTIFIER_PATTERN.test(normalized)) throw new Error(`${label} is invalid`);
  return normalized;
}

function normalizeDigest(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return null;
  const normalized = normalizeText(value, label, { maxLength: 64 });
  if (!SHA256_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a lowercase SHA-256 digest`);
  }
  return normalized;
}

function normalizeTimestamp(value, label) {
  const normalized = normalizeText(value, label);
  if (
    Number.isNaN(Date.parse(normalized)) ||
    new Date(normalized).toISOString() !== normalized
  ) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizeRelativePath(value, label) {
  const normalized = normalizeText(value, label);
  if (
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.includes('\\') ||
    /[*?[\]{}!]/.test(normalized)
  ) {
    throw new Error(`${label} must be a literal project-relative POSIX path`);
  }
  const segments = normalized.split('/');
  if (
    segments.some((segment) => !segment || segment === '.' || segment === '..') ||
    path.posix.normalize(normalized) !== normalized
  ) {
    throw new Error(`${label} must not contain traversal or empty segments`);
  }
  return normalized;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function digestCanonical(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeInputPathDigests(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_INPUT_PATHS) {
    throw new Error('inputPathDigests must contain one to thirty-two entries');
  }
  const entries = value.map((entry, index) => {
    assertExactKeys(entry, ['byteLength', 'path', 'sha256'], `inputPathDigests[${index}]`);
    if (!Number.isInteger(entry.byteLength) || entry.byteLength < 0 || entry.byteLength > MAX_FILE_BYTES) {
      throw new Error(`inputPathDigests[${index}].byteLength is invalid`);
    }
    return {
      byteLength: entry.byteLength,
      path: normalizeRelativePath(entry.path, `inputPathDigests[${index}].path`),
      sha256: normalizeDigest(entry.sha256, `inputPathDigests[${index}].sha256`),
    };
  }).sort((left, right) => left.path.localeCompare(right.path));
  if (new Set(entries.map((entry) => entry.path)).size !== entries.length) {
    throw new Error('inputPathDigests must not repeat paths');
  }
  if (entries.reduce((total, entry) => total + entry.byteLength, 0) > MAX_TOTAL_INPUT_BYTES) {
    throw new Error('inputPathDigests exceeds the total byte limit');
  }
  return entries;
}

function computeInputDigest(inputPathDigests) {
  return digestCanonical(normalizeInputPathDigests(inputPathDigests));
}

function normalizeCellDeadlineMs(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_CELL_DEADLINE_MS) {
    throw new Error(`cellDeadlineMs must be an integer from 1 through ${MAX_CELL_DEADLINE_MS}`);
  }
  return value;
}

function deriveCellDeadlineAt(startedAt, cellDeadlineMs, batchDeadlineAt) {
  const startedAtMs = Date.parse(normalizeTimestamp(startedAt, 'startedAt'));
  const batchDeadlineAtMs = Date.parse(normalizeTimestamp(batchDeadlineAt, 'batchDeadlineAt'));
  if (batchDeadlineAtMs < startedAtMs) {
    throw new Error('batchDeadlineAt must not precede startedAt');
  }
  const cellDeadlineAtMs = startedAtMs + normalizeCellDeadlineMs(cellDeadlineMs);
  return new Date(Math.min(cellDeadlineAtMs, batchDeadlineAtMs)).toISOString();
}

function normalizeFixedCell(input) {
  if (!Number.isInteger(input.position) || input.position < 0 || input.position >= FIXED_CELL_CONTRACTS.length) {
    throw new Error('SpecialistCellAttempt position is invalid');
  }
  const expected = FIXED_CELL_CONTRACTS[input.position];
  if (
    input.cellId !== expected.cellId ||
    input.agentProfileId !== expected.agentProfileId ||
    input.role !== expected.role
  ) {
    throw new Error('SpecialistCellAttempt must match its fixed cell contract');
  }
  return expected;
}

function normalizeSourceEvidenceManifest(value) {
  assertExactKeys(value, ['files', 'kind', 'totalByteLength'], 'source evidence manifest');
  if (value.kind !== 'source-evidence-manifest' || !Array.isArray(value.files) || value.files.length === 0) {
    throw new Error('source evidence manifest is invalid');
  }
  const files = value.files.map((entry, index) => {
    assertExactKeys(entry, ['byteLength', 'path', 'sha256'], `source evidence manifest.files[${index}]`);
    if (!Number.isInteger(entry.byteLength) || entry.byteLength < 0 || entry.byteLength > MAX_FILE_BYTES) {
      throw new Error('source evidence manifest byteLength is invalid');
    }
    return {
      path: normalizeRelativePath(entry.path, `source evidence manifest.files[${index}].path`),
      byteLength: entry.byteLength,
      sha256: normalizeDigest(entry.sha256, `source evidence manifest.files[${index}].sha256`),
    };
  }).sort((left, right) => left.path.localeCompare(right.path));
  if (new Set(files.map((entry) => entry.path)).size !== files.length) {
    throw new Error('source evidence manifest files must not repeat paths');
  }
  const totalByteLength = files.reduce((total, entry) => total + entry.byteLength, 0);
  if (value.totalByteLength !== totalByteLength) {
    throw new Error('source evidence manifest totalByteLength is invalid');
  }
  return { kind: 'source-evidence-manifest', files, totalByteLength };
}

function normalizeNodeSyntaxCheck(value) {
  assertExactKeys(value, ['checks', 'kind', 'mutationDetected', 'verdict'], 'node syntax check');
  if (value.kind !== 'node-syntax-check' || !Array.isArray(value.checks) || value.checks.length === 0) {
    throw new Error('node syntax check is invalid');
  }
  const checks = value.checks.map((entry, index) => {
    assertExactKeys(
      entry,
      ['exitCode', 'passed', 'relativePath', 'stderrDigest', 'stdoutDigest', 'timedOut', 'truncated'],
      `node syntax check.checks[${index}]`,
    );
    if (entry.exitCode !== null && (!Number.isInteger(entry.exitCode) || entry.exitCode < 0)) {
      throw new Error('node syntax check exitCode is invalid');
    }
    if (typeof entry.passed !== 'boolean' || typeof entry.timedOut !== 'boolean' || typeof entry.truncated !== 'boolean') {
      throw new Error('node syntax check flags are invalid');
    }
    return {
      relativePath: normalizeRelativePath(entry.relativePath, `node syntax check.checks[${index}].relativePath`),
      exitCode: entry.exitCode,
      timedOut: entry.timedOut,
      truncated: entry.truncated,
      passed: entry.passed,
      stdoutDigest: normalizeDigest(entry.stdoutDigest, `node syntax check.checks[${index}].stdoutDigest`),
      stderrDigest: normalizeDigest(entry.stderrDigest, `node syntax check.checks[${index}].stderrDigest`),
    };
  });
  if (new Set(checks.map((entry) => entry.relativePath)).size !== checks.length) {
    throw new Error('node syntax check paths must not repeat');
  }
  if (typeof value.mutationDetected !== 'boolean' || !['passed', 'failed'].includes(value.verdict)) {
    throw new Error('node syntax check verdict is invalid');
  }
  for (const check of checks) {
    const expectedPassed =
      check.exitCode === 0 && !check.timedOut && !check.truncated;
    if (check.passed !== expectedPassed) {
      throw new Error('node syntax check passed flag contradicts its exit evidence');
    }
  }
  const expectedVerdict =
    !value.mutationDetected && checks.every((check) => check.passed)
      ? 'passed'
      : 'failed';
  if (value.verdict !== expectedVerdict) {
    throw new Error('node syntax check verdict contradicts its check evidence');
  }
  return {
    kind: 'node-syntax-check',
    checks,
    mutationDetected: value.mutationDetected,
    verdict: value.verdict,
  };
}

function normalizeResultSummary(value) {
  if (!isPlainRecord(value)) throw new Error('resultSummary must be an object');
  const normalized = value.kind === 'source-evidence-manifest'
    ? normalizeSourceEvidenceManifest(value)
    : value.kind === 'node-syntax-check'
      ? normalizeNodeSyntaxCheck(value)
      : null;
  if (!normalized) throw new Error('resultSummary kind is invalid');
  if (Buffer.byteLength(JSON.stringify(normalized), 'utf8') > MAX_RESULT_SUMMARY_BYTES) {
    throw new Error('resultSummary exceeds the byte limit');
  }
  return normalized;
}

function computeResultDigest(resultSummary) {
  return digestCanonical(normalizeResultSummary(resultSummary));
}

function assertResultSummaryMatchesCell(resultSummary, record) {
  if (record.role === 'researcher') {
    if (resultSummary.kind !== 'source-evidence-manifest') {
      throw new Error('Researcher SpecialistCellAttempt requires a source evidence manifest');
    }
    if (
      digestCanonical(resultSummary.files) !==
      digestCanonical(record.inputPathDigests)
    ) {
      throw new Error('Researcher source evidence manifest must match inputPathDigests');
    }
    return;
  }
  if (record.role !== 'qa' || resultSummary.kind !== 'node-syntax-check') {
    throw new Error('QA SpecialistCellAttempt requires a node syntax check summary');
  }
  if (resultSummary.mutationDetected) {
    throw new Error('QA node syntax check must not report source mutation as completed evidence');
  }
  const allowedPaths = new Set(record.inputPathDigests.map((entry) => entry.path));
  if (resultSummary.checks.some((check) => !allowedPaths.has(check.relativePath))) {
    throw new Error('QA node syntax check includes a path outside inputPathDigests');
  }
}

function computeSpecialistCellAttemptRecordDigest(record) {
  if (!isPlainRecord(record)) throw new Error('SpecialistCellAttempt record must be an object');
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createSpecialistCellAttempt(input) {
  assertExactKeys(input, CREATE_INPUT_KEYS, 'SpecialistCellAttempt create input');
  normalizeFixedCell(input);
  const id = normalizeIdentifier(input.id, 'SpecialistCellAttempt id');
  if (!/^specialist-cell-attempt-\d{4}$/.test(id)) {
    throw new Error('SpecialistCellAttempt id must use the specialist-cell-attempt-0000 format');
  }
  const startedAt = normalizeTimestamp(input.startedAt, 'SpecialistCellAttempt startedAt');
  const batchDeadlineAt = normalizeTimestamp(input.batchDeadlineAt, 'SpecialistCellAttempt batchDeadlineAt');
  const inputPathDigests = normalizeInputPathDigests(input.inputPathDigests);
  const record = {
    id,
    persisted: true,
    specialistBatchId: normalizeIdentifier(input.specialistBatchId, 'SpecialistCellAttempt specialistBatchId'),
    cellId: normalizeIdentifier(input.cellId, 'SpecialistCellAttempt cellId'),
    agentProfileId: normalizeIdentifier(input.agentProfileId, 'SpecialistCellAttempt agentProfileId'),
    role: normalizeIdentifier(input.role, 'SpecialistCellAttempt role'),
    position: input.position,
    attemptNumber: 1,
    status: SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE,
    cellSpecDigest: normalizeDigest(input.cellSpecDigest, 'SpecialistCellAttempt cellSpecDigest'),
    sourceDigest: normalizeDigest(input.sourceDigest, 'SpecialistCellAttempt sourceDigest'),
    inputPathDigests,
    inputDigest: computeInputDigest(inputPathDigests),
    observedInputDigest: null,
    cellDeadlineMs: normalizeCellDeadlineMs(input.cellDeadlineMs),
    deadlineAt: deriveCellDeadlineAt(startedAt, input.cellDeadlineMs, batchDeadlineAt),
    resultSummary: null,
    resultDigest: null,
    failureReason: null,
    startedAt,
    completedAt: null,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeSpecialistCellAttemptRecordDigest(record),
  });
}

function settleSpecialistCellAttempt(record, transition) {
  assertSpecialistCellAttemptRecord(record);
  if (record.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE) {
    throw new Error(`SpecialistCellAttempt ${record.id} is not active`);
  }
  if (!isPlainRecord(transition)) throw new Error('SpecialistCellAttempt transition must be an object');
  const status = transition.status;
  const keys = status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED
    ? COMPLETED_TRANSITION_KEYS
    : status === SPECIALIST_CELL_ATTEMPT_STATUS.FAILED
      ? FAILED_TRANSITION_KEYS
      : null;
  if (!keys) throw new Error('SpecialistCellAttempt transition status is invalid');
  assertExactKeys(transition, keys, 'SpecialistCellAttempt transition');
  const completedAt = normalizeTimestamp(transition.completedAt, 'SpecialistCellAttempt completedAt');
  if (Date.parse(completedAt) < Date.parse(record.startedAt)) {
    throw new Error('SpecialistCellAttempt completedAt precedes startedAt');
  }
  if (status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED) {
    if (Date.parse(completedAt) >= Date.parse(record.deadlineAt)) {
      throw new Error('Completed SpecialistCellAttempt exceeds its deadline');
    }
    const observedInputDigest = normalizeDigest(
      transition.observedInputDigest,
      'SpecialistCellAttempt observedInputDigest',
    );
    if (observedInputDigest !== record.inputDigest) {
      throw new Error('Completed SpecialistCellAttempt observedInputDigest must match inputDigest');
    }
    const resultSummary = normalizeResultSummary(transition.resultSummary);
    assertResultSummaryMatchesCell(resultSummary, record);
    const next = {
      ...record,
      status,
      observedInputDigest,
      resultSummary,
      resultDigest: computeResultDigest(resultSummary),
      failureReason: null,
      completedAt,
    };
    delete next.recordDigest;
    return deepFreeze({
      ...next,
      recordDigest: computeSpecialistCellAttemptRecordDigest(next),
    });
  }
  const failureReason = normalizeText(
    transition.failureReason,
    'SpecialistCellAttempt failureReason',
    { maxLength: 63 },
  );
  if (!Object.values(SPECIALIST_CELL_FAILURE_REASON).includes(failureReason)) {
    throw new Error('SpecialistCellAttempt failureReason is invalid');
  }
  const next = {
    ...record,
    status,
    observedInputDigest: normalizeDigest(
      transition.observedInputDigest,
      'SpecialistCellAttempt observedInputDigest',
      { nullable: true },
    ),
    resultSummary: null,
    resultDigest: null,
    failureReason,
    completedAt,
  };
  delete next.recordDigest;
  return deepFreeze({
    ...next,
    recordDigest: computeSpecialistCellAttemptRecordDigest(next),
  });
}

function assertSpecialistCellAttemptRecord(record, options = {}) {
  assertExactKeys(record, SPECIALIST_CELL_ATTEMPT_RECORD_KEYS, 'SpecialistCellAttempt record');
  if (record.persisted !== true || record.attemptNumber !== 1) {
    throw new Error('SpecialistCellAttempt persistence or attempt number is invalid');
  }
  const active = createSpecialistCellAttempt({
    id: record.id,
    specialistBatchId: record.specialistBatchId,
    cellId: record.cellId,
    agentProfileId: record.agentProfileId,
    role: record.role,
    position: record.position,
    cellSpecDigest: record.cellSpecDigest,
    sourceDigest: record.sourceDigest,
    inputPathDigests: record.inputPathDigests,
    cellDeadlineMs: record.cellDeadlineMs,
    batchDeadlineAt: record.deadlineAt,
    startedAt: record.startedAt,
  });
  if (record.inputDigest !== active.inputDigest) {
    throw new Error('SpecialistCellAttempt inputDigest is invalid');
  }
  const cellDeadlineAtMs = Date.parse(record.deadlineAt);
  const startedAtMs = Date.parse(record.startedAt);
  const latestCellDeadlineAtMs = startedAtMs + record.cellDeadlineMs;
  if (
    Number.isNaN(cellDeadlineAtMs) ||
    cellDeadlineAtMs < startedAtMs ||
    cellDeadlineAtMs > latestCellDeadlineAtMs
  ) {
    throw new Error('SpecialistCellAttempt deadlineAt is invalid');
  }
  if (options.batchDeadlineAt !== undefined) {
    const expectedDeadlineAt = deriveCellDeadlineAt(
      record.startedAt,
      record.cellDeadlineMs,
      options.batchDeadlineAt,
    );
    if (record.deadlineAt !== expectedDeadlineAt) {
      throw new Error('SpecialistCellAttempt deadlineAt does not match its batch deadline');
    }
  }
  if (!Object.values(SPECIALIST_CELL_ATTEMPT_STATUS).includes(record.status)) {
    throw new Error('SpecialistCellAttempt status is invalid');
  }
  if (record.status === SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE) {
    if (
      record.observedInputDigest !== null ||
      record.resultSummary !== null ||
      record.resultDigest !== null ||
      record.failureReason !== null ||
      record.completedAt !== null
    ) {
      throw new Error('Active SpecialistCellAttempt has terminal evidence');
    }
  } else if (record.status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED) {
    const terminal = settleSpecialistCellAttempt(active, {
      status: record.status,
      observedInputDigest: record.observedInputDigest,
      resultSummary: record.resultSummary,
      completedAt: record.completedAt,
    });
    if (
      record.resultDigest !== terminal.resultDigest ||
      JSON.stringify(record.resultSummary) !== JSON.stringify(terminal.resultSummary)
    ) {
      throw new Error('Completed SpecialistCellAttempt result evidence is invalid');
    }
  } else {
    const terminal = settleSpecialistCellAttempt(active, {
      status: record.status,
      observedInputDigest: record.observedInputDigest,
      failureReason: record.failureReason,
      completedAt: record.completedAt,
    });
    if (
      record.resultDigest !== terminal.resultDigest ||
      record.resultSummary !== terminal.resultSummary ||
      record.failureReason !== terminal.failureReason
    ) {
      throw new Error('Failed SpecialistCellAttempt terminal evidence is invalid');
    }
  }
  if (computeSpecialistCellAttemptRecordDigest(record) !== record.recordDigest) {
    throw new Error('SpecialistCellAttempt recordDigest does not match its payload');
  }
  return record;
}

function isTerminalSpecialistCellAttempt(record) {
  assertSpecialistCellAttemptRecord(record);
  return record.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE;
}

module.exports = {
  FIXED_CELL_CONTRACTS,
  MAX_CELL_DEADLINE_MS,
  MAX_FILE_BYTES,
  MAX_INPUT_PATHS,
  MAX_TOTAL_INPUT_BYTES,
  MAX_RESULT_SUMMARY_BYTES,
  SPECIALIST_CELL_ATTEMPT_RECORD_KEYS,
  SPECIALIST_CELL_ATTEMPT_STATUS,
  SPECIALIST_CELL_FAILURE_REASON,
  assertExactKeys,
  assertResultSummaryMatchesCell,
  assertSpecialistCellAttemptRecord,
  canonicalize,
  computeInputDigest,
  computeResultDigest,
  computeSpecialistCellAttemptRecordDigest,
  createSpecialistCellAttempt,
  deepFreeze,
  deriveCellDeadlineAt,
  digestCanonical,
  isTerminalSpecialistCellAttempt,
  normalizeDigest,
  normalizeInputPathDigests,
  normalizeRelativePath,
  normalizeResultSummary,
  normalizeTimestamp,
  settleSpecialistCellAttempt,
};
