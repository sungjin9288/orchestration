const GROWTH_CANDIDATE_BLOCKED_ACTIONS = Object.freeze([
  'proposal generation',
  'proposal application',
  'memory persistence',
  'source mutation',
  'commit/push',
]);

const ROLLBACK_ARTIFACT_TYPES = new Set([
  'patch',
  'diff',
  'change-summary',
  'review',
  'commit-package',
  'commit-result',
  'release-package',
  'close-out',
]);

function defaultDisplay(value) {
  return value || '알 수 없음';
}

function createGrowthCandidate({
  id,
  type,
  title,
  sourceId,
  sourceSurface,
  reason,
  reviewerQuestion,
  severity,
  severityLabel,
  confidence,
  confidenceLabel,
  typeLabel,
}) {
  return {
    id,
    type,
    typeLabel,
    title,
    sourceId,
    sourceSurface,
    reason,
    reviewerQuestion,
    severity,
    severityLabel,
    confidence,
    confidenceLabel,
    proposedNextStep: '사람 리뷰가 제안 기록으로 넘길지 결정합니다.',
    blockedActions: [...GROWTH_CANDIDATE_BLOCKED_ACTIONS],
  };
}

export function getGrowthEvidenceCandidates(
  { failedRuns, reviewArtifacts, blockedTasks },
  { getRunStatusDisplay = defaultDisplay } = {},
) {
  const reviewCandidates = reviewArtifacts.slice(0, 4).map((artifact) =>
    createGrowthCandidate({
      id: `review:${artifact.id}`,
      type: 'review-evidence',
      typeLabel: '검토 증거',
      title: artifact.title || artifact.name || '검토 증거',
      sourceId: artifact.id,
      sourceSurface: 'artifacts',
      reason: '검토 결과는 반복되는 품질 기준, 누락된 검증, 승인 전 보완점을 가장 직접적으로 드러냅니다.',
      reviewerQuestion: '이 검토 지적을 다음 실행 전 점검 항목이나 보호 규칙으로 올려야 하는가?',
      severity: 'medium',
      severityLabel: '중간',
      confidence: 'artifact-backed',
      confidenceLabel: 'artifact 기반',
    }),
  );

  const failedRunCandidates = failedRuns.slice(0, 4).map((run) =>
    createGrowthCandidate({
      id: `run:${run.id}`,
      type: 'failed-run',
      typeLabel: '실패한 실행',
      title: `${getRunStatusDisplay(run.status)} · ${run.role || run.kind || '실행'}`,
      sourceId: run.id,
      sourceSurface: 'logs',
      reason: '실패한 실행은 복구 경로, 사전 점검 조건, 사용자 안내가 부족한 지점을 보여 줍니다.',
      reviewerQuestion: '이 실패를 줄이려면 어떤 사전 확인, 되돌림 안내, 또는 작업자 안내가 필요한가?',
      severity: 'high',
      severityLabel: '높음',
      confidence: 'runtime-backed',
      confidenceLabel: 'runtime 기반',
    }),
  );

  const blockedTaskCandidates = blockedTasks.slice(0, 4).map((task) =>
    createGrowthCandidate({
      id: `task:${task.id}`,
      type: 'blocked-task',
      typeLabel: '차단된 작업',
      title: task.title || '차단된 작업',
      sourceId: task.id,
      sourceSurface: 'taskboard',
      reason: '차단된 작업은 승인, 결정, 증거 인계가 충분히 명확한지 확인할 수 있는 신호입니다.',
      reviewerQuestion: '작업자가 이 gate를 해소하기 위해 필요한 증거와 다음 위치를 한눈에 볼 수 있는가?',
      severity: task.flags?.blocked ? 'high' : 'medium',
      severityLabel: task.flags?.blocked ? '높음' : '중간',
      confidence: 'state-backed',
      confidenceLabel: 'state 기반',
    }),
  );

  return [...reviewCandidates, ...failedRunCandidates, ...blockedTaskCandidates].slice(0, 6);
}

