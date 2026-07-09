#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const mode = 'portfolio-share-status';
const linksRelativePath = 'links.md';
const handoffRelativePath = 'docs/portfolio-share-handoff.md';
const liveNoteRelativePath = 'docs/live-provider-verification-note.md';
const localSharePageEnvVar = 'PORTFOLIO_LOCAL_SHARE_PAGE_DIR';
const localSharePageBundleManifestRelativePath =
  'dist/orchestration-portfolio-share-page-2026-06-22.manifest.json';
const localSharePageBundleZipFallbackRelativePath =
  'dist/orchestration-portfolio-share-page-2026-06-22.zip';
const localSharePageRequiredFiles = [
  'index.html',
  'README.md',
  'styles.css',
  'assets/orchestration_portfolio_pack_2026-06-22_screencast.zip',
  'assets/orchestration-public-demo-2026-06-22.webm',
  'assets/mission-surface.png',
  'assets/taskboard-surface.png',
  'assets/artifacts-surface.png',
];
const localSharePageTextFiles = ['index.html', 'README.md'];
const unsupportedClaimPattern =
  /production[-]ready|enterprise|상용[ \t]*운영|엔터프라이즈|99[.]8|94[.]2|정확도[ \t]*95|요청당|€0[.]0005/i;

requireNoCliArgs(process.argv.slice(2), { mode });

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    env: process.env,
  });
}

function runJsonCommand(command, args) {
  const result = runCommand(command, args);

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `${command} ${args.join(' ')} failed`);
  }

  return JSON.parse(result.stdout);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readAbsoluteText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function sha256File(filePath) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function readOptionalJson(filePath) {
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

function envVisibility() {
  const processEnv = {
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    OPENAI_RESPONSES_MODEL: Boolean(process.env.OPENAI_RESPONSES_MODEL),
    model: process.env.OPENAI_RESPONSES_MODEL ? '(set)' : '(unset)',
  };

  const launchctlKey = runCommand('launchctl', ['getenv', 'OPENAI_API_KEY']);
  const launchctlModel = runCommand('launchctl', ['getenv', 'OPENAI_RESPONSES_MODEL']);
  const launchctl = {
    OPENAI_API_KEY: launchctlKey.status === 0 && launchctlKey.stdout.trim().length > 0,
    OPENAI_RESPONSES_MODEL: launchctlModel.status === 0 && launchctlModel.stdout.trim().length > 0,
    model: launchctlModel.status === 0 && launchctlModel.stdout.trim().length > 0 ? '(set)' : '(unset)',
  };

  return { processEnv, launchctl };
}

function currentHead() {
  const result = runCommand('git', ['rev-parse', '--short', 'HEAD']);
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'failed to read current git head');
  }

  return `main@${result.stdout.trim()}`;
}

