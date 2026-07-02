'use strict';

const path = require('path');

function normalizeOptionalString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeRequiredString(value, fieldName) {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required`);
  }

  return normalizedValue;
}

function normalizeRequiredStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a non-empty array`);
  }

  const normalizedValues = value
    .map((item) => normalizeOptionalString(item))
    .filter(Boolean);

  if (normalizedValues.length === 0) {
    throw new Error(`${fieldName} must be a non-empty array`);
  }

  return [...new Set(normalizedValues)];
}

function normalizeRepoRelativePaths(value, fieldName) {
  const paths = normalizeRequiredStringArray(value, fieldName);

  for (const relativePath of paths) {
    if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes('..')) {
      throw new Error(`${fieldName} must contain repo-relative paths only`);
    }
  }

  return paths;
}

function normalizeIsoTimestamp(value, fieldName) {
  const timestamp = normalizeRequiredString(value, fieldName);
  const parsed = Date.parse(timestamp);

  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldName} must be an ISO timestamp`);
  }

  return new Date(parsed).toISOString();
}

module.exports = {
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeRequiredStringArray,
  normalizeRepoRelativePaths,
  normalizeIsoTimestamp,
};
