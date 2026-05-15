import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-v1-user-flow-kickoff');
const outputRoot = path.join(repoRoot, 'output', 'playwright', 'v1-user-flow-kickoff');
const expectedArtifacts = [
  'artifact-0005.md',
  'artifact-0006.patch',
  'artifact-0007.diff',
  'artifact-0008.md',
];
const expectedRuns = [
  'run-0005.jsonl',
  'run-0006.jsonl',
];
const expectedSurfaces = [
  'Mission',
  'Council',
  'Execution',
  'Deliverables',
  'Taskboard',
  'Logs',
  'Artifacts',
  'Decision Inbox',
];
const skipKickoffStatus = process.env.V1_KICKOFF_TRIAGE_SKIP_KICKOFF_STATUS === '1';

function runGitOrNull(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (_error) {
    return null;
  }
}

function parseAheadCount(branchLine) {
  const match = String(branchLine || '').match(/\[ahead (\d+)\]/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function readCurrentHead() {
  const branchLine = (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '';

  return {
    aheadCount: parseAheadCount(branchLine),
    branchLine,
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  };
}

function runNodeJson(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';

  let parsed = null;
  try {
    parsed = stdout ? JSON.parse(stdout) : null;
  } catch (_error) {
    parsed = null;
  }

  return {
    ok: result.status === 0 && parsed?.ok === true,
    parsed,
    script: relativeScriptPath,
    status: result.status,
    stderr: result.stderr?.trim() || '',
    stdout,
  };
}

function pathStatus(rootPath, relativePaths) {
  return relativePaths.map((relativePath) => ({
    exists: fs.existsSync(path.join(rootPath, relativePath)),
    path: path.relative(repoRoot, path.join(rootPath, relativePath)),
  }));
}

const skippedKickoffStatus = {
  currentHead: readCurrentHead(),
  kickoffReady: null,
  optionalApprovalActions: [],
  readinessCriteria: {
    mainPublished: readCurrentHead().aheadCount === 0,
    verificationOk: null,
  },
};
const kickoffStatusResult = skipKickoffStatus
  ? {
      ok: true,
      parsed: skippedKickoffStatus,
      script: 'scripts/v1-kickoff-status.mjs',
      status: 0,
      stderr: '',
      stdout: '',
    }
  : runNodeJson('scripts/v1-kickoff-status.mjs');
const kickoffStatus = kickoffStatusResult.parsed || {};
const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');
const artifactFiles = pathStatus(path.join(runtimeRoot, 'artifacts'), expectedArtifacts);
const runFiles = pathStatus(path.join(runtimeRoot, 'logs'), expectedRuns);
const outputFilesPresent =
  fs.existsSync(path.join(outputRoot, 'playwright-cli.json')) &&
  fs.existsSync(path.join(outputRoot, 'qa-slice-07-server-fetch-state.json'));
const cleanProofRecorded =
  /## Clean Published Kickoff Evidence/.test(runbook) &&
  /result: pass without `V1_KICKOFF_ALLOW_DIRTY`/.test(runbook) &&
  expectedSurfaces.every((surface) => runbook.includes(surface)) &&
  /The first v1 user-flow kickoff slice has now been verified on clean\/published `main`/.test(handoff);
const evidenceFilesPresent =
  artifactFiles.every((entry) => entry.exists) &&
  runFiles.every((entry) => entry.exists) &&
  outputFilesPresent;
const implementationIssueCandidates = [];
const readyForIssueDrivenSlice =
  kickoffStatusResult.ok &&
  kickoffStatus.kickoffReady === true &&
  cleanProofRecorded &&
  evidenceFilesPresent;

const report = {
  ok: kickoffStatusResult.ok && cleanProofRecorded && evidenceFilesPresent,
  mode: 'v1-kickoff-evidence-triage',
  currentHead: kickoffStatus.currentHead || null,
  evidence: {
    artifactFiles,
    cleanPublishedProofRecorded: cleanProofRecorded,
    outputFilesPresent,
    outputRoot: path.relative(repoRoot, outputRoot),
    runFiles,
    runtimeRoot: path.relative(repoRoot, runtimeRoot),
    surfacesVerified: expectedSurfaces,
  },
  implementationGate: {
    detectedConcreteIssues: implementationIssueCandidates,
    nextImplementationRequiresConcreteIssue: true,
    readyForIssueDrivenSlice,
    recommendation: implementationIssueCandidates.length > 0
      ? 'open-a-narrow-fix-slice-for-the-highest-severity-issue'
      : 'do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue',
  },
  kickoffStatus: {
    kickoffReady: skipKickoffStatus ? null : kickoffStatus.kickoffReady === true,
    mainPublished: kickoffStatus.readinessCriteria?.mainPublished === true,
    optionalApprovalActions: kickoffStatus.optionalApprovalActions || [],
    skippedForAggregate: skipKickoffStatus,
    statusOk: kickoffStatusResult.ok,
    verificationOk: skipKickoffStatus ? null : kickoffStatus.readinessCriteria?.verificationOk === true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotCommit: true,
    doesNotCleanWorktrees: true,
    doesNotExecuteDogfood: true,
    doesNotMerge: true,
    doesNotMutateRuntime: true,
    doesNotPush: true,
    doesNotRelease: true,
  },
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
