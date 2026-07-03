'use strict';

const { normalizeRelativePath } = require('./paths');

function getMarkdownSection(content, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^## ${escapedHeading}\\n([\\s\\S]*?)(?=^## [^\\n]+\\n|(?![\\s\\S]))`,
    'm',
  );
  const match = String(content || '').match(pattern);

  return match ? match[1].trim() : '';
}

function parseMarkdownList(content, heading) {
  return [
    ...new Set(
      getMarkdownSection(content, heading)
        .split('\n')
        .map((line) => line.replace(/^[-*]\s+/, '').trim())
        .map((line) => normalizeRelativePath(line))
        .filter(Boolean),
    ),
  ];
}

function parseMarkdownKeyValueLines(content) {
  const result = {};

  for (const line of String(content || '').split('\n')) {
    const normalizedLine = line.replace(/^[-*]\s+/, '').trim();
    const separatorIndex = normalizedLine.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim().toLowerCase();
    const value = normalizedLine.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function parseYesNoValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'yes') {
    return true;
  }

  if (normalized === 'no') {
    return false;
  }

  return null;
}

module.exports = {
  getMarkdownSection,
  parseMarkdownKeyValueLines,
  parseMarkdownList,
  parseYesNoValue,
};
