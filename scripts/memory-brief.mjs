#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const DEFAULT_OPEN_TASK_PREVIEW_LIMIT = 10;
const DEFAULT_SEARCH_HIT_LIMIT = 20;
const MAX_ITEM_LIMIT = 100;
const ALLOWED_FLAGS = ['--query', '-q', '--max-items', '--limit'];
const ALLOWED_FLAG_SET = new Set(ALLOWED_FLAGS);

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'tasks/todo.md',
  'tasks/lessons.md',
];

function readSource(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  return {
    path: relativePath,
    exists: fs.existsSync(absolutePath),
    content: fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '',
  };
}

function countMatches(content, pattern) {
  return [...String(content || '').matchAll(pattern)].length;
}

function extractLatestAcceptedDecision(content) {
  const matches = [...String(content || '').matchAll(/^### (DEC-\d+)\n- Status: `Accepted`/gm)];
  return matches.length > 0 ? matches[matches.length - 1][1] : null;
}

function extractOpenTaskLines(content) {
  return String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ ]'));
}

function parseMaxItemsValue(optionName, rawValue) {
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > MAX_ITEM_LIMIT) {
    throw new Error(`${optionName} must be an integer from 1 to ${MAX_ITEM_LIMIT}`);
  }

  return {
    source: optionName,
    value: parsedValue,
  };
}

function readRequiredOptionValue(rawArgs, index, optionName) {
  const rawValue = rawArgs[index + 1];

  if (!rawValue || rawValue.startsWith('--') || ALLOWED_FLAG_SET.has(rawValue)) {
    throw new Error(`${optionName} requires a value`);
  }

  return String(rawValue).trim();
}

function parseCliOptions(rawArgs) {
  let query = '';
  let maxItemsOption = null;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const optionName = rawArgs[index];

    if (!optionName.startsWith('-')) {
      throw new Error(`Unexpected positional argument: ${optionName}`);
    }

    if (!ALLOWED_FLAG_SET.has(optionName)) {
      throw new Error(`Unknown argument: ${optionName}`);
    }

    const rawValue = readRequiredOptionValue(rawArgs, index, optionName);

    if (optionName === '--query' || optionName === '-q') {
      query = rawValue;
    } else {
      maxItemsOption = parseMaxItemsValue(optionName, rawValue);
    }

    index += 1;
  }

  return {
    query,
    maxItemsOption,
  };
}

function extractSearchHits(sources, searchTerm, limit) {
  if (!searchTerm) {
    return [];
  }

  const normalizedTerm = searchTerm.toLowerCase();
  const hits = [];

  for (const source of sources) {
    if (!source.exists) {
      continue;
    }

    const lines = source.content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];

      if (line.toLowerCase().includes(normalizedTerm)) {
        hits.push({
          path: source.path,
          line: index + 1,
          preview: line.trim().slice(0, 220),
        });
      }
    }
  }

  return hits.slice(0, limit);
}

let cliOptions = null;

try {
  cliOptions = parseCliOptions(args);
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'memory-brief',
        error: 'invalid-arguments',
        message: error.message,
        allowedFlags: ALLOWED_FLAGS,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const { query, maxItemsOption } = cliOptions;

const limits = {
  openTaskPreview: maxItemsOption?.value || DEFAULT_OPEN_TASK_PREVIEW_LIMIT,
  searchHits: maxItemsOption?.value || DEFAULT_SEARCH_HIT_LIMIT,
  source: maxItemsOption?.source || 'default',
};

const sources = SOURCE_FILES.map(readSource);
const sourceByPath = new Map(sources.map((source) => [source.path, source]));
const decisionLog = sourceByPath.get('docs/01_decision-log.md')?.content || '';
const todo = sourceByPath.get('tasks/todo.md')?.content || '';
const lessons = sourceByPath.get('tasks/lessons.md')?.content || '';

const summary = {
  mode: 'memory-brief',
  posture: 'local-read-only-preview',
  persistence: 'none',
  runtimeMutation: false,
  dependencyRequired: false,
  sourceCount: sources.length,
  availableSourceCount: sources.filter((source) => source.exists).length,
  limits,
  latestAcceptedDecision: extractLatestAcceptedDecision(decisionLog),
  acceptedDecisionCount: countMatches(decisionLog, /^- Status: `Accepted`/gm),
  lessonCount: countMatches(lessons, /^- /gm),
  openTaskCount: extractOpenTaskLines(todo).length,
};

const payload = {
  ok: true,
  ...summary,
  sources: sources.map((source) => ({
    path: source.path,
    exists: source.exists,
    bytes: Buffer.byteLength(source.content, 'utf8'),
  })),
  openTaskPreview: extractOpenTaskLines(todo).slice(0, limits.openTaskPreview),
  search: {
    query: query || null,
    hits: extractSearchHits(sources, query, limits.searchHits),
  },
};

console.log(JSON.stringify(payload, null, 2));
