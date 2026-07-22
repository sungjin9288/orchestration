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

export function getMissionLearningCandidatePersistenceSummary(
  preview,
  durableCandidate,
  missionId,
  now = Date.now(),
) {
  const currentPreview =
    preview?.sourceMissionId === missionId && preview.persisted === false ? preview : null;
  const currentCandidate =
    durableCandidate?.sourceMissionId === missionId && durableCandidate.persisted === true
      ? durableCandidate
      : null;
  const unexpired = Boolean(
    currentPreview &&
      Number.isFinite(Date.parse(currentPreview.expiry?.expiresAt)) &&
      Date.parse(currentPreview.expiry.expiresAt) > now,
  );
  return {
    canPersist: Boolean(
      currentPreview &&
        !currentCandidate &&
        unexpired &&
        currentPreview.redactionStatus === 'review-required' &&
        currentPreview.reviewerStatus === 'review-required' &&
        currentPreview.promotionStatus === 'proposed' &&
        Object.values(currentPreview.authoritySummary || {}).every((value) => value === false),
    ),
    durableCandidate: currentCandidate,
    persisted: Boolean(currentCandidate),
    unexpired,
  };
}

export function getLearningCandidateReviewSummary(
  durableCandidate,
  durableReview,
  missionId,
  now = Date.now(),
) {
  const candidate =
    durableCandidate?.sourceMissionId === missionId && durableCandidate.persisted === true
      ? durableCandidate
      : null;
  const review =
    durableReview?.learningCandidateId === candidate?.id ? durableReview : null;
  const unexpired = Boolean(
    candidate &&
      Number.isFinite(Date.parse(candidate.expiry?.expiresAt)) &&
      Date.parse(candidate.expiry.expiresAt) > now,
  );
  const sourceClosed = Boolean(
    candidate &&
      candidate.reviewerStatus === 'review-required' &&
      candidate.promotionStatus === 'proposed' &&
      Object.values(candidate.authoritySummary || {}).every((value) => value === false),
  );

  return {
    canReview: Boolean(candidate && !review && unexpired && sourceClosed),
    candidate,
    review,
    reviewed: Boolean(review),
    unexpired,
  };
}

export function getMemoryCandidatePreviewSummary(
  durableCandidate,
  durableReview,
  missionId,
  now = Date.now(),
) {
  const candidate =
    durableCandidate?.sourceMissionId === missionId && durableCandidate.persisted === true
      ? durableCandidate
      : null;
  const review =
    durableReview?.learningCandidateId === candidate?.id ? durableReview : null;
  if (!candidate || !review) return null;

  const unexpired = Boolean(
    Number.isFinite(Date.parse(candidate.expiry?.expiresAt)) &&
      Date.parse(candidate.expiry.expiresAt) > now,
  );
  const sourceCurrent = Boolean(
    review.projectId === candidate.projectId &&
      review.sourceMissionId === candidate.sourceMissionId &&
      review.previewId === candidate.previewId &&
      review.candidateDigest === candidate.candidateDigest &&
      review.candidateRecordDigest === candidate.recordDigest &&
      candidate.reviewerStatus === 'review-required' &&
      candidate.promotionStatus === 'proposed',
  );
  const targetPathAllowlist = [...new Set(
    candidate.applicability?.targetPathAllowlist || [],
  )];
  const verificationCommands = [...new Set(
    candidate.applicability?.verificationCommands || [],
  )];
  const evidenceRefs = [...new Set(candidate.sourceEvidenceRefs || [])];
  const negativeEvidenceRefs = [...new Set(
    (candidate.negativeEvidence || [])
      .map((entry) => entry.sourceEvidenceRef)
      .filter(Boolean),
  )];
  const sourceRefs = [...new Set([
    candidate.id,
    review.id,
    ...evidenceRefs,
    ...(review.evidenceRefs || []),
  ])];

  return {
    canPreview: Boolean(
      review.decision === 'accepted' &&
        unexpired &&
        sourceCurrent &&
        targetPathAllowlist.length > 0 &&
        verificationCommands.length > 0 &&
        evidenceRefs.length > 0 &&
        negativeEvidenceRefs.length > 0,
    ),
    accepted: review.decision === 'accepted',
    unexpired,
    sourceCurrent,
    workspaceProjectId: candidate.projectId,
    targetPathAllowlist,
    verificationCommands,
    evidenceRefs,
    negativeEvidenceRefs,
    redactionRefs: [candidate.id, review.id].filter(
      (sourceRef) => sourceRefs.includes(sourceRef),
    ),
    reviewRefs: [review.id],
    source: {
      learningCandidateReviewId: review.id,
      previewId: candidate.previewId,
      candidateDigest: candidate.candidateDigest,
      candidateRecordDigest: candidate.recordDigest,
      reviewDigest: review.reviewDigest,
    },
  };
}

