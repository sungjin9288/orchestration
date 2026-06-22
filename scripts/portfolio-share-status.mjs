#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const mode = 'portfolio-share-status';
const linksRelativePath = 'links.md';
const liveNoteRelativePath = 'docs/live-provider-verification-note.md';

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
  const hasVerifiedUrl = /access verified:\s*\d{4}-\d{2}-\d{2}/.test(links);
  const demoNone = /^- Demo:\s*없음$/m.test(links);
  const videoNone = /^- 영상 시연:\s*없음/m.test(links);

  return {
    path: linksRelativePath,
    hasVerifiedUrl,
    demoNone,
    videoNone,
    state: hasVerifiedUrl ? 'verified-url-recorded' : 'no-verified-url-recorded',
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

try {
  const prepublish = runJsonCommand('node', ['scripts/portfolio-prepublish-check.mjs']);
  const env = envVisibility();
  const links = linkState();
  const liveEvidence = liveEvidenceState();
  const hasConfiguredEnv =
    env.processEnv.OPENAI_API_KEY &&
    env.processEnv.OPENAI_RESPONSES_MODEL;

  const blockers = [];

  if (!links.hasVerifiedUrl) {
    blockers.push({
      id: 'external-share-target-unverified',
      owner: 'human',
      reason: 'No reviewer-equivalent external package URL is recorded in links.md.',
      nextAction: 'Select a share target, upload the package, verify reviewer access, and record the verified URL with checksum match.',
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
    optionalLiveProvider: {
      envVisibility: env,
      configuredEnvVisible: hasConfiguredEnv,
      evidence: liveEvidence,
    },
    readiness: {
      packagePrepublishReady: Boolean(prepublish.ok),
      externalShareReady: links.hasVerifiedUrl,
      configuredEnvLiveReady: hasConfiguredEnv && liveEvidence.currentResult === 'pass',
      openBlockers: blockers,
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