export function getGrowthFailurePatternGroups({ failedRuns, reviewArtifacts, blockedTasks }) {
  return [
    {
      id: 'runtime-failures',
      label: '실행 실패',
      count: failedRuns.length,
      surface: 'logs',
      evidenceRefs: failedRuns.slice(0, 3).map((run) => run.id),
      reviewPrompt: '실패 전 사전 조건이나 복구 안내가 충분했는지 봅니다.',
    },
    {
      id: 'review-findings',
      label: '리뷰 보완',
      count: reviewArtifacts.length,
      surface: 'artifacts',
      evidenceRefs: reviewArtifacts.slice(0, 3).map((artifact) => artifact.id),
      reviewPrompt: '반복되는 품질 기준을 다음 리뷰 체크로 올릴지 봅니다.',
    },
    {
      id: 'blocked-gates',
      label: '게이트 대기',
      count: blockedTasks.length,
      surface: 'decision-inbox',
      evidenceRefs: blockedTasks.slice(0, 3).map((task) => task.id),
      reviewPrompt: '작업자가 승인·결정·증거 위치를 한눈에 찾는지 봅니다.',
    },
  ];
}

export function getGrowthRegressionComparison({ failedRuns, completedRuns }) {
  const latestFailed = failedRuns[0] || null;
  const latestCompleted = completedRuns[0] || null;

  return {
    failedCount: failedRuns.length,
    completedCount: completedRuns.length,
    latestFailedRef: latestFailed?.id || '실패 없음',
    latestCompletedRef: latestCompleted?.id || '완료 없음',
    summary:
      failedRuns.length > 0
        ? '최근 실패 경로를 완료 경로와 나란히 보고 회귀 가능성을 리뷰합니다.'
        : '현재 snapshot에서는 실패 실행이 없어 완료 경로만 기준으로 봅니다.',
  };
}

export function getGrowthRollbackEvidenceLinks(
  artifacts,
  { getArtifactTypeDisplay = defaultDisplay } = {},
) {
  return artifacts
    .filter((artifact) => ROLLBACK_ARTIFACT_TYPES.has(artifact.type))
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
    .slice(0, 4)
    .map((artifact) => ({
      id: artifact.id,
      type: getArtifactTypeDisplay(artifact.type),
      surface: 'artifacts',
      taskId: artifact.taskId || 'task 미지정',
    }));
}

export function getGrowthLearningSnapshot(data, context, formatters = {}) {
  const failedRuns = data.runs.filter((run) => run.status === 'failed' || run.status === 'error');
  const completedRuns = data.runs.filter((run) => run.status === 'completed');
  const reviewArtifacts = data.artifacts.filter((artifact) => artifact.type === 'review');
  const blockedTasks = data.tasks.filter(
    (task) => task.flags?.blocked || task.flags?.waitingApproval || task.flags?.waitingDecision,
  );
  const evidenceCount =
    data.artifacts.length + data.runs.length + data.approvals.length + data.inboxItems.length;
  const candidates = getGrowthEvidenceCandidates({ failedRuns, reviewArtifacts, blockedTasks }, formatters);
  const candidateCount = reviewArtifacts.length + failedRuns.length + blockedTasks.length;
  const proposalRecords = (data.proposalRecords || []).slice(0, 5);
  const proposalApplicationAttempts = (data.proposalApplicationAttempts || []).slice(0, 5);
  const selectedEvidence =
    context.selectedArtifact?.id ||
    context.selectedRun?.id ||
    context.selectedInboxItem?.id ||
    context.activeTask?.id ||
    context.selectedMission?.id ||
    '근거 대기';

  return {
    candidateCount,
    evidenceCount,
    failedRuns,
    completedRuns,
    reviewArtifacts,
    blockedTasks,
    candidates,
    proposalRecords,
    proposalApplicationAttempts,
    failurePatternGroups: getGrowthFailurePatternGroups({ failedRuns, reviewArtifacts, blockedTasks }),
    regressionComparison: getGrowthRegressionComparison({ failedRuns, completedRuns }),
    rollbackEvidenceLinks: getGrowthRollbackEvidenceLinks(data.artifacts, formatters),
    selectedEvidence,
    status: candidateCount > 0 ? '개선 후보 있음' : '후보 대기',
    statusTone: candidateCount > 0 ? 'accent' : 'neutral',
  };
}
