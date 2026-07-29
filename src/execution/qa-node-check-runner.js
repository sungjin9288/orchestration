'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_MAX_CHECKS = 10;
const DEFAULT_OUTPUT_CAP_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_MAX_FILE_BYTES = 1024 * 1024;
const DEFAULT_MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;
const NODE_CHECK_PATTERN = /^node --check ([A-Za-z0-9][A-Za-z0-9._/-]*)$/;

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeRelativePath(value, label) {
  const normalized = String(value || '').trim().replaceAll('\\', '/');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    normalized.split('/').some((segment) => segment === '..' || segment === '')
  ) {
    throw new Error(`${label} must be a safe repository-relative path`);
  }

  return path.posix.normalize(normalized);
}

function parseNodeCheckCommand(command) {
  const matched = NODE_CHECK_PATTERN.exec(String(command || '').trim());

  if (!matched) {
    throw new Error('QA command must match exactly: node --check <relative-path>');
  }

  return {
    kind: 'node-check',
    relativePath: normalizeRelativePath(matched[1], 'QA check path'),
  };
}

function resolveContainedFile(projectRoot, relativePath) {
  const root = fs.realpathSync(projectRoot);
  const target = fs.realpathSync(path.resolve(root, relativePath));

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`QA check path escapes project root: ${relativePath}`);
  }
  if (!fs.statSync(target).isFile()) {
    throw new Error(`QA check path must be a file: ${relativePath}`);
  }

  return { root, target };
}

function captureFileDigests(projectRoot, relativePaths) {
  return relativePaths.map((relativePath) => {
    const { target } = resolveContainedFile(projectRoot, relativePath);
    return {
      path: relativePath,
      digest: digest(fs.readFileSync(target)),
    };
  });
}

