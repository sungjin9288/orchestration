import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getReviewerReworkPreviewTarget,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-703-reviewer-rework-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(path.join(repoRoot, 'ui/app.js'), 'utf8');
const styleSource = fs.readFileSync(path.join(repoRoot, 'ui/styles.css'), 'utf8');
const serverSource = fs.readFileSync(
  path.join(repoRoot, 'scripts/serve-ui-slice-01.mjs'),
  'utf8',
);
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src/runtime/runtime-service.js'),
  'utf8',
);
const renderStart = appSource.indexOf(
  'function renderReviewerReworkPreviewButton',
);
const renderEnd = appSource.indexOf(
  'function renderBuilderReworkSourceMutation',
  renderStart,
);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const renderSource = appSource.slice(renderStart, renderEnd);

const digest = 'a'.repeat(64);
const executionPlan = {
  id: 'execution-plan-0001',
  status: 'blocked',
  stopReason: 'reviewer-changes-requested',
  stoppedAt: 'reviewer',
  activeWorkOrderId: null,
  sourceDigest: 'b'.repeat(64),
};
const builder = {
  id: 'work-order-builder',
  role: 'builder',
  status: 'completed',
};
const reviewer = {
  id: 'work-order-reviewer',
  role: 'reviewer',
  status: 'changes-requested',
  completionRunId: 'run-reviewer',
  reviewArtifactId: 'artifact-review',
};
const qa = {
  id: 'work-order-qa',
  role: 'qa',
  status: 'blocked-dependency',
};
const reviewerAttempt = {
  id: 'work-order-attempt-reviewer',
  executionPlanId: executionPlan.id,
  workOrderId: reviewer.id,
  role: 'reviewer',
  action: 'run-reviewer',
  status: 'changes-requested',
  stopReason: 'reviewer-changes-requested',
  attemptNumber: 1,
  sourceDigest: executionPlan.sourceDigest,
  runRefs: [reviewer.completionRunId],
  artifactRefs: [reviewer.reviewArtifactId],
  recordDigest: digest,
};
const bundle = {
  executionPlan,
  workOrders: [builder, reviewer, qa],
  workOrderAttempts: [
    { id: 'attempt-builder', role: 'builder', action: 'start-builder' },
    reviewerAttempt,
  ],
  latestWorkOrderAttempt: reviewerAttempt,
};

assert.deepEqual(getReviewerReworkPreviewTarget(bundle), {
  executionPlanId: executionPlan.id,
  reviewerWorkOrderId: reviewer.id,
  reviewerAttemptId: reviewerAttempt.id,
  reviewerRunId: reviewer.completionRunId,
  reviewArtifactId: reviewer.reviewArtifactId,
  expectedAttemptRecordDigest: reviewerAttempt.recordDigest,
});
assert.equal(
  getReviewerReworkPreviewTarget({
    ...bundle,
    executionPlan: { ...executionPlan, status: 'reviewing' },
  }),
  null,
);
assert.equal(
  getReviewerReworkPreviewTarget({
    ...bundle,
    workOrderAttempts: [
      ...bundle.workOrderAttempts,
      { id: 'attempt-qa', role: 'qa', action: 'run-qa' },
    ],
  }),
  null,
);
assert.equal(
  getReviewerReworkPreviewTarget({
    ...bundle,
    latestWorkOrderAttempt: { ...reviewerAttempt, attemptNumber: 2 },
  }),
  null,
);
assert.equal(
  getReviewerReworkPreviewTarget({
    ...bundle,
    workOrders: [builder, { ...reviewer, status: 'completed' }, qa],
  }),
  null,
);

