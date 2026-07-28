import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getReviewerReworkPlanRecordRequest,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-704-durable-reviewer-rework-plan-smoke';

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
  'function renderReviewerReworkPlanPreview',
);
const renderEnd = appSource.indexOf(
  'function renderSpecialistBatchPreview',
  renderStart,
);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const renderSource = appSource.slice(renderStart, renderEnd);

const preview = {
  id: 'reviewer-rework-preview-1234567890abcdef',
  persisted: false,
  status: 'rework-review-required',
  executionPlanId: 'execution-plan-0001',
  reviewerWorkOrderId: 'work-order-reviewer',
  reviewerAttemptId: 'work-order-attempt-0003',
  reviewerRunId: 'run-0006',
  reviewArtifactId: 'artifact-0008',
  executionPlanDigest: 'a'.repeat(64),
  attemptRecordDigest: 'b'.repeat(64),
  evaluatedAt: '2026-07-28T00:00:00.000Z',
  previewDigest: 'c'.repeat(64),
};
const reviewedAt = '2026-07-28T00:01:00.000Z';
const request = getReviewerReworkPlanRecordRequest(preview, {
  rationale: '  Retain exact reviewed evidence.  ',
  reviewedAt,
});
assert.deepEqual(Object.keys(request), [
  'reviewerWorkOrderId',
  'reviewerAttemptId',
  'reviewerRunId',
  'reviewArtifactId',
  'expectedExecutionPlanDigest',
  'expectedAttemptRecordDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'recordApproval',
]);
assert.deepEqual(request.recordApproval, {
  decision: 'record-rework-plan',
  acknowledgement: 'record-exact-reviewer-rework-plan-without-execution',
  rationale: 'Retain exact reviewed evidence.',
  reviewedAt,
});
assert.equal(
  getReviewerReworkPlanRecordRequest(preview, {
    rationale: ' ',
    reviewedAt,
  }),
  null,
);
assert.equal(
  getReviewerReworkPlanRecordRequest(
    { ...preview, persisted: true },
    { rationale: 'Retain evidence.', reviewedAt },
  ),
  null,
);
assert.equal(
  getReviewerReworkPlanRecordRequest(preview, {
    rationale: 'Retain evidence.',
    reviewedAt: 'invalid',
  }),
  null,
);

assert.match(appSource, /reviewerReworkPlan:\s*null/);
assert.match(
  appSource,
  /function recordReviewerReworkPlan\(actionButton\)[\s\S]*state\.reviewerReworkPlan = null[\s\S]*\/rework-plans/,
);
assert.match(
  appSource,
  /getReviewerReworkPlanRecordRequest\(preview,\s*\{[\s\S]*rationale,[\s\S]*reviewedAt/,
);
assert.match(
  appSource,
  /fetchOptionalJson\([\s\S]*\/rework-plan/,
);
assert.match(
  appSource,
  /state\.reviewerReworkPlan = reworkPlanPayload\?\.reworkPlan \|\| null/,
);
assert.match(
  appSource,
  /data-form="record-reviewer-rework-plan"/,
);
assert.match(appSource, /name="reworkRationale"/);
assert.match(appSource, /maxlength="500"/);
assert.match(
  appSource,
  /data-action="record-reviewer-rework-plan"/,
);
assert.match(appSource, /Record rework plan/);
assert.match(appSource, /function renderReviewerReworkPlanRecord/);
assert.match(appSource, /data-rework-plan-id=/);
assert.match(renderSource, /createToken\(record\.status, 'warning'\)/);
assert.match(renderSource, /immutable evidence/);
assert.match(renderSource, /실행 권한은 포함하지 않습니다/);
assert.doesNotMatch(
  renderSource,
  /data-action="(?:approve-rework|start-rework|retry-rework|run-builder|run-reviewer|run-qa|commit|push|release)"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*reviewerRework/i,
);
assert.match(
  appSource,
  /if \(Object\.prototype\.hasOwnProperty\.call\(payload, 'snapshot'\)\) \{[\s\S]*state\.reviewerReworkPlan = null/,
);
assert.match(
  appSource,
  /if \(state\.selectedTaskId !== taskId\) \{[\s\S]*state\.reviewerReworkPlan = null/,
);
assert.match(
  appSource,
  /if \(missionChanged\) \{[\s\S]*state\.reviewerReworkPlan = null/,
);

assert.match(
  serverSource,
  /executionPlanReworkPlansMatch[\s\S]*readBoundedJsonBody\(request, 16 \* 1024\)/,
);
assert.match(
  serverSource,
  /runtime\.persistReviewerReworkPlan\(\{/,
);
assert.match(
  serverSource,
  /result\.idempotent \? 200 : 201/,
);
assert.match(
  serverSource,
  /executionPlanReworkPlanMatch[\s\S]*runtime\.getExecutionPlanReworkPlan/,
);
assert.match(
  serverSource,
  /reworkPlanInspectMatch[\s\S]*runtime\.getReworkPlan/,
);
assert.match(runtimeSource, /function persistReviewerReworkPlan\(input\)/);
assert.match(runtimeSource, /normalizeReworkPlanRequest\(input, \{ now \}\)/);
assert.match(
  runtimeSource,
  /buildReviewerReworkPlanPreviewFromState\([\s\S]*previewRequest,[\s\S]*now/,
);
assert.match(runtimeSource, /state\.reworkPlans\[id\] = reworkPlan/);
assert.match(runtimeSource, /delete snapshotForPublicProjection\.reworkPlans/);

assert.match(
  styleSource,
  /\.reviewer-rework-record-form\s*\{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto/,
);
assert.match(
  styleSource,
  /\.reviewer-rework-record\s*\{[\s\S]*min-width: 0/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.reviewer-rework-record-form\s*\{[\s\S]*grid-template-columns: 1fr/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.reviewer-rework-record-form \.primary-button\s*\{[\s\S]*width: 100%/,
);
assert.match(
  styleSource,
  /\.reviewer-rework-evidence dd\s*\{[\s\S]*overflow-wrap: anywhere/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      request: {
        exactBodyFields: Object.keys(request).length,
        explicitRationale: true,
        separateRecordApproval: true,
      },
      hydration: {
        genericSnapshotExcluded: true,
        currentChainLocator: true,
        staleBrowserSuccessCleared: true,
      },
      authority: {
        recordOnly: true,
        executionControls: false,
      },
      responsive: {
        desktopFormColumns: 2,
        mobileFormColumns: 1,
        mobileActionWidth: 'full',
      },
    },
    null,
    2,
  )}\n`,
);
