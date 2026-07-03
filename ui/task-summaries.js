import { getApprovalActionLabel } from './execution-labels.js';

export const TASK_LIFECYCLE_ORDER = ['Inbox', 'In Progress', 'Review', 'Done'];

export function getTaskApprovals(taskId, approvals) {
  return approvals.filter((approval) => approval.taskId === taskId);
}

export function getTaskInboxItems(taskId, inboxItems) {
  return inboxItems.filter((item) => item.taskId === taskId);
}

export function getTaskApprovalSummary(task, approvals) {
  const taskApprovals = getTaskApprovals(task.id, approvals);

  return {
    total: taskApprovals.length,
    pending: taskApprovals.filter((approval) => approval.status === 'pending').length,
    approved: taskApprovals.filter((approval) => approval.status === 'approved').length,
    rejected: taskApprovals.filter((approval) => approval.status === 'rejected').length,
    actions: taskApprovals.map((approval) => approval.allowedNextAction).filter(Boolean),
  };
}

export function getTaskDecisionSummary(task, inboxItems) {
  const taskItems = getTaskInboxItems(task.id, inboxItems);
  const pending = taskItems.filter((item) => item.status === 'pending');

  return {
    total: taskItems.length,
    pendingTotal: pending.length,
    pendingReview: pending.filter((item) => item.kind === 'review').length,
    pendingDecision: pending.filter((item) => item.kind === 'decision').length,
    pendingApproval: pending.filter((item) => item.kind === 'approval').length,
  };
}


export function sortByCreatedDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

export function getLatestTaskArtifact(task, data, type = null) {
  const artifactIds = Array.isArray(task?.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifact = data.artifactMap.get(artifactId);

    if (!artifact) {
      continue;
    }

    if (!type || artifact.type === type) {
      return artifact;
    }
  }

  return null;
}

export function groupTasksByLifecycle(tasks) {
  const groups = new Map(TASK_LIFECYCLE_ORDER.map((stateName) => [stateName, []]));
  const extras = [];

  for (const task of tasks) {
    if (groups.has(task.lifecycleState)) {
      groups.get(task.lifecycleState).push(task);
      continue;
    }

    extras.push(task);
  }

  if (extras.length > 0) {
    groups.set('Other', extras);
  }

  return [...groups.entries()];
}

export function getTaskArtifacts(taskId, artifacts) {
  return artifacts.filter((artifact) => artifact.taskId === taskId);
}

export function getTaskRuns(taskId, runs) {
  return runs.filter((run) => run.taskId === taskId).sort(sortByCreatedDesc);
}

export function getPreferredTaskArtifact(task, data) {
  return (
    getLatestTaskArtifact(task, data, 'change-summary') ||
    getLatestTaskArtifact(task, data, 'diff') ||
    getLatestTaskArtifact(task, data, 'patch') ||
    getLatestTaskArtifact(task, data, 'preflight') ||
    getLatestTaskArtifact(task, data, 'breakdown') ||
    getLatestTaskArtifact(task, data, 'architecture') ||
    getLatestTaskArtifact(task, data)
  );
}

export function describeApprovalTarget(approval, targetArtifact) {
  if (targetArtifact) {
    return `아티팩트 ${targetArtifact.id} (${targetArtifact.type})`;
  }

  if (approval?.targetArtifactId) {
    return `아티팩트 ${approval.targetArtifactId}`;
  }

  return '현재 한정된 아티팩트';
}

