#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const queryIndex = args.findIndex((arg) => arg === '--query' || arg === '-q');
const query = queryIndex >= 0 ? String(args[queryIndex + 1] || '').trim() : '';

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

function extractSearchHits(sources, searchTerm) {
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

  return hits.slice(0, 20);
}

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
  openTaskPreview: extractOpenTaskLines(todo).slice(0, 10),
  search: {
    query: query || null,
    hits: extractSearchHits(sources, query),
  },
};

console.log(JSON.stringify(payload, null, 2));
