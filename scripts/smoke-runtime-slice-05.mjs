import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION, COMMIT_ACTION } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-slice-05');
const runtime = createRuntimeService({ runtimeRoot });

function buildPreflightContent(label) {
  return `# Builder Preflight: ${label}

## Target Files
- prompts/builder.md

## Intended Changes
- keep live mutation bounded to the latest approved preflight target

## Risks
- none

## Verification Plan
- validate approval and stale-target semantics in runtime guards

## Review Evidence Expectations
- latest preflight remains the anchor for live mutation approval

## Escalation Triggers
- escalate when approval target and latest preflight drift

## Input Summary
- runtime-slice-05 synthetic preflight fixture
`;
}

function createArtifact(taskId, type, label, summary = null) {
  const roleByType = {
    architecture: 'architect',
    breakdown: 'task-breaker',
    plan: 'planner',
    preflight: 'builder',
  };
  const role = roleByType[type] || 'smoke';
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type,
    content:
      type === 'preflight'
        ? buildPreflightContent(label)
        : `# ${type}: ${label}\n\n${label}\n`,
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function createBuilderProvenanceChain(taskId, label) {
  const plan = createArtifact(taskId, 'plan', `${label} plan`);
  const architecture = createArtifact(taskId, 'architecture', `${label} architecture`, {
    inputArtifactId: plan.artifact.id,
    inputRunId: plan.run.id,
  });
  const breakdown = createArtifact(taskId, 'breakdown', `${label} breakdown`, {
    architectureArtifactId: architecture.artifact.id,
    architectureRunId: architecture.run.id,
    inputArtifactIds: [plan.artifact.id, architecture.artifact.id],
    inputRunIds: [plan.run.id, architecture.run.id],
  });
  const preflight = createArtifact(taskId, 'preflight', `${label} preflight`, {
    planArtifactId: plan.artifact.id,
    planRunId: plan.run.id,
    architectureArtifactId: architecture.artifact.id,
    architectureRunId: architecture.run.id,
    breakdownArtifactId: breakdown.artifact.id,
    breakdownRunId: breakdown.run.id,
    inputArtifactIds: [plan.artifact.id, architecture.artifact.id, breakdown.artifact.id],
    inputRunIds: [plan.run.id, architecture.run.id, breakdown.run.id],
  });

  return {
    architecture,
    breakdown,
    plan,
    preflight,
  };
}

function createResolvedApproval(input) {
  const approval = runtime.createApprovalPlaceholder(input);

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: input.resolution,
    note: `${input.resolution} ${input.allowedNextAction}`,
  });

  return runtime.getApproval(approval.id);
}

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const guardSplitTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder guard split smoke',
  intent: 'Keep builder preflight and builder live mutation semantics separate.',
});

const splitPlan = createArtifact(guardSplitTask.id, 'plan', 'split plan');
const splitArchitecture = createArtifact(
  guardSplitTask.id,
  'architecture',
  'split architecture',
  {
    inputArtifactId: splitPlan.artifact.id,
    inputRunId: splitPlan.run.id,
  },
);
createArtifact(guardSplitTask.id, 'breakdown', 'split breakdown', {
  architectureArtifactId: splitArchitecture.artifact.id,
  architectureRunId: splitArchitecture.run.id,
  inputArtifactIds: [splitPlan.artifact.id, splitArchitecture.artifact.id],
  inputRunIds: [splitPlan.run.id, splitArchitecture.run.id],
});

const guardSplitSummary = runtime.getTaskGuardSummary(guardSplitTask.id);

assert.equal(guardSplitSummary.taskBreaker.allowed, true);
assert.equal(guardSplitSummary.builderPreflight.allowed, true);
assert.equal(guardSplitSummary.builderLiveMutation.allowed, false);
assert.match(
  guardSplitSummary.builderLiveMutation.reasons.join('; '),
  /latest preflight artifact required/i,
);

const liveApprovalTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder live approval semantics smoke',
  intent: 'Normalize pending, approved, rejected, and stale approvals against the latest preflight.',
});

const { preflight: preflightOne } = createBuilderProvenanceChain(liveApprovalTask.id, 'live approval one');
const pendingLiveApproval = runtime.createApprovalPlaceholder({
  taskId: liveApprovalTask.id,
  scope: 'builder',
  allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
  targetArtifactId: preflightOne.artifact.id,
  targetRunId: preflightOne.run.id,
  title: 'Approval required: builder live mutation',
});

const livePendingTask = runtime.getTask(liveApprovalTask.id);
const livePendingSummary = runtime.getTaskGuardSummary(liveApprovalTask.id).builderLiveMutation;

assert.equal(livePendingTask.flags.waitingApproval, true);
assert.equal(livePendingSummary.latestApprovalStatus, APPROVAL_STATUS.PENDING);
assert.equal(livePendingSummary.currentPreflightArtifactId, preflightOne.artifact.id);
assert.match(livePendingSummary.reasons.join('; '), /is pending/i);
assert.throws(
  () => runtime.assertTaskCanRunBuilderLiveMutation({ taskId: liveApprovalTask.id }),
  /is pending/i,
);

runtime.resolveDecisionInboxItem({
  itemId: pendingLiveApproval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject live mutation for preflight one.',
});