export function getTaskApprovalBridge(task, data) {
  if (!task) {
    return {
      actionLabel: null,
      bridgeCopy: '이 미션에는 아직 승인 브리지 자체가 없습니다.',
      currentApproval: null,
      currentGateItem: null,
      nextStepCopy: '다음 운영 단계: 실행이 첫 게이트를 만들기 전까지는 미션 또는 협의회에 머뭅니다.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  const taskApprovals = getTaskApprovals(task.id, data.approvals).sort(sortByCreatedDesc);
  const taskItems = getTaskInboxItems(task.id, data.inboxItems).sort(sortByCreatedDesc);
  const currentGateItem = getPreferredTaskInboxItem(task.id, data);
  const pendingInboxItem =
    taskItems.find((item) => item.status === 'pending' && item.kind === 'approval') || null;
  const currentApproval =
    (pendingInboxItem?.sourceId
      ? taskApprovals.find((approval) => approval.id === pendingInboxItem.sourceId) || null
      : null) ||
    taskApprovals.find((approval) => approval.status === 'pending') ||
    taskApprovals[0] ||
    null;
  const targetArtifact = currentApproval?.targetArtifactId
    ? data.artifactMap.get(currentApproval.targetArtifactId) || null
    : null;
  const actionLabel = getApprovalActionLabel(currentApproval?.allowedNextAction);
  const targetLabel = describeApprovalTarget(currentApproval, targetArtifact);

  if (currentApproval) {
    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `협의회 승인으로 이 미션은 이미 프리플라이트까지 진행됐습니다. 현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 라이브 변경을 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `고급 운영 모드 -> 결정함에서 ${pendingInboxItem.id}를 승인한 뒤, 실행으로 돌아와 라이브 변경을 실행합니다.`
          : '고급 운영 모드에서 현재 라이브 변경 승인 게이트를 먼저 처리한 뒤 라이브 변경을 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 라이브 변경을 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '실행에서 라이브 변경을 바로 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 로컬 커밋 의도를 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `실행에서 ${pendingInboxItem.id}를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 로컬 커밋 이어가기를 실행합니다.`
          : '실행에서 현재 커밋 게이트를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 로컬 커밋 이어가기를 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 로컬 커밋 의도를 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '현재 커밋 번들 준비 상태가 초록이면 실행에서 승인된 로컬 커밋 이어가기를 실행합니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `현재 사람 게이트는 ${currentApproval.id}이며, ${targetLabel} 기준 릴리스 준비 상태를 승인합니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `실행에서 ${pendingInboxItem.id}를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 종료 정리를 이어갑니다.`
          : '실행에서 현재 릴리스 게이트를 승인한 뒤, 준비 상태가 초록으로 바뀌면 승인된 종료 정리를 이어갑니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id}가 ${targetLabel} 기준 릴리스 준비 상태를 이미 승인했습니다.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: '현재 릴리스 번들 준비 상태가 초록이면 실행에서 승인된 종료 정리를 이어갑니다.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    return {
      actionLabel,
      bridgeCopy: `${currentApproval.id}는 ${targetLabel} 기준 ${actionLabel || currentApproval.scope || '현재 승인'}에 대해 ${currentApproval.status} 상태입니다.`,
      currentApproval,
      currentGateItem,
      nextStepCopy: pendingInboxItem
        ? `고급 운영 모드 -> 결정함에서 ${pendingInboxItem.id}를 검토합니다.`
        : '고급 운영 모드에서 현재 승인 기록을 확인합니다.',
      pendingInboxItem,
      targetArtifact,
    };
  }

  if (currentGateItem?.status === 'pending') {
    return {
      actionLabel: null,
      bridgeCopy: `${currentGateItem.id}가 이 미션의 현재 대기 중 ${currentGateItem.kind} 게이트입니다.`,
      currentApproval: null,
      currentGateItem,
      nextStepCopy: '고급 운영 모드 -> 결정함에서 현재 게이트를 처리합니다.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  return {
    actionLabel: null,
    bridgeCopy: '지금 활성화된 승인 브리지는 없습니다.',
    currentApproval: null,
    currentGateItem,
    nextStepCopy: '새 실행 게이트가 나타날 때까지 기본 표면에서 현재 상태를 유지합니다.',
    pendingInboxItem: null,
    targetArtifact: null,
  };
}

export function getPreferredTaskInboxItem(taskId, data) {
  const taskItems = getTaskInboxItems(taskId, data.inboxItems);
  const pendingApprovals = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'approval',
  );

  if (pendingApprovals.length > 0) {
    return pendingApprovals[0];
  }

  const pendingBlockingDecisions = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'decision' && item.blocksTask,
  );

  if (pendingBlockingDecisions.length > 0) {
    return pendingBlockingDecisions[0];
  }

  const pendingItems = taskItems.filter((item) => item.status === 'pending');

  if (pendingItems.length > 0) {
    return pendingItems[0];
  }

  return taskItems[0] || null;
}

export function getPrimaryBlockedReason(reasons, fallback) {
  const primaryReason = Array.isArray(reasons) ? reasons.find(Boolean) : null;

  return primaryReason || fallback;
}

export function getBuilderLiveMutationSummaries(task, data) {
  const summaries = task ? data.derived?.taskGuardSummaries?.[task.id] || null : null;

  return {
    guardSummary: summaries?.builderLiveMutation || {
      allowed: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime guard unavailable'],
    },
    requestSummary: summaries?.builderLiveMutationApprovalRequest || {
      allowed: false,
      conflict: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime request summary unavailable'],
    },
  };
}
