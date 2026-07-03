'use strict';

const {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  DECISION_INBOX_KIND,
  DECISION_INBOX_STATUS,
} = require('./contracts');
const { normalizeOptionalString } = require('./normalizers');

function getApprovalMetadata(approval) {
  return approval?.metadata && typeof approval.metadata === 'object' ? approval.metadata : {};
}

function isBuilderLiveMutationApprovalConsumed(approval) {
  if (!approval || approval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION) {
    return false;
  }

  const metadata = getApprovalMetadata(approval);

  return Boolean(
    normalizeOptionalString(metadata.consumedAt) && normalizeOptionalString(metadata.consumedByRunId),
  );
}

function listTaskApprovals(taskId, state) {
  return Object.values(state.approvals).filter((approval) => approval.taskId === taskId);
}

function listPendingBlockingDecisionItems(taskId, state) {
  return Object.values(state.decisionInboxItems).filter(
    (item) =>
      item.taskId === taskId &&
      item.status === DECISION_INBOX_STATUS.PENDING &&
      item.kind === DECISION_INBOX_KIND.DECISION &&
      item.blocksTask,
  );
}

function computeTaskGateState(task, state) {
  const pendingDecisionItems = Object.values(state.decisionInboxItems).filter(
    (item) =>
      item.taskId === task.id &&
      item.kind === DECISION_INBOX_KIND.DECISION &&
      item.status === DECISION_INBOX_STATUS.PENDING,
  );
  const taskApprovals = listTaskApprovals(task.id, state);
  const pendingApprovals = taskApprovals.filter(
    (approval) => approval.status === APPROVAL_STATUS.PENDING,
  );

  return {
    pendingDecisionItems,
    pendingApprovals,
    taskApprovals,
    flags: {
      blocked: pendingDecisionItems.some((item) => item.blocksTask),
      waitingDecision: pendingDecisionItems.length > 0,
      waitingApproval: pendingApprovals.length > 0,
    },
  };
}

function applyTaskGateFlags(task, gateState) {
  task.flags.blocked = gateState.flags.blocked;
  task.flags.waitingDecision = gateState.flags.waitingDecision;
  task.flags.waitingApproval = gateState.flags.waitingApproval;
}

function recalculateTaskFlags(task, state) {
  applyTaskGateFlags(task, computeTaskGateState(task, state));
}

function listActiveTaskGates(gateState) {
  const activeGates = [];

  if (gateState.flags.blocked) {
    activeGates.push('blocked');
  }

  if (gateState.flags.waitingDecision) {
    activeGates.push('waitingDecision');
  }

  if (gateState.flags.waitingApproval) {
    activeGates.push('waitingApproval');
  }

  return activeGates;
}

function buildLatestApprovalDisplayStatus(approvalEvaluation) {
  if (approvalEvaluation.stale) {
    return 'stale';
  }

  if (
    approvalEvaluation.action === BUILDER_ACTION.LIVE_MUTATION &&
    isBuilderLiveMutationApprovalConsumed(approvalEvaluation.latestApproval)
  ) {
    return 'consumed';
  }

  return approvalEvaluation.latestApproval?.status || 'none';
}

function compareRecordsByCreatedDesc(left, right) {
  const leftValue = left.createdAt || '';
  const rightValue = right.createdAt || '';

  if (leftValue === rightValue) {
    return String(right.id || '').localeCompare(String(left.id || ''));
  }

  return rightValue.localeCompare(leftValue);
}

function findLatestTaskArtifactMeta(task, state, type) {
  const artifactIds = Array.isArray(task.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifact = state.artifacts[artifactId];

    if (artifact && artifact.type === type) {
      return artifact;
    }
  }

  return null;
}

function sameExactStringArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function uniqueReasons(reasons) {
  return [...new Set(reasons.filter(Boolean))];
}

function evaluateLatestTaskBreakerProvenance(task, state) {
  const latestPlanArtifact = findLatestTaskArtifactMeta(task, state, 'plan');
  const latestArchitectureArtifact = findLatestTaskArtifactMeta(task, state, 'architecture');
  const latestArchitectureRun =
    latestArchitectureArtifact?.runId ? state.runs[latestArchitectureArtifact.runId] || null : null;
  const architectureSummary =
    latestArchitectureRun?.summary && typeof latestArchitectureRun.summary === 'object'
      ? latestArchitectureRun.summary
      : {};
  const hasMatchingPlanProvenance =
    Boolean(latestPlanArtifact?.runId) &&
    Boolean(latestArchitectureRun) &&
    architectureSummary.inputArtifactId === latestPlanArtifact.id &&
    architectureSummary.inputRunId === latestPlanArtifact.runId;

  return {
    hasMatchingPlanProvenance,
    latestArchitectureArtifact,
    latestArchitectureRunId: latestArchitectureArtifact?.runId || null,
    latestPlanArtifact,
    latestPlanRunId: latestPlanArtifact?.runId || null,
  };
}

