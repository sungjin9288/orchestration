'use strict';

const crypto = require('crypto');

const QUERY_KEYS = Object.freeze([
  'checkpointDigest',
  'deliveryReadyCheckpointId',
  'evaluatedAt',
  'qaEvidenceArtifactId',
  'qaInputDigest',
  'qaRunId',
  'qaWorkOrderAttemptId',
  'qaWorkOrderAttemptRecordDigest',
  'sourceDigest',
]);

const REQUEST_KEYS = Object.freeze([
  'checkpointDigest',
  'deliveryReadyCheckpointId',
  'evaluatedAt',
  'qaEvidenceArtifactId',
  'qaInputDigest',
  'qaRunId',
  'qaWorkOrderAttemptId',
  'qaWorkOrderAttemptRecordDigest',
  'reworkPlanId',
  'sourceDigest',
]);

const RESPONSE_KEYS = Object.freeze([
  'id',
  'schemaVersion',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'executionPlanId',
  'reworkPlanId',
  'qaWorkOrderId',
  'qaWorkOrderAttemptId',
  'qaRunId',
  'qaEvidenceArtifactId',
  'terminalCheckpointId',
  'terminalCheckpointDigest',
  'sourceDigest',
  'mutationEvidenceDigest',
  'reviewerEvidenceDigest',
  'qaInputDigest',
  'reworkDeliveryEvidenceDigest',
  'deliveredArtifactRefs',
  'workOrderResults',
  'verificationSummary',
  'acceptedRisks',
  'unresolvedItems',
  'authoritySummary',
  'generatedAt',
  'evaluatedAt',
  'allowedActions',
  'blockedActions',
  'previewDigest',
]);

const BLOCKED_ACTIONS = Object.freeze([
  'persist-delivery-package',
  'accept-delivery-package',
  'reject-delivery-package',
  'request-package-changes',
  'close-mission',
  'close-task',
  'retry-qa',
  'recover-qa',
  'execute-provider',
  'mutate-source',
  'apply-memory',
  'commit',
  'push',
  'release',
  'schedule-background',
  'mutate-policy',
  'bypass-approval',
]);

const AUTHORITY_SUMMARY = Object.freeze({
  durablePersistenceAllowed: false,
  packageAcceptanceAllowed: false,
  packageDecisionAllowed: false,
  missionCloseOutAllowed: false,
  taskCloseOutAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  memoryApplicationAllowed: false,
  learningApplicationAllowed: false,
  schedulingAllowed: false,
  providerExecutionAllowed: false,
  sourceMutationAllowed: false,
  retryAllowed: false,
  recoveryAllowed: false,
  profilePolicyMutationAllowed: false,
  approvalBypassAllowed: false,
});

const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_IDENTIFIER_LENGTH = 256;

function errorWithStatus(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label, statusCode = 400) {
  if (!isPlainRecord(value)) {
    throw errorWithStatus(`${label} must be an object`, statusCode);
  }
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw errorWithStatus(
      `${label} has unexpected or missing fields`,
      statusCode,
    );
  }
}

function normalizeIdentifier(value, label, statusCode = 400) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > MAX_IDENTIFIER_LENGTH ||
    value !== value.trim() ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    throw errorWithStatus(`${label} is invalid`, statusCode);
  }
  return value;
}

function normalizeDigest(value, label, statusCode = 400) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(
      `${label} must be a lowercase SHA-256 digest`,
      statusCode,
    );
  }
  return value;
}

function normalizeTimestamp(value, label, statusCode = 400) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(
      `${label} must be an exact ISO timestamp`,
      statusCode,
    );
  }
  return value;
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

