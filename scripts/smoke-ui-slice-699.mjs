import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  computeCanonicalDigest,
  getSpecialistBatchPreviewSummary,
  isSpecialistBatchPreviewSourceCurrent,
  parseSpecialistBatchList,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-699-specialist-batch-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');
const signalSource = fs.readFileSync(
  path.join(repoRoot, 'ui', 'council-signals.js'),
  'utf8',
);
const styleSource = fs.readFileSync(path.join(repoRoot, 'ui', 'styles.css'), 'utf8');
const serverSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);
const panelStart = appSource.indexOf('function renderSpecialistBatchPreview');
const panelEnd = appSource.indexOf(
  'function renderMissionWorkOrderCompileForm',
  panelStart,
);
assert.ok(panelStart >= 0 && panelEnd > panelStart);
const panelSource = appSource.slice(panelStart, panelEnd);

assert.match(appSource, /councilSpecialistBatchDraft:\s*\{/);
assert.match(appSource, /councilSpecialistBatchPreview:\s*null/);
assert.match(appSource, /data-form="specialist-batch-preview"/);
assert.match(appSource, /data-action="preview-specialist-batch"/);
assert.match(appSource, /state\.councilSpecialistBatchPreview = null/);
assert.match(appSource, /catch \(error\) \{\s*state\.councilSpecialistBatchPreview = null/s);
assert.match(appSource, /isSpecialistBatchPreviewSourceCurrent\(/);
assert.match(appSource, /if \(missionChanged\) \{\s*state\.councilSpecialistBatchPreview = null/s);
assert.match(panelSource, /Researcher · source evidence/);
assert.match(panelSource, /QA · node check plan/);
assert.match(panelSource, /response-only/);
assert.match(panelSource, /provider:0/);
assert.match(panelSource, /persist:\$\{durableBatch \? 'true' : 'false'\}/);
assert.match(panelSource, /data-action="retry-specialist-cell"/);
assert.doesNotMatch(
  panelSource,
  /data-action="(?:cancel|retry-all|execute|persist|apply|schedule)[^"]*"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*councilSpecialistBatch/,
);

assert.match(
  serverSource,
  /POST' && specialistBatchPreviewMatch/,
);
assert.match(
  serverSource,
  /readBoundedJsonBody\(request, 64 \* 1024\)/,
);
assert.match(
  serverSource,
  /generatedAt: new Date\(\)\.toISOString\(\),\s*specialistBatchPreview/s,
);
assert.doesNotMatch(
  serverSource,
  /method === 'GET' && specialistBatchPreviewMatch/,
);

assert.match(signalSource, /getSpecialistBatchPreviewSummary/);
assert.match(signalSource, /isSpecialistBatchPreviewSourceCurrent/);
assert.match(
  appSource,
  /parseSpecialistBatchList\(\s*draft\.researcherInputPaths,\s*\)/,
);
assert.deepEqual(parseSpecialistBatchList('README.md\nREADME.md'), [
  'README.md',
  'README.md',
]);
assert.match(
  styleSource,
  /\.specialist-contract-grid,\s*\.specialist-compile-grid\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.specialist-contract-grid,[\s\S]*grid-template-columns: 1fr/,
);
assert.match(styleSource, /\.specialist-contract-row\s*\{[\s\S]*min-width: 0/);
assert.match(styleSource, /overflow-wrap: anywhere/);

const synthesis = {
  id: 'synthesis-0001',
  recommendation: 'Keep the specialist preview response-only.',
};
const councilSession = {
  id: 'council-session-0001',
  missionId: 'mission-0001',
  sourceDigest: 'a'.repeat(64),
  currentAttemptId: 'attempt-0001',
  mode: 'real-local-stub',
  phase: 'terminal',
  status: 'approved',
  alignment: { status: 'approved' },
  attempts: [
    {
      id: 'attempt-0001',
      synthesis,
    },
  ],
};
const staffingPlan = {
  id: 'staffing-plan-0001',
  projectId: 'project-0001',
  recordDigest: 'b'.repeat(64),
  status: 'accepted',
};
const staffingEntry = {
  id: 'staffing-entry-0001',
  recordDigest: 'c'.repeat(64),
  status: 'bound',
};
const preview = {
  schemaVersion: 1,
  persisted: false,
  status: 'preview-ready',
  id: 'specialist-batch-preview-0123456789abcdef',
  previewDigest: 'd'.repeat(64),
  sourceDigest: 'e'.repeat(64),
  blueprintDigest: 'f'.repeat(64),
  councilSessionId: councilSession.id,
  councilSessionSourceDigest: councilSession.sourceDigest,
  councilSynthesisDigest: await computeCanonicalDigest(synthesis),
  currentAttemptId: councilSession.currentAttemptId,
  missionId: councilSession.missionId,
  projectId: staffingPlan.projectId,
  staffingPlanId: staffingPlan.id,
  staffingPlanRecordDigest: staffingPlan.recordDigest,
  staffingEntryId: staffingEntry.id,
  staffingEntryRecordDigest: staffingEntry.recordDigest,
  executionAllowed: false,
  persistenceAllowed: false,
  maxProviderCalls: 0,
  deadline: { deadlineAt: '2026-07-25T00:02:00.000Z' },
  cells: [{ cellId: 'research-source-evidence' }, { cellId: 'verify-plan-evidence' }],
  roleSourceDigests: [
    {
      agentProfileId: 'agent-researcher',
      ref: 'company/roles/researcher.md',
      sha256: '1'.repeat(64),
    },
    {
      agentProfileId: 'agent-qa',
      ref: 'company/roles/qa.md',
      sha256: '2'.repeat(64),
    },
  ],
};
const mission = {
  id: councilSession.missionId,
  projectId: staffingPlan.projectId,
  staffingEntryId: staffingEntry.id,
  councilSessionId: councilSession.id,
  status: 'aligned',
  linkedTaskId: null,
};
const companyRuntime = {
  status: 'ready',
  blueprintDigest: preview.blueprintDigest,
  roleSourceDigests: preview.roleSourceDigests.map(({ ref, sha256 }) => ({
    ref,
    sha256,
  })),
  councilSynthesisDigests: [
    {
      councilSessionId: councilSession.id,
      currentAttemptId: councilSession.currentAttemptId,
      sha256: preview.councilSynthesisDigest,
    },
  ],
};
const snapshot = {
  activeProjectId: staffingPlan.projectId,
  missions: { [mission.id]: mission },
  councilSessions: { [councilSession.id]: councilSession },
  staffingPlans: { [staffingPlan.id]: staffingPlan },
  staffingEntries: { [staffingEntry.id]: staffingEntry },
  executionPlans: {},
};

const summary = getSpecialistBatchPreviewSummary(
  preview,
  councilSession,
  staffingPlan,
  staffingEntry,
);
assert.equal(summary.previewId, preview.id);
assert.equal(summary.authorityClosed, true);
assert.equal(summary.cells.length, 2);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(snapshot, preview, companyRuntime),
  true,
);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(
    {
      ...snapshot,
      councilSessions: {
        [councilSession.id]: {
          ...councilSession,
          currentAttemptId: 'attempt-0002',
        },
      },
    },
    preview,
    companyRuntime,
  ),
  false,
);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(
    {
      ...snapshot,
      executionPlans: {
        'execution-plan-0001': {
          id: 'execution-plan-0001',
          missionId: mission.id,
          councilSessionId: councilSession.id,
        },
      },
    },
    preview,
    companyRuntime,
  ),
  false,
);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(snapshot, preview, {
    ...companyRuntime,
    blueprintDigest: '0'.repeat(64),
  }),
  false,
);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(snapshot, preview, {
    ...companyRuntime,
    councilSynthesisDigests: [
      {
        councilSessionId: councilSession.id,
        currentAttemptId: councilSession.currentAttemptId,
        sha256: '0'.repeat(64),
      },
    ],
  }),
  false,
);
assert.equal(
  isSpecialistBatchPreviewSourceCurrent(snapshot, preview, {
    ...companyRuntime,
    roleSourceDigests: companyRuntime.roleSourceDigests.map((entry) =>
      entry.ref === 'company/roles/qa.md'
        ? { ...entry, sha256: '0'.repeat(64) }
        : entry,
    ),
  }),
  false,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      lifecycle: {
        hardRefreshNull: true,
        sourceIdenticalRetention: true,
        selectionEditFailureAndDriftClear: true,
      },
      authority: {
        executionControls: 'separate-exact-first-attempt-only',
        persistenceControls: false,
        providerControls: false,
      },
      responsive: {
        desktopColumns: 2,
        mobileColumns: 1,
      },
    },
    null,
    2,
  )}\n`,
);