function evaluateLatestBuilderPreflightProvenance(task, state) {
  const taskBreakerProvenance = evaluateLatestTaskBreakerProvenance(task, state);
  const latestBreakdownArtifact = findLatestTaskArtifactMeta(task, state, 'breakdown');
  const latestBreakdownRun =
    latestBreakdownArtifact?.runId ? state.runs[latestBreakdownArtifact.runId] || null : null;
  const breakdownSummary =
    latestBreakdownRun?.summary && typeof latestBreakdownRun.summary === 'object'
      ? latestBreakdownRun.summary
      : {};
  const inputArtifactIds = Array.isArray(breakdownSummary.inputArtifactIds)
    ? breakdownSummary.inputArtifactIds
    : [];
  const inputRunIds = Array.isArray(breakdownSummary.inputRunIds)
    ? breakdownSummary.inputRunIds
    : [];
  const latestPlanArtifact = taskBreakerProvenance.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerProvenance.latestArchitectureArtifact;
  const hasMatchingBreakdownProvenance =
    Boolean(latestBreakdownRun) &&
    Boolean(latestPlanArtifact?.runId) &&
    Boolean(latestArchitectureArtifact?.runId) &&
    breakdownSummary.architectureArtifactId === latestArchitectureArtifact.id &&
    breakdownSummary.architectureRunId === latestArchitectureArtifact.runId &&
    sameExactStringArrays(inputArtifactIds, [latestPlanArtifact.id, latestArchitectureArtifact.id]) &&
    sameExactStringArrays(inputRunIds, [latestPlanArtifact.runId, latestArchitectureArtifact.runId]);

  return {
    hasMatchingArchitecturePlanProvenance: taskBreakerProvenance.hasMatchingPlanProvenance,
    hasMatchingBreakdownProvenance,
    latestArchitectureArtifact,
    latestArchitectureRunId: latestArchitectureArtifact?.runId || null,
    latestBreakdownArtifact,
    latestBreakdownRunId: latestBreakdownArtifact?.runId || null,
    latestPlanArtifact,
    latestPlanRunId: latestPlanArtifact?.runId || null,
  };
}

function evaluateLatestApprovalForAction(input) {
  const task = input.task;
  const state = input.state;
  const action = input.action;
  const currentPreflight = input.currentPreflight || null;
  const requireCurrentPreflightTarget = Boolean(input.requireCurrentPreflightTarget);
  const latestApproval =
    listTaskApprovals(task.id, state)
      .filter((approval) => approval.allowedNextAction === action)
      .sort(compareRecordsByCreatedDesc)[0] || null;
  const reasons = [];
  let stale = false;

  if (!latestApproval) {
    reasons.push(`latest approval for ${action} is missing`);
  } else {
    if (latestApproval.status === APPROVAL_STATUS.PENDING) {
      reasons.push(`latest approval ${latestApproval.id} for ${action} is pending`);
    }

    if (latestApproval.status === APPROVAL_STATUS.REJECTED) {
      reasons.push(`latest approval ${latestApproval.id} for ${action} is rejected`);
    }

    if (action === BUILDER_ACTION.LIVE_MUTATION && isBuilderLiveMutationApprovalConsumed(latestApproval)) {
      const metadata = getApprovalMetadata(latestApproval);

      reasons.push(
        `latest approval ${latestApproval.id} for ${action} is already consumed by builder live mutation run ${metadata.consumedByRunId}`,
      );
    }

    if (requireCurrentPreflightTarget && currentPreflight?.artifact) {
      const targetArtifactId = latestApproval.targetArtifactId || null;
      const targetRunId = latestApproval.targetRunId || null;
      const currentArtifactId = currentPreflight.artifact.id;
      const currentRunId = currentPreflight.run?.id || null;

      if (targetArtifactId !== currentArtifactId || targetRunId !== currentRunId) {
        stale = true;
        reasons.push(
          `latest approval ${latestApproval.id} for ${action} is stale for preflight ${currentArtifactId}`,
        );
      }
    }
  }

  return {
    action,
    allowed:
      Boolean(latestApproval) &&
      latestApproval.status === APPROVAL_STATUS.APPROVED &&
      !(action === BUILDER_ACTION.LIVE_MUTATION && isBuilderLiveMutationApprovalConsumed(latestApproval)) &&
      (!requireCurrentPreflightTarget || !stale),
    currentPreflightArtifactId: currentPreflight?.artifact?.id || null,
    currentPreflightRunId: currentPreflight?.run?.id || null,
    latestApproval: latestApproval || null,
    reasons: uniqueReasons(reasons),
    stale,
  };
}