export function getMemoryItemPersistenceSummary(
  preview,
  durableItem,
  durableCandidate,
  durableReview,
  missionId,
) {
  const source = getMemoryCandidatePreviewSummary(
    durableCandidate,
    durableReview,
    missionId,
  );
  if (!source) return null;
  const item =
    durableItem?.persisted === true &&
    durableItem.status === 'stored' &&
    durableItem.sourceLearningCandidateId === durableCandidate.id &&
    durableItem.sourceLearningCandidateReviewId === durableReview.id &&
    durableItem.projectId === durableCandidate.projectId
      ? durableItem
      : null;
  const currentPreview =
    preview?.persisted === false &&
    preview.sourceLearningCandidateId === durableCandidate.id &&
    preview.sourceLearningCandidateReviewId === durableReview.id &&
    preview.previewId === durableCandidate.previewId &&
    preview.candidateDigest === durableCandidate.candidateDigest &&
    preview.candidateRecordDigest === durableCandidate.recordDigest &&
    preview.reviewDigest === durableReview.reviewDigest
      ? preview
      : null;

  return {
    canPersist: Boolean(source.canPreview && currentPreview && !item),
    currentPreview,
    item,
    persisted: Boolean(item),
    source,
  };
}

export function getMemoryRecallPreviewSummary(durableItem, preview, durableCandidate) {
  if (
    !durableItem ||
    durableItem.persisted !== true ||
    durableItem.status !== 'stored' ||
    durableItem.applicationStatus !== 'blocked' ||
    durableItem.promotionStatus !== 'blocked' ||
    durableItem.projectId !== durableItem.workspaceScope?.projectId ||
    durableItem.sourceLearningCandidateId !== durableCandidate?.id ||
    durableItem.projectId !== durableCandidate?.projectId
  ) {
    return null;
  }
  const unexpired = Date.parse(durableItem.expiresAt) > Date.now();
  const currentPreview =
    preview?.persisted === false &&
    preview.status === 'recall-ready' &&
    preview.retrievalMode === 'exact-id-operator-selected' &&
    preview.sourceMemoryItemId === durableItem.id &&
    preview.sourceMemoryItemRecordDigest === durableItem.recordDigest &&
    preview.projectId === durableItem.projectId
      ? preview
      : null;

  return {
    canPreview: Boolean(
      unexpired &&
        durableItem.applicability?.targetPathAllowlist?.length > 0 &&
        durableItem.applicability?.verificationCommands?.length > 0 &&
        durableItem.evidenceRefs?.length > 0 &&
        durableItem.negativeEvidenceRefs?.length > 0 &&
        durableItem.redactionRefs?.length > 0 &&
        durableItem.reviewRefs?.length > 0,
    ),
    currentPreview,
    item: durableItem,
    unexpired,
    workspaceProjectId: durableItem.projectId,
    targetPathAllowlist: [...new Set(
      durableItem.applicability?.targetPathAllowlist || [],
    )],
    verificationCommands: [...new Set(
      durableItem.applicability?.verificationCommands || [],
    )],
    evidenceRefs: [...new Set(durableItem.evidenceRefs || [])],
    negativeEvidenceRefs: [...new Set(durableItem.negativeEvidenceRefs || [])],
    redactionRefs: [...new Set(durableItem.redactionRefs || [])],
    reviewRefs: [...new Set(durableItem.reviewRefs || [])],
  };
}

export function getMemoryRecallPersistenceSummary(
  durableItem,
  preview,
  durableRecall,
  durableCandidate,
) {
  const source = getMemoryRecallPreviewSummary(
    durableItem,
    preview,
    durableCandidate,
  );
  if (!source) return null;

  const memoryRecall =
    durableRecall?.persisted === true &&
    durableRecall.status === 'recorded' &&
    durableRecall.sourceMemoryItemId === durableItem.id &&
    durableRecall.sourceMemoryItemRecordDigest === durableItem.recordDigest &&
    durableRecall.sourceLearningCandidateId === durableCandidate.id &&
    durableRecall.projectId === durableItem.projectId &&
    durableRecall.applicationStatus === 'blocked' &&
    durableRecall.recommendationStatus === 'blocked' &&
    durableRecall.missionInjectionStatus === 'blocked'
      ? durableRecall
      : null;

  return {
    ...source,
    canPersist: Boolean(source.currentPreview && !memoryRecall),
    canPreview: Boolean(source.canPreview && !memoryRecall),
    memoryRecall,
    persisted: Boolean(memoryRecall),
  };
}

