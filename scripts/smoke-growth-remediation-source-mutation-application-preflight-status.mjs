import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applicationPreflightScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-application-preflight-status.mjs',
);

function runApplicationPreflightStatus(args = []) {
  const result = spawnSync(process.execPath, [applicationPreflightScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';
  let payload = null;

  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    payload,
    status: result.status,
    stderr,
    stdout,
  };
}

const result = runApplicationPreflightStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-application-preflight-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-application-preflight-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-application-preflight-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-application-preflight-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationRequestImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplicationPreflight, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationApplicationPreflight,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplicationPreflight, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplicationPreflight, true);
assert.equal(payload.sourceSummary.sourceMutationDraftNextDocumented, true);
assert.equal(payload.sourceSummary.currentAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.approvedRequestDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.expectedChangeSetDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandSetDocumented, true);
assert.equal(payload.sourceSummary.restorePlanDocumented, true);
assert.equal(payload.sourceSummary.rollbackPlanDocumented, true);
assert.equal(payload.sourceSummary.dryRunPlanDocumented, true);
assert.equal(payload.sourceSummary.mutationDraftDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightStates.includes(
    'application-preflight-review-ready',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightStates.includes(
    'application-preflight-ready-for-mutation-draft',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightStates.includes('needs-dry-run-plan'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightDecisionTypes.includes(
    'approve-source-mutation-draft-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightDecisionTypes.includes(
    'request-dry-run-plan',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightEvidenceTypes.includes(
    'source-mutation-authorization-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightEvidenceTypes.includes(
    'source-mutation-request-record',
  ),
);
assert.ok(payload.vocabulary.sourceMutationApplicationPreflightEvidenceTypes.includes('dry-run-plan'));
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightBlockerTypes.includes(
    'authorization-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightBlockerTypes.includes(
    'dry-run-plan-missing',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplicationPreflightBlockerTypes.includes(
    'application-preflight-scope-too-broad',
  ),
);

assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightRecord.required.includes(
    'applicationPreflightId',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightRecord.required.includes(
    'authorizationId',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightRecord.required.includes(
    'dryRunPlanRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightRecord.required.includes(
    'mutationDraftAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightBlocker.required.includes(
    'blocksMutationDraft',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightSchema.sourceMutationApplicationPreflightIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightRules.some(
    (rule) => rule.id === 'application-preflight-requires-current-authorization',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightRules.some(
    (rule) => rule.id === 'application-preflight-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightRules.some(
    (rule) => rule.id === 'application-preflight-requires-clean-baseline-and-target-lock',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightRules.some(
    (rule) =>
      rule.id === 'application-preflight-requires-change-verification-restore-and-rollback',
  ),
);
assert.ok(
  payload.sourceMutationApplicationPreflightRules.some(
    (rule) => rule.id === 'dirty-stale-or-broad-application-preflight-blocks-mutation-draft',
  ),
);

assert.equal(
  payload.sourceMutationApplicationPreflightState.realSourceMutationApplicationPreflightFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationApplicationPreflightState.discoveredSourceMutationApplicationPreflights,
  0,
);
assert.equal(payload.sourceMutationApplicationPreflightState.mutationDraftAllowed, false);
assert.equal(payload.sourceMutationApplicationPreflightState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplicationPreflightState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplicationPreflightState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplicationPreflightState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplicationPreflightState.currentStatus,
  'contract-only-no-active-source-mutation-application-preflight',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplicationPreflightRecordTypes, 4);
assert.equal(payload.readiness.currentAuthorizationRequired, true);
assert.equal(payload.readiness.approvedRequestRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.expectedChangeSetRequired, true);
assert.equal(payload.readiness.verificationCommandSetRequired, true);
assert.equal(payload.readiness.restorePlanRequired, true);
assert.equal(payload.readiness.rollbackPlanRequired, true);
assert.equal(payload.readiness.dryRunPlanRequired, true);
assert.equal(payload.readiness.applicationPreflightAndMutationSeparate, true);
assert.equal(payload.readiness.mutationDraftAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationDraftStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-draft-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-draft-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotMutateAcceptedRecords, true);
assert.equal(payload.safetyBoundary.doesNotMutateSource, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRollback, true);
assert.equal(payload.safetyBoundary.doesNotCreateRemediation, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRemediation, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runApplicationPreflightStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-application-preflight-status',
);
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Twenty-first Implemented Slice: `growth-remediation-source-mutation-application-preflight-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-application-preflight-status\.mjs/,
);
assert.match(plan, /dry-run plan/);
assert.match(plan, /mutation draft/);
assert.match(plan, /growth-remediation-source-mutation-draft-status/);
assert.match(
  harnessBaseline,
  /node scripts\/growth-remediation-source-mutation-application-preflight-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-draft-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-application-preflight-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-draft-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-application-preflight-status-readonly-post-m7-828/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplicationPreflightStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationApplicationPreflightRecordTypes:
          payload.readiness.sourceMutationApplicationPreflightRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
