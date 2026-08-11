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

export function parseSpecialistBatchList(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
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

export function getSpecialistBatchPreviewSummary(
  preview,
  councilSession,
  staffingPlan,
  staffingEntry,
) {
  if (
    !preview ||
    preview.schemaVersion !== 1 ||
    preview.persisted !== false ||
    preview.status !== 'preview-ready' ||
    preview.councilSessionId !== councilSession?.id ||
    preview.councilSessionSourceDigest !== councilSession?.sourceDigest ||
    preview.currentAttemptId !== councilSession?.currentAttemptId ||
    preview.missionId !== councilSession?.missionId ||
    preview.projectId !== staffingPlan?.projectId ||
    preview.staffingPlanId !== staffingPlan?.id ||
    preview.staffingPlanRecordDigest !== staffingPlan?.recordDigest ||
    preview.staffingEntryId !== staffingEntry?.id ||
    preview.staffingEntryRecordDigest !== staffingEntry?.recordDigest
  ) {
    return null;
  }

  return {
    authorityClosed:
      preview.executionAllowed === false &&
      preview.persistenceAllowed === false &&
      preview.maxProviderCalls === 0,
    cells: Array.isArray(preview.cells) ? preview.cells : [],
    deadlineAt: preview.deadline?.deadlineAt || null,
    previewDigest: preview.previewDigest,
    previewId: preview.id,
    sourceDigest: preview.sourceDigest,
  };
}

export function getSpecialistCellRetryEligibility(
  specialistBatch,
  specialistCellAttempts,
  specialistCellRetries,
  previewSummary,
) {
  const retries = Array.isArray(specialistCellRetries)
    ? specialistCellRetries
    : [];
  const activeRetry = retries.some(
    (entry) => entry?.specialistCellRetry?.status === 'active',
  );
  const retryBySourceId = new Map(
    retries.map((entry) => [
      entry?.specialistCellRetry?.sourceCellAttemptId,
      entry,
    ]),
  );
  return (specialistCellAttempts || []).map((attempt) => {
    const retry = retryBySourceId.get(attempt.id) || null;
    return {
      attempt,
      retry,
      eligible: Boolean(
        ['partial-failed', 'failed'].includes(specialistBatch?.status) &&
          attempt.attemptNumber === 1 &&
          attempt.status === 'failed' &&
          previewSummary?.sourceDigest === specialistBatch?.sourceDigest &&
          !retry &&
          !activeRetry,
      ),
    };
  });
}

export function getOpsSupervisionTarget(targetType, target, parent) {
  if (
    !target ||
    !parent ||
    target.status !== 'active' ||
    typeof target.recordDigest !== 'string'
  ) {
    return null;
  }

  if (
    targetType === 'work-order-attempt' &&
    target.executionPlanId === parent.id &&
    Array.isArray(parent.workOrderIds) &&
    parent.workOrderIds.includes(target.workOrderId)
  ) {
    return {
      targetType,
      targetId: target.id,
      parentId: parent.id,
      expectedTargetRecordDigest: target.recordDigest,
      expectedParentDigest: null,
    };
  }

  if (
    targetType === 'specialist-first-attempt' &&
    target.attemptNumber === 1 &&
    parent.status === 'active' &&
    target.specialistBatchId === parent.id &&
    Array.isArray(parent.cellAttemptIds) &&
    parent.cellAttemptIds.includes(target.id) &&
    typeof parent.recordDigest === 'string'
  ) {
    return {
      targetType,
      targetId: target.id,
      parentId: parent.id,
      expectedTargetRecordDigest: target.recordDigest,
      expectedParentDigest: parent.recordDigest,
    };
  }

  if (
    targetType === 'specialist-retry-attempt' &&
    target.attemptNumber === 2 &&
    parent.status === 'active' &&
    parent.retryCellAttemptId === target.id &&
    typeof parent.recordDigest === 'string'
  ) {
    return {
      targetType,
      targetId: target.id,
      parentId: parent.id,
      expectedTargetRecordDigest: target.recordDigest,
      expectedParentDigest: parent.recordDigest,
    };
  }

  return null;
}

export function getOpsAttemptDispositionRequest(preview, acknowledgement) {
  if (
    !preview ||
    preview.persisted !== false ||
    preview.status !== 'supervision-required' ||
    !preview.id ||
    !preview.previewDigest ||
    !preview.targetRecordDigest ||
    !preview.parentDigest ||
    acknowledgement !== 'quarantine-without-settlement-or-recovery'
  ) {
    return null;
  }
  return {
    targetType: preview.targetType,
    targetId: preview.targetId,
    parentId: preview.parentId,
    expectedTargetRecordDigest: preview.targetRecordDigest,
    expectedParentDigest: preview.parentDigest,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    decision: 'quarantine',
    reasonCode: 'operator-uncertain-outcome-after-interruption',
    acknowledgement,
  };
}

export function isExactOpsAttemptDisposition(disposition, source) {
  return Boolean(
    disposition &&
      source &&
      disposition.decision === 'quarantine' &&
      disposition.reasonCode ===
        'operator-uncertain-outcome-after-interruption' &&
      disposition.targetType === source.targetType &&
      disposition.targetId === source.targetId &&
      disposition.parentId === source.parentId &&
      disposition.targetRecordDigest ===
        (source.targetRecordDigest || source.expectedTargetRecordDigest) &&
      disposition.parentDigest ===
        (source.parentDigest || source.expectedParentDigest) &&
      disposition.authoritySummary?.quarantineEvidenceAllowed === true &&
      disposition.authoritySummary?.lateSettlementAllowed === false,
  );
}

export function getOpsAttemptResumeSource(disposition, snapshot) {
  if (
    !disposition ||
    !snapshot ||
    disposition.targetType !== 'work-order-attempt' ||
    disposition.decision !== 'quarantine' ||
    disposition.authoritySummary?.lateSettlementAllowed !== false
  ) {
    return null;
  }
  const sourceAttempt = snapshot.workOrderAttempts?.[disposition.targetId] || null;
  const executionPlan = snapshot.executionPlans?.[disposition.parentId] || null;
  const workOrder = sourceAttempt
    ? snapshot.workOrders?.[sourceAttempt.workOrderId] || null
    : null;
  const checkpoint = sourceAttempt?.checkpointRef
    ? snapshot.workflowCheckpoints?.[sourceAttempt.checkpointRef] || null
    : null;
  if (
    !sourceAttempt ||
    !executionPlan ||
    !workOrder ||
    !checkpoint ||
    sourceAttempt.status !== 'active' ||
    sourceAttempt.role !== 'qa' ||
    sourceAttempt.action !== 'run-qa' ||
    sourceAttempt.command !== 'step' ||
    sourceAttempt.attemptNumber !== 1 ||
    sourceAttempt.recordDigest !== disposition.targetRecordDigest ||
    sourceAttempt.executionPlanId !== executionPlan.id ||
    sourceAttempt.workOrderId !== workOrder.id ||
    executionPlan.status !== 'reviewing' ||
    executionPlan.activeWorkOrderId !== workOrder.id ||
    executionPlan.latestCheckpointId !== checkpoint.id ||
    workOrder.status !== 'active' ||
    workOrder.role !== 'qa' ||
    checkpoint.executionPlanId !== executionPlan.id ||
    checkpoint.stage !== 'qa-ready' ||
    checkpoint.status !== 'consumed' ||
    checkpoint.sourceDigest !== executionPlan.sourceDigest
  ) {
    return null;
  }
  return { checkpoint, disposition, executionPlan, sourceAttempt, workOrder };
}

export function getOpsAttemptResumeRequest(
  source,
  expectedExecutionPlanDigest,
  sourceWorkerStopConfirmedAt,
  evaluatedAt,
  acknowledgement,
) {
  if (
    !source ||
    expectedExecutionPlanDigest !== source.disposition.parentDigest ||
    acknowledgement !== 'source-worker-stopped-and-read-only-qa-confirmed' ||
    typeof sourceWorkerStopConfirmedAt !== 'string' ||
    typeof evaluatedAt !== 'string'
  ) {
    return null;
  }
  return {
    dispositionRecordDigest: source.disposition.recordDigest,
    sourceAttemptId: source.sourceAttempt.id,
    sourceAttemptRecordDigest: source.sourceAttempt.recordDigest,
    executionPlanId: source.executionPlan.id,
    expectedExecutionPlanDigest,
    checkpointId: source.checkpoint.id,
    checkpointDigest: source.checkpoint.checkpointDigest,
    inputDigest: source.checkpoint.inputDigest,
    authorityDigest: source.checkpoint.authorityDigest,
    expectedWorkOrderId: source.workOrder.id,
    action: 'resume-qa',
    evaluatedAt,
    sourceWorkerStopConfirmedAt,
    decision: 'resume-safe-checkpoint',
    acknowledgement,
    expectedReplacementAttemptNumber: 2,
  };
}

export function isExactOpsAttemptResume(resume, source) {
  return Boolean(
    resume &&
      source &&
      resume.sourceDispositionId === source.disposition.id &&
      resume.sourceDispositionRecordDigest === source.disposition.recordDigest &&
      resume.sourceAttemptId === source.sourceAttempt.id &&
      resume.sourceAttemptRecordDigest === source.sourceAttempt.recordDigest &&
      resume.executionPlanId === source.executionPlan.id &&
      resume.workOrderId === source.workOrder.id &&
      resume.sourceCheckpointId === source.checkpoint.id &&
      resume.sourceCheckpointDigest === source.checkpoint.checkpointDigest &&
      resume.sourceInputDigest === source.checkpoint.inputDigest &&
      resume.sourceAuthorityDigest === source.checkpoint.authorityDigest &&
      resume.replacementAttemptId !== source.sourceAttempt.id &&
      resume.action === 'resume-qa' &&
      resume.role === 'qa' &&
      resume.decision === 'resume-safe-checkpoint' &&
      resume.authoritySummary?.replacementQaAttemptAllowed === true &&
      resume.authoritySummary?.sourceAttemptSettlementAllowed === false &&
      resume.authoritySummary?.sourceMutationAllowed === false &&
      resume.authoritySummary?.retryAllowed === false,
  );
}

export function getReviewerReworkPreviewTarget(bundle) {
  if (!bundle?.executionPlan || !Array.isArray(bundle.workOrders)) return null;
  const executionPlan = bundle.executionPlan;
  const byRole = Object.fromEntries(
    bundle.workOrders.map((workOrder) => [workOrder.role, workOrder]),
  );
  const latestAttempt = bundle.latestWorkOrderAttempt || null;
  const qaAttempt = (bundle.workOrderAttempts || []).some(
    (attempt) =>
      attempt.role === 'qa' ||
      attempt.action === 'run-qa' ||
      attempt.workOrderId === byRole.qa?.id,
  );
  if (
    executionPlan.status !== 'blocked' ||
    executionPlan.stopReason !== 'reviewer-changes-requested' ||
    executionPlan.stoppedAt !== 'reviewer' ||
    executionPlan.activeWorkOrderId !== null ||
    bundle.workOrders.length !== 3 ||
    byRole.builder?.status !== 'completed' ||
    byRole.reviewer?.status !== 'changes-requested' ||
    byRole.qa?.status !== 'blocked-dependency' ||
    qaAttempt ||
    latestAttempt?.workOrderId !== byRole.reviewer.id ||
    latestAttempt?.role !== 'reviewer' ||
    latestAttempt?.action !== 'run-reviewer' ||
    latestAttempt?.status !== 'changes-requested' ||
    latestAttempt?.stopReason !== 'reviewer-changes-requested' ||
    latestAttempt?.attemptNumber !== 1 ||
    latestAttempt?.sourceDigest !== executionPlan.sourceDigest ||
    latestAttempt?.runRefs?.length !== 1 ||
    latestAttempt?.artifactRefs?.length !== 1 ||
    byRole.reviewer.completionRunId !== latestAttempt.runRefs[0] ||
    byRole.reviewer.reviewArtifactId !== latestAttempt.artifactRefs[0]
  ) {
    return null;
  }

  return {
    executionPlanId: executionPlan.id,
    reviewerWorkOrderId: byRole.reviewer.id,
    reviewerAttemptId: latestAttempt.id,
    reviewerRunId: byRole.reviewer.completionRunId,
    reviewArtifactId: byRole.reviewer.reviewArtifactId,
    expectedAttemptRecordDigest: latestAttempt.recordDigest,
  };
}

export function getReviewerReworkPlanRecordRequest(
  preview,
  { rationale, reviewedAt },
) {
  if (
    !preview ||
    preview.persisted !== false ||
    preview.status !== 'rework-review-required' ||
    !preview.executionPlanId ||
    !preview.reviewerWorkOrderId ||
    !preview.reviewerAttemptId ||
    !preview.reviewerRunId ||
    !preview.reviewArtifactId ||
    !/^[a-f0-9]{64}$/.test(preview.executionPlanDigest || '') ||
    !/^[a-f0-9]{64}$/.test(preview.attemptRecordDigest || '') ||
    !/^[a-f0-9]{64}$/.test(preview.previewDigest || '') ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    reviewerWorkOrderId: preview.reviewerWorkOrderId,
    reviewerAttemptId: preview.reviewerAttemptId,
    reviewerRunId: preview.reviewerRunId,
    reviewArtifactId: preview.reviewArtifactId,
    expectedExecutionPlanDigest: preview.executionPlanDigest,
    expectedAttemptRecordDigest: preview.attemptRecordDigest,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    recordApproval: {
      decision: 'record-rework-plan',
      acknowledgement:
        'record-exact-reviewer-rework-plan-without-execution',
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getReworkPlanAcceptanceRequest(record, { rationale, reviewedAt }) {
  if (
    !record ||
    record.persisted !== true ||
    record.status !== 'review-required' ||
    !record.id ||
    !/^[a-f0-9]{64}$/.test(record.recordDigest || '') ||
    !record.previewId ||
    !/^[a-f0-9]{64}$/.test(record.previewDigest || '') ||
    !/^[a-f0-9]{64}$/.test(record.sourceExecutionPlanDigest || '') ||
    !/^[a-f0-9]{64}$/.test(record.sourceAttemptRecordDigest || '') ||
    !/^[a-f0-9]{64}$/.test(record.sourceProgressDigest || '') ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    reworkPlanRecordDigest: record.recordDigest,
    previewId: record.previewId,
    previewDigest: record.previewDigest,
    sourceExecutionPlanDigest: record.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: record.sourceAttemptRecordDigest,
    sourceProgressDigest: record.sourceProgressDigest,
    decision: 'accept',
    acknowledgement: 'accept-exact-rework-plan-without-execution',
    rationale: rationale.trim(),
    reviewedAt,
  };
}

export function getBuilderReworkPreflightRequest(
  record,
  acceptance,
  bundle,
  { rationale, reviewedAt },
) {
  const builder = bundle?.workOrders?.find((workOrder) => workOrder.role === 'builder');
  if (
    !record || !acceptance || !builder ||
    acceptance.reworkPlanId !== record.id ||
    acceptance.reworkPlanRecordDigest !== record.recordDigest ||
    acceptance.decision !== 'accepted' ||
    record.nextAttemptNumber !== 2 || record.maxAdditionalBuilderAttempts !== 1 ||
    !/^[a-f0-9]{64}$/.test(record.recordDigest || '') ||
    !/^[a-f0-9]{64}$/.test(acceptance.acceptanceDigest || '') ||
    typeof rationale !== 'string' || !rationale.trim() ||
    typeof reviewedAt !== 'string' || Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    reworkPlanAcceptanceId: acceptance.id,
    reworkPlanRecordDigest: record.recordDigest,
    acceptanceDigest: acceptance.acceptanceDigest,
    sourceExecutionPlanDigest: record.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: record.sourceAttemptRecordDigest,
    sourceProgressDigest: record.sourceProgressDigest,
    builderWorkOrderId: builder.id,
    builderWorkOrderDigest: computeWorkOrderRecordDigest(builder),
    reworkAttemptNumber: 2,
    workOrderAttemptNumber: 3,
    evaluatedAt: reviewedAt,
    dispatchApproval: {
      decision: 'dispatch-builder-rework-preflight',
      acknowledgement:
        'dispatch-one-local-no-write-rework-preflight-without-mutation-approval',
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getBuilderReworkMutationApprovalRequest(
  approvalEnvelope,
  { rationale, reviewedAt },
) {
  const source = approvalEnvelope?.readiness?.requestSource;
  const digestFields = [
    'builderReworkDispatchDigest',
    'workOrderAttemptRecordDigest',
    'preflightRunRecordDigest',
    'preflightArtifactRecordDigest',
    'preflightArtifactContentDigest',
    'sourceProgressDigest',
  ];
  if (
    approvalEnvelope?.readiness?.status !== 'request-ready' ||
    !source ||
    !source.builderReworkDispatchId ||
    !source.workOrderAttemptId ||
    !source.preflightRunId ||
    !source.preflightArtifactId ||
    digestFields.some(
      (field) => !/^[a-f0-9]{64}$/.test(source[field] || ''),
    ) ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    builderReworkDispatchId: source.builderReworkDispatchId,
    builderReworkDispatchDigest: source.builderReworkDispatchDigest,
    workOrderAttemptId: source.workOrderAttemptId,
    workOrderAttemptRecordDigest: source.workOrderAttemptRecordDigest,
    preflightRunId: source.preflightRunId,
    preflightRunRecordDigest: source.preflightRunRecordDigest,
    preflightArtifactId: source.preflightArtifactId,
    preflightArtifactRecordDigest: source.preflightArtifactRecordDigest,
    preflightArtifactContentDigest: source.preflightArtifactContentDigest,
    sourceProgressDigest: source.sourceProgressDigest,
    evaluatedAt: reviewedAt,
    approvalRequest: {
      decision: 'request-builder-rework-mutation-approval',
      acknowledgement:
        'create-one-reviewable-rework-approval-without-source-mutation',
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getBuilderReworkSourceMutationRequest(
  approvalEnvelope,
  { acknowledgement, rationale, reviewedAt },
) {
  const source = approvalEnvelope?.readiness?.requestSource;
  const approval = approvalEnvelope?.approval;
  const digestFields = [
    'builderReworkDispatchDigest',
    'workOrderAttemptRecordDigest',
    'preflightRunRecordDigest',
    'preflightArtifactRecordDigest',
    'preflightArtifactContentDigest',
    'sourceProgressDigest',
  ];
  if (
    approval?.status !== 'approved' ||
    approval.allowedNextAction !== 'builder-rework-live-mutation' ||
    approval.scope !== 'builder-rework' ||
    !/^[a-f0-9]{64}$/.test(approval.metadata?.bindingDigest || '') ||
    !source ||
    !source.builderReworkDispatchId ||
    !source.workOrderAttemptId ||
    !source.preflightRunId ||
    !source.preflightArtifactId ||
    digestFields.some(
      (field) => !/^[a-f0-9]{64}$/.test(source[field] || ''),
    ) ||
    acknowledgement !==
      'mutate-only-approved-rework-targets-and-stop-before-reviewer' ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    builderReworkDispatchId: source.builderReworkDispatchId,
    builderReworkDispatchDigest: source.builderReworkDispatchDigest,
    workOrderAttemptId: source.workOrderAttemptId,
    workOrderAttemptRecordDigest: source.workOrderAttemptRecordDigest,
    preflightRunId: source.preflightRunId,
    preflightRunRecordDigest: source.preflightRunRecordDigest,
    preflightArtifactId: source.preflightArtifactId,
    preflightArtifactRecordDigest: source.preflightArtifactRecordDigest,
    preflightArtifactContentDigest:
      source.preflightArtifactContentDigest,
    mutationApprovalId: approval.id,
    mutationApprovalBindingDigest: approval.metadata.bindingDigest,
    sourceProgressDigest: source.sourceProgressDigest,
    evaluatedAt: reviewedAt,
    mutationRequest: {
      decision: 'run-builder-rework-live-mutation',
      acknowledgement,
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getReviewerReexecutionRequest(
  envelope,
  { acknowledgement, rationale, reviewedAt },
) {
  const source = envelope?.readiness?.requestSource || envelope?.requestSource;
  const identifiers = [
    'builderReworkDispatchId',
    'builderReworkAttemptId',
    'mutationRunId',
    'reviewerWorkOrderId',
    'sourceReviewerAttemptId',
  ];
  const digests = [
    'builderReworkDispatchDigest',
    'builderReworkAttemptRecordDigest',
    'mutationEvidenceDigest',
    'reviewerWorkOrderDigest',
    'sourceReviewerAttemptRecordDigest',
    'sourceProgressDigest',
  ];
  if (
    !source ||
    identifiers.some(
      (field) =>
        typeof source[field] !== 'string' ||
        !source[field] ||
        source[field] !== source[field].trim(),
    ) ||
    digests.some(
      (field) => !/^[a-f0-9]{64}$/.test(source[field] || ''),
    ) ||
    acknowledgement !==
      'review-exact-rework-result-once-and-stop-before-qa' ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    builderReworkDispatchId: source.builderReworkDispatchId,
    builderReworkDispatchDigest: source.builderReworkDispatchDigest,
    builderReworkAttemptId: source.builderReworkAttemptId,
    builderReworkAttemptRecordDigest:
      source.builderReworkAttemptRecordDigest,
    mutationRunId: source.mutationRunId,
    mutationEvidenceDigest: source.mutationEvidenceDigest,
    reviewerWorkOrderId: source.reviewerWorkOrderId,
    reviewerWorkOrderDigest: source.reviewerWorkOrderDigest,
    sourceReviewerAttemptId: source.sourceReviewerAttemptId,
    sourceReviewerAttemptRecordDigest:
      source.sourceReviewerAttemptRecordDigest,
    sourceProgressDigest: source.sourceProgressDigest,
    evaluatedAt: reviewedAt,
    reviewerRequest: {
      decision: 'run-reviewer-reexecution',
      acknowledgement,
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getReworkQaExecutionRequest(
  envelope,
  { acknowledgement, rationale, reviewedAt },
) {
  const source = envelope?.requestSource || envelope?.readiness?.requestSource;
  const identifiers = [
    'qaWorkOrderId',
    'qaReadyCheckpointId',
    'reviewerReexecutionAttemptId',
    'reviewerRunId',
  ];
  const digests = [
    'authorityDigest',
    'checkpointDigest',
    'inputDigest',
    'mutationEvidenceDigest',
    'qaInputDigest',
    'qaWorkOrderDigest',
    'reviewerEvidenceDigest',
    'reviewerReexecutionAttemptRecordDigest',
    'sourceDigest',
  ];
  if (
    !source ||
    identifiers.some(
      (field) =>
        typeof source[field] !== 'string' ||
        !source[field] ||
        source[field] !== source[field].trim(),
    ) ||
    digests.some((field) => !/^[a-f0-9]{64}$/.test(source[field] || '')) ||
    acknowledgement !==
      'run-only-source-bound-node-checks-and-stop-before-delivery-package' ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    reviewerReexecutionAttemptId: source.reviewerReexecutionAttemptId,
    reviewerReexecutionAttemptRecordDigest:
      source.reviewerReexecutionAttemptRecordDigest,
    reviewerRunId: source.reviewerRunId,
    reviewerEvidenceDigest: source.reviewerEvidenceDigest,
    mutationEvidenceDigest: source.mutationEvidenceDigest,
    qaWorkOrderId: source.qaWorkOrderId,
    qaWorkOrderDigest: source.qaWorkOrderDigest,
    qaReadyCheckpointId: source.qaReadyCheckpointId,
    checkpointDigest: source.checkpointDigest,
    inputDigest: source.inputDigest,
    authorityDigest: source.authorityDigest,
    sourceDigest: source.sourceDigest,
    qaInputDigest: source.qaInputDigest,
    evaluatedAt: reviewedAt,
    qaRequest: {
      decision: 'run-rework-qa-once',
      acknowledgement,
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function getReworkDeliveryPackagePreviewQuery(
  envelope,
  evaluatedAt,
) {
  const attempt = envelope?.workOrderAttempt;
  const run = envelope?.qaRun;
  const artifact = envelope?.qaArtifact;
  const checkpoint = envelope?.terminalCheckpoint;
  const digests = [
    attempt?.recordDigest,
    checkpoint?.checkpointDigest,
    envelope?.sourceDigest,
    envelope?.qaInputDigest,
  ];
  const identifiers = [
    attempt?.id,
    run?.id,
    artifact?.id,
    checkpoint?.id,
  ];
  const qaFinishedAt = run?.finishedAt;
  if (
    envelope?.status !== 'completed' ||
    envelope?.nextGate !== 'separate-delivery-package-decision-required' ||
    attempt?.status !== 'completed' ||
    run?.status !== 'completed' ||
    run?.summary?.verdict !== 'passed' ||
    artifact?.type !== 'qa-evidence' ||
    checkpoint?.stage !== 'delivery-ready' ||
    checkpoint?.status !== 'terminal' ||
    identifiers.some(
      (value) =>
        typeof value !== 'string' ||
        !value ||
        value !== value.trim(),
    ) ||
    digests.some((value) => !/^[a-f0-9]{64}$/.test(value || '')) ||
    typeof evaluatedAt !== 'string' ||
    Number.isNaN(Date.parse(evaluatedAt)) ||
    new Date(evaluatedAt).toISOString() !== evaluatedAt ||
    typeof qaFinishedAt !== 'string' ||
    Number.isNaN(Date.parse(qaFinishedAt)) ||
    new Date(qaFinishedAt).toISOString() !== qaFinishedAt ||
    Date.parse(evaluatedAt) < Date.parse(qaFinishedAt)
  ) {
    return null;
  }
  return {
    qaWorkOrderAttemptId: attempt.id,
    qaWorkOrderAttemptRecordDigest: attempt.recordDigest,
    qaRunId: run.id,
    qaEvidenceArtifactId: artifact.id,
    deliveryReadyCheckpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    sourceDigest: envelope.sourceDigest,
    qaInputDigest: envelope.qaInputDigest,
    evaluatedAt,
  };
}

export const REWORK_DELIVERY_PREVIEW_RESPONSE_KEYS = Object.freeze([
  'acceptedRisks',
  'allowedActions',
  'authoritySummary',
  'blockedActions',
  'deliveredArtifactRefs',
  'evaluatedAt',
  'executionPlanId',
  'generatedAt',
  'id',
  'missionId',
  'mutationEvidenceDigest',
  'persisted',
  'previewDigest',
  'projectId',
  'qaEvidenceArtifactId',
  'qaInputDigest',
  'qaRunId',
  'qaWorkOrderAttemptId',
  'qaWorkOrderId',
  'reviewerEvidenceDigest',
  'reworkDeliveryEvidenceDigest',
  'reworkPlanId',
  'schemaVersion',
  'sourceDigest',
  'status',
  'terminalCheckpointDigest',
  'terminalCheckpointId',
  'unresolvedItems',
  'verificationSummary',
  'workOrderResults',
]);

export const REWORK_DELIVERY_PREVIEW_AUTHORITY_KEYS = Object.freeze([
  'approvalBypassAllowed',
  'commitAllowed',
  'durablePersistenceAllowed',
  'learningApplicationAllowed',
  'memoryApplicationAllowed',
  'missionCloseOutAllowed',
  'packageAcceptanceAllowed',
  'packageDecisionAllowed',
  'profilePolicyMutationAllowed',
  'providerExecutionAllowed',
  'pushAllowed',
  'recoveryAllowed',
  'releaseAllowed',
  'retryAllowed',
  'schedulingAllowed',
  'sourceMutationAllowed',
  'taskCloseOutAllowed',
]);

export const REWORK_DELIVERY_PREVIEW_BLOCKED_ACTIONS = Object.freeze([
  'persist-delivery-package',
  'accept-delivery-package',
  'reject-delivery-package',
  'request-package-changes',
  'close-mission',
  'close-task',
  'retry-qa',
  'recover-qa',
  'execute-provider',
  'mutate-source',
  'apply-memory',
  'commit',
  'push',
  'release',
  'schedule-background',
  'mutate-policy',
  'bypass-approval',
]);

function hasExactKeys(value, expectedKeys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  return (
    actual.length === expectedKeys.length &&
    actual.every((key, index) => key === expectedKeys[index])
  );
}

export function isExactReworkDeliveryPackagePreview(
  preview,
  reworkPlan,
  envelope,
  query,
) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/;
  const authority = preview?.authoritySummary;
  const workOrderResults = preview?.workOrderResults;
  const expectedWorkOrderIds = [
    reworkPlan?.evidenceRefs?.builderWorkOrderRef,
    reworkPlan?.reviewerWorkOrderId,
    envelope?.qaWorkOrder?.id,
  ];
  const validWorkOrderResults =
    Array.isArray(workOrderResults) &&
    workOrderResults.length === 3 &&
    workOrderResults.every((entry, index) => {
      const refGroups = [
        entry?.attemptRefs,
        entry?.runRefs,
        entry?.artifactRefs,
      ];
      return (
        hasExactKeys(entry, [
          'artifactRefs',
          'attemptRefs',
          'role',
          'runRefs',
          'status',
          'workOrderId',
        ]) &&
        entry.workOrderId === expectedWorkOrderIds[index] &&
        entry.role === ['builder', 'reviewer', 'qa'][index] &&
        entry.status === 'completed' &&
        refGroups.every(
          (refs) =>
            Array.isArray(refs) &&
            refs.length > 0 &&
            new Set(refs).size === refs.length &&
            refs.every(
              (ref) =>
                typeof ref === 'string' && identifierPattern.test(ref),
            ),
        )
      );
    });
  const expectedArtifactRefs = validWorkOrderResults
    ? [
        ...new Set(
          workOrderResults.flatMap((entry) => entry.artifactRefs),
        ),
      ]
    : [];
  return Boolean(
    hasExactKeys(preview, REWORK_DELIVERY_PREVIEW_RESPONSE_KEYS) &&
      preview.schemaVersion === 24 &&
      preview.persisted === false &&
      preview.status === 'rework-delivery-preview-ready' &&
      preview.projectId === reworkPlan?.projectId &&
      preview.missionId === reworkPlan?.missionId &&
      preview.executionPlanId === reworkPlan?.executionPlanId &&
      preview.reworkPlanId === reworkPlan?.id &&
      preview.qaWorkOrderId === expectedWorkOrderIds[2] &&
      preview.qaWorkOrderAttemptId === query?.qaWorkOrderAttemptId &&
      preview.qaRunId === query?.qaRunId &&
      preview.qaEvidenceArtifactId === query?.qaEvidenceArtifactId &&
      preview.terminalCheckpointId === query?.deliveryReadyCheckpointId &&
      preview.terminalCheckpointDigest === query?.checkpointDigest &&
      preview.sourceDigest === query?.sourceDigest &&
      preview.qaInputDigest === query?.qaInputDigest &&
      preview.evaluatedAt === query?.evaluatedAt &&
      digestPattern.test(preview.previewDigest || '') &&
      digestPattern.test(preview.reworkDeliveryEvidenceDigest || '') &&
      preview.id ===
        `rework-delivery-package-preview-${preview.previewDigest.slice(0, 16)}` &&
      Array.isArray(preview.allowedActions) &&
      preview.allowedActions.length === 0 &&
      Array.isArray(preview.unresolvedItems) &&
      preview.unresolvedItems.length === 0 &&
      Array.isArray(preview.blockedActions) &&
      preview.blockedActions.length ===
        REWORK_DELIVERY_PREVIEW_BLOCKED_ACTIONS.length &&
      preview.blockedActions.every(
        (action, index) =>
          action === REWORK_DELIVERY_PREVIEW_BLOCKED_ACTIONS[index],
      ) &&
      hasExactKeys(authority, REWORK_DELIVERY_PREVIEW_AUTHORITY_KEYS) &&
      Object.values(authority).every((value) => value === false) &&
      validWorkOrderResults &&
      Array.isArray(preview.deliveredArtifactRefs) &&
      preview.deliveredArtifactRefs.length === expectedArtifactRefs.length &&
      preview.deliveredArtifactRefs.every(
        (ref, index) => ref === expectedArtifactRefs[index],
      ) &&
      preview.verificationSummary?.verdict === 'passed' &&
      preview.verificationSummary?.mutationDetected === false
  );
}

export function getReworkDeliveryPackageRecordRequest(
  preview,
  envelope,
  { acknowledgement, rationale, reviewedAt },
) {
  if (
    !preview ||
    preview.persisted !== false ||
    preview.status !== 'rework-delivery-preview-ready' ||
    !envelope?.workOrderAttempt ||
    preview.qaWorkOrderAttemptId !== envelope.workOrderAttempt.id ||
    preview.qaRunId !== envelope.qaRun?.id ||
    preview.qaEvidenceArtifactId !== envelope.qaArtifact?.id ||
    !/^[a-f0-9]{64}$/.test(envelope.workOrderAttempt.recordDigest || '') ||
    !/^[a-f0-9]{64}$/.test(preview.previewDigest || '') ||
    !/^[a-f0-9]{64}$/.test(preview.reworkDeliveryEvidenceDigest || '') ||
    acknowledgement !==
      'record-exact-rework-delivery-package-without-acceptance-or-close-out' ||
    typeof rationale !== 'string' ||
    !rationale.trim() ||
    typeof reviewedAt !== 'string' ||
    Number.isNaN(Date.parse(reviewedAt)) ||
    new Date(reviewedAt).toISOString() !== reviewedAt
  ) {
    return null;
  }
  return {
    qaWorkOrderAttemptId: preview.qaWorkOrderAttemptId,
    qaWorkOrderAttemptRecordDigest: envelope.workOrderAttempt.recordDigest,
    qaRunId: preview.qaRunId,
    qaEvidenceArtifactId: preview.qaEvidenceArtifactId,
    deliveryReadyCheckpointId: preview.terminalCheckpointId,
    checkpointDigest: preview.terminalCheckpointDigest,
    sourceDigest: preview.sourceDigest,
    qaInputDigest: preview.qaInputDigest,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    reworkDeliveryEvidenceDigest: preview.reworkDeliveryEvidenceDigest,
    recordApproval: {
      decision: 'record-rework-delivery-package',
      acknowledgement,
      rationale: rationale.trim(),
      reviewedAt,
    },
  };
}

export function isExactReworkDeliveryPackageRecord(
  record,
  preview,
  reworkPlan,
) {
  return Boolean(
    record &&
      record.persisted === true &&
      record.status === 'review-required' &&
      record.reworkPlanId === reworkPlan?.id &&
      record.projectId === reworkPlan?.projectId &&
      record.missionId === reworkPlan?.missionId &&
      record.executionPlanId === reworkPlan?.executionPlanId &&
      record.previewId === preview?.id &&
      record.previewDigest === preview?.previewDigest &&
      record.reworkDeliveryEvidenceDigest ===
        preview?.reworkDeliveryEvidenceDigest &&
      record.qaWorkOrderAttemptId === preview?.qaWorkOrderAttemptId &&
      record.qaRunId === preview?.qaRunId &&
      record.qaEvidenceArtifactId === preview?.qaEvidenceArtifactId &&
      record.terminalCheckpointId === preview?.terminalCheckpointId &&
      record.terminalCheckpointDigest ===
        preview?.terminalCheckpointDigest &&
      record.sourceDigest === preview?.sourceDigest &&
      record.qaInputDigest === preview?.qaInputDigest &&
      /^[a-f0-9]{64}$/.test(record.recordApprovalDigest || '') &&
      /^[a-f0-9]{64}$/.test(record.recordDigest || '') &&
      Array.isArray(record.allowedActions) &&
      record.allowedActions.length === 0 &&
      Array.isArray(record.blockedActions) &&
      record.blockedActions.length ===
        REWORK_DELIVERY_PREVIEW_BLOCKED_ACTIONS.length &&
      record.blockedActions.every(
        (action, index) =>
          action === REWORK_DELIVERY_PREVIEW_BLOCKED_ACTIONS[index],
      )
  );
}

export const REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_KEYS = Object.freeze([
  'approvalBypassAllowed',
  'collectionAllowed',
  'commitAllowed',
  'connectorCallAllowed',
  'executionAllowed',
  'learningAllowed',
  'memoryApplicationAllowed',
  'missionCloseOutAllowed',
  'packageAcceptanceEvidenceAllowed',
  'packageChangesRequestedAllowed',
  'packageMutationAllowed',
  'packageRejectionAllowed',
  'policyMutationAllowed',
  'providerCallAllowed',
  'pushAllowed',
  'recoveryAllowed',
  'releaseAllowed',
  'retryAllowed',
  'schedulingAllowed',
  'sourceMutationAllowed',
  'taskCloseOutAllowed',
]);

export function getReworkDeliveryPackageAcceptanceRequest(record, envelope) {
  const attempt = envelope?.workOrderAttempt;
  if (
    !record ||
    record.persisted !== true ||
    record.status !== 'review-required' ||
    !attempt ||
    attempt.id !== record.qaWorkOrderAttemptId ||
    !/^[a-f0-9]{64}$/.test(attempt.recordDigest || '') ||
    !/^[a-f0-9]{64}$/.test(record.recordDigest || '')
  ) {
    return null;
  }
  return {
    reworkPlanId: record.reworkPlanId,
    qaWorkOrderAttemptId: record.qaWorkOrderAttemptId,
    qaWorkOrderAttemptRecordDigest: attempt.recordDigest,
    qaRunId: record.qaRunId,
    qaEvidenceArtifactId: record.qaEvidenceArtifactId,
    deliveryReadyCheckpointId: record.terminalCheckpointId,
    checkpointDigest: record.terminalCheckpointDigest,
    sourceDigest: record.sourceDigest,
    qaInputDigest: record.qaInputDigest,
    evaluatedAt: record.previewEvaluatedAt,
    previewId: record.previewId,
    previewDigest: record.previewDigest,
    reworkDeliveryEvidenceDigest: record.reworkDeliveryEvidenceDigest,
    reworkDeliveryPackageRecordDigest: record.recordDigest,
    decision: 'accept',
  };
}

export function isExactReworkDeliveryPackageAcceptance(
  acceptance,
  record,
) {
  const authority = acceptance?.authoritySummary;
  return Boolean(
    acceptance &&
      record &&
      acceptance.decision === 'accepted' &&
      acceptance.projectId === record.projectId &&
      acceptance.missionId === record.missionId &&
      acceptance.executionPlanId === record.executionPlanId &&
      acceptance.reworkPlanId === record.reworkPlanId &&
      acceptance.reworkDeliveryPackageId === record.id &&
      acceptance.previewId === record.previewId &&
      acceptance.previewDigest === record.previewDigest &&
      acceptance.sourceDigest === record.sourceDigest &&
      acceptance.reworkDeliveryEvidenceDigest ===
        record.reworkDeliveryEvidenceDigest &&
      acceptance.reworkDeliveryPackageRecordDigest === record.recordDigest &&
      /^[a-f0-9]{64}$/.test(acceptance.acceptanceDigest || '') &&
      hasExactKeys(
        authority,
        REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_KEYS,
      ) &&
      authority.packageAcceptanceEvidenceAllowed === true &&
      Object.entries(authority).every(
        ([key, value]) =>
          key === 'packageAcceptanceEvidenceAllowed'
            ? value === true
            : value === false,
      )
  );
}

export function isSpecialistBatchPreviewSourceCurrent(
  snapshot,
  preview,
  companyRuntime,
) {
  if (!snapshot || !preview) return false;
  const councilSession = snapshot.councilSessions?.[preview.councilSessionId] || null;
  const staffingPlan = snapshot.staffingPlans?.[preview.staffingPlanId] || null;
  const staffingEntry = snapshot.staffingEntries?.[preview.staffingEntryId] || null;
  const mission = snapshot.missions?.[preview.missionId] || null;
  const currentAttempt = getCurrentRealCouncilAttempt(councilSession);
  const matchingPlan = Object.values(snapshot.executionPlans || {}).some(
    (executionPlan) =>
      executionPlan.councilSessionId === preview.councilSessionId ||
      executionPlan.missionId === preview.missionId,
  );
  const roleDigests = new Map(
    (companyRuntime?.roleSourceDigests || []).map((entry) => [
      entry.ref,
      entry.sha256,
    ]),
  );
  const previewRoleDigests = new Map(
    (preview.roleSourceDigests || []).map((entry) => [entry.ref, entry.sha256]),
  );
  const currentSynthesisDigest = (
    companyRuntime?.councilSynthesisDigests || []
  ).find(
    (entry) =>
      entry.councilSessionId === preview.councilSessionId &&
      entry.currentAttemptId === preview.currentAttemptId,
  )?.sha256;

  return Boolean(
    getSpecialistBatchPreviewSummary(
      preview,
      councilSession,
      staffingPlan,
      staffingEntry,
    ) &&
      !matchingPlan &&
      snapshot.activeProjectId === preview.projectId &&
      mission?.status === 'aligned' &&
      mission.linkedTaskId === null &&
      mission.staffingEntryId === staffingEntry?.id &&
      mission.councilSessionId === councilSession?.id &&
      currentAttempt?.id === preview.currentAttemptId &&
      currentSynthesisDigest === preview.councilSynthesisDigest &&
      councilSession?.mode === 'real-local-stub' &&
      councilSession.phase === 'terminal' &&
      councilSession.status === 'approved' &&
      councilSession.alignment?.status === 'approved' &&
      staffingPlan?.status === 'accepted' &&
      staffingEntry?.status === 'bound' &&
      companyRuntime?.status === 'ready' &&
      companyRuntime.blueprintDigest === preview.blueprintDigest &&
      roleDigests.get('company/roles/researcher.md') ===
        previewRoleDigests.get('company/roles/researcher.md') &&
      roleDigests.get('company/roles/qa.md') ===
        previewRoleDigests.get('company/roles/qa.md'),
  );
}

export function getMissionStaffingPlanSummary(
  mission,
  preview,
  staffingPlan,
  staffingEntry = null,
) {
  if (!mission) return null;

  const sourceReady = Boolean(
    mission.status === 'draft' &&
      !mission.linkedTaskId &&
      !mission.councilSessionId &&
      !mission.staffingEntryId,
  );
  const previewCurrent = Boolean(
    preview &&
      preview.persisted === false &&
      preview.status === 'review-ready' &&
      preview.missionId === mission.id &&
      preview.projectId === mission.projectId,
  );
  const durableCurrent = Boolean(
    staffingPlan &&
      staffingPlan.persisted === true &&
      staffingPlan.status === 'accepted' &&
      staffingPlan.missionId === mission.id &&
      staffingPlan.projectId === mission.projectId,
  );
  const entryCurrent = Boolean(
    staffingEntry &&
      staffingEntry.persisted === true &&
      staffingEntry.status === 'bound' &&
      staffingEntry.missionId === mission.id &&
      staffingEntry.projectId === mission.projectId &&
      staffingEntry.staffingPlanId === staffingPlan?.id &&
      staffingEntry.id === mission.staffingEntryId,
  );

  return {
    canAccept: sourceReady && previewCurrent && !durableCurrent,
    canPreview: sourceReady && !durableCurrent,
    canEnterCouncil:
      sourceReady &&
      durableCurrent &&
      staffingPlan.mode === 'council' &&
      staffingPlan.providerMode === 'local-stub' &&
      !entryCurrent,
    downstreamAllowed: false,
    durableCurrent,
    entryCurrent,
    previewCurrent,
    sourceReady,
    status: entryCurrent
      ? 'bound'
      : durableCurrent
      ? 'accepted'
      : previewCurrent
        ? 'review-ready'
        : sourceReady
          ? 'draft-ready'
          : 'blocked',
  };
}

export function getStrategistContextConsumptionSummary(
  mission,
  staffingPlan,
  staffingEntry,
  missionContextAttachment,
  exactEvidence = null,
) {
  const attachmentCurrent = Boolean(
    missionContextAttachment &&
      missionContextAttachment.persisted === true &&
      missionContextAttachment.status === 'attached' &&
      missionContextAttachment.targetMissionId === mission?.id &&
      missionContextAttachment.projectId === mission?.projectId &&
      missionContextAttachment.targetMissionDigest === staffingPlan?.missionDigest,
  );
  const canEnter = Boolean(
    mission?.status === 'draft' &&
      !mission.linkedTaskId &&
      !mission.councilSessionId &&
      !mission.staffingEntryId &&
      staffingPlan?.persisted === true &&
      staffingPlan.status === 'accepted' &&
      staffingPlan.mode === 'council' &&
      staffingPlan.providerMode === 'local-stub' &&
      !staffingEntry &&
      attachmentCurrent,
  );
  const contextRef = exactEvidence?.staffingEntry?.missionContextAttachmentRef || null;
  const receipt = exactEvidence?.councilSession?.strategistContextConsumption || null;
  const exactReceipt = Boolean(
    contextRef &&
      receipt &&
      contextRef.attachmentId === missionContextAttachment?.id &&
      contextRef.attachmentRecordDigest === missionContextAttachment?.recordDigest &&
      receipt.attachmentId === contextRef.attachmentId &&
      receipt.attachmentRecordDigest === contextRef.attachmentRecordDigest &&
      receipt.consumptionDigest === contextRef.consumptionDigest &&
      receipt.contextDigest === contextRef.contextDigest &&
      receipt.targetMissionId === mission?.id &&
      receipt.targetRole === 'strategist',
  );

  return {
    attachmentCurrent,
    canEnter,
    downstreamAllowed: false,
    exactReceipt,
    receipt: exactReceipt ? receipt : null,
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
  const acceptanceCriteria = workOrders.flatMap((workOrder) =>
    (workOrder.acceptanceCriterionRefs || [])
      .map((id) => snapshot.acceptanceCriteria?.[id] || null)
      .filter(Boolean),
  );
  const verificationProofs = Object.values(snapshot.verificationProofs || {}).filter(
    (proof) => acceptanceCriteria.some(
      (criterion) => criterion.id === proof.acceptanceCriterionId,
    ),
  );
  const workOrderAttempts = Object.values(snapshot.workOrderAttempts || {})
    .filter((attempt) => attempt.executionPlanId === executionPlan.id)
    .sort(
      (left, right) =>
        left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id),
    );
  const councilSession = snapshot.councilSessions?.[executionPlan.councilSessionId] || null;

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
    acceptanceCriteria,
    verificationProofs,
    workOrderAttempts,
    councilSession,
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
    latestWorkOrderAttempt: workOrderAttempts.at(-1) || null,
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

export async function computeCanonicalDigest(value, label = 'Source') {
  if (!value || typeof value !== 'object') {
    throw new Error(`${label} digest source가 필요합니다.`);
  }
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(`${label} digest를 계산할 Web Crypto를 사용할 수 없습니다.`);
  }
  const bytes = new TextEncoder().encode(
    JSON.stringify(canonicalizeDigestValue(value)),
  );
  const digest = await subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
  return computeCanonicalDigest(payload, 'Mission');
}

async function computeCanonicalRecordDigest(record, label) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(`${label} digest source가 필요합니다.`);
  }
  return computeCanonicalDigest(record, label);
}

export function computeExecutionPlanRecordDigest(executionPlan) {
  return computeCanonicalRecordDigest(executionPlan, 'ExecutionPlan');
}

export function computeWorkOrderRecordDigest(workOrder) {
  if (!workOrder || typeof workOrder !== 'object' || Array.isArray(workOrder)) {
    throw new Error('WorkOrder digest source가 필요합니다.');
  }
  const { acceptanceCriterionRefs: _acceptanceCriterionRefs, ...sourceRecord } = workOrder;
  return computeCanonicalRecordDigest(sourceRecord, 'WorkOrder');
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

export function getMissionContextAttachmentSummary(preview, attachment, mission) {
  const exactPreview = Boolean(
    preview?.persisted === false &&
      preview.status === 'context-review-ready' &&
      preview.targetMissionId === mission?.id &&
      preview.targetMissionStatus === 'draft' &&
      preview.missionInjectionStatus === 'blocked' &&
      preview.workOrderInjectionStatus === 'blocked',
  );
  const exactAttachment = Boolean(
    attachment?.persisted === true &&
      attachment.status === 'attached' &&
      attachment.targetMissionId === mission?.id &&
      attachment.targetMissionDigest === preview?.targetMissionDigest &&
      attachment.sourcePreviewId === preview?.id &&
      attachment.sourcePreviewDigest === preview?.previewDigest &&
      attachment.roleConsumptionStatus === 'blocked' &&
      attachment.policyInjectionStatus === 'blocked',
  );
  return {
    attachment: exactAttachment ? attachment : null,
    canAttach: Boolean(
      exactPreview && (!attachment || attachment.targetMissionId !== mission?.id),
    ),
    exactAttachment,
    exactPreview,
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

export function getMissionOperatorSteppedSchedulerSummary(bundle) {
  if (!bundle?.councilSession?.staffingEntryRef) return null;
  const byRole = Object.fromEntries(bundle.workOrders.map((entry) => [entry.role, entry]));
  const activeAttempt = bundle.workOrderAttempts.find(
    (attempt) => attempt.status === 'active',
  ) || null;
  const checkpoint = bundle.latestCheckpoint;
  const terminalGateApproved = Boolean(
    bundle.terminalGateApproval?.id === bundle.executionPlan.terminalGateApprovalId &&
      bundle.terminalGateApproval?.status === 'approved' &&
      bundle.terminalGateApproval?.allowedNextAction === 'builder-live-mutation',
  );
  let action = null;
  let expectedWorkOrder = null;
  const reviewerReexecutionQaGate = Boolean(
    checkpoint?.stage === 'qa-ready' &&
      checkpoint.stopReason === 'reviewer-reexecution-passed-qa-ready' &&
      bundle.executionPlan.stopReason === 'separate-qa-execution-decision-required',
  );
  if (!activeAttempt && checkpoint?.status === 'ready') {
    if (checkpoint.stage === 'builder-waiting-gate' && terminalGateApproved) {
      action = 'continue-builder';
      expectedWorkOrder = byRole.builder;
    } else if (checkpoint.stage === 'reviewer-ready') {
      action = 'run-reviewer';
      expectedWorkOrder = byRole.reviewer;
    } else if (checkpoint.stage === 'qa-ready' && !reviewerReexecutionQaGate) {
      action = 'run-qa';
      expectedWorkOrder = byRole.qa;
    }
  }
  const startAllowed = Boolean(
    !activeAttempt &&
      bundle.workOrderAttempts.length === 0 &&
      bundle.executionPlan.status === 'approved' &&
      bundle.approval.status === 'approved',
  );
  const blockedReason = activeAttempt
    ? `${activeAttempt.id} active 상태는 별도 recovery 승인 전까지 진행할 수 없습니다.`
    : bundle.executionPlan.status === 'delivery-ready'
      ? 'Builder, Reviewer, QA가 모두 완료됐습니다.'
      : checkpoint?.stage === 'builder-waiting-gate' && !terminalGateApproved
        ? 'Builder live-mutation 승인이 필요합니다.'
        : reviewerReexecutionQaGate
          ? 'Reviewer 재실행 이후 QA는 별도 실행 결정이 필요합니다.'
        : ['blocked', 'rejected'].includes(bundle.executionPlan.status)
          ? bundle.executionPlan.stopReason || `계획 상태: ${bundle.executionPlan.status}`
          : action
            ? null
            : '현재 dependency-ready WorkOrder가 없습니다.';

  return {
    action,
    activeAttempt,
    blockedReason,
    checkpoint,
    expectedWorkOrder,
    startAllowed,
    stepAllowed: Boolean(action && expectedWorkOrder),
    terminalGateApprovalId:
      action === 'continue-builder' ? bundle.terminalGateApproval?.id || null : null,
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
