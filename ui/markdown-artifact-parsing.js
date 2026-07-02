export function stripMarkdownBullet(line) {
  return String(line || '')
    .trim()
    .replace(/^[-*]\s+/, '')
    .trim();
}

export function parseMarkdownBullets(content) {
  return String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map(stripMarkdownBullet)
    .filter(Boolean);
}

export function parseMarkdownLines(content) {
  return String(content || '')
    .split('\n')
    .map((line) => stripMarkdownBullet(line))
    .filter(Boolean);
}

export function parseMarkdownSections(content) {
  const text = String(content || '');
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];

  if (matches.length === 0) {
    return null;
  }

  const sections = {};

  for (let index = 0; index < matches.length; index += 1) {
    const heading = matches[index][1].trim();
    const sectionStart = matches[index].index + matches[index][0].length;
    const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
    sections[heading] = text.slice(sectionStart, sectionEnd).trim();
  }

  return sections;
}

export function parseMarkdownKeyValueLines(content) {
  const result = {};

  for (const line of parseMarkdownBullets(content)) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function parseChangeSummaryFileUpdates(content) {
  const text = String(content || '').trim();

  if (!text) {
    return [];
  }

  const matches = [...text.matchAll(/^###\s+(.+)$/gm)];

  if (matches.length === 0) {
    return [];
  }

  return matches
    .map((match, index) => {
      const path = match[1]?.trim() || '';
      const sectionStart = match.index + match[0].length;
      const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
      const block = text.slice(sectionStart, sectionEnd).trim();
      const codeFenceMatch = block.match(/^```([^\n]*)\n[\s\S]*?\n```$/m);

      if (!path) {
        return null;
      }

      return {
        encoding: codeFenceMatch?.[1]?.trim() || null,
        path,
        payloadStored: block.length > 0,
      };
    })
    .filter(Boolean);
}

export function parseIntegerValue(value) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseYesNoValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'yes') {
    return true;
  }

  if (normalized === 'no') {
    return false;
  }

  return null;
}
