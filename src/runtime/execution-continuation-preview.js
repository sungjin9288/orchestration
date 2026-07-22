'use strict';

const crypto = require('crypto');

const CONTINUATION_PREVIEW_STATUS = Object.freeze({
  CANCELLED: 'cancelled',
  DEADLINE_EXCEEDED: 'deadline-exceeded',
  NO_PROGRESS: 'no-progress',
  READY: 'continuation-ready',
});
const MAX_CONTINUATION_WINDOW_MS = 15 * 60 * 1000;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function digest(value) {
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

function requireIsoTimestamp(value, field) {
  const normalized = String(value || '').trim();
  const timestamp = Date.parse(normalized);
  if (!normalized || !Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${field} must be an exact ISO timestamp`);
  }
  return { normalized, timestamp };
}

function requireDigest(value, field, nullable = false) {
  if (nullable && value === null) return null;
  const normalized = String(value || '').trim();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error(`${field} must be a sha256 digest${nullable ? ' or null' : ''}`);
  }
  return normalized;
}

function compileExecutionContinuationPreview(input) {
  const checkpoint = input.checkpoint;
  const evaluated = requireIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  const deadline = requireIsoTimestamp(input.continuationSpec?.deadlineAt, 'deadlineAt');
  if (input.continuationSpec?.maxSteps !== 1) {
    throw new Error('maxSteps must be exactly 1');
  }
  if (deadline.timestamp - evaluated.timestamp > MAX_CONTINUATION_WINDOW_MS) {
    throw new Error('deadlineAt must be within 15 minutes of evaluatedAt');
  }
  if (typeof input.continuationSpec?.cancellationRequested !== 'boolean') {
    throw new Error('cancellationRequested must be boolean');
  }
  const previousProgressDigest = requireDigest(
    input.continuationSpec.previousProgressDigest,
    'previousProgressDigest',
    true,
  );

  const progressEvidence = {
    artifactRefs: [...checkpoint.artifactRefs].sort(),
    authorityDigest: checkpoint.authorityDigest,
    checkpointDigest: checkpoint.checkpointDigest,
    checkpointId: checkpoint.id,
    completedUnitRefs: [...checkpoint.completedUnitRefs].sort(),
    inputDigest: checkpoint.inputDigest,
    sourceDigest: checkpoint.sourceDigest,
  };
  const progressDigest = digest(progressEvidence);
  let status = CONTINUATION_PREVIEW_STATUS.READY;
  let stopReason = null;

  if (input.continuationSpec.cancellationRequested) {
    status = CONTINUATION_PREVIEW_STATUS.CANCELLED;
    stopReason = 'operator-cancellation-requested';
  } else if (deadline.timestamp <= evaluated.timestamp) {
    status = CONTINUATION_PREVIEW_STATUS.DEADLINE_EXCEEDED;
    stopReason = 'operator-deadline-reached';
  } else if (previousProgressDigest === progressDigest) {
    status = CONTINUATION_PREVIEW_STATUS.NO_PROGRESS;
    stopReason = 'progress-digest-unchanged';
  }

  const previewPayload = {
    action: input.action,
    continuationSpec: {
      cancellationRequested: input.continuationSpec.cancellationRequested,
      deadlineAt: deadline.normalized,
      maxSteps: 1,
      previousProgressDigest,
    },
    evaluatedAt: evaluated.normalized,
    executionPlanId: input.executionPlanId,
    progressDigest,
    status,
  };
  const previewDigest = digest(previewPayload);

  return deepFreeze({
    id: `execution-continuation-preview-${previewDigest.slice(0, 24)}`,
    schemaVersion: 1,
    persisted: false,
    ...previewPayload,
    previewDigest,
    progressEvidence,
    nextStep:
      status === CONTINUATION_PREVIEW_STATUS.READY
        ? {
            action: input.action,
            checkpointId: checkpoint.id,
            stage: checkpoint.stage,
            stepCount: 1,
          }
        : null,
    stopReason,
    authority: {
      checkpointResumeAuthorized: false,
      backgroundSchedulingAllowed: false,
      automaticRetryAllowed: false,
      activeMutationReplayAllowed: false,
      stateMutationAllowed: false,
    },
  });
}

module.exports = {
  CONTINUATION_PREVIEW_STATUS,
  compileExecutionContinuationPreview,
  digest,
};
