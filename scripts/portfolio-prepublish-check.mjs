#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const packageZipRelativePath = '_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast.zip';
const packageDirRelativePath = '_portfolio_export/orchestration_portfolio_pack_2026-06-22_screencast';
const handoffRelativePath = 'docs/portfolio-share-handoff.md';

const requiredZipEntries = [
  'README.md',
  'docs/case-study.md',
  'docs/contribution-scope-note.md',
  'docs/external-share-verification-plan.md',
  'docs/portfolio-open-items-handoff.md',
  'docs/portfolio-share-copy-template.md',
  'docs/project-card.md',
  'docs/resume-bullets.md',
  'docs/interview-story.md',
  'docs/local-demo-checklist.md',
  'docs/live-provider-verification-note.md',
  'docs/public-demo-screencast-plan.md',
  'evidence/evidence_manifest.md',
  'evidence/screenshots/artifacts-surface.png',
  'evidence/screenshots/mission-surface.png',
  'evidence/screenshots/taskboard-surface.png',
  'output/playwright/public-demo-screencast-2026-06-22/orchestration-public-demo-2026-06-22.webm',
];

const forbiddenZipEntries = [
  '.env',
  '.git/',
  'node_modules/',
  'dist/',
  'build/',
  'src/',
  'app/',
  'backend/',
  'frontend/',
  'components/',
  'routes/',
  'services/',
  'models/',
  'utils/',
  'docs/portfolio-share-handoff.md',
];

const textFileExtensions = new Set([
  '.css',
  '.csv',
  '.html',
  '.js',
  '.json',
  '.jsonl',
  '.log',
  '.md',
  '.mjs',
  '.status',
  '.txt',
]);

const secretPatterns = [
  /sk-[A-Za-z0-9]{20,}/,
  /OPENAI_API_KEY\s*=/,
  /password\s*=/i,
  /token\s*=/i,
  /secret\s*=/i,
  /BEGIN (RSA|OPENSSH|PRIVATE) KEY/,
];

const honestyPatterns = [
  /production-ready/i,
  /enterprise/i,
  /99\.8/,
  /94\.2/,
  /정확도 95/,
  /요청당/,
  /상용 운영/,
  /엔터프라이즈/,
];

const honestyFiles = [
  'README.md',
  'DEV_LOG.md',
  'docs/portfolio-share-copy-template.md',
  'docs/portfolio-open-items-handoff.md',
  'docs/external-share-verification-plan.md',
  'docs/live-provider-verification-note.md',
  'docs/contribution-scope-note.md',
  'docs/project-card.md',
  'docs/resume-bullets.md',
  'docs/interview-story.md',
  'docs/case-study.md',
  'docs/roadmap.md',
  'docs/portfolio-share-handoff.md',
  'portfolio_manifest.md',
  'links.md',
];

function relativePath(absolutePath) {
  return path.relative(repoRoot, absolutePath);
}

function readText(relativeFilePath) {
  return fs.readFileSync(path.join(repoRoot, relativeFilePath), 'utf8');
}

function runCommand(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function sha256(relativeFilePath) {
  const result = runCommand('shasum', ['-a', '256', relativeFilePath]);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `failed to hash ${relativeFilePath}`);
  }

  return result.stdout.trim().split(/\s+/)[0];
}

function unzipListing(relativeFilePath) {
  const result = runCommand('unzip', ['-l', relativeFilePath]);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `failed to list ${relativeFilePath}`);
  }

  return result.stdout;
}

function expectedChecksumFromHandoff() {
  const handoff = readText(handoffRelativePath);
  const match = handoff.match(/SHA-256: `([a-f0-9]{64})`/);
  if (!match) {
    throw new Error(`missing SHA-256 in ${handoffRelativePath}`);
  }

  return match[1];
}

function walkFiles(rootDir) {
  const files = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function findPatternMatches(files, patterns) {
  const matches = [];

  for (const relativeFilePath of files) {
    const absolutePath = path.join(repoRoot, relativeFilePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        matches.push({ file: relativeFilePath, pattern: String(pattern) });
      }
    }
  }

  return matches;
}

function findSecretMatchesInPackage() {
  const packageDir = path.join(repoRoot, packageDirRelativePath);
  const textFiles = walkFiles(packageDir)
    .filter((absolutePath) => textFileExtensions.has(path.extname(absolutePath)))
    .map(relativePath);

  return findPatternMatches(textFiles, secretPatterns);
}

const checks = [];

function recordCheck(id, ok, details = {}) {
  checks.push({ id, ok, ...details });
}

try {
  const packageZipPath = path.join(repoRoot, packageZipRelativePath);
  const packageDirPath = path.join(repoRoot, packageDirRelativePath);

  recordCheck('package-zip-exists', fs.existsSync(packageZipPath), {
    path: packageZipRelativePath,
  });
  recordCheck('package-dir-exists', fs.existsSync(packageDirPath), {
    path: packageDirRelativePath,
  });

  const expectedChecksum = expectedChecksumFromHandoff();
  const actualChecksum = sha256(packageZipRelativePath);
  recordCheck('checksum-matches-handoff', actualChecksum === expectedChecksum, {
    expectedChecksum,
    actualChecksum,
  });

  const listing = unzipListing(packageZipRelativePath);
  const missingEntries = requiredZipEntries.filter((entry) => !listing.includes(entry));
  const forbiddenEntries = forbiddenZipEntries.filter((entry) => listing.includes(entry));
  recordCheck('required-zip-entries-present', missingEntries.length === 0, {
    missingEntries,
  });
  recordCheck('forbidden-zip-entries-absent', forbiddenEntries.length === 0, {
    forbiddenEntries,
  });

  const secretMatches = findSecretMatchesInPackage();
  recordCheck('package-secret-patterns-absent', secretMatches.length === 0, {
    matches: secretMatches,
  });

  const honestyMatches = findPatternMatches(honestyFiles, honestyPatterns);
  recordCheck('public-claim-patterns-absent', honestyMatches.length === 0, {
    matches: honestyMatches,
  });

  const failedChecks = checks.filter((check) => !check.ok);
  const result = {
    ok: failedChecks.length === 0,
    mode: 'portfolio-prepublish-check',
    package: {
      zip: packageZipRelativePath,
      directory: packageDirRelativePath,
      checksum: actualChecksum,
    },
    counts: {
      totalChecks: checks.length,
      passedChecks: checks.length - failedChecks.length,
      failedChecks: failedChecks.length,
    },
    checks,
    failures: failedChecks,
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'portfolio-prepublish-check',
        error: error instanceof Error ? error.message : String(error),
        checks,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
