'use strict';

const fs = require('fs');
const path = require('path');

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:\//.test(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function resolveProjectFilePath(projectPath, relativePath) {
  const resolvedProjectPath = fs.realpathSync(path.resolve(projectPath));
  const filePath = path.resolve(resolvedProjectPath, relativePath);

  if (filePath !== resolvedProjectPath && !filePath.startsWith(`${resolvedProjectPath}${path.sep}`)) {
    throw new Error(`Resolved file path escapes project_path: ${relativePath}`);
  }

  // Lexical containment is not enough: a symlink at the target, or a symlinked
  // ancestor directory, would let fs read/write follow the link outside the
  // project. Resolve the real path of the deepest existing ancestor and
  // re-assert it stays inside the real project root. In-project symlinks (whose
  // real path stays inside) remain allowed; only escaping links are rejected.
  let existingPath = filePath;

  while (existingPath !== resolvedProjectPath && !fs.existsSync(existingPath)) {
    existingPath = path.dirname(existingPath);
  }

  const realExistingPath = fs.realpathSync(existingPath);

  if (
    realExistingPath !== resolvedProjectPath &&
    !realExistingPath.startsWith(`${resolvedProjectPath}${path.sep}`)
  ) {
    throw new Error(`Resolved file path escapes project_path: ${relativePath}`);
  }

  return filePath;
}

module.exports = {
  normalizeRelativePath,
  resolveProjectFilePath,
};
