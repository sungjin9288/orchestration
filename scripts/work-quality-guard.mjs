#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'work-quality-guard' });

const sourceFiles = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const requiredAnchors = [
  {
    id: 'think-before-coding',
    description: 'Work must start from scoped planning or intake before edits.',
    patterns: [/propose a plan before multi-file edits/i, /Start non-trivial work with `\$repo-intake`/i],
  },
  {
    id: 'simplicity-first',
    description: 'The repo must prefer the smallest correct slice over broad expansion.',
    patterns: [/Prefer the simplest solution/i, /Choose the smallest vertical slice/i, /Prefer thin slices/i],
  },
  {
    id: 'surgical-changes',
    description: 'Architecture and workflow boundaries must not drift silently.',
    patterns: [/Do not silently change architecture/i, /do not silently change architecture/i],
  },
  {
    id: 'verification-required',
    description: 'Completion requires concrete verification evidence.',
    patterns: [
      /Never mark work complete without verification/i,
      /Run whatever validation is practical/i,
      /Finish with `\$verify-gate`/i,
      /verification evidence recorded/i,
    ],
  },
  {
    id: 'local-ops-boundary',
    description: 'The project stays local-first, single-user-first, and ops-first.',
    patterns: [/local-first\s*\/\s*single-user-first\s*\/\s*ops-first/i, /local-first, single-user-first, ops-first/i],
  },
  {
    id: 'review-before-done',
    description: 'Review remains a required completion gate.',
    patterns: [/review before done/i, /Review is a required gate before/i],
  },
];

function readSourceFiles() {
  return sourceFiles.map((relativePath) => {
    const absolutePath = path.join(repoRoot, relativePath);
    return {
      path: relativePath,
      exists: fs.existsSync(absolutePath),
      text: fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '',
    };
  });
}

function findAnchorEvidence(files, anchor) {
  const evidence = [];

  for (const file of files) {
    if (!file.exists) {
      continue;
    }

    for (const pattern of anchor.patterns) {
      const match = file.text.match(pattern);
      if (match) {
        evidence.push({
          path: file.path,
          match: match[0],
        });
        break;
      }
    }
  }

  return evidence;
}

const files = readSourceFiles();
const missingFiles = files.filter((file) => !file.exists).map((file) => file.path);
const checks = requiredAnchors.map((anchor) => {
  const evidence = findAnchorEvidence(files, anchor);
  return {
    id: anchor.id,
    description: anchor.description,
    ok: evidence.length > 0,
    evidence,
  };
});

const missingAnchors = checks.filter((check) => !check.ok).map((check) => check.id);
const ok = missingFiles.length === 0 && missingAnchors.length === 0;

const payload = {
  ok,
  mode: 'work-quality-guard',
  referenceSignal: 'andrej-karpathy-skills',
  posture: 'repo-native-guideline-guard',
  dependencyRequired: false,
  runtimeMutation: false,
  files: files.map((file) => ({
    path: file.path,
    exists: file.exists,
  })),
  checks,
  failures: {
    missingFiles,
    missingAnchors,
  },
};

console.log(JSON.stringify(payload, null, 2));

if (!ok) {
  process.exit(1);
}
