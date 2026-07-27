'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  MAX_FILE_BYTES,
  assertSpecialistCellAttemptRecord,
  computeInputDigest,
  normalizeInputPathDigests,
} = require('../runtime/specialist-cell-attempts');

const MAX_TOTAL_FILE_BYTES = 8 * 1024 * 1024;

function digest(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function nowMs(options) {
  const value = typeof options.now === 'function' ? options.now() : Date.now();
  const timestamp = value instanceof Date ? value.getTime() : Number(value);
  if (!Number.isFinite(timestamp)) throw new Error('runner clock must return a timestamp');
  return timestamp;
}

function deadlineReached(deadlineAt, options) {
  return nowMs(options) >= Date.parse(deadlineAt);
}

function resolveContainedRegularFile(projectRoot, relativePath) {
  const root = fs.realpathSync(projectRoot);
  const unresolved = path.resolve(root, relativePath);
  const resolved = fs.realpathSync(unresolved);
  if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error('source path escapes project root');
  }
  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error('source path must be a regular file');
  }
  return { root, target: resolved };
}

function failed(failureReason, observedInputDigest = null) {
  return {
    status: 'failed',
    failureReason,
    observedInputDigest,
  };
}

function createSourceCaptureError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function readBoundedRegularFile(root, target, maxBytes) {
  const noFollow = fs.constants.O_NOFOLLOW;
  if (!Number.isInteger(noFollow)) {
    throw createSourceCaptureError('source-unavailable-after-start');
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
      throw createSourceCaptureError('source-unavailable-after-start');
    }
    if (descriptorStat.size > maxBytes) {
      throw createSourceCaptureError('source-byte-cap-exceeded-after-start');
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
      throw createSourceCaptureError('source-byte-cap-exceeded-after-start');
    }
    return buffer.subarray(0, byteLength);
  } catch (error) {
    if (typeof error?.code === 'string' && error.code.startsWith('source-')) {
      throw error;
    }
    throw createSourceCaptureError('source-unavailable-after-start');
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function captureContainedInputSnapshot(input, options = {}) {
  const cellAttempt = input?.cellAttempt;
  assertSpecialistCellAttemptRecord(cellAttempt, {
    batchDeadlineAt: input?.batchDeadlineAt,
  });
  const expected = normalizeInputPathDigests(cellAttempt.inputPathDigests);
  if (deadlineReached(cellAttempt.deadlineAt, options)) {
    return failed('deadline-expired-before-worker');
  }

  const observed = [];
  const evidenceByTarget = new Map();
  let totalByteLength = 0;
  for (const entry of expected) {
    if (deadlineReached(cellAttempt.deadlineAt, options)) {
      return failed('cell-deadline-exceeded', observed.length ? computeInputDigest(observed) : null);
    }
    let file;
    try {
      file = resolveContainedRegularFile(input.projectRoot, entry.path);
    } catch {
      return failed('source-unavailable-after-start', observed.length ? computeInputDigest(observed) : null);
    }
    let fileEvidence = evidenceByTarget.get(file.target) || null;
    if (!fileEvidence) {
      let bytes;
      try {
        const remainingBytes = Math.min(
          MAX_FILE_BYTES,
          MAX_TOTAL_FILE_BYTES - totalByteLength,
        );
        if (remainingBytes <= 0) {
          throw createSourceCaptureError('source-byte-cap-exceeded-after-start');
        }
        bytes = readBoundedRegularFile(file.root, file.target, remainingBytes);
      } catch (error) {
        const failureReason = error?.code === 'source-byte-cap-exceeded-after-start'
          ? error.code
          : 'source-unavailable-after-start';
        return failed(
          failureReason,
          observed.length ? computeInputDigest(observed) : null,
        );
      }
      totalByteLength += bytes.length;
      if (totalByteLength > MAX_TOTAL_FILE_BYTES) {
        return failed('source-byte-cap-exceeded-after-start', observed.length ? computeInputDigest(observed) : null);
      }
      fileEvidence = {
        byteLength: bytes.length,
        sha256: digest(bytes),
      };
      evidenceByTarget.set(file.target, fileEvidence);
    }
    const observedEntry = {
      path: entry.path,
      byteLength: fileEvidence.byteLength,
      sha256: fileEvidence.sha256,
    };
    observed.push(observedEntry);
    if (deadlineReached(cellAttempt.deadlineAt, options)) {
      return failed('cell-deadline-exceeded', computeInputDigest(observed));
    }
    if (
      observedEntry.byteLength !== entry.byteLength ||
      observedEntry.sha256 !== entry.sha256
    ) {
      return failed('source-drift-before-worker', computeInputDigest(observed));
    }
  }

  const observedInputDigest = computeInputDigest(observed);
  if (observedInputDigest !== cellAttempt.inputDigest) {
    return failed('source-drift-before-worker', observedInputDigest);
  }
  return {
    status: 'completed',
    observedInputDigest,
    files: observed,
  };
}

async function runSpecialistResearcherLocal(input, options = {}) {
  const snapshot = captureContainedInputSnapshot(input, options);
  if (snapshot.status === 'failed') return snapshot;
  if (deadlineReached(input.cellAttempt.deadlineAt, options)) {
    return failed('cell-deadline-exceeded', snapshot.observedInputDigest);
  }
  return {
    status: 'completed',
    observedInputDigest: snapshot.observedInputDigest,
    resultSummary: {
      kind: 'source-evidence-manifest',
      files: snapshot.files,
      totalByteLength: snapshot.files.reduce((total, file) => total + file.byteLength, 0),
    },
  };
}

module.exports = {
  captureContainedInputSnapshot,
  deadlineReached,
  resolveContainedRegularFile,
  runSpecialistResearcherLocal,
};
