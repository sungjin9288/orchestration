'use strict';

const crypto = require('crypto');
const path = require('path');

const REQUEST_KEYS = ['compileSpec', 'evaluatedAt', 'sourceRefs', 'specialistSpec'];
const COMPILE_SPEC_KEYS = [
  'expectedArtifacts',
  'stopConditions',
  'targetPathAllowlist',
  'verificationCommands',
];
const SOURCE_REF_KEYS = [
  'blueprintDigest',
  'councilSessionSourceDigest',
  'councilSynthesisDigest',
  'currentAttemptId',
  'missionId',
  'projectId',
  'qaRoleSourceDigest',
  'researcherRoleSourceDigest',
  'staffingEntryId',
  'staffingEntryRecordDigest',
  'staffingPlanId',
  'staffingPlanRecordDigest',
];
const SPECIALIST_SPEC_KEYS = [
  'batchDeadlineMs',
  'cells',
  'maxConcurrentCells',
  'maxProviderCalls',
];
const CELL_KEYS = [
  'agentProfileId',
  'cellDeadlineMs',
  'cellId',
  'evidenceMode',
  'inputPaths',
  'maxAttempts',
  'retryAllowed',
];
const SOURCE_EVIDENCE_KEYS = [
  'alignmentDecidedAt',
  'blueprintDigest',
  'councilSessionId',
  'councilSessionSourceDigest',
  'councilSynthesis',
  'currentAttemptId',
  'inputPathDigests',
  'inputTotalByteLength',
  'missionId',
  'projectId',
  'roleSourceDigests',
  'staffingEntryId',
  'staffingEntryRecordDigest',
  'staffingPlanId',
  'staffingPlanRecordDigest',
];

const MAX_BATCH_DEADLINE_MS = 300000;
const MAX_CELL_INPUT_PATHS = 16;
const MAX_BATCH_INPUT_PATHS = 32;
const MAX_LIST_ENTRIES = 32;
const MAX_VERIFICATION_COMMANDS = 10;
const MAX_TEXT_LENGTH = 1024;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const NODE_CHECK_PATTERN = /^node --check ([A-Za-z0-9][A-Za-z0-9._/-]*)$/;

const FIXED_CELLS = Object.freeze([
  Object.freeze({
    agentProfileId: 'agent-researcher',
    cellId: 'research-source-evidence',
    evidenceMode: 'source-evidence-summary',
    role: 'researcher',
  }),
  Object.freeze({
    agentProfileId: 'agent-qa',
    cellId: 'verify-plan-evidence',
    evidenceMode: 'node-check-plan',
    role: 'qa',
  }),
]);

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'cancel',
  'commit',
  'connectors',
  'execute',
  'memory-application',
  'persist',
  'policy-mutation',
  'provider-call',
  'push',
  'recovery',
  'release',
  'result-application',
  'retry',
  'schedule',
  'source-mutation',
  'start',
  'workorder-persistence',
]);

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function requiredString(value, label, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must not contain control characters`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${label} is too long`);
  }
  return normalized;
}

function requiredDigest(value, label) {
  const normalized = requiredString(value, label, 64);
  if (!SHA256_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a lowercase sha256 digest`);
  }
  return normalized;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = requiredString(value, label);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizePositiveInteger(value, label, maximum) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${label} must be an integer from 1 through ${maximum}`);
  }
  return value;
}