function canonicalizeDigestValue(value) {
  if (Array.isArray(value)) return value.map(canonicalizeDigestValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalizeDigestValue(value[key])]),
  );
}

export async function computeMissionMemoryContextTargetDigest(mission) {
  if (
    !mission ||
    mission.status !== 'draft' ||
    mission.linkedTaskId !== null ||
    mission.councilSessionId !== null
  ) {
    throw new Error('exact current draft Mission만 context target으로 사용할 수 있습니다.');
  }
  const payload = {
    id: mission.id,
    projectId: mission.projectId,
    title: mission.title,
    goal: mission.goal,
    constraints: mission.constraints,
    deliverableType: mission.deliverableType,
    status: mission.status,
    linkedTaskId: mission.linkedTaskId,
    councilSessionId: mission.councilSessionId,
    createdAt: mission.createdAt,
    updatedAt: mission.updatedAt,
  };
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Mission digest를 계산할 Web Crypto를 사용할 수 없습니다.');
  }
  const bytes = new TextEncoder().encode(
    JSON.stringify(canonicalizeDigestValue(payload)),
  );
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getMissionMemoryContextPreviewSummary(
  durableItem,
  durableRecall,
  targetMission,
  preview,
) {
  const sourceCurrent = Boolean(
    durableItem?.persisted === true &&
      durableItem.status === 'stored' &&
      durableRecall?.persisted === true &&
      durableRecall.status === 'recorded' &&
      durableRecall.sourceMemoryItemId === durableItem.id &&
      durableRecall.sourceMemoryItemRecordDigest === durableItem.recordDigest &&
      durableRecall.projectId === durableItem.projectId &&
      durableRecall.workspaceScope?.projectId === durableItem.projectId &&
      durableRecall.applicationStatus === 'blocked' &&
      durableRecall.recommendationStatus === 'blocked' &&
      durableRecall.missionInjectionStatus === 'blocked',
  );
  if (!sourceCurrent) return null;

  const unexpired = Boolean(
    Date.parse(durableItem.expiresAt) > Date.now() &&
      Date.parse(durableRecall.expiresAt) > Date.now(),
  );
  const targetCurrent = Boolean(
    targetMission &&
      targetMission.status === 'draft' &&
      targetMission.linkedTaskId === null &&
      targetMission.councilSessionId === null &&
      targetMission.projectId === durableRecall.projectId,
  );
  const currentPreview =
    preview?.persisted === false &&
    preview.status === 'context-review-ready' &&
    preview.selectionMode === 'exact-id-operator-selected' &&
    preview.sourceMemoryRecallId === durableRecall.id &&
    preview.sourceMemoryRecallRecordDigest === durableRecall.recordDigest &&
    preview.sourceMemoryItemId === durableItem.id &&
    preview.sourceMemoryItemRecordDigest === durableItem.recordDigest &&
    preview.targetMissionId === targetMission?.id &&
    preview.targetMissionStatus === 'draft' &&
    preview.projectId === durableRecall.projectId
      ? preview
      : null;

  return {
    canPreview: Boolean(
      unexpired &&
        targetCurrent &&
        durableRecall.applicability?.targetPathAllowlist?.length > 0 &&
        durableRecall.applicability?.verificationCommands?.length > 0 &&
        durableRecall.evidenceRefs?.length > 0 &&
        durableRecall.negativeEvidenceRefs?.length > 0 &&
        durableRecall.redactionRefs?.length > 0 &&
        durableRecall.reviewRefs?.length > 0
    ),
    currentPreview,
    item: durableItem,
    recall: durableRecall,
    targetCurrent,
    targetMission: targetCurrent ? targetMission : null,
    unexpired,
    workspaceProjectId: durableRecall.projectId,
    targetPathAllowlist: [...new Set(
      durableRecall.applicability?.targetPathAllowlist || [],
    )],
    verificationCommands: [...new Set(
      durableRecall.applicability?.verificationCommands || [],
    )],
    evidenceRefs: [...new Set(durableRecall.evidenceRefs || [])],
    negativeEvidenceRefs: [...new Set(durableRecall.negativeEvidenceRefs || [])],
    redactionRefs: [...new Set(durableRecall.redactionRefs || [])],
    reviewRefs: [...new Set(durableRecall.reviewRefs || [])],
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