function digestBytes(value, label) {
  if (!Buffer.isBuffer(value) || value.length === 0) {
    throw errorWithStatus(`${label} requires exact non-empty bytes`, 409);
  }
  return crypto.createHash('sha256').update(value).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeReworkDeliveryPackagePreviewRequest(input, options = {}) {
  assertExactKeys(
    input,
    REQUEST_KEYS,
    'ReworkDeliveryPackagePreview request',
  );
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
    409,
  );
  const qaCompletedAt = normalizeTimestamp(
    options.qaCompletedAt,
    'QA completion timestamp',
    409,
  );
  if (
    Date.parse(evaluatedAt) < Date.parse(qaCompletedAt) ||
    Date.parse(evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS
  ) {
    throw errorWithStatus(
      'ReworkDeliveryPackagePreview evaluatedAt is outside the source-current window',
    );
  }
  return deepFreeze({
    reworkPlanId: normalizeIdentifier(input.reworkPlanId, 'reworkPlanId'),
    qaWorkOrderAttemptId: normalizeIdentifier(
      input.qaWorkOrderAttemptId,
      'qaWorkOrderAttemptId',
    ),
    qaWorkOrderAttemptRecordDigest: normalizeDigest(
      input.qaWorkOrderAttemptRecordDigest,
      'qaWorkOrderAttemptRecordDigest',
    ),
    qaRunId: normalizeIdentifier(input.qaRunId, 'qaRunId'),
    qaEvidenceArtifactId: normalizeIdentifier(
      input.qaEvidenceArtifactId,
      'qaEvidenceArtifactId',
    ),
    deliveryReadyCheckpointId: normalizeIdentifier(
      input.deliveryReadyCheckpointId,
      'deliveryReadyCheckpointId',
    ),
    checkpointDigest: normalizeDigest(
      input.checkpointDigest,
      'checkpointDigest',
    ),
    sourceDigest: normalizeDigest(input.sourceDigest, 'sourceDigest'),
    qaInputDigest: normalizeDigest(input.qaInputDigest, 'qaInputDigest'),
    evaluatedAt,
  });
}

function normalizeArtifactEvidence(entry, label) {
  if (!isPlainRecord(entry) || !isPlainRecord(entry.record)) {
    throw errorWithStatus(`${label} is invalid`, 409);
  }
  return {
    record: structuredClone(entry.record),
    contentDigest: digestBytes(entry.bytes, `${label} content`),
  };
}

function computeReworkDeliveryEvidenceDigest(source) {
  return digestCanonical({
    reworkPlan: structuredClone(source.reworkPlan),
    reworkPlanAcceptance: structuredClone(source.reworkPlanAcceptance),
    builderReworkDispatch: structuredClone(source.builderReworkDispatch),
    builderReworkApproval: structuredClone(source.builderReworkApproval),
    builderMutationAttempt: structuredClone(source.builderMutationAttempt),
    builderMutationRun: structuredClone(source.builderMutationRun),
    builderMutationArtifacts: source.builderMutationArtifacts.map(
      (entry, index) =>
        normalizeArtifactEvidence(
          entry,
          `Builder mutation Artifact ${index + 1}`,
        ),
    ),
    reviewerAttempt: structuredClone(source.reviewerAttempt),
    reviewerRun: structuredClone(source.reviewerRun),
    reviewArtifact: normalizeArtifactEvidence(
      source.reviewArtifact,
      'Reviewer Artifact',
    ),
    qaAttempt: structuredClone(source.qaAttempt),
    qaRun: structuredClone(source.qaRun),
    qaArtifact: normalizeArtifactEvidence(source.qaArtifact, 'QA Artifact'),
    qaReadyCheckpoint: structuredClone(source.qaReadyCheckpoint),
    deliveryReadyCheckpoint: structuredClone(source.deliveryReadyCheckpoint),
    currentTargetFileDigests: structuredClone(source.currentTargetFileDigests),
    mutationEvidenceDigest: normalizeDigest(
      source.mutationEvidenceDigest,
      'mutationEvidenceDigest',
      409,
    ),
    reviewerEvidenceDigest: normalizeDigest(
      source.reviewerEvidenceDigest,
      'reviewerEvidenceDigest',
      409,
    ),
    qaInputDigest: normalizeDigest(
      source.qaInputDigest,
      'qaInputDigest',
      409,
    ),
  });
}

function computeReworkDeliveryPackagePreviewDigest(preview) {
  const {
    id: _id,
    previewDigest: _previewDigest,
    evaluatedAt: _evaluatedAt,
    ...payload
  } = preview;
  return digestCanonical(payload);
}

function buildWorkOrderResults(source) {
  return source.workOrders.map((workOrder) => ({
    workOrderId: workOrder.id,
    role: workOrder.role,
    status: workOrder.status,
    attemptRefs: source.workOrderAttempts
      .filter((attempt) => attempt.workOrderId === workOrder.id)
      .map((attempt) => attempt.id),
    runRefs: [...workOrder.runRefs],
    artifactRefs: [...workOrder.artifactRefs],
  }));
}

function buildDeliveredArtifactRefs(workOrders) {
  const refs = [];
  const seen = new Set();
  for (const workOrder of workOrders) {
    for (const ref of workOrder.artifactRefs) {
      normalizeIdentifier(ref, 'deliveredArtifactRef', 409);
      if (!seen.has(ref)) {
        seen.add(ref);
        refs.push(ref);
      }
    }
  }
  return refs;
}

function assertExactTerminalSource(request, source) {
  const checks = [
    ['reworkPlanId', source.reworkPlan.id],
    ['qaWorkOrderAttemptId', source.qaAttempt.id],
    ['qaWorkOrderAttemptRecordDigest', source.qaAttempt.recordDigest],
    ['qaRunId', source.qaRun.id],
    ['qaEvidenceArtifactId', source.qaArtifact.record.id],
    ['deliveryReadyCheckpointId', source.deliveryReadyCheckpoint.id],
    ['checkpointDigest', source.deliveryReadyCheckpoint.checkpointDigest],
    ['sourceDigest', source.executionPlan.sourceDigest],
    ['qaInputDigest', source.qaInputDigest],
  ];
  for (const [field, expected] of checks) {
    if (request[field] !== expected) {
      throw errorWithStatus(
        `ReworkDeliveryPackagePreview ${field} does not match current evidence`,
        409,
      );
    }
  }

  if (
    !source.task ||
    source.mission.linkedTaskId !== source.task.id ||
    source.task.projectId !== source.executionPlan.projectId ||
    source.task.missionId !== source.mission.id ||
    source.task.lifecycleState !== 'Review' ||
    source.task.flags?.blocked !== false ||
    source.task.flags?.waitingApproval !== false ||
    source.task.flags?.waitingDecision !== false
  ) {
    throw errorWithStatus(
      'ReworkDeliveryPackagePreview requires one exact open control task',
      409,
    );
  }

  const qaResult = source.qaEvidence?.result;
  const roleOrder = source.workOrders.map((workOrder) => workOrder.role);
  const violations = [];
  const requireEvidence = (condition, label) => {
    if (!condition) violations.push(label);
  };
  requireEvidence(source.schemaVersion === 24, 'schema-version');
  requireEvidence(source.mission.status === 'executing', 'mission-status');
  requireEvidence(
    source.executionPlan.status === 'delivery-ready' &&
      source.executionPlan.activeWorkOrderId === null &&
      source.executionPlan.stopReason ===
        'separate-delivery-package-decision-required' &&
      source.executionPlan.stoppedAt === 'delivery',
    'execution-plan-terminal-state',
  );
  requireEvidence(
    roleOrder.join('\u0000') === ['builder', 'reviewer', 'qa'].join('\u0000') &&
      source.workOrders.every((workOrder) => workOrder.status === 'completed') &&
      source.workOrderAttempts.every((attempt) => attempt.status !== 'active'),
    'completed-workorder-graph',
  );
  requireEvidence(
    source.qaAttempt.status === 'completed' &&
      source.qaAttempt.attemptNumber === 1 &&
      source.qaAttempt.checkpointRef === source.deliveryReadyCheckpoint.id,
    'qa-attempt',
  );
  requireEvidence(
    source.qaRun.status === 'completed' &&
      source.qaRun.metadata?.executionMode === 'rework-qa-node-check' &&
      source.qaRun.metadata?.workOrderAttemptId === source.qaAttempt.id &&
      source.qaRun.summary?.verdict === 'passed' &&
      source.qaRun.summary?.qaEvidenceArtifactId === source.qaArtifact.record.id,
    'qa-run',
  );
  requireEvidence(
    source.qaArtifact.record.type === 'qa-evidence' &&
      source.qaArtifact.record.runId === source.qaRun.id &&
      typeof source.qaArtifact.record.createdAt === 'string' &&
      !Number.isNaN(Date.parse(source.qaArtifact.record.createdAt)) &&
      new Date(source.qaArtifact.record.createdAt).toISOString() ===
        source.qaArtifact.record.createdAt &&
      Date.parse(source.qaArtifact.record.createdAt) >=
        Date.parse(source.qaRun.finishedAt),
    'qa-artifact',
  );
  requireEvidence(
    source.qaReadyCheckpoint.stage === 'qa-ready' &&
      source.qaReadyCheckpoint.status === 'consumed' &&
      source.qaReadyCheckpoint.stopReason === 'rework-qa-execution-started',
    'qa-ready-checkpoint',
  );
  requireEvidence(
    source.deliveryReadyCheckpoint.stage === 'delivery-ready' &&
      source.deliveryReadyCheckpoint.status === 'terminal' &&
      source.deliveryReadyCheckpoint.stopReason ===
        'rework-qa-passed-delivery-ready' &&
      source.deliveryReadyCheckpoint.resumedFromCheckpointId ===
        source.qaReadyCheckpoint.id &&
      source.deliveryReadyCheckpoint.nextAllowedActions.length === 0,
    'delivery-ready-checkpoint',
  );
  requireEvidence(
    source.qaEvidence?.schemaVersion === 1 &&
      source.qaEvidence?.executionMode === 'rework-qa-node-check' &&
      source.qaEvidence?.requestDigest === source.qaRun.metadata?.requestDigest &&
      source.qaEvidence?.reviewerEvidenceDigest ===
        source.reviewerEvidenceDigest &&
      source.qaEvidence?.mutationEvidenceDigest ===
        source.mutationEvidenceDigest &&
      source.qaEvidence?.qaInputDigest === source.qaInputDigest &&
      source.qaEvidence?.expectedInputDigest ===
        source.qaRun.metadata?.workerInputDigest &&
      source.qaEvidence?.observedInputDigest ===
        source.qaRun.metadata?.workerInputDigest &&
      source.qaEvidence?.createdAt === source.qaRun.finishedAt,
    'qa-json-envelope',
  );
  requireEvidence(
    qaResult?.kind === 'node-syntax-check' &&
      qaResult?.verdict === 'passed' &&
      qaResult?.mutationDetected === false &&
      Array.isArray(qaResult.checks) &&
      qaResult.checks.length > 0 &&
      qaResult.checks.every((check) => check?.passed === true),
    'qa-result',
  );
  requireEvidence(
    source.unresolvedItems.length === 0 && !source.hasDownstreamRecords,
    'downstream-boundary',
  );
  if (violations.length > 0) {
    throw errorWithStatus(
      `ReworkDeliveryPackagePreview source is not the exact terminal DEC-209 evidence: ${violations.join(', ')}`,
      409,
    );
  }
}

function buildReworkDeliveryPackagePreview(input, source, options = {}) {
  const request = normalizeReworkDeliveryPackagePreviewRequest(input, {
    now: options.now,
    qaCompletedAt: source.qaRun?.finishedAt,
  });
  assertExactTerminalSource(request, source);

  const qaResult = source.qaEvidence.result;
  const deliveredArtifactRefs = buildDeliveredArtifactRefs(source.workOrders);
  const preview = {
    id: null,
    schemaVersion: 24,
    persisted: false,
    status: 'rework-delivery-preview-ready',
    projectId: source.executionPlan.projectId,
    missionId: source.mission.id,
    executionPlanId: source.executionPlan.id,
    reworkPlanId: source.reworkPlan.id,
    qaWorkOrderId: source.qaWorkOrder.id,
    qaWorkOrderAttemptId: source.qaAttempt.id,
    qaRunId: source.qaRun.id,
    qaEvidenceArtifactId: source.qaArtifact.record.id,
    terminalCheckpointId: source.deliveryReadyCheckpoint.id,
    terminalCheckpointDigest:
      source.deliveryReadyCheckpoint.checkpointDigest,
    sourceDigest: source.executionPlan.sourceDigest,
    mutationEvidenceDigest: source.mutationEvidenceDigest,
    reviewerEvidenceDigest: source.reviewerEvidenceDigest,
    qaInputDigest: source.qaInputDigest,
    reworkDeliveryEvidenceDigest:
      computeReworkDeliveryEvidenceDigest(source),
    deliveredArtifactRefs,
    workOrderResults: buildWorkOrderResults(source),
    verificationSummary: {
      kind: 'node-syntax-check',
      verdict: 'passed',
      checkCount: qaResult.checks.length,
      passedCheckCount: qaResult.checks.filter((check) => check.passed).length,
      mutationDetected: false,
    },
    acceptedRisks: ['QA evidence covers Node.js syntax only.'],
    unresolvedItems: [],
    authoritySummary: structuredClone(AUTHORITY_SUMMARY),
    generatedAt: source.qaArtifact.record.createdAt,
    evaluatedAt: request.evaluatedAt,
    allowedActions: [],
    blockedActions: [...BLOCKED_ACTIONS],
    previewDigest: null,
  };
  preview.previewDigest =
    computeReworkDeliveryPackagePreviewDigest(preview);
  preview.id = `rework-delivery-package-preview-${preview.previewDigest.slice(0, 16)}`;
  assertExactKeys(
    preview,
    RESPONSE_KEYS,
    'ReworkDeliveryPackagePreview response',
    409,
  );
  return deepFreeze(preview);
}

module.exports = {
  AUTHORITY_SUMMARY,
  BLOCKED_ACTIONS,
  QUERY_KEYS,
  REQUEST_KEYS,
  RESPONSE_KEYS,
  buildReworkDeliveryPackagePreview,
  computeReworkDeliveryEvidenceDigest,
  computeReworkDeliveryPackagePreviewDigest,
  deepFreeze,
  digestCanonical,
  normalizeReworkDeliveryPackagePreviewRequest,
};
