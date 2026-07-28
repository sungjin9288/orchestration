import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getOpsSupervisionTarget,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ui-slice-702-ops-supervision-preview-smoke';

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
  'function renderOpsSupervisionPreview',
);
const renderEnd = appSource.indexOf(
  'function renderSpecialistBatchPreview',
  renderStart,
);
assert.ok(renderStart >= 0 && renderEnd > renderStart);
const renderSource = appSource.slice(renderStart, renderEnd);

const digest = 'a'.repeat(64);
const executionPlan = {
  id: 'execution-plan-0001',
  workOrderIds: ['work-order-0001'],
};
const workOrderAttempt = {
  id: 'work-order-attempt-0001',
  executionPlanId: executionPlan.id,
  workOrderId: 'work-order-0001',
  status: 'active',
  recordDigest: digest,
};
assert.deepEqual(
  getOpsSupervisionTarget(
    'work-order-attempt',
    workOrderAttempt,
    executionPlan,
  ),
  {
    targetType: 'work-order-attempt',
    targetId: workOrderAttempt.id,
    parentId: executionPlan.id,
    expectedTargetRecordDigest: digest,
    expectedParentDigest: null,
  },
);
assert.equal(
  getOpsSupervisionTarget(
    'work-order-attempt',
    { ...workOrderAttempt, status: 'completed' },
    executionPlan,
  ),
  null,
);

const specialistBatch = {
  id: 'specialist-batch-0001',
  status: 'active',
  cellAttemptIds: ['specialist-cell-attempt-0001'],
  recordDigest: 'b'.repeat(64),
};
const firstAttempt = {
  id: 'specialist-cell-attempt-0001',
  specialistBatchId: specialistBatch.id,
  attemptNumber: 1,
  status: 'active',
  recordDigest: 'c'.repeat(64),
};
assert.equal(
  getOpsSupervisionTarget(
    'specialist-first-attempt',
    firstAttempt,
    specialistBatch,
  ).expectedParentDigest,
  specialistBatch.recordDigest,
);
assert.equal(
  getOpsSupervisionTarget(
    'specialist-first-attempt',
    firstAttempt,
    { ...specialistBatch, status: 'completed' },
  ),
  null,
);

const retry = {
  id: 'specialist-cell-retry-0001',
  retryCellAttemptId: 'specialist-cell-attempt-0002',
  status: 'active',
  recordDigest: 'd'.repeat(64),
};
const retryAttempt = {
  id: retry.retryCellAttemptId,
  attemptNumber: 2,
  status: 'active',
  recordDigest: 'e'.repeat(64),
};
assert.equal(
  getOpsSupervisionTarget(
    'specialist-retry-attempt',
    retryAttempt,
    retry,
  ).parentId,
  retry.id,
);
assert.equal(
  getOpsSupervisionTarget(
    'specialist-retry-attempt',
    { ...retryAttempt, attemptNumber: 3 },
    retry,
  ),
  null,
);

assert.match(appSource, /opsSupervisionPreview:\s*null/);
assert.match(
  appSource,
  /selectedMission\?\.status === 'draft' &&\s+selectedCouncilSession\?\.staffingEntryRef/,
);
assert.match(
  appSource,
  /function inspectOpsSupervision[\s\S]*state\.opsSupervisionPreview = null/,
);
assert.match(
  appSource,
  /computeExecutionPlanRecordDigest\(source\.parent\)/,
);
assert.match(
  appSource,
  /\/api\/ops\/supervision-preview\?\$\{query\}/,
);
assert.match(
  appSource,
  /payload\.targetRecordDigest !== request\.expectedTargetRecordDigest/,
);
assert.match(
  appSource,
  /data-action="inspect-ops-supervision"/,
);
assert.match(
  appSource,
  /renderOpsSupervisionButton\('work-order-attempt', attempt, executionPlan\)/,
);
assert.match(
  appSource,
  /renderOpsSupervisionButton\('specialist-first-attempt', cell, durableBatch\)/,
);
assert.match(
  appSource,
  /renderOpsSupervisionButton\('specialist-retry-attempt', retry\.specialistCellAttempt, retry\.specialistCellRetry\)/,
);
assert.match(
  appSource,
  /if \(Object\.prototype\.hasOwnProperty\.call\(payload, 'snapshot'\)\) \{\s*state\.opsSupervisionPreview = null/,
);
assert.match(
  appSource,
  /if \(state\.selectedTaskId !== taskId\) \{[\s\S]*state\.opsSupervisionPreview = null/,
);
assert.match(
  appSource,
  /if \(missionChanged\) \{[\s\S]*state\.opsSupervisionPreview = null/,
);
assert.match(
  appSource,
  /state\.councilSpecialistBatchPreview = null;\s*state\.opsSupervisionPreview = null;/,
);
assert.match(renderSource, /Active attempt evidence/);
assert.match(renderSource, /inspect only/);
assert.match(renderSource, /preview\.blockedActions/);
assert.doesNotMatch(
  renderSource,
  /data-action="(?:retry|resume|cancel|quarantine|settle|mark|execute|apply|commit|push|release)[^"]*"/,
);
assert.doesNotMatch(
  appSource,
  /localStorage\.(?:setItem|getItem)\([^)]*opsSupervision/i,
);

assert.match(
  serverSource,
  /OPS_SUPERVISION_QUERY_KEYS = Object\.freeze\(\[/,
);
assert.match(
  serverSource,
  /url\.pathname === '\/api\/ops\/supervision-preview'/,
);
assert.match(
  serverSource,
  /OPS_SUPERVISION_QUERY_KEYS\.some\([\s\S]*url\.searchParams\.getAll\(key\)\.length !== 1/,
);
assert.match(
  serverSource,
  /runtime\.getOpsSupervisionPreview\(/,
);
assert.match(runtimeSource, /function getOpsSupervisionPreview\(input\)/);
assert.match(runtimeSource, /store\.loadStateSupportedReadonly\(\)/);
assert.doesNotMatch(
  runtimeSource.slice(
    runtimeSource.indexOf('function getOpsSupervisionPreview'),
    runtimeSource.indexOf('function getExactResearchReadiness'),
  ),
  /store\.saveState\(/,
);

assert.match(
  styleSource,
  /\.ops-supervision-evidence\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.ops-supervision-evidence\s*\{[\s\S]*grid-template-columns: 1fr/,
);
assert.match(
  styleSource,
  /@media \(max-width: 720px\) \{[\s\S]*\.ops-supervision-action\s*\{[\s\S]*width: 100%/,
);
assert.match(
  styleSource,
  /\.ops-supervision-evidence dd\s*\{[\s\S]*overflow-wrap: anywhere/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: MODE,
      eligibility: {
        exactActiveWorkOrder: true,
        exactActiveFirstAttempt: true,
        exactActiveRetryAttempt: true,
        terminalOrMismatchedHidden: true,
      },
      browserMemory: {
        refreshInvalidation: true,
        targetInvalidation: true,
        inputInvalidation: true,
        failureClearsBeforeRequest: true,
        durableStorage: false,
      },
      authority: {
        inspectionOnly: true,
        recoveryControls: false,
        providerOrMutationControls: false,
      },
      responsive: {
        desktopEvidenceColumns: 2,
        mobileEvidenceColumns: 1,
        mobileActionWidth: 'full',
      },
    },
    null,
    2,
  )}\n`,
);
