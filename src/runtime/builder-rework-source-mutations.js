'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const MUTATION_DECISION = 'run-builder-rework-live-mutation';
const MUTATION_ACKNOWLEDGEMENT =
  'mutate-only-approved-rework-targets-and-stop-before-reviewer';
const NEXT_GATE = 'separate-reviewer-reexecution-decision-required';
const MAX_RATIONALE_BYTES = 500;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_TARGET_BYTES = 1024 * 1024;
const MAX_TOTAL_TARGET_BYTES = 4 * 1024 * 1024;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const SENSITIVE_CONTENT_PATTERNS = Object.freeze([
  /\b(?:sk|pk|rk)-(?:proj-)?[a-z0-9_-]{12,}/i,
  /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]);
const SENSITIVE_SOURCE_CONTENT_PATTERNS = Object.freeze([
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:password|passwd|secret|token)\s*[:=]\s*["']?[A-Za-z0-9+/_=-]{20,}["']?/i,
]);
const SENSITIVE_SOURCE_BASENAMES = Object.freeze(new Set([
  '.netrc',
  '.npmrc',
  '.pypirc',
  'credentials',
  'credentials.json',
  'id_ed25519',
  'id_rsa',
  'secrets.json',
]));
const SENSITIVE_SOURCE_EXTENSIONS = Object.freeze(new Set([
  '.jks',
  '.key',
  '.keystore',
  '.p12',
  '.pem',
  '.pfx',
]));
const REQUEST_KEYS = Object.freeze([
  'builderReworkDispatchDigest',
  'builderReworkDispatchId',
  'evaluatedAt',
  'mutationApprovalBindingDigest',
  'mutationApprovalId',
  'mutationRequest',
  'preflightArtifactContentDigest',
  'preflightArtifactId',
  'preflightArtifactRecordDigest',
  'preflightRunId',
  'preflightRunRecordDigest',
  'sourceProgressDigest',
  'workOrderAttemptId',
  'workOrderAttemptRecordDigest',
]);
const MUTATION_REQUEST_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);

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
    actual.some((field, index) => field !== expected[index])
  ) {
    throw errorWithStatus(`${label} has unexpected or missing fields`, statusCode);
  }
}

function normalizeIdentifier(value, label) {
  if (
    typeof value !== 'string' ||
    !value ||
    value !== value.trim() ||
    value.length > 256 ||
    !/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(value)
  ) {
    throw errorWithStatus(`${label} is invalid`);
  }
  return value;
}

function normalizeDigest(value, label) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`);
  }
  return value;
}

function normalizeTimestamp(value, label) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`);
  }
  return value;
}

function normalizeRationale(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus('mutationRequest.rationale is required');
  }
  const rationale = value.trim().replace(/\s+/g, ' ');
  if (
    CONTROL_CHARACTER_PATTERN.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))
  ) {
    throw errorWithStatus('mutationRequest.rationale is invalid');
  }
  return rationale;
}

function normalizeSourceRelativePath(value) {
  if (
    typeof value !== 'string' ||
    !value ||
    value !== value.trim() ||
    value.includes('\\') ||
    value.includes('\u0000') ||
    path.isAbsolute(value)
  ) {
    throw errorWithStatus('Builder rework source path is invalid', 409);
  }
  const normalized = path.posix.normalize(value);
  if (
    normalized !== value ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    throw errorWithStatus('Builder rework source path is invalid', 409);
  }
  return normalized;
}

function isPathInside(rootPath, candidatePath) {
  const relativePath = path.relative(rootPath, candidatePath);
  return Boolean(
    relativePath &&
      relativePath !== '..' &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath)
  );
}

function assertAllowedSourcePath(relativePath) {
  const normalized = normalizeSourceRelativePath(relativePath);
  const lowerPath = normalized.toLowerCase();
  const segments = lowerPath.split('/');
  const basename = segments.at(-1);
  const hasSensitiveEnvPath = segments.some(
    (segment) =>
      (segment === '.env' || segment.startsWith('.env.')) &&
      segment !== '.env.example',
  );
  if (
    hasSensitiveEnvPath ||
    SENSITIVE_SOURCE_BASENAMES.has(basename) ||
    SENSITIVE_SOURCE_EXTENSIONS.has(path.extname(basename))
  ) {
    throw errorWithStatus(
      `Builder rework source path is credential-sensitive: ${normalized}`,
      409,
    );
  }
  return normalized;
}

