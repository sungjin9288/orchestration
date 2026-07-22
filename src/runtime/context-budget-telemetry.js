'use strict';

const crypto = require('crypto');

const MAX_DEPTH = 20;
const MAX_LEAF_FIELDS = 1000;
const ACKNOWLEDGEMENT = 'measurement-only-no-payload-rewrite';
const PROTECTED_EXACT_FIELD = /(^|[-_])(id|ids|ref|refs|digest|path|paths|command|commands|approval|approvals|negative[-_]?evidence|status|action|decision|authority|source|verification)([-_]|$)/i;

class ContextBudgetTelemetryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContextBudgetTelemetryError';
    this.statusCode = 400;
  }
}

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
    .update(typeof value === 'string' ? value : JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function escapePointerSegment(value) {
  return String(value).replace(/~/g, '~0').replace(/\//g, '~1');
}

function normalizeGistPaths(value) {
  if (!Array.isArray(value)) {
    throw new ContextBudgetTelemetryError('gistPathAllowlist must be an array');
  }
  const normalized = value.map((entry) => String(entry || '').trim());
  if (
    normalized.some((entry) => !entry.startsWith('/') || entry.includes('*')) ||
    new Set(normalized).size !== normalized.length
  ) {
    throw new ContextBudgetTelemetryError(
      'gistPathAllowlist requires unique explicit JSON Pointer paths',
    );
  }
  return normalized.sort();
}

function isGistPath(path, gistPaths) {
  return gistPaths.some((gistPath) => path === gistPath || path.startsWith(`${gistPath}/`));
}

function leafType(value) {
  if (value === null) return 'null';
  return typeof value;
}

function collectLeaves(value, gistPaths, depth = 0, pointer = '') {
  if (depth > MAX_DEPTH) {
    throw new ContextBudgetTelemetryError(`payload exceeds maximum depth ${MAX_DEPTH}`);
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectLeaves(entry, gistPaths, depth + 1, `${pointer}/${index}`));
  }
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new ContextBudgetTelemetryError('payload must contain JSON-compatible objects only');
    }
    return Object.entries(value).flatMap(([key, entry]) =>
      collectLeaves(entry, gistPaths, depth + 1, `${pointer}/${escapePointerSegment(key)}`));
  }
  if (!['string', 'number', 'boolean'].includes(typeof value) && value !== null) {
    throw new ContextBudgetTelemetryError('payload must contain JSON-compatible values only');
  }

  const path = pointer || '/';
  const protectedPath = path
    .split('/')
    .slice(1)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .map((segment) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2'));
  const requestedGist = isGistPath(path, gistPaths);
  if (requestedGist && protectedPath.some((segment) => PROTECTED_EXACT_FIELD.test(segment))) {
    throw new ContextBudgetTelemetryError(
      `Protected exact field cannot be classified as gist: ${path}`,
    );
  }
  const encoded = JSON.stringify(value);
  return [{
    path,
    type: leafType(value),
    classification: requestedGist ? 'gist' : 'exact',
    characterCount: encoded.length,
    utf8Bytes: Buffer.byteLength(encoded, 'utf8'),
    valueDigest: digest(encoded),
  }];
}

function compileContextBudgetTelemetry(input) {
  const expectedFields = [
    'evaluatedAt',
    'operatorAcknowledgement',
    'payload',
    'telemetrySpec',
  ].sort();
  const actualFields = Object.keys(input || {}).sort();
  if (
    actualFields.length !== expectedFields.length ||
    actualFields.some((field, index) => field !== expectedFields[index])
  ) {
    throw new ContextBudgetTelemetryError(
      'Context budget telemetry has unexpected or missing fields',
    );
  }
  if (input.operatorAcknowledgement !== ACKNOWLEDGEMENT) {
    throw new ContextBudgetTelemetryError('Context budget acknowledgement does not match');
  }
  const evaluatedAt = String(input.evaluatedAt || '').trim();
  if (
    !Number.isFinite(Date.parse(evaluatedAt)) ||
    new Date(Date.parse(evaluatedAt)).toISOString() !== evaluatedAt
  ) {
    throw new ContextBudgetTelemetryError('evaluatedAt must be an exact ISO timestamp');
  }
  const telemetryFields = ['gistPathAllowlist', 'truncationThresholdBytes'].sort();
  const actualTelemetryFields = Object.keys(input.telemetrySpec || {}).sort();
  if (
    actualTelemetryFields.length !== telemetryFields.length ||
    actualTelemetryFields.some((field, index) => field !== telemetryFields[index])
  ) {
    throw new ContextBudgetTelemetryError('telemetrySpec has unexpected or missing fields');
  }
  const threshold = input.telemetrySpec.truncationThresholdBytes;
  if (!Number.isInteger(threshold) || threshold < 64 || threshold > 64 * 1024) {
    throw new ContextBudgetTelemetryError(
      'truncationThresholdBytes must be an integer from 64 to 65536',
    );
  }
  const gistPaths = normalizeGistPaths(input.telemetrySpec.gistPathAllowlist);
  const leaves = collectLeaves(input.payload, gistPaths);
  if (leaves.length > MAX_LEAF_FIELDS) {
    throw new ContextBudgetTelemetryError(
      `payload exceeds maximum leaf field count ${MAX_LEAF_FIELDS}`,
    );
  }
  for (const leaf of leaves) {
    leaf.truncationEligible =
      leaf.classification === 'gist' && leaf.utf8Bytes > threshold;
  }
  const serializedPayload = JSON.stringify(input.payload);
  if (serializedPayload === undefined) {
    throw new ContextBudgetTelemetryError('payload must be JSON serializable');
  }

  function summarize(classification) {
    const selected = leaves.filter((leaf) => leaf.classification === classification);
    return {
      fieldCount: selected.length,
      characterCount: selected.reduce((total, leaf) => total + leaf.characterCount, 0),
      utf8Bytes: selected.reduce((total, leaf) => total + leaf.utf8Bytes, 0),
    };
  }

  const reportPayload = {
    evaluatedAt,
    sourceDigest: digest(serializedPayload),
    telemetrySpec: {
      gistPathAllowlist: gistPaths,
      truncationThresholdBytes: threshold,
    },
  };
  const reportDigest = digest(reportPayload);
  const eligible = leaves.filter((leaf) => leaf.truncationEligible);

  return deepFreeze({
    id: `context-budget-report-${reportDigest.slice(0, 24)}`,
    schemaVersion: 1,
    status: 'measurement-ready',
    persisted: false,
    ...reportPayload,
    reportDigest,
    metrics: {
      payloadCharacterCount: serializedPayload.length,
      payloadUtf8Bytes: Buffer.byteLength(serializedPayload, 'utf8'),
      leafFieldCount: leaves.length,
      exact: summarize('exact'),
      gist: summarize('gist'),
      truncationEligible: {
        fieldCount: eligible.length,
        utf8Bytes: eligible.reduce((total, leaf) => total + leaf.utf8Bytes, 0),
      },
    },
    fields: leaves,
    authority: {
      payloadRewriteAllowed: false,
      truncationAllowed: false,
      compressionAllowed: false,
      providerCallAllowed: false,
      persistenceAllowed: false,
    },
  });
}

module.exports = {
  ACKNOWLEDGEMENT,
  ContextBudgetTelemetryError,
  compileContextBudgetTelemetry,
};
