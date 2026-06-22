#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const packageName = 'orchestration_portfolio_pack_2026-06-22_screencast';
const exportRootRelativePath = '_portfolio_export';
const packageDirRelativePath = `${exportRootRelativePath}/${packageName}`;
const packageZipRelativePath = `${exportRootRelativePath}/${packageName}.zip`;
const handoffRelativePath = 'docs/portfolio-share-handoff.md';

const fileEntries = [
  'README.md',
  'DEV_LOG.md',
  'links.md',
  'portfolio_manifest.md',
  'docs/case-study.md',
  'docs/contribution-scope-note.md',
  'docs/evidence-checklist.md',
  'docs/evidence-gallery.md',
  'docs/external-share-verification-plan.md',
  'docs/implementation-evidence.md',
  'docs/interview-story.md',
  'docs/live-provider-verification-note.md',
  'docs/local-demo-checklist.md',
  'docs/portfolio-open-items-handoff.md',
  'docs/portfolio-share-copy-template.md',
  'docs/project-card.md',
  'docs/public-demo-screencast-plan.md',
  'docs/readme-improvement.md',
  'docs/resume-bullets.md',
  'docs/roadmap.md',
  'docs/workflow-evidence.md',
  'evidence/evidence_manifest.md',
];

const directoryEntries = [
  'evidence/api-responses',
  'evidence/architecture',
  'evidence/cli-logs',
  'evidence/config-evidence',
  'evidence/output-artifacts',
  'evidence/screenshots',
  'evidence/state-transitions',
  'evidence/workflow-logs',
  'output/playwright/public-demo-screencast-2026-06-22',
];

function absolutePath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout;
}

function ensureSourceExists(relativePath) {
  if (!fs.existsSync(absolutePath(relativePath))) {
    throw new Error(`missing portfolio source: ${relativePath}`);
  }
}

function copyFileEntry(relativePath) {
  ensureSourceExists(relativePath);
  const sourcePath = absolutePath(relativePath);
  const targetPath = absolutePath(path.join(packageDirRelativePath, relativePath));
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);

  const sourceStat = fs.statSync(sourcePath);
  fs.utimesSync(targetPath, sourceStat.atime, sourceStat.mtime);
}

function copyDirectoryEntry(relativePath) {
  ensureSourceExists(relativePath);
  const targetPath = absolutePath(path.join(packageDirRelativePath, relativePath));
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(absolutePath(relativePath), targetPath, {
    recursive: true,
    preserveTimestamps: true,
  });
}

function sha256(relativePath) {
  return runCommand('shasum', ['-a', '256', relativePath]).trim().split(/\s+/)[0];
}

function zipSizeLabel(relativePath) {
  const output = runCommand('ls', ['-lh', relativePath]).trim();
  return output.split(/\s+/)[4];
}

function updateHandoff(checksum, sizeLabel) {
  const handoffPath = absolutePath(handoffRelativePath);
  const handoff = fs.readFileSync(handoffPath, 'utf8');
  const nextHandoff = handoff
    .replace(/- Size: `[^`]+` from `ls -lh`/, `- Size: \`${sizeLabel}\` from \`ls -lh\``)
    .replace(/- SHA-256: `[a-f0-9]{64}`/, `- SHA-256: \`${checksum}\``);

  if (!/- Size: `[^`]+` from `ls -lh`/.test(handoff)) {
    throw new Error(`missing package size in ${handoffRelativePath}`);
  }

  if (!/- SHA-256: `[a-f0-9]{64}`/.test(handoff)) {
    throw new Error(`missing package checksum in ${handoffRelativePath}`);
  }

  if (nextHandoff !== handoff) {
    fs.writeFileSync(handoffPath, nextHandoff);
  }

  return nextHandoff !== handoff;
}

function walkDirectories(rootDir) {
  const directories = [rootDir];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      directories.push(...walkDirectories(path.join(rootDir, entry.name)));
    }
  }

  return directories;
}

function normalizeGeneratedDirectoryTimestamps() {
  const fixedTimestamp = new Date('2026-06-22T00:00:00Z');
  const packageDir = absolutePath(packageDirRelativePath);

  for (const directory of walkDirectories(packageDir)) {
    fs.utimesSync(directory, fixedTimestamp, fixedTimestamp);
  }
}

try {
  if (process.argv.length > 2) {
    throw new Error('portfolio-rebuild-package does not accept CLI arguments');
  }

  for (const entry of [...fileEntries, ...directoryEntries]) {
    ensureSourceExists(entry);
  }

  fs.rmSync(absolutePath(packageDirRelativePath), { recursive: true, force: true });
  fs.rmSync(absolutePath(packageZipRelativePath), { force: true });
  fs.mkdirSync(absolutePath(packageDirRelativePath), { recursive: true });

  for (const entry of fileEntries) {
    copyFileEntry(entry);
  }

  for (const entry of directoryEntries) {
    copyDirectoryEntry(entry);
  }

  normalizeGeneratedDirectoryTimestamps();

  runCommand('zip', ['-Xqr', `${packageName}.zip`, packageName], {
    cwd: absolutePath(exportRootRelativePath),
  });
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'portfolio-rebuild-package',
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

try {
  const checksum = sha256(packageZipRelativePath);
  const sizeLabel = zipSizeLabel(packageZipRelativePath);
  const handoffUpdated = updateHandoff(checksum, sizeLabel);

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'portfolio-rebuild-package',
        package: {
          zip: packageZipRelativePath,
          directory: packageDirRelativePath,
          checksum,
          size: sizeLabel,
        },
        copied: {
          files: fileEntries.length,
          directories: directoryEntries.length,
        },
        handoff: {
          path: handoffRelativePath,
          updated: handoffUpdated,
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'portfolio-rebuild-package',
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
