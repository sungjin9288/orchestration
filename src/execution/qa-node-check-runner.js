'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_MAX_CHECKS = 10;
const DEFAULT_OUTPUT_CAP_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 5_000;
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
    const child = spawnImpl(process.execPath, ['--check', input.relativePath], {
      cwd: input.projectRoot,
      env: {},
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

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
        argv: [process.execPath, '--check', input.relativePath],
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

module.exports = {
  DEFAULT_MAX_CHECKS,
  DEFAULT_OUTPUT_CAP_BYTES,
  DEFAULT_TIMEOUT_MS,
  parseNodeCheckCommand,
  computeSourceBoundVerificationInputDigest,
  runNodeCheck,
  runQaNodeChecks,
  runSourceBoundNodeChecks,
};