function normalizeTargetPath(value, label) {
  const normalized = requiredString(value, label);
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

function normalizeStringList(value, label, options = {}) {
  const { maxEntries = MAX_LIST_ENTRIES, normalizeEntry = requiredString } = options;
  if (!Array.isArray(value) || value.length === 0 || value.length > maxEntries) {
    throw new Error(`${label} must be a non-empty array with at most ${maxEntries} entries`);
  }

  const normalized = value.map((entry, index) =>
    normalizeEntry(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
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

function normalizeCompileSpec(value) {
  assertExactKeys(value, COMPILE_SPEC_KEYS, 'compileSpec');
  const targetPathAllowlist = normalizeStringList(
    value.targetPathAllowlist,
    'compileSpec.targetPathAllowlist',
    { normalizeEntry: normalizeTargetPath },
  );
  const verificationCommands = normalizeStringList(
    value.verificationCommands,
    'compileSpec.verificationCommands',
    { maxEntries: MAX_VERIFICATION_COMMANDS },
  );

  const qaCommandPaths = verificationCommands.map((command) => {
    const match = NODE_CHECK_PATTERN.exec(command);
    if (!match) {
      throw new Error('compileSpec.verificationCommands must match node --check <relative-path>');
    }
    return normalizeTargetPath(match[1], 'compileSpec.verificationCommands path');
  });
  if (new Set(qaCommandPaths).size !== qaCommandPaths.length) {
    throw new Error('compileSpec.verificationCommands must not check the same path twice');
  }
  for (const commandPath of qaCommandPaths) {
    if (!targetPathAllowlist.includes(commandPath)) {
      throw new Error('compileSpec verification path must be in targetPathAllowlist');
    }
  }

  return {
    expectedArtifacts: normalizeStringList(
      value.expectedArtifacts,
      'compileSpec.expectedArtifacts',
    ),
    stopConditions: normalizeStringList(value.stopConditions, 'compileSpec.stopConditions'),
    targetPathAllowlist,
    verificationCommands,
  };
}

function normalizeCell(value, index, batchDeadlineMs) {
  assertExactKeys(value, CELL_KEYS, `specialistSpec.cells[${index}]`);
  const expected = FIXED_CELLS[index];
  if (!expected) {
    throw new Error('specialistSpec.cells must contain exactly two cells');
  }
  if (
    value.cellId !== expected.cellId ||
    value.agentProfileId !== expected.agentProfileId ||
    value.evidenceMode !== expected.evidenceMode
  ) {
    throw new Error(`specialistSpec.cells[${index}] must match the fixed ${expected.cellId} contract`);
  }
  if (value.maxAttempts !== 1 || value.retryAllowed !== false) {
    throw new Error(`specialistSpec.cells[${index}] must set maxAttempts=1 and retryAllowed=false`);
  }

  const cellDeadlineMs = normalizePositiveInteger(
    value.cellDeadlineMs,
    `specialistSpec.cells[${index}].cellDeadlineMs`,
    batchDeadlineMs,
  );
  const inputPaths = normalizeStringList(
    value.inputPaths,
    `specialistSpec.cells[${index}].inputPaths`,
    { maxEntries: MAX_CELL_INPUT_PATHS, normalizeEntry: normalizeTargetPath },
  );

  return {
    agentProfileId: expected.agentProfileId,
    cellDeadlineMs,
    cellId: expected.cellId,
    evidenceMode: expected.evidenceMode,
    inputPaths,
    maxAttempts: 1,
    retryAllowed: false,
  };
}

function normalizeSpecialistSpec(value, compileSpec) {
  assertExactKeys(value, SPECIALIST_SPEC_KEYS, 'specialistSpec');
  if (value.maxConcurrentCells !== 2 || value.maxProviderCalls !== 0) {
    throw new Error('specialistSpec must set maxConcurrentCells=2 and maxProviderCalls=0');
  }
  const batchDeadlineMs = normalizePositiveInteger(
    value.batchDeadlineMs,
    'specialistSpec.batchDeadlineMs',
    MAX_BATCH_DEADLINE_MS,
  );
  if (!Array.isArray(value.cells) || value.cells.length !== FIXED_CELLS.length) {
    throw new Error('specialistSpec.cells must contain exactly two cells');
  }

  const cells = value.cells.map((cell, index) => normalizeCell(cell, index, batchDeadlineMs));
  const uniqueInputPaths = [...new Set(cells.flatMap((cell) => cell.inputPaths))];
  if (uniqueInputPaths.length > MAX_BATCH_INPUT_PATHS) {
    throw new Error(`specialistSpec has more than ${MAX_BATCH_INPUT_PATHS} distinct input paths`);
  }

  const qaCell = cells[1];
  for (const command of compileSpec.verificationCommands) {
    const commandPath = normalizeTargetPath(
      NODE_CHECK_PATTERN.exec(command)[1],
      'compileSpec.verificationCommands path',
    );
    if (!qaCell.inputPaths.includes(commandPath)) {
      throw new Error('compileSpec verification path must be in the QA cell inputPaths');
    }
  }

  return {
    batchDeadlineMs,
    cells,
    maxConcurrentCells: 2,
    maxProviderCalls: 0,
  };
}

function normalizeSourceRefs(value) {
  assertExactKeys(value, SOURCE_REF_KEYS, 'sourceRefs');
  const normalized = {};
  for (const key of SOURCE_REF_KEYS) {
    normalized[key] = key.endsWith('Digest')
      ? requiredDigest(value[key], `sourceRefs.${key}`)
      : requiredString(value[key], `sourceRefs.${key}`);
  }
  return normalized;
}

function normalizeInputPathDigests(value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_BATCH_INPUT_PATHS) {
    throw new Error('sourceEvidence.inputPathDigests must contain one to thirty-two entries');
  }

  const normalized = value.map((entry, index) => {
    assertExactKeys(entry, ['byteLength', 'path', 'sha256'], `inputPathDigests[${index}]`);
    const byteLength = entry.byteLength;
    if (!Number.isInteger(byteLength) || byteLength < 0 || byteLength > MAX_FILE_BYTES) {
      throw new Error(`inputPathDigests[${index}].byteLength exceeds the file limit`);
    }
    return {
      byteLength,
      path: normalizeTargetPath(entry.path, `inputPathDigests[${index}].path`),
      sha256: requiredDigest(entry.sha256, `inputPathDigests[${index}].sha256`),
    };
  });
  const paths = normalized.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error('sourceEvidence.inputPathDigests must not repeat paths');
  }
  return normalized.sort((left, right) => left.path.localeCompare(right.path));
}

function normalizeRoleSourceDigests(value) {
  if (!Array.isArray(value) || value.length !== FIXED_CELLS.length) {
    throw new Error('sourceEvidence.roleSourceDigests must contain exactly two entries');
  }
  return value.map((entry, index) => {
    assertExactKeys(entry, ['agentProfileId', 'ref', 'sha256'], `roleSourceDigests[${index}]`);
    const expected = FIXED_CELLS[index];
    const agentProfileId = requiredString(
      entry.agentProfileId,
      `roleSourceDigests[${index}].agentProfileId`,
    );
    if (agentProfileId !== expected.agentProfileId) {
      throw new Error(`roleSourceDigests[${index}] must match ${expected.agentProfileId}`);
    }
    return {
      agentProfileId,
      ref: normalizeTargetPath(entry.ref, `roleSourceDigests[${index}].ref`),
      sha256: requiredDigest(entry.sha256, `roleSourceDigests[${index}].sha256`),
    };
  });
}

function normalizeSourceEvidence(value) {
  assertExactKeys(value, SOURCE_EVIDENCE_KEYS, 'sourceEvidence');
  const inputPathDigests = normalizeInputPathDigests(value.inputPathDigests);
  const inputTotalByteLength = value.inputTotalByteLength;
  const lexicalByteLength = inputPathDigests.reduce(
    (total, entry) => total + entry.byteLength,
    0,
  );
  const largestInputByteLength = Math.max(
    ...inputPathDigests.map((entry) => entry.byteLength),
  );
  if (
    !Number.isInteger(inputTotalByteLength) ||
    inputTotalByteLength < largestInputByteLength ||
    inputTotalByteLength > lexicalByteLength ||
    inputTotalByteLength > MAX_TOTAL_FILE_BYTES
  ) {
    throw new Error('sourceEvidence.inputTotalByteLength is invalid');
  }
  const source = {
    alignmentDecidedAt: normalizeIsoTimestamp(
      value.alignmentDecidedAt,
      'sourceEvidence.alignmentDecidedAt',
    ),
    blueprintDigest: requiredDigest(value.blueprintDigest, 'sourceEvidence.blueprintDigest'),
    councilSessionId: requiredString(value.councilSessionId, 'sourceEvidence.councilSessionId'),
    councilSessionSourceDigest: requiredDigest(
      value.councilSessionSourceDigest,
      'sourceEvidence.councilSessionSourceDigest',
    ),
    councilSynthesis: value.councilSynthesis,
    currentAttemptId: requiredString(value.currentAttemptId, 'sourceEvidence.currentAttemptId'),
    inputPathDigests,
    inputTotalByteLength,
    missionId: requiredString(value.missionId, 'sourceEvidence.missionId'),
    projectId: requiredString(value.projectId, 'sourceEvidence.projectId'),
    roleSourceDigests: normalizeRoleSourceDigests(value.roleSourceDigests),
    staffingEntryId: requiredString(value.staffingEntryId, 'sourceEvidence.staffingEntryId'),
    staffingEntryRecordDigest: requiredDigest(
      value.staffingEntryRecordDigest,
      'sourceEvidence.staffingEntryRecordDigest',
    ),
    staffingPlanId: requiredString(value.staffingPlanId, 'sourceEvidence.staffingPlanId'),
    staffingPlanRecordDigest: requiredDigest(
      value.staffingPlanRecordDigest,
      'sourceEvidence.staffingPlanRecordDigest',
    ),
  };
  if (!isPlainRecord(source.councilSynthesis)) {
    throw new Error('sourceEvidence.councilSynthesis must be an object');
  }
  return source;
}

function normalizeSpecialistBatchPreviewRequest(value) {
  assertExactKeys(value, REQUEST_KEYS, 'SpecialistBatchPreview request');
  const compileSpec = normalizeCompileSpec(value.compileSpec);
  return {
    compileSpec,
    evaluatedAt: normalizeIsoTimestamp(value.evaluatedAt, 'evaluatedAt'),
    sourceRefs: normalizeSourceRefs(value.sourceRefs),
    specialistSpec: normalizeSpecialistSpec(value.specialistSpec, compileSpec),
  };
}

function assertSourceRefsMatch(requestSourceRefs, sourceEvidence, councilSynthesisDigest) {
  const expected = {
    blueprintDigest: sourceEvidence.blueprintDigest,
    councilSessionSourceDigest: sourceEvidence.councilSessionSourceDigest,
    councilSynthesisDigest,
    currentAttemptId: sourceEvidence.currentAttemptId,
    missionId: sourceEvidence.missionId,
    projectId: sourceEvidence.projectId,
    qaRoleSourceDigest: sourceEvidence.roleSourceDigests[1].sha256,
    researcherRoleSourceDigest: sourceEvidence.roleSourceDigests[0].sha256,
    staffingEntryId: sourceEvidence.staffingEntryId,
    staffingEntryRecordDigest: sourceEvidence.staffingEntryRecordDigest,
    staffingPlanId: sourceEvidence.staffingPlanId,
    staffingPlanRecordDigest: sourceEvidence.staffingPlanRecordDigest,
  };
  for (const key of SOURCE_REF_KEYS) {
    if (requestSourceRefs[key] !== expected[key]) {
      throw new Error(`sourceRefs.${key} is stale`);
    }
  }
}

function buildSourceRefs(sourceEvidence, inputPathDigests) {
  return [
    'company/blueprint.json',
    `council-attempt:${sourceEvidence.currentAttemptId}`,
    `council-session:${sourceEvidence.councilSessionId}`,
    `mission:${sourceEvidence.missionId}`,
    ...inputPathDigests.map((entry) => `path:${entry.path}`),
    `project:${sourceEvidence.projectId}`,
    ...sourceEvidence.roleSourceDigests.map((entry) => entry.ref),
    `staffing-entry:${sourceEvidence.staffingEntryId}`,
    `staffing-plan:${sourceEvidence.staffingPlanId}`,
  ].sort();
}

function resolveInputPathDigests(specialistSpec, sourceEvidence) {
  const requestedPaths = [...new Set(specialistSpec.cells.flatMap((cell) => cell.inputPaths))].sort();
  const availableByPath = new Map(
    sourceEvidence.inputPathDigests.map((entry) => [entry.path, entry]),
  );
  if (availableByPath.size !== requestedPaths.length) {
    throw new Error('sourceEvidence.inputPathDigests must match the requested input paths exactly');
  }
  const inputPathDigests = requestedPaths.map((inputPath) => {
    const digest = availableByPath.get(inputPath);
    if (!digest) {
      throw new Error(`sourceEvidence is missing digest for input path: ${inputPath}`);
    }
    return digest;
  });
  return {
    inputPathDigests,
    byPath: new Map(inputPathDigests.map((entry) => [entry.path, entry])),
  };
}

function buildCellPreview(cell, position, inputPathDigestsByPath, compileSpecDigest, roleSourceDigest) {
  const profile = {
    allowedProviderModes: ['local-stub'],
    authority: {
      canCommit: false,
      canMutateSource: false,
      canPush: false,
    },
    concurrencyLimit: 1,
    id: cell.agentProfileId,
    role: FIXED_CELLS[position].role,
    sourceRef: roleSourceDigest.ref,
    sourceSha256: roleSourceDigest.sha256,
    workspaceMode: 'shared-readonly',
    writePolicy: [],
  };
  const inputPathDigests = cell.inputPaths
    .map((inputPath) => inputPathDigestsByPath.get(inputPath))
    .sort((left, right) => left.path.localeCompare(right.path));
  const cellSpecDigest = digestCanonical({
    cell,
    compileSpecDigest,
    inputPathDigests,
    profile,
  });

  return {
    agentProfileId: cell.agentProfileId,
    cellDeadlineMs: cell.cellDeadlineMs,
    cellId: cell.cellId,
    cellSpecDigest,
    dependencies: [],
    evidenceMode: cell.evidenceMode,
    inputPathDigests,
    maxAttempts: 1,
    position,
    retryAllowed: false,
    role: FIXED_CELLS[position].role,
    status: 'contract-ready',
    targetPaths: [],
  };
}

function buildSpecialistBatchPreview(requestValue, sourceEvidenceValue, options = {}) {
  const request = normalizeSpecialistBatchPreviewRequest(requestValue);
  const sourceEvidence = normalizeSourceEvidence(sourceEvidenceValue);
  const evaluatedAtMs = Date.parse(request.evaluatedAt);
  const alignmentDecidedAtMs = Date.parse(sourceEvidence.alignmentDecidedAt);
  if (evaluatedAtMs < alignmentDecidedAtMs) {
    throw new Error('evaluatedAt must follow Council alignment');
  }
  if (options.now !== undefined) {
    const now = normalizeIsoTimestamp(options.now, 'options.now');
    if (evaluatedAtMs > Date.parse(now) + 5 * 60 * 1000) {
      throw new Error('evaluatedAt is too far in the future');
    }
  }

  const councilSynthesisDigest = digestCanonical(sourceEvidence.councilSynthesis);
  assertSourceRefsMatch(request.sourceRefs, sourceEvidence, councilSynthesisDigest);
  const { inputPathDigests, byPath } = resolveInputPathDigests(
    request.specialistSpec,
    sourceEvidence,
  );
  const compileSpecDigest = digestCanonical(request.compileSpec);
  const specialistSpecDigest = digestCanonical(request.specialistSpec);
  const sourceDigest = digestCanonical({
    blueprintDigest: sourceEvidence.blueprintDigest,
    councilSessionId: sourceEvidence.councilSessionId,
    councilSessionSourceDigest: sourceEvidence.councilSessionSourceDigest,
    councilSynthesis: sourceEvidence.councilSynthesis,
    currentAttemptId: sourceEvidence.currentAttemptId,
    inputPathDigests,
    inputTotalByteLength: sourceEvidence.inputTotalByteLength,
    missionId: sourceEvidence.missionId,
    projectId: sourceEvidence.projectId,
    roleSourceDigests: sourceEvidence.roleSourceDigests,
    staffingEntryId: sourceEvidence.staffingEntryId,
    staffingEntryRecordDigest: sourceEvidence.staffingEntryRecordDigest,
    staffingPlanId: sourceEvidence.staffingPlanId,
    staffingPlanRecordDigest: sourceEvidence.staffingPlanRecordDigest,
  });
  const cells = request.specialistSpec.cells.map((cell, index) =>
    buildCellPreview(
      cell,
      index,
      byPath,
      compileSpecDigest,
      sourceEvidence.roleSourceDigests[index],
    ));
  const deadline = {
    batchDeadlineMs: request.specialistSpec.batchDeadlineMs,
    deadlineAt: new Date(
      evaluatedAtMs + request.specialistSpec.batchDeadlineMs,
    ).toISOString(),
  };
  const previewPayload = {
    blockedActions: [...BLOCKED_ACTIONS],
    blueprintDigest: sourceEvidence.blueprintDigest,
    cells,
    compileSpecDigest,
    councilSessionId: sourceEvidence.councilSessionId,
    councilSessionSourceDigest: sourceEvidence.councilSessionSourceDigest,
    councilSynthesisDigest,
    currentAttemptId: sourceEvidence.currentAttemptId,
    deadline,
    evaluatedAt: request.evaluatedAt,
    executionAllowed: false,
    maxConcurrentCells: 2,
    maxProviderCalls: 0,
    missionId: sourceEvidence.missionId,
    persisted: false,
    persistenceAllowed: false,
    projectId: sourceEvidence.projectId,
    roleSourceDigests: sourceEvidence.roleSourceDigests,
    schemaVersion: 1,
    sourceDigest,
    sourceRefs: buildSourceRefs(sourceEvidence, inputPathDigests),
    specialistSpecDigest,
    staffingEntryId: sourceEvidence.staffingEntryId,
    staffingEntryRecordDigest: sourceEvidence.staffingEntryRecordDigest,
    staffingPlanId: sourceEvidence.staffingPlanId,
    staffingPlanRecordDigest: sourceEvidence.staffingPlanRecordDigest,
    status: 'preview-ready',
  };
  const previewDigest = digestCanonical(previewPayload);
  return deepFreeze({
    ...previewPayload,
    id: `specialist-batch-preview-${previewDigest.slice(0, 16)}`,
    previewDigest,
  });
}

module.exports = {
  BLOCKED_ACTIONS,
  CELL_KEYS,
  COMPILE_SPEC_KEYS,
  FIXED_CELLS,
  REQUEST_KEYS,
  SOURCE_EVIDENCE_KEYS,
  SOURCE_REF_KEYS,
  SPECIALIST_SPEC_KEYS,
  assertExactKeys,
  buildSpecialistBatchPreview,
  canonicalize,
  deepFreeze,
  digestCanonical,
  normalizeCompileSpec,
  normalizeSourceEvidence,
  normalizeSpecialistBatchPreviewRequest,
  normalizeSpecialistSpec,
  normalizeTargetPath,
};
