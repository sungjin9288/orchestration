'use strict';

const path = require('path');

function normalizeRelativePath(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');

  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    return null;
  }

  return normalized;
}

function resolveProjectFilePath(projectPath, relativePath) {
  const resolvedProjectPath = path.resolve(projectPath);
  const filePath = path.resolve(resolvedProjectPath, relativePath);

  if (filePath !== resolvedProjectPath && !filePath.startsWith(`${resolvedProjectPath}${path.sep}`)) {
    throw new Error(`Resolved file path escapes project_path: ${relativePath}`);
  }

  return filePath;
}

module.exports = {
  normalizeRelativePath,
  resolveProjectFilePath,
};