assert.match(appSource, /reviewerReworkPlanPreview:\s*null/);
assert.match(
  appSource,
  /function previewReviewerReworkPlan[\s\S]*state\.reviewerReworkPlanPreview = null/,
);
assert.match(
  appSource,
  /computeExecutionPlanRecordDigest\(\s*source\.bundle\.executionPlan/,
);
assert.match(
  appSource,
  /reviewer-rework-preview\?\$\{query\}/,
);
assert.match(
  appSource,
  /payload\.attemptRecordDigest !== request\.expectedAttemptRecordDigest/,
);
assert.match(
  appSource,
  /data-action="preview-reviewer-rework-plan"/,
);
assert.match(
  appSource,
  /renderReviewerReworkPreviewButton\(bundle, attempt\)/,
);
assert.match(
  appSource,
  /if \(Object\.prototype\.hasOwnProperty\.call\(payload, 'snapshot'\)\) \{[\s\S]*state\.reviewerReworkPlanPreview = null/,
);
assert.match(
  appSource,
  /if \(state\.selectedTaskId !== taskId\) \{[\s\S]*state\.reviewerReworkPlanPreview = null/,
);
assert.match(
  appSource,
  /if \(missionChanged\) \{[\s\S]*state\.reviewerReworkPlanPreview = null/,
);
assert.match(
  appSource,
  /if \(surface !== state\.surface\) \{\s*state\.reviewerReworkPlanPreview = null/,
);
assert.match(renderSource, /Reviewer rework plan/);
assert.match(renderSource, /response-only/);
assert.match(renderSource, /preview\.findings/);
assert.match(renderSource, /preview\.targetPathAllowlist/);
assert.match(renderSource, /preview\.verificationCommands/);
assert.match(renderSource, /preview\.blockedActions/);
assert.doesNotMatch(
  renderSource,
  /data-action="(?:retry|start-rework|run-builder|run-reviewer|run-qa|approve|commit|push|release)[^"]*"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*reviewerRework/i,
);

assert.match(
  serverSource,
  /REVIEWER_REWORK_QUERY_KEYS = Object\.freeze\(\[/,
);
assert.match(
  serverSource,
  /reviewer-rework-preview\$/,
);
assert.match(
  serverSource,
  /REVIEWER_REWORK_QUERY_KEYS\.some\([\s\S]*url\.searchParams\.getAll\(key\)\.length !== 1/,
);
assert.match(
  serverSource,
  /runtime\.getReviewerReworkPlanPreview\(/,
);
assert.match(runtimeSource, /function getReviewerReworkPlanPreview\(input\)/);
assert.match(runtimeSource, /store\.loadStateSupportedReadonly\(\)/);
const runtimeSlice = runtimeSource.slice(
  runtimeSource.indexOf('function getReviewerReworkPlanPreview'),
  runtimeSource.indexOf('function findReworkPlanCollision'),
);
assert.doesNotMatch(runtimeSlice, /store\.saveState\(/);
assert.doesNotMatch(runtimeSlice, /store\.loadState\(\)/);

assert.match(
  styleSource,
  /\.reviewer-rework-scope\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.reviewer-rework-evidence,[\s\S]*\.reviewer-rework-scope\s*\{[\s\S]*grid-template-columns: 1fr/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.reviewer-rework-preview-action\s*\{[\s\S]*width: 100%/,
);
assert.match(
  styleSource,
  /\.reviewer-rework-evidence dd\s*\{[\s\S]*overflow-wrap: anywhere/,
);
assert.match(
  styleSource,
  /\.reviewer-rework-scope code\s*\{[\s\S]*overflow-wrap: anywhere/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      eligibility: {
        exactReviewerStop: true,
        qaExecutedHidden: true,
        attemptTwoHidden: true,
        nonChangesRequestedHidden: true,
      },
      browserMemory: {
        refreshInvalidation: true,
        missionInvalidation: true,
        taskInvalidation: true,
        surfaceInvalidation: true,
        failureClearsBeforeRequest: true,
        durableStorage: false,
      },
      authority: {
        previewOnly: true,
        retryOrExecutionControls: false,
      },
      responsive: {
        desktopScopeColumns: 2,
        mobileScopeColumns: 1,
        mobileActionWidth: 'full',
      },
    },
    null,
    2,
  )}\n`,
);
