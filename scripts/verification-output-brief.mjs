#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);

function readArgValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] ?? null;
}

function readInput() {
  const fileArg = readArgValue('--file');
  if (fileArg) {
    const absolutePath = path.isAbsolute(fileArg) ? fileArg : path.resolve(repoRoot, fileArg);
    return {
      source: 'file',
      sourcePath: absolutePath,
      text: fs.readFileSync(absolutePath, 'utf8'),
    };
  }

  const stdinText = fs.readFileSync(0, 'utf8');
  return {
    source: 'stdin',
    sourcePath: null,
    text: stdinText,
  };
}

function parsePositiveInteger(value, fallback) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const maxLines = parsePositiveInteger(readArgValue('--max-lines'), 12);
const maxChars = parsePositiveInteger(readArgValue('--max-chars'), 4000);
const input = readInput();

if (input.text.trim().length === 0) {
  console.error('verification-output-brief requires non-empty stdin or --file input.');
  process.exit(2);
}

const lines = input.text.replace(/\r\n/g, '\n').split('\n');
const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

const classifiers = [
  { type: 'fail', pattern: /\b(fail(?:ed|ure)?|error|exception|traceback|not ok|✖)\b/i },
  { type: 'warn', pattern: /\b(warn(?:ing)?|skipped|todo|flaky|deprecat(?:ed|ion))\b/i },
  { type: 'pass', pattern: /\b(pass(?:ed)?|ok|success|green|✓)\b/i },
  { type: 'command', pattern: /^\s*(node|npm|pnpm|yarn|python|pytest|git|cargo|go|make|uv|npx)\b/ },
];

function classifyLine(line) {
  const classifier = classifiers.find((candidate) => candidate.pattern.test(line));
  return classifier?.type ?? 'context';
}

const classifiedLines = nonEmptyLines.map((line, index) => ({
  lineNumber: index + 1,
  type: classifyLine(line),
  text: line.length > maxChars ? `${line.slice(0, maxChars)}...` : line,
}));

const countsByType = classifiedLines.reduce((accumulator, line) => {
  accumulator[line.type] = (accumulator[line.type] || 0) + 1;
  return accumulator;
}, {});

const priorityTypes = ['fail', 'warn', 'pass', 'command', 'context'];
const briefLines = [];

for (const type of priorityTypes) {
  for (const line of classifiedLines.filter((candidate) => candidate.type === type)) {
    if (briefLines.length >= maxLines) {
      break;
    }
    briefLines.push(line);
  }
  if (briefLines.length >= maxLines) {
    break;
  }
}

const payload = {
  ok: true,
  mode: 'verification-output-brief',
  referenceSignal: 'rtk',
  posture: 'explicit-local-output-brief',
  dependencyRequired: false,
  installsShellHooks: false,
  rewritesCommands: false,
  input: {
    source: input.source,
    sourcePath: input.sourcePath,
    lineCount: lines.length,
    nonEmptyLineCount: nonEmptyLines.length,
    charCount: input.text.length,
  },
  countsByType,
  truncated: briefLines.length < classifiedLines.length,
  briefLines,
};

console.log(JSON.stringify(payload, null, 2));