function buildTaskBreakerGuardSummary(task, state) {
  const provenance = evaluateLatestTaskBreakerProvenance(task, state);
  const latestPlanArtifact = provenance.latestPlanArtifact;
  const latestArchitectureArtifact = provenance.latestArchitectureArtifact;
  const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
  const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
  const reasons = [];

  if (!latestPlanArtifact) {
    reasons.push('latest plan artifact required');
  }

  if (!latestArchitectureArtifact) {
    reasons.push('latest architecture artifact required');
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    !provenance.hasMatchingPlanProvenance
  ) {
    reasons.push(
      `latest architecture artifact ${latestArchitectureArtifact.id} does not match current latest plan artifact ${latestPlanArtifact.id}`,
    );
  }

  if (pendingBlockingDecisionItems.length > 0) {
    reasons.push(
      `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
    );
  }

  if (pendingApprovals.length > 0) {
    reasons.push(`pending approvals: ${pendingApprovals.map((item) => item.id).join(', ')}`);
  }

  return {
    allowed: reasons.length === 0,
    latestArchitectureArtifactId: latestArchitectureArtifact?.id || null,
    latestArchitectureRunId: provenance.latestArchitectureRunId,
    latestPlanRunId: provenance.latestPlanRunId,
    latestPlanArtifactId: latestPlanArtifact?.id || null,
    matchingPlanArchitectureProvenance: provenance.hasMatchingPlanProvenance,
    pendingApprovalIds: pendingApprovals.map((approval) => approval.id),
    pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
    reasons: uniqueReasons(reasons),
  };
}

function buildBuilderPreflightGuardSummary(task, state) {
  const provenance = evaluateLatestBuilderPreflightProvenance(task, state);
  const latestPlanArtifact = provenance.latestPlanArtifact;
  const latestArchitectureArtifact = provenance.latestArchitectureArtifact;
  const latestBreakdownArtifact = provenance.latestBreakdownArtifact;
  const latestPreflightArtifact = findLatestTaskArtifactMeta(task, state, 'preflight');
  const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
  const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
  const reasons = [];

  if (!latestPlanArtifact) {
    reasons.push('latest plan artifact required');
  }

  if (!latestArchitectureArtifact) {
    reasons.push('latest architecture artifact required');
  }

  if (!latestBreakdownArtifact) {
    reasons.push('latest breakdown artifact required');
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    !provenance.hasMatchingArchitecturePlanProvenance
  ) {
    reasons.push(
      `latest architecture artifact ${latestArchitectureArtifact.id} does not match current latest plan artifact ${latestPlanArtifact.id}`,
    );
  }

  if (
    latestPlanArtifact &&
    latestArchitectureArtifact &&
    latestBreakdownArtifact &&
    !provenance.hasMatchingBreakdownProvenance
  ) {
    reasons.push(
      `latest breakdown artifact ${latestBreakdownArtifact.id} does not match current latest plan-plus-architecture provenance chain`,
    );
  }

  if (pendingBlockingDecisionItems.length > 0) {
    reasons.push(
      `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
    );
  }

  if (pendingApprovals.length > 0) {
    reasons.push(`pending approvals: ${pendingApprovals.map((item) => item.id).join(', ')}`);
  }

  return {
    allowed: reasons.length === 0,
    latestArchitectureArtifactId: latestArchitectureArtifact?.id || null,
    latestBreakdownArtifactId: latestBreakdownArtifact?.id || null,
    latestBreakdownRunId: provenance.latestBreakdownRunId,
    latestPlanArtifactId: latestPlanArtifact?.id || null,
    latestPlanRunId: provenance.latestPlanRunId,
    latestPreflightArtifactId: latestPreflightArtifact?.id || null,
    matchingBreakdownProvenance: provenance.hasMatchingBreakdownProvenance,
    matchingPlanArchitectureProvenance: provenance.hasMatchingArchitecturePlanProvenance,
    pendingApprovalIds: pendingApprovals.map((approval) => approval.id),
    pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
    reasons: uniqueReasons(reasons),
  };
}

module.exports = {
  applyTaskGateFlags,
  buildBuilderPreflightGuardSummary,
  buildLatestApprovalDisplayStatus,
  buildTaskBreakerGuardSummary,
  compareRecordsByCreatedDesc,
  computeTaskGateState,
  evaluateLatestApprovalForAction,
  evaluateLatestBuilderPreflightProvenance,
  evaluateLatestTaskBreakerProvenance,
  findLatestTaskArtifactMeta,
  getApprovalMetadata,
  isBuilderLiveMutationApprovalConsumed,
  listActiveTaskGates,
  listPendingBlockingDecisionItems,
  listTaskApprovals,
  recalculateTaskFlags,
  sameExactStringArrays,
  uniqueReasons,
};