function assertNoSensitiveBuilderReworkSourceContent(content, relativePath) {
  if (
    typeof content !== 'string' ||
    SENSITIVE_SOURCE_CONTENT_PATTERNS.some((pattern) => pattern.test(content))
  ) {
    throw errorWithStatus(
      `Builder rework source content is credential-sensitive: ${relativePath}`,
      409,
    );
  }
}

function computeBuilderReworkSourceContentDigest(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function readBoundedBuilderReworkSourceFile(projectPath, relativePath) {
  const normalizedPath = assertAllowedSourcePath(relativePath);
  const lexicalProjectRoot = path.resolve(projectPath);
  const projectRoot = fs.realpathSync(projectPath);
  const lexicalPath = path.resolve(projectPath, normalizedPath);
  if (!isPathInside(lexicalProjectRoot, lexicalPath)) {
    throw errorWithStatus(
      `Builder rework source path escapes project_path: ${normalizedPath}`,
      409,
    );
  }
  const linkStatus = fs.lstatSync(lexicalPath);
  if (
    linkStatus.isSymbolicLink() ||
    !linkStatus.isFile() ||
    linkStatus.nlink !== 1
  ) {
    throw errorWithStatus(
      `Builder rework source must be a regular non-symlink file with one hard link: ${normalizedPath}`,
      409,
    );
  }
  const realPath = fs.realpathSync(lexicalPath);
  if (!isPathInside(projectRoot, realPath)) {
    throw errorWithStatus(
      `Builder rework source realpath escapes project_path: ${normalizedPath}`,
      409,
    );
  }
  let descriptor = null;
  try {
    descriptor = fs.openSync(
      realPath,
      fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0),
    );
    const before = fs.fstatSync(descriptor);
    if (
      !before.isFile() ||
      before.nlink !== 1 ||
      before.size > MAX_TARGET_BYTES ||
      before.ino !== linkStatus.ino ||
      before.dev !== linkStatus.dev
    ) {
      throw errorWithStatus(
        `Builder rework source identity or byte cap is invalid: ${normalizedPath}`,
        409,
      );
    }
    const bytes = Buffer.alloc(before.size);
    const bytesRead = fs.readSync(descriptor, bytes, 0, before.size, 0);
    const after = fs.fstatSync(descriptor);
    if (
      bytesRead !== before.size ||
      after.size !== before.size ||
      after.mtimeMs !== before.mtimeMs ||
      after.ino !== before.ino ||
      after.dev !== before.dev ||
      after.nlink !== 1
    ) {
      throw errorWithStatus(
        `Builder rework source changed during validation: ${normalizedPath}`,
        409,
      );
    }
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    assertNoSensitiveBuilderReworkSourceContent(content, normalizedPath);
    return {
      bytes,
      content,
      dev: before.dev,
      digest: computeBuilderReworkSourceContentDigest(content),
      ino: before.ino,
      path: normalizedPath,
      realPath,
    };
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor);
  }
}

