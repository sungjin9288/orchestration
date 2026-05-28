#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const DEFAULT_MAX_LINES = 12;
const DEFAULT_MAX_CHARS = 4000;
const MAX_LINES_LIMIT = 200;
const MAX_CHARS_LIMIT = 20000;
const ALLOWED_FLAGS = ['--file', '--max-lines', '--max-chars'];
const ALLOWED_FLAG_SET = new Set(ALLOWED_FLAGS);

function validateArgs() {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    if (!ALLOWED_FLAG_SET.has(arg)) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    const value = args[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`${arg} requires a value`);
    }

    index += 1;
  }
}

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

function parsePositiveIntegerOption(name, fallback, upperBound) {
  const rawValue = readArgValue(name);

  if (rawValue === null) {
    return {
      source: 'default',
      value: fallback,
    };
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > upperBound) {
    throw new Error(`${name} must be an integer from 1 to ${upperBound}`);
  }

  return {
    source: name,
    value: parsed,
  };
}

let maxLinesOption = null;
let maxCharsOption = null;

try {
  validateArgs();
  maxLinesOption = parsePositiveIntegerOption('--max-lines', DEFAULT_MAX_LINES, MAX_LINES_LIMIT);
  maxCharsOption = parsePositiveIntegerOption('--max-chars', DEFAULT_MAX_CHARS, MAX_CHARS_LIMIT);
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'verification-output-brief',
        error: 'invalid-arguments',
        message: error.message,
        allowedFlags: ALLOWED_FLAGS,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

const limits = {
  maxLines: maxLinesOption.value,
  maxLinesSource: maxLinesOption.source,
  maxChars: maxCharsOption.value,
  maxCharsSource: maxCharsOption.source,
};

const maxLines = limits.maxLines;
const maxChars = limits.maxChars;
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
  limits,
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
