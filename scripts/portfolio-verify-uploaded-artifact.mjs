#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const mode = 'portfolio-verify-uploaded-artifact';
const handoffRelativePath = 'docs/portfolio-share-handoff.md';
const localSharePageEnvVar = 'PORTFOLIO_LOCAL_SHARE_PAGE_DIR';
const localSharePageManifestRelativePath =
  'dist/orchestration-portfolio-share-page-2026-06-22.manifest.json';
const supportedArtifacts = new Set(['auto', 'evidence-package', 'local-static-site-bundle']);

function printUsage() {
  console.log(`Usage:
  node scripts/portfolio-verify-uploaded-artifact.mjs --file <downloaded-file> [--artifact auto|evidence-package|local-static-site-bundle]

Purpose:
  Verify a reviewer-downloaded portfolio artifact against the current handoff checksums.

Notes:
  - This script does not upload files, fetch URLs, or verify account access.
  - Set ${localSharePageEnvVar}=<path-to-local-share-page> to prefer the generated static-site manifest checksum.
`);
}

function fail(message, details = {}, exitCode = 1) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode,
        message,
        ...details,
      },
      null,
      2,
    ),
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    artifact: 'auto',
    file: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    if (arg === '--file') {
      args.file = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--artifact') {
      args.artifact = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    fail('invalid-argument', { receivedArg: arg }, 2);
  }

  if (!args.file) {
    fail('missing-required-file-argument', { requiredArg: '--file <downloaded-file>' }, 2);
  }

  if (!supportedArtifacts.has(args.artifact)) {
    fail('unsupported-artifact', {
      artifact: args.artifact,
      supportedArtifacts: Array.from(supportedArtifacts),
    }, 2);
  }

  return args;
}

function sha256File(filePath) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, value: null, error: null };
  }

  try {
    return {
      exists: true,
      value: JSON.parse(fs.readFileSync(filePath, 'utf8')),
      error: null,
    };
  } catch (error) {
    return {
      exists: true,
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function evidencePackageCandidate() {
  const handoff = readText(handoffRelativePath);
  const match = handoff.match(/SHA-256: `([a-f0-9]{64})`/);

  if (!match) {
    fail('missing-evidence-package-checksum', { source: handoffRelativePath });
  }

  return {
    artifact: 'evidence-package',
    sha256: match[1],
    source: handoffRelativePath,
    confidence: 'source-of-truth',
  };
}

function localStaticSiteCandidates() {
  const candidates = [];
  const configuredPath = process.env[localSharePageEnvVar];

  if (configuredPath) {
    const manifestPath = path.join(
      path.resolve(repoRoot, configuredPath),
      localSharePageManifestRelativePath,
    );
    const manifest = readJsonIfExists(manifestPath);

    if (manifest.value?.zipSha256) {
      candidates.push({
        artifact: 'local-static-site-bundle',
        sha256: manifest.value.zipSha256,
        source: `${localSharePageEnvVar}:${localSharePageManifestRelativePath}`,
        confidence: 'generated-manifest',
      });
    } else if (manifest.exists) {
      candidates.push({
        artifact: 'local-static-site-bundle',
        sha256: null,
        source: `${localSharePageEnvVar}:${localSharePageManifestRelativePath}`,
        confidence: 'unusable-generated-manifest',
        error: manifest.error ?? 'manifest missing zipSha256',
      });
    }
  }

  const handoff = readText(handoffRelativePath);
  const handoffMatch = handoff.match(/generated static-site zip SHA-256 was `([a-f0-9]{64})`/);
  if (handoffMatch) {
    candidates.push({
      artifact: 'local-static-site-bundle',
      sha256: handoffMatch[1],
      source: handoffRelativePath,
      confidence: 'handoff-record',
    });
  }

  return candidates;
}

function expectedCandidates(requestedArtifact) {
  const candidates = [evidencePackageCandidate(), ...localStaticSiteCandidates()].filter(
    (candidate) => candidate.sha256,
  );

  if (requestedArtifact === 'auto') {
    return candidates;
  }

  return candidates.filter((candidate) => candidate.artifact === requestedArtifact);
}

function conflictingCandidatesForArtifact(candidates, artifact) {
  const artifactCandidates = candidates.filter((candidate) => candidate.artifact === artifact);
  const uniqueChecksums = new Set(artifactCandidates.map((candidate) => candidate.sha256));

  if (uniqueChecksums.size <= 1) {
    return null;
  }

  return {
    artifact,
    checksums: Array.from(uniqueChecksums),
    candidates: artifactCandidates,
  };
}

const args = parseArgs(process.argv.slice(2));
const filePath = path.resolve(repoRoot, args.file);

if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
  fail('downloaded-file-not-found', { file: filePath });
}

const actualSha256 = sha256File(filePath);
const candidates = expectedCandidates(args.artifact);
const localStaticSiteConflict = conflictingCandidatesForArtifact(candidates, 'local-static-site-bundle');

if (args.artifact === 'local-static-site-bundle' && localStaticSiteConflict) {
  fail('expected-checksum-source-mismatch', {
    requestedArtifact: args.artifact,
    file: filePath,
    actualSha256,
    conflict: localStaticSiteConflict,
    nextAction:
      'Regenerate the local static-site bundle or update docs/portfolio-share-handoff.md so the generated manifest checksum and handoff checksum match before verifying an uploaded static-site zip.',
  });
}

const matches = candidates.filter((candidate) => candidate.sha256 === actualSha256);

if (candidates.length === 0) {
  fail('no-expected-checksum-available', {
    requestedArtifact: args.artifact,
    env: {
      [localSharePageEnvVar]: process.env[localSharePageEnvVar] ? '(set)' : '(unset)',
    },
    nextAction:
      args.artifact === 'local-static-site-bundle'
        ? `Set ${localSharePageEnvVar}=<path-to-local-share-page> after generating the local static-site bundle, then rerun this verifier.`
        : `Run node scripts/portfolio-rebuild-package.mjs first, then rerun this verifier.`,
  });
}

if (matches.length === 0) {
  fail('checksum-mismatch', {
    requestedArtifact: args.artifact,
    file: filePath,
    actualSha256,
    expectedCandidates: candidates,
    nextAction:
      'Do not record the URL in links.md. Re-download the uploaded artifact from a reviewer-equivalent session and compare again, or upload the current package/bundle.',
  });
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode,
      requestedArtifact: args.artifact,
      matchedArtifact: matches[0].artifact,
      file: filePath,
      actualSha256,
      matchedExpectedChecksum: matches[0],
      expectedCandidates: candidates,
      nextAction:
        'After reviewer-equivalent access is confirmed, record the verified URL and checksum match in links.md.',
    },
    null,
    2,
  ),
);