function readBoundedBuilderReworkSourceTargets(projectPath, relativePaths) {
  if (
    !Array.isArray(relativePaths) ||
    relativePaths.length === 0 ||
    new Set(relativePaths).size !== relativePaths.length
  ) {
    throw errorWithStatus(
      'Builder rework source targets must be a non-empty unique array',
      409,
    );
  }
  const entries = relativePaths.map((relativePath) =>
    readBoundedBuilderReworkSourceFile(projectPath, relativePath));
  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes.length, 0);
  if (totalBytes > MAX_TOTAL_TARGET_BYTES) {
    throw errorWithStatus(
      'Builder rework source targets exceed the aggregate byte cap',
      409,
    );
  }
  return entries;
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
    .update(Buffer.from(JSON.stringify(canonicalize(value)), 'utf8'))
    .digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeBuilderReworkSourceMutationRequest(input, options = {}) {
  assertExactKeys(input, REQUEST_KEYS, 'Builder rework source mutation request');
  assertExactKeys(input.mutationRequest, MUTATION_REQUEST_KEYS, 'mutationRequest');
  if (
    input.mutationRequest.decision !== MUTATION_DECISION ||
    input.mutationRequest.acknowledgement !== MUTATION_ACKNOWLEDGEMENT
  ) {
    throw errorWithStatus('mutationRequest authority is invalid');
  }
  const reviewedAt = normalizeTimestamp(
    input.mutationRequest.reviewedAt,
    'mutationRequest.reviewedAt',
  );
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  if (reviewedAt !== evaluatedAt) {
    throw errorWithStatus('evaluatedAt must equal mutationRequest.reviewedAt');
  }
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
  );
  if (Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('mutationRequest.reviewedAt is outside the allowed window');
  }
  if (
    options.approvalResolvedAt &&
    Date.parse(reviewedAt) < Date.parse(options.approvalResolvedAt)
  ) {
    throw errorWithStatus(
      'mutationRequest.reviewedAt predates the approved mutation authority',
      409,
    );
  }
  return deepFreeze({
    builderReworkDispatchId: normalizeIdentifier(
      input.builderReworkDispatchId,
      'builderReworkDispatchId',
    ),
    builderReworkDispatchDigest: normalizeDigest(
      input.builderReworkDispatchDigest,
      'builderReworkDispatchDigest',
    ),
    workOrderAttemptId: normalizeIdentifier(
      input.workOrderAttemptId,
      'workOrderAttemptId',
    ),
    workOrderAttemptRecordDigest: normalizeDigest(
      input.workOrderAttemptRecordDigest,
      'workOrderAttemptRecordDigest',
    ),
    preflightRunId: normalizeIdentifier(input.preflightRunId, 'preflightRunId'),
    preflightRunRecordDigest: normalizeDigest(
      input.preflightRunRecordDigest,
      'preflightRunRecordDigest',
    ),
    preflightArtifactId: normalizeIdentifier(
      input.preflightArtifactId,
      'preflightArtifactId',
    ),
    preflightArtifactRecordDigest: normalizeDigest(
      input.preflightArtifactRecordDigest,
      'preflightArtifactRecordDigest',
    ),
    preflightArtifactContentDigest: normalizeDigest(
      input.preflightArtifactContentDigest,
      'preflightArtifactContentDigest',
    ),
    mutationApprovalId: normalizeIdentifier(
      input.mutationApprovalId,
      'mutationApprovalId',
    ),
    mutationApprovalBindingDigest: normalizeDigest(
      input.mutationApprovalBindingDigest,
      'mutationApprovalBindingDigest',
    ),
    sourceProgressDigest: normalizeDigest(
      input.sourceProgressDigest,
      'sourceProgressDigest',
    ),
    evaluatedAt,
    mutationRequest: {
      decision: MUTATION_DECISION,
      acknowledgement: MUTATION_ACKNOWLEDGEMENT,
      rationale: normalizeRationale(input.mutationRequest.rationale),
      reviewedAt,
    },
  });
}

function computeBuilderReworkSourceMutationRequestDigest(request) {
  return digestCanonical(
    normalizeBuilderReworkSourceMutationRequest(request, {
      now: request.evaluatedAt,
    }),
  );
}

module.exports = {
  MUTATION_ACKNOWLEDGEMENT,
  MUTATION_DECISION,
  MUTATION_REQUEST_KEYS,
  MAX_TARGET_BYTES,
  MAX_TOTAL_TARGET_BYTES,
  NEXT_GATE,
  REQUEST_KEYS,
  assertNoSensitiveBuilderReworkSourceContent,
  computeBuilderReworkSourceContentDigest,
  computeBuilderReworkSourceMutationRequestDigest,
  deepFreeze,
  digestCanonical,
  normalizeBuilderReworkSourceMutationRequest,
  readBoundedBuilderReworkSourceFile,
  readBoundedBuilderReworkSourceTargets,
};
