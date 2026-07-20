import { COUNCIL_CAST_METADATA } from './council-config.js';
import {
  getAlignmentStatusDisplay,
  getAlignmentTone,
  getMissionStatusDisplay,
  getMissionStatusTone,
  getReviewStatusDisplay,
  getReviewTone,
  getTaskLifecycleDisplay,
} from './execution-labels.js';

export function isRealCouncilMode(mode) {
  return mode === 'real-local-stub' || mode === 'real-openai-responses';
}

export function getCurrentRealCouncilAttempt(councilSession) {
  if (!isRealCouncilMode(councilSession?.mode) || !Array.isArray(councilSession.attempts)) {
    return null;
  }

  return (
    councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    ) || councilSession.attempts.at(-1) || null
  );
}

export function getLatestRealCouncilPositions(councilSession) {
  if (!isRealCouncilMode(councilSession?.mode) || !Array.isArray(councilSession.attempts)) {
    return [];
  }

  const positionsByAgent = new Map();

  for (const attempt of councilSession.attempts) {
    for (const position of attempt.positions || []) {
      positionsByAgent.set(position.agentId, position);
    }
  }

  return [...positionsByAgent.values()];
}

export function parseMissionWorkOrderCompileList(value) {
  return [
    ...new Set(
      String(value || '')
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ];
}

export function getMissionWorkOrderPreviewSummary(preview, councilSessionId) {
  if (
    !preview ||
    preview.councilSessionId !== councilSessionId ||
    preview.schemaVersion !== 1
  ) {
    return null;
  }

  return {
    previewId: preview.previewId,
    executionPlanId: preview.executionPlan?.id || null,
    workOrderCount: Array.isArray(preview.workOrders) ? preview.workOrders.length : 0,
    handoffCount: Array.isArray(preview.handoffPackets) ? preview.handoffPackets.length : 0,
    authorityClosed:
      preview.approvalAllowed === false &&
      preview.executionAllowed === false &&
      preview.persistenceAllowed === false,
  };
}

export function getMissionExecutionPlanBundle(snapshot, councilSessionId) {
  const executionPlan = Object.values(snapshot?.executionPlans || {}).find(
    (entry) => entry.councilSessionId === councilSessionId,
  );
  if (!executionPlan) return null;

  const workOrders = executionPlan.workOrderIds
    .map((id) => snapshot.workOrders?.[id] || null)
    .filter(Boolean);
  const handoffPackets = executionPlan.handoffPacketIds
    .map((id) => snapshot.handoffPackets?.[id] || null)
    .filter(Boolean);
  const approval = snapshot.approvals?.[executionPlan.approvalId] || null;
  const terminalGateApproval = executionPlan.terminalGateApprovalId
    ? snapshot.approvals?.[executionPlan.terminalGateApprovalId] || null
    : null;
  const controlTask = snapshot.tasks?.[executionPlan.controlTaskId] || null;
  const workflowCheckpoints = (executionPlan.checkpointRefs || [])
    .map((id) => snapshot.workflowCheckpoints?.[id] || null)
    .filter(Boolean);
  const deliveryPackages = (executionPlan.deliveryPackageRefs || [])
    .map((id) => snapshot.deliveryPackages?.[id] || null)
    .filter(Boolean);
  const deliveryPackageAcceptances = Object.values(snapshot.deliveryPackageAcceptances || {}).filter(
    (acceptance) => deliveryPackages.some(
      (deliveryPackage) => deliveryPackage.id === acceptance.deliveryPackageId,
    ),
  );
  const missionCloseOuts = Object.values(snapshot.missionCloseOuts || {}).filter(
    (closeOut) => closeOut.executionPlanId === executionPlan.id,
  );

  if (
    workOrders.length !== executionPlan.workOrderIds.length ||
    handoffPackets.length !== executionPlan.handoffPacketIds.length ||
    !approval ||
    !controlTask
  ) {
    return null;
  }

  return {
    executionPlan,
    workOrders,
    handoffPackets,
    approval,
    terminalGateApproval,
    controlTask,
    workflowCheckpoints,
    deliveryPackages,
    deliveryPackageAcceptances,
    missionCloseOuts,
    latestCheckpoint: executionPlan.latestCheckpointId
      ? snapshot.workflowCheckpoints?.[executionPlan.latestCheckpointId] || null
      : null,
    latestDeliveryPackage: executionPlan.latestDeliveryPackageId
      ? snapshot.deliveryPackages?.[executionPlan.latestDeliveryPackageId] || null
      : null,
    latestDeliveryPackageAcceptance: executionPlan.latestDeliveryPackageId
      ? deliveryPackageAcceptances.find(
          (acceptance) => acceptance.deliveryPackageId === executionPlan.latestDeliveryPackageId,
        ) || null
      : null,
    latestMissionCloseOut: missionCloseOuts.at(-1) || null,
  };
}

export function getMissionCloseOutSummary(
  mission,
  preview,
  bundle,
  durablePackage,
  acceptance,
  missionCloseOut,
) {
  const acceptanceSummary = getMissionDeliveryPackageAcceptanceSummary(
    preview,
    bundle,
    durablePackage,
    acceptance,
  );
  if (!mission || !acceptanceSummary?.tupleCurrent) return null;

  const controlTask = bundle.controlTask;
  const sourceReady = Boolean(
    acceptanceSummary.accepted &&
      bundle.executionPlan.missionId === mission.id &&
      bundle.executionPlan.status === 'delivery-ready' &&
      bundle.executionPlan.activeWorkOrderId === null &&
      bundle.workOrders.length === 3 &&
      bundle.workOrders.every((workOrder) => workOrder.status === 'completed') &&
      controlTask?.missionId === mission.id &&
      controlTask.lifecycleState === 'Review' &&
      controlTask.review?.required === true &&
      controlTask.review?.status === 'passed' &&
      controlTask.flags?.blocked === false &&
      controlTask.flags?.waitingDecision === false &&
      controlTask.flags?.waitingApproval === false,
  );
  const completed = Boolean(
    missionCloseOut &&
      missionCloseOut.missionId === mission.id &&
      missionCloseOut.linkedTaskId === controlTask?.id &&
      missionCloseOut.executionPlanId === bundle.executionPlan.id &&
      missionCloseOut.deliveryPackageId === durablePackage.id &&
      missionCloseOut.deliveryPackageAcceptanceId === acceptance.id &&
      missionCloseOut.packageDigest === durablePackage.packageDigest &&
      missionCloseOut.acceptanceDigest === acceptance.acceptanceDigest &&
      missionCloseOut.decision === 'closed-out' &&
      mission.status === 'completed' &&
      controlTask.lifecycleState === 'Done',
  );

  return {
    canCloseOut: sourceReady && !missionCloseOut,
    completed,
    sourceReady,
    status: completed ? 'closed-out' : sourceReady ? 'ready' : 'blocked',
  };
}

export function getMissionLearningCandidatePreviewSummary(
  mission,
  preview,
  bundle,
  durablePackage,
  acceptance,
  missionCloseOut,
) {
  const closeOutSummary = getMissionCloseOutSummary(
    mission,
    preview,
    bundle,
    durablePackage,
    acceptance,
    missionCloseOut,
  );
  if (!closeOutSummary?.completed) return null;

  const targetPathAllowlist = [
    ...new Set(
      bundle.workOrders.flatMap((workOrder) => workOrder.targetPathAllowlist || []),
    ),
  ];
  const verificationCommands = [
    ...new Set([
      ...(bundle.executionPlan.verificationPlan || []),
      ...bundle.workOrders.flatMap((workOrder) => workOrder.verificationCommands || []),
    ]),
  ];
  const negativeEvidenceRefs = [
    ...new Set([
      durablePackage.id,
      durablePackage.reviewerEvidenceRef,
      ...(durablePackage.qaEvidenceRefs || []),
      missionCloseOut.id,
      bundle.executionPlan.councilSessionId,
    ].filter(Boolean)),
  ];

  return {
    available: targetPathAllowlist.length > 0 && verificationCommands.length > 0,
    persisted: false,
    source: {
      linkedTaskId: bundle.controlTask.id,
      executionPlanId: bundle.executionPlan.id,
      deliveryPackageId: durablePackage.id,
      deliveryPackageAcceptanceId: acceptance.id,
      missionCloseOutId: missionCloseOut.id,
      previewId: durablePackage.previewId,
      sourceDigest: durablePackage.sourceDigest,
      packageDigest: durablePackage.packageDigest,
      acceptanceDigest: acceptance.acceptanceDigest,
      checkpointId: durablePackage.terminalCheckpointId,
      checkpointDigest: durablePackage.terminalCheckpointDigest,
      closeOutDigest: missionCloseOut.closeOutDigest,
    },
    targetPathAllowlist,
    verificationCommands,
    negativeEvidenceRefs,
  };
}

export function getMissionDeliveryPackageAcceptanceSummary(
  preview,
  bundle,
  durablePackage,
  acceptance,
) {
  if (
    !preview ||
    !durablePackage ||
    preview.executionPlanId !== bundle?.executionPlan.id ||
    durablePackage.executionPlanId !== bundle.executionPlan.id
  ) {
    return null;
  }
  const checkpoint = bundle.latestCheckpoint || null;
  const tupleCurrent = Boolean(
    checkpoint &&
      durablePackage.status === 'review-required' &&
      Array.isArray(durablePackage.unresolvedItems) &&
      durablePackage.unresolvedItems.length === 0 &&
      durablePackage.previewId === preview.id &&
      durablePackage.sourceDigest === preview.sourceDigest &&
      durablePackage.packageDigest === preview.packageDigest &&
      durablePackage.terminalCheckpointId === preview.terminalCheckpointId &&
      durablePackage.terminalCheckpointDigest === preview.terminalCheckpointDigest &&
      checkpoint.id === durablePackage.terminalCheckpointId &&
      checkpoint.checkpointDigest === durablePackage.terminalCheckpointDigest &&
      checkpoint.stage === 'delivery-ready' &&
      checkpoint.status === 'terminal' &&
      bundle.executionPlan.status === 'delivery-ready',
  );
  const accepted = Boolean(
    acceptance &&
      acceptance.deliveryPackageId === durablePackage.id &&
      acceptance.packageDigest === durablePackage.packageDigest &&
      acceptance.decision === 'accepted',
  );
  return {
    accepted,
    canAccept: tupleCurrent && !acceptance,
    reviewStatus: accepted ? 'accepted' : 'review-required',
    tupleCurrent,
  };
}

export function getMissionDeliveryPackagePersistenceSummary(preview, bundle, durablePackage) {
  if (!preview || preview.executionPlanId !== bundle?.executionPlan.id) return null;
  const checkpoint = bundle.latestCheckpoint || null;
  const tupleCurrent = Boolean(
    checkpoint &&
      checkpoint.id === preview.terminalCheckpointId &&
      checkpoint.checkpointDigest === preview.terminalCheckpointDigest &&
      checkpoint.stage === 'delivery-ready' &&
      checkpoint.status === 'terminal' &&
      bundle.executionPlan.sourceDigest === preview.sourceDigest,
  );
  return {
    canPersist: Boolean(
      tupleCurrent &&
        !durablePackage &&
        preview.packageDigest &&
        preview.authoritySummary?.durablePersistenceAllowed === true,
    ),
    persisted: Boolean(durablePackage),
    tupleCurrent,
  };
}

export function getMissionWorkflowCheckpointSummary(recovery, executionPlanId) {
  if (!recovery || recovery.executionPlanId !== executionPlanId) return null;
  const checkpoint = recovery.checkpoint || null;
  const action = recovery.nextAllowedActions?.[0] || null;
  return {
    checkpoint,
    action,
    canCancel: Boolean(
      checkpoint &&
        recovery.classification === 'ready' &&
        recovery.current &&
        ['resume-reviewer', 'resume-qa'].includes(action),
    ),
    canResume: Boolean(
      checkpoint &&
        recovery.classification === 'ready' &&
        recovery.current &&
        ['resume-reviewer', 'resume-qa'].includes(action),
    ),
    classification: recovery.classification,
    current: recovery.current === true,
    stopReason: recovery.stopReason || null,
  };
}

export function getMissionReviewedDeliverySummary(bundle) {
  if (!bundle) return null;
  const byRole = Object.fromEntries(bundle.workOrders.map((entry) => [entry.role, entry]));
  const canContinue = Boolean(
    bundle.executionPlan.status === 'active' &&
      bundle.executionPlan.activeWorkOrderId === byRole.builder?.id &&
      bundle.executionPlan.stoppedAt === 'request-builder-live-mutation-approval' &&
      byRole.builder?.status === 'waiting-gate' &&
      bundle.terminalGateApproval?.id === bundle.executionPlan.terminalGateApprovalId &&
      bundle.terminalGateApproval?.status === 'approved' &&
      bundle.terminalGateApproval?.allowedNextAction === 'builder-live-mutation',
  );

  return {
    byRole,
    canContinue,
    deliveryReady: bundle.executionPlan.status === 'delivery-ready',
    terminalGateApprovalId: bundle.terminalGateApproval?.id || null,
    terminalGateApprovalStatus: bundle.terminalGateApproval?.status || null,
  };
}

export function getCouncilCastEntry(role, councilSession) {
  const meta = COUNCIL_CAST_METADATA[role] || {
    archetype: '보이는 역할',
    avatarLabel: '임시 아바타',
    avatarMood: '현재 안건을 화면 위에 고정합니다.',
    avatarStyle: 'neutral',
    commandLine: '현재 추천안을 화면 위에 고정하는 역할입니다.',
    deskLabel: '임시 데스크',
    deskProp: '현재 안건 메모',
    mark: String(role || '?').slice(0, 2).toUpperCase(),
    officeLine: '현재 안건을 화면 위에 고정하는 자리',
    orderLabel: '역할 순서 미지정',
    previewLine: '협의회 추천안을 화면 위에 고정합니다.',
    rank: '임시 역할',
    tone: 'neutral',
  };
  const participant = Array.isArray(councilSession?.participants)
    ? councilSession.participants.find((entry) => entry.role === role) || null
    : null;
  const transcriptEntry = Array.isArray(councilSession?.transcript)
    ? councilSession.transcript.find((entry) => entry.role === role) || null
    : null;
  const currentAttempt = getCurrentRealCouncilAttempt(councilSession);
  const roleId = String(role || '').toLowerCase();
  const position =
    getLatestRealCouncilPositions(councilSession).find((entry) => entry.role === roleId) || null;
  const roleFailure = Array.isArray(currentAttempt?.conflictSummary?.requiredRoleFailures)
    ? currentAttempt.conflictSummary.requiredRoleFailures.find((entry) => entry.role === roleId) || null
    : null;

  return {
    archetype: meta.archetype,
    avatarLabel: meta.avatarLabel,
    avatarMood: meta.avatarMood,
    avatarStyle: meta.avatarStyle,
    commandLine: meta.commandLine,
    deskLabel: meta.deskLabel,
    deskProp: meta.deskProp,
    displayName: meta.displayName || role,
    focus: participant?.focus || meta.previewLine,
    mark: meta.mark,
    officeLine: meta.officeLine,
    orderLabel: meta.orderLabel,
    previewLine: meta.previewLine,
    rank: meta.rank,
    role,
    position,
    positionStatus: roleFailure ? 'failed' : position ? 'ready' : councilSession ? 'waiting' : 'idle',
    tone: meta.tone,
    transcriptContent: transcriptEntry?.content || null,
    transcriptStance: transcriptEntry?.stance || null,
  };
}

export function getCompanySignalEntries(options = {}) {
  const mission = options.mission || null;
  const councilSession = options.councilSession || null;
  const linkedTask = options.linkedTask || null;
  const completionReady = Boolean(options.completionReady);
  const missionStatus = mission ? getMissionStatusDisplay(mission.status) : '초안 전';
  const missionTone = mission ? getMissionStatusTone(mission.status) : 'warning';
  const councilStatus = councilSession
    ? isRealCouncilMode(councilSession.mode)
      ? councilSession.phase || councilSession.status
      : getAlignmentStatusDisplay(councilSession.alignment?.status || 'pending')
    : '대기';
  const councilTone = councilSession
    ? getAlignmentTone(councilSession.alignment?.status || 'pending')
    : 'warning';
  const executionStatus = !linkedTask
    ? '준비 전'
    : linkedTask.flags?.waitingApproval
      ? '승인 대기'
      : linkedTask.flags?.blocked
        ? '차단'
        : linkedTask.flags?.waitingDecision
          ? '결정 대기'
          : getTaskLifecycleDisplay(linkedTask.lifecycleState);
  const executionTone = !linkedTask
    ? 'warning'
    : linkedTask.flags?.blocked
      ? 'danger'
      : linkedTask.flags?.waitingApproval
        ? 'accent'
        : linkedTask.flags?.waitingDecision
          ? 'warning'
          : linkedTask.lifecycleState === 'Done'
            ? 'success'
            : 'neutral';
  const deliverablesStatus = completionReady
    ? 'close-out 완료'
    : linkedTask
      ? `리뷰 ${getReviewStatusDisplay(linkedTask.review?.status || 'pending')}`
      : '보고 전';
  const deliverablesTone = completionReady
    ? 'success'
    : linkedTask
      ? getReviewTone(linkedTask.review?.status || 'pending')
      : 'warning';
  const gateStatus = linkedTask?.flags?.waitingApproval
    ? '승인 대기'
    : linkedTask?.flags?.waitingDecision
      ? '결정 대기'
      : completionReady
        ? '정리됨'
        : councilSession
          ? '게이트 안정'
          : '열림 전';
  const gateTone = linkedTask?.flags?.waitingApproval
    ? 'accent'
    : linkedTask?.flags?.waitingDecision
      ? 'warning'
      : completionReady
        ? 'success'
        : 'neutral';
  return [
    {
      surface: 'mission',
      label: '안건',
      status: missionStatus,
      copy: mission ? '현재 안건 판단이 운영 흐름의 첫 줄입니다.' : '첫 안건이 올라오면 운영 흐름이 여기서 시작됩니다.',
      tone: missionTone,
    },
    {
      surface: 'council',
      label: '회의',
      status: councilStatus,
      copy: isRealCouncilMode(councilSession?.mode)
        ? '독립 position, conflict evidence, Conductor synthesis가 같은 세션에 기록됩니다.'
        : councilSession
          ? '네 역할이 같은 안건 아래에서 방향을 맞춥니다.'
          : '회의 준비 전이라 회의 흐름이 아직 열리지 않았습니다.',
      tone: councilTone,
    },
    {
      surface: 'execution',
      label: '실행',
      status: executionStatus,
      copy: linkedTask ? '현재 셀이 같은 안건의 다음 작업 지시를 끌고 갑니다.' : '회의 정렬 뒤에 첫 실행 셀이 이 줄을 이어받습니다.',
      tone: executionTone,
    },
    {
      surface: 'deliverables',
      label: '보고',
      status: deliverablesStatus,
      copy: completionReady ? '종료 정리와 보고 묶음이 이미 같은 경로를 닫았습니다.' : '리뷰와 보고 묶음이 다음 운영 판단을 위한 근거를 남깁니다.',
      tone: deliverablesTone,
    },
    {
      surface: 'decision-inbox',
      label: '게이트',
      status: gateStatus,
      copy: linkedTask?.flags?.waitingApproval || linkedTask?.flags?.waitingDecision
        ? '사람 게이트가 풀리면 흐름이 바로 다음 표면으로 이어집니다.'
        : '열린 사람 게이트가 없으면 같은 안건이 다음 줄로 자연스럽게 넘어갑니다.',
      tone: gateTone,
    },
  ];
}