const liveRejectedTask = runtime.getTask(liveApprovalTask.id);
const liveRejectedSummary = runtime.getTaskGuardSummary(liveApprovalTask.id).builderLiveMutation;

assert.equal(liveRejectedTask.flags.waitingApproval, false);
assert.equal(liveRejectedSummary.latestApprovalStatus, APPROVAL_STATUS.REJECTED);
assert.equal(liveRejectedSummary.allowed, false);
assert.match(liveRejectedSummary.reasons.join('; '), /is rejected/i);

const approvedLiveApproval = createResolvedApproval({
  taskId: liveApprovalTask.id,
  scope: 'builder',
  allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
  targetArtifactId: preflightOne.artifact.id,
  targetRunId: preflightOne.run.id,
  title: 'Approval required: builder live mutation',
  resolution: APPROVAL_STATUS.APPROVED,
});
const liveApprovedSummary = runtime.getTaskGuardSummary(liveApprovalTask.id).builderLiveMutation;

assert.equal(liveApprovedSummary.allowed, true);
assert.equal(liveApprovedSummary.latestApprovalId, approvedLiveApproval.id);
assert.equal(
  runtime.assertTaskCanRunBuilderLiveMutation({ taskId: liveApprovalTask.id }).guardSummary.allowed,
  true,
);

const { preflight: preflightTwo } = createBuilderProvenanceChain(liveApprovalTask.id, 'live approval two');
const staleLiveSummary = runtime.getTaskGuardSummary(liveApprovalTask.id).builderLiveMutation;

assert.equal(staleLiveSummary.allowed, false);
assert.equal(staleLiveSummary.approvalStale, true);
assert.equal(staleLiveSummary.currentPreflightArtifactId, preflightTwo.artifact.id);
assert.equal(staleLiveSummary.targetPreflightArtifactId, preflightOne.artifact.id);
assert.match(staleLiveSummary.reasons.join('; '), /stale for preflight/i);
assert.throws(
  () => runtime.assertTaskCanRunBuilderLiveMutation({ taskId: liveApprovalTask.id }),
  /stale for preflight/i,
);

const commitTask = runtime.createTask({
  projectId: project.id,
  title: 'Commit approval latest-record smoke',
  intent: 'Apply the same latest-record and preflight-target rule to commit approval.',
});

const { preflight: commitPreflightOne } = createBuilderProvenanceChain(commitTask.id, 'commit approval one');
const pendingCommitApproval = runtime.createApprovalPlaceholder({
  taskId: commitTask.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  targetArtifactId: commitPreflightOne.artifact.id,
  targetRunId: commitPreflightOne.run.id,
  title: 'Approval required: commit-intent',
});

assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: commitTask.id,
      action: COMMIT_ACTION.COMMIT_INTENT,
    }),
  /approval is unresolved/i,
);

runtime.resolveDecisionInboxItem({
  itemId: pendingCommitApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve commit-intent for preflight one.',
});

assert.equal(
  runtime.ensureCommitActionAllowed({
    taskId: commitTask.id,
    action: COMMIT_ACTION.COMMIT_INTENT,
  }).allowed,
  true,
);

const { preflight: commitPreflightTwo } = createBuilderProvenanceChain(commitTask.id, 'commit approval two');

assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: commitTask.id,
      action: COMMIT_ACTION.COMMIT_INTENT,
    }),
  /stale for the latest preflight/i,
);

const rejectedCommitApproval = runtime.createApprovalPlaceholder({
  taskId: commitTask.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  targetArtifactId: commitPreflightTwo.artifact.id,
  targetRunId: commitPreflightTwo.run.id,
  title: 'Approval required: commit-intent',
});

runtime.resolveDecisionInboxItem({
  itemId: rejectedCommitApproval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject commit-intent for preflight two.',
});

assert.equal(runtime.getTask(commitTask.id).flags.waitingApproval, false);
assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: commitTask.id,
      action: COMMIT_ACTION.COMMIT_INTENT,
    }),
  /was rejected/i,
);

const approvedCommitApproval = createResolvedApproval({
  taskId: commitTask.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  targetArtifactId: commitPreflightTwo.artifact.id,
  targetRunId: commitPreflightTwo.run.id,
  title: 'Approval required: commit-intent',
  resolution: APPROVAL_STATUS.APPROVED,
});

const commitAllowed = runtime.ensureCommitActionAllowed({
  taskId: commitTask.id,
  action: COMMIT_ACTION.COMMIT_INTENT,
});
const snapshot = runtime.getSnapshot();

assert.equal(commitAllowed.allowed, true);
assert.equal(commitAllowed.approvalId, approvedCommitApproval.id);
assert.equal(Object.keys(snapshot.tasks).length, 3);
assert.equal(Object.keys(snapshot.approvals).length, 5);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      guardSplitTask: guardSplitTask.id,
      liveApprovalTask: {
        id: liveApprovalTask.id,
        latestPreflightArtifactId: preflightTwo.artifact.id,
      },
      commitTask: {
        id: commitTask.id,
        latestPreflightArtifactId: commitPreflightTwo.artifact.id,
        approvalId: commitAllowed.approvalId,
      },
    },
    null,
    2,
  ),
);
