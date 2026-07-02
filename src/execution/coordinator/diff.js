'use strict';

const crypto = require('crypto');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { resolveProjectFilePath } = require('./paths');

function captureFileContents(projectPath, relativePaths) {
  const contents = new Map();

  for (const relativePath of [...new Set(relativePaths)]) {
    const filePath = resolveProjectFilePath(projectPath, relativePath);

    contents.set(relativePath, fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null);
  }

  return contents;
}

function computeContentDigest(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function captureFileDigests(projectPath, relativePaths) {
  const digests = [];

  for (const relativePath of [...new Set(relativePaths)]) {
    const filePath = resolveProjectFilePath(projectPath, relativePath);

    if (!fs.existsSync(filePath)) {
      digests.push({
        path: relativePath,
        digest: null,
      });
      continue;
    }

    digests.push({
      path: relativePath,
      digest: computeContentDigest(fs.readFileSync(filePath, 'utf8')),
    });
  }

  return digests;
}

function restoreFileContents(projectPath, fileContents) {
  for (const [relativePath, content] of fileContents.entries()) {
    const filePath = resolveProjectFilePath(projectPath, relativePath);

    if (content === null) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
      }
      continue;
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
}

function buildUnifiedDiff(relativePath, beforeContent, afterContent) {
  if ((beforeContent || '') === (afterContent || '')) {
    return '';
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-live-mutation-'));
  const beforePath = path.join(tempDir, 'before');
  const afterPath = path.join(tempDir, 'after');

  fs.writeFileSync(beforePath, beforeContent || '', 'utf8');
  fs.writeFileSync(afterPath, afterContent || '', 'utf8');

  try {
    let diffOutput = '';

    try {
      diffOutput = execFileSync(
        'git',
        ['diff', '--no-index', '--no-ext-diff', '--', beforePath, afterPath],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
    } catch (error) {
      if (error.status !== 1) {
        throw error;
      }

      diffOutput = String(error.stdout || '');
    }

    return diffOutput
      .replaceAll(beforePath, `a/${relativePath}`)
      .replaceAll(afterPath, `b/${relativePath}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function buildCombinedDiff(relativePaths, beforeContents, afterContents) {
  return relativePaths
    .map((relativePath) =>
      buildUnifiedDiff(
        relativePath,
        beforeContents.get(relativePath) || '',
        afterContents.get(relativePath) || '',
      ),
    )
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  buildCombinedDiff,
  buildUnifiedDiff,
  captureFileContents,
  captureFileDigests,
  computeContentDigest,
  resolveProjectFilePath,
  restoreFileContents,
};