function linkState() {
  const links = readText(linksRelativePath);
  const githubLine = links.match(/^- GitHub:\s*`([^`]+)`\s*—\s*(.+)$/m);
  const githubUrl = githubLine?.[1] ?? null;
  const githubEvidence = githubLine?.[2] ?? '';
  const sourceRepositoryAccessVerified =
    /reviewer 접근 검증됨/.test(githubEvidence) &&
    /HTTP 200/.test(githubEvidence) &&
    /private:\s*false/.test(githubEvidence) &&
    /visibility:\s*public/.test(githubEvidence);
  const demoNone = /^- Demo:\s*없음$/m.test(links);
  const videoNone = /^- 영상 시연:\s*없음/m.test(links);
  const shareLinkLines = links
    .split('\n')
    .filter((line) => /^- (영상 시연|기타 참고 링크):/.test(line));
  const verifiedEvidencePackageUrlRecorded = shareLinkLines.some((line) => {
    if (/없음/.test(line)) {
      return false;
    }

    return /(checksum|SHA-256|reviewer-equivalent|access verified|접근 검증)/i.test(line);
  });

  return {
    path: linksRelativePath,
    demoNone,
    videoNone,
    sourceRepository: {
      url: githubUrl,
      accessVerified: sourceRepositoryAccessVerified,
      state: sourceRepositoryAccessVerified
        ? 'source-repository-access-verified'
        : 'source-repository-access-unverified',
    },
    evidencePackage: {
      verifiedExternalUrlRecorded: verifiedEvidencePackageUrlRecorded,
      state: verifiedEvidencePackageUrlRecorded
        ? 'evidence-package-share-url-recorded'
        : 'evidence-package-share-url-not-recorded',
    },
  };
}

function liveEvidenceState() {
  const note = readText(liveNoteRelativePath);
  const resultMatch = note.match(/- Current result: `([^`]+)`/);
  const headMatch = note.match(/- Latest rerun head: `([^`]+)`/);

  return {
    path: liveNoteRelativePath,
    currentResult: resultMatch?.[1] ?? 'unknown',
    latestRerunHead: headMatch?.[1] ?? 'unknown',
  };
}

function expectedLocalSharePageBundleChecksumFromHandoff() {
  const handoff = readText(handoffRelativePath);
  const match = handoff.match(/generated static-site zip SHA-256 was `([a-f0-9]{64})`/);
  return match?.[1] ?? null;
}

function gitStateForPath(directory) {
  const gitRoot = runCommand('git', ['rev-parse', '--show-toplevel'], { cwd: directory });

  if (gitRoot.status !== 0) {
    return {
      isGitRepo: false,
      head: null,
      status: null,
      remotes: [],
    };
  }

  const head = runCommand('git', ['log', '-1', '--oneline'], { cwd: directory });
  const status = runCommand('git', ['status', '--short', '--branch'], { cwd: directory });
  const remotes = runCommand('git', ['remote', '-v'], { cwd: directory });

  return {
    isGitRepo: true,
    root: gitRoot.stdout.trim(),
    head: head.status === 0 ? head.stdout.trim() : null,
    status: status.status === 0 ? status.stdout.trim().split('\n').filter(Boolean) : [],
    remotes: remotes.status === 0 ? remotes.stdout.trim().split('\n').filter(Boolean) : [],
  };
}

function localSharePageBundleState(localSharePagePath, expectedPackageChecksum, expectedBundleChecksum) {
  const manifestPath = path.join(localSharePagePath, localSharePageBundleManifestRelativePath);
  const manifestResult = readOptionalJson(manifestPath);
  const manifest = manifestResult.value;
  const manifestZipRelativePath =
    typeof manifest?.zip === 'string' && manifest.zip.length > 0
      ? manifest.zip
      : localSharePageBundleZipFallbackRelativePath;
  const zipPath = path.join(localSharePagePath, manifestZipRelativePath);
  const zipExists = fs.existsSync(zipPath) && fs.statSync(zipPath).isFile();
  const zipChecksum = zipExists ? sha256File(zipPath) : null;
  const zipChecksumMatchesManifest =
    Boolean(manifest?.zipSha256) &&
    Boolean(zipChecksum) &&
    manifest.zipSha256 === zipChecksum;
  const zipChecksumMatchesHandoff =
    Boolean(expectedBundleChecksum) &&
    Boolean(zipChecksum) &&
    zipChecksum === expectedBundleChecksum;
  const evidencePackageChecksumMatches =
    manifest?.evidencePackage?.sha256 === expectedPackageChecksum &&
    manifest?.evidencePackage?.checksumMatchesHandoff === true;
  const deterministicPackaging = manifest?.deterministicPackaging ?? null;
  const deterministicPackagingOk =
    deterministicPackaging?.timestamp === '2026-06-22T00:00:00.000Z' &&
    Array.isArray(deterministicPackaging?.zipOptions) &&
    deterministicPackaging.zipOptions.includes('-X') &&
    Array.isArray(deterministicPackaging?.entryOrder) &&
    localSharePageRequiredFiles.every((relativePath) =>
      deterministicPackaging.entryOrder.includes(relativePath),
    );
  const manifestRequiredFiles = Array.isArray(manifest?.requiredFiles) ? manifest.requiredFiles : [];
  const missingManifestRequiredFiles = localSharePageRequiredFiles.filter(
    (relativePath) => !manifestRequiredFiles.includes(relativePath),
  );
  const ok =
    manifestResult.exists &&
    !manifestResult.error &&
    zipExists &&
    zipChecksumMatchesManifest &&
    zipChecksumMatchesHandoff &&
    evidencePackageChecksumMatches &&
    deterministicPackagingOk &&
    missingManifestRequiredFiles.length === 0;

  return {
    state: ok ? 'local-share-page-bundle-ready' : 'local-share-page-bundle-needs-attention',
    ok,
    manifest: {
      path: localSharePageBundleManifestRelativePath,
      exists: manifestResult.exists,
      parseError: manifestResult.error,
      zipSha256: manifest?.zipSha256 ?? null,
    },
    zip: {
      path: manifestZipRelativePath,
      exists: zipExists,
      sha256: zipChecksum,
      checksumMatchesManifest: zipChecksumMatchesManifest,
      checksumMatchesHandoff: zipChecksumMatchesHandoff,
      expectedHandoffSha256: expectedBundleChecksum,
    },
    evidencePackage: {
      checksumMatchesHandoff: evidencePackageChecksumMatches,
      sha256: manifest?.evidencePackage?.sha256 ?? null,
    },
    deterministicPackaging: {
      ok: deterministicPackagingOk,
      timestamp: deterministicPackaging?.timestamp ?? null,
      zipOptions: deterministicPackaging?.zipOptions ?? [],
      missingEntryOrderFiles: localSharePageRequiredFiles.filter(
        (relativePath) => !deterministicPackaging?.entryOrder?.includes(relativePath),
      ),
    },
    requiredFiles: {
      missingFromManifest: missingManifestRequiredFiles,
    },
  };
}

function localSharePageState(expectedPackageChecksum, expectedBundleChecksum) {
  const configuredPath = process.env[localSharePageEnvVar];

  if (!configuredPath) {
    return {
      configured: false,
      envVar: localSharePageEnvVar,
      state: 'not-configured',
    };
  }

  const resolvedPath = path.resolve(repoRoot, configuredPath);
  const directoryExists = fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory();
  const missingFiles = directoryExists
    ? localSharePageRequiredFiles.filter((relativePath) => !fs.existsSync(path.join(resolvedPath, relativePath)))
    : localSharePageRequiredFiles;
  const packagePath = path.join(
    resolvedPath,
    'assets/orchestration_portfolio_pack_2026-06-22_screencast.zip',
  );
  const packageChecksum = fs.existsSync(packagePath) ? sha256File(packagePath) : null;
  const checksumMatches =
    Boolean(expectedPackageChecksum) &&
    Boolean(packageChecksum) &&
    packageChecksum === expectedPackageChecksum;
  const unsupportedClaimMatches = directoryExists
    ? localSharePageTextFiles.flatMap((relativePath) => {
        const filePath = path.join(resolvedPath, relativePath);

        if (!fs.existsSync(filePath)) {
          return [];
        }

        return readAbsoluteText(filePath)
          .split('\n')
          .flatMap((line, index) =>
            unsupportedClaimPattern.test(line)
              ? [{ path: relativePath, line: index + 1, text: line.trim() }]
              : [],
          );
      })
    : [];
  const git = directoryExists ? gitStateForPath(resolvedPath) : null;
  const bundle = directoryExists
    ? localSharePageBundleState(resolvedPath, expectedPackageChecksum, expectedBundleChecksum)
    : {
        state: 'local-share-page-bundle-not-checkable',
        ok: false,
      };
  const ok =
    directoryExists &&
    missingFiles.length === 0 &&
    checksumMatches &&
    unsupportedClaimMatches.length === 0;

  return {
    configured: true,
    envVar: localSharePageEnvVar,
    path: resolvedPath,
    state: ok ? 'local-share-page-ready' : 'local-share-page-needs-attention',
    ok,
    directoryExists,
    requiredFiles: {
      total: localSharePageRequiredFiles.length,
      missing: missingFiles,
    },
    package: {
      checksum: packageChecksum,
      checksumMatches,
    },
    unsupportedClaimCheck: {
      ok: unsupportedClaimMatches.length === 0,
      matches: unsupportedClaimMatches,
    },
    bundle,
    git,
  };
}

try {
  const prepublish = runJsonCommand('node', ['scripts/portfolio-prepublish-check.mjs']);
  const expectedLocalSharePageBundleChecksum = expectedLocalSharePageBundleChecksumFromHandoff();
  const env = envVisibility();
  const links = linkState();
  const liveEvidence = liveEvidenceState();
  const localSharePage = localSharePageState(
    prepublish.package?.checksum ?? null,
    expectedLocalSharePageBundleChecksum,
  );
  const hasConfiguredEnv =
    env.processEnv.OPENAI_API_KEY &&
    env.processEnv.OPENAI_RESPONSES_MODEL;

  const blockers = [];

  if (!links.sourceRepository.accessVerified) {
    blockers.push({
      id: 'source-repository-access-unverified',
      owner: 'human',
      reason: 'The GitHub repository URL in links.md is not yet recorded as reviewer-access verified.',
      nextAction: 'Make the repository reviewer-accessible, verify anonymous access, and record the result in links.md.',
    });
  }

  if (!hasConfiguredEnv) {
    blockers.push({
      id: 'configured-env-live-smoke-not-runnable',
      owner: 'environment',
      reason: 'OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are not both visible in the current process.',
      nextAction: 'Expose both required OpenAI env values to the current execution context, then rerun the optional live smoke set.',
    });
  }

  if (localSharePage.configured && !localSharePage.ok) {
    blockers.push({
      id: 'local-share-page-needs-attention',
      owner: 'local-artifact',
      reason: 'PORTFOLIO_LOCAL_SHARE_PAGE_DIR is configured, but the local static share page is incomplete or does not match the current package checksum.',
      nextAction: 'Regenerate or update the local share page assets, then rerun portfolio-share-status with the same env var.',
    });
  }

  if (localSharePage.configured && localSharePage.ok && !localSharePage.bundle?.ok) {
    blockers.push({
      id: 'local-share-page-bundle-needs-attention',
      owner: 'local-artifact',
      reason: 'The local static share page is source-ready, but its generated dist manifest or zip is missing, stale, or not checksum-aligned.',
      nextAction: 'Run the local share page build script, then rerun portfolio-share-status with PORTFOLIO_LOCAL_SHARE_PAGE_DIR.',
    });
  }

  const result = {
    ok: true,
    mode,
    currentHead: currentHead(),
    package: {
      ok: prepublish.ok,
      checksum: prepublish.package?.checksum ?? null,
      zip: prepublish.package?.zip ?? null,
      directory: prepublish.package?.directory ?? null,
      failedChecks: prepublish.failures ?? [],
    },
    externalShare: links,
    localSharePage,
    optionalLiveProvider: {
      envVisibility: env,
      configuredEnvVisible: hasConfiguredEnv,
      evidence: liveEvidence,
    },
    readiness: {
      packagePrepublishReady: Boolean(prepublish.ok),
      sourceRepositoryAccessReady: links.sourceRepository.accessVerified,
      evidencePackageShareReady: links.evidencePackage.verifiedExternalUrlRecorded,
      externalShareReady: links.evidencePackage.verifiedExternalUrlRecorded,
      localSharePageReady: Boolean(localSharePage.configured && localSharePage.ok),
      localSharePageBundleReady: Boolean(localSharePage.configured && localSharePage.bundle?.ok),
      configuredEnvLiveReady: hasConfiguredEnv && liveEvidence.currentResult === 'pass',
      openBlockers: blockers,
      optionalFollowUps: links.evidencePackage.verifiedExternalUrlRecorded
        ? []
        : [
            {
              id: 'evidence-package-share-url-not-recorded',
              owner: 'human',
              reason:
                'GitHub source access is verified, but the screencast evidence package still has no reviewer-facing download URL.',
              nextAction:
                'If the evidence package should be shared externally, upload it, verify reviewer access and checksum, then record the URL in links.md.',
            },
          ],
    },
  };

  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