function sameDigestEntries(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameRelativePathSet(left, right) {
  const normalize = (entries, label) =>
    [...new Set((entries || []).map((entry) => normalizeRelativePath(entry, label)))].sort();
  return JSON.stringify(normalize(left, 'Specialist path')) ===
    JSON.stringify(normalize(right, 'Specialist path'));
}

function createSpecialistRunnerError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function readBoundedSpecialistFile(root, target, maxBytes) {
  const noFollow = fs.constants.O_NOFOLLOW;
  if (!Number.isInteger(noFollow)) {
    throw createSpecialistRunnerError('source-unavailable-after-start');
  }

  let descriptor;
  try {
    descriptor = fs.openSync(target, fs.constants.O_RDONLY | noFollow);
    const descriptorStat = fs.fstatSync(descriptor);
    const currentTarget = fs.realpathSync(target);
    const currentStat = fs.statSync(target);
    if (
      currentTarget !== target ||
      (currentTarget !== root && !currentTarget.startsWith(`${root}${path.sep}`)) ||
      !descriptorStat.isFile() ||
      descriptorStat.dev !== currentStat.dev ||
      descriptorStat.ino !== currentStat.ino
    ) {
      throw createSpecialistRunnerError('source-unavailable-after-start');
    }
    if (descriptorStat.size > maxBytes) {
      throw createSpecialistRunnerError('source-byte-cap-exceeded-after-start');
    }

    const buffer = Buffer.allocUnsafe(maxBytes + 1);
    let byteLength = 0;
    while (byteLength < buffer.length) {
      const bytesRead = fs.readSync(
        descriptor,
        buffer,
        byteLength,
        buffer.length - byteLength,
        null,
      );
      if (bytesRead === 0) break;
      byteLength += bytesRead;
    }
    if (byteLength > maxBytes) {
      throw createSpecialistRunnerError('source-byte-cap-exceeded-after-start');
    }
    return buffer.subarray(0, byteLength);
  } catch (error) {
    if (typeof error?.code === 'string' && error.code.startsWith('source-')) {
      throw error;
    }
    throw createSpecialistRunnerError('source-unavailable-after-start');
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function specialistNowMs(options = {}) {
  const value = typeof options.now === 'function' ? options.now() : Date.now();
  const milliseconds =
    value instanceof Date
      ? value.getTime()
      : typeof value === 'string'
        ? Date.parse(value)
        : Number(value);
  if (!Number.isFinite(milliseconds)) {
    throw createSpecialistRunnerError('runner-contract-failed');
  }
  return milliseconds;
}

function digestSpecialistInputPathDigests(entries) {
  return digest(
    JSON.stringify(
      [...entries]
        .sort((left, right) => left.path.localeCompare(right.path))
        .map(({ byteLength, path: relativePath, sha256 }) => ({
          byteLength,
          path: relativePath,
          sha256,
        })),
    ),
  );
}

function captureBoundedSpecialistInputEvidence(
  projectRoot,
  expectedInputPathDigests,
  options = {},
) {
  const root = fs.realpathSync(String(projectRoot || ''));
  const maxFileBytes = Math.min(
    DEFAULT_MAX_FILE_BYTES,
    Math.max(1, Number(options.maxFileBytes || DEFAULT_MAX_FILE_BYTES)),
  );
  const maxTotalFileBytes = Math.min(
    DEFAULT_MAX_TOTAL_FILE_BYTES,
    Math.max(1, Number(options.maxTotalFileBytes || DEFAULT_MAX_TOTAL_FILE_BYTES)),
  );
  const expected = [...(expectedInputPathDigests || [])]
    .map(({ byteLength, path: relativePath, sha256 }) => ({
      byteLength,
      path: normalizeRelativePath(relativePath, 'Specialist input path'),
      sha256,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const evidenceByTarget = new Map();
  const sourceBytesByPath = new Map();
  const observed = [];
  let totalBytes = 0;

  for (const entry of expected) {
    let resolved;
    try {
      resolved = resolveContainedFile(root, entry.path);
    } catch {
      throw createSpecialistRunnerError('source-unavailable-after-start');
    }

    let evidence = evidenceByTarget.get(resolved.target);
    if (!evidence) {
      const remainingBytes = Math.min(
        maxFileBytes,
        maxTotalFileBytes - totalBytes,
      );
      if (remainingBytes <= 0) {
        throw createSpecialistRunnerError('source-byte-cap-exceeded-after-start');
      }
      const bytes = readBoundedSpecialistFile(
        resolved.root,
        resolved.target,
        remainingBytes,
      );
      totalBytes += bytes.byteLength;
      if (totalBytes > maxTotalFileBytes) {
        throw createSpecialistRunnerError('source-byte-cap-exceeded-after-start');
      }
      evidence = {
        byteLength: bytes.byteLength,
        bytes,
        sha256: digest(bytes),
      };
      evidenceByTarget.set(resolved.target, evidence);
    }
    observed.push({
      byteLength: evidence.byteLength,
      path: entry.path,
      sha256: evidence.sha256,
    });
    if (options.includeSourceBytes === true) {
      sourceBytesByPath.set(entry.path, Buffer.from(evidence.bytes));
    }
  }

  return {
    inputPathDigests: observed,
    inputDigest: digestSpecialistInputPathDigests(observed),
    matchesExpected: sameDigestEntries(observed, expected),
    sourceBytesByPath: options.includeSourceBytes === true ? sourceBytesByPath : null,
  };
}

function runNodeCheck(input, options = {}) {
  const spawnImpl = options.spawnImpl || spawn;
  const timeoutMs = Math.min(
    DEFAULT_TIMEOUT_MS,
    Math.max(1, Number(options.timeoutMs || DEFAULT_TIMEOUT_MS)),
  );
  const outputCapBytes = Math.min(
    DEFAULT_OUTPUT_CAP_BYTES,
    Math.max(1, Number(options.outputCapBytes || DEFAULT_OUTPUT_CAP_BYTES)),
  );
  const sourceBytes = Buffer.isBuffer(input.sourceBytes) ? input.sourceBytes : null;
  const checkArgument = sourceBytes ? '-' : input.relativePath;
  const startedAtMs = Date.now();

  return new Promise((resolve) => {
    const stdoutHash = crypto.createHash('sha256');
    const stderrHash = crypto.createHash('sha256');
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let truncated = false;
    let outputLimitExceeded = false;
    let timedOut = false;
    let settled = false;
    const child = spawnImpl(process.execPath, ['--check', checkArgument], {
      cwd: input.projectRoot,
      env: {},
      shell: false,
      stdio: [sourceBytes ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });
    if (sourceBytes) child.stdin?.end(sourceBytes);

    const consume = (hash, kind) => (chunk) => {
      const buffer = Buffer.from(chunk);
      hash.update(buffer);
      if (kind === 'stdout') stdoutBytes += buffer.length;
      else stderrBytes += buffer.length;
      if (stdoutBytes + stderrBytes > outputCapBytes) {
        truncated = true;
        if (!outputLimitExceeded) {
          outputLimitExceeded = true;
          child.kill('SIGTERM');
        }
      }
    };
    child.stdout?.on('data', consume(stdoutHash, 'stdout'));
    child.stderr?.on('data', consume(stderrHash, 'stderr'));

    const finish = (exitCode, spawnError = null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        kind: 'node-check',
        argv: [process.execPath, '--check', checkArgument],
        exitCode: Number.isInteger(exitCode) ? exitCode : null,
        durationMs: Math.max(0, Date.now() - startedAtMs),
        stdoutDigest: stdoutHash.digest('hex'),
        stderrDigest: stderrHash.digest('hex'),
        truncated,
        timedOut,
        error: spawnError ? String(spawnError.message || spawnError) : null,
        passed: !spawnError && !timedOut && exitCode === 0 && !truncated,
      });
    };
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.once('error', (error) => finish(null, error));
    child.once('close', (code) => finish(code));
  });
}

async function runQaNodeChecks(input, options = {}) {
  const projectRoot = fs.realpathSync(String(input.projectRoot || ''));
  const changedFiles = [...new Set((input.changedFiles || []).map((value) =>
    normalizeRelativePath(value, 'Builder changed file')))].sort();
  const targetPathAllowlist = new Set(
    (input.targetPathAllowlist || []).map((value) =>
      normalizeRelativePath(value, 'QA target allowlist path')),
  );
  const commands = Array.isArray(input.commands) ? input.commands : [];
  const maxChecks = Math.min(
    DEFAULT_MAX_CHECKS,
    Math.max(1, Number(options.maxChecks || DEFAULT_MAX_CHECKS)),
  );

  if (changedFiles.length === 0) throw new Error('QA requires Builder changed files');
  if (commands.length === 0 || commands.length > maxChecks) {
    throw new Error(`QA requires between 1 and ${maxChecks} node checks`);
  }

  const checksToRun = commands.map(parseNodeCheckCommand);
  for (const check of checksToRun) {
    if (!changedFiles.includes(check.relativePath)) {
      throw new Error(`QA check path was not changed by Builder: ${check.relativePath}`);
    }
    if (!targetPathAllowlist.has(check.relativePath)) {
      throw new Error(`QA check path is outside the target allowlist: ${check.relativePath}`);
    }
    resolveContainedFile(projectRoot, check.relativePath);
  }

  const baselineDigests = captureFileDigests(projectRoot, changedFiles);
  const checks = [];
  for (const check of checksToRun) {
    checks.push(await runNodeCheck({ projectRoot, relativePath: check.relativePath }, options));
  }
  const finalDigests = captureFileDigests(projectRoot, changedFiles);
  const mutationDetected = !sameDigestEntries(baselineDigests, finalDigests);
  const reasons = checks
    .filter((check) => !check.passed)
    .map((check) =>
      check.timedOut
        ? `${check.argv.at(-1)} timed out`
        : check.truncated
          ? `${check.argv.at(-1)} exceeded the output cap`
          : `${check.argv.at(-1)} exited with ${check.exitCode ?? 'spawn-error'}`,
    );
  if (mutationDetected) reasons.push('QA mutated the Builder changed-file set');

  return {
    schemaVersion: 1,
    kind: 'node-syntax-check',
    changedFiles,
    checks,
    mutationDetected,
    reasons,
    verdict: reasons.length === 0 ? 'passed' : 'failed',
  };
}

function prepareSourceBoundNodeChecks(input, options = {}) {
  const projectRoot = fs.realpathSync(String(input.projectRoot || ''));
  const targetPathAllowlist = new Set(
    (input.targetPathAllowlist || []).map((value) =>
      normalizeRelativePath(value, 'Verification target allowlist path')),
  );
  const commands = Array.isArray(input.commands) ? input.commands : [];
  const maxChecks = Math.min(
    DEFAULT_MAX_CHECKS,
    Math.max(1, Number(options.maxChecks || DEFAULT_MAX_CHECKS)),
  );
  if (commands.length === 0 || commands.length > maxChecks) {
    throw new Error(`Verification requires between 1 and ${maxChecks} node checks`);
  }
  const checks = commands.map(parseNodeCheckCommand);
  for (const check of checks) {
    if (!targetPathAllowlist.has(check.relativePath)) {
      throw new Error(`Verification path is outside the target allowlist: ${check.relativePath}`);
    }
    resolveContainedFile(projectRoot, check.relativePath);
  }
  return {
    projectRoot,
    checks,
    relativePaths: [...new Set(checks.map((check) => check.relativePath))].sort(),
  };
}

function computeSourceBoundVerificationInputDigest(input, options = {}) {
  const prepared = prepareSourceBoundNodeChecks(input, options);
  const fileDigests = captureFileDigests(prepared.projectRoot, prepared.relativePaths);
  return digest(JSON.stringify(fileDigests));
}

async function runSourceBoundNodeChecks(input, options = {}) {
  const prepared = prepareSourceBoundNodeChecks(input, options);
  const baselineDigests = captureFileDigests(prepared.projectRoot, prepared.relativePaths);
  const checks = [];
  for (const check of prepared.checks) {
    checks.push(
      await runNodeCheck(
        { projectRoot: prepared.projectRoot, relativePath: check.relativePath },
        options,
      ),
    );
  }
  const finalDigests = captureFileDigests(prepared.projectRoot, prepared.relativePaths);
  const mutationDetected = !sameDigestEntries(baselineDigests, finalDigests);
  const reasons = checks
    .filter((check) => !check.passed)
    .map((check) =>
      check.timedOut
        ? `${check.argv.at(-1)} timed out`
        : check.truncated
          ? `${check.argv.at(-1)} exceeded the output cap`
          : `${check.argv.at(-1)} exited with ${check.exitCode ?? 'spawn-error'}`,
    );
  if (mutationDetected) reasons.push('Verification mutated its source files');

  return {
    schemaVersion: 1,
    kind: 'source-bound-node-syntax-check',
    verificationInputDigest: digest(JSON.stringify(baselineDigests)),
    fileDigests: baselineDigests,
    checks,
    mutationDetected,
    reasons,
    verdict: reasons.length === 0 ? 'passed' : 'failed',
  };
}

async function runSpecialistSourceBoundNodeChecks(input, options = {}) {
  const deadlineAtMs = Date.parse(String(input.deadlineAt || ''));
  if (!Number.isFinite(deadlineAtMs)) {
    throw createSpecialistRunnerError('runner-contract-failed');
  }
  if (specialistNowMs(options) >= deadlineAtMs) {
    throw createSpecialistRunnerError('deadline-expired-before-worker');
  }

  let baseline;
  try {
    baseline = captureBoundedSpecialistInputEvidence(
      input.projectRoot,
      input.inputPathDigests,
      { ...options, includeSourceBytes: true },
    );
  } catch (error) {
    if (error.code) throw error;
    throw createSpecialistRunnerError('runner-contract-failed');
  }
  if (!baseline.matchesExpected) {
    throw createSpecialistRunnerError('source-drift-before-worker');
  }

  let prepared;
  try {
    prepared = prepareSourceBoundNodeChecks(
      {
        projectRoot: input.projectRoot,
        targetPathAllowlist: input.targetPathAllowlist,
        commands: input.commands,
      },
      options,
    );
  } catch {
    throw createSpecialistRunnerError('runner-contract-failed');
  }
  const changedFiles = [...new Set((input.changedFiles || []).map((entry) =>
    normalizeRelativePath(entry, 'Builder changed file')))].sort();
  const hasChangedFiles = Object.prototype.hasOwnProperty.call(input, 'changedFiles');
  const targetPathAllowlist = [...new Set((input.targetPathAllowlist || []).map((entry) =>
    normalizeRelativePath(entry, 'Verification target allowlist path')))].sort();
  if (
    (hasChangedFiles && (
      changedFiles.length === 0 ||
      !sameRelativePathSet(changedFiles, targetPathAllowlist)
    )) ||
    !sameRelativePathSet(targetPathAllowlist, prepared.relativePaths) ||
    !sameRelativePathSet(targetPathAllowlist, baseline.inputPathDigests.map((entry) => entry.path))
  ) {
    throw createSpecialistRunnerError('runner-contract-failed');
  }

  const checks = [];
  for (const check of prepared.checks) {
    const remainingMs = deadlineAtMs - specialistNowMs(options);
    if (remainingMs <= 0) {
      throw createSpecialistRunnerError('cell-deadline-exceeded');
    }
    const sourceBytes = baseline.sourceBytesByPath.get(check.relativePath);
    if (!Buffer.isBuffer(sourceBytes)) {
      throw createSpecialistRunnerError('runner-contract-failed');
    }
    let result;
    try {
      result = await runNodeCheck(
        {
          projectRoot: prepared.projectRoot,
          relativePath: check.relativePath,
          sourceBytes,
        },
        {
          ...options,
          timeoutMs: remainingMs,
        },
      );
    } catch {
      throw createSpecialistRunnerError('qa-spawn-failed');
    }
    if (result.error) {
      throw createSpecialistRunnerError('qa-spawn-failed');
    }
    if (result.truncated) {
      throw createSpecialistRunnerError('qa-output-cap-exceeded');
    }
    if (result.timedOut || specialistNowMs(options) >= deadlineAtMs) {
      throw createSpecialistRunnerError('cell-deadline-exceeded');
    }
    checks.push({
      argv: result.argv,
      relativePath: check.relativePath,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      truncated: result.truncated,
      passed: result.passed,
      stdoutDigest: result.stdoutDigest,
      stderrDigest: result.stderrDigest,
    });
  }

  let finalEvidence;
  try {
    finalEvidence = captureBoundedSpecialistInputEvidence(
      input.projectRoot,
      input.inputPathDigests,
      options,
    );
  } catch (error) {
    if (error.code) throw error;
    throw createSpecialistRunnerError('runner-contract-failed');
  }
  if (
    !finalEvidence.matchesExpected ||
    finalEvidence.inputDigest !== baseline.inputDigest
  ) {
    throw createSpecialistRunnerError('source-drift-during-worker');
  }
  if (specialistNowMs(options) >= deadlineAtMs) {
    throw createSpecialistRunnerError('cell-deadline-exceeded');
  }

  return {
    observedInputDigest: baseline.inputDigest,
    resultSummary: {
      changedFiles,
      kind: 'node-syntax-check',
      checks,
      mutationDetected: false,
      verdict: checks.every((check) => check.passed) ? 'passed' : 'failed',
    },
  };
}

module.exports = {
  DEFAULT_MAX_FILE_BYTES,
  DEFAULT_MAX_TOTAL_FILE_BYTES,
  DEFAULT_MAX_CHECKS,
  DEFAULT_OUTPUT_CAP_BYTES,
  DEFAULT_TIMEOUT_MS,
  captureBoundedSpecialistInputEvidence,
  digestSpecialistInputPathDigests,
  parseNodeCheckCommand,
  computeSourceBoundVerificationInputDigest,
  runNodeCheck,
  runQaNodeChecks,
  runSpecialistSourceBoundNodeChecks,
  runSourceBoundNodeChecks,
};
