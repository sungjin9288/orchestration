import { getLatestTaskArtifact } from './task-summaries.js';

export function getTaskBreakerAvailability(task, data, busy) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.taskBreaker || null : null;
  const guardSummary = task ? data.derived?.taskGuardSummaries?.[task.id]?.taskBreaker || null : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('task-breaker readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (busy) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

export function getBuilderPreflightAvailability(task, data, busy) {
  const summary = task
    ? data.derived?.executionEntrySummaries?.[task.id]?.builderPreflight || null
    : null;
  const guardSummary = task
    ? data.derived?.taskGuardSummaries?.[task.id]?.builderPreflight || null
    : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('builder preflight readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (busy) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    latestPreflightArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

export function getPlannerAvailability(task, data, busy) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.planner || null : null;
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('planner readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (busy) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    reasons: [...new Set(reasons)],
    summary: summary || {
      allowed: false,
      reasons: ['planner readiness unavailable'],
    },
  };
}

export function getArchitectAvailability(task, data, busy) {
  const summary = task ? data.derived?.executionEntrySummaries?.[task.id]?.architect || null : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('architect readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (busy) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    latestPlanArtifact,
    reasons: [...new Set(reasons)],
    summary: summary || {
      allowed: false,
      reasons: ['architect readiness unavailable'],
    },
  };
}

export function getReviewerAvailability(task, data, busy) {
  const summary = task ? data.derived?.reviewerReadinessSummaries?.[task.id] || null : null;
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('reviewer readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (busy) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    summary: summary || {
      allowed: false,
      reasons: ['reviewer readiness unavailable'],
    },
    reasons: [...new Set(reasons)],
  };
}

export function getCommitPackageAvailability(task, data, busy) {
  const summary = task ? data.derived?.commitPackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: busy || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      currentCommitPackageArtifactId: null,
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestCommitPackageArtifactId: null,
      packageStale: false,
      reasons: ['commit-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

export function getCommitExecutionAvailability(task, data, busy) {
  const summary = task ? data.derived?.commitExecutionReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: busy || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      changedFileCount: 0,
      commitMessagePresent: false,
      commitPackageArtifactId: null,
      conflict: false,
      existingCommitResultArtifactId: null,
      existingLocalCommitRunId: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      reasons: ['commit execution readiness unavailable'],
      repoChangeCountBeforeCommit: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

export function getReleasePackageAvailability(task, data, busy) {
  const summary = task ? data.derived?.releasePackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: busy || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestReleasePackageArtifactId: null,
      packageStale: false,
      reasons: ['release-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

export function getCloseOutAvailability(task, data, busy) {
  const summary = task ? data.derived?.closeOutReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: busy || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      existingCloseOutArtifactId: null,
      existingCloseOutRunId: null,
      latestApprovedReleaseApprovalId: null,
      latestApprovedReleaseApprovalStatus: null,
      latestCloseOutArtifactId: null,
      latestReleasePackageArtifactId: null,
      reasons: ['close-out readiness unavailable'],
      repoClean: false,
      repoDirtyFileCount: null,
      repoStagedFileCount: null,
      repoUntrackedFileCount: null,
      sourceBuilderApprovalId: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}
