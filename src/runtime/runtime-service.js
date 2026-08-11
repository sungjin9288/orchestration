'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const {
  APPROVAL_STATUS,
  ARTIFACT_CATALOG,
  ARTIFACT_RETENTION_TIER,
  ARTIFACT_TYPE,
  BUILDER_ACTION,
  COMMIT_ACTION,
  DECISION_INBOX_ALLOWED_KIND_BY_SOURCE_TYPE,
  DECISION_INBOX_KIND,
  DECISION_INBOX_SOURCE_TYPE,
  DECISION_INBOX_STATUS,
  DELIVERY_PACKAGE_ACCEPTANCE_DECISION,
  DELIVERY_PACKAGE_STATUS,
  EXECUTION_PLAN_STATUS,
  MISSION_CLOSE_OUT_DECISION,
  PACKS,
  PROVIDER_ADAPTER_ID,
  PROVIDER_MODE,
  PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_APPLICATION_ATTEMPT_STATUS,
  PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS,
  PROPOSAL_RECORD_RISK_CLASS,
  PROPOSAL_RECORD_STATUS,
  PROPOSAL_RECORD_TYPE,
  PROPOSAL_SOURCE_MUTATION_STATUS,
  RETENTION_CONSUMER_ACTION,
  RETENTION_CONSUMER_DISPOSITION,
  RETENTION_CONSUMER_STATUS,
  REVIEW_STATUS,
  RUN_STATUS,
  STAFFING_PLAN_STATE_SCHEMA_VERSION,
  TASK_LIFECYCLE,
  WORK_ORDER_ACTION,
  WORK_ORDER_STATUS,
  WORKFLOW_CHECKPOINT_ACTION,
  WORKFLOW_CHECKPOINT_STAGE,
  WORKFLOW_CHECKPOINT_STATUS,
} = require('./contracts');
const { createFileStore } = require('./file-store');
const {
  loadCompanyBlueprintEvidence,
  readCompanyBlueprintStatus,
} = require('./company-blueprint');
const {
  PROVIDER_COUNCIL_MODE,
  REAL_COUNCIL_MODE,
  buildAgendaDigest,
  buildCouncilAgenda,
  createRealCouncilSession,
  isRealCouncilMode,
} = require('./council-sessions');
const { createCouncilCoordinator } = require('../execution/council-coordinator');
const {
  createCouncilLocalStubAdapter,
} = require('../execution/providers/council-local-stub-adapter');
const {
  createCouncilOpenAIResponsesAdapter,
} = require('../execution/providers/council-openai-responses-adapter');
const {
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeRequiredStringArray,
  normalizeRepoRelativePaths,
  normalizeIsoTimestamp,
} = require('./normalizers');
const {
  defaultProposalRecordExpiry,
  normalizeProposalRecordCreationApproval,
  normalizeProposalRecordVerificationPlan,
  normalizeProposalRecordBlockedActions,
  normalizeProposalApplicationApproval,
  normalizeProposalApplicationAttemptBlockedActions,
  normalizeProposalSourceMutationApproval,
  normalizeProposalSourceMutationBlockedActions,
  normalizeProposalSourceMutationTarget,
  normalizeCleanBaselineProof,
  normalizeDryRunDiffPreview,
  assertProposalRecordCanReceiveApplicationAttempt,
  assertProposalApplicationAttemptCanAuthorizeSourceMutation,
} = require('./proposal-records');
const {
  applyTaskGateFlags,
  buildBuilderLiveMutationApprovalRequestSummary,
  buildBuilderPreflightGuardSummary,
  buildLatestApprovalDisplayStatus,
  buildTaskBreakerGuardSummary,
  compareRecordsByCreatedDesc,
  computeTaskGateState,
  evaluateCurrentBuilderLiveMutationProvenance,
  evaluateLatestApprovalForAction,
  evaluateLatestBuilderPreflightProvenance,
  findLatestSuccessfulBuilderLiveMutationRun,
  findLatestTaskArtifactMeta,
  getApprovalMetadata,
  getLatestPreflightContext,
  isBuilderLiveMutationApprovalConsumed,
  listActiveTaskGates,
  listPendingBlockingDecisionItems,
  listTaskApprovals,
  recalculateTaskFlags,
  sameExactStringArrays,
  uniqueReasons,
} = require('./task-gates');
const {
  assertAcceptanceCriterion,
  assertArtifact,
  assertBuilderReworkDispatch,
  assertBuilderReworkMutationApproval,
  assertDeliveryPackage,
  assertDeliveryPackageAcceptance,
  assertExecutionPlan,
  assertHandoffPacket,
  assertLearningCandidate,
  assertLearningCandidateReview,
  assertMemoryItem,
  assertMemoryRecall,
  assertMissionContextAttachment,
  assertMissionCloseOut,
  assertOpsAttemptDisposition,
  assertOpsAttemptResume,
  assertReworkDeliveryPackage,
  assertReworkDeliveryPackageAcceptance,
  assertReworkPlan,
  assertReworkPlanAcceptance,
  assertRun,
  assertSpecialistBatch,
  assertSpecialistCellAttempt,
  assertSpecialistCellRetry,
  assertStaffingEntry,
  assertStaffingPlan,
  assertWorkOrder,
  assertWorkOrderAttempt,
  assertWorkflowCheckpoint,
  assertVerificationProof,
} = require('./assertions');
const {
  createAcceptanceCriterion,
} = require('./acceptance-criteria');
const {
  VERIFICATION_PROOF_STATUS,
  computeVerificationProofRequestDigest,
  createVerificationProof,
} = require('./verification-proofs');
const {
  computeSourceBoundVerificationInputDigest,
  digestSpecialistInputPathDigests,
  runSourceBoundNodeChecks,
} = require('../execution/qa-node-check-runner');
const {
  compileMissionWorkOrderPreview,
  normalizeCompileSpec,
  preflightMissionWorkOrderCandidate,
} = require('./mission-workorder-compiler');
const {
  createWorkflowCheckpoint,
  recomputeWorkflowCheckpoint,
} = require('./workflow-checkpoints');
const {
  compileExecutionContinuationPreview,
} = require('./execution-continuation-preview');
const {
  compileContextBudgetTelemetry,
} = require('./context-budget-telemetry');
const {
  createWigoloExactFetchAdapter,
} = require('../research/wigolo-exact-fetch-adapter');
const {
  computeDeliveryPackageDigest,
  createDeliveryPackage,
} = require('./delivery-packages');
const {
  computeDeliveryPackageAcceptanceDigest,
  createDeliveryPackageAcceptance,
} = require('./delivery-package-acceptances');
const {
  assertReworkDeliveryPackageAcceptanceRecord,
  createReworkDeliveryPackageAcceptance,
  isExactReworkDeliveryPackageAcceptanceReplay,
  normalizeReworkDeliveryPackageAcceptanceRequest,
} = require('./rework-delivery-package-acceptances');
const {
  computeMissionCloseOutDigest,
  createMissionCloseOut,
} = require('./mission-close-outs');
const {
  compileLearningCandidatePreview,
} = require('./learning-candidate-preview');
const {
  createLearningCandidate,
} = require('./learning-candidates');
const {
  createLearningCandidateReview,
  normalizeLearningCandidateReviewRequest,
} = require('./learning-candidate-reviews');
const {
  previewLearningCandidateMemory: compileMemoryCandidatePreview,
} = require('./memory-candidate-preview');
const { createMemoryItem } = require('./memory-items');
const {
  previewMemoryItemRecall: compileMemoryRecallPreview,
} = require('./memory-recall-preview');
const { createMemoryRecall } = require('./memory-recalls');
const {
  computeStaffingPlanRecordDigest,
  createStaffingPlan,
  previewMissionStaffingPlan: compileMissionStaffingPlanPreview,
} = require('./staffing-plans');
const {
  computeStaffingEntryApprovalDigest,
  computeStaffingEntryRecordDigest,
  computeStaffingEntrySourceDigest,
  createContextBoundStaffingEntry,
  createStaffingEntry,
  normalizeStaffingEntryApproval,
} = require('./staffing-entries');
const {
  WORK_ORDER_ATTEMPT_ACTION,
  WORK_ORDER_ATTEMPT_COMMAND,
  WORK_ORDER_ATTEMPT_STATUS,
  assertWorkOrderAttemptRecord,
  computeWorkOrderAttemptAuthorityDigest,
  computeWorkOrderAttemptDependencyDigest,
  computeWorkOrderAttemptRecordDigest,
  createWorkOrderAttempt,
  startBuilderReworkMutationAttempt,
  transitionWorkOrderAttempt,
} = require('./work-order-attempts');
const {
  computeMissionMemoryContextTargetDigest,
  previewMissionMemoryContext: compileMissionMemoryContextPreview,
} = require('./mission-memory-context-preview');
const {
  createMissionContextAttachment,
  isExactMissionContextAttachmentReplay,
} = require('./mission-context-attachments');
const {
  createStrategistContextConsumption,
  normalizeContextConsumption,
} = require('./strategist-context-consumption');
const {
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
  previewWorkOrderVerificationPlan: compileWorkOrderVerificationPlanPreview,
} = require('./workorder-verification-plan-preview');
const {
  OPS_SUPERVISION_TARGET_TYPE,
  buildOpsSupervisionPreview,
  normalizeOpsSupervisionRequest,
} = require('./ops-supervision-preview');
const {
  assertOpsAttemptDispositionRecord,
  createOpsAttemptDisposition,
  isExactOpsAttemptDispositionReplay,
  normalizeOpsAttemptDispositionRequest,
} = require('./ops-attempt-dispositions');
const {
  OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER,
  assertOpsAttemptResumeRecord,
  createOpsAttemptResume,
  isExactOpsAttemptResumeReplay,
  normalizeOpsAttemptResumeRequest,
} = require('./ops-attempt-resumes');
const {
  MAX_REVIEW_ARTIFACT_BYTES,
  buildReviewerReworkPlanPreview,
  normalizeReviewerReworkPreviewRequest,
} = require('./reviewer-rework-preview');
const {
  assertReworkPlanRecord,
  createReworkPlan,
  isExactReworkPlanReplay,
  normalizeReworkPlanRequest,
} = require('./rework-plans');
const {
  assertReworkPlanAcceptanceRecord,
  createReworkPlanAcceptance,
  isExactReworkPlanAcceptanceReplay,
  normalizeReworkPlanAcceptanceRequest,
} = require('./rework-plan-acceptances');
const {
  assertBuilderReworkDispatchRecord,
  computeBuilderReworkDispatchRecordDigest,
  createBuilderReworkDispatch,
  deriveBuilderReworkWorkerState,
  isExactBuilderReworkDispatchReplay,
  normalizeBuilderReworkDispatchRequest,
} = require('./builder-rework-dispatches');
const {
  ACTION: BUILDER_REWORK_MUTATION_ACTION,
  SCOPE: BUILDER_REWORK_MUTATION_SCOPE,
  assertBuilderReworkMutationApprovalRecord,
  buildBuilderReworkMutationApprovalMetadata,
  computePreflightArtifactContentDigest,
  computePreflightArtifactRecordDigest,
  computePreflightRunRecordDigest,
  digestCanonical: digestBuilderReworkMutationCanonical,
  isExactBuilderReworkMutationApprovalReplay,
  normalizeBuilderReworkMutationApprovalRequest,
} = require('./builder-rework-mutation-approvals');
const {
  NEXT_GATE: BUILDER_REWORK_MUTATION_NEXT_GATE,
  computeBuilderReworkSourceMutationRequestDigest,
  deepFreeze: deepFreezeBuilderReworkMutation,
  normalizeBuilderReworkSourceMutationRequest,
  readBoundedBuilderReworkSourceTargets,
} = require('./builder-rework-source-mutations');
const {
  computeMutationEvidenceDigest,
  computeReviewerReexecutionRequestDigest,
  computeReviewerReexecutionWorkOrderDigest,
  deepFreeze: deepFreezeReviewerReexecution,
  isExactReviewerReexecutionReplay,
  normalizeReviewerReexecutionRequest,
} = require('./reviewer-reexecution');
const {
  buildPreConsumeQaReadyProjection,
  computeQaInputDigest,
  computeReviewerEvidenceDigest,
  computeReworkQaExecutionRequestDigest,
  deepFreeze: deepFreezeReworkQaExecution,
  isExactReworkQaExecutionReplay,
  normalizeReworkQaExecutionRequest,
} = require('./rework-qa-execution');
const {
  buildReworkDeliveryPackagePreview,
} = require('./rework-delivery-package-preview');
const {
  assertReworkDeliveryPackageRecord,
  createReworkDeliveryPackage,
  isExactReworkDeliveryPackageReplay,
  normalizeReworkDeliveryPackageRequest,
} = require('./rework-delivery-packages');
const {
  parseReviewerArtifactContent,
} = require('../execution/coordinator/artifact-content');
const {
  buildSpecialistBatchPreview,
  digestCanonical: digestSpecialistCanonical,
  normalizeSpecialistBatchPreviewRequest,
} = require('./specialist-batch-preview');
const {
  computeExecutionApprovalDigest,
  assertSpecialistBatchRecord,
  createSpecialistBatch,
  normalizeExecutionApproval,
  transitionSpecialistBatch,
} = require('./specialist-batches');
const {
  SPECIALIST_CELL_ATTEMPT_STATUS,
  assertSpecialistCellAttemptRecord,
  computeInputDigest,
  createSpecialistCellAttempt,
  createSpecialistRetryCellAttempt,
  settleSpecialistCellAttempt,
} = require('./specialist-cell-attempts');
const {
  SPECIALIST_CELL_RETRY_STATUS,
  assertSpecialistCellRetryRecord,
  computeSpecialistCellRetryRequestDigest,
  createSpecialistCellRetry,
  normalizeSpecialistCellRetryRequest,
  settleSpecialistCellRetry,
} = require('./specialist-cell-retries');
const {
  runSpecialistBatch,
} = require('../execution/specialist-batch-coordinator');
const {
  runSpecialistCellRetry,
} = require('../execution/specialist-cell-retry-coordinator');
const { buildMissionEvidenceGraph } = require('./mission-evidence-graph');
const { buildTaskExecutionProvenanceGraph } = require('./execution-provenance-graph');
const {
  assertSupportedArtifactType,
  cloneJsonValue,
  compareByCreatedDesc,
  getRetentionCurrentPolicy,
  getRetentionReason,
  listRetentionAvailableActions,
  listRetentionFutureEligibleActions,
  normalizeRelativeArtifactPath,
} = require('./retention-policy');

function createRuntimeService(options = {}) {
  const store = createFileStore(options);
  const companyBlueprintOptions = options.companyBlueprintPath
    ? {
        blueprintPath: options.companyBlueprintPath,
        repoRoot: options.companyRepoRoot,
      }
    : null;
  const companyRuntime = companyBlueprintOptions
    ? readCompanyBlueprintStatus({
        ...companyBlueprintOptions,
      })
    : null;
  const councilAdapter = options.councilAdapter || createCouncilLocalStubAdapter();
  const councilCoordinator = createCouncilCoordinator({ adapter: councilAdapter });
  const councilLiveAdapter =
    options.councilLiveAdapter ||
    createCouncilOpenAIResponsesAdapter({ repoRoot: options.companyRepoRoot });
  const councilLiveCoordinator = createCouncilCoordinator({ adapter: councilLiveAdapter });
  const exactResearchAdapter =
    options.exactResearchAdapter || createWigoloExactFetchAdapter({ enabled: false });
  const specialistBatchCoordinator =
    options.specialistBatchCoordinator || runSpecialistBatch;
  const specialistCellRetryCoordinator =
    options.specialistCellRetryCoordinator || runSpecialistCellRetry;
  const decisionInboxKinds = new Set(Object.values(DECISION_INBOX_KIND));
  const decisionInboxSourceTypes = new Set(Object.values(DECISION_INBOX_SOURCE_TYPE));
  const proposalRecordTypes = new Set(Object.values(PROPOSAL_RECORD_TYPE));
  const proposalRecordRiskClasses = new Set(Object.values(PROPOSAL_RECORD_RISK_CLASS));

  function nextId(state, entity) {
    state.sequences[entity] += 1;
    return `${entity}-${String(state.sequences[entity]).padStart(4, '0')}`;
  }

  function nextWorkflowCheckpointId(state) {
    state.sequences.workflowCheckpoint += 1;
    return `workflow-checkpoint-${String(state.sequences.workflowCheckpoint).padStart(4, '0')}`;
  }

  function nextDeliveryPackageId(state) {
    state.sequences.deliveryPackage += 1;
    return `delivery-package-${String(state.sequences.deliveryPackage).padStart(4, '0')}`;
  }

  function nextDeliveryPackageAcceptanceId(state) {
    state.sequences.deliveryPackageAcceptance += 1;
    return `delivery-package-acceptance-${String(
      state.sequences.deliveryPackageAcceptance,
    ).padStart(4, '0')}`;
  }

  function nextMissionCloseOutId(state) {
    state.sequences.missionCloseOut += 1;
    return `mission-close-out-${String(state.sequences.missionCloseOut).padStart(4, '0')}`;
  }

  function nextLearningCandidateId(state) {
    state.sequences.learningCandidate += 1;
    return `learning-candidate-${String(state.sequences.learningCandidate).padStart(4, '0')}`;
  }

  function nextLearningCandidateReviewId(state) {
    state.sequences.learningCandidateReview += 1;
    return `learning-candidate-review-${String(
      state.sequences.learningCandidateReview,
    ).padStart(4, '0')}`;
  }

  function nextMemoryItemId(state) {
    state.sequences.memoryItem += 1;
    return `memory-item-${String(state.sequences.memoryItem).padStart(4, '0')}`;
  }

  function nextMemoryRecallId(state) {
    state.sequences.memoryRecall += 1;
    return `memory-recall-${String(state.sequences.memoryRecall).padStart(4, '0')}`;
  }

  function nextMissionContextAttachmentId(state) {
    state.sequences.missionContextAttachment += 1;
    return `mission-context-attachment-${String(
      state.sequences.missionContextAttachment,
    ).padStart(4, '0')}`;
  }

  function nextStaffingPlanId(state) {
    state.sequences.staffingPlan += 1;
    return `staffing-plan-${String(state.sequences.staffingPlan).padStart(4, '0')}`;
  }

  function nextStaffingEntryId(state) {
    state.sequences.staffingEntry += 1;
    return `staffing-entry-${String(state.sequences.staffingEntry).padStart(4, '0')}`;
  }

  function nextWorkOrderAttemptId(state) {
    state.sequences.workOrderAttempt += 1;
    return `work-order-attempt-${String(state.sequences.workOrderAttempt).padStart(4, '0')}`;
  }

  function nextSpecialistBatchId(state) {
    state.sequences.specialistBatch += 1;
    return `specialist-batch-${String(state.sequences.specialistBatch).padStart(4, '0')}`;
  }

  function nextSpecialistCellAttemptId(state) {
    state.sequences.specialistCellAttempt += 1;
    return `specialist-cell-attempt-${String(
      state.sequences.specialistCellAttempt,
    ).padStart(4, '0')}`;
  }

  function nextSpecialistCellRetryId(state) {
    state.sequences.specialistCellRetry += 1;
    return `specialist-cell-retry-${String(
      state.sequences.specialistCellRetry,
    ).padStart(4, '0')}`;
  }

  function nextReworkPlanId(state) {
    state.sequences.reworkPlan += 1;
    return `rework-plan-${String(state.sequences.reworkPlan).padStart(4, '0')}`;
  }

  function nextReworkPlanAcceptanceId(state) {
    state.sequences.reworkPlanAcceptance += 1;
    return `rework-plan-acceptance-${String(
      state.sequences.reworkPlanAcceptance,
    ).padStart(4, '0')}`;
  }

  function nextReworkDeliveryPackageId(state) {
    state.sequences.reworkDeliveryPackage += 1;
    return `rework-delivery-package-${String(
      state.sequences.reworkDeliveryPackage,
    ).padStart(4, '0')}`;
  }

  function nextReworkDeliveryPackageAcceptanceId(state) {
    state.sequences.reworkDeliveryPackageAcceptance += 1;
    return `rework-delivery-package-acceptance-${String(
      state.sequences.reworkDeliveryPackageAcceptance,
    ).padStart(4, '0')}`;
  }

  function nextOpsAttemptDispositionId(state) {
    state.sequences.opsAttemptDisposition += 1;
    return `ops-attempt-disposition-${String(
      state.sequences.opsAttemptDisposition,
    ).padStart(4, '0')}`;
  }

  function nextOpsAttemptResumeId(state) {
    state.sequences.opsAttemptResume += 1;
    return `ops-attempt-resume-${String(
      state.sequences.opsAttemptResume,
    ).padStart(4, '0')}`;
  }

  function getExactWorkOrderAttemptQuarantine(state, attempt) {
    return (
      Object.values(state.opsAttemptDispositions || {}).find(
        (candidate) =>
          candidate.targetType ===
            OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT &&
          candidate.targetId === attempt.id &&
          candidate.targetRecordDigest === attempt.recordDigest,
      ) || null
    );
  }

  function isRunnableWorkOrderAttempt(state, attempt) {
    return (
      attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE &&
      attempt.action !==
        WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT &&
      !getExactWorkOrderAttemptQuarantine(state, attempt)
    );
  }

  function assertOpsAttemptSettlementAllowed(state, targetType, attempt) {
    const disposition =
      targetType === OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT
        ? getExactWorkOrderAttemptQuarantine(state, attempt)
        : Object.values(state.opsAttemptDispositions || {}).find(
            (candidate) =>
              candidate.targetType === targetType &&
              candidate.targetId === attempt.id &&
              candidate.targetRecordDigest === attempt.recordDigest,
          );
    if (!disposition) return;
    assertOpsAttemptDispositionRecord(disposition);
    throw conflict(
      `OpsAttemptDisposition ${disposition.id} blocks settlement for the quarantined target`,
    );
  }

  function transitionWorkOrderAttemptWithOpsGuard(state, attempt, transition) {
    assertOpsAttemptSettlementAllowed(
      state,
      OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT,
      attempt,
    );
    return transitionWorkOrderAttempt(attempt, transition);
  }

  function settleSpecialistCellAttemptWithOpsGuard(state, attempt, transition) {
    const targetType =
      attempt.attemptNumber === 1
        ? OPS_SUPERVISION_TARGET_TYPE.SPECIALIST_FIRST_ATTEMPT
        : OPS_SUPERVISION_TARGET_TYPE.SPECIALIST_RETRY_ATTEMPT;
    assertOpsAttemptSettlementAllowed(state, targetType, attempt);
    return settleSpecialistCellAttempt(attempt, transition);
  }

  function nextBuilderReworkDispatchId(state) {
    state.sequences.builderReworkDispatch += 1;
    return `builder-rework-dispatch-${String(state.sequences.builderReworkDispatch).padStart(4, '0')}`;
  }

  function nextProposalRecordId(state) {
    state.sequences.proposalRecord += 1;
    return `proposal-record-${String(state.sequences.proposalRecord).padStart(4, '0')}`;
  }

  function nextProposalApplicationAttemptId(state) {
    state.sequences.proposalApplicationAttempt += 1;
    return `proposal-application-attempt-${String(
      state.sequences.proposalApplicationAttempt,
    ).padStart(4, '0')}`;
  }

  function nextAcceptanceCriterionId(state) {
    state.sequences.acceptanceCriterion += 1;
    return `acceptance-criterion-${String(state.sequences.acceptanceCriterion).padStart(4, '0')}`;
  }

  function nextVerificationProofId(state) {
    state.sequences.verificationProof += 1;
    return `verification-proof-${String(state.sequences.verificationProof).padStart(4, '0')}`;
  }

  function nextProposalSourceMutationId(state) {
    state.sequences.proposalSourceMutation += 1;
    return `proposal-source-mutation-${String(
      state.sequences.proposalSourceMutation,
    ).padStart(4, '0')}`;
  }

  function createDefaultProjectProviderConfig() {
    return {
      mode: PROVIDER_MODE.LOCAL_STUB,
      adapter: PROVIDER_ADAPTER_ID.LOCAL_STUB,
      model: null,
      env: {
        apiKeyVar: null,
      },
    };
  }

  function normalizeProjectPack(value) {
    if (value === PACKS.KNOWLEDGE_WORK) {
      return PACKS.KNOWLEDGE_WORK;
    }

    if (value === null || value === undefined || value === '') {
      return PACKS.DEVELOPMENT;
    }

    if (value !== PACKS.DEVELOPMENT) {
      throw new Error(`pack must be ${PACKS.DEVELOPMENT} or ${PACKS.KNOWLEDGE_WORK}`);
    }

    return PACKS.DEVELOPMENT;
  }

  function normalizeMissionDeliverableType(value, projectPack) {
    if (projectPack !== PACKS.KNOWLEDGE_WORK) {
      return null;
    }

    const normalized = normalizeOptionalString(value) || 'decision-memo';
    const allowedTypes = new Set([
      'checklist',
      'decision-memo',
      'execution-plan',
      'prd',
      'research-brief',
    ]);

    if (!allowedTypes.has(normalized)) {
      throw new Error(
        'deliverableType must be decision-memo, prd, execution-plan, checklist, or research-brief',
      );
    }

    return normalized;
  }

  function normalizeProjectProviderConfig(input) {
    const defaultConfig = createDefaultProjectProviderConfig();
    const source = input && typeof input === 'object' ? input : {};
    const requestedMode = normalizeOptionalString(source.mode);
    const requestedAdapter = normalizeOptionalString(source.adapter);
    const requestedModel = normalizeOptionalString(source.model);
    const requestedEnv = source.env && typeof source.env === 'object' ? source.env : {};
    const requestedApiKeyVar = normalizeOptionalString(
      requestedEnv.apiKeyVar ?? source.apiKeyVar,
    );
    const mode = requestedMode === PROVIDER_MODE.LIVE ? PROVIDER_MODE.LIVE : PROVIDER_MODE.LOCAL_STUB;
    const allowedAdapterIds = [
      PROVIDER_ADAPTER_ID.LOCAL_STUB,
      PROVIDER_ADAPTER_ID.OPENAI_RESPONSES,
      PROVIDER_ADAPTER_ID.LIVE_PROVIDER_ALIAS,
    ];

    if (requestedAdapter && !allowedAdapterIds.includes(requestedAdapter)) {
      throw new Error(
        `provider.adapter must be ${PROVIDER_ADAPTER_ID.LOCAL_STUB}, ${PROVIDER_ADAPTER_ID.OPENAI_RESPONSES}, or ${PROVIDER_ADAPTER_ID.LIVE_PROVIDER_ALIAS}`,
      );
    }

    return {
      ...defaultConfig,
      mode,
      adapter:
        mode === PROVIDER_MODE.LIVE
          ? PROVIDER_ADAPTER_ID.OPENAI_RESPONSES
          : PROVIDER_ADAPTER_ID.LOCAL_STUB,
      model: mode === PROVIDER_MODE.LIVE ? requestedModel : null,
      env: {
        apiKeyVar: mode === PROVIDER_MODE.LIVE ? requestedApiKeyVar : null,
      },
    };
  }

  function normalizeProjectRecord(project) {
    if (!project || typeof project !== 'object') {
      return project;
    }

    project.pack = normalizeProjectPack(project.pack);
    project.provider = normalizeProjectProviderConfig(project.provider);
    return project;
  }

  function normalizeMissionRecord(mission, projectPack = null) {
    if (!mission || typeof mission !== 'object') {
      return mission;
    }

    const effectivePack = projectPack || null;
    mission.deliverableType = normalizeMissionDeliverableType(
      mission.deliverableType,
      effectivePack,
    );

    return mission;
  }

  function normalizeProjectsInState(state) {
    for (const project of Object.values(state.projects || {})) {
      normalizeProjectRecord(project);
    }

    return state;
  }

  function normalizeMissionsInState(state) {
    for (const mission of Object.values(state.missions || {})) {
      const projectPack = state.projects?.[mission.projectId]?.pack || null;
      normalizeMissionRecord(mission, projectPack);
    }

    return state;
  }

  function assertProject(projectId, state) {
    const project = state.projects[projectId];

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return normalizeProjectRecord(project);
  }

  function assertMission(missionId, state) {
    const mission = state.missions[missionId];

    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    return normalizeMissionRecord(mission, state.projects?.[mission.projectId]?.pack || null);
  }

  function assertCouncilSession(councilSessionId, state) {
    const councilSession = state.councilSessions[councilSessionId];

    if (!councilSession) {
      throw new Error(`Council session not found: ${councilSessionId}`);
    }

    return councilSession;
  }

  function assertTask(taskId, state) {
    const task = state.tasks[taskId];

    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    return task;
  }

  function assertArtifact(artifactId, state) {
    const artifact = state.artifacts[artifactId];

    if (!artifact) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }

    return artifact;
  }

  function assertDecisionInboxItem(itemId, state) {
    const item = state.decisionInboxItems[itemId];

    if (!item) {
      throw new Error(`Decision inbox item not found: ${itemId}`);
    }

    return item;
  }

  function assertApproval(approvalId, state) {
    const approval = state.approvals[approvalId];

    if (!approval) {
      throw new Error(`Approval not found: ${approvalId}`);
    }

    return approval;
  }

  function assertProposalRecord(proposalId, state) {
    const proposalRecord = state.proposalRecords[proposalId];

    if (!proposalRecord) {
      throw new Error(`Proposal record not found: ${proposalId}`);
    }

    return proposalRecord;
  }

  function assertProposalApplicationAttempt(applicationAttemptId, state) {
    const proposalApplicationAttempt = state.proposalApplicationAttempts[applicationAttemptId];

    if (!proposalApplicationAttempt) {
      throw new Error(`Proposal application attempt not found: ${applicationAttemptId}`);
    }

    return proposalApplicationAttempt;
  }

  function assertProposalSourceMutation(sourceMutationId, state) {
    const proposalSourceMutation = state.proposalSourceMutations[sourceMutationId];

    if (!proposalSourceMutation) {
      throw new Error(`Proposal source mutation not found: ${sourceMutationId}`);
    }

    return proposalSourceMutation;
  }

  function isCommitAction(action) {
    return action === COMMIT_ACTION.COMMIT_INTENT || action === COMMIT_ACTION.COMMIT_READY;
  }

  function resolveInboxItemRecord(item, action, note, now) {
    item.status = DECISION_INBOX_STATUS.RESOLVED;
    item.resolution = {
      action,
      note,
      resolvedAt: now,
    };
    item.updatedAt = now;
  }

  function normalizeVerificationArtifactIds(task, artifactIds, state) {
    if (!artifactIds) {
      return [];
    }

    if (!Array.isArray(artifactIds)) {
      throw new Error('verificationArtifactIds must be an array');
    }

    return artifactIds.map((artifactId) => {
      const artifact = assertArtifact(artifactId, state);

      if (artifact.taskId !== task.id) {
        throw new Error(`Artifact ${artifactId} is not linked to task ${task.id}`);
      }

      return artifact.id;
    });
  }

  function applyReviewResolution(task, item, input, now, state) {
    if (input.action !== REVIEW_STATUS.PASSED && input.action !== REVIEW_STATUS.CHANGES_REQUESTED) {
      throw new Error('Review items must resolve to passed or changes_requested');
    }

    const verificationArtifactIds = normalizeVerificationArtifactIds(
      task,
      input.verificationArtifactIds,
      state,
    );

    resolveInboxItemRecord(item, input.action, input.note || '', now);
    task.review.status = input.action;
    task.review.inboxItemId = null;
    task.review.resolution = {
      action: input.action,
      note: input.note || '',
      resolvedAt: now,
    };
    task.review.verificationArtifactIds = verificationArtifactIds;
  }

  function readStoredArtifactContent(artifact) {
    if (!artifact) {
      return '';
    }

    return store.readArtifact(artifact.path);
  }

  function getMarkdownSection(content, heading) {
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `^## ${escapedHeading}\\n([\\s\\S]*?)(?=^## [^\\n]+\\n|(?![\\s\\S]))`,
      'm',
    );
    const match = String(content || '').match(pattern);

    return match ? match[1].trim() : '';
  }

  function parseArtifactPathList(artifact, heading) {
    return uniqueReasons(
      getMarkdownSection(readStoredArtifactContent(artifact), heading)
        .split('\n')
        .map((line) => line.replace(/^[-*]\s+/, '').trim())
        .map((line) => normalizeRelativeArtifactPath(line))
        .filter(Boolean),
    );
  }

  function getArtifactRetentionState(artifact) {
    const retention = artifact?.retention && typeof artifact.retention === 'object' ? artifact.retention : {};
    const status = Object.values(RETENTION_CONSUMER_STATUS).includes(retention.status)
      ? retention.status
      : RETENTION_CONSUMER_STATUS.ACTIVE;

    return {
      actionLog: Array.isArray(retention.actionLog) ? retention.actionLog : [],
      lastAction: normalizeOptionalString(retention.lastAction),
      lastActionAt: normalizeOptionalString(retention.lastActionAt),
      status,
    };
  }

  function ensureArtifactRetentionState(artifact) {
    artifact.retention = getArtifactRetentionState(artifact);
    return artifact.retention;
  }

  function validateRetentionConsumerScope(state, projectId, taskId) {
    if (projectId) {
      assertProject(projectId, state);
    }

    if (taskId) {
      const scopedTask = assertTask(taskId, state);

      if (projectId && scopedTask.projectId !== projectId) {
        throw new Error(`Task ${scopedTask.id} does not belong to project ${projectId}`);
      }
    }
  }

  function listRetentionScopedArtifacts(state, projectId, taskId) {
    return Object.values(state.artifacts || {})
      .filter((artifact) => {
        const task = state.tasks[artifact.taskId];

        if (!task) {
          return false;
        }

        if (taskId && task.id !== taskId) {
          return false;
        }

        if (projectId && task.projectId !== projectId) {
          return false;
        }

        return true;
      })
      .sort(compareByCreatedDesc);
  }

  function getArtifactContentPayload(artifact) {
    const retention = getArtifactRetentionState(artifact);
    const pathExists = fs.existsSync(artifact.path);

    if (pathExists) {
      return {
        content: store.readArtifact(artifact.path),
        contentAvailable: true,
        contentUnavailableReason: null,
      };
    }

    if (retention.status === RETENTION_CONSUMER_STATUS.GC) {
      return {
        content: null,
        contentAvailable: false,
        contentUnavailableReason:
          'Artifact content was garbage-collected by the explicit retention consumer.',
      };
    }

    return {
      content: null,
      contentAvailable: false,
      contentUnavailableReason: 'Artifact content is unavailable at the recorded path.',
    };
  }

  function buildRetentionConsumerArtifactEntry(artifact, state) {
    const task = assertTask(artifact.taskId, state);
    const catalogEntry = ARTIFACT_CATALOG[artifact.type];
    const retention = getArtifactRetentionState(artifact);
    const pathExists = fs.existsSync(artifact.path);
    const futureEligibleActions = listRetentionFutureEligibleActions(catalogEntry.retentionTier);
    const availableActions = listRetentionAvailableActions(
      catalogEntry.retentionTier,
      retention.status,
    );
    let consumerDisposition = RETENTION_CONSUMER_DISPOSITION.CLEANUP_CANDIDATE;

    if (catalogEntry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_A) {
      consumerDisposition = RETENTION_CONSUMER_DISPOSITION.PROTECTED;
    } else if (
      catalogEntry.retentionTier === ARTIFACT_RETENTION_TIER.TIER_B ||
      retention.status === RETENTION_CONSUMER_STATUS.ARCHIVED ||
      retention.status === RETENTION_CONSUMER_STATUS.DELETED
    ) {
      consumerDisposition = RETENTION_CONSUMER_DISPOSITION.INSPECT_BEFORE_ACTION;
    }

    return {
      actionLog: retention.actionLog,
      availableActions,
      contentAvailable:
        pathExists && retention.status !== RETENTION_CONSUMER_STATUS.GC,
      consumerDisposition,
      createdAt: artifact.createdAt,
      currentPolicy: getRetentionCurrentPolicy(catalogEntry.retentionTier, retention.status),
      futureEligibleActions,
      id: artifact.id,
      lastAction: retention.lastAction,
      lastActionAt: retention.lastActionAt,
      latestCenteredBrowse: Boolean(catalogEntry.latestCenteredBrowse),
      path: artifact.path,
      pathExists,
      previewMode: catalogEntry.previewMode,
      projectId: task.projectId,
      provenanceCritical: Boolean(catalogEntry.provenanceCritical),
      reason: getRetentionReason(catalogEntry.retentionTier, retention.status),
      retentionStatus: retention.status,
      retentionTier: catalogEntry.retentionTier,
      runId: artifact.runId,
      taskId: artifact.taskId,
      type: artifact.type,
    };
  }

  function buildRetentionConsumerSummaryPayload(state, input = {}) {
    const projectId = normalizeOptionalString(input.projectId);
    const taskId = normalizeOptionalString(input.taskId);
    const artifacts = listRetentionScopedArtifacts(state, projectId, taskId).map((artifact) =>
      buildRetentionConsumerArtifactEntry(artifact, state),
    );

    return {
      action: input.action || RETENTION_CONSUMER_ACTION.PREVIEW,
      affectedArtifactIds: Array.isArray(input.affectedArtifactIds)
        ? [...input.affectedArtifactIds]
        : [],
      applyActionsImplemented: Boolean(input.applyActionsImplemented),
      appliedAt: input.appliedAt || null,
      artifacts,
      explicitOperatorInvocationRequired: true,
      hiddenCleanupAllowed: false,
      inspectedAt: input.inspectedAt || new Date().toISOString(),
      scope: {
        projectId,
        taskId,
      },
      summary: {
        archivedArtifacts: artifacts.filter(
          (artifact) => artifact.retentionStatus === RETENTION_CONSUMER_STATUS.ARCHIVED,
        ).length,
        cleanupCandidateArtifacts: artifacts.filter(
          (artifact) =>
            artifact.consumerDisposition ===
            RETENTION_CONSUMER_DISPOSITION.CLEANUP_CANDIDATE,
        ).length,
        deletedArtifacts: artifacts.filter(
          (artifact) => artifact.retentionStatus === RETENTION_CONSUMER_STATUS.DELETED,
        ).length,
        gcArtifacts: artifacts.filter(
          (artifact) => artifact.retentionStatus === RETENTION_CONSUMER_STATUS.GC,
        ).length,
        inspectBeforeActionArtifacts: artifacts.filter(
          (artifact) =>
            artifact.consumerDisposition ===
            RETENTION_CONSUMER_DISPOSITION.INSPECT_BEFORE_ACTION,
        ).length,
        protectedArtifacts: artifacts.filter(
          (artifact) =>
            artifact.consumerDisposition === RETENTION_CONSUMER_DISPOSITION.PROTECTED,
        ).length,
        totalArtifacts: artifacts.length,
      },
    };
  }

  function previewRetentionConsumer(input = {}) {
    const state = store.loadState();
    const requestedProjectId = normalizeOptionalString(input.projectId);
    const requestedTaskId = normalizeOptionalString(input.taskId);

    validateRetentionConsumerScope(state, requestedProjectId, requestedTaskId);

    return buildRetentionConsumerSummaryPayload(state, {
      action: RETENTION_CONSUMER_ACTION.PREVIEW,
      applyActionsImplemented: false,
      inspectedAt: new Date().toISOString(),
      projectId: requestedProjectId,
      taskId: requestedTaskId,
    });
  }

  function applyRetentionConsumer(input = {}) {
    const state = store.loadState();
    const requestedProjectId = normalizeOptionalString(input.projectId);
    const requestedTaskId = normalizeOptionalString(input.taskId);
    const action = normalizeOptionalString(input.action);
    const note = normalizeOptionalString(input.note);
    const artifactIds = uniqueReasons(
      Array.isArray(input.artifactIds)
        ? input.artifactIds.map((artifactId) => normalizeOptionalString(artifactId))
        : [],
    );

    validateRetentionConsumerScope(state, requestedProjectId, requestedTaskId);

    if (
      action !== RETENTION_CONSUMER_ACTION.ARCHIVE &&
      action !== RETENTION_CONSUMER_ACTION.DELETE &&
      action !== RETENTION_CONSUMER_ACTION.GC
    ) {
      throw new Error('Retention action must be archive, delete, or gc');
    }

    if (artifactIds.length === 0) {
      throw new Error('artifactIds must contain at least one artifact id');
    }

    const scopedArtifacts = listRetentionScopedArtifacts(state, requestedProjectId, requestedTaskId);
    const scopedArtifactsById = new Map(scopedArtifacts.map((artifact) => [artifact.id, artifact]));
    const targetArtifacts = artifactIds.map((artifactId) => {
      const artifact = scopedArtifactsById.get(artifactId);

      if (!artifact) {
        throw new Error(`Artifact ${artifactId} is outside the requested retention scope`);
      }

      return artifact;
    });
    const evaluatedTargets = targetArtifacts.map((artifact) =>
      buildRetentionConsumerArtifactEntry(artifact, state),
    );
    const rejectedTarget = evaluatedTargets.find(
      (artifact) => !artifact.availableActions.includes(action),
    );

    if (rejectedTarget) {
      const error = new Error(
        `Artifact ${rejectedTarget.id} does not allow retention action ${action} while status is ${rejectedTarget.retentionStatus}`,
      );
      error.statusCode = 409;
      throw error;
    }

    const now = new Date().toISOString();
    const rollbackRecords = [];

    try {
      for (const artifact of targetArtifacts) {
        const retention = ensureArtifactRetentionState(artifact);
        const previousPath = artifact.path;
        const previousRetention = cloneJsonValue(retention);
        const previousContent = fs.existsSync(previousPath)
          ? store.readArtifact(previousPath)
          : null;

        if (!previousContent && !fs.existsSync(previousPath)) {
          const error = new Error(
            `Artifact ${artifact.id} content is unavailable at ${artifact.path}`,
          );
          error.statusCode = 409;
          throw error;
        }

        let nextPath = previousPath;
        let nextStatus = retention.status;

        if (action === RETENTION_CONSUMER_ACTION.ARCHIVE) {
          nextPath = store.moveArtifactToArchive(previousPath);
          nextStatus = RETENTION_CONSUMER_STATUS.ARCHIVED;
        } else if (action === RETENTION_CONSUMER_ACTION.DELETE) {
          nextPath = store.moveArtifactToDeleted(previousPath);
          nextStatus = RETENTION_CONSUMER_STATUS.DELETED;
        } else if (action === RETENTION_CONSUMER_ACTION.GC) {
          store.removeArtifactAtPath(previousPath);
          nextStatus = RETENTION_CONSUMER_STATUS.GC;
        }

        artifact.path = nextPath;
        artifact.retention = {
          ...retention,
          actionLog: [
            ...retention.actionLog,
            {
              action,
              actedAt: now,
              note,
              pathAfter:
                action === RETENTION_CONSUMER_ACTION.GC ? null : nextPath,
              pathBefore: previousPath,
              statusAfter: nextStatus,
            },
          ],
          lastAction: action,
          lastActionAt: now,
          status: nextStatus,
        };

        rollbackRecords.push({
          artifact,
          nextPath,
          previousContent,
          previousPath,
          previousRetention,
        });
      }

      store.saveState(state);
    } catch (error) {
      for (const record of rollbackRecords.reverse()) {
        record.artifact.path = record.previousPath;
        record.artifact.retention = record.previousRetention;

        if (record.nextPath && record.nextPath !== record.previousPath && fs.existsSync(record.nextPath)) {
          fs.rmSync(record.nextPath, { force: true });
        }

        if (record.previousContent !== null) {
          store.writeArtifactAtPath(record.previousPath, record.previousContent);
        }
      }

      store.saveState(state);
      throw error;
    }

    const updatedState = store.loadState();

    return buildRetentionConsumerSummaryPayload(updatedState, {
      action,
      affectedArtifactIds: artifactIds,
      applyActionsImplemented: true,
      appliedAt: now,
      inspectedAt: now,
      projectId: requestedProjectId,
      taskId: requestedTaskId,
    });
  }

  function normalizeDecisionInboxShape(input = {}) {
    const kind = input.kind || DECISION_INBOX_KIND.DECISION;
    const sourceType = input.sourceType || kind;
    const blocksTask = Boolean(input.blocksTask);

    if (!decisionInboxKinds.has(kind)) {
      throw new Error(`Unsupported decision inbox kind: ${kind}`);
    }

    if (!decisionInboxSourceTypes.has(sourceType)) {
      throw new Error(`Unsupported decision inbox sourceType: ${sourceType}`);
    }

    if (!DECISION_INBOX_ALLOWED_KIND_BY_SOURCE_TYPE[sourceType].includes(kind)) {
      throw new Error(
        `Decision inbox kind ${kind} is not allowed for sourceType ${sourceType}`,
      );
    }

    if (blocksTask && kind !== DECISION_INBOX_KIND.DECISION) {
      throw new Error('blocksTask=true is only allowed for decision inbox kind=decision');
    }

    return {
      kind,
      sourceType,
      blocksTask,
    };
  }

  function buildBuilderLiveMutationGuardSummary(task, state) {
    const provenance = evaluateCurrentBuilderLiveMutationProvenance(task, state);
    const currentPreflight = provenance.currentPreflight;
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
    const approvalEvaluation = evaluateLatestApprovalForAction({
      action: BUILDER_ACTION.LIVE_MUTATION,
      currentPreflight,
      requireCurrentPreflightTarget: true,
      state,
      task,
    });
    const targetFiles = currentPreflight.artifact
      ? parseArtifactPathList(currentPreflight.artifact, 'Target Files')
      : [];
    const existingSuccessfulRun =
      currentPreflight.artifact && currentPreflight.run
        ? findLatestSuccessfulBuilderLiveMutationRun(task, state, {
            preflightArtifactId: currentPreflight.artifact.id,
            preflightRunId: currentPreflight.run.id,
          })
        : null;
    const reasons = [];

    if (!currentPreflight.artifact) {
      reasons.push('latest preflight artifact required');
    }

    if (currentPreflight.artifact && targetFiles.length === 0) {
      reasons.push(`latest preflight ${currentPreflight.artifact.id} target files required`);
    }

    if (pendingBlockingDecisionItems.length > 0) {
      reasons.push(
        `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
      );
    }

    if (pendingApprovals.length > 0) {
      reasons.push(`pending approvals: ${pendingApprovals.map((item) => item.id).join(', ')}`);
    }

    if (
      currentPreflight.artifact &&
      !provenance.hasMatchingPlanArchitectureProvenance
    ) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} does not match the current latest plan-plus-architecture provenance chain`,
      );
    }

    if (
      currentPreflight.artifact &&
      !provenance.hasMatchingBreakdownProvenance
    ) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} does not match the current latest plan-plus-architecture-plus-breakdown provenance chain`,
      );
    }

    if (currentPreflight.artifact && !provenance.hasMatchingPreflightProvenance) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} does not match the current latest preflight provenance chain`,
      );
    }

    if (existingSuccessfulRun) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} already has successful builder live mutation run ${existingSuccessfulRun.id}`,
      );
    }

    reasons.push(...approvalEvaluation.reasons);

    return {
      allowed: reasons.length === 0 && approvalEvaluation.allowed && !existingSuccessfulRun,
      approvalStale: approvalEvaluation.stale,
      currentPreflightArtifactId: approvalEvaluation.currentPreflightArtifactId,
      currentPreflightRunId: approvalEvaluation.currentPreflightRunId,
      existingSuccessfulBuilderRunId: existingSuccessfulRun?.id || null,
      latestApprovalDisplayStatus: buildLatestApprovalDisplayStatus(approvalEvaluation),
      latestApprovalId: approvalEvaluation.latestApproval?.id || null,
      latestApprovalStatus: approvalEvaluation.latestApproval?.status || null,
      pendingApprovalIds: pendingApprovals.map((approval) => approval.id),
      pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
      targetFileCount: targetFiles.length,
      reasons: uniqueReasons(reasons),
      targetPreflightArtifactId: approvalEvaluation.latestApproval?.targetArtifactId || null,
      targetPreflightRunId: approvalEvaluation.latestApproval?.targetRunId || null,
    };
  }

  function getTaskGuardSummary(taskId, state = null) {
    const loadedState = state || store.loadState();
    const task = assertTask(taskId, loadedState);

    return {
      builderLiveMutationApprovalRequest: buildBuilderLiveMutationApprovalRequestSummary(
        task,
        loadedState,
      ),
      builderLiveMutation: buildBuilderLiveMutationGuardSummary(task, loadedState),
      builderPreflight: buildBuilderPreflightGuardSummary(task, loadedState),
      taskBreaker: buildTaskBreakerGuardSummary(task, loadedState),
    };
  }

  function listTaskGuardSummaries(input = {}) {
    const state = store.loadState();
    const summaries = {};

    for (const task of Object.values(state.tasks)) {
      if (input.projectId && task.projectId !== input.projectId) {
        continue;
      }

      summaries[task.id] = getTaskGuardSummary(task.id, state);
    }

    return summaries;
  }

  function assertTaskCanRunTaskBreaker(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const guardSummary = buildTaskBreakerGuardSummary(task, state);

    if (guardSummary.allowed) {
      return {
        guardSummary,
        task,
      };
    }

    throw new Error(
      `Task ${task.id} cannot run task-breaker while gates remain active: ${guardSummary.reasons.join('; ')}`,
    );
  }

  function assertTaskCanRunBuilderPreflight(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const guardSummary = buildBuilderPreflightGuardSummary(task, state);

    if (guardSummary.allowed) {
      return {
        guardSummary,
        task,
      };
    }

    throw new Error(
      `Task ${task.id} cannot run builder preflight while gates remain active: ${guardSummary.reasons.join('; ')}`,
    );
  }

  function assertTaskCanRunBuilderLiveMutation(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const guardSummary = buildBuilderLiveMutationGuardSummary(task, state);

    if (guardSummary.allowed) {
      return {
        guardSummary,
        task,
      };
    }

    throw new Error(
      `Task ${task.id} cannot run builder live mutation while guards remain active: ${guardSummary.reasons.join('; ')}`,
    );
  }

  function createDecisionInboxItemRecord(state, input) {
    const task = assertTask(input.taskId, state);
    const normalizedShape = normalizeDecisionInboxShape(input);
    const id = input.id || nextId(state, 'decisionInboxItem');
    const now = input.now || new Date().toISOString();

    if (!input.title) {
      throw new Error('Decision inbox item title is required');
    }

    state.decisionInboxItems[id] = {
      id,
      projectId: task.projectId,
      taskId: task.id,
      kind: normalizedShape.kind,
      status: DECISION_INBOX_STATUS.PENDING,
      title: input.title,
      prompt: input.prompt || '',
      blocksTask: normalizedShape.blocksTask,
      sourceType: normalizedShape.sourceType,
      sourceId: input.sourceId || null,
      resolution: null,
      createdAt: now,
      updatedAt: now,
    };

    return state.decisionInboxItems[id];
  }

  function createProposalRecord(input = {}) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);
    const task = input.taskId ? assertTask(input.taskId, state) : null;
    const creationApproval = normalizeProposalRecordCreationApproval(input.creationApproval);
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();
    const proposalType = normalizeRequiredString(input.proposalType, 'proposalType');
    const riskClass = normalizeRequiredString(input.riskClass, 'riskClass');
    const expiresAt = input.expiresAt
      ? normalizeIsoTimestamp(input.expiresAt, 'expiresAt')
      : defaultProposalRecordExpiry(now);
    const approvalRefs = normalizeRequiredStringArray(input.approvalRefs, 'approvalRefs');
    const blockedActions = normalizeProposalRecordBlockedActions(input.blockedActions);
    const id = nextProposalRecordId(state);

    if (task && task.projectId !== project.id) {
      throw new Error(`Task ${task.id} is not linked to project ${project.id}`);
    }

    if (!proposalRecordTypes.has(proposalType)) {
      throw new Error(`Unsupported proposalType: ${proposalType}`);
    }

    if (!proposalRecordRiskClasses.has(riskClass)) {
      throw new Error(`Unsupported riskClass: ${riskClass}`);
    }

    if (!approvalRefs.includes(creationApproval.decisionId)) {
      throw new Error('approvalRefs must include creationApproval.decisionId');
    }

    state.proposalRecords[id] = {
      proposalId: id,
      projectId: project.id,
      taskId: task?.id || null,
      title: normalizeRequiredString(input.title, 'title'),
      proposalType,
      status: PROPOSAL_RECORD_STATUS.CREATED,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      sourceClaimIds: normalizeRequiredStringArray(input.sourceClaimIds, 'sourceClaimIds'),
      evidenceRefs: normalizeRequiredStringArray(input.evidenceRefs, 'evidenceRefs'),
      negativeEvidenceRefs: normalizeRequiredStringArray(
        input.negativeEvidenceRefs,
        'negativeEvidenceRefs',
      ),
      reviewerRefs: normalizeRequiredStringArray(input.reviewerRefs, 'reviewerRefs'),
      approvalRefs,
      affectedFiles: normalizeRepoRelativePaths(input.affectedFiles, 'affectedFiles'),
      riskClass,
      approvalGate: {
        gateId: creationApproval.decisionId,
        requiredBefore: 'proposal-record-creation',
        requiredActor: 'operator',
        approvalPhrase: creationApproval.approvalStatement,
        decisionLogRef: normalizeOptionalString(input.approvalGate?.decisionLogRef),
        taskLedgerRef: normalizeOptionalString(input.approvalGate?.taskLedgerRef),
        blockedActions,
      },
      reviewQuestion: normalizeRequiredString(input.reviewQuestion, 'reviewQuestion'),
      verificationPlan: normalizeProposalRecordVerificationPlan(input.verificationPlan),
      blockedActions,
      applyAllowed: false,
      nonApprovalStatement:
        input.nonApprovalStatement ||
        'Proposal record creation is not proposal application approval and does not authorize provider calls, memory persistence, source mutation, commit, or push.',
      creationApproval,
    };

    store.saveState(state);

    return state.proposalRecords[id];
  }

  function getProposalRecord(proposalId) {
    const state = store.loadState();
    return assertProposalRecord(proposalId, state);
  }

  function listProposalRecords(input = {}) {
    const state = store.loadState();
    let proposalRecords = Object.values(state.proposalRecords);

    if (input.projectId) {
      proposalRecords = proposalRecords.filter((record) => record.projectId === input.projectId);
    }

    if (input.taskId) {
      proposalRecords = proposalRecords.filter((record) => record.taskId === input.taskId);
    }

    if (input.status) {
      proposalRecords = proposalRecords.filter((record) => record.status === input.status);
    }

    return proposalRecords.sort(compareRecordsByCreatedDesc);
  }

  function quarantineProposalRecord(input = {}) {
    const state = store.loadState();
    const proposalRecord = assertProposalRecord(input.proposalId, state);
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();

    proposalRecord.status = PROPOSAL_RECORD_STATUS.QUARANTINED;
    proposalRecord.updatedAt = now;
    proposalRecord.quarantine = {
      reason: normalizeRequiredString(input.reason, 'reason'),
      quarantinedAt: now,
    };
    proposalRecord.applyAllowed = false;
    store.saveState(state);

    return proposalRecord;
  }

  function createProposalApplicationAttempt(input = {}) {
    const state = store.loadState();
    const proposalRecord = assertProposalRecord(input.proposalId, state);
    const project = assertProject(proposalRecord.projectId, state);
    const task = proposalRecord.taskId ? assertTask(proposalRecord.taskId, state) : null;
    const applicationApproval = normalizeProposalApplicationApproval(input.applicationApproval);
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();
    const applicationApprovalRefs = normalizeRequiredStringArray(
      input.applicationApprovalRefs,
      'applicationApprovalRefs',
    );
    const sourceEvidenceRefs = normalizeRequiredStringArray(
      input.sourceEvidenceRefs,
      'sourceEvidenceRefs',
    );
    const negativeEvidenceRefs = normalizeRequiredStringArray(
      input.negativeEvidenceRefs,
      'negativeEvidenceRefs',
    );
    const rollbackRefs = normalizeRequiredStringArray(input.rollbackRefs, 'rollbackRefs');
    const focusedSmokeRefs = normalizeRequiredStringArray(
      input.focusedSmokeRefs,
      'focusedSmokeRefs',
    );
    const proposalApplicationAttemptBlockedActions =
      normalizeProposalApplicationAttemptBlockedActions(input.blockedActions);
    const id = nextProposalApplicationAttemptId(state);

    assertProposalRecordCanReceiveApplicationAttempt(proposalRecord, now);

    if (!applicationApprovalRefs.includes(applicationApproval.decisionId)) {
      throw new Error('applicationApprovalRefs must include applicationApproval.decisionId');
    }

    if (proposalRecord.approvalRefs.includes(applicationApproval.decisionId)) {
      throw new Error('applicationApproval must be separate from creation approval');
    }

    state.proposalApplicationAttempts[id] = {
      applicationAttemptId: id,
      proposalId: proposalRecord.proposalId,
      projectId: project.id,
      taskId: task?.id || null,
      status: PROPOSAL_APPLICATION_ATTEMPT_STATUS.PLANNED,
      createdAt: now,
      updatedAt: now,
      applicationApprovalRefs,
      sourceEvidenceRefs,
      negativeEvidenceRefs,
      rollbackRefs,
      focusedSmokeRefs,
      blockedActions: proposalApplicationAttemptBlockedActions,
      proposalGenerationAllowed: false,
      providerCallsAllowed: false,
      memoryPersistenceAllowed: false,
      sourceMutationAllowed: false,
      commitAllowed: false,
      pushAllowed: false,
      nonApprovalStatement:
        input.nonApprovalStatement ||
        'This audit-only proposal application attempt records operator intent and does not authorize proposal generation, provider calls, memory persistence, source mutation, commit, or push.',
      applicationApproval,
    };

    proposalRecord.applicationAttemptIds = [
      ...new Set([...(proposalRecord.applicationAttemptIds || []), id]),
    ];
    proposalRecord.updatedAt = now;
    proposalRecord.applyAllowed = false;
    store.saveState(state);

    return state.proposalApplicationAttempts[id];
  }

  function getProposalApplicationAttempt(applicationAttemptId) {
    const state = store.loadState();
    return assertProposalApplicationAttempt(applicationAttemptId, state);
  }

  function listProposalApplicationAttempts(input = {}) {
    const state = store.loadState();
    let proposalApplicationAttempts = Object.values(state.proposalApplicationAttempts);

    if (input.projectId) {
      proposalApplicationAttempts = proposalApplicationAttempts.filter(
        (attempt) => attempt.projectId === input.projectId,
      );
    }

    if (input.taskId) {
      proposalApplicationAttempts = proposalApplicationAttempts.filter(
        (attempt) => attempt.taskId === input.taskId,
      );
    }

    if (input.proposalId) {
      proposalApplicationAttempts = proposalApplicationAttempts.filter(
        (attempt) => attempt.proposalId === input.proposalId,
      );
    }

    if (input.status) {
      proposalApplicationAttempts = proposalApplicationAttempts.filter(
        (attempt) => attempt.status === input.status,
      );
    }

    return proposalApplicationAttempts.sort(compareRecordsByCreatedDesc);
  }

  function quarantineProposalApplicationAttempt(input = {}) {
    const state = store.loadState();
    const proposalApplicationAttempt = assertProposalApplicationAttempt(
      input.applicationAttemptId,
      state,
    );
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();

    proposalApplicationAttempt.status = PROPOSAL_APPLICATION_ATTEMPT_STATUS.QUARANTINED;
    proposalApplicationAttempt.updatedAt = now;
    proposalApplicationAttempt.quarantine = {
      reason: normalizeRequiredString(input.reason, 'reason'),
      quarantinedAt: now,
    };
    proposalApplicationAttempt.proposalGenerationAllowed = false;
    proposalApplicationAttempt.providerCallsAllowed = false;
    proposalApplicationAttempt.memoryPersistenceAllowed = false;
    proposalApplicationAttempt.sourceMutationAllowed = false;
    proposalApplicationAttempt.commitAllowed = false;
    proposalApplicationAttempt.pushAllowed = false;
    store.saveState(state);

    return proposalApplicationAttempt;
  }

  function resolveProposalSourceMutationTargetPath(project, relativePath) {
    if (!project.projectPath) {
      throw new Error('project.projectPath is required before source mutation');
    }

    // Resolve the project root through any symlinks so containment is checked
    // against the real directory, then require the lexical target to stay inside it.
    const resolvedProjectPath = fs.realpathSync(path.resolve(project.projectPath));
    const targetPath = path.resolve(resolvedProjectPath, relativePath);

    if (
      targetPath !== resolvedProjectPath &&
      !targetPath.startsWith(`${resolvedProjectPath}${path.sep}`)
    ) {
      throw new Error('mutation.relativePath must stay inside the project path');
    }

    // Lexical containment is not enough: a symlink at the target, or a symlinked
    // ancestor directory, would let fs.writeFileSync follow the link outside the
    // project. Reject a symlinked target outright and re-assert containment on the
    // real path of the (existing) parent directory.
    if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isSymbolicLink()) {
      throw new Error('mutation target must not be a symbolic link');
    }

    const parentDir = path.dirname(targetPath);

    if (fs.existsSync(parentDir)) {
      const realParentPath = fs.realpathSync(parentDir);

      if (
        realParentPath !== resolvedProjectPath &&
        !realParentPath.startsWith(`${resolvedProjectPath}${path.sep}`)
      ) {
        throw new Error('mutation.relativePath must stay inside the project path');
      }
    }

    return targetPath;
  }

  function applyProposalSourceMutation(input = {}) {
    const state = store.loadState();
    const proposalRecord = assertProposalRecord(input.proposalId, state);
    const proposalApplicationAttempt = assertProposalApplicationAttempt(
      input.applicationAttemptId,
      state,
    );
    const project = assertProject(proposalRecord.projectId, state);
    const sourceMutationApproval = normalizeProposalSourceMutationApproval(
      input.sourceMutationApproval,
    );
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();
    const sourceMutationApprovalRefs = normalizeRequiredStringArray(
      input.sourceMutationApprovalRefs,
      'sourceMutationApprovalRefs',
    );
    const mutationPlanRefs = normalizeRequiredStringArray(
      input.mutationPlanRefs,
      'mutationPlanRefs',
    );
    const sourceEvidenceRefs = normalizeRequiredStringArray(
      input.sourceEvidenceRefs,
      'sourceEvidenceRefs',
    );
    const negativeEvidenceRefs = normalizeRequiredStringArray(
      input.negativeEvidenceRefs,
      'negativeEvidenceRefs',
    );
    const rollbackRefs = normalizeRequiredStringArray(input.rollbackRefs, 'rollbackRefs');
    const focusedSmokeRefs = normalizeRequiredStringArray(
      input.focusedSmokeRefs,
      'focusedSmokeRefs',
    );
    const mutation = normalizeProposalSourceMutationTarget(input.mutation);
    const cleanBaselineProof = normalizeCleanBaselineProof(input.cleanBaselineProof);
    const dryRunDiffPreview = normalizeDryRunDiffPreview(
      input.dryRunDiffPreview,
      mutation.relativePath,
    );
    const blockedActions = normalizeProposalSourceMutationBlockedActions(input.blockedActions);

    assertProposalApplicationAttemptCanAuthorizeSourceMutation(
      proposalApplicationAttempt,
      proposalRecord,
      now,
    );

    if (!sourceMutationApprovalRefs.includes(sourceMutationApproval.decisionId)) {
      throw new Error('sourceMutationApprovalRefs must include sourceMutationApproval.decisionId');
    }

    if (proposalRecord.approvalRefs.includes(sourceMutationApproval.decisionId)) {
      throw new Error('sourceMutationApproval must be separate from creation approval');
    }

    if (
      proposalApplicationAttempt.applicationApprovalRefs.includes(sourceMutationApproval.decisionId)
    ) {
      throw new Error('sourceMutationApproval must be separate from application approval');
    }

    if (!proposalRecord.affectedFiles.includes(mutation.relativePath)) {
      throw new Error('mutation.relativePath must be listed in proposalRecord.affectedFiles');
    }

    const targetPath = resolveProposalSourceMutationTargetPath(project, mutation.relativePath);

    if (!fs.existsSync(targetPath)) {
      throw new Error(`mutation target file does not exist: ${mutation.relativePath}`);
    }

    const currentContent = fs.readFileSync(targetPath, 'utf8');

    if (currentContent !== mutation.expectedBeforeContent) {
      throw new Error('mutation.expectedBeforeContent must match the current target content');
    }

    const id = nextProposalSourceMutationId(state);

    fs.writeFileSync(targetPath, mutation.afterContent);

    state.proposalSourceMutations[id] = {
      sourceMutationId: id,
      proposalId: proposalRecord.proposalId,
      applicationAttemptId: proposalApplicationAttempt.applicationAttemptId,
      projectId: project.id,
      taskId: proposalRecord.taskId || null,
      status: PROPOSAL_SOURCE_MUTATION_STATUS.APPLIED,
      createdAt: now,
      updatedAt: now,
      relativePath: mutation.relativePath,
      beforeContent: mutation.expectedBeforeContent,
      afterContent: mutation.afterContent,
      cleanBaselineProof,
      dryRunDiffPreview,
      sourceMutationApprovalRefs,
      mutationPlanRefs,
      sourceEvidenceRefs,
      negativeEvidenceRefs,
      rollbackRefs,
      focusedSmokeRefs,
      blockedActions,
      proposalGenerationAllowed: false,
      providerCallsAllowed: false,
      memoryPersistenceAllowed: false,
      sourceMutationOutsideNamedPathAllowed: false,
      commitAllowed: false,
      pushAllowed: false,
      nonApprovalStatement:
        input.nonApprovalStatement ||
        'This source mutation applies exactly one approved mutation plan and does not authorize proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, or push.',
      sourceMutationApproval,
    };

    proposalApplicationAttempt.sourceMutationIds = [
      ...new Set([...(proposalApplicationAttempt.sourceMutationIds || []), id]),
    ];
    proposalApplicationAttempt.updatedAt = now;
    proposalRecord.updatedAt = now;
    proposalRecord.applyAllowed = false;
    store.saveState(state);

    return state.proposalSourceMutations[id];
  }

  function getProposalSourceMutation(sourceMutationId) {
    const state = store.loadState();
    return assertProposalSourceMutation(sourceMutationId, state);
  }

  function listProposalSourceMutations(input = {}) {
    const state = store.loadState();
    const proposalSourceMutations = Object.values(state.proposalSourceMutations).filter(
      (candidate) => {
        if (input.proposalId && candidate.proposalId !== input.proposalId) {
          return false;
        }

        if (input.status && candidate.status !== input.status) {
          return false;
        }

        return true;
      },
    );

    return proposalSourceMutations.sort(compareRecordsByCreatedDesc);
  }

  function rollbackProposalSourceMutation(input = {}) {
    const state = store.loadState();
    const proposalSourceMutation = assertProposalSourceMutation(input.sourceMutationId, state);
    const project = assertProject(proposalSourceMutation.projectId, state);
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();

    if (proposalSourceMutation.status !== PROPOSAL_SOURCE_MUTATION_STATUS.APPLIED) {
      throw new Error('proposalSourceMutation.status must be applied');
    }

    const targetPath = resolveProposalSourceMutationTargetPath(
      project,
      proposalSourceMutation.relativePath,
    );

    if (!fs.existsSync(targetPath)) {
      throw new Error(
        `rollback target file does not exist: ${proposalSourceMutation.relativePath}`,
      );
    }

    const currentContent = fs.readFileSync(targetPath, 'utf8');

    if (currentContent !== proposalSourceMutation.afterContent) {
      throw new Error('rollback requires the applied content to still be present');
    }

    fs.writeFileSync(targetPath, proposalSourceMutation.beforeContent);

    proposalSourceMutation.status = PROPOSAL_SOURCE_MUTATION_STATUS.ROLLED_BACK;
    proposalSourceMutation.updatedAt = now;
    proposalSourceMutation.rollback = {
      reason: normalizeRequiredString(input.reason, 'reason'),
      rolledBackAt: now,
    };
    store.saveState(state);

    return proposalSourceMutation;
  }

  function quarantineProposalSourceMutation(input = {}) {
    const state = store.loadState();
    const proposalSourceMutation = assertProposalSourceMutation(input.sourceMutationId, state);
    const now = input.now
      ? normalizeIsoTimestamp(input.now, 'now')
      : new Date().toISOString();

    proposalSourceMutation.status = PROPOSAL_SOURCE_MUTATION_STATUS.QUARANTINED;
    proposalSourceMutation.updatedAt = now;
    proposalSourceMutation.quarantine = {
      reason: normalizeRequiredString(input.reason, 'reason'),
      quarantinedAt: now,
    };
    proposalSourceMutation.proposalGenerationAllowed = false;
    proposalSourceMutation.providerCallsAllowed = false;
    proposalSourceMutation.memoryPersistenceAllowed = false;
    proposalSourceMutation.sourceMutationOutsideNamedPathAllowed = false;
    proposalSourceMutation.commitAllowed = false;
    proposalSourceMutation.pushAllowed = false;
    store.saveState(state);

    return proposalSourceMutation;
  }

  function findPendingReviewItem(taskId, state) {
    return Object.values(state.decisionInboxItems).find(
      (item) =>
        item.taskId === taskId &&
        item.kind === DECISION_INBOX_KIND.REVIEW &&
        item.status === DECISION_INBOX_STATUS.PENDING,
    );
  }

  function ensurePendingReviewGateRecord(state, task, now) {
    const pendingReviewItem = findPendingReviewItem(task.id, state);
    let reviewItem = pendingReviewItem || null;

    task.lifecycleState = TASK_LIFECYCLE.REVIEW;
    task.review.status = REVIEW_STATUS.PENDING;
    task.review.inboxItemId = pendingReviewItem ? pendingReviewItem.id : null;
    task.review.resolution = null;
    task.review.verificationArtifactIds = [];

    if (!pendingReviewItem) {
      reviewItem = createDecisionInboxItemRecord(state, {
        taskId: task.id,
        kind: DECISION_INBOX_KIND.REVIEW,
        title: `Review pending: ${task.title}`,
        prompt: 'Review is required before the task can be considered done.',
        sourceType: DECISION_INBOX_SOURCE_TYPE.REVIEW,
        sourceId: task.id,
        blocksTask: false,
        now,
      });

      task.review.inboxItemId = reviewItem.id;
    }

    recalculateTaskFlags(task, state);
    task.updatedAt = now;

    return {
      reviewItem,
      task,
    };
  }

  function createProject(input) {
    const state = store.loadState();
    const projectPath = path.resolve(input.projectPath || '');
    const pack = normalizeProjectPack(input.pack);

    if (!input.name) {
      throw new Error('프로젝트 이름이 필요합니다.');
    }

    if (!input.projectPath) {
      throw new Error('project_path가 필요합니다.');
    }

    if (!fs.existsSync(projectPath)) {
      throw new Error(`project_path가 존재하지 않습니다: ${projectPath}`);
    }

    const existingProject = Object.values(state.projects).find(
      (project) => project.projectPath === projectPath,
    );

    if (existingProject) {
      normalizeProjectRecord(existingProject);
      existingProject.pack = pack;
      existingProject.updatedAt = new Date().toISOString();
      state.activeProjectId = existingProject.id;
      state.selectedMissionId =
        Object.values(state.missions)
          .filter((mission) => mission.projectId === existingProject.id)
          .sort(compareRecordsByCreatedDesc)[0]?.id || null;
      store.saveState(state);
      return normalizeProjectRecord(state.projects[existingProject.id]);
    }

    const id = nextId(state, 'project');
    const now = new Date().toISOString();

    state.projects[id] = {
      id,
      name: input.name,
      projectPath,
      pack,
      provider: normalizeProjectProviderConfig(input.provider),
      readiness: 'ready',
      createdAt: now,
      updatedAt: now,
    };
    state.activeProjectId = id;
    state.selectedMissionId = null;
    store.saveState(state);

    return normalizeProjectRecord(state.projects[id]);
  }

  function getProject(projectId) {
    const state = store.loadState();
    return normalizeProjectRecord(assertProject(projectId, state));
  }

  function selectProject(projectId) {
    const state = store.loadState();
    const project = assertProject(projectId, state);

    normalizeProjectRecord(project);
    state.activeProjectId = project.id;
    state.selectedMissionId =
      Object.values(state.missions)
        .filter((mission) => mission.projectId === project.id)
        .sort(compareRecordsByCreatedDesc)[0]?.id || null;
    store.saveState(state);

    return normalizeProjectRecord(state.projects[project.id]);
  }

  function setProjectProviderConfig(input) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);
    const now = new Date().toISOString();

    project.provider = normalizeProjectProviderConfig(input.provider);
    project.updatedAt = now;
    store.saveState(state);

    return normalizeProjectRecord(state.projects[project.id]);
  }

  function createMission(input) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);
    const title = String(input.title || '').trim();
    const goal = String(input.goal || '').trim();
    const constraints = String(input.constraints || '').trim();
    const deliverableType = normalizeMissionDeliverableType(input.deliverableType, project.pack);

    if (!title) {
      throw new Error('미션 제목이 필요합니다.');
    }

    if (!goal) {
      throw new Error('미션 목표가 필요합니다.');
    }

    const id = nextId(state, 'mission');
    const now = new Date().toISOString();

    state.missions[id] = {
      id,
      projectId: project.id,
      title,
      goal,
      constraints,
      deliverableType,
      status: 'draft',
      linkedTaskId: null,
      councilSessionId: null,
      staffingEntryId: null,
      createdAt: now,
      updatedAt: now,
    };
    state.selectedMissionId = id;
    store.saveState(state);

    return normalizeMissionRecord(state.missions[id], project.pack);
  }

  function buildCouncilSessionRecord(state, mission, project, now) {
    const knowledgeWorkPack = project.pack === PACKS.KNOWLEDGE_WORK;
    const deliverableType = normalizeMissionDeliverableType(mission.deliverableType, project.pack);
    const deliverableLabelByType = {
      checklist: '체크리스트',
      'decision-memo': '의사결정 메모',
      'execution-plan': '실행 계획서',
      prd: 'PRD',
      'research-brief': '리서치 브리프',
    };
    const deliverableLabel = deliverableLabelByType[deliverableType] || '의사결정 메모';
    const constraintsPresent = Boolean(String(mission.constraints || '').trim());
    const openQuestions = constraintsPresent
      ? knowledgeWorkPack
        ? [
            `기록된 제약 안에서 첫 결과물을 한 개의 ${deliverableLabel}로 유지해도 되는가?`,
            '정렬 승인 이후 어떤 참고 자료와 근거를 먼저 모아야 하는가?',
          ]
        : [
            '기록된 제약 안에서 첫 결과물을 한 개의 한정된 슬라이스로 유지해도 되는가?',
            '정렬 승인 이후 고급 운영에서 어떤 증적을 가장 먼저 확인해야 하는가?',
          ]
      : knowledgeWorkPack
        ? [
            `첫 결과물을 ${deliverableLabel}로 고정해도 되는가?`,
            '정렬 승인 이후 어떤 근거를 먼저 모아야 추천안의 신뢰도가 올라가는가?',
          ]
        : [
            '첫 실행 범위를 한 파일 또는 한 흐름으로 더 좁힐 필요가 있는가?',
            '정렬 승인 이후 고급 운영에서 어떤 증적을 가장 먼저 확인해야 하는가?',
          ];

    return {
      id: nextId(state, 'councilSession'),
      missionId: mission.id,
      status: 'pending-alignment',
      participants: [
        {
          role: 'Conductor',
          focus: '정렬 체크포인트와 한정된 인계',
        },
        {
          role: 'Strategist',
          focus: '사용자 목표, 결과 프레이밍, 범위 제어',
        },
        {
          role: 'Architect',
          focus: '시스템 경계와 의미론 안전',
        },
        {
          role: 'Decomposer',
          focus: '첫 슬라이스 분해와 실행 인계',
        },
      ],
      summary:
        knowledgeWorkPack
          ? `협의회는 미션을 하나의 ${deliverableLabel} 슬라이스로 정렬하고, 하위 실행은 아직 시작하지 않은 채 명시적 정렬만 요구한다.`
          : '협의회는 미션을 하나의 한정된 슬라이스로 정렬하고, 하위 실행은 아직 시작하지 않은 채 명시적 정렬만 요구한다.',
      recommendation:
        knowledgeWorkPack
          ? `추천안 승인으로 첫 ${deliverableLabel} 슬라이스를 정렬하고, 이후 실행 자동 체인은 planner -> architect -> task-breaker -> builder preflight까지만 연결한다.`
          : '추천안 승인으로 첫 한정된 슬라이스를 정렬하고, 이후 실행 자동 체인은 planner -> architect -> task-breaker -> builder preflight까지만 연결한다.',
      openQuestions,
      transcript: [
        {
          role: 'Strategist',
          stance: '목표 정리',
          content: knowledgeWorkPack
            ? `우선순위는 "${mission.goal}"를 가장 짧은 판단 경로로 바꾸는 것이다. 첫 결과물은 하나의 ${deliverableLabel}로 제한한다.`
            : `우선순위는 "${mission.goal}"를 가장 짧은 검증 경로로 바꾸는 것이다. 첫 결과물은 하나의 한정된 슬라이스로 제한한다.`,
        },
        {
          role: 'Architect',
          stance: '경계 보호',
          content: constraintsPresent
            ? knowledgeWorkPack
              ? `기록된 constraints("${mission.constraints}")를 유지하고, 근거 없는 범위 확장이나 미확인 가정을 문서에 섞지 않아야 한다.`
              : `기록된 constraints("${mission.constraints}")를 그대로 유지하고 더 넓은 의미론 변경은 피해야 한다.`
            : knowledgeWorkPack
              ? '명시된 constraints가 없더라도 현재 프로젝트 경계와 확인 가능한 근거 안에서만 판단과 문서를 만들어야 한다.'
              : '명시된 constraints가 없더라도 더 넓은 의미론 변경은 피하고 현재 프로젝트 경계 안에서만 다뤄야 한다.',
        },
        {
          role: 'Decomposer',
          stance: '실행 절단',
          content: knowledgeWorkPack
            ? `연결 태스크는 하나만 만들고, 첫 인계는 하나의 ${deliverableLabel} 산출물로 닫을 수 있는 태스크 하나로 자른다.`
            : '연결 태스크는 하나만 만들고, 첫 인계는 execution provenance를 유지할 수 있는 한정된 태스크 하나로 자른다.',
        },
        {
          role: 'Conductor',
          stance: '추천안',
          content: knowledgeWorkPack
            ? `추천안은 "${mission.title}"를 단일 ${deliverableLabel} 태스크로 정렬한 뒤, 사용자 정렬 승인을 먼저 받고 필요한 경우에만 후속 실행 인계를 여는 것이다.`
            : `추천안은 "${mission.title}"를 단일 태스크 한정 실행으로 정렬한 뒤, 사용자 정렬 승인을 먼저 받고 고급 운영 인계를 여는 것이다.`,
        },
      ],
      selectedPlan: {
        title: knowledgeWorkPack ? `단일 ${deliverableLabel} 슬라이스` : '단일 한정 슬라이스',
        scope: mission.title,
        nextStep: '추천안 승인',
      },
      alignment: {
        action: null,
        decidedAt: null,
        status: 'pending',
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  function getMission(missionId) {
    const state = store.loadState();
    return assertMission(missionId, state);
  }

  function getMissionEvidenceGraph(missionId) {
    return buildMissionEvidenceGraph(store.loadStateReadonly(), missionId);
  }

  function getTaskExecutionProvenance(taskId) {
    return buildTaskExecutionProvenanceGraph(store.loadStateReadonly(), taskId);
  }

  function getCouncilSession(councilSessionId) {
    const state = store.loadState();
    return assertCouncilSession(councilSessionId, state);
  }

  function selectMission(missionId) {
    const state = store.loadState();
    const mission = assertMission(missionId, state);

    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return state.missions[mission.id];
  }

  function createTaskRecord(state, project, input, mission = null) {
    if (!input.title) {
      throw new Error('태스크 제목이 필요합니다.');
    }

    const id = nextId(state, 'task');
    const now = input.now || new Date().toISOString();

    state.tasks[id] = {
      id,
      projectId: project.id,
      missionId: mission?.id || null,
      deliverableType: normalizeMissionDeliverableType(
        input.deliverableType ?? mission?.deliverableType,
        project.pack,
      ),
      title: input.title,
      intent: input.intent || '',
      lifecycleState: TASK_LIFECYCLE.INBOX,
      flags: {
        blocked: false,
        waitingApproval: false,
        waitingDecision: false,
      },
      review: {
        required: true,
        status: REVIEW_STATUS.PENDING,
        inboxItemId: null,
        resolution: null,
        verificationArtifactIds: [],
      },
      latestRunId: null,
      artifactIds: [],
      worktreeRef: null,
      createdAt: now,
      updatedAt: now,
    };

    return state.tasks[id];
  }

  function createTask(input) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);
    const mission = input.missionId ? assertMission(input.missionId, state) : null;

    if (mission && mission.projectId !== project.id) {
      throw new Error(`Mission ${mission.id} is not linked to project ${project.id}`);
    }

    const task = createTaskRecord(state, project, input, mission);
    store.saveState(state);

    return task;
  }

  function createLinkedTaskForMission(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);
    const project = assertProject(mission.projectId, state);

    if (mission.linkedTaskId && state.tasks[mission.linkedTaskId]) {
      throw new Error(`Mission ${mission.id} already has a linked task: ${mission.linkedTaskId}`);
    }

    mission.linkedTaskId = null;
    const task = createTaskRecord(
      state,
      project,
      {
        deliverableType: mission.deliverableType,
        title: String(input.title || mission.title || '').trim(),
        intent: String(input.intent || mission.goal || '').trim(),
      },
      mission,
    );
    const now = new Date().toISOString();

    mission.linkedTaskId = task.id;
    mission.status = 'executing';
    mission.updatedAt = now;
    state.activeProjectId = project.id;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      mission: state.missions[mission.id],
      task: state.tasks[task.id],
    };
  }

  function createCouncilSessionForMission(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);
    const project = assertProject(mission.projectId, state);
    const now = new Date().toISOString();

    if (mission.councilSessionId && state.councilSessions[mission.councilSessionId]) {
      throw new Error(
        `Mission ${mission.id} already has a council session: ${mission.councilSessionId}`,
      );
    }

    const councilSession = buildCouncilSessionRecord(state, mission, project, now);

    state.councilSessions[councilSession.id] = councilSession;
    mission.councilSessionId = councilSession.id;

    if (!mission.linkedTaskId) {
      mission.status = 'aligning';
    }

    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  function assertRealCouncilSourceCurrent(session, mission, project) {
    const currentDigest = buildAgendaDigest(buildCouncilAgenda(mission, project));

    if (currentDigest !== session.sourceDigest) {
      const error = new Error(`Council session ${session.id} has a stale source digest`);
      error.statusCode = 409;
      throw error;
    }
  }

  function assertBoundStaffingSchedulerSourceCurrent(
    state,
    councilSession,
    { executionPlan = null, requireUnlinkedMission = false } = {},
  ) {
    if (!councilSession.staffingEntryRef) {
      return null;
    }

    const retainedStaffingEntry = state.staffingEntries?.[
      councilSession.staffingEntryRef.staffingEntryId
    ];
    if (
      councilSession.strategistContextConsumption ||
      retainedStaffingEntry?.missionContextAttachmentRef
    ) {
      throw conflict(
        'Context-bound Council sessions are blocked from downstream scheduler and WorkOrder use',
      );
    }

    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const staffingEntry = assertStaffingEntry(
      councilSession.staffingEntryRef.staffingEntryId,
      state,
    );
    const staffingPlan = assertStaffingPlan(staffingEntry.staffingPlanId, state);
    const currentAttempt = councilSession.attempts?.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    );
    const closedMission = Object.values(state.missionCloseOuts || {}).some(
      (closeOut) => closeOut.missionId === mission.id,
    );

    if (
      state.activeProjectId !== project.id ||
      mission.projectId !== project.id ||
      mission.staffingEntryId !== staffingEntry.id ||
      mission.councilSessionId !== councilSession.id ||
      staffingPlan.missionId !== mission.id ||
      staffingPlan.projectId !== project.id ||
      staffingEntry.missionId !== mission.id ||
      staffingEntry.projectId !== project.id ||
      staffingEntry.staffingPlanId !== staffingPlan.id ||
      staffingEntry.councilSessionId !== councilSession.id
    ) {
      throw conflict('Bound WorkOrder source chain does not match the active project');
    }
    if (
      computeStaffingPlanRecordDigest(staffingPlan) !== staffingPlan.recordDigest ||
      computeStaffingEntryRecordDigest(staffingEntry) !== staffingEntry.recordDigest ||
      computeStaffingEntrySourceDigest(staffingPlan, staffingEntry.entryApprovalDigest) !==
        staffingEntry.entrySourceDigest
    ) {
      throw conflict('Bound WorkOrder StaffingPlan or StaffingEntry digest is stale');
    }
    if (
      staffingPlan.persisted !== true ||
      staffingPlan.status !== 'accepted' ||
      staffingPlan.mode !== 'council' ||
      staffingPlan.providerMode !== 'local-stub' ||
      staffingPlan.parallelGroups?.length !== 0 ||
      staffingPlan.terminationPolicy?.maxProviderCalls !== 0 ||
      staffingEntry.status !== 'bound' ||
      staffingEntry.providerMode !== 'local-stub' ||
      staffingEntry.sourceDigest !== staffingPlan.sourceDigest ||
      staffingEntry.missionDigest !== staffingPlan.missionDigest ||
      staffingEntry.blueprintDigest !== staffingPlan.blueprintDigest ||
      staffingEntry.staffingSpecDigest !== staffingPlan.staffingSpecDigest
    ) {
      throw conflict('Bound WorkOrder requires one accepted local Council StaffingPlan');
    }
    const sessionRef = councilSession.staffingEntryRef;
    if (
      sessionRef.staffingPlanId !== staffingPlan.id ||
      sessionRef.staffingPlanRecordDigest !== staffingPlan.recordDigest ||
      sessionRef.staffingEntryId !== staffingEntry.id ||
      sessionRef.entrySourceDigest !== staffingEntry.entrySourceDigest ||
      councilSession.mode !== REAL_COUNCIL_MODE ||
      councilSession.phase !== 'terminal' ||
      councilSession.status !== 'approved' ||
      councilSession.alignment?.action !== 'approve' ||
      councilSession.alignment?.status !== 'approved' ||
      currentAttempt?.status !== 'awaiting-alignment' ||
      currentAttempt.sourceDigest !== councilSession.sourceDigest ||
      !currentAttempt.synthesis ||
      currentAttempt.synthesis.humanDecisionRequired !== true ||
      currentAttempt.conflictSummary?.approvalReady !== true
    ) {
      throw conflict('Bound WorkOrder requires one approved source-bound Council synthesis');
    }
    if (
      closedMission ||
      (requireUnlinkedMission &&
        (mission.status !== 'aligned' || mission.linkedTaskId !== null)) ||
      (!requireUnlinkedMission &&
        executionPlan &&
        (mission.linkedTaskId !== executionPlan.controlTaskId ||
          executionPlan.missionId !== mission.id ||
          executionPlan.projectId !== project.id ||
          executionPlan.councilSessionId !== councilSession.id))
    ) {
      throw conflict('Bound WorkOrder Mission lifecycle is not current');
    }
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw conflict('Bound WorkOrder scheduler supports local-stub only');
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);
    const blueprintEvidence = loadCurrentStaffingBlueprintEvidence();
    const currentProfiles = staffingPlan.selectedAgentIds.map((agentId) =>
      blueprintEvidence.blueprint.agentProfiles.find((profile) => profile.id === agentId));
    if (
      blueprintEvidence.blueprintDigest !== staffingPlan.blueprintDigest ||
      blueprintEvidence.roleSourceDigests.length !== 9 ||
      currentProfiles.some((profile) => !profile) ||
      currentProfiles.map((profile) => profile.role).sort().join('\u0000') !==
        staffingPlan.selectedRoles.join('\u0000')
    ) {
      throw conflict('Bound WorkOrder CompanyBlueprint or role sources are stale');
    }

    return {
      blueprintEvidence,
      councilSession,
      currentAttempt,
      mission,
      project,
      staffingEntry,
      staffingPlan,
    };
  }

  function getMissionWorkOrderCompilerInput(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);

    if (councilSession.staffingEntryRef) {
      const bound = assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
        requireUnlinkedMission: true,
      });
      return {
        mission,
        project,
        councilSession,
        companyBlueprint: bound.blueprintEvidence.blueprint,
        compileSpec: input.compileSpec,
      };
    }

    if (companyRuntime?.status !== 'ready' || !companyRuntime.blueprint) {
      throw new Error('CompanyBlueprint must be ready before WorkOrder compilation');
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);

    return {
      mission,
      project,
      councilSession,
      companyBlueprint: companyRuntime.blueprint,
      compileSpec: input.compileSpec,
    };
  }

  function assertReadOnlySpecialistProfile(profile, expected) {
    if (
      !profile ||
      profile.id !== expected.agentProfileId ||
      profile.role !== expected.role ||
      profile.instructionsRef !== expected.instructionsRef ||
      !Array.isArray(profile.supportedPacks) ||
      profile.supportedPacks.length !== 1 ||
      profile.supportedPacks[0] !== 'development' ||
      profile.workspacePolicy?.mode !== 'shared-readonly' ||
      profile.workspacePolicy?.projectPathRequired !== true ||
      !Array.isArray(profile.providerPolicy?.allowedModes) ||
      profile.providerPolicy.allowedModes.length !== 1 ||
      profile.providerPolicy.allowedModes[0] !== 'local-stub' ||
      profile.concurrencyLimit !== 1 ||
      !Array.isArray(profile.toolPolicy?.write) ||
      profile.toolPolicy.write.length !== 0 ||
      profile.authority?.canMutateSource !== false ||
      profile.authority?.canCommit !== false ||
      profile.authority?.canPush !== false
    ) {
      throw conflict(
        `SpecialistBatchPreview profile ${expected.agentProfileId} has widened authority`,
      );
    }
  }

  function captureSpecialistInputPathDigests(projectPath, normalizedRequest) {
    let realProjectRoot;
    try {
      realProjectRoot = fs.realpathSync(path.resolve(projectPath));
    } catch (error) {
      throw conflict(
        `SpecialistBatchPreview project path is unavailable: ${error.message}`,
      );
    }

    const selectedPaths = [
      ...new Set(
        normalizedRequest.specialistSpec.cells.flatMap((cell) => cell.inputPaths),
      ),
    ].sort();
    const inputPathDigests = [];
    const evidenceByRealTarget = new Map();
    let totalBytes = 0;

    for (const relativePath of selectedPaths) {
      let realTarget;
      try {
        realTarget = fs.realpathSync(path.resolve(realProjectRoot, relativePath));
      } catch (error) {
        const missing = new Error(
          `SpecialistBatchPreview input file not found: ${relativePath}`,
        );
        missing.statusCode = 404;
        throw missing;
      }
      if (
        realTarget !== realProjectRoot &&
        !realTarget.startsWith(`${realProjectRoot}${path.sep}`)
      ) {
        const error = new Error(
          `SpecialistBatchPreview input path escapes project root: ${relativePath}`,
        );
        error.statusCode = 400;
        throw error;
      }

      let fileEvidence = evidenceByRealTarget.get(realTarget) || null;
      try {
        const fileStat = fs.statSync(realTarget);
        if (!fileStat.isFile()) {
          const error = new Error(
            `SpecialistBatchPreview input path must resolve to a file: ${relativePath}`,
          );
          error.statusCode = 404;
          throw error;
        }
        if (!fileEvidence) {
          if (fileStat.size > 1024 * 1024) {
            const error = new Error(
              `SpecialistBatchPreview input file exceeds 1048576 bytes: ${relativePath}`,
            );
            error.statusCode = 413;
            throw error;
          }
          const fileBytes = fs.readFileSync(realTarget);
          if (fileBytes.byteLength > 1024 * 1024) {
            const error = new Error(
              `SpecialistBatchPreview input file exceeds 1048576 bytes: ${relativePath}`,
            );
            error.statusCode = 413;
            throw error;
          }
          totalBytes += fileBytes.byteLength;
          if (totalBytes > 8 * 1024 * 1024) {
            const error = new Error(
              'SpecialistBatchPreview input files exceed 8388608 aggregate bytes',
            );
            error.statusCode = 413;
            throw error;
          }
          fileEvidence = {
            byteLength: fileBytes.byteLength,
            sha256: crypto.createHash('sha256').update(fileBytes).digest('hex'),
          };
          evidenceByRealTarget.set(realTarget, fileEvidence);
        }
      } catch (error) {
        if (error.statusCode) throw error;
        const missing = new Error(
          `SpecialistBatchPreview input file not found: ${relativePath}`,
        );
        missing.statusCode = 404;
        throw missing;
      }
      inputPathDigests.push({
        byteLength: fileEvidence.byteLength,
        path: relativePath,
        sha256: fileEvidence.sha256,
      });
    }

    return {
      inputPathDigests,
      inputTotalByteLength: totalBytes,
    };
  }

  function previewCouncilSpecialistBatch(input) {
    const inputPrototype =
      input && typeof input === 'object' && !Array.isArray(input)
        ? Object.getPrototypeOf(input)
        : null;
    if (
      !input ||
      (inputPrototype !== Object.prototype && inputPrototype !== null) ||
      Object.keys(input).sort().join('\u0000') !==
        [
          'compileSpec',
          'councilSessionId',
          'evaluatedAt',
          'sourceRefs',
          'specialistSpec',
        ].sort().join('\u0000')
    ) {
      const error = new Error(
        'SpecialistBatchPreview request has unexpected or missing fields',
      );
      error.statusCode = 400;
      throw error;
    }
    let normalizedRequest;
    try {
      normalizedRequest = normalizeSpecialistBatchPreviewRequest({
        compileSpec: input.compileSpec,
        evaluatedAt: input.evaluatedAt,
        sourceRefs: input.sourceRefs,
        specialistSpec: input.specialistSpec,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `SpecialistBatchPreview requires supported state: ${error.message}`,
      );
    }
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const bound = assertBoundStaffingSchedulerSourceCurrent(
      state,
      councilSession,
      { requireUnlinkedMission: true },
    );
    if (!bound) {
      throw conflict(
        'SpecialistBatchPreview requires one StaffingEntry-bound Council session',
      );
    }
    const matchingExecutionPlan = Object.values(state.executionPlans || {}).find(
      (executionPlan) =>
        executionPlan.councilSessionId === councilSession.id ||
        executionPlan.missionId === bound.mission.id,
    );
    if (matchingExecutionPlan) {
      throw conflict(
        `SpecialistBatchPreview source already has ExecutionPlan ${matchingExecutionPlan.id}`,
      );
    }

    const specialistProfiles = [
      {
        agentProfileId: 'agent-researcher',
        instructionsRef: 'company/roles/researcher.md',
        role: 'researcher',
      },
      {
        agentProfileId: 'agent-qa',
        instructionsRef: 'company/roles/qa.md',
        role: 'qa',
      },
    ].map((expected) => {
      const profile = bound.blueprintEvidence.blueprint.agentProfiles.find(
        (entry) => entry.id === expected.agentProfileId,
      );
      assertReadOnlySpecialistProfile(profile, expected);
      const sourceDigest = bound.blueprintEvidence.roleSourceDigests.find(
        (entry) => entry.ref === expected.instructionsRef,
      );
      if (!sourceDigest) {
        throw conflict(
          `SpecialistBatchPreview role source is missing: ${expected.instructionsRef}`,
        );
      }
      return {
        agentProfileId: expected.agentProfileId,
        ref: sourceDigest.ref,
        sha256: sourceDigest.sha256,
      };
    });
    const inputEvidence = captureSpecialistInputPathDigests(
      bound.project.projectPath,
      normalizedRequest,
    );

    try {
      return buildSpecialistBatchPreview(
        normalizedRequest,
        {
          alignmentDecidedAt: councilSession.alignment.decidedAt,
          blueprintDigest: bound.blueprintEvidence.blueprintDigest,
          councilSessionId: councilSession.id,
          councilSessionSourceDigest: councilSession.sourceDigest,
          councilSynthesis: bound.currentAttempt.synthesis,
          currentAttemptId: bound.currentAttempt.id,
          inputPathDigests: inputEvidence.inputPathDigests,
          inputTotalByteLength: inputEvidence.inputTotalByteLength,
          missionId: bound.mission.id,
          projectId: bound.project.id,
          roleSourceDigests: specialistProfiles,
          staffingEntryId: bound.staffingEntry.id,
          staffingEntryRecordDigest: bound.staffingEntry.recordDigest,
          staffingPlanId: bound.staffingPlan.id,
          staffingPlanRecordDigest: bound.staffingPlan.recordDigest,
        },
        { now: new Date().toISOString() },
      );
    } catch (error) {
      if (/^sourceRefs\..* is stale$/.test(error.message)) {
        throw conflict(error.message);
      }
      throw error;
    }
  }

  function specialistNowIso() {
    const value =
      typeof options.specialistNow === 'function'
        ? options.specialistNow()
        : new Date();
    const timestamp = value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (!Number.isFinite(timestamp)) {
      throw new Error('SpecialistBatch clock must return a valid timestamp');
    }
    return new Date(timestamp).toISOString();
  }

  function getSpecialistBatchEnvelopeFromState(state, specialistBatchId) {
    const batch = assertSpecialistBatch(specialistBatchId, state);
    const cellAttempts = batch.cellAttemptIds
      .map((cellAttemptId) => assertSpecialistCellAttempt(cellAttemptId, state))
      .sort(
        (left, right) =>
          left.position - right.position || left.id.localeCompare(right.id),
      );
    return {
      specialistBatch: batch,
      specialistCellAttempts: cellAttempts,
    };
  }

  function getSpecialistBatch(specialistBatchId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
      return getSpecialistBatchEnvelopeFromState(state, specialistBatchId);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getCurrentCouncilSpecialistBatch(input) {
    const expectedFields = [
      'councilSessionId',
      'currentAttemptId',
      'staffingEntryId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      const error = new Error(
        'SpecialistBatch locator has unexpected or missing fields',
      );
      error.statusCode = 400;
      throw error;
    }
    for (const field of expectedFields) {
      if (typeof input[field] !== 'string' || !input[field].trim()) {
        const error = new Error(`SpecialistBatch locator ${field} is required`);
        error.statusCode = 400;
        throw error;
      }
    }

    let state;
    let councilSession;
    try {
      state = store.loadStateSupportedReadonly();
      councilSession = assertCouncilSession(input.councilSessionId, state);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
    if (
      councilSession.currentAttemptId !== input.currentAttemptId ||
      councilSession.staffingEntryRef?.staffingEntryId !== input.staffingEntryId
    ) {
      throw conflict('SpecialistBatch locator source chain is stale');
    }
    assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
      requireUnlinkedMission: true,
    });
    const batch = Object.values(state.specialistBatches || {}).find(
      (candidate) =>
        candidate.councilSessionId === councilSession.id &&
        candidate.currentAttemptId === input.currentAttemptId &&
        candidate.staffingEntryId === input.staffingEntryId,
    );
    if (!batch) {
      const error = new Error('SpecialistBatch not found for the current source chain');
      error.statusCode = 404;
      throw error;
    }
    return getSpecialistBatchEnvelopeFromState(state, batch.id);
  }

  async function startCouncilSpecialistBatch(input) {
    const expectedFields = [
      'compileSpec',
      'councilSessionId',
      'evaluatedAt',
      'executionApproval',
      'previewDigest',
      'previewId',
      'sourceDigest',
      'sourceRefs',
      'specialistSpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      const error = new Error(
        'SpecialistBatch start request has unexpected or missing fields',
      );
      error.statusCode = 400;
      throw error;
    }

    let normalizedRequest;
    let executionApproval;
    const validatedAt = specialistNowIso();
    try {
      normalizedRequest = normalizeSpecialistBatchPreviewRequest({
        compileSpec: input.compileSpec,
        evaluatedAt: input.evaluatedAt,
        sourceRefs: input.sourceRefs,
        specialistSpec: input.specialistSpec,
      });
      executionApproval = normalizeExecutionApproval(input.executionApproval, {
        evaluatedAt: normalizedRequest.evaluatedAt,
        now: validatedAt,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`SpecialistBatch requires supported state: ${error.message}`);
    }
    const preview = previewCouncilSpecialistBatch({
      councilSessionId: input.councilSessionId,
      ...normalizedRequest,
    });
    if (
      input.previewId !== preview.id ||
      input.previewDigest !== preview.previewDigest ||
      input.sourceDigest !== preview.sourceDigest
    ) {
      throw conflict('SpecialistBatch preview or source digest is stale');
    }

    const executionApprovalDigest = computeExecutionApprovalDigest(executionApproval);
    const existing = Object.values(state.specialistBatches || {}).find(
      (batch) =>
        batch.councilSessionId === preview.councilSessionId &&
        batch.currentAttemptId === preview.currentAttemptId &&
        batch.staffingEntryId === preview.staffingEntryId,
    );
    if (existing) {
      if (
        existing.previewId !== preview.id ||
        existing.previewDigest !== preview.previewDigest ||
        existing.sourceDigest !== preview.sourceDigest ||
        existing.executionApprovalDigest !== executionApprovalDigest
      ) {
        throw conflict('SpecialistBatch source chain already has a different first attempt');
      }
      return {
        idempotent: true,
        ...getSpecialistBatchEnvelopeFromState(state, existing.id),
      };
    }

    const project = assertProject(preview.projectId, state);
    const startedAt = specialistNowIso();
    const specialistBatchId = nextSpecialistBatchId(state);
    const cellAttemptIds = preview.cells.map(() =>
      nextSpecialistCellAttemptId(state));
    const batch = createSpecialistBatch(
      {
        id: specialistBatchId,
        projectId: preview.projectId,
        missionId: preview.missionId,
        staffingPlanId: preview.staffingPlanId,
        staffingEntryId: preview.staffingEntryId,
        councilSessionId: preview.councilSessionId,
        currentAttemptId: preview.currentAttemptId,
        previewId: preview.id,
        previewDigest: preview.previewDigest,
        sourceDigest: preview.sourceDigest,
        executionApproval,
        cellAttemptIds,
        batchDeadlineMs: preview.deadline.batchDeadlineMs,
        startedAt,
      },
      {
        evaluatedAt: normalizedRequest.evaluatedAt,
        now: validatedAt,
      },
    );
    const cellAttempts = preview.cells.map((cell, position) =>
      createSpecialistCellAttempt({
        id: cellAttemptIds[position],
        specialistBatchId,
        cellId: cell.cellId,
        agentProfileId: cell.agentProfileId,
        role: cell.role,
        position,
        cellSpecDigest: cell.cellSpecDigest,
        sourceDigest: preview.sourceDigest,
        inputPathDigests: cell.inputPathDigests,
        cellDeadlineMs: cell.cellDeadlineMs,
        batchDeadlineAt: batch.deadlineAt,
        startedAt,
      }));

    state.specialistBatches[specialistBatchId] = batch;
    for (const cellAttempt of cellAttempts) {
      state.specialistCellAttempts[cellAttempt.id] = cellAttempt;
    }
    store.saveState(state);

    const activeState = store.loadStateReadonly();
    const activeEnvelope = getSpecialistBatchEnvelopeFromState(
      activeState,
      specialistBatchId,
    );
    const settle = async (settlement) => {
      const currentState = store.loadStateReadonly();
      const currentBatch = assertSpecialistBatch(
        settlement.specialistBatchId,
        currentState,
      );
      const currentCellAttempt = assertSpecialistCellAttempt(
        settlement.cellAttemptId,
        currentState,
      );
      if (
        currentBatch.status !== 'active' ||
        currentCellAttempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
        currentCellAttempt.specialistBatchId !== currentBatch.id ||
        settlement.sourceDigest !== currentBatch.sourceDigest ||
        settlement.inputDigest !== currentCellAttempt.inputDigest
      ) {
        throw conflict('SpecialistBatch settlement source is stale');
      }

      const completedAt = specialistNowIso();
      const transition =
        settlement.transition.status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED &&
        Date.parse(completedAt) >= Date.parse(currentCellAttempt.deadlineAt)
          ? {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
              observedInputDigest: settlement.transition.observedInputDigest,
              failureReason: 'cell-deadline-exceeded',
            }
          : settlement.transition;
      const nextCellAttempt =
        transition.status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED
          ? settleSpecialistCellAttemptWithOpsGuard(currentState, currentCellAttempt, {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED,
              observedInputDigest: transition.observedInputDigest,
              resultSummary: transition.resultSummary,
              completedAt,
            })
          : settleSpecialistCellAttemptWithOpsGuard(currentState, currentCellAttempt, {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
              observedInputDigest: transition.observedInputDigest,
              failureReason: transition.failureReason,
              completedAt,
            });
      currentState.specialistCellAttempts[nextCellAttempt.id] = nextCellAttempt;
      const currentCells = currentBatch.cellAttemptIds.map(
        (cellAttemptId) => currentState.specialistCellAttempts[cellAttemptId],
      );
      currentState.specialistBatches[currentBatch.id] =
        transitionSpecialistBatch(currentBatch, currentCells);
      store.saveState(currentState);
      return currentState.specialistCellAttempts[nextCellAttempt.id];
    };

    let coordinatorResult;
    try {
      coordinatorResult = await specialistBatchCoordinator(
        {
          batch: activeEnvelope.specialistBatch,
          cellAttempts: activeEnvelope.specialistCellAttempts,
          projectRoot: project.projectPath,
          qaInput: {
            commands: normalizedRequest.compileSpec.verificationCommands,
            targetPathAllowlist: normalizedRequest.compileSpec.targetPathAllowlist,
          },
          settle,
        },
        {
          researcherRunner: options.specialistResearcherRunner,
          qaRunner: options.specialistQaRunner,
          spawnImpl: options.specialistQaSpawnImpl,
          now: options.specialistWorkerNow,
        },
      );
    } catch {
      const error = conflict(
        'SpecialistBatch settlement conflicted; inspect exact durable evidence',
      );
      error.specialistBatchId = specialistBatchId;
      error.settlementDiagnostics = coordinatorResult?.settlements || [];
      throw error;
    }
    if (
      !Array.isArray(coordinatorResult?.settlements) ||
      coordinatorResult.settlements.some((settlement) => settlement.status !== 'fulfilled')
    ) {
      const error = conflict(
        'SpecialistBatch settlement conflicted; inspect exact durable evidence',
      );
      error.specialistBatchId = specialistBatchId;
      error.settlementDiagnostics = coordinatorResult?.settlements || [];
      throw error;
    }

    const settledState = store.loadStateReadonly();
    return {
      idempotent: false,
      ...getSpecialistBatchEnvelopeFromState(settledState, specialistBatchId),
    };
  }

  function getSpecialistCellRetryEnvelopeFromState(
    state,
    specialistCellRetryId,
  ) {
    const specialistCellRetry = assertSpecialistCellRetry(
      specialistCellRetryId,
      state,
    );
    const specialistCellAttempt = assertSpecialistCellAttempt(
      specialistCellRetry.retryCellAttemptId,
      state,
    );
    return {
      specialistCellRetry,
      specialistCellAttempt,
    };
  }

  function getSpecialistCellRetry(specialistCellRetryId) {
    try {
      const state = store.loadStateSupportedReadonly();
      return getSpecialistCellRetryEnvelopeFromState(
        state,
        specialistCellRetryId,
      );
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getSpecialistBatchCellRetry(input) {
    const expectedFields = [
      'sourceCellAttemptId',
      'specialistBatchId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      const error = new Error(
        'SpecialistCellRetry locator has unexpected or missing fields',
      );
      error.statusCode = 400;
      throw error;
    }
    try {
      const state = store.loadStateSupportedReadonly();
      const batch = assertSpecialistBatch(input.specialistBatchId, state);
      const sourceCellAttempt = assertSpecialistCellAttempt(
        input.sourceCellAttemptId,
        state,
      );
      if (
        sourceCellAttempt.specialistBatchId !== batch.id ||
        !batch.cellAttemptIds.includes(sourceCellAttempt.id)
      ) {
        throw conflict('SpecialistCellRetry locator source is stale');
      }
      const retry = Object.values(state.specialistCellRetries || {}).find(
        (candidate) =>
          candidate.specialistBatchId === batch.id &&
          candidate.sourceCellAttemptId === sourceCellAttempt.id,
      );
      if (!retry) {
        const error = new Error(
          'SpecialistCellRetry not found for the exact source cell',
        );
        error.statusCode = 404;
        throw error;
      }
      return getSpecialistCellRetryEnvelopeFromState(state, retry.id);
    } catch (error) {
      if (/not found/i.test(error.message) && !error.statusCode) {
        error.statusCode = 404;
      }
      throw error;
    }
  }

  async function retrySpecialistBatchCell(input) {
    const expectedFields = [
      'compileSpec',
      'evaluatedAt',
      'expectedBatchRecordDigest',
      'expectedSourceCellAttemptRecordDigest',
      'previewDigest',
      'previewId',
      'retryApproval',
      'retryDeadlineMs',
      'sourceCellAttemptId',
      'sourceDigest',
      'sourceRefs',
      'specialistBatchId',
      'specialistSpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      const error = new Error(
        'SpecialistCellRetry request has unexpected or missing fields',
      );
      error.statusCode = 400;
      throw error;
    }

    const validatedAt = specialistNowIso();
    let normalizedRequest;
    try {
      const {
        specialistBatchId: _specialistBatchId,
        ...requestBody
      } = input;
      normalizedRequest = normalizeSpecialistCellRetryRequest(requestBody, {
        now: validatedAt,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }
    const retryRequestDigest =
      computeSpecialistCellRetryRequestDigest(normalizedRequest);

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `SpecialistCellRetry requires supported state: ${error.message}`,
      );
    }
    const batch = assertSpecialistBatch(input.specialistBatchId, state);
    const sourceCellAttempt = assertSpecialistCellAttempt(
      normalizedRequest.sourceCellAttemptId,
      state,
    );
    const existing = Object.values(state.specialistCellRetries || {}).find(
      (candidate) =>
        candidate.specialistBatchId === batch.id &&
        candidate.sourceCellAttemptId === sourceCellAttempt.id,
    );
    if (existing) {
      if (existing.retryRequestDigest !== retryRequestDigest) {
        throw conflict(
          'SpecialistCellRetry source cell already has a different retry',
        );
      }
      return {
        idempotent: true,
        ...getSpecialistCellRetryEnvelopeFromState(state, existing.id),
      };
    }

    if (
      !['partial-failed', 'failed'].includes(batch.status) ||
      !batch.cellAttemptIds.includes(sourceCellAttempt.id) ||
      sourceCellAttempt.specialistBatchId !== batch.id ||
      sourceCellAttempt.attemptNumber !== 1 ||
      sourceCellAttempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.FAILED
    ) {
      throw conflict(
        'SpecialistCellRetry requires one failed first-attempt source cell',
      );
    }
    if (
      batch.recordDigest !== normalizedRequest.expectedBatchRecordDigest ||
      sourceCellAttempt.recordDigest !==
        normalizedRequest.expectedSourceCellAttemptRecordDigest
    ) {
      throw conflict('SpecialistCellRetry source record digest is stale');
    }
    if (
      Object.values(state.specialistCellRetries || {}).some(
        (candidate) =>
          candidate.specialistBatchId === batch.id &&
          candidate.status === SPECIALIST_CELL_RETRY_STATUS.ACTIVE,
      )
    ) {
      throw conflict('SpecialistBatch already has an active cell retry');
    }
    if (
      normalizedRequest.retryDeadlineMs > sourceCellAttempt.cellDeadlineMs
    ) {
      const error = new Error(
        'retryDeadlineMs must not exceed the source cell deadline',
      );
      error.statusCode = 400;
      throw error;
    }

    const preview = previewCouncilSpecialistBatch({
      councilSessionId: batch.councilSessionId,
      compileSpec: normalizedRequest.compileSpec,
      evaluatedAt: normalizedRequest.evaluatedAt,
      sourceRefs: normalizedRequest.sourceRefs,
      specialistSpec: normalizedRequest.specialistSpec,
    });
    if (
      normalizedRequest.previewId !== preview.id ||
      normalizedRequest.previewDigest !== preview.previewDigest ||
      normalizedRequest.sourceDigest !== preview.sourceDigest
    ) {
      throw conflict('SpecialistCellRetry preview or source digest is stale');
    }
    const previewCell = preview.cells.find(
      (cell) =>
        cell.position === sourceCellAttempt.position &&
        cell.cellId === sourceCellAttempt.cellId &&
        cell.agentProfileId === sourceCellAttempt.agentProfileId &&
        cell.role === sourceCellAttempt.role,
    );
    if (
      !previewCell ||
      preview.sourceDigest !== batch.sourceDigest ||
      preview.sourceDigest !== sourceCellAttempt.sourceDigest ||
      previewCell.cellSpecDigest !== sourceCellAttempt.cellSpecDigest ||
      JSON.stringify(previewCell.inputPathDigests) !==
        JSON.stringify(sourceCellAttempt.inputPathDigests) ||
      computeInputDigest(previewCell.inputPathDigests) !==
        sourceCellAttempt.inputDigest
    ) {
      throw conflict(
        'SpecialistCellRetry selected cell evidence is source-drifted',
      );
    }

    const project = assertProject(batch.projectId, state);
    const startedAt = specialistNowIso();
    const specialistCellRetryId = nextSpecialistCellRetryId(state);
    const retryCellAttemptId = nextSpecialistCellAttemptId(state);
    const retryCellAttempt = createSpecialistRetryCellAttempt({
      id: retryCellAttemptId,
      specialistBatchId: batch.id,
      cellId: sourceCellAttempt.cellId,
      agentProfileId: sourceCellAttempt.agentProfileId,
      role: sourceCellAttempt.role,
      position: sourceCellAttempt.position,
      cellSpecDigest: sourceCellAttempt.cellSpecDigest,
      sourceDigest: sourceCellAttempt.sourceDigest,
      inputPathDigests: sourceCellAttempt.inputPathDigests,
      cellDeadlineMs: normalizedRequest.retryDeadlineMs,
      startedAt,
    });
    const specialistCellRetry = createSpecialistCellRetry(
      {
        id: specialistCellRetryId,
        specialistBatchId: batch.id,
        sourceCellAttemptId: sourceCellAttempt.id,
        retryCellAttemptId,
        sourceBatchRecordDigest: batch.recordDigest,
        sourceCellAttemptRecordDigest: sourceCellAttempt.recordDigest,
        retryPreviewId: preview.id,
        retryPreviewDigest: preview.previewDigest,
        retryRequestDigest,
        retryApproval: normalizedRequest.retryApproval,
        retryDeadlineMs: normalizedRequest.retryDeadlineMs,
        startedAt,
      },
      {
        evaluatedAt: normalizedRequest.evaluatedAt,
        now: validatedAt,
      },
    );
    state.specialistCellAttempts[retryCellAttempt.id] = retryCellAttempt;
    state.specialistCellRetries[specialistCellRetry.id] =
      specialistCellRetry;
    store.saveState(state);

    const activeState = store.loadStateReadonly();
    const activeRetry = assertSpecialistCellRetry(
      specialistCellRetryId,
      activeState,
    );
    const activeRetryAttempt = assertSpecialistCellAttempt(
      retryCellAttemptId,
      activeState,
    );
    const activeSourceAttempt = assertSpecialistCellAttempt(
      sourceCellAttempt.id,
      activeState,
    );

    const settle = async (settlement) => {
      const currentState = store.loadStateReadonly();
      const currentRetry = assertSpecialistCellRetry(
        settlement.specialistCellRetryId,
        currentState,
      );
      const currentRetryAttempt = assertSpecialistCellAttempt(
        settlement.retryCellAttemptId,
        currentState,
      );
      const currentSourceAttempt = assertSpecialistCellAttempt(
        settlement.sourceCellAttemptId,
        currentState,
      );
      const currentBatch = assertSpecialistBatch(
        currentRetry.specialistBatchId,
        currentState,
      );
      if (
        currentRetry.status !== SPECIALIST_CELL_RETRY_STATUS.ACTIVE ||
        currentRetryAttempt.status !==
          SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
        currentRetry.retryCellAttemptId !== currentRetryAttempt.id ||
        currentRetry.sourceCellAttemptId !== currentSourceAttempt.id ||
        currentRetry.sourceBatchRecordDigest !== currentBatch.recordDigest ||
        currentRetry.sourceCellAttemptRecordDigest !==
          currentSourceAttempt.recordDigest ||
        settlement.sourceDigest !== currentRetryAttempt.sourceDigest ||
        settlement.inputDigest !== currentRetryAttempt.inputDigest
      ) {
        throw conflict('SpecialistCellRetry settlement source is stale');
      }

      const completedAt = specialistNowIso();
      const transition =
        settlement.transition.status ===
          SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED &&
        Date.parse(completedAt) >= Date.parse(currentRetryAttempt.deadlineAt)
          ? {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
              observedInputDigest:
                settlement.transition.observedInputDigest,
              failureReason: 'cell-deadline-exceeded',
            }
          : settlement.transition;
      const nextRetryAttempt =
        transition.status === SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED
          ? settleSpecialistCellAttemptWithOpsGuard(currentState, currentRetryAttempt, {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED,
              observedInputDigest: transition.observedInputDigest,
              resultSummary: transition.resultSummary,
              completedAt,
            })
          : settleSpecialistCellAttemptWithOpsGuard(currentState, currentRetryAttempt, {
              status: SPECIALIST_CELL_ATTEMPT_STATUS.FAILED,
              observedInputDigest: transition.observedInputDigest,
              failureReason: transition.failureReason,
              completedAt,
            });
      const nextRetry = settleSpecialistCellRetry(currentRetry, {
        status:
          nextRetryAttempt.status ===
          SPECIALIST_CELL_ATTEMPT_STATUS.COMPLETED
            ? SPECIALIST_CELL_RETRY_STATUS.COMPLETED
            : SPECIALIST_CELL_RETRY_STATUS.FAILED,
        completedAt,
      });
      currentState.specialistCellAttempts[nextRetryAttempt.id] =
        nextRetryAttempt;
      currentState.specialistCellRetries[nextRetry.id] = nextRetry;
      store.saveState(currentState);
      return {
        specialistCellRetry: nextRetry,
        specialistCellAttempt: nextRetryAttempt,
      };
    };

    try {
      const coordinatorResult = await specialistCellRetryCoordinator(
        {
          retry: activeRetry,
          sourceCellAttempt: activeSourceAttempt,
          retryCellAttempt: activeRetryAttempt,
          projectRoot: project.projectPath,
          qaInput: {
            commands: normalizedRequest.compileSpec.verificationCommands,
            targetPathAllowlist:
              normalizedRequest.compileSpec.targetPathAllowlist,
          },
          settle,
        },
        {
          researcherRunner: options.specialistResearcherRunner,
          qaRunner: options.specialistQaRunner,
          spawnImpl: options.specialistQaSpawnImpl,
          now: options.specialistWorkerNow,
        },
      );
      if (coordinatorResult?.settlement?.status !== 'fulfilled') {
        throw conflict('SpecialistCellRetry settlement did not complete');
      }
    } catch (cause) {
      const error = conflict(
        'SpecialistCellRetry settlement conflicted; inspect exact durable evidence',
      );
      error.specialistCellRetryId = specialistCellRetryId;
      error.retryCellAttemptId = retryCellAttemptId;
      error.cause = cause;
      throw error;
    }

    const settledState = store.loadStateReadonly();
    return {
      idempotent: false,
      ...getSpecialistCellRetryEnvelopeFromState(
        settledState,
        specialistCellRetryId,
      ),
    };
  }

  function preflightMissionWorkOrderPreview(input) {
    return preflightMissionWorkOrderCandidate({
      ...getMissionWorkOrderCompilerInput(input),
      alignmentAction: input.action,
    });
  }

  function previewMissionWorkOrders(input) {
    return compileMissionWorkOrderPreview(getMissionWorkOrderCompilerInput(input));
  }

  function conflict(message) {
    const error = new Error(message);
    error.statusCode = 409;
    return error;
  }

  function assertExactStaffingPlanRequest(input, expectedFields, label) {
    const actualFields = Object.keys(input || {}).sort();
    const expected = [...expectedFields].sort();
    if (
      actualFields.length !== expected.length ||
      actualFields.some((field, index) => field !== expected[index])
    ) {
      throw conflict(`${label} has unexpected or missing fields`);
    }
  }

  function loadCurrentStaffingBlueprintEvidence() {
    if (!companyBlueprintOptions) {
      throw conflict('StaffingPlan requires one configured CompanyBlueprint');
    }

    try {
      return loadCompanyBlueprintEvidence(companyBlueprintOptions);
    } catch (error) {
      throw conflict(`StaffingPlan CompanyBlueprint evidence is invalid: ${error.message}`);
    }
  }

  function buildMissionStaffingPlanPreviewFromState(state, input) {
    const mission = assertMission(input.missionId, state);
    const project = assertProject(mission.projectId, state);
    const blueprintEvidence = loadCurrentStaffingBlueprintEvidence();

    try {
      return compileMissionStaffingPlanPreview(
        {
          activeProjectId: state.activeProjectId,
          blueprintEvidence,
          evaluatedAt: input.evaluatedAt,
          mission,
          project,
          staffingSpec: input.staffingSpec,
        },
        { now: new Date().toISOString() },
      );
    } catch (error) {
      throw conflict(error.message);
    }
  }

  function previewMissionStaffingPlan(input) {
    assertExactStaffingPlanRequest(
      input,
      ['evaluatedAt', 'missionId', 'staffingSpec'],
      'StaffingPlan preview request',
    );

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`StaffingPlan preview requires supported state: ${error.message}`);
    }

    return buildMissionStaffingPlanPreviewFromState(state, input);
  }

  function findMissionStaffingPlan(state, missionId) {
    return (
      Object.values(state.staffingPlans || {}).find(
        (staffingPlan) => staffingPlan.missionId === missionId,
      ) || null
    );
  }

  function acceptMissionStaffingPlan(input) {
    assertExactStaffingPlanRequest(
      input,
      [
        'acceptance',
        'blueprintDigest',
        'evaluatedAt',
        'missionDigest',
        'missionId',
        'previewDigest',
        'previewId',
        'sourceDigest',
        'staffingSpec',
        'staffingSpecDigest',
      ],
      'StaffingPlan acceptance request',
    );

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`StaffingPlan acceptance requires supported state: ${error.message}`);
    }

    const preview = buildMissionStaffingPlanPreviewFromState(state, input);
    for (const [field, expected] of [
      ['previewId', preview.id],
      ['previewDigest', preview.previewDigest],
      ['sourceDigest', preview.sourceDigest],
      ['missionDigest', preview.missionDigest],
      ['blueprintDigest', preview.blueprintDigest],
      ['staffingSpecDigest', preview.staffingSpecDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`StaffingPlan ${field} does not match current recomputation`);
      }
    }

    const existing = findMissionStaffingPlan(state, input.missionId);
    let staffingPlan;
    try {
      staffingPlan = createStaffingPlan(
        {
          id:
            existing?.id ||
            `staffing-plan-${String(state.sequences.staffingPlan + 1).padStart(4, '0')}`,
          preview,
          acceptance: input.acceptance,
        },
        { now: new Date().toISOString() },
      );
    } catch (error) {
      throw conflict(error.message);
    }

    if (existing) {
      if (existing.recordDigest !== staffingPlan.recordDigest) {
        throw conflict(`Mission ${input.missionId} already has a different StaffingPlan`);
      }
      return {
        staffingPlan: assertStaffingPlan(existing.id, state),
        staffingPlanPreview: preview,
        idempotent: true,
      };
    }

    const id = nextStaffingPlanId(state);
    if (id !== staffingPlan.id) {
      throw new Error('StaffingPlan sequence is not deterministic');
    }
    state.staffingPlans[staffingPlan.id] = staffingPlan;
    store.saveState(state);

    return {
      staffingPlan,
      staffingPlanPreview: preview,
      idempotent: false,
    };
  }

  function getStaffingPlan(staffingPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly({
        minimumSchemaVersion: STAFFING_PLAN_STATE_SCHEMA_VERSION,
      });
    } catch (error) {
      throw conflict(`StaffingPlan inspection requires supported state: ${error.message}`);
    }

    return {
      staffingPlan: assertStaffingPlan(staffingPlanId, state),
      persisted: true,
    };
  }

  function buildStaffingSpecFromPlan(staffingPlan) {
    return {
      mode: staffingPlan.mode,
      selectedAgentIds: [...staffingPlan.selectedAgentIds],
      selectionRationale: staffingPlan.selectionRationale,
      parallelGroups: structuredClone(staffingPlan.parallelGroups),
      providerMode: staffingPlan.providerMode,
      terminationPolicy: structuredClone(staffingPlan.terminationPolicy),
    };
  }

  function findStaffingEntryByPlan(state, staffingPlanId) {
    return (
      Object.values(state.staffingEntries || {}).find(
        (staffingEntry) => staffingEntry.staffingPlanId === staffingPlanId,
      ) || null
    );
  }

  function enterStaffingPlanCouncil(input) {
    assertExactStaffingPlanRequest(
      input,
      [
        'blueprintDigest',
        'entryApproval',
        'missionDigest',
        'sourceDigest',
        'staffingPlanId',
        'staffingPlanRecordDigest',
        'staffingSpecDigest',
      ],
      'StaffingEntry Council entry request',
    );

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`StaffingEntry Council entry requires supported state: ${error.message}`);
    }

    const staffingPlan = assertStaffingPlan(input.staffingPlanId, state);
    let entryApproval;
    try {
      entryApproval = normalizeStaffingEntryApproval(
        input.entryApproval,
        staffingPlan,
        new Date().toISOString(),
      );
    } catch (error) {
      throw conflict(error.message);
    }
    const entryApprovalDigest = computeStaffingEntryApprovalDigest(entryApproval);
    const entrySourceDigest = computeStaffingEntrySourceDigest(
      staffingPlan,
      entryApprovalDigest,
    );
    const existing = findStaffingEntryByPlan(state, staffingPlan.id);

    if (existing) {
      for (const [field, expected] of [
        ['staffingPlanRecordDigest', existing.staffingPlanRecordDigest],
        ['sourceDigest', existing.sourceDigest],
        ['missionDigest', existing.missionDigest],
        ['blueprintDigest', existing.blueprintDigest],
        ['staffingSpecDigest', existing.staffingSpecDigest],
      ]) {
        if (String(input[field] || '').trim() !== expected) {
          throw conflict(`StaffingEntry replay ${field} does not match existing evidence`);
        }
      }
      if (
        entryApprovalDigest !== existing.entryApprovalDigest ||
        entrySourceDigest !== existing.entrySourceDigest
      ) {
        throw conflict('StaffingEntry replay entryApproval does not match existing evidence');
      }
      return {
        staffingEntry: assertStaffingEntry(existing.id, state),
        councilSession: assertCouncilSession(existing.councilSessionId, state),
        mission: assertMission(existing.missionId, state),
        idempotent: true,
      };
    }

    const mission = assertMission(staffingPlan.missionId, state);
    const project = assertProject(mission.projectId, state);
    if (
      state.activeProjectId !== project.id ||
      staffingPlan.projectId !== project.id ||
      staffingPlan.workspaceScope?.projectId !== project.id ||
      mission.status !== 'draft' ||
      mission.linkedTaskId !== null ||
      mission.councilSessionId !== null ||
      mission.staffingEntryId !== null
    ) {
      throw conflict('StaffingEntry requires one active, current, unbound draft Mission');
    }
    if (
      staffingPlan.persisted !== true ||
      staffingPlan.status !== 'accepted' ||
      staffingPlan.mode !== 'council' ||
      staffingPlan.providerMode !== 'local-stub' ||
      staffingPlan.parallelGroups.length !== 0 ||
      staffingPlan.terminationPolicy.maxProviderCalls !== 0
    ) {
      throw conflict('StaffingEntry requires one accepted local council StaffingPlan');
    }
    for (const [field, expected] of [
      ['staffingPlanRecordDigest', staffingPlan.recordDigest],
      ['sourceDigest', staffingPlan.sourceDigest],
      ['missionDigest', staffingPlan.missionDigest],
      ['blueprintDigest', staffingPlan.blueprintDigest],
      ['staffingSpecDigest', staffingPlan.staffingSpecDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`StaffingEntry ${field} does not match the accepted StaffingPlan`);
      }
    }

    const staffingSpec = buildStaffingSpecFromPlan(staffingPlan);
    const blueprintEvidence = loadCurrentStaffingBlueprintEvidence();
    if (councilAdapter.mode !== 'local-stub') {
      throw conflict('StaffingEntry Council entry requires the local-stub adapter');
    }
    let preview;
    try {
      preview = compileMissionStaffingPlanPreview(
        {
          activeProjectId: state.activeProjectId,
          blueprintEvidence,
          evaluatedAt: staffingPlan.evaluatedAt,
          mission,
          project,
          staffingSpec,
        },
        { now: new Date().toISOString() },
      );
    } catch (error) {
      throw conflict(`StaffingEntry source-current recomputation failed: ${error.message}`);
    }
    for (const [field, expected] of [
      ['id', staffingPlan.sourcePreviewId],
      ['previewDigest', staffingPlan.sourcePreviewDigest],
      ['sourceDigest', staffingPlan.sourceDigest],
      ['missionDigest', staffingPlan.missionDigest],
      ['blueprintDigest', staffingPlan.blueprintDigest],
      ['staffingSpecDigest', staffingPlan.staffingSpecDigest],
    ]) {
      if (preview[field] !== expected) {
        throw conflict(`StaffingEntry current StaffingPlan ${field} does not match durable evidence`);
      }
    }

    const staffingEntryId = `staffing-entry-${String(
      state.sequences.staffingEntry + 1,
    ).padStart(4, '0')}`;
    const councilSessionId = `councilSession-${String(
      state.sequences.councilSession + 1,
    ).padStart(4, '0')}`;
    const now = entryApproval.requestedAt;
    let staffingEntry;
    let councilSession;
    try {
      staffingEntry = createStaffingEntry(
        {
          id: staffingEntryId,
          councilSessionId,
          staffingPlan,
          entryApproval,
        },
        { now },
      );
      const freshCompanyRuntime = {
        status: 'ready',
        blueprint: blueprintEvidence.blueprint,
        sourceRefs: blueprintEvidence.sourceRefs,
        errors: [],
      };
      councilSession = createRealCouncilSession({
        id: councilSessionId,
        mission,
        project,
        companyRuntime: freshCompanyRuntime,
        staffingEntryRef: {
          staffingEntryId: staffingEntry.id,
          entrySourceDigest: staffingEntry.entrySourceDigest,
          staffingPlanId: staffingPlan.id,
          staffingPlanRecordDigest: staffingPlan.recordDigest,
        },
        now,
      });
      councilCoordinator.runAttempt({
        session: councilSession,
        blueprint: blueprintEvidence.blueprint,
        projectPack: project.pack,
        now,
      });
    } catch (error) {
      throw conflict(`StaffingEntry local Council attempt failed: ${error.message}`);
    }

    const currentAttempt = councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    );
    if (
      councilSession.phase !== 'awaiting-alignment' ||
      councilSession.status !== 'pending-alignment' ||
      currentAttempt?.status !== 'awaiting-alignment'
    ) {
      throw conflict('StaffingEntry local Council attempt did not reach human alignment');
    }

    if (
      nextStaffingEntryId(state) !== staffingEntry.id ||
      nextId(state, 'councilSession') !== councilSession.id
    ) {
      throw new Error('StaffingEntry or CouncilSession sequence is not deterministic');
    }
    state.staffingEntries[staffingEntry.id] = staffingEntry;
    state.councilSessions[councilSession.id] = councilSession;
    mission.staffingEntryId = staffingEntry.id;
    mission.councilSessionId = councilSession.id;
    mission.status = 'aligning';
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      staffingEntry: state.staffingEntries[staffingEntry.id],
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
      idempotent: false,
    };
  }

  function enterStaffingPlanCouncilWithStrategistContext(input) {
    assertExactStaffingPlanRequest(
      input,
      [
        'blueprintDigest',
        'contextConsumption',
        'entryApproval',
        'missionContextAttachmentId',
        'missionContextAttachmentRecordDigest',
        'missionDigest',
        'sourceDigest',
        'staffingPlanId',
        'staffingPlanRecordDigest',
        'staffingSpecDigest',
      ],
      'Context-bound StaffingEntry Council entry request',
    );

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `Context-bound StaffingEntry Council entry requires supported state: ${error.message}`,
      );
    }

    const staffingPlan = assertStaffingPlan(input.staffingPlanId, state);
    const existing = findStaffingEntryByPlan(state, staffingPlan.id);
    const now = new Date().toISOString();

    if (existing) {
      if (!existing.missionContextAttachmentRef) {
        throw conflict('Context-bound replay cannot reuse a legacy StaffingEntry');
      }
      const existingAttachment = assertMissionContextAttachment(
        existing.missionContextAttachmentRef.attachmentId,
        state,
      );
      let entryApproval;
      let contextConsumption;
      try {
        entryApproval = normalizeStaffingEntryApproval(
          input.entryApproval,
          staffingPlan,
          now,
        );
        contextConsumption = normalizeContextConsumption(input.contextConsumption, { now });
      } catch (error) {
        throw conflict(error.message);
      }
      const expectedReceipt = createStrategistContextConsumption({
        attachment: existingAttachment,
        contextConsumption,
        targetAgentId: state.councilSessions[existing.councilSessionId]
          ?.strategistContextConsumption?.targetAgentId,
        now,
      });
      const existingSession = assertCouncilSession(existing.councilSessionId, state);
      for (const [field, expected] of [
        ['staffingPlanRecordDigest', existing.staffingPlanRecordDigest],
        ['sourceDigest', existing.sourceDigest],
        ['missionDigest', existing.missionDigest],
        ['blueprintDigest', existing.blueprintDigest],
        ['staffingSpecDigest', existing.staffingSpecDigest],
      ]) {
        if (String(input[field] || '').trim() !== expected) {
          throw conflict(`Context-bound StaffingEntry replay ${field} does not match evidence`);
        }
      }
      if (
        String(input.missionContextAttachmentId || '').trim() !==
          existingAttachment.id ||
        String(input.missionContextAttachmentRecordDigest || '').trim() !==
          existingAttachment.recordDigest ||
        computeStaffingEntryApprovalDigest(entryApproval) !== existing.entryApprovalDigest ||
        computeStaffingEntrySourceDigest(staffingPlan, existing.entryApprovalDigest) !==
          existing.entrySourceDigest ||
        !existingSession.strategistContextConsumption ||
        JSON.stringify(expectedReceipt.receipt) !==
          JSON.stringify(existingSession.strategistContextConsumption) ||
        JSON.stringify(expectedReceipt.contextRef) !==
          JSON.stringify(existing.missionContextAttachmentRef)
      ) {
        throw conflict('Context-bound StaffingEntry replay does not match retained evidence');
      }
      return {
        staffingEntry: assertStaffingEntry(existing.id, state),
        councilSession: existingSession,
        mission: assertMission(existing.missionId, state),
        idempotent: true,
      };
    }

    const mission = assertMission(staffingPlan.missionId, state);
    const project = assertProject(mission.projectId, state);
    if (
      state.activeProjectId !== project.id ||
      staffingPlan.projectId !== project.id ||
      staffingPlan.workspaceScope?.projectId !== project.id ||
      mission.status !== 'draft' ||
      mission.linkedTaskId !== null ||
      mission.councilSessionId !== null ||
      mission.staffingEntryId !== null
    ) {
      throw conflict('Context-bound StaffingEntry requires one active, current, unbound draft Mission');
    }
    if (
      staffingPlan.persisted !== true ||
      staffingPlan.status !== 'accepted' ||
      staffingPlan.mode !== 'council' ||
      staffingPlan.providerMode !== 'local-stub' ||
      staffingPlan.parallelGroups.length !== 0 ||
      staffingPlan.terminationPolicy.maxProviderCalls !== 0
    ) {
      throw conflict('Context-bound StaffingEntry requires one accepted local council StaffingPlan');
    }
    for (const [field, expected] of [
      ['staffingPlanRecordDigest', staffingPlan.recordDigest],
      ['sourceDigest', staffingPlan.sourceDigest],
      ['missionDigest', staffingPlan.missionDigest],
      ['blueprintDigest', staffingPlan.blueprintDigest],
      ['staffingSpecDigest', staffingPlan.staffingSpecDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`Context-bound StaffingEntry ${field} does not match the accepted StaffingPlan`);
      }
    }

    let entryApproval;
    let contextConsumption;
    try {
      entryApproval = normalizeStaffingEntryApproval(
        input.entryApproval,
        staffingPlan,
        now,
      );
      contextConsumption = normalizeContextConsumption(input.contextConsumption, { now });
    } catch (error) {
      throw conflict(error.message);
    }
    if (entryApproval.requestedAt !== contextConsumption.requestedAt) {
      throw conflict('entryApproval.requestedAt and contextConsumption.requestedAt must match');
    }

    const attachment = assertMissionContextAttachment(
      input.missionContextAttachmentId,
      state,
    );
    if (
      String(input.missionContextAttachmentRecordDigest || '').trim() !== attachment.recordDigest ||
      attachment.status !== 'attached' ||
      attachment.targetMissionId !== mission.id ||
      attachment.projectId !== project.id ||
      attachment.targetMissionDigest !== staffingPlan.missionDigest ||
      attachment.targetMissionDigest !== computeMissionMemoryContextTargetDigest(mission) ||
      Date.parse(attachment.attachedAt) > Date.parse(contextConsumption.requestedAt) ||
      Date.parse(contextConsumption.requestedAt) >= Date.parse(attachment.expiresAt) ||
      Date.parse(now) >= Date.parse(attachment.expiresAt)
    ) {
      throw conflict('MissionContextAttachment is stale, expired, or outside the StaffingPlan lineage');
    }

    const staffingSpec = buildStaffingSpecFromPlan(staffingPlan);
    const blueprintEvidence = loadCurrentStaffingBlueprintEvidence();
    if (councilAdapter.mode !== 'local-stub') {
      throw conflict('Context-bound StaffingEntry requires the local-stub adapter');
    }
    let preview;
    try {
      preview = compileMissionStaffingPlanPreview(
        {
          activeProjectId: state.activeProjectId,
          blueprintEvidence,
          evaluatedAt: staffingPlan.evaluatedAt,
          mission,
          project,
          staffingSpec,
        },
        { now },
      );
    } catch (error) {
      throw conflict(`Context-bound StaffingEntry source-current recomputation failed: ${error.message}`);
    }
    for (const [field, expected] of [
      ['id', staffingPlan.sourcePreviewId],
      ['previewDigest', staffingPlan.sourcePreviewDigest],
      ['sourceDigest', staffingPlan.sourceDigest],
      ['missionDigest', staffingPlan.missionDigest],
      ['blueprintDigest', staffingPlan.blueprintDigest],
      ['staffingSpecDigest', staffingPlan.staffingSpecDigest],
    ]) {
      if (preview[field] !== expected) {
        throw conflict(`Context-bound StaffingEntry current StaffingPlan ${field} is stale`);
      }
    }

    const strategistProfile = blueprintEvidence.blueprint.agentProfiles.find(
      (profile) => profile.role === 'strategist',
    );
    if (!strategistProfile) {
      throw conflict('Context-bound StaffingEntry requires a source-backed Strategist profile');
    }
    const consumption = createStrategistContextConsumption({
      attachment,
      contextConsumption,
      targetAgentId: strategistProfile.id,
      now,
    });
    const staffingEntryId = `staffing-entry-${String(
      state.sequences.staffingEntry + 1,
    ).padStart(4, '0')}`;
    const councilSessionId = `councilSession-${String(
      state.sequences.councilSession + 1,
    ).padStart(4, '0')}`;
    let staffingEntry;
    let councilSession;
    try {
      staffingEntry = createContextBoundStaffingEntry(
        {
          id: staffingEntryId,
          councilSessionId,
          missionContextAttachmentRef: consumption.contextRef,
          staffingPlan,
          entryApproval,
        },
        { now },
      );
      const freshCompanyRuntime = {
        status: 'ready',
        blueprint: blueprintEvidence.blueprint,
        sourceRefs: blueprintEvidence.sourceRefs,
        errors: [],
      };
      councilSession = createRealCouncilSession({
        id: councilSessionId,
        mission,
        project,
        companyRuntime: freshCompanyRuntime,
        staffingEntryRef: {
          staffingEntryId: staffingEntry.id,
          entrySourceDigest: staffingEntry.entrySourceDigest,
          staffingPlanId: staffingPlan.id,
          staffingPlanRecordDigest: staffingPlan.recordDigest,
        },
        strategistContextConsumption: consumption.receipt,
        now,
      });
      councilCoordinator.runAttempt({
        session: councilSession,
        blueprint: blueprintEvidence.blueprint,
        projectPack: project.pack,
        strategistContext: consumption.context,
        strategistContextRef: consumption.contextRef,
        now,
      });
    } catch (error) {
      throw conflict(`Context-bound local Council attempt failed: ${error.message}`);
    }

    const currentAttempt = councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    );
    if (
      councilSession.phase !== 'awaiting-alignment' ||
      councilSession.status !== 'pending-alignment' ||
      currentAttempt?.status !== 'awaiting-alignment'
    ) {
      throw conflict('Context-bound local Council attempt did not reach human alignment');
    }
    if (
      nextStaffingEntryId(state) !== staffingEntry.id ||
      nextId(state, 'councilSession') !== councilSession.id
    ) {
      throw new Error('Context-bound StaffingEntry or CouncilSession sequence is not deterministic');
    }
    state.staffingEntries[staffingEntry.id] = staffingEntry;
    state.councilSessions[councilSession.id] = councilSession;
    mission.staffingEntryId = staffingEntry.id;
    mission.councilSessionId = councilSession.id;
    mission.status = 'aligning';
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      staffingEntry: state.staffingEntries[staffingEntry.id],
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
      idempotent: false,
    };
  }

  function getStaffingEntry(staffingEntryId) {
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`StaffingEntry inspection requires current state: ${error.message}`);
    }
    const staffingEntry = assertStaffingEntry(staffingEntryId, state);
    return {
      staffingEntry,
      councilSession: assertCouncilSession(staffingEntry.councilSessionId, state),
      mission: assertMission(staffingEntry.missionId, state),
      persisted: true,
    };
  }

  function digestCompileSpec(compileSpec) {
    return crypto.createHash('sha256').update(JSON.stringify(compileSpec)).digest('hex');
  }

  function getExecutionPlanBundleFromState(state, executionPlanId) {
    const executionPlan = assertExecutionPlan(executionPlanId, state);
    const workOrders = executionPlan.workOrderIds.map((id) => assertWorkOrder(id, state));
    const workOrderAttempts = Object.values(state.workOrderAttempts || {})
      .filter((attempt) => attempt.executionPlanId === executionPlan.id)
      .sort(
        (left, right) =>
          left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id),
      );
    const handoffPackets = executionPlan.handoffPacketIds.map((id) =>
      assertHandoffPacket(id, state));
    const workflowCheckpoints = executionPlan.checkpointRefs.map((id) =>
      assertWorkflowCheckpoint(id, state));
    const deliveryPackages = executionPlan.deliveryPackageRefs.map((id) =>
      assertDeliveryPackage(id, state));
    const deliveryPackageAcceptances = Object.values(state.deliveryPackageAcceptances).filter(
      (acceptance) => deliveryPackages.some((deliveryPackage) => deliveryPackage.id === acceptance.deliveryPackageId),
    );
    const missionCloseOuts = Object.values(state.missionCloseOuts).filter(
      (closeOut) => closeOut.executionPlanId === executionPlan.id,
    );
    const acceptanceCriteria = workOrders.flatMap((workOrder) =>
      workOrder.acceptanceCriterionRefs.map((id) => assertAcceptanceCriterion(id, state)));
    const verificationProofs = Object.values(state.verificationProofs).filter(
      (proof) => acceptanceCriteria.some((criterion) => criterion.id === proof.acceptanceCriterionId),
    );

    return {
      executionPlan,
      workOrders,
      workOrderAttempts,
      handoffPackets,
      workflowCheckpoints,
      deliveryPackages,
      deliveryPackageAcceptances,
      missionCloseOuts,
      acceptanceCriteria,
      verificationProofs,
      latestCheckpoint: executionPlan.latestCheckpointId
        ? assertWorkflowCheckpoint(executionPlan.latestCheckpointId, state)
        : null,
      latestDeliveryPackage: executionPlan.latestDeliveryPackageId
        ? assertDeliveryPackage(executionPlan.latestDeliveryPackageId, state)
        : null,
      latestDeliveryPackageAcceptance: executionPlan.latestDeliveryPackageId
        ? deliveryPackageAcceptances.find(
            (acceptance) => acceptance.deliveryPackageId === executionPlan.latestDeliveryPackageId,
          ) || null
        : null,
      latestMissionCloseOut: missionCloseOuts.at(-1) || null,
      latestWorkOrderAttempt: workOrderAttempts.at(-1) || null,
      approval: assertApproval(executionPlan.approvalId, state),
      terminalGateApproval: executionPlan.terminalGateApprovalId
        ? assertApproval(executionPlan.terminalGateApprovalId, state)
        : null,
      controlTask: assertTask(executionPlan.controlTaskId, state),
      mission: assertMission(executionPlan.missionId, state),
      councilSession: assertCouncilSession(executionPlan.councilSessionId, state),
    };
  }

  function getExecutionPlan(executionPlanId) {
    return getExecutionPlanBundleFromState(store.loadState(), executionPlanId);
  }

  function getWorkOrderAttempt(workOrderAttemptId) {
    const state = store.loadStateReadonly();
    const workOrderAttempt = assertWorkOrderAttempt(workOrderAttemptId, state);
    return {
      workOrderAttempt,
      executionPlanBundle: getExecutionPlanBundleFromState(
        state,
        workOrderAttempt.executionPlanId,
      ),
      persisted: true,
    };
  }

  function reviewerReworkNowIso() {
    const value =
      typeof options.reviewerReworkNow === 'function'
        ? options.reviewerReworkNow()
        : new Date();
    const timestamp =
      value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (!Number.isFinite(timestamp)) {
      const error = new Error(
        'ReviewerReworkPlanPreview clock must return a valid timestamp',
      );
      error.statusCode = 400;
      throw error;
    }
    return new Date(timestamp).toISOString();
  }

  function reviewerReworkNotFound(message) {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
  }

  function readBoundReviewArtifactBytes(artifact) {
    const artifactPath = path.resolve(store.resolveArtifactPath(artifact.path));
    const artifactRoot = path.resolve(store.artifactsDir);
    if (
      artifactPath === artifactRoot ||
      !artifactPath.startsWith(`${artifactRoot}${path.sep}`)
    ) {
      throw conflict('Review Artifact path leaves the runtime artifact root');
    }

    let descriptor = null;
    try {
      const linkStatus = fs.lstatSync(artifactPath);
      if (linkStatus.isSymbolicLink() || !linkStatus.isFile()) {
        throw conflict('Review Artifact must be one regular non-symlink file');
      }
      if (
        linkStatus.size < 1 ||
        linkStatus.size > MAX_REVIEW_ARTIFACT_BYTES
      ) {
        throw conflict('Review Artifact exceeds the 64 KiB pre-read byte cap');
      }
      const openFlags =
        fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
      descriptor = fs.openSync(artifactPath, openFlags);
      const openStatus = fs.fstatSync(descriptor);
      if (
        !openStatus.isFile() ||
        openStatus.size !== linkStatus.size ||
        openStatus.size > MAX_REVIEW_ARTIFACT_BYTES
      ) {
        throw conflict('Review Artifact changed during bounded inspection');
      }
      const bytes = fs.readFileSync(descriptor);
      if (
        bytes.length !== openStatus.size ||
        bytes.length > MAX_REVIEW_ARTIFACT_BYTES
      ) {
        throw conflict('Review Artifact changed during bounded read');
      }
      return bytes;
    } catch (error) {
      if (error.statusCode) throw error;
      throw conflict(`Review Artifact cannot be inspected safely: ${error.message}`);
    } finally {
      if (descriptor !== null) fs.closeSync(descriptor);
    }
  }

  function buildReviewerReworkPlanPreviewFromState(state, request, now) {
    const executionPlan = state.executionPlans?.[request.executionPlanId];
    const reviewerWorkOrder = state.workOrders?.[request.reviewerWorkOrderId];
    const reviewerAttempt = state.workOrderAttempts?.[request.reviewerAttemptId];
    const reviewerRun = state.runs?.[request.reviewerRunId];
    const reviewArtifact = state.artifacts?.[request.reviewArtifactId];
    if (!executionPlan) {
      throw reviewerReworkNotFound('ExecutionPlan not found');
    }
    if (!reviewerWorkOrder) {
      throw reviewerReworkNotFound('Reviewer WorkOrder not found');
    }
    if (!reviewerAttempt) {
      throw reviewerReworkNotFound('Reviewer WorkOrderAttempt not found');
    }
    if (!reviewerRun) {
      throw reviewerReworkNotFound('Reviewer Run not found');
    }
    if (!reviewArtifact) {
      throw reviewerReworkNotFound('Review Artifact not found');
    }

    const bundle = getReviewedDeliveryRoleBundle(state, executionPlan.id);
    const { byRole, councilSession, mission } = bundle;
    const bound = assertBoundStaffingSchedulerSourceCurrent(
      state,
      councilSession,
      { executionPlan },
    );
    if (!bound) {
      throw conflict('ReviewerReworkPlanPreview requires StaffingEntry binding');
    }
    assertReviewedDeliveryPlanApproval(bundle);
    try {
      assertWorkOrderAttemptRecord(reviewerAttempt);
    } catch (error) {
      throw conflict(`Reviewer WorkOrderAttempt is invalid: ${error.message}`);
    }

    const planAttempts = bundle.workOrderAttempts;
    const qaAttempts = planAttempts.filter(
      (attempt) =>
        attempt.workOrderId === byRole.qa.id ||
        attempt.action === WORK_ORDER_ATTEMPT_ACTION.RUN_QA,
    );
    const latestAttempt = bundle.latestWorkOrderAttempt || null;
    const builderReworkAttempt =
      latestAttempt?.action ===
        WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT &&
      latestAttempt.workOrderId === byRole.builder.id &&
      latestAttempt.role === 'builder' &&
      latestAttempt.attemptNumber === 3 &&
      ['active', 'waiting-gate', 'failed'].includes(latestAttempt.status)
        ? latestAttempt
        : null;
    const builderReworkDispatch = builderReworkAttempt
      ? Object.values(state.builderReworkDispatches || {}).find(
          (dispatch) =>
            dispatch.executionPlanId === executionPlan.id &&
            dispatch.workOrderAttemptId === builderReworkAttempt.id,
        ) || null
      : null;
    const reviewerSourcePositionCurrent =
      latestAttempt?.id === reviewerAttempt.id ||
      Boolean(
        builderReworkAttempt &&
          builderReworkDispatch &&
          builderReworkDispatch.sourceAttemptRecordDigest ===
            reviewerAttempt.recordDigest &&
          planAttempts.filter(
            (attempt) =>
              attempt.action ===
              WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
          ).length === 1,
      );
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.BLOCKED ||
      executionPlan.stopReason !== 'reviewer-changes-requested' ||
      executionPlan.stoppedAt !== 'reviewer' ||
      executionPlan.activeWorkOrderId !== null ||
      byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.reviewer.id !== reviewerWorkOrder.id ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.CHANGES_REQUESTED ||
      byRole.qa.status !== WORK_ORDER_STATUS.BLOCKED_DEPENDENCY ||
      qaAttempts.length !== 0 ||
      !reviewerSourcePositionCurrent ||
      reviewerAttempt.executionPlanId !== executionPlan.id ||
      reviewerAttempt.workOrderId !== reviewerWorkOrder.id ||
      reviewerAttempt.role !== 'reviewer' ||
      reviewerAttempt.action !== WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER ||
      reviewerAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.CHANGES_REQUESTED ||
      reviewerAttempt.stopReason !== 'reviewer-changes-requested' ||
      reviewerAttempt.attemptNumber !== 1 ||
      reviewerAttempt.sourceDigest !== executionPlan.sourceDigest ||
      reviewerAttempt.missionId !== mission.id ||
      reviewerAttempt.projectId !== executionPlan.projectId ||
      reviewerAttempt.staffingPlanId !== bound.staffingPlan.id ||
      reviewerAttempt.staffingEntryId !== bound.staffingEntry.id ||
      reviewerAttempt.councilSessionId !== councilSession.id
    ) {
      throw conflict(
        'ReviewerReworkPlanPreview requires the latest exact changes-requested stop',
      );
    }

    const reviewerDependencies = reviewerWorkOrder.dependencyIds.map(
      (dependencyId) => {
        const dependency = assertWorkOrder(dependencyId, state);
        return { id: dependency.id, status: dependency.status };
      },
    );
    if (
      reviewerAttempt.dependencyDigest !==
        computeWorkOrderAttemptDependencyDigest({
          executionPlanId: executionPlan.id,
          workOrderId: reviewerWorkOrder.id,
          dependencies: reviewerDependencies,
        }) ||
      !executionPlan.workOrderIds.includes(reviewerWorkOrder.id)
    ) {
      throw conflict('Reviewer WorkOrderAttempt dependency lineage is stale');
    }

    const builderRun = state.runs?.[byRole.builder.completionRunId];
    if (!builderRun) {
      throw conflict('Builder completion Run is missing');
    }
    const reviewContentBytes = readBoundReviewArtifactBytes(reviewArtifact);
    let parsedReview;
    try {
      parsedReview = parseReviewerArtifactContent(reviewContentBytes.toString('utf8'));
    } catch (error) {
      throw conflict(`Review Artifact is malformed: ${error.message}`);
    }
    if (
      reviewerWorkOrder.completionRunId !== reviewerRun.id ||
      reviewerWorkOrder.reviewArtifactId !== reviewArtifact.id ||
      !reviewerWorkOrder.runRefs.includes(reviewerRun.id) ||
      !reviewerWorkOrder.artifactRefs.includes(reviewArtifact.id) ||
      !reviewerAttempt.runRefs.includes(reviewerRun.id) ||
      !reviewerAttempt.artifactRefs.includes(reviewArtifact.id) ||
      reviewerRun.taskId !== executionPlan.controlTaskId ||
      reviewerRun.role !== 'reviewer' ||
      reviewerRun.status !== RUN_STATUS.COMPLETED ||
      reviewerRun.summary?.sourceRunId !== builderRun.id ||
      reviewerRun.summary?.mappedReviewStatus !== REVIEW_STATUS.CHANGES_REQUESTED ||
      reviewerRun.summary?.rawVerdict !== 'changes_requested' ||
      reviewerRun.summary?.terminal !== true ||
      reviewerRun.summary?.reviewArtifactId !== reviewArtifact.id ||
      reviewArtifact.type !== ARTIFACT_TYPE.REVIEW ||
      reviewArtifact.taskId !== executionPlan.controlTaskId ||
      reviewArtifact.runId !== reviewerRun.id ||
      parsedReview.verdict !== 'changes_requested' ||
      parsedReview.sourceBuilderRunId !== builderRun.id ||
      reviewerRun.summary?.findingsCount !== parsedReview.findings.length
    ) {
      throw conflict('Reviewer Run or Artifact lineage is stale');
    }
    if (
      byRole.builder.completionRunId !== builderRun.id ||
      !byRole.builder.runRefs.includes(builderRun.id) ||
      builderRun.taskId !== executionPlan.controlTaskId ||
      builderRun.role !== 'builder' ||
      builderRun.status !== RUN_STATUS.COMPLETED ||
      !sameExactStringArrays(
        builderRun.summary?.changedFiles || [],
        byRole.builder.changedFiles || [],
      )
    ) {
      throw conflict('Builder completion lineage is stale');
    }

    const targetPathAllowlist = byRole.builder.targetPathAllowlist || [];
    const verificationCommands = byRole.builder.verificationCommands || [];
    if (
      !sameExactStringArrays(
        targetPathAllowlist,
        byRole.reviewer.targetPathAllowlist || [],
      ) ||
      !sameExactStringArrays(
        targetPathAllowlist,
        byRole.qa.targetPathAllowlist || [],
      ) ||
      !sameExactStringArrays(
        verificationCommands,
        byRole.reviewer.verificationCommands || [],
      ) ||
      !sameExactStringArrays(
        verificationCommands,
        byRole.qa.verificationCommands || [],
      ) ||
      !sameExactStringArrays(
        verificationCommands,
        executionPlan.verificationPlan || [],
      )
    ) {
      throw conflict('Reviewer rework target or verification scope diverged');
    }

    const decisionInboxItemRefs = [
      ...new Set([
        ...(reviewerWorkOrder.inboxItemRefs || []),
        ...(reviewerAttempt.decisionInboxItemRefs || []),
      ]),
    ];
    for (const itemId of decisionInboxItemRefs) {
      const item = state.decisionInboxItems?.[itemId];
      if (
        !item ||
        item.taskId !== executionPlan.controlTaskId ||
        item.sourceType !== DECISION_INBOX_SOURCE_TYPE.REVIEW ||
        item.sourceId !== reviewArtifact.id ||
        item.status !== DECISION_INBOX_STATUS.PENDING ||
        item.blocksTask !== true
      ) {
        throw conflict('Reviewer Decision Inbox lineage is stale');
      }
    }

    return buildReviewerReworkPlanPreview(
      request,
      {
        executionPlanDigest: computeExecutionPlanRecordDigest(executionPlan),
        attemptRecordDigest: reviewerAttempt.recordDigest,
        reviewerCompletedAt: reviewerAttempt.completedAt,
        reviewArtifact: {
          artifactId: reviewArtifact.id,
          artifactType: reviewArtifact.type,
          artifactTaskId: reviewArtifact.taskId,
          artifactRunId: reviewArtifact.runId,
        },
        reviewArtifactBytes: reviewContentBytes,
        builderRunId: builderRun.id,
        builderChangedFiles: [...byRole.builder.changedFiles],
        builderArtifactRefs: [...byRole.builder.artifactRefs],
        targetPathAllowlist: [...targetPathAllowlist],
        verificationCommands: [...verificationCommands],
        evidenceRefs: {
          missionRef: mission.id,
          staffingPlanRef: bound.staffingPlan.id,
          staffingEntryRef: bound.staffingEntry.id,
          councilSessionRef: councilSession.id,
          builderWorkOrderRef: byRole.builder.id,
          builderRunRef: builderRun.id,
          reviewerWorkOrderRef: reviewerWorkOrder.id,
          reviewerAttemptRef: reviewerAttempt.id,
          reviewerRunRef: reviewerRun.id,
          reviewArtifactRef: reviewArtifact.id,
          decisionInboxItemRefs,
        },
      },
      { now },
    );
  }

  function getReviewerReworkPlanPreview(input) {
    let request;
    try {
      request = normalizeReviewerReworkPreviewRequest(input);
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReviewerReworkPlanPreview requires supported state: ${error.message}`,
      );
    }
    return buildReviewerReworkPlanPreviewFromState(
      state,
      request,
      reviewerReworkNowIso(),
    );
  }

  function findReworkPlanCollision(state, request) {
    return (
      Object.values(state.reworkPlans || {}).find(
        (record) =>
          record.executionPlanId === request.executionPlanId ||
          record.reviewerAttemptId === request.reviewerAttemptId ||
          record.reviewArtifactId === request.reviewArtifactId ||
          record.previewId === request.previewId,
      ) || null
    );
  }

  function persistReviewerReworkPlan(input) {
    const now = reviewerReworkNowIso();
    let request;
    try {
      request = normalizeReworkPlanRequest(input, { now });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`ReworkPlan requires supported state: ${error.message}`);
    }

    const existing = findReworkPlanCollision(state, request);
    if (existing) {
      assertReworkPlanRecord(existing);
      if (!isExactReworkPlanReplay(existing, request)) {
        throw conflict(
          'Reviewer changes-requested source already has a different ReworkPlan',
        );
      }
      return {
        idempotent: true,
        reworkPlan: existing,
      };
    }

    const previewRequest = normalizeReviewerReworkPreviewRequest({
      executionPlanId: request.executionPlanId,
      reviewerWorkOrderId: request.reviewerWorkOrderId,
      reviewerAttemptId: request.reviewerAttemptId,
      reviewerRunId: request.reviewerRunId,
      reviewArtifactId: request.reviewArtifactId,
      expectedExecutionPlanDigest: request.expectedExecutionPlanDigest,
      expectedAttemptRecordDigest: request.expectedAttemptRecordDigest,
      evaluatedAt: request.evaluatedAt,
    });
    const preview = buildReviewerReworkPlanPreviewFromState(
      state,
      previewRequest,
      now,
    );
    if (
      request.previewId !== preview.id ||
      request.previewDigest !== preview.previewDigest
    ) {
      throw conflict('ReworkPlan preview id or digest is stale');
    }

    const prospectiveId = `rework-plan-${String(
      state.sequences.reworkPlan + 1,
    ).padStart(4, '0')}`;
    let reworkPlan;
    try {
      reworkPlan = createReworkPlan(
        {
          id: prospectiveId,
          preview,
          recordApproval: request.recordApproval,
        },
        {
          now,
          projectId: state.executionPlans[preview.executionPlanId].projectId,
        },
      );
    } catch (error) {
      error.statusCode = error.statusCode || 409;
      throw error;
    }
    const id = nextReworkPlanId(state);
    if (id !== reworkPlan.id) {
      throw new Error('ReworkPlan sequence is not deterministic');
    }
    state.reworkPlans[id] = reworkPlan;
    store.saveState(state);

    return {
      idempotent: false,
      reworkPlan,
    };
  }

  function getReworkPlan(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkPlan inspection requires supported state: ${error.message}`,
      );
    }
    try {
      const reworkPlan = assertReworkPlan(reworkPlanId, state);
      assertReworkPlanRecord(reworkPlan);
      return { reworkPlan };
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getExecutionPlanReworkPlan(executionPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkPlan inspection requires supported state: ${error.message}`,
      );
    }
    if (!state.executionPlans?.[executionPlanId]) {
      throw reviewerReworkNotFound('ExecutionPlan not found');
    }
    const reworkPlan = Object.values(state.reworkPlans || {}).find(
      (record) => record.executionPlanId === executionPlanId,
    );
    if (!reworkPlan) {
      throw reviewerReworkNotFound('ReworkPlan not found for ExecutionPlan');
    }
    assertReworkPlanRecord(reworkPlan);
    return { reworkPlan };
  }

  function findReworkPlanAcceptance(state, reworkPlanId) {
    return (
      Object.values(state.reworkPlanAcceptances || {}).find(
        (record) => record.reworkPlanId === reworkPlanId,
      ) || null
    );
  }

  function assertReworkPlanAcceptanceRequestMatchesPlan(request, reworkPlan) {
    const bindings = [
      ['reworkPlanRecordDigest', reworkPlan.recordDigest],
      ['previewId', reworkPlan.previewId],
      ['previewDigest', reworkPlan.previewDigest],
      ['sourceExecutionPlanDigest', reworkPlan.sourceExecutionPlanDigest],
      ['sourceAttemptRecordDigest', reworkPlan.sourceAttemptRecordDigest],
      ['sourceProgressDigest', reworkPlan.sourceProgressDigest],
    ];
    for (const [field, expected] of bindings) {
      if (request[field] !== expected) {
        throw conflict(`ReworkPlanAcceptance ${field} does not match source evidence`);
      }
    }
    if (Date.parse(request.reviewedAt) < Date.parse(reworkPlan.createdAt)) {
      throw conflict('ReworkPlanAcceptance reviewedAt predates the source ReworkPlan');
    }
  }

  function assertCurrentReworkPlanProjection(state, reworkPlan, now) {
    if (reworkPlan.status !== 'review-required') {
      throw conflict('ReworkPlanAcceptance requires a review-required ReworkPlan');
    }
    const preview = buildReviewerReworkPlanPreviewFromState(
      state,
      {
        executionPlanId: reworkPlan.executionPlanId,
        reviewerWorkOrderId: reworkPlan.reviewerWorkOrderId,
        reviewerAttemptId: reworkPlan.reviewerAttemptId,
        reviewerRunId: reworkPlan.reviewerRunId,
        reviewArtifactId: reworkPlan.reviewArtifactId,
        expectedExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
        expectedAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
        evaluatedAt: reworkPlan.previewEvaluatedAt,
      },
      now,
    );
    const projection = {
      previewId: preview.id,
      previewDigest: preview.previewDigest,
      sourceExecutionPlanDigest: preview.executionPlanDigest,
      sourceAttemptRecordDigest: preview.attemptRecordDigest,
      reviewEvidenceDigest: preview.reviewEvidenceDigest,
      sourceProgressDigest: preview.sourceProgressDigest,
      nextAttemptNumber: preview.nextAttemptNumber,
      maxAdditionalBuilderAttempts: preview.maxAdditionalBuilderAttempts,
      targetPathAllowlist: preview.targetPathAllowlist,
      verificationCommands: preview.verificationCommands,
      findings: preview.findings,
      evidenceRefs: preview.evidenceRefs,
      allowedActions: preview.allowedActions,
      blockedActions: preview.blockedActions,
    };
    const recordProjection = {
      previewId: reworkPlan.previewId,
      previewDigest: reworkPlan.previewDigest,
      sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
      sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
      reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
      sourceProgressDigest: reworkPlan.sourceProgressDigest,
      nextAttemptNumber: reworkPlan.nextAttemptNumber,
      maxAdditionalBuilderAttempts: reworkPlan.maxAdditionalBuilderAttempts,
      targetPathAllowlist: reworkPlan.targetPathAllowlist,
      verificationCommands: reworkPlan.verificationCommands,
      findings: reworkPlan.findings,
      evidenceRefs: reworkPlan.evidenceRefs,
      allowedActions: reworkPlan.allowedActions,
      blockedActions: reworkPlan.blockedActions,
    };
    if (JSON.stringify(projection) !== JSON.stringify(recordProjection)) {
      throw conflict('ReworkPlanAcceptance source projection is stale');
    }
  }

  function acceptReworkPlan(input) {
    const now = reviewerReworkNowIso();
    const { reworkPlanId, ...requestInput } = input || {};
    let request;
    try {
      request = normalizeReworkPlanAcceptanceRequest(requestInput, { now });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`ReworkPlanAcceptance requires supported state: ${error.message}`);
    }

    let reworkPlan;
    try {
      reworkPlan = assertReworkPlan(reworkPlanId, state);
      assertReworkPlanRecord(reworkPlan);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }

    const existing = findReworkPlanAcceptance(state, reworkPlan.id);
    if (existing) {
      assertReworkPlanAcceptanceRecord(existing);
      if (!isExactReworkPlanAcceptanceReplay(existing, request)) {
        throw conflict(`ReworkPlan ${reworkPlan.id} already has a different acceptance`);
      }
      return { idempotent: true, reworkPlanAcceptance: existing };
    }

    assertReworkPlanAcceptanceRequestMatchesPlan(request, reworkPlan);
    assertCurrentReworkPlanProjection(state, reworkPlan, now);
    const acceptance = createReworkPlanAcceptance({
      id: nextReworkPlanAcceptanceId(state),
      reworkPlan,
      request,
    });
    if (state.reworkPlanAcceptances[acceptance.id]) {
      throw conflict(`ReworkPlanAcceptance id already exists: ${acceptance.id}`);
    }
    state.reworkPlanAcceptances[acceptance.id] = acceptance;
    store.saveState(state);
    return { idempotent: false, reworkPlanAcceptance: acceptance };
  }

  function getReworkPlanAcceptance(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkPlanAcceptance inspection requires supported state: ${error.message}`,
      );
    }
    try {
      assertReworkPlan(reworkPlanId, state);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
    const acceptance = findReworkPlanAcceptance(state, reworkPlanId);
    if (!acceptance) {
      throw reviewerReworkNotFound('ReworkPlanAcceptance not found');
    }
    assertReworkPlanAcceptance(acceptance.id, state);
    assertReworkPlanAcceptanceRecord(acceptance);
    return { reworkPlanAcceptance: acceptance };
  }

  function builderReworkNowIso() {
    const value =
      typeof options.builderReworkNow === 'function'
        ? options.builderReworkNow()
        : new Date();
    const timestamp = value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (!Number.isFinite(timestamp)) throw conflict('Builder rework clock must return a valid timestamp');
    return new Date(timestamp).toISOString();
  }

  function findBuilderReworkDispatch(state, reworkPlanId) {
    return Object.values(state.builderReworkDispatches || {}).find(
      (dispatch) => dispatch.reworkPlanId === reworkPlanId,
    ) || null;
  }

  function getBuilderReworkDispatchEnvelopeFromState(state, dispatch) {
    assertBuilderReworkDispatchRecord(dispatch);
    const attempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    if (
      attempt.action !== WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT ||
      attempt.workOrderId !== dispatch.builderWorkOrderId ||
      attempt.recordDigest === undefined
    ) {
      throw conflict('BuilderReworkDispatch attempt lineage is invalid');
    }
    return {
      builderReworkDispatch: dispatch,
      workOrderAttempt: {
        ...attempt,
        workerState: deriveBuilderReworkWorkerState(attempt),
      },
    };
  }

  function getBuilderReworkDispatchById(builderReworkDispatchId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`BuilderReworkDispatch inspection requires current state: ${error.message}`);
    }
    try {
      return getBuilderReworkDispatchEnvelopeFromState(
        state,
        assertBuilderReworkDispatch(builderReworkDispatchId, state),
      );
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getBuilderReworkDispatch(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`BuilderReworkDispatch inspection requires current state: ${error.message}`);
    }
    const reworkPlan = assertReworkPlan(reworkPlanId, state);
    const dispatch = findBuilderReworkDispatch(state, reworkPlan.id);
    if (!dispatch) {
      const error = new Error('BuilderReworkDispatch not found');
      error.statusCode = 404;
      throw error;
    }
    return getBuilderReworkDispatchEnvelopeFromState(state, dispatch);
  }

  function readBuilderReworkPreflightArtifactBytes(artifact) {
    const maxBytes = 1024 * 1024;
    let descriptor = null;
    try {
      descriptor = fs.openSync(artifact.path, 'r');
      const before = fs.fstatSync(descriptor);
      if (!before.isFile() || before.size > maxBytes) {
        throw conflict('Builder rework preflight Artifact is not a bounded file');
      }
      const bytes = Buffer.alloc(before.size);
      const bytesRead = fs.readSync(descriptor, bytes, 0, before.size, 0);
      const after = fs.fstatSync(descriptor);
      if (
        bytesRead !== before.size ||
        after.size !== before.size ||
        after.mtimeMs !== before.mtimeMs
      ) {
        throw conflict('Builder rework preflight Artifact changed during inspection');
      }
      return bytes;
    } catch (error) {
      if (error.statusCode) throw error;
      throw conflict(
        `Builder rework preflight Artifact cannot be inspected safely: ${error.message}`,
      );
    } finally {
      if (descriptor !== null) fs.closeSync(descriptor);
    }
  }

  function findBuilderReworkMutationApprovals(state, source) {
    return Object.values(state.approvals || {}).filter(
      (approval) =>
        approval.allowedNextAction === BUILDER_REWORK_MUTATION_ACTION &&
        (approval.metadata?.builderReworkDispatchId ===
          source.builderReworkDispatch.id ||
          approval.metadata?.workOrderAttemptId === source.workOrderAttempt.id ||
          approval.targetRunId === source.preflightRun.id ||
          approval.targetArtifactId === source.preflightArtifact.id),
    );
  }

  function findBuilderReworkGenericApprovalCollision(state, source) {
    return (
      Object.values(state.approvals || {}).find(
        (approval) =>
          approval.allowedNextAction === BUILDER_ACTION.LIVE_MUTATION &&
          (approval.targetRunId === source.preflightRun.id ||
            approval.targetArtifactId === source.preflightArtifact.id ||
            approval.metadata?.builderReworkDispatchId ===
              source.builderReworkDispatch.id ||
            approval.metadata?.workOrderAttemptId ===
              source.workOrderAttempt.id),
      ) || null
    );
  }

  function buildBuilderReworkMutationApprovalSource(state, reworkPlanId, now) {
    const reworkPlan = assertReworkPlan(reworkPlanId, state);
    assertReworkPlanRecord(reworkPlan);
    const acceptance = findReworkPlanAcceptance(state, reworkPlan.id);
    if (!acceptance) {
      throw conflict(
        `ReworkPlan ${reworkPlan.id} has no accepted source evidence`,
      );
    }
    assertReworkPlanAcceptanceRecord(acceptance);
    const dispatch = findBuilderReworkDispatch(state, reworkPlan.id);
    if (!dispatch) {
      const error = new Error('BuilderReworkDispatch not found');
      error.statusCode = 404;
      throw error;
    }
    assertBuilderReworkDispatchRecord(dispatch);
    const attempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    if (
      attempt.status !== WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE ||
      attempt.stopReason !==
        'builder-rework-preflight-complete-mutation-approval-blocked' ||
      attempt.runRefs.length !== 1 ||
      attempt.artifactRefs.length !== 1 ||
      attempt.approvalRefs.length !== 0 ||
      attempt.decisionInboxItemRefs.length !== 0 ||
      attempt.checkpointRef !== null ||
      attempt.recordDigest !== computeWorkOrderAttemptRecordDigest(attempt)
    ) {
      throw conflict(
        'Builder rework mutation approval requires the exact DEC-197 waiting-gate attempt',
      );
    }
    const run = assertRun(attempt.runRefs[0], state);
    const artifact = assertArtifact(attempt.artifactRefs[0], state);
    const executionPlan = assertExecutionPlan(dispatch.executionPlanId, state);
    if (
      run.taskId !== executionPlan.controlTaskId ||
      run.role !== 'builder' ||
      run.status !== RUN_STATUS.COMPLETED ||
      run.metadata?.executionMode !== 'rework-preflight' ||
      run.metadata?.builderReworkDispatchId !== dispatch.id ||
      run.metadata?.workOrderAttemptId !== attempt.id ||
      run.summary?.executionMode !== 'rework-preflight' ||
      run.summary?.builderReworkDispatchId !== dispatch.id ||
      run.summary?.workOrderAttemptId !== attempt.id ||
      artifact.taskId !== executionPlan.controlTaskId ||
      artifact.runId !== run.id ||
      artifact.type !== ARTIFACT_TYPE.PREFLIGHT
    ) {
      throw conflict('Builder rework preflight Run or Artifact lineage is stale');
    }
    const project = assertProject(executionPlan.projectId, state);
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw conflict(
        'Builder rework mutation approval supports local-stub source evidence only',
      );
    }
    if (
      dispatch.reworkPlanRecordDigest !== reworkPlan.recordDigest ||
      dispatch.reworkPlanAcceptanceId !== acceptance.id ||
      dispatch.reworkPlanAcceptanceDigest !== acceptance.acceptanceDigest ||
      dispatch.sourceExecutionPlanDigest !==
        reworkPlan.sourceExecutionPlanDigest ||
      dispatch.sourceAttemptRecordDigest !==
        reworkPlan.sourceAttemptRecordDigest ||
      dispatch.reviewEvidenceDigest !== reworkPlan.reviewEvidenceDigest ||
      dispatch.sourceProgressDigest !== reworkPlan.sourceProgressDigest
    ) {
      throw conflict('Builder rework mutation approval source binding is stale');
    }
    const reviewDecisionInboxItemRefs = [
      ...(reworkPlan.evidenceRefs?.decisionInboxItemRefs || []),
    ];
    for (const itemId of reviewDecisionInboxItemRefs) {
      const item = assertDecisionInboxItem(itemId, state);
      if (
        item.taskId !== executionPlan.controlTaskId ||
        item.sourceType !== DECISION_INBOX_SOURCE_TYPE.REVIEW ||
        item.status !== DECISION_INBOX_STATUS.PENDING ||
        item.blocksTask !== true
      ) {
        throw conflict('Builder rework Reviewer Decision evidence is stale');
      }
    }
    const artifactBytes = readBuilderReworkPreflightArtifactBytes(artifact);
    const source = {
      task: assertTask(executionPlan.controlTaskId, state),
      reworkPlan,
      acceptance,
      executionPlan,
      builderReworkDispatch: dispatch,
      workOrderAttempt: attempt,
      preflightRun: run,
      preflightArtifact: artifact,
      reviewDecisionInboxItemRefs,
      sourceFields: {
        builderReworkDispatchId: dispatch.id,
        builderReworkDispatchDigest:
          computeBuilderReworkDispatchRecordDigest(dispatch),
        executionPlanId: executionPlan.id,
        workOrderAttemptId: attempt.id,
        workOrderAttemptRecordDigest: attempt.recordDigest,
        preflightRunId: run.id,
        preflightRunRecordDigest: computePreflightRunRecordDigest(run),
        preflightArtifactId: artifact.id,
        preflightArtifactRecordDigest:
          computePreflightArtifactRecordDigest(artifact),
        preflightArtifactContentDigest:
          computePreflightArtifactContentDigest(artifactBytes),
        reworkPlanId: reworkPlan.id,
        reworkPlanRecordDigest: reworkPlan.recordDigest,
        reworkPlanAcceptanceId: acceptance.id,
        reworkPlanAcceptanceDigest: acceptance.acceptanceDigest,
        sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
        sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
        reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
        sourceProgressDigest: reworkPlan.sourceProgressDigest,
        reviewDecisionInboxItemRefs,
      },
    };
    const genericCollision = findBuilderReworkGenericApprovalCollision(
      state,
      source,
    );
    if (genericCollision) {
      throw conflict(
        `Generic Builder approval ${genericCollision.id} collides with the DEC-197 rework source`,
      );
    }
    return source;
  }

  function assertBuilderReworkMutationRequestMatchesSource(request, source) {
    const comparisons = [
      'builderReworkDispatchId',
      'builderReworkDispatchDigest',
      'workOrderAttemptId',
      'workOrderAttemptRecordDigest',
      'preflightRunId',
      'preflightRunRecordDigest',
      'preflightArtifactId',
      'preflightArtifactRecordDigest',
      'preflightArtifactContentDigest',
      'sourceProgressDigest',
    ];
    for (const field of comparisons) {
      if (request[field] !== source.sourceFields[field]) {
        throw conflict(
          `Builder rework mutation approval ${field} does not match source evidence`,
        );
      }
    }
  }

  function buildBuilderReworkSourceMutationSource(state, reworkPlanId, now) {
    const reworkPlan = assertReworkPlan(reworkPlanId, state);
    assertReworkPlanRecord(reworkPlan);
    const acceptance = findReworkPlanAcceptance(state, reworkPlan.id);
    if (!acceptance) {
      throw conflict(`ReworkPlan ${reworkPlan.id} has no accepted source evidence`);
    }
    assertReworkPlanAcceptanceRecord(acceptance);
    const dispatch = findBuilderReworkDispatch(state, reworkPlan.id);
    if (!dispatch) {
      const error = new Error('BuilderReworkDispatch not found');
      error.statusCode = 404;
      throw error;
    }
    assertBuilderReworkDispatchRecord(dispatch);
    const attempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    const executionPlan = assertExecutionPlan(dispatch.executionPlanId, state);
    const project = assertProject(executionPlan.projectId, state);
    const task = assertTask(executionPlan.controlTaskId, state);
    const matches = Object.values(state.approvals || {}).filter(
      (candidate) =>
        candidate.allowedNextAction === BUILDER_REWORK_MUTATION_ACTION &&
        candidate.metadata?.reworkPlanId === reworkPlan.id &&
        candidate.metadata?.builderReworkDispatchId === dispatch.id,
    );
    if (matches.length !== 1) {
      throw conflict(
        `ReworkPlan ${reworkPlan.id} requires one exact Builder rework mutation Approval`,
      );
    }
    const approval = matches[0];
    assertBuilderReworkMutationApprovalRecord(approval);
    if (approval.status !== APPROVAL_STATUS.APPROVED) {
      throw conflict(
        `Builder rework mutation Approval ${approval.id} must be approved`,
      );
    }
    const metadata = approval.metadata;
    const preflightRun = assertRun(metadata.preflightRunId, state);
    const preflightArtifact = assertArtifact(metadata.preflightArtifactId, state);
    const artifactBytes = readBuilderReworkPreflightArtifactBytes(
      preflightArtifact,
    );
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
      approval.projectId !== project.id ||
      approval.taskId !== task.id ||
      approval.scope !== BUILDER_REWORK_MUTATION_SCOPE ||
      approval.targetRunId !== preflightRun.id ||
      approval.targetArtifactId !== preflightArtifact.id ||
      dispatch.recordDigest !== metadata.builderReworkDispatchDigest ||
      dispatch.reworkPlanRecordDigest !== reworkPlan.recordDigest ||
      dispatch.reworkPlanAcceptanceId !== acceptance.id ||
      dispatch.reworkPlanAcceptanceDigest !== acceptance.acceptanceDigest ||
      metadata.reworkPlanRecordDigest !== reworkPlan.recordDigest ||
      metadata.reworkPlanAcceptanceId !== acceptance.id ||
      metadata.reworkPlanAcceptanceDigest !== acceptance.acceptanceDigest ||
      metadata.executionPlanId !== executionPlan.id ||
      metadata.workOrderAttemptId !== attempt.id ||
      metadata.sourceExecutionPlanDigest !==
        reworkPlan.sourceExecutionPlanDigest ||
      metadata.sourceAttemptRecordDigest !==
        reworkPlan.sourceAttemptRecordDigest ||
      metadata.reviewEvidenceDigest !== reworkPlan.reviewEvidenceDigest ||
      metadata.sourceProgressDigest !== reworkPlan.sourceProgressDigest ||
      computePreflightRunRecordDigest(preflightRun) !==
        metadata.preflightRunRecordDigest ||
      computePreflightArtifactRecordDigest(preflightArtifact) !==
        metadata.preflightArtifactRecordDigest ||
      computePreflightArtifactContentDigest(artifactBytes) !==
        metadata.preflightArtifactContentDigest
    ) {
      throw conflict('Builder rework source mutation binding is stale');
    }
    const reviewDecisionInboxItemRefs = [
      ...(reworkPlan.evidenceRefs?.decisionInboxItemRefs || []),
    ];
    if (
      digestBuilderReworkMutationCanonical(
        buildBuilderReworkMutationApprovalMetadata({
          builderReworkDispatchId: dispatch.id,
          builderReworkDispatchDigest: dispatch.recordDigest,
          executionPlanId: executionPlan.id,
          workOrderAttemptId: attempt.id,
          workOrderAttemptRecordDigest:
            metadata.workOrderAttemptRecordDigest,
          preflightRunId: preflightRun.id,
          preflightRunRecordDigest:
            metadata.preflightRunRecordDigest,
          preflightArtifactId: preflightArtifact.id,
          preflightArtifactRecordDigest:
            metadata.preflightArtifactRecordDigest,
          preflightArtifactContentDigest:
            metadata.preflightArtifactContentDigest,
          reworkPlanId: reworkPlan.id,
          reworkPlanRecordDigest: reworkPlan.recordDigest,
          reworkPlanAcceptanceId: acceptance.id,
          reworkPlanAcceptanceDigest: acceptance.acceptanceDigest,
          sourceExecutionPlanDigest:
            reworkPlan.sourceExecutionPlanDigest,
          sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
          reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
          sourceProgressDigest: reworkPlan.sourceProgressDigest,
          reviewDecisionInboxItemRefs,
        }),
      ) !== digestBuilderReworkMutationCanonical(metadata)
    ) {
      throw conflict('Builder rework mutation Approval metadata is stale');
    }
    for (const itemId of reviewDecisionInboxItemRefs) {
      const item = assertDecisionInboxItem(itemId, state);
      if (
        item.taskId !== task.id ||
        item.sourceType !== DECISION_INBOX_SOURCE_TYPE.REVIEW ||
        item.status !== DECISION_INBOX_STATUS.PENDING ||
        item.blocksTask !== true
      ) {
        throw conflict('Builder rework Reviewer Decision evidence is stale');
      }
    }
    const isWaiting =
      attempt.status === WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE &&
      attempt.stopReason ===
        'builder-rework-preflight-complete-mutation-approval-blocked' &&
      attempt.recordDigest === metadata.workOrderAttemptRecordDigest &&
      attempt.runRefs.length === 1 &&
      attempt.runRefs[0] === preflightRun.id &&
      attempt.artifactRefs.length === 1 &&
      attempt.artifactRefs[0] === preflightArtifact.id &&
      attempt.approvalRefs.length === 0;
    const mutationRun =
      attempt.runRefs.length === 2 ? state.runs[attempt.runRefs[1]] : null;
    const isMutationLifecycle =
      ['active', 'completed', 'failed'].includes(attempt.status) &&
      attempt.runRefs.length === 2 &&
      attempt.runRefs[0] === preflightRun.id &&
      attempt.artifactRefs.length >= 1 &&
      attempt.artifactRefs[0] === preflightArtifact.id &&
      attempt.approvalRefs.length === 1 &&
      attempt.approvalRefs[0] === approval.id &&
      mutationRun?.metadata?.executionMode === 'rework-live-mutation' &&
      mutationRun.metadata?.builderReworkDispatchId === dispatch.id &&
      mutationRun.metadata?.workOrderAttemptId === attempt.id &&
      mutationRun.metadata?.approvalId === approval.id;
    if (!isWaiting && !isMutationLifecycle) {
      throw conflict(
        'Builder rework source mutation attempt lifecycle is stale or invalid',
      );
    }
    if (isWaiting) {
      assertCurrentReworkPlanProjection(state, reworkPlan, now);
    }
    if (
      isMutationLifecycle &&
      attempt.status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED
    ) {
      const expectedDigests =
        mutationRun.summary?.targetFilePostMutationDigests;
      let currentDigests;
      try {
        currentDigests = readBoundedBuilderReworkSourceTargets(
          project.projectPath,
          reworkPlan.targetPathAllowlist,
        ).map((entry) => ({ path: entry.path, digest: entry.digest }));
      } catch (error) {
        throw conflict(
          `Builder rework source mutation current files are unavailable: ${error.message}`,
        );
      }
      if (
        !Array.isArray(expectedDigests) ||
        currentDigests.length !== expectedDigests.length ||
        currentDigests.some(
          (entry, index) =>
            entry.path !== expectedDigests[index]?.path ||
            entry.digest !== expectedDigests[index]?.digest,
        )
      ) {
        throw conflict(
          'Builder rework source mutation current files do not match durable evidence',
        );
      }
    }
    return {
      acceptance,
      approval,
      approvalSourceFields: {
        builderReworkDispatchId: dispatch.id,
        builderReworkDispatchDigest: dispatch.recordDigest,
        executionPlanId: executionPlan.id,
        workOrderAttemptId: attempt.id,
        workOrderAttemptRecordDigest:
          metadata.workOrderAttemptRecordDigest,
        preflightRunId: preflightRun.id,
        preflightRunRecordDigest: metadata.preflightRunRecordDigest,
        preflightArtifactId: preflightArtifact.id,
        preflightArtifactRecordDigest:
          metadata.preflightArtifactRecordDigest,
        preflightArtifactContentDigest:
          metadata.preflightArtifactContentDigest,
        reworkPlanId: reworkPlan.id,
        reworkPlanRecordDigest: reworkPlan.recordDigest,
        reworkPlanAcceptanceId: acceptance.id,
        reworkPlanAcceptanceDigest: acceptance.acceptanceDigest,
        sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
        sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
        reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
        sourceProgressDigest: reworkPlan.sourceProgressDigest,
        reviewDecisionInboxItemRefs,
      },
      builderReworkDispatch: dispatch,
      executionPlan,
      mutationArtifacts: isMutationLifecycle
        ? attempt.artifactRefs
            .slice(1)
            .map((artifactId) => assertArtifact(artifactId, state))
        : [],
      mutationRun: mutationRun || null,
      preflightArtifact,
      preflightRun,
      project,
      reworkPlan,
      reviewDecisionInboxItemRefs,
      sourceFields: {
        builderReworkDispatchId: dispatch.id,
        builderReworkDispatchDigest: dispatch.recordDigest,
        workOrderAttemptId: attempt.id,
        workOrderAttemptRecordDigest:
          metadata.workOrderAttemptRecordDigest,
        preflightRunId: preflightRun.id,
        preflightRunRecordDigest: metadata.preflightRunRecordDigest,
        preflightArtifactId: preflightArtifact.id,
        preflightArtifactRecordDigest:
          metadata.preflightArtifactRecordDigest,
        preflightArtifactContentDigest:
          metadata.preflightArtifactContentDigest,
        mutationApprovalId: approval.id,
        mutationApprovalBindingDigest: metadata.bindingDigest,
        sourceProgressDigest: reworkPlan.sourceProgressDigest,
      },
      task,
      workOrderAttempt: attempt,
    };
  }

  function assertBuilderReworkSourceMutationRequestMatchesSource(
    request,
    source,
  ) {
    for (const field of Object.keys(source.sourceFields)) {
      if (request[field] !== source.sourceFields[field]) {
        throw conflict(
          `Builder rework source mutation ${field} does not match source evidence`,
        );
      }
    }
  }

  function projectBuilderReworkSourceMutation(source) {
    const attempt = source.workOrderAttempt;
    const status =
      attempt.status === WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE
        ? 'ready'
        : attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE
          ? 'running'
          : attempt.status;
    return deepFreezeBuilderReworkMutation({
      reworkPlanId: source.reworkPlan.id,
      status,
      persisted: attempt.status !== WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE,
      source: { ...source.sourceFields },
      targetPathAllowlist: [...source.reworkPlan.targetPathAllowlist],
      approval: source.approval,
      builderReworkDispatch: source.builderReworkDispatch,
      workOrderAttempt: {
        ...attempt,
        workerState: deriveBuilderReworkWorkerState(attempt),
      },
      mutationRun: source.mutationRun,
      artifacts: [...source.mutationArtifacts],
      changedFiles: [...(source.mutationRun?.summary?.changedFiles || [])],
      nextGate:
        attempt.status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED
          ? BUILDER_REWORK_MUTATION_NEXT_GATE
          : null,
      blockedActions: [
        'reviewer-execution',
        'qa-execution',
        'retry',
        'recovery',
        'commit',
        'push',
        'release',
      ],
    });
  }

  function normalizeBuilderReworkSourceMutationAgainstSource(input, source) {
    let request;
    try {
      request = normalizeBuilderReworkSourceMutationRequest(input, {
        now: builderReworkNowIso(),
        approvalResolvedAt: source.approval.resolvedAt,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }
    assertBuilderReworkSourceMutationRequestMatchesSource(request, source);
    return request;
  }

  function prepareBuilderReworkSourceMutation(input) {
    const { reworkPlanId, ...requestInput } = input || {};
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `Builder rework source mutation requires current state: ${error.message}`,
      );
    }
    const source = buildBuilderReworkSourceMutationSource(
      state,
      reworkPlanId,
      builderReworkNowIso(),
    );
    const request = normalizeBuilderReworkSourceMutationAgainstSource(
      requestInput,
      source,
    );
    const requestDigest =
      computeBuilderReworkSourceMutationRequestDigest(request);
    if (source.mutationRun) {
      if (source.mutationRun.metadata?.requestDigest !== requestDigest) {
        throw conflict(
          `ReworkPlan ${reworkPlanId} already has a different source mutation request`,
        );
      }
      return {
        idempotent: true,
        projection: projectBuilderReworkSourceMutation(source),
        request,
        requestDigest,
        source,
      };
    }
    if (
      source.workOrderAttempt.status !==
      WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE
    ) {
      throw conflict('Builder rework source mutation is not at its exact gate');
    }
    return {
      idempotent: false,
      projection: projectBuilderReworkSourceMutation(source),
      request,
      requestDigest,
      source,
    };
  }

  function normalizeBuilderReworkBaselineDigests(value, targetPaths) {
    if (
      !Array.isArray(value) ||
      value.length !== targetPaths.length ||
      value.length === 0
    ) {
      throw conflict(
        'Builder rework source mutation requires one baseline digest per target',
      );
    }
    return value.map((entry, index) => {
      const expectedPath = targetPaths[index];
      if (
        !entry ||
        typeof entry !== 'object' ||
        Array.isArray(entry) ||
        Object.keys(entry).sort().join('\u0000') !== 'digest\u0000path' ||
        entry.path !== expectedPath ||
        !/^[a-f0-9]{64}$/.test(entry.digest || '')
      ) {
        throw conflict(
          `Builder rework source mutation baseline is invalid for ${expectedPath}`,
        );
      }
      return { path: entry.path, digest: entry.digest };
    });
  }

  function getBuilderReworkSourceMutation(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `Builder rework source mutation inspection requires current state: ${error.message}`,
      );
    }
    const source = buildBuilderReworkSourceMutationSource(
      state,
      reworkPlanId,
      builderReworkNowIso(),
    );
    return projectBuilderReworkSourceMutation(source);
  }

  function beginBuilderReworkSourceMutation(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        'baselineTargetDigests\u0000request\u0000reworkPlanId'
    ) {
      throw conflict(
        'Builder rework source mutation start has unexpected or missing fields',
      );
    }
    const state = store.loadStateSupportedReadonly();
    const source = buildBuilderReworkSourceMutationSource(
      state,
      input.reworkPlanId,
      builderReworkNowIso(),
    );
    const request = normalizeBuilderReworkSourceMutationAgainstSource(
      input.request,
      source,
    );
    const requestDigest =
      computeBuilderReworkSourceMutationRequestDigest(request);
    if (source.mutationRun) {
      if (source.mutationRun.metadata?.requestDigest !== requestDigest) {
        throw conflict(
          `ReworkPlan ${input.reworkPlanId} already has a different source mutation request`,
        );
      }
      return {
        idempotent: true,
        builderReworkSourceMutation:
          projectBuilderReworkSourceMutation(source),
      };
    }
    const targetFileBaselineDigests = normalizeBuilderReworkBaselineDigests(
      input.baselineTargetDigests,
      source.reworkPlan.targetPathAllowlist,
    );
    const preflightCompletedAt = source.workOrderAttempt.completedAt;
    const runId = nextId(state, 'run');
    const startedAt = new Date(
      Math.max(
        Date.parse(builderReworkNowIso()),
        Date.parse(request.evaluatedAt),
        Date.parse(preflightCompletedAt),
      ),
    ).toISOString();
    const run = {
      id: runId,
      taskId: source.task.id,
      kind: 'role',
      role: 'builder',
      status: RUN_STATUS.RUNNING,
      metadata: {
        approvalBindingDigest:
          source.approval.metadata.bindingDigest,
        approvalId: source.approval.id,
        builderReworkDispatchId: source.builderReworkDispatch.id,
        executionMode: 'rework-live-mutation',
        mutationAllowed: true,
        preflightArtifactId: source.preflightArtifact.id,
        preflightCompletedAt,
        preflightRunId: source.preflightRun.id,
        requestDigest,
        targetFileBaselineDigests,
        targetFiles: [...source.reworkPlan.targetPathAllowlist],
        workOrderAttemptId: source.workOrderAttempt.id,
      },
      summary: null,
      startedAt,
      finishedAt: null,
      logPath: path.join(store.logsDir, `${runId}.jsonl`),
    };
    state.runs[run.id] = run;
    const attempt = startBuilderReworkMutationAttempt(
      source.workOrderAttempt,
      {
        approvalRef: source.approval.id,
        preflightCompletedAt,
        runRef: run.id,
      },
    );
    state.workOrderAttempts[attempt.id] = attempt;
    store.saveState(state);
    return {
      idempotent: false,
      builderReworkSourceMutation: projectBuilderReworkSourceMutation({
        ...source,
        mutationRun: run,
        workOrderAttempt: attempt,
      }),
    };
  }

  function finalizeBuilderReworkSourceMutation(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        'artifacts\u0000changedFiles\u0000postMutationTargetDigests\u0000providerEvidence\u0000requestDigest\u0000reworkPlanId\u0000runId'
    ) {
      throw conflict(
        'Builder rework source mutation settlement has unexpected or missing fields',
      );
    }
    const state = store.loadState();
    const source = buildBuilderReworkSourceMutationSource(
      state,
      input.reworkPlanId,
      builderReworkNowIso(),
    );
    const run = source.mutationRun;
    if (
      source.workOrderAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !run ||
      run.id !== input.runId ||
      run.status !== RUN_STATUS.RUNNING ||
      run.metadata?.requestDigest !== input.requestDigest
    ) {
      throw conflict('Builder rework source mutation Run is not active');
    }
    if (
      !Array.isArray(input.changedFiles) ||
      input.changedFiles.length === 0 ||
      new Set(input.changedFiles).size !== input.changedFiles.length ||
      input.changedFiles.some(
        (relativePath) =>
          !source.reworkPlan.targetPathAllowlist.includes(relativePath),
      ) ||
      !Array.isArray(input.artifacts) ||
      input.artifacts.length !== 3 ||
      input.artifacts.map((entry) => entry.type).join('\u0000') !==
        ['change-summary', 'patch', 'diff'].join('\u0000')
    ) {
      throw conflict('Builder rework source mutation result is invalid');
    }
    const targetFilePostMutationDigests =
      normalizeBuilderReworkBaselineDigests(
        input.postMutationTargetDigests,
        source.reworkPlan.targetPathAllowlist,
      );
    const expectedChangedFiles = targetFilePostMutationDigests
      .filter(
        (entry, index) =>
          entry.digest !== run.metadata.targetFileBaselineDigests[index].digest,
      )
      .map((entry) => entry.path);
    if (!sameExactStringArrays(input.changedFiles, expectedChangedFiles)) {
      throw conflict(
        'Builder rework source mutation changed files do not match post-mutation digests',
      );
    }
    if (
      !input.providerEvidence ||
      typeof input.providerEvidence !== 'object' ||
      Array.isArray(input.providerEvidence) ||
      Object.keys(input.providerEvidence).sort().join('\u0000') !==
        'adapter\u0000model\u0000providerRunId' ||
      input.providerEvidence.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
      ['model', 'providerRunId'].some(
        (field) =>
          typeof input.providerEvidence[field] !== 'string' ||
          !input.providerEvidence[field] ||
          input.providerEvidence[field].length > 256,
      )
    ) {
      throw conflict('Builder rework source mutation provider evidence is invalid');
    }
    const approvalSnapshot = JSON.stringify(source.approval);
    const inboxSnapshot = JSON.stringify(
      state.decisionInboxItems[source.approval.inboxItemId],
    );
    let writtenArtifactPaths = [];
    let completedProjection = null;
    try {
      const bundle = recordArtifactBundleInState(state, {
        taskId: source.task.id,
        runId: run.id,
        artifacts: input.artifacts.map((artifact) => ({
          ...artifact,
          key: artifact.type,
        })),
      });
      writtenArtifactPaths = bundle.writtenArtifactPaths;
      const artifacts = input.artifacts.map(
        (artifact) => bundle.artifactsByKey[artifact.type],
      );
      const finishedAt = new Date(
        Math.max(Date.parse(builderReworkNowIso()), Date.parse(run.startedAt)),
      ).toISOString();
      run.status = RUN_STATUS.COMPLETED;
      run.finishedAt = finishedAt;
      run.summary = {
        approvalId: source.approval.id,
        artifactIds: artifacts.map((artifact) => artifact.id),
        changedFiles: [...input.changedFiles],
        executionMode: 'rework-live-mutation',
        mutationAllowed: true,
        nextGate: BUILDER_REWORK_MUTATION_NEXT_GATE,
        providerEvidence: structuredClone(input.providerEvidence),
        requestDigest: input.requestDigest,
        targetFilePostMutationDigests,
      };
      const attempt = transitionWorkOrderAttemptWithOpsGuard(state, source.workOrderAttempt, {
        status: WORK_ORDER_ATTEMPT_STATUS.COMPLETED,
        checkpointRef: null,
        approvalRefs: [source.approval.id],
        runRefs: [...source.workOrderAttempt.runRefs],
        artifactRefs: [
          ...source.workOrderAttempt.artifactRefs,
          ...artifacts.map((artifact) => artifact.id),
        ],
        decisionInboxItemRefs: [],
        stopReason: null,
        completedAt: finishedAt,
      });
      state.workOrderAttempts[attempt.id] = attempt;
      if (
        JSON.stringify(source.approval) !== approvalSnapshot ||
        JSON.stringify(state.decisionInboxItems[source.approval.inboxItemId]) !==
          inboxSnapshot
      ) {
        throw conflict(
          'Builder rework source mutation changed immutable approval evidence',
        );
      }
      completedProjection = projectBuilderReworkSourceMutation(
        structuredClone({
          ...source,
          mutationArtifacts: artifacts,
          mutationRun: run,
          workOrderAttempt: attempt,
        }),
      );
      store.saveState(state);
    } catch (error) {
      for (const artifactPath of writtenArtifactPaths) {
        fs.rmSync(artifactPath, { force: true });
      }
      throw error;
    }
    return completedProjection;
  }

  function failBuilderReworkSourceMutation(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        'error\u0000requestDigest\u0000reworkPlanId\u0000runId'
    ) {
      throw conflict(
        'Builder rework source mutation failure has unexpected or missing fields',
      );
    }
    const state = store.loadState();
    const source = buildBuilderReworkSourceMutationSource(
      state,
      input.reworkPlanId,
      builderReworkNowIso(),
    );
    const run = source.mutationRun;
    if (
      source.workOrderAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !run ||
      run.id !== input.runId ||
      run.status !== RUN_STATUS.RUNNING ||
      run.metadata?.requestDigest !== input.requestDigest
    ) {
      throw conflict('Builder rework source mutation Run is not active');
    }
    const finishedAt = new Date(
      Math.max(Date.parse(builderReworkNowIso()), Date.parse(run.startedAt)),
    ).toISOString();
    run.status = RUN_STATUS.COMPLETED;
    run.finishedAt = finishedAt;
    run.summary = {
      error: String(input.error || 'builder-rework-source-mutation-failed')
        .replace(/\s+/g, ' ')
        .slice(0, 240),
      executionMode: 'rework-live-mutation',
      mutationAllowed: true,
      requestDigest: input.requestDigest,
    };
    const attempt = transitionWorkOrderAttemptWithOpsGuard(state, source.workOrderAttempt, {
      status: WORK_ORDER_ATTEMPT_STATUS.FAILED,
      checkpointRef: null,
      approvalRefs: [source.approval.id],
      runRefs: [...source.workOrderAttempt.runRefs],
      artifactRefs: [...source.workOrderAttempt.artifactRefs],
      decisionInboxItemRefs: [],
      stopReason: 'builder-rework-source-mutation-failed',
      completedAt: finishedAt,
    });
    state.workOrderAttempts[attempt.id] = attempt;
    const failedProjection = projectBuilderReworkSourceMutation(
      structuredClone({
        ...source,
        mutationArtifacts: [],
        mutationRun: run,
        workOrderAttempt: attempt,
      }),
    );
    store.saveState(state);
    return failedProjection;
  }

  function readReexecutionArtifactBytes(artifact) {
    try {
      const bytes = store.readArtifactBytes(artifact.path);
      if (bytes.length === 0 || bytes.length > 1024 * 1024) {
        throw new Error('artifact bytes are outside the bounded range');
      }
      return bytes;
    } catch (error) {
      throw conflict(`Reviewer re-execution Artifact cannot be read: ${error.message}`);
    }
  }

  function findReviewerReexecutionAttempt(state, executionPlanId, reviewerWorkOrderId) {
    return getPlanWorkOrderAttempts(state, executionPlanId).find(
      (attempt) =>
        attempt.workOrderId === reviewerWorkOrderId &&
        attempt.action === WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER &&
        attempt.command === WORK_ORDER_ATTEMPT_COMMAND.STEP &&
        attempt.attemptNumber === 2,
    ) || null;
  }

  function buildReviewerReexecutionSource(state, reworkPlanId, options = {}) {
    const reworkPlan = assertReworkPlan(reworkPlanId, state);
    assertReworkPlanRecord(reworkPlan);
    const acceptance = findReworkPlanAcceptance(state, reworkPlan.id);
    const dispatch = findBuilderReworkDispatch(state, reworkPlan.id);
    if (!acceptance || !dispatch) {
      throw conflict('Reviewer re-execution requires accepted rework and dispatch evidence');
    }
    assertReworkPlanAcceptanceRecord(acceptance);
    assertBuilderReworkDispatchRecord(dispatch);

    const bundle = getReviewedDeliveryRoleBundle(state, dispatch.executionPlanId);
    const { executionPlan, byRole, mission, councilSession } = bundle;
    const project = assertProject(executionPlan.projectId, state);
    const task = assertTask(executionPlan.controlTaskId, state);
    const builderAttempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    const mutationRun = builderAttempt.runRefs.length === 2
      ? assertRun(builderAttempt.runRefs[1], state)
      : null;
    const mutationArtifacts = builderAttempt.artifactRefs.slice(1).map((id) =>
      assertArtifact(id, state));
    const sourceReviewerAttempt = assertWorkOrderAttempt(
      reworkPlan.reviewerAttemptId,
      state,
    );
    const sourceReviewerRun = assertRun(reworkPlan.reviewerRunId, state);
    const sourceReviewArtifact = assertArtifact(reworkPlan.reviewArtifactId, state);
    const reexecutionAttempt = findReviewerReexecutionAttempt(
      state,
      executionPlan.id,
      byRole.reviewer.id,
    );
    const reexecutionRun = reexecutionAttempt?.runRefs[0]
      ? assertRun(reexecutionAttempt.runRefs[0], state)
      : null;
    const reexecutionReviewArtifact = reexecutionAttempt?.artifactRefs[0]
      ? assertArtifact(reexecutionAttempt.artifactRefs[0], state)
      : null;
    const durableReplay = options.durableReplay === true && Boolean(reexecutionAttempt);
    const staffingBinding = durableReplay
      ? true
      : assertBoundStaffingSchedulerSourceCurrent(
          state,
          councilSession,
          { executionPlan },
        );

    if (
      (!durableReplay &&
        (project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
          project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
          !staffingBinding)) ||
      dispatch.executionPlanId !== executionPlan.id ||
      dispatch.builderWorkOrderId !== byRole.builder.id ||
      dispatch.sourceAttemptRecordDigest !== sourceReviewerAttempt.recordDigest ||
      dispatch.sourceProgressDigest !== reworkPlan.sourceProgressDigest ||
      reworkPlan.sourceExecutionPlanDigest !== dispatch.sourceExecutionPlanDigest ||
      reworkPlan.sourceAttemptRecordDigest !== dispatch.sourceAttemptRecordDigest ||
      acceptance.reworkPlanId !== reworkPlan.id ||
      acceptance.acceptanceDigest !== dispatch.reworkPlanAcceptanceDigest ||
      builderAttempt.id !== dispatch.workOrderAttemptId ||
      builderAttempt.action !== WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT ||
      builderAttempt.attemptNumber !== 3 ||
      builderAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.COMPLETED ||
      !mutationRun ||
      mutationRun.status !== RUN_STATUS.COMPLETED ||
      mutationRun.metadata?.executionMode !== 'rework-live-mutation' ||
      mutationRun.metadata?.builderReworkDispatchId !== dispatch.id ||
      mutationRun.metadata?.workOrderAttemptId !== builderAttempt.id ||
      mutationRun.summary?.executionMode !== 'rework-live-mutation' ||
      mutationArtifacts.length !== 3 ||
      mutationArtifacts.map((artifact) => artifact.type).join('\u0000') !==
        [ARTIFACT_TYPE.CHANGE_SUMMARY, ARTIFACT_TYPE.PATCH, ARTIFACT_TYPE.DIFF].join('\u0000') ||
      mutationArtifacts.some((artifact) => artifact.runId !== mutationRun.id) ||
      sourceReviewerAttempt.id !== reworkPlan.reviewerAttemptId ||
      sourceReviewerAttempt.recordDigest !== reworkPlan.sourceAttemptRecordDigest ||
      sourceReviewerAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.CHANGES_REQUESTED ||
      sourceReviewerAttempt.attemptNumber !== 1 ||
      sourceReviewerRun.id !== reworkPlan.reviewerRunId ||
      sourceReviewerRun.status !== RUN_STATUS.COMPLETED ||
      sourceReviewArtifact.id !== reworkPlan.reviewArtifactId ||
      sourceReviewArtifact.type !== ARTIFACT_TYPE.REVIEW ||
      sourceReviewArtifact.runId !== sourceReviewerRun.id
    ) {
      throw conflict('Reviewer re-execution source evidence is stale or invalid');
    }

    const targetPathAllowlist = [...reworkPlan.targetPathAllowlist];
    const postMutationTargetDigests = mutationRun.summary?.targetFilePostMutationDigests;
    if (
      !Array.isArray(postMutationTargetDigests) ||
      postMutationTargetDigests.length !== targetPathAllowlist.length
    ) {
      throw conflict('Reviewer re-execution mutation target evidence is invalid');
    }
    const currentTargetDigests = durableReplay
      ? postMutationTargetDigests.map((entry) => ({
          path: entry.path,
          digest: entry.digest,
          content: null,
        }))
      : readBoundedBuilderReworkSourceTargets(
          project.projectPath,
          targetPathAllowlist,
        ).map((entry) => ({
          path: entry.path,
          digest: entry.digest,
          content: entry.content,
        }));
    if (
      postMutationTargetDigests.length !== currentTargetDigests.length ||
      currentTargetDigests.some(
        (entry, index) =>
          entry.path !== postMutationTargetDigests[index]?.path ||
          entry.digest !== postMutationTargetDigests[index]?.digest,
      )
    ) {
      throw conflict('Reviewer re-execution targets no longer match DEC-203 mutation evidence');
    }

    const mutationEvidenceDigest = computeMutationEvidenceDigest({
      approval: assertApproval(builderAttempt.approvalRefs[0], state),
      dispatch,
      builderAttempt,
      mutationRun,
      artifacts: mutationArtifacts.map((artifact) => ({
        artifact,
        bytes: readReexecutionArtifactBytes(artifact),
      })),
      postMutationTargetDigests,
      currentTargetDigests: currentTargetDigests.map(({ path: targetPath, digest }) => ({
        path: targetPath,
        digest,
      })),
      sourceReviewerAttempt,
      sourceReviewerRun,
    });
    if (
      durableReplay &&
      (
        !reexecutionRun ||
        reexecutionRun.metadata?.executionMode !== 'rework-reviewer' ||
        reexecutionRun.metadata?.mutationEvidenceDigest !== mutationEvidenceDigest
      )
    ) {
      throw conflict('Reviewer re-execution durable replay evidence is invalid');
    }

    return {
      acceptance,
      builderAttempt,
      bundle,
      councilSession,
      currentTargetDigests,
      dispatch,
      executionPlan,
      mission,
      mutationArtifacts,
      mutationEvidenceDigest,
      mutationRun,
      project,
      reexecutionAttempt,
      reexecutionReviewArtifact,
      reexecutionRun,
      reworkPlan,
      sourceReviewArtifact,
      sourceReviewerAttempt,
      sourceReviewerRun,
      task,
      byRole,
    };
  }

  function assertReviewerReexecutionRequestMatchesSource(request, source) {
    const expected = {
      builderReworkDispatchId: source.dispatch.id,
      builderReworkDispatchDigest: source.dispatch.recordDigest,
      builderReworkAttemptId: source.dispatch.workOrderAttemptId,
      builderReworkAttemptRecordDigest: source.builderAttempt.recordDigest,
      mutationRunId: source.mutationRun.id,
      mutationEvidenceDigest: source.mutationEvidenceDigest,
      reviewerWorkOrderId: source.byRole.reviewer.id,
      reviewerWorkOrderDigest: computeWorkOrderRecordDigest(source.byRole.reviewer),
      sourceReviewerAttemptId: source.sourceReviewerAttempt.id,
      sourceReviewerAttemptRecordDigest: source.sourceReviewerAttempt.recordDigest,
      sourceProgressDigest: source.reworkPlan.sourceProgressDigest,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (request[field] !== value) {
        throw conflict(`Reviewer re-execution ${field} does not match source evidence`);
      }
    }
  }

  function projectReviewerReexecution(source, requestDigest = null) {
    const attempt = source.reexecutionAttempt;
    const requestSource = !attempt
      ? {
          builderReworkDispatchId: source.dispatch.id,
          builderReworkDispatchDigest: source.dispatch.recordDigest,
          builderReworkAttemptId: source.dispatch.workOrderAttemptId,
          builderReworkAttemptRecordDigest: source.builderAttempt.recordDigest,
          mutationEvidenceDigest: source.mutationEvidenceDigest,
          mutationRunId: source.mutationRun.id,
          reviewerWorkOrderId: source.byRole.reviewer.id,
          reviewerWorkOrderDigest: computeWorkOrderRecordDigest(source.byRole.reviewer),
          sourceProgressDigest: source.reworkPlan.sourceProgressDigest,
          sourceReviewerAttemptId: source.sourceReviewerAttempt.id,
          sourceReviewerAttemptRecordDigest: source.sourceReviewerAttempt.recordDigest,
        }
      : null;
    const attemptRefs = attempt
      ? {
          artifactRefs: [...attempt.artifactRefs],
          decisionInboxItemRefs: [...attempt.decisionInboxItemRefs],
          runRefs: [...attempt.runRefs],
        }
      : null;
    return deepFreezeReviewerReexecution({
      reworkPlanId: source.reworkPlan.id,
      persisted: Boolean(attempt),
      status:
        !attempt ? 'ready' : attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE ? 'running' : attempt.status,
      mutationEvidenceDigest: source.mutationEvidenceDigest,
      requestDigest,
      requestSource,
      retainedFindings: structuredClone(source.reworkPlan.findings),
      changedFiles: [...(source.mutationRun.summary?.changedFiles || [])],
      targetPathAllowlist: [...source.reworkPlan.targetPathAllowlist],
      verificationCommands: [...source.reworkPlan.verificationCommands],
      reviewerWorkOrder: structuredClone(source.byRole.reviewer),
      workOrderAttempt: attempt ? structuredClone(attempt) : null,
      attemptRefs,
      reviewerRun: source.reexecutionRun ? structuredClone(source.reexecutionRun) : null,
      reviewArtifact: source.reexecutionReviewArtifact
        ? structuredClone(source.reexecutionReviewArtifact)
        : null,
      mutationRun: structuredClone(source.mutationRun),
      mutationArtifacts: structuredClone(source.mutationArtifacts),
      nextGate:
        attempt?.status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED
          ? 'separate-qa-execution-decision-required'
          : attempt?.status === WORK_ORDER_ATTEMPT_STATUS.CHANGES_REQUESTED
            ? 'no-additional-rework-authority'
            : null,
      blockedActions: [
        'qa-execution',
        'third-reviewer-attempt',
        'second-builder-rework',
        'retry',
        'recovery',
        'source-mutation',
        'commit',
        'push',
        'release',
      ],
    });
  }

  function beginReviewerReexecution(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !== 'request\u0000reworkPlanId'
    ) {
      throw conflict('Reviewer re-execution start has unexpected or missing fields');
    }
    const now = builderReworkNowIso();
    const request = normalizeReviewerReexecutionRequest(input.request, { now });
    const requestDigest = computeReviewerReexecutionRequestDigest(request);
    const state = store.loadStateSupportedReadonly();
    const source = buildReviewerReexecutionSource(state, input.reworkPlanId, {
      durableReplay: true,
    });

    if (source.reexecutionAttempt) {
      const run = source.reexecutionAttempt.runRefs[0]
        ? assertRun(source.reexecutionAttempt.runRefs[0], state)
        : null;
      if (!run || !isExactReviewerReexecutionReplay(
        run,
        requestDigest,
        request.mutationEvidenceDigest,
      )) {
        throw conflict(`ReworkPlan ${input.reworkPlanId} already has a divergent Reviewer re-execution`);
      }
      return {
        idempotent: true,
        reviewerReexecution: projectReviewerReexecution(source, requestDigest),
      };
    }

    assertReviewerReexecutionRequestMatchesSource(request, source);
    const blockingItems = listPendingBlockingDecisionItems(source.task.id, state);
    const retainedDecisionRefs = [...source.reworkPlan.evidenceRefs.decisionInboxItemRefs];
    if (
      blockingItems.length !== retainedDecisionRefs.length ||
      blockingItems.some((item) => !retainedDecisionRefs.includes(item.id))
    ) {
      throw conflict('Reviewer re-execution refuses unrelated pending Decision blockers');
    }
    if (
      source.executionPlan.status !== EXECUTION_PLAN_STATUS.BLOCKED ||
      source.executionPlan.stopReason !== 'reviewer-changes-requested' ||
      source.executionPlan.stoppedAt !== 'reviewer' ||
      source.executionPlan.activeWorkOrderId !== null ||
      source.byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      source.byRole.reviewer.status !== WORK_ORDER_STATUS.CHANGES_REQUESTED ||
      source.byRole.qa.status !== WORK_ORDER_STATUS.BLOCKED_DEPENDENCY
    ) {
      throw conflict('Reviewer re-execution is not at the exact changes-requested stop');
    }

    const startedAt = new Date(
      Math.max(Date.parse(now), Date.parse(request.evaluatedAt), Date.parse(source.mutationRun.finishedAt)),
    ).toISOString();
    const { executionPlan, byRole } = source;
    const builder = byRole.builder;
    const reviewer = byRole.reviewer;
    const qa = byRole.qa;

    builder.runRefs = appendUniqueRefs(builder.runRefs, [source.mutationRun.id]);
    builder.artifactRefs = appendUniqueRefs(
      builder.artifactRefs,
      source.mutationArtifacts.map((artifact) => artifact.id),
    );
    builder.changedFiles = [...source.mutationRun.summary.changedFiles];
    builder.completionRunId = source.mutationRun.id;
    builder.completedAt = source.mutationRun.finishedAt;
    builder.updatedAt = startedAt;
    reviewer.status = WORK_ORDER_STATUS.QUEUED;
    reviewer.updatedAt = startedAt;
    executionPlan.runRefs = appendUniqueRefs(executionPlan.runRefs, [source.mutationRun.id]);
    executionPlan.artifactRefs = appendUniqueRefs(
      executionPlan.artifactRefs,
      source.mutationArtifacts.map((artifact) => artifact.id),
    );
    executionPlan.status = EXECUTION_PLAN_STATUS.ACTIVE;
    executionPlan.activeWorkOrderId = reviewer.id;
    executionPlan.stopReason = null;
    executionPlan.stoppedAt = null;
    executionPlan.updatedAt = startedAt;

    const checkpoint = appendWorkflowCheckpoint(
      state,
      source.bundle,
      WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
      {
        createdAt: startedAt,
        resumedFromCheckpointId: executionPlan.latestCheckpointId,
        stopReason: 'dec-203-mutation-reconciled-reviewer-ready',
      },
    );
    consumeLatestCheckpoint(
      state,
      executionPlan,
      WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
      'reviewer-reexecution-started',
    );
    const reviewerDependencies = reviewer.dependencyIds.map((dependencyId) => {
      const dependency = assertWorkOrder(dependencyId, state);
      return { id: dependency.id, status: dependency.status };
    });
    reviewer.status = WORK_ORDER_STATUS.ACTIVE;
    reviewer.startedAt ||= startedAt;
    reviewer.updatedAt = startedAt;
    executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
    executionPlan.activeWorkOrderId = reviewer.id;
    executionPlan.updatedAt = startedAt;
    const attemptId = nextWorkOrderAttemptId(state);
    const authorityDigest = computeWorkOrderAttemptAuthorityDigest({
      executionPlanId: executionPlan.id,
      expectedWorkOrderId: reviewer.id,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER,
      sourceDigest: executionPlan.sourceDigest,
      checkpointRef: checkpoint.id,
      checkpointDigest: checkpoint.checkpointDigest,
      approvalRefs: [],
    });
    const attempt = createWorkOrderAttempt({
      id: attemptId,
      executionPlanId: executionPlan.id,
      workOrderId: reviewer.id,
      missionId: source.mission.id,
      projectId: executionPlan.projectId,
      staffingPlanId: source.sourceReviewerAttempt.staffingPlanId,
      staffingEntryId: source.sourceReviewerAttempt.staffingEntryId,
      councilSessionId: source.councilSession.id,
      role: 'reviewer',
      position: reviewer.position,
      attemptNumber: 2,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER,
      sourceDigest: executionPlan.sourceDigest,
      workOrderDigest: computeReviewerReexecutionWorkOrderDigest(reviewer),
      dependencyDigest: computeWorkOrderAttemptDependencyDigest({
        executionPlanId: executionPlan.id,
        workOrderId: reviewer.id,
        dependencies: reviewerDependencies,
      }),
      authorityDigest,
      checkpointRef: checkpoint.id,
      approvalRefs: [],
      startedAt,
    });
    const runId = nextId(state, 'run');
    const run = {
      id: runId,
      taskId: source.task.id,
      kind: 'role',
      role: 'reviewer',
      status: RUN_STATUS.RUNNING,
      metadata: {
        builderReworkDispatchId: source.dispatch.id,
        executionMode: 'rework-reviewer',
        mutationEvidenceDigest: source.mutationEvidenceDigest,
        requestDigest,
        reworkPlanId: source.reworkPlan.id,
        sourceReviewerAttemptId: source.sourceReviewerAttempt.id,
        workOrderAttemptId: attempt.id,
      },
      summary: null,
      startedAt,
      finishedAt: null,
      logPath: path.join(store.logsDir, `${runId}.jsonl`),
    };
    const activeAttempt = {
      ...attempt,
      runRefs: [run.id],
    };
    delete activeAttempt.recordDigest;
    activeAttempt.recordDigest = computeWorkOrderAttemptRecordDigest(activeAttempt);
    state.runs[run.id] = run;
    state.workOrderAttempts[activeAttempt.id] = Object.freeze(activeAttempt);
    for (const itemId of retainedDecisionRefs) {
      resolveInboxItemRecord(assertDecisionInboxItem(itemId, state), 'rework-started', '', startedAt);
    }
    source.task.latestRunId = run.id;
    recalculateTaskFlags(source.task, state);
    source.task.updatedAt = startedAt;
    store.saveState(state);

    return {
      idempotent: false,
      reviewerReexecution: projectReviewerReexecution(
        {
          ...source,
          reexecutionAttempt: state.workOrderAttempts[activeAttempt.id],
          reexecutionRun: run,
        },
        requestDigest,
      ),
    };
  }

  function getReviewerReexecutionWorkerInput(input) {
    if (!input || Object.keys(input).sort().join('\u0000') !== 'requestDigest\u0000reworkPlanId') {
      throw conflict('Reviewer re-execution worker input has unexpected or missing fields');
    }
    const state = store.loadStateReadonly();
    const source = buildReviewerReexecutionSource(state, input.reworkPlanId);
    const attempt = source.reexecutionAttempt;
    const run = attempt?.runRefs?.[0] ? assertRun(attempt.runRefs[0], state) : null;
    if (
      !attempt ||
      attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !run ||
      run.status !== RUN_STATUS.RUNNING ||
      !isExactReviewerReexecutionReplay(run, input.requestDigest, source.mutationEvidenceDigest)
    ) {
      throw conflict('Reviewer re-execution has no exact active worker state');
    }
    return {
      ...source,
      reviewerAttempt: attempt,
      reviewerRun: run,
      codeContext: source.currentTargetDigests.map(({ path: targetPath, content }) => ({
        path: targetPath,
        content,
      })),
    };
  }

  function getReviewerReexecution(reworkPlanId) {
    const state = store.loadStateSupportedReadonly();
    const source = buildReviewerReexecutionSource(state, reworkPlanId, {
      durableReplay: true,
    });
    const run = source.reexecutionAttempt?.runRefs?.[0]
      ? assertRun(source.reexecutionAttempt.runRefs[0], state)
      : null;
    return projectReviewerReexecution(
      source,
      run?.metadata?.requestDigest || null,
    );
  }

  function assertActiveReviewerReexecution(state, input) {
    const source = buildReviewerReexecutionSource(state, input.reworkPlanId);
    const attempt = source.reexecutionAttempt;
    const run = attempt?.runRefs?.[0] ? assertRun(attempt.runRefs[0], state) : null;
    if (
      !attempt ||
      attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !run ||
      run.id !== input.runId ||
      run.status !== RUN_STATUS.RUNNING ||
      input.mutationEvidenceDigest !== source.mutationEvidenceDigest ||
      !isExactReviewerReexecutionReplay(
        run,
        input.requestDigest,
        source.mutationEvidenceDigest,
      )
    ) {
      throw conflict('Reviewer re-execution Run is not the exact active evidence');
    }
    return { ...source, reviewerAttempt: attempt, reviewerRun: run };
  }

  function completeReviewerReexecution(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        'mutationEvidenceDigest\u0000normalizedResult\u0000outputText\u0000providerEvidence\u0000requestDigest\u0000reworkPlanId\u0000runId'
    ) {
      throw conflict('Reviewer re-execution settlement has unexpected or missing fields');
    }
    const state = store.loadState();
    const source = assertActiveReviewerReexecution(state, input);
    const { executionPlan, byRole, reviewerAttempt, reviewerRun } = source;
    const outputText = String(input.outputText || '');
    let parsedReview;
    try {
      parsedReview = parseReviewerArtifactContent(outputText);
    } catch (error) {
      throw conflict(`Reviewer re-execution Artifact is malformed: ${error.message}`);
    }
    if (
      !input.normalizedResult ||
      typeof input.normalizedResult !== 'object' ||
      !input.providerEvidence ||
      typeof input.providerEvidence !== 'object' ||
      input.providerEvidence.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
      parsedReview.sourceBuilderRunId !== source.mutationRun.id ||
      parsedReview.preflightArtifactId !== source.mutationRun.metadata.preflightArtifactId ||
      parsedReview.changeSummaryArtifactId !== source.mutationArtifacts[0].id ||
      parsedReview.patchArtifactId !== source.mutationArtifacts[1].id ||
      parsedReview.diffArtifactId !== source.mutationArtifacts[2].id ||
      !['pass', 'changes_requested'].includes(parsedReview.verdict) ||
      (parsedReview.verdict === 'pass' && input.normalizedResult.needsDecision === true) ||
      (parsedReview.verdict === 'pass' && parsedReview.decisionRequired === true) ||
      (parsedReview.verdict === 'pass' && input.normalizedResult.nextStage !== 'qa-ready') ||
      (parsedReview.verdict === 'changes_requested' &&
        input.normalizedResult.nextStage !== 'no-additional-rework-authority')
    ) {
      throw conflict('Reviewer re-execution result widens or contradicts the approved contract');
    }

    const finishedAt = new Date(
      Math.max(Date.parse(builderReworkNowIso()), Date.parse(reviewerRun.startedAt)),
    ).toISOString();
    let writtenArtifactPaths = [];
    try {
      const artifactBundle = recordArtifactBundleInState(state, {
        taskId: source.task.id,
        runId: reviewerRun.id,
        artifacts: [{ key: 'review', type: ARTIFACT_TYPE.REVIEW, content: outputText }],
      });
      writtenArtifactPaths = artifactBundle.writtenArtifactPaths;
      const reviewArtifact = artifactBundle.artifactsByKey.review;
      let decisionInboxItem = null;
      if (parsedReview.verdict === 'changes_requested' && input.normalizedResult.needsDecision === true) {
        decisionInboxItem = createDecisionInboxItemRecord(state, {
          taskId: source.task.id,
          kind: DECISION_INBOX_KIND.DECISION,
          sourceType: DECISION_INBOX_SOURCE_TYPE.REVIEW,
          sourceId: reviewArtifact.id,
          title: `Review follow-up: ${source.task.title}`,
          prompt: parsedReview.findings.map((finding) => `- ${finding}`).join('\n'),
          blocksTask: true,
          now: finishedAt,
        });
      }
      reviewerRun.status = RUN_STATUS.COMPLETED;
      reviewerRun.finishedAt = finishedAt;
      reviewerRun.summary = {
        adapter: input.providerEvidence.adapter,
        decisionCreated: Boolean(decisionInboxItem),
        executionMode: 'rework-reviewer',
        findingsCount: parsedReview.findings.length,
        mappedReviewStatus: parsedReview.verdict === 'pass' ? REVIEW_STATUS.PASSED : REVIEW_STATUS.CHANGES_REQUESTED,
        model: input.providerEvidence.model,
        mutationEvidenceDigest: input.mutationEvidenceDigest,
        nextStage: input.normalizedResult.nextStage,
        providerRunId: input.providerEvidence.providerRunId,
        rawVerdict: parsedReview.verdict,
        reviewArtifactId: reviewArtifact.id,
        sourceRunId: source.mutationRun.id,
        terminal: true,
      };
      byRole.reviewer.runRefs = appendUniqueRefs(byRole.reviewer.runRefs, [reviewerRun.id]);
      byRole.reviewer.artifactRefs = appendUniqueRefs(byRole.reviewer.artifactRefs, [reviewArtifact.id]);
      byRole.reviewer.completionRunId = reviewerRun.id;
      byRole.reviewer.reviewArtifactId = reviewArtifact.id;
      byRole.reviewer.completedAt = finishedAt;
      byRole.reviewer.updatedAt = finishedAt;
      executionPlan.runRefs = appendUniqueRefs(executionPlan.runRefs, [reviewerRun.id]);
      executionPlan.artifactRefs = appendUniqueRefs(executionPlan.artifactRefs, [reviewArtifact.id]);
      executionPlan.updatedAt = finishedAt;

      let checkpoint = null;
      if (parsedReview.verdict === 'pass') {
        byRole.reviewer.status = WORK_ORDER_STATUS.COMPLETED;
        byRole.qa.status = WORK_ORDER_STATUS.QUEUED;
        byRole.qa.updatedAt = finishedAt;
        executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
        executionPlan.activeWorkOrderId = byRole.qa.id;
        executionPlan.stopReason = 'separate-qa-execution-decision-required';
        executionPlan.stoppedAt = 'qa';
        checkpoint = appendWorkflowCheckpoint(state, source.bundle, WORKFLOW_CHECKPOINT_STAGE.QA_READY, {
          createdAt: finishedAt,
          resumedFromCheckpointId: executionPlan.latestCheckpointId,
          stopReason: 'reviewer-reexecution-passed-qa-ready',
        });
      } else {
        byRole.reviewer.status = WORK_ORDER_STATUS.CHANGES_REQUESTED;
        byRole.qa.status = WORK_ORDER_STATUS.BLOCKED_DEPENDENCY;
        byRole.qa.updatedAt = finishedAt;
        executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
        executionPlan.activeWorkOrderId = null;
        executionPlan.stopReason = 'reviewer-reexecution-changes-requested';
        executionPlan.stoppedAt = 'reviewer';
      }
      state.workOrderAttempts[reviewerAttempt.id] = transitionWorkOrderAttemptWithOpsGuard(
        state,
        reviewerAttempt,
        {
          status:
            parsedReview.verdict === 'pass'
              ? WORK_ORDER_ATTEMPT_STATUS.COMPLETED
              : WORK_ORDER_ATTEMPT_STATUS.CHANGES_REQUESTED,
          checkpointRef: checkpoint?.id || null,
          approvalRefs: [],
          runRefs: [reviewerRun.id],
          artifactRefs: [reviewArtifact.id],
          decisionInboxItemRefs: decisionInboxItem ? [decisionInboxItem.id] : [],
          stopReason:
            parsedReview.verdict === 'pass'
              ? null
              : 'reviewer-reexecution-changes-requested',
          completedAt: finishedAt,
        },
      );
      recalculateTaskFlags(source.task, state);
      source.task.updatedAt = finishedAt;
      store.saveState(state);
      return {
        reviewerReexecution: projectReviewerReexecution(
          {
            ...source,
            reexecutionAttempt: state.workOrderAttempts[reviewerAttempt.id],
            reexecutionReviewArtifact: reviewArtifact,
            reexecutionRun: reviewerRun,
          },
          input.requestDigest,
        ),
        reviewArtifact,
        reviewerRun,
        decisionInboxItem,
      };
    } catch (error) {
      for (const artifactPath of writtenArtifactPaths) fs.rmSync(artifactPath, { force: true });
      throw error;
    }
  }

  function failReviewerReexecution(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        'error\u0000mutationEvidenceDigest\u0000requestDigest\u0000reworkPlanId\u0000runId'
    ) {
      throw conflict('Reviewer re-execution failure has unexpected or missing fields');
    }
    const state = store.loadState();
    const source = assertActiveReviewerReexecution(state, input);
    const finishedAt = new Date(
      Math.max(Date.parse(builderReworkNowIso()), Date.parse(source.reviewerRun.startedAt)),
    ).toISOString();
    source.reviewerRun.status = RUN_STATUS.COMPLETED;
    source.reviewerRun.finishedAt = finishedAt;
    source.reviewerRun.summary = {
      error: String(input.error || 'reviewer-reexecution-failed').replace(/\s+/g, ' ').slice(0, 240),
      executionMode: 'rework-reviewer',
      mutationEvidenceDigest: input.mutationEvidenceDigest,
      requestDigest: input.requestDigest,
      sourceRunId: source.mutationRun.id,
    };
    source.byRole.reviewer.status = WORK_ORDER_STATUS.FAILED;
    source.byRole.reviewer.updatedAt = finishedAt;
    source.byRole.qa.status = WORK_ORDER_STATUS.BLOCKED_DEPENDENCY;
    source.byRole.qa.updatedAt = finishedAt;
    source.executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
    source.executionPlan.activeWorkOrderId = null;
    source.executionPlan.stopReason = 'reviewer-reexecution-failed';
    source.executionPlan.stoppedAt = 'reviewer';
    source.executionPlan.updatedAt = finishedAt;
    state.workOrderAttempts[source.reviewerAttempt.id] = transitionWorkOrderAttemptWithOpsGuard(
      state,
      source.reviewerAttempt,
      {
        status: WORK_ORDER_ATTEMPT_STATUS.FAILED,
        checkpointRef: null,
        approvalRefs: [],
        runRefs: [source.reviewerRun.id],
        artifactRefs: [],
        decisionInboxItemRefs: [],
        stopReason: 'reviewer-reexecution-failed',
        completedAt: finishedAt,
      },
    );
    source.task.updatedAt = finishedAt;
    store.saveState(state);
    return projectReviewerReexecution(
      { ...source, reexecutionAttempt: state.workOrderAttempts[source.reviewerAttempt.id] },
      input.requestDigest,
    );
  }

  function findReworkQaAttempt(state, executionPlanId, qaWorkOrderId) {
    return getPlanWorkOrderAttempts(state, executionPlanId).find(
      (attempt) =>
        attempt.workOrderId === qaWorkOrderId &&
        attempt.action === WORK_ORDER_ATTEMPT_ACTION.RUN_QA &&
        attempt.command === WORK_ORDER_ATTEMPT_COMMAND.STEP &&
        attempt.attemptNumber === 1,
    ) || null;
  }

  function buildReworkQaExecutionSource(state, reworkPlanId, options = {}) {
    const allowSourceDrift = options.allowSourceDrift === true;
    const reviewerSource = buildReviewerReexecutionSource(state, reworkPlanId, {
      durableReplay: allowSourceDrift,
    });
    const { executionPlan, byRole, project, reexecutionAttempt, reexecutionRun } = reviewerSource;
    const qaWorkOrder = byRole.qa;
    const qaReadyCheckpoint = reexecutionAttempt?.checkpointRef
      ? assertWorkflowCheckpoint(reexecutionAttempt.checkpointRef, state)
      : null;
    const qaAttempt = findReworkQaAttempt(state, executionPlan.id, qaWorkOrder.id);
    const qaRun = qaAttempt?.runRefs.length === 1
      ? assertRun(qaAttempt.runRefs[0], state)
      : null;
    const qaArtifact = qaAttempt?.artifactRefs.length === 1
      ? assertArtifact(qaAttempt.artifactRefs[0], state)
      : null;

    if (
      !reexecutionAttempt ||
      reexecutionAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.COMPLETED ||
      reexecutionAttempt.action !== WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER ||
      reexecutionAttempt.attemptNumber !== 2 ||
      !reexecutionRun ||
      reexecutionRun.status !== RUN_STATUS.COMPLETED ||
      reexecutionRun.metadata?.executionMode !== 'rework-reviewer' ||
      reexecutionRun.metadata?.workOrderAttemptId !== reexecutionAttempt.id ||
      reexecutionRun.summary?.rawVerdict !== 'pass' ||
      !reviewerSource.reexecutionReviewArtifact ||
      reviewerSource.reexecutionReviewArtifact.type !== ARTIFACT_TYPE.REVIEW ||
      reviewerSource.reexecutionReviewArtifact.runId !== reexecutionRun.id ||
      !qaReadyCheckpoint ||
      qaReadyCheckpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.QA_READY
    ) {
      throw conflict('Rework QA execution requires exact DEC-206 Reviewer pass evidence');
    }

    let currentTargets = null;
    try {
      currentTargets = readBoundedBuilderReworkSourceTargets(
        project.projectPath,
        reviewerSource.reworkPlan.targetPathAllowlist,
      );
    } catch (error) {
      if (!allowSourceDrift) throw error;
    }
    const expectedTargetDigests = reviewerSource.mutationRun.summary?.targetFilePostMutationDigests;
    if (
      !allowSourceDrift &&
      (
        !Array.isArray(expectedTargetDigests) ||
        expectedTargetDigests.length !== currentTargets.length ||
        currentTargets.some(
          (entry, index) =>
            entry.path !== expectedTargetDigests[index]?.path ||
            entry.digest !== expectedTargetDigests[index]?.digest,
        )
      )
    ) {
      throw conflict('Rework QA execution sources no longer match DEC-203 mutation evidence');
    }

    const reviewerEvidenceDigest = computeReviewerEvidenceDigest({
      reviewerAttempt: reexecutionAttempt,
      reviewerRun: reexecutionRun,
      reviewArtifact: reviewerSource.reexecutionReviewArtifact,
      reviewArtifactBytes: readReexecutionArtifactBytes(reviewerSource.reexecutionReviewArtifact),
      mutationEvidenceDigest: reviewerSource.mutationEvidenceDigest,
      qaReadyCheckpoint,
    });
    const qaWorkOrderAtStart = qaAttempt
      ? qaRun?.metadata?.qaWorkOrderAtStart
      : qaWorkOrder;
    if (!qaWorkOrderAtStart || typeof qaWorkOrderAtStart !== 'object') {
      throw conflict('Rework QA execution is missing its durable QA WorkOrder source');
    }
    const computedQaInputDigest = !allowSourceDrift && currentTargets
      ? computeQaInputDigest({
          builderRunId: reviewerSource.mutationRun.id,
          reviewerRunId: reexecutionRun.id,
          qaWorkOrder: qaWorkOrderAtStart,
          changedFiles: reviewerSource.mutationRun.summary?.changedFiles || [],
          targetPathAllowlist: reviewerSource.reworkPlan.targetPathAllowlist,
          verificationCommands: reviewerSource.reworkPlan.verificationCommands,
          targetFileDigests: currentTargets.map((entry) => ({
            path: entry.path,
            digest: entry.digest,
          })),
        })
      : null;
    const qaInputDigest = qaRun?.metadata?.qaInputDigest || computedQaInputDigest;
    const qaWorkOrderDigest = qaRun?.metadata?.qaWorkOrderDigest ||
      computeWorkOrderRecordDigest(qaWorkOrder);
    const durableRequestDigest = qaRun
      ? computeReworkQaExecutionRequestDigest(qaRun.metadata?.request)
      : null;
    const workerInputDigest = qaRun?.metadata?.workerInputDigest ||
      (currentTargets
        ? digestSpecialistInputPathDigests(
            currentTargets.map((entry) => ({
              path: entry.path,
              sha256: entry.digest,
              byteLength: entry.bytes.length,
            })),
          )
        : null);
    if (
      !/^[a-f0-9]{64}$/.test(qaInputDigest || '') ||
      !/^[a-f0-9]{64}$/.test(qaWorkOrderDigest || '') ||
      !/^[a-f0-9]{64}$/.test(workerInputDigest || '') ||
      computeWorkOrderRecordDigest(qaWorkOrderAtStart) !== qaWorkOrderDigest ||
      (qaRun && durableRequestDigest !== qaRun.metadata?.requestDigest) ||
      (computedQaInputDigest && qaInputDigest !== computedQaInputDigest)
    ) {
      throw conflict('Rework QA execution has invalid durable QA input evidence');
    }

    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
      executionPlan.workOrderIds.length !== 3 ||
      byRole.builder.position !== 1 ||
      byRole.reviewer.position !== 2 ||
      qaWorkOrder.position !== 3 ||
      byRole.reviewer.dependencyIds.length !== 1 ||
      byRole.reviewer.dependencyIds[0] !== byRole.builder.id ||
      qaWorkOrder.dependencyIds.length !== 1 ||
      qaWorkOrder.dependencyIds[0] !== byRole.reviewer.id ||
      qaAttempt && qaAttempt.workOrderId !== qaWorkOrder.id ||
      (qaAttempt && qaRun?.metadata?.workOrderAttemptId !== qaAttempt.id) ||
      (qaAttempt && qaAttempt.runRefs.length !== 1) ||
      (qaAttempt && qaAttempt.artifactRefs.length > 1) ||
      (qaAttempt && ![WORK_ORDER_ATTEMPT_STATUS.ACTIVE, WORK_ORDER_ATTEMPT_STATUS.COMPLETED, WORK_ORDER_ATTEMPT_STATUS.FAILED].includes(qaAttempt.status))
    ) {
      throw conflict('Rework QA execution source evidence is stale or widened');
    }

    return {
      ...reviewerSource,
      currentTargets,
      qaArtifact,
      qaAttempt,
      qaInputDigest,
      qaReadyCheckpoint,
      qaRun,
      qaWorkOrder,
      qaWorkOrderDigest,
      reviewerEvidenceDigest,
      workerInputDigest,
    };
  }

  function assertReworkQaRequestMatchesSource(request, source) {
    const expected = {
      reviewerReexecutionAttemptId: source.reexecutionAttempt.id,
      reviewerReexecutionAttemptRecordDigest: source.reexecutionAttempt.recordDigest,
      reviewerRunId: source.reexecutionRun.id,
      reviewerEvidenceDigest: source.reviewerEvidenceDigest,
      mutationEvidenceDigest: source.mutationEvidenceDigest,
      qaWorkOrderId: source.qaWorkOrder.id,
      qaWorkOrderDigest: source.qaWorkOrderDigest,
      qaReadyCheckpointId: source.qaReadyCheckpoint.id,
      checkpointDigest: source.qaReadyCheckpoint.checkpointDigest,
      inputDigest: source.qaReadyCheckpoint.inputDigest,
      authorityDigest: source.qaReadyCheckpoint.authorityDigest,
      sourceDigest: source.executionPlan.sourceDigest,
      qaInputDigest: source.qaInputDigest,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (request[field] !== value) {
        throw conflict(`Rework QA execution ${field} does not match source evidence`);
      }
    }
  }

  function projectReworkQaExecution(source, requestDigest = null) {
    const attempt = source.qaAttempt;
    const status = !attempt
      ? 'ready'
      : attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE
        ? 'running'
        : attempt.status;
    const requestSource = !attempt
      ? buildPreConsumeQaReadyProjection(source)
      : null;
    const terminalCheckpoint =
      attempt?.status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED &&
      (
        source.terminalCheckpoint ||
        source.bundle.latestCheckpoint?.stage === WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY
      )
        ? source.terminalCheckpoint || source.bundle.latestCheckpoint
        : null;
    return deepFreezeReworkQaExecution({
      reworkPlanId: source.reworkPlan.id,
      persisted: Boolean(attempt),
      status,
      requestDigest,
      requestSource,
      reviewerEvidenceDigest: source.reviewerEvidenceDigest,
      mutationEvidenceDigest: source.mutationEvidenceDigest,
      qaInputDigest: source.qaInputDigest,
      qaWorkOrder: structuredClone(source.qaWorkOrder),
      workOrderAttempt: attempt ? structuredClone(attempt) : null,
      qaRun: source.qaRun ? structuredClone(source.qaRun) : null,
      qaArtifact: source.qaArtifact ? structuredClone(source.qaArtifact) : null,
      terminalCheckpoint: terminalCheckpoint
        ? structuredClone(terminalCheckpoint)
        : null,
      sourceDigest: source.executionPlan.sourceDigest,
      changedFiles: [...(source.mutationRun.summary?.changedFiles || [])],
      targetPathAllowlist: [...source.reworkPlan.targetPathAllowlist],
      verificationCommands: [...source.reworkPlan.verificationCommands],
      sourceDigests: source.currentTargets.map((entry) => ({
        path: entry.path,
        digest: entry.digest,
      })),
      nextGate:
        attempt?.status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED
          ? 'separate-delivery-package-decision-required'
          : attempt?.status === WORK_ORDER_ATTEMPT_STATUS.FAILED
            ? 'no-qa-retry-authority'
            : attempt?.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE
              ? 'separate-recovery-decision-required'
              : 'run-rework-qa-once',
      blockedActions: [
        'generic-qa-step',
        'retry',
        'recovery',
        'delivery-package',
        'mission-close-out',
        'commit',
        'push',
        'release',
      ],
    });
  }

  function beginReworkQaExecution(input) {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !== 'request\u0000reworkPlanId'
    ) {
      throw conflict('Rework QA execution start has unexpected or missing fields');
    }
    const now = builderReworkNowIso();
    const request = normalizeReworkQaExecutionRequest(input.request, { now });
    const requestDigest = computeReworkQaExecutionRequestDigest(request);
    const state = store.loadStateSupportedReadonly();
    const source = buildReworkQaExecutionSource(state, input.reworkPlanId);

    if (source.qaAttempt) {
      assertReworkQaRequestMatchesSource(request, source);
      const exactReplay = source.qaRun && isExactReworkQaExecutionReplay(
        source.qaRun,
        requestDigest,
        source,
      );
      if (!exactReplay) {
        throw conflict(`ReworkPlan ${input.reworkPlanId} already has a divergent QA execution`);
      }
      return {
        idempotent: true,
        reworkQaExecution: projectReworkQaExecution(source, requestDigest),
      };
    }

    assertReworkQaRequestMatchesSource(request, source);
    if (
      listPendingBlockingDecisionItems(source.task.id, state).length > 0 ||
      source.executionPlan.status !== EXECUTION_PLAN_STATUS.REVIEWING ||
      source.executionPlan.activeWorkOrderId !== source.qaWorkOrder.id ||
      source.executionPlan.stopReason !== 'separate-qa-execution-decision-required' ||
      source.executionPlan.stoppedAt !== 'qa' ||
      source.byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      source.byRole.reviewer.status !== WORK_ORDER_STATUS.COMPLETED ||
      source.qaWorkOrder.status !== WORK_ORDER_STATUS.QUEUED ||
      source.qaReadyCheckpoint.status !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      source.qaReadyCheckpoint.stopReason !== 'reviewer-reexecution-passed-qa-ready' ||
      source.qaReadyCheckpoint.nextAllowedActions.length !== 0
    ) {
      throw conflict('Rework QA execution is not at the exact actionless QA_READY stop');
    }

    const startedAt = new Date(
      Math.max(Date.parse(now), Date.parse(request.evaluatedAt), Date.parse(source.reexecutionRun.finishedAt)),
    ).toISOString();
    const qaDependencies = source.qaWorkOrder.dependencyIds.map((dependencyId) => {
      const dependency = assertWorkOrder(dependencyId, state);
      return { id: dependency.id, status: dependency.status };
    });
    const authorityDigest = computeWorkOrderAttemptAuthorityDigest({
      executionPlanId: source.executionPlan.id,
      expectedWorkOrderId: source.qaWorkOrder.id,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.RUN_QA,
      sourceDigest: source.executionPlan.sourceDigest,
      checkpointRef: source.qaReadyCheckpoint.id,
      checkpointDigest: source.qaReadyCheckpoint.checkpointDigest,
      approvalRefs: [],
    });
    const attempt = createWorkOrderAttempt({
      id: nextWorkOrderAttemptId(state),
      executionPlanId: source.executionPlan.id,
      workOrderId: source.qaWorkOrder.id,
      missionId: source.mission.id,
      projectId: source.executionPlan.projectId,
      staffingPlanId: source.reexecutionAttempt.staffingPlanId,
      staffingEntryId: source.reexecutionAttempt.staffingEntryId,
      councilSessionId: source.councilSession.id,
      role: 'qa',
      position: source.qaWorkOrder.position,
      attemptNumber: 1,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.RUN_QA,
      sourceDigest: source.executionPlan.sourceDigest,
      workOrderDigest: computeWorkOrderRecordDigest(source.qaWorkOrder),
      dependencyDigest: computeWorkOrderAttemptDependencyDigest({
        executionPlanId: source.executionPlan.id,
        workOrderId: source.qaWorkOrder.id,
        dependencies: qaDependencies,
      }),
      authorityDigest,
      checkpointRef: source.qaReadyCheckpoint.id,
      approvalRefs: [],
      startedAt,
    });
    const runId = nextId(state, 'run');
    const run = {
      id: runId,
      taskId: source.task.id,
      kind: 'verification',
      role: 'qa',
      status: RUN_STATUS.RUNNING,
      metadata: {
        authorityDigest: source.qaReadyCheckpoint.authorityDigest,
        checkpointDigest: source.qaReadyCheckpoint.checkpointDigest,
        executionMode: 'rework-qa-node-check',
        inputDigest: source.qaReadyCheckpoint.inputDigest,
        mutationEvidenceDigest: source.mutationEvidenceDigest,
        qaInputDigest: source.qaInputDigest,
        qaWorkOrderAtStart: structuredClone(source.qaWorkOrder),
        qaWorkOrderDigest: computeWorkOrderRecordDigest(source.qaWorkOrder),
        qaWorkOrderId: source.qaWorkOrder.id,
        request: structuredClone(request),
        requestDigest,
        reviewerEvidenceDigest: source.reviewerEvidenceDigest,
        reviewerReexecutionAttemptId: source.reexecutionAttempt.id,
        reviewerReexecutionAttemptRecordDigest: source.reexecutionAttempt.recordDigest,
        reviewerRunId: source.reexecutionRun.id,
        reworkPlanId: source.reworkPlan.id,
        sourceDigest: source.executionPlan.sourceDigest,
        workerInputDigest: source.workerInputDigest,
        workOrderAttemptId: attempt.id,
      },
      summary: null,
      startedAt,
      finishedAt: null,
      logPath: path.join(store.logsDir, `${runId}.jsonl`),
    };
    const activeAttempt = { ...attempt, runRefs: [run.id] };
    delete activeAttempt.recordDigest;
    activeAttempt.recordDigest = computeWorkOrderAttemptRecordDigest(activeAttempt);
    consumeLatestCheckpoint(
      state,
      source.executionPlan,
      WORKFLOW_CHECKPOINT_STAGE.QA_READY,
      'rework-qa-execution-started',
    );
    source.qaWorkOrder.status = WORK_ORDER_STATUS.ACTIVE;
    source.qaWorkOrder.startedAt ||= startedAt;
    source.qaWorkOrder.updatedAt = startedAt;
    source.executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
    source.executionPlan.activeWorkOrderId = source.qaWorkOrder.id;
    source.executionPlan.stopReason = null;
    source.executionPlan.stoppedAt = null;
    source.executionPlan.updatedAt = startedAt;
    state.runs[run.id] = run;
    state.workOrderAttempts[activeAttempt.id] = activeAttempt;
    source.task.latestRunId = run.id;
    source.task.updatedAt = startedAt;
    store.saveState(state);

    return {
      idempotent: false,
      reworkQaExecution: projectReworkQaExecution(
        { ...source, qaAttempt: activeAttempt, qaRun: run },
        requestDigest,
      ),
    };
  }

  function getReworkQaExecutionWorkerInput(input) {
    if (!input || Object.keys(input).sort().join('\u0000') !== 'requestDigest\u0000reworkPlanId') {
      throw conflict('Rework QA execution worker input has unexpected or missing fields');
    }
    const state = store.loadStateReadonly();
    const source = buildReworkQaExecutionSource(state, input.reworkPlanId);
    if (
      !source.qaAttempt ||
      source.qaAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !source.qaRun ||
      source.qaRun.status !== RUN_STATUS.RUNNING ||
      !isExactReworkQaExecutionReplay(source.qaRun, input.requestDigest, source)
    ) {
      throw conflict('Rework QA execution has no exact active worker state');
    }
    return {
      ...source,
      requestDigest: input.requestDigest,
      inputPathDigests: source.currentTargets.map((entry) => ({
        path: entry.path,
        sha256: entry.digest,
        byteLength: entry.bytes.length,
      })),
    };
  }

  function assertActiveReworkQaExecution(state, input, options = {}) {
    const source = buildReworkQaExecutionSource(state, input.reworkPlanId, options);
    if (
      !source.qaAttempt ||
      source.qaAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      !source.qaRun ||
      source.qaRun.id !== input.runId ||
      source.qaRun.status !== RUN_STATUS.RUNNING ||
      !isExactReworkQaExecutionReplay(source.qaRun, input.requestDigest, source)
    ) {
      throw conflict('Rework QA execution Run is not the exact active evidence');
    }
    return source;
  }

  function assertReworkQaWorkerResult(source, result) {
    const summary = result?.resultSummary;
    const expectedPaths = source.reworkPlan.verificationCommands
      .map((command) => command.slice('node --check '.length))
      .sort();
    const checks = summary?.checks;
    if (
      result?.observedInputDigest !== source.workerInputDigest ||
      summary?.kind !== 'node-syntax-check' ||
      summary?.mutationDetected !== false ||
      !['passed', 'failed'].includes(summary?.verdict) ||
      !Array.isArray(checks) ||
      checks.length !== expectedPaths.length ||
      checks.some(
        (check) =>
          !check ||
          typeof check.relativePath !== 'string' ||
          !expectedPaths.includes(check.relativePath) ||
          !Array.isArray(check.argv) ||
          check.argv.length !== 3 ||
          check.argv[0] !== process.execPath ||
          check.argv[1] !== '--check' ||
          check.argv[2] !== '-' ||
          typeof check.passed !== 'boolean' ||
          typeof check.timedOut !== 'boolean' ||
          typeof check.truncated !== 'boolean' ||
          !(Number.isInteger(check.exitCode) || check.exitCode === null) ||
          !/^[a-f0-9]{64}$/.test(check.stdoutDigest || '') ||
          !/^[a-f0-9]{64}$/.test(check.stderrDigest || ''),
      ) ||
      new Set(checks.map((check) => check.relativePath)).size !== checks.length ||
      checks.map((check) => check.relativePath).sort().some((path, index) => path !== expectedPaths[index]) ||
      (summary.verdict === 'passed' && !checks.every((check) => check.passed)) ||
      (summary.verdict === 'failed' && checks.every((check) => check.passed))
    ) {
      throw conflict('Rework QA execution worker result is not exact source-bound evidence');
    }
  }

  function settleReworkQaExecution(input, options = {}) {
    const state = store.loadState();
    const source = assertActiveReworkQaExecution(state, input, {
      allowSourceDrift: options.allowSourceDrift === true,
    });
    const finishedAt = new Date(
      Math.max(Date.parse(builderReworkNowIso()), Date.parse(source.qaRun.startedAt)),
    ).toISOString();
    const result = input.result;
    if (!result || typeof result !== 'object' || !result.resultSummary) {
      throw conflict('Rework QA execution result is invalid');
    }
    if (options.workerFailure === true) {
      if (
        result.observedInputDigest !== source.workerInputDigest ||
        result.resultSummary.kind !== 'node-syntax-check' ||
        result.resultSummary.mutationDetected !== false ||
        result.resultSummary.verdict !== 'failed' ||
        !Array.isArray(result.resultSummary.checks) ||
        result.resultSummary.checks.length !== 0
      ) {
        throw conflict('Rework QA execution failure evidence is invalid');
      }
    } else {
      assertReworkQaWorkerResult(source, result);
    }
    const passed = result.resultSummary.verdict === 'passed';
    const evidence = {
      schemaVersion: 1,
      executionMode: 'rework-qa-node-check',
      requestDigest: input.requestDigest,
      reviewerEvidenceDigest: source.reviewerEvidenceDigest,
      mutationEvidenceDigest: source.mutationEvidenceDigest,
      qaInputDigest: source.qaInputDigest,
      expectedInputDigest: source.workerInputDigest,
      observedInputDigest: result.observedInputDigest,
      result: result.resultSummary,
      createdAt: finishedAt,
    };
    let writtenArtifactPaths = [];
    try {
      const artifactBundle = recordArtifactBundleInState(state, {
        taskId: source.task.id,
        runId: source.qaRun.id,
        artifacts: [{ key: 'qaEvidence', type: ARTIFACT_TYPE.QA_EVIDENCE, extension: 'json', content: `${JSON.stringify(evidence, null, 2)}\n` }],
      });
      writtenArtifactPaths = artifactBundle.writtenArtifactPaths;
      const qaArtifact = artifactBundle.artifactsByKey.qaEvidence;
      source.qaRun.status = RUN_STATUS.COMPLETED;
      source.qaRun.finishedAt = finishedAt;
      source.qaRun.summary = {
        executionMode: 'rework-qa-node-check',
        mutationEvidenceDigest: source.mutationEvidenceDigest,
        qaEvidenceArtifactId: qaArtifact.id,
        qaInputDigest: source.qaInputDigest,
        expectedInputDigest: source.workerInputDigest,
        observedInputDigest: result.observedInputDigest,
        mutationDetected: result.resultSummary.mutationDetected,
        requestDigest: input.requestDigest,
        reviewerEvidenceDigest: source.reviewerEvidenceDigest,
        resultSummary: result.resultSummary,
        terminal: true,
        verdict: result.resultSummary.verdict,
      };
      source.qaWorkOrder.runRefs = appendUniqueRefs(source.qaWorkOrder.runRefs, [source.qaRun.id]);
      source.qaWorkOrder.artifactRefs = appendUniqueRefs(source.qaWorkOrder.artifactRefs, [qaArtifact.id]);
      source.executionPlan.runRefs = appendUniqueRefs(source.executionPlan.runRefs, [source.qaRun.id]);
      source.executionPlan.artifactRefs = appendUniqueRefs(source.executionPlan.artifactRefs, [qaArtifact.id]);
      source.qaWorkOrder.updatedAt = finishedAt;
      source.executionPlan.updatedAt = finishedAt;
      let checkpoint = null;
      if (passed) {
        source.qaWorkOrder.status = WORK_ORDER_STATUS.COMPLETED;
        source.qaWorkOrder.completionRunId = source.qaRun.id;
        source.qaWorkOrder.completedAt = finishedAt;
        source.executionPlan.status = EXECUTION_PLAN_STATUS.DELIVERY_READY;
        source.executionPlan.activeWorkOrderId = null;
        source.executionPlan.stopReason = 'separate-delivery-package-decision-required';
        source.executionPlan.stoppedAt = 'delivery';
        source.executionPlan.deliveryReadyAt = finishedAt;
        checkpoint = appendWorkflowCheckpoint(
          state,
          source.bundle,
          WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY,
          {
            createdAt: finishedAt,
            resumedFromCheckpointId: source.qaReadyCheckpoint.id,
            stopReason: 'rework-qa-passed-delivery-ready',
          },
        );
      } else {
        source.qaWorkOrder.status = WORK_ORDER_STATUS.FAILED;
        source.executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
        source.executionPlan.activeWorkOrderId = null;
        source.executionPlan.stopReason = 'rework-qa-failed-no-retry-authority';
        source.executionPlan.stoppedAt = 'qa';
      }
      state.workOrderAttempts[source.qaAttempt.id] = transitionWorkOrderAttemptWithOpsGuard(
        state,
        source.qaAttempt,
        {
          status: passed ? WORK_ORDER_ATTEMPT_STATUS.COMPLETED : WORK_ORDER_ATTEMPT_STATUS.FAILED,
          checkpointRef: checkpoint?.id || null,
          approvalRefs: [],
          runRefs: [source.qaRun.id],
          artifactRefs: [qaArtifact.id],
          decisionInboxItemRefs: [],
          stopReason: passed ? null : 'rework-qa-failed-no-retry-authority',
          completedAt: finishedAt,
        },
      );
      source.task.updatedAt = finishedAt;
      store.saveState(state);
      return projectReworkQaExecution(
        {
          ...source,
          qaArtifact,
          qaAttempt: state.workOrderAttempts[source.qaAttempt.id],
          qaRun: source.qaRun,
          terminalCheckpoint: checkpoint,
        },
        input.requestDigest,
      );
    } catch (error) {
      for (const artifactPath of writtenArtifactPaths) fs.rmSync(artifactPath, { force: true });
      throw error;
    }
  }

  function completeReworkQaExecution(input) {
    if (!input || Object.keys(input).sort().join('\u0000') !== 'requestDigest\u0000result\u0000reworkPlanId\u0000runId') {
      throw conflict('Rework QA execution settlement has unexpected or missing fields');
    }
    return settleReworkQaExecution(input);
  }

  function failReworkQaExecution(input) {
    if (!input || Object.keys(input).sort().join('\u0000') !== 'error\u0000requestDigest\u0000reworkPlanId\u0000runId') {
      throw conflict('Rework QA execution failure has unexpected or missing fields');
    }
    const state = store.loadStateReadonly();
    const source = assertActiveReworkQaExecution(state, input, {
      allowSourceDrift: true,
    });
    return settleReworkQaExecution({
      ...input,
      result: {
        observedInputDigest: source.workerInputDigest,
        resultSummary: {
          kind: 'node-syntax-check',
          checks: [],
          mutationDetected: false,
          reasons: [String(input.error || 'rework-qa-worker-failed').slice(0, 240)],
          verdict: 'failed',
        },
      },
    }, {
      allowSourceDrift: true,
      workerFailure: true,
    });
  }

  function getReworkQaExecution(reworkPlanId) {
    const state = store.loadStateSupportedReadonly();
    const source = buildReworkQaExecutionSource(state, reworkPlanId);
    return projectReworkQaExecution(source, source.qaRun?.metadata?.requestDigest || null);
  }

  function previewReworkDeliveryPackage(input) {
    const state = store.loadStateSupportedReadonly();
    const source = buildReworkQaExecutionSource(state, input?.reworkPlanId);
    const terminalCheckpoint = source.bundle.latestCheckpoint;
    const builderReworkApproval =
      source.builderAttempt.approvalRefs.length === 1
        ? assertApproval(source.builderAttempt.approvalRefs[0], state)
        : null;
    const unresolvedItems = listPendingBlockingDecisionItems(source.task.id, state)
      .map((item) => item.id);
    let qaEvidence;
    let qaArtifactBytes;
    try {
      qaArtifactBytes = readReexecutionArtifactBytes(source.qaArtifact);
      qaEvidence = JSON.parse(qaArtifactBytes.toString('utf8'));
    } catch (error) {
      throw conflict(
        `Rework DeliveryPackage QA Artifact cannot be read: ${error.message}`,
      );
    }
    const hasDownstreamRecords =
      source.bundle.deliveryPackages.length !== 0 ||
      source.bundle.deliveryPackageAcceptances.length !== 0 ||
      source.bundle.missionCloseOuts.length !== 0 ||
      source.executionPlan.deliveryPackageRefs.length !== 0 ||
      Boolean(source.executionPlan.latestDeliveryPackageId);
    if (
      !terminalCheckpoint ||
      !builderReworkApproval ||
      hasDownstreamRecords
    ) {
      throw conflict(
        'Rework DeliveryPackage preview refuses downstream or incomplete evidence',
      );
    }
    return buildReworkDeliveryPackagePreview(
      input,
      {
        schemaVersion: 24,
        reworkPlan: source.reworkPlan,
        reworkPlanAcceptance: source.acceptance,
        builderReworkDispatch: source.dispatch,
        builderReworkApproval,
        builderMutationAttempt: source.builderAttempt,
        builderMutationRun: source.mutationRun,
        builderMutationArtifacts: source.mutationArtifacts.map((record) => ({
          record,
          bytes: readReexecutionArtifactBytes(record),
        })),
        reviewerAttempt: source.reexecutionAttempt,
        reviewerRun: source.reexecutionRun,
        reviewArtifact: {
          record: source.reexecutionReviewArtifact,
          bytes: readReexecutionArtifactBytes(source.reexecutionReviewArtifact),
        },
        qaAttempt: source.qaAttempt,
        qaRun: source.qaRun,
        qaArtifact: {
          record: source.qaArtifact,
          bytes: qaArtifactBytes,
        },
        qaEvidence,
        qaReadyCheckpoint: source.qaReadyCheckpoint,
        deliveryReadyCheckpoint: terminalCheckpoint,
        currentTargetFileDigests: source.currentTargets.map(
          ({ path: targetFilePath, digest }) => ({
            path: targetFilePath,
            digest,
          }),
        ),
        mutationEvidenceDigest: source.mutationEvidenceDigest,
        reviewerEvidenceDigest: source.reviewerEvidenceDigest,
        qaInputDigest: source.qaInputDigest,
        executionPlan: source.executionPlan,
        mission: source.mission,
        task: source.task,
        qaWorkOrder: source.qaWorkOrder,
        workOrders: source.bundle.workOrders,
        workOrderAttempts: source.bundle.workOrderAttempts,
        unresolvedItems,
        hasDownstreamRecords,
      },
      { now: builderReworkNowIso() },
    );
  }

  function findReworkDeliveryPackageCollision(state, request) {
    return (
      Object.values(state.reworkDeliveryPackages || {}).find(
        (record) =>
          record.reworkPlanId === request.reworkPlanId ||
          record.qaWorkOrderAttemptId === request.qaWorkOrderAttemptId ||
          record.previewId === request.previewId ||
          record.reworkDeliveryEvidenceDigest ===
            request.reworkDeliveryEvidenceDigest,
      ) || null
    );
  }

  function persistReworkDeliveryPackage(input) {
    const now = reviewerReworkNowIso();
    let request;
    try {
      request = normalizeReworkDeliveryPackageRequest(input, { now });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkDeliveryPackage requires supported state: ${error.message}`,
      );
    }

    const existing = findReworkDeliveryPackageCollision(state, request);
    if (existing) {
      assertReworkDeliveryPackageRecord(existing);
      const attempt =
        state.workOrderAttempts[existing.qaWorkOrderAttemptId];
      if (
        !attempt ||
        attempt.recordDigest !== request.qaWorkOrderAttemptRecordDigest ||
        !isExactReworkDeliveryPackageReplay(existing, request)
      ) {
        throw conflict(
          'ReworkPlan delivery lineage already has a different ReworkDeliveryPackage',
        );
      }
      return {
        idempotent: true,
        reworkDeliveryPackage: existing,
      };
    }

    const preview = previewReworkDeliveryPackage({
      reworkPlanId: request.reworkPlanId,
      qaWorkOrderAttemptId: request.qaWorkOrderAttemptId,
      qaWorkOrderAttemptRecordDigest:
        request.qaWorkOrderAttemptRecordDigest,
      qaRunId: request.qaRunId,
      qaEvidenceArtifactId: request.qaEvidenceArtifactId,
      deliveryReadyCheckpointId: request.deliveryReadyCheckpointId,
      checkpointDigest: request.checkpointDigest,
      sourceDigest: request.sourceDigest,
      qaInputDigest: request.qaInputDigest,
      evaluatedAt: request.evaluatedAt,
    });
    if (
      request.previewId !== preview.id ||
      request.previewDigest !== preview.previewDigest ||
      request.reworkDeliveryEvidenceDigest !==
        preview.reworkDeliveryEvidenceDigest
    ) {
      throw conflict(
        'ReworkDeliveryPackage preview or evidence digest is stale',
      );
    }

    const prospectiveId = `rework-delivery-package-${String(
      state.sequences.reworkDeliveryPackage + 1,
    ).padStart(4, '0')}`;
    const reworkDeliveryPackage = createReworkDeliveryPackage(
      {
        id: prospectiveId,
        preview,
        recordApproval: request.recordApproval,
      },
      { now },
    );
    const id = nextReworkDeliveryPackageId(state);
    if (id !== reworkDeliveryPackage.id) {
      throw new Error('ReworkDeliveryPackage sequence is not deterministic');
    }
    state.reworkDeliveryPackages[id] = reworkDeliveryPackage;
    store.saveState(state);
    return {
      idempotent: false,
      reworkDeliveryPackage,
    };
  }

  function getReworkDeliveryPackage(reworkDeliveryPackageId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkDeliveryPackage inspection requires supported state: ${error.message}`,
      );
    }
    try {
      const reworkDeliveryPackage = assertReworkDeliveryPackage(
        reworkDeliveryPackageId,
        state,
      );
      assertReworkDeliveryPackageRecord(reworkDeliveryPackage);
      return { reworkDeliveryPackage };
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getReworkPlanDeliveryPackage(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkDeliveryPackage inspection requires supported state: ${error.message}`,
      );
    }
    if (!state.reworkPlans?.[reworkPlanId]) {
      throw reviewerReworkNotFound('ReworkPlan not found');
    }
    const reworkDeliveryPackage = Object.values(
      state.reworkDeliveryPackages || {},
    ).find((record) => record.reworkPlanId === reworkPlanId);
    if (!reworkDeliveryPackage) {
      throw reviewerReworkNotFound(
        'ReworkDeliveryPackage not found for ReworkPlan',
      );
    }
    assertReworkDeliveryPackageRecord(reworkDeliveryPackage);
    return { reworkDeliveryPackage };
  }

  function assertAcceptanceRequestPackageBinding(state, source, request) {
    const attempt = state.workOrderAttempts[source.qaWorkOrderAttemptId];
    if (
      source.reworkPlanId !== request.reworkPlanId ||
      source.qaWorkOrderAttemptId !== request.qaWorkOrderAttemptId ||
      !attempt ||
      attempt.recordDigest !== request.qaWorkOrderAttemptRecordDigest ||
      source.qaRunId !== request.qaRunId ||
      source.qaEvidenceArtifactId !== request.qaEvidenceArtifactId ||
      source.terminalCheckpointId !== request.deliveryReadyCheckpointId ||
      source.terminalCheckpointDigest !== request.checkpointDigest ||
      source.sourceDigest !== request.sourceDigest ||
      source.qaInputDigest !== request.qaInputDigest ||
      source.previewEvaluatedAt !== request.evaluatedAt ||
      source.previewId !== request.previewId ||
      source.previewDigest !== request.previewDigest ||
      source.reworkDeliveryEvidenceDigest !==
        request.reworkDeliveryEvidenceDigest ||
      source.recordDigest !== request.reworkDeliveryPackageRecordDigest
    ) {
      throw conflict(
        'ReworkDeliveryPackageAcceptance request is not bound to the exact immutable package',
      );
    }
  }

  function findReworkDeliveryPackageAcceptanceCollision(state, source) {
    return (
      Object.values(state.reworkDeliveryPackageAcceptances || {}).find(
        (record) =>
          record.reworkDeliveryPackageId === source.id ||
          record.reworkPlanId === source.reworkPlanId ||
          record.previewId === source.previewId ||
          record.reworkDeliveryEvidenceDigest ===
            source.reworkDeliveryEvidenceDigest,
      ) || null
    );
  }

  function acceptReworkDeliveryPackage(reworkDeliveryPackageId, input) {
    const now = reviewerReworkNowIso();
    let request;
    try {
      request = normalizeReworkDeliveryPackageAcceptanceRequest(input, {
        now,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkDeliveryPackageAcceptance requires supported state: ${error.message}`,
      );
    }

    let source;
    try {
      source = assertReworkDeliveryPackage(reworkDeliveryPackageId, state);
      assertReworkDeliveryPackageRecord(source);
      assertAcceptanceRequestPackageBinding(state, source, request);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }

    const existing = findReworkDeliveryPackageAcceptanceCollision(
      state,
      source,
    );
    if (existing) {
      assertReworkDeliveryPackageAcceptanceRecord(existing);
      if (
        existing.reworkDeliveryPackageId !== source.id ||
        !isExactReworkDeliveryPackageAcceptanceReplay(
          existing,
          source,
          request,
        )
      ) {
        throw conflict(
          'Rework DeliveryPackage lineage already has a different acceptance',
        );
      }
      return {
        idempotent: true,
        reworkDeliveryPackage: source,
        reworkDeliveryPackageAcceptance: existing,
        reviewStatus: 'accepted',
      };
    }

    const preview = previewReworkDeliveryPackage({
      reworkPlanId: request.reworkPlanId,
      qaWorkOrderAttemptId: request.qaWorkOrderAttemptId,
      qaWorkOrderAttemptRecordDigest:
        request.qaWorkOrderAttemptRecordDigest,
      qaRunId: request.qaRunId,
      qaEvidenceArtifactId: request.qaEvidenceArtifactId,
      deliveryReadyCheckpointId: request.deliveryReadyCheckpointId,
      checkpointDigest: request.checkpointDigest,
      sourceDigest: request.sourceDigest,
      qaInputDigest: request.qaInputDigest,
      evaluatedAt: request.evaluatedAt,
    });
    if (
      preview.id !== source.previewId ||
      preview.previewDigest !== source.previewDigest ||
      preview.reworkDeliveryEvidenceDigest !==
        source.reworkDeliveryEvidenceDigest
    ) {
      throw conflict(
        'ReworkDeliveryPackage is no longer source-current for acceptance',
      );
    }

    const prospectiveId =
      `rework-delivery-package-acceptance-${String(
        state.sequences.reworkDeliveryPackageAcceptance + 1,
      ).padStart(4, '0')}`;
    const acceptance = createReworkDeliveryPackageAcceptance({
      id: prospectiveId,
      reworkDeliveryPackage: source,
      createdAt: now,
    });
    const id = nextReworkDeliveryPackageAcceptanceId(state);
    if (id !== acceptance.id) {
      throw new Error(
        'ReworkDeliveryPackageAcceptance sequence is not deterministic',
      );
    }
    state.reworkDeliveryPackageAcceptances[id] = acceptance;
    store.saveState(state);
    return {
      idempotent: false,
      reworkDeliveryPackage: source,
      reworkDeliveryPackageAcceptance: acceptance,
      reviewStatus: 'accepted',
    };
  }

  function getReworkDeliveryPackageAcceptance(reworkDeliveryPackageId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `ReworkDeliveryPackageAcceptance inspection requires supported state: ${error.message}`,
      );
    }
    try {
      const reworkDeliveryPackage = assertReworkDeliveryPackage(
        reworkDeliveryPackageId,
        state,
      );
      assertReworkDeliveryPackageRecord(reworkDeliveryPackage);
      const reworkDeliveryPackageAcceptance =
        Object.values(state.reworkDeliveryPackageAcceptances || {}).find(
          (record) =>
            record.reworkDeliveryPackageId === reworkDeliveryPackage.id,
        ) || null;
      if (reworkDeliveryPackageAcceptance) {
        assertReworkDeliveryPackageAcceptance(
          reworkDeliveryPackageAcceptance.id,
          state,
        );
        assertReworkDeliveryPackageAcceptanceRecord(
          reworkDeliveryPackageAcceptance,
        );
      }
      return {
        reworkDeliveryPackage,
        reworkDeliveryPackageAcceptance,
        reviewStatus: reworkDeliveryPackageAcceptance
          ? 'accepted'
          : 'review-required',
      };
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getBuilderReworkMutationApproval(reworkPlanId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `Builder rework mutation approval inspection requires current state: ${error.message}`,
      );
    }
    let source;
    let mutationLifecycle = false;
    try {
      source = buildBuilderReworkMutationApprovalSource(
        state,
        reworkPlanId,
        builderReworkNowIso(),
      );
    } catch (error) {
      source = buildBuilderReworkSourceMutationSource(
        state,
        reworkPlanId,
        builderReworkNowIso(),
      );
      mutationLifecycle = true;
    }
    const matches = findBuilderReworkMutationApprovals(state, source);
    if (matches.length > 1) {
      throw conflict(
        `BuilderReworkDispatch ${source.builderReworkDispatch.id} has divergent mutation Approvals`,
      );
    }
    const approval = matches[0] || null;
    const decisionInboxItem = approval
      ? assertDecisionInboxItem(approval.inboxItemId, state)
      : null;
    if (approval) {
      assertBuilderReworkMutationApprovalRecord(approval);
      const currentMetadata = buildBuilderReworkMutationApprovalMetadata(
        mutationLifecycle
          ? source.approvalSourceFields
          : source.sourceFields,
      );
      if (
        digestBuilderReworkMutationCanonical(approval.metadata) !==
        digestBuilderReworkMutationCanonical(currentMetadata)
      ) {
        throw conflict(
          'Builder rework mutation Approval source binding is stale',
        );
      }
    }
    return {
      reworkPlanId,
      readiness: {
        status: approval ? approval.status : 'request-ready',
        requestSource: {
          builderReworkDispatchId:
            source.sourceFields.builderReworkDispatchId,
          builderReworkDispatchDigest:
            source.sourceFields.builderReworkDispatchDigest,
          workOrderAttemptId: source.sourceFields.workOrderAttemptId,
          workOrderAttemptRecordDigest:
            source.sourceFields.workOrderAttemptRecordDigest,
          preflightRunId: source.sourceFields.preflightRunId,
          preflightRunRecordDigest:
            source.sourceFields.preflightRunRecordDigest,
          preflightArtifactId: source.sourceFields.preflightArtifactId,
          preflightArtifactRecordDigest:
            source.sourceFields.preflightArtifactRecordDigest,
          preflightArtifactContentDigest:
            source.sourceFields.preflightArtifactContentDigest,
          sourceProgressDigest: source.sourceFields.sourceProgressDigest,
        },
        reviewDecisionInboxItemRefs:
          source.reviewDecisionInboxItemRefs,
        reviewerDecisionPriority:
          source.reviewDecisionInboxItemRefs.length > 0,
      },
      approval,
      decisionInboxItem,
      builderReworkDispatch: source.builderReworkDispatch,
      workOrderAttempt: {
        ...source.workOrderAttempt,
        workerState: deriveBuilderReworkWorkerState(source.workOrderAttempt),
      },
    };
  }

  function requestBuilderReworkMutationApproval(input) {
    const { reworkPlanId, ...requestInput } = input || {};
    const now = builderReworkNowIso();
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `Builder rework mutation approval requires current state: ${error.message}`,
      );
    }
    const source = buildBuilderReworkMutationApprovalSource(
      state,
      reworkPlanId,
      now,
    );
    let request;
    try {
      request = normalizeBuilderReworkMutationApprovalRequest(requestInput, {
        now,
        preflightCompletedAt: source.workOrderAttempt.completedAt,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }
    assertBuilderReworkMutationRequestMatchesSource(request, source);
    const metadata = buildBuilderReworkMutationApprovalMetadata(
      source.sourceFields,
    );
    const matches = findBuilderReworkMutationApprovals(state, source);
    if (matches.length > 0) {
      if (
        matches.length !== 1 ||
        !isExactBuilderReworkMutationApprovalReplay(
          matches[0],
          request,
          metadata,
        )
      ) {
        throw conflict(
          `BuilderReworkDispatch ${source.builderReworkDispatch.id} already has a different mutation Approval`,
        );
      }
      return {
        ...getBuilderReworkMutationApproval(reworkPlanId),
        idempotent: true,
      };
    }

    const approvalSequence = state.sequences.approval + 1;
    const inboxSequence = state.sequences.decisionInboxItem + 1;
    const approvalId = `approval-${String(approvalSequence).padStart(4, '0')}`;
    const inboxItemId = `decisionInboxItem-${String(inboxSequence).padStart(4, '0')}`;
    if (state.approvals[approvalId]) {
      throw conflict(`Approval id collision: ${approvalId}`);
    }
    if (state.decisionInboxItems[inboxItemId]) {
      throw conflict(`Decision Inbox id collision: ${inboxItemId}`);
    }
    const beforeFlags = {
      blocked: source.task.flags?.blocked,
      waitingDecision: source.task.flags?.waitingDecision,
    };
    const approval = {
      id: approvalId,
      projectId: source.task.projectId,
      taskId: source.task.id,
      scope: BUILDER_REWORK_MUTATION_SCOPE,
      status: APPROVAL_STATUS.PENDING,
      placeholder: true,
      allowedNextAction: BUILDER_REWORK_MUTATION_ACTION,
      metadata,
      inboxItemId,
      title: 'Builder rework mutation approval',
      prompt: request.approvalRequest.rationale,
      targetArtifactId: source.preflightArtifact.id,
      targetRunId: source.preflightRun.id,
      createdAt: request.evaluatedAt,
      updatedAt: request.evaluatedAt,
      resolvedAt: null,
    };
    assertBuilderReworkMutationApprovalRecord(approval);
    const decisionInboxItem = {
      id: inboxItemId,
      projectId: source.task.projectId,
      taskId: source.task.id,
      kind: DECISION_INBOX_KIND.APPROVAL,
      status: DECISION_INBOX_STATUS.PENDING,
      title: approval.title,
      prompt: approval.prompt,
      blocksTask: false,
      sourceType: DECISION_INBOX_SOURCE_TYPE.APPROVAL,
      sourceId: approval.id,
      resolution: null,
      createdAt: request.evaluatedAt,
      updatedAt: request.evaluatedAt,
    };

    state.sequences.approval = approvalSequence;
    state.sequences.decisionInboxItem = inboxSequence;
    state.approvals[approval.id] = approval;
    state.decisionInboxItems[decisionInboxItem.id] = decisionInboxItem;
    recalculateTaskFlags(source.task, state);
    if (
      source.task.flags.blocked !== beforeFlags.blocked ||
      source.task.flags.waitingDecision !== beforeFlags.waitingDecision ||
      source.task.flags.waitingApproval !== true
    ) {
      throw conflict(
        'Builder rework mutation approval changed unrelated task gates',
      );
    }
    source.task.updatedAt = request.evaluatedAt;
    store.saveState(state);
    return {
      reworkPlanId,
      readiness: {
        status: approval.status,
        requestSource: {
          builderReworkDispatchId:
            source.sourceFields.builderReworkDispatchId,
          builderReworkDispatchDigest:
            source.sourceFields.builderReworkDispatchDigest,
          workOrderAttemptId: source.sourceFields.workOrderAttemptId,
          workOrderAttemptRecordDigest:
            source.sourceFields.workOrderAttemptRecordDigest,
          preflightRunId: source.sourceFields.preflightRunId,
          preflightRunRecordDigest:
            source.sourceFields.preflightRunRecordDigest,
          preflightArtifactId: source.sourceFields.preflightArtifactId,
          preflightArtifactRecordDigest:
            source.sourceFields.preflightArtifactRecordDigest,
          preflightArtifactContentDigest:
            source.sourceFields.preflightArtifactContentDigest,
          sourceProgressDigest: source.sourceFields.sourceProgressDigest,
        },
        reviewDecisionInboxItemRefs:
          source.reviewDecisionInboxItemRefs,
        reviewerDecisionPriority:
          source.reviewDecisionInboxItemRefs.length > 0,
      },
      approval,
      decisionInboxItem,
      builderReworkDispatch: source.builderReworkDispatch,
      workOrderAttempt: {
        ...source.workOrderAttempt,
        workerState: deriveBuilderReworkWorkerState(source.workOrderAttempt),
      },
      idempotent: false,
    };
  }

  function assertBuilderReworkSourceCurrent(state, reworkPlan, acceptance, request, now) {
    const bundle = getReviewedDeliveryRoleBundle(state, reworkPlan.executionPlanId);
    const { executionPlan, byRole } = bundle;
    assertCurrentReworkPlanProjection(state, reworkPlan, now);
    if (
      acceptance.reworkPlanId !== reworkPlan.id ||
      acceptance.reworkPlanRecordDigest !== reworkPlan.recordDigest ||
      request.reworkPlanAcceptanceId !== acceptance.id ||
      request.reworkPlanRecordDigest !== reworkPlan.recordDigest ||
      request.acceptanceDigest !== acceptance.acceptanceDigest ||
      request.sourceExecutionPlanDigest !== reworkPlan.sourceExecutionPlanDigest ||
      request.sourceAttemptRecordDigest !== reworkPlan.sourceAttemptRecordDigest ||
      request.sourceProgressDigest !== reworkPlan.sourceProgressDigest ||
      request.builderWorkOrderId !== byRole.builder.id ||
      request.builderWorkOrderDigest !== computeWorkOrderRecordDigest(byRole.builder) ||
      reworkPlan.nextAttemptNumber !== 2 || reworkPlan.maxAdditionalBuilderAttempts !== 1 ||
      executionPlan.status !== EXECUTION_PLAN_STATUS.BLOCKED ||
      executionPlan.stopReason !== 'reviewer-changes-requested' ||
      executionPlan.stoppedAt !== 'reviewer' || executionPlan.activeWorkOrderId !== null ||
      byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.CHANGES_REQUESTED ||
      byRole.qa.status !== WORK_ORDER_STATUS.BLOCKED_DEPENDENCY
    ) {
      throw conflict('BuilderReworkDispatch source evidence is stale or invalid');
    }
    const builderAttempts = bundle.workOrderAttempts.filter(
      (attempt) => attempt.workOrderId === byRole.builder.id,
    );
    if (
      builderAttempts.length !== 2 ||
      builderAttempts[0].action !== WORK_ORDER_ATTEMPT_ACTION.START_BUILDER ||
      builderAttempts[0].attemptNumber !== 1 ||
      builderAttempts[1].action !== WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER ||
      builderAttempts[1].attemptNumber !== 2 ||
      builderAttempts.some((attempt) => !['completed', 'waiting-gate'].includes(attempt.status))
    ) {
      throw conflict('BuilderReworkDispatch requires two terminal Builder attempts');
    }
    if (
      Object.values(state.workOrderAttempts).some(
        (attempt) =>
          attempt.projectId === executionPlan.projectId &&
          attempt.role === 'builder' &&
          attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE,
      )
    ) {
      throw conflict(
        'BuilderReworkDispatch cannot overlap an active Builder WorkOrderAttempt in the project',
      );
    }
    const project = assertProject(executionPlan.projectId, state);
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw conflict('BuilderReworkDispatch supports local-stub projects only');
    }
    return { bundle, project };
  }

  function beginBuilderReworkPreflight(input) {
    const { reworkPlanId, ...requestInput } = input || {};
    const now = builderReworkNowIso();
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`BuilderReworkDispatch requires supported state: ${error.message}`);
    }
    const reworkPlan = assertReworkPlan(reworkPlanId, state);
    const acceptance = assertReworkPlanAcceptance(
      requestInput.reworkPlanAcceptanceId,
      state,
    );
    let request;
    try {
      request = normalizeBuilderReworkDispatchRequest(requestInput, {
        acceptanceCreatedAt: acceptance.createdAt,
        now,
      });
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }
    const existing = findBuilderReworkDispatch(state, reworkPlan.id);
    if (existing) {
      if (!isExactBuilderReworkDispatchReplay(existing, request)) {
        throw conflict(`ReworkPlan ${reworkPlan.id} already has a different BuilderReworkDispatch`);
      }
      return { ...getBuilderReworkDispatchEnvelopeFromState(state, existing), idempotent: true };
    }

    const { bundle } = assertBuilderReworkSourceCurrent(
      state,
      reworkPlan,
      acceptance,
      request,
      now,
    );
    const builder = bundle.byRole.builder;
    const councilSession = assertCouncilSession(bundle.executionPlan.councilSessionId, state);
    const bound = assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
      executionPlan: bundle.executionPlan,
    });
    const dispatchId = nextBuilderReworkDispatchId(state);
    const attemptId = nextWorkOrderAttemptId(state);
    if (state.workOrderAttempts[attemptId]) {
      throw conflict(`WorkOrderAttempt id collision: ${attemptId}`);
    }
    const dependencies = builder.dependencyIds.map((dependencyId) => {
      const dependency = assertWorkOrder(dependencyId, state);
      return { id: dependency.id, status: dependency.status };
    });
    const authorityDigest = digestSpecialistCanonical({
      builderWorkOrderDigest: request.builderWorkOrderDigest,
      dispatchApproval: request.dispatchApproval,
      dispatchId,
      reworkPlanAcceptanceId: acceptance.id,
      reworkPlanAcceptanceDigest: acceptance.acceptanceDigest,
      reworkPlanId: reworkPlan.id,
      workOrderAttemptId: attemptId,
    });
    const attempt = createWorkOrderAttempt({
      id: attemptId,
      executionPlanId: bundle.executionPlan.id,
      workOrderId: builder.id,
      missionId: bundle.executionPlan.missionId,
      projectId: bundle.executionPlan.projectId,
      staffingPlanId: bound.staffingPlan.id,
      staffingEntryId: bound.staffingEntry.id,
      councilSessionId: councilSession.id,
      role: 'builder',
      position: builder.position,
      attemptNumber: 3,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
      sourceDigest: bundle.executionPlan.sourceDigest,
      workOrderDigest: request.builderWorkOrderDigest,
      dependencyDigest: computeWorkOrderAttemptDependencyDigest({
        executionPlanId: bundle.executionPlan.id,
        workOrderId: builder.id,
        dependencies,
      }),
      authorityDigest,
      checkpointRef: null,
      approvalRefs: [],
      startedAt: request.evaluatedAt,
    });
    const dispatch = createBuilderReworkDispatch({
      id: dispatchId,
      projectId: bundle.executionPlan.projectId,
      missionId: bundle.executionPlan.missionId,
      staffingPlanId: bound.staffingPlan.id,
      staffingEntryId: bound.staffingEntry.id,
      councilSessionId: councilSession.id,
      executionPlanId: bundle.executionPlan.id,
      reworkPlanId: reworkPlan.id,
      reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
      request,
      workOrderAttemptId: attempt.id,
    });
    state.workOrderAttempts[attempt.id] = attempt;
    state.builderReworkDispatches[dispatch.id] = dispatch;
    store.saveState(state);
    return { ...getBuilderReworkDispatchEnvelopeFromState(state, dispatch), idempotent: false };
  }

  function settleBuilderReworkPreflight(input) {
    const expectedFields = [
      'artifactId',
      'builderReworkDispatchId',
      'failed',
      'runId',
    ];
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).sort().join('\u0000') !==
        expectedFields.join('\u0000')
    ) {
      throw conflict(
        'Builder rework preflight settlement has unexpected or missing fields',
      );
    }
    if (typeof input.failed !== 'boolean') {
      throw conflict('Builder rework preflight failed must be a boolean');
    }
    if (
      (!input.failed && (!input.runId || !input.artifactId)) ||
      (input.artifactId && !input.runId)
    ) {
      throw conflict(
        'Successful Builder rework preflight requires one Run and one Artifact',
      );
    }

    const state = store.loadState();
    const dispatch = assertBuilderReworkDispatch(input.builderReworkDispatchId, state);
    const attempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    if (
      attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      attempt.action !==
        WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT
    ) {
      throw conflict(`BuilderReworkDispatch ${dispatch.id} is already terminal`);
    }
    const executionPlan = assertExecutionPlan(dispatch.executionPlanId, state);
    const runRefs = input.runId ? [input.runId] : [];
    const artifactRefs = input.artifactId ? [input.artifactId] : [];
    const run = input.runId ? assertRun(input.runId, state) : null;
    const artifact = input.artifactId
      ? assertArtifact(input.artifactId, state)
      : null;
    if (
      run &&
      (
        run.taskId !== executionPlan.controlTaskId ||
        run.role !== 'builder' ||
        run.status !== RUN_STATUS.COMPLETED ||
        run.metadata?.executionMode !== 'rework-preflight' ||
        run.metadata?.builderReworkDispatchId !== dispatch.id ||
        run.metadata?.workOrderAttemptId !== attempt.id ||
        run.summary?.executionMode !== 'rework-preflight' ||
        run.summary?.builderReworkDispatchId !== dispatch.id ||
        run.summary?.workOrderAttemptId !== attempt.id
      )
    ) {
      throw conflict('Builder rework preflight Run lineage is invalid');
    }
    if (
      artifact &&
      (
        artifact.taskId !== executionPlan.controlTaskId ||
        artifact.runId !== run?.id ||
        artifact.type !== 'preflight'
      )
    ) {
      throw conflict('Builder rework preflight Artifact lineage is invalid');
    }
    const completedAt = new Date(
      Math.max(
        Date.parse(builderReworkNowIso()),
        Date.parse(attempt.startedAt),
      ),
    ).toISOString();
    const next = transitionWorkOrderAttemptWithOpsGuard(state, attempt, {
      status: input.failed ? WORK_ORDER_ATTEMPT_STATUS.FAILED : WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE,
      checkpointRef: null,
      approvalRefs: [],
      runRefs,
      artifactRefs,
      decisionInboxItemRefs: [],
      stopReason: input.failed
        ? 'builder-rework-preflight-failed'
        : 'builder-rework-preflight-complete-mutation-approval-blocked',
      completedAt,
    });
    state.workOrderAttempts[next.id] = next;
    store.saveState(state);
    return getBuilderReworkDispatchEnvelopeFromState(state, dispatch);
  }

  function opsSupervisionNowIso() {
    const value =
      typeof options.opsSupervisionNow === 'function'
        ? options.opsSupervisionNow()
        : new Date();
    const timestamp =
      value instanceof Date ? value.getTime() : Date.parse(String(value));
    if (!Number.isFinite(timestamp)) {
      const error = new Error(
        'OpsSupervisionPreview clock must return a valid timestamp',
      );
      error.statusCode = 400;
      throw error;
    }
    return new Date(timestamp).toISOString();
  }

  function opsSupervisionNotFound(message) {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
  }

  function getOpsSupervisionPreview(input) {
    let request;
    try {
      request = normalizeOpsSupervisionRequest(input);
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `OpsSupervisionPreview requires supported state: ${error.message}`,
      );
    }

    let source;
    if (
      request.targetType ===
      OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT
    ) {
      const attempt = state.workOrderAttempts?.[request.targetId];
      if (!attempt) {
        throw opsSupervisionNotFound('WorkOrderAttempt not found');
      }
      const executionPlan = state.executionPlans?.[request.parentId];
      if (!executionPlan) {
        throw opsSupervisionNotFound('ExecutionPlan not found');
      }
      try {
        assertWorkOrderAttemptRecord(attempt);
      } catch (error) {
        throw conflict(`WorkOrderAttempt evidence is invalid: ${error.message}`);
      }
      if (
        attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
        attempt.executionPlanId !== executionPlan.id
      ) {
        throw conflict(
          'WorkOrderAttempt target is terminal or has a different parent',
        );
      }
      const workOrder = assertWorkOrder(attempt.workOrderId, state);
      const councilSession = assertCouncilSession(
        executionPlan.councilSessionId,
        state,
      );
      const bound = assertBoundStaffingSchedulerSourceCurrent(
        state,
        councilSession,
        { executionPlan },
      );
      const dependencies = workOrder.dependencyIds.map((dependencyId) => {
        const dependency = assertWorkOrder(dependencyId, state);
        return { id: dependency.id, status: dependency.status };
      });
      if (
        !bound ||
        attempt.missionId !== executionPlan.missionId ||
        attempt.projectId !== executionPlan.projectId ||
        attempt.councilSessionId !== councilSession.id ||
        attempt.staffingPlanId !== bound.staffingPlan.id ||
        attempt.staffingEntryId !== bound.staffingEntry.id ||
        attempt.sourceDigest !== executionPlan.sourceDigest ||
        workOrder.executionPlanId !== executionPlan.id ||
        workOrder.sourceDigest !== executionPlan.sourceDigest ||
        attempt.dependencyDigest !==
          computeWorkOrderAttemptDependencyDigest({
            executionPlanId: executionPlan.id,
            workOrderId: workOrder.id,
            dependencies,
          }) ||
        attempt.role !== workOrder.role ||
        attempt.position !== workOrder.position ||
        !executionPlan.workOrderIds.includes(workOrder.id)
      ) {
        throw conflict('WorkOrderAttempt source lineage is stale');
      }
      if (attempt.checkpointRef) {
        const checkpoint = state.workflowCheckpoints?.[attempt.checkpointRef];
        if (
          !checkpoint ||
          checkpoint.executionPlanId !== executionPlan.id ||
          checkpoint.sourceDigest !== attempt.sourceDigest
        ) {
          throw conflict('WorkOrderAttempt checkpoint lineage is stale');
        }
      }
      source = {
        targetRecordDigest: attempt.recordDigest,
        parentDigest: computeExecutionPlanRecordDigest(executionPlan),
        sourceDigest: attempt.sourceDigest,
        attemptNumber: attempt.attemptNumber,
        role: attempt.role,
        startedAt: attempt.startedAt,
        deadlineAt: null,
        evidenceRefs: {
          targetRef: attempt.id,
          parentRef: executionPlan.id,
          executionPlanRef: executionPlan.id,
          workOrderRef: workOrder.id,
          sourceBatchRef: null,
          sourceAttemptRef: null,
          checkpointRef: attempt.checkpointRef,
        },
      };
    } else if (
      request.targetType ===
      OPS_SUPERVISION_TARGET_TYPE.SPECIALIST_FIRST_ATTEMPT
    ) {
      const attempt = state.specialistCellAttempts?.[request.targetId];
      if (!attempt) {
        throw opsSupervisionNotFound('SpecialistCellAttempt not found');
      }
      const batch = state.specialistBatches?.[request.parentId];
      if (!batch) {
        throw opsSupervisionNotFound('SpecialistBatch not found');
      }
      try {
        assertSpecialistBatchRecord(batch);
        assertSpecialistCellAttemptRecord(attempt, {
          expectedAttemptNumber: 1,
          batchDeadlineAt: batch.deadlineAt,
        });
      } catch (error) {
        throw conflict(`Specialist first-attempt evidence is invalid: ${error.message}`);
      }
      if (
        batch.status !== 'active' ||
        attempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
        attempt.attemptNumber !== 1 ||
        attempt.specialistBatchId !== batch.id ||
        !batch.cellAttemptIds.includes(attempt.id) ||
        attempt.sourceDigest !== batch.sourceDigest ||
        attempt.position !== batch.cellAttemptIds.indexOf(attempt.id)
      ) {
        throw conflict('Specialist first-attempt lineage is stale');
      }
      source = {
        targetRecordDigest: attempt.recordDigest,
        parentDigest: batch.recordDigest,
        sourceDigest: attempt.sourceDigest,
        attemptNumber: attempt.attemptNumber,
        role: attempt.role,
        startedAt: attempt.startedAt,
        deadlineAt: attempt.deadlineAt,
        evidenceRefs: {
          targetRef: attempt.id,
          parentRef: batch.id,
          executionPlanRef: null,
          workOrderRef: null,
          sourceBatchRef: batch.id,
          sourceAttemptRef: null,
          checkpointRef: null,
        },
      };
    } else {
      const attempt = state.specialistCellAttempts?.[request.targetId];
      if (!attempt) {
        throw opsSupervisionNotFound('SpecialistCellAttempt not found');
      }
      const retry = state.specialistCellRetries?.[request.parentId];
      if (!retry) {
        throw opsSupervisionNotFound('SpecialistCellRetry not found');
      }
      const batch = state.specialistBatches?.[retry.specialistBatchId];
      const sourceAttempt =
        state.specialistCellAttempts?.[retry.sourceCellAttemptId];
      if (!batch || !sourceAttempt) {
        throw conflict('Specialist retry source lineage is incomplete');
      }
      try {
        assertSpecialistCellRetryRecord(retry);
        assertSpecialistBatchRecord(batch);
        assertSpecialistCellAttemptRecord(sourceAttempt, {
          expectedAttemptNumber: 1,
          batchDeadlineAt: batch.deadlineAt,
        });
        assertSpecialistCellAttemptRecord(attempt, {
          expectedAttemptNumber: 2,
        });
      } catch (error) {
        throw conflict(`Specialist retry-attempt evidence is invalid: ${error.message}`);
      }
      if (
        retry.status !== SPECIALIST_CELL_RETRY_STATUS.ACTIVE ||
        attempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.ACTIVE ||
        sourceAttempt.status !== SPECIALIST_CELL_ATTEMPT_STATUS.FAILED ||
        attempt.attemptNumber !== 2 ||
        retry.retryCellAttemptId !== attempt.id ||
        retry.sourceBatchRecordDigest !== batch.recordDigest ||
        retry.sourceCellAttemptRecordDigest !== sourceAttempt.recordDigest ||
        sourceAttempt.specialistBatchId !== batch.id ||
        !batch.cellAttemptIds.includes(sourceAttempt.id) ||
        attempt.specialistBatchId !== batch.id ||
        attempt.cellId !== sourceAttempt.cellId ||
        attempt.agentProfileId !== sourceAttempt.agentProfileId ||
        attempt.role !== sourceAttempt.role ||
        attempt.position !== sourceAttempt.position ||
        attempt.cellSpecDigest !== sourceAttempt.cellSpecDigest ||
        attempt.sourceDigest !== sourceAttempt.sourceDigest ||
        attempt.inputDigest !== sourceAttempt.inputDigest ||
        attempt.cellDeadlineMs !== retry.retryDeadlineMs
      ) {
        throw conflict('Specialist retry-attempt lineage is stale');
      }
      source = {
        targetRecordDigest: attempt.recordDigest,
        parentDigest: retry.recordDigest,
        sourceDigest: attempt.sourceDigest,
        attemptNumber: attempt.attemptNumber,
        role: attempt.role,
        startedAt: attempt.startedAt,
        deadlineAt: attempt.deadlineAt,
        evidenceRefs: {
          targetRef: attempt.id,
          parentRef: retry.id,
          executionPlanRef: null,
          workOrderRef: null,
          sourceBatchRef: batch.id,
          sourceAttemptRef: sourceAttempt.id,
          checkpointRef: null,
        },
      };
    }

    try {
      return buildOpsSupervisionPreview(request, source, {
        now: opsSupervisionNowIso(),
      });
    } catch (error) {
      error.statusCode = error.statusCode || 409;
      throw error;
    }
  }

  function getOpsDispositionPreviewRequest(request) {
    return {
      targetType: request.targetType,
      targetId: request.targetId,
      parentId: request.parentId,
      expectedTargetRecordDigest: request.expectedTargetRecordDigest,
      expectedParentDigest: request.expectedParentDigest,
      evaluatedAt: request.evaluatedAt,
    };
  }

  function getOpsDispositionProjectId(state, preview) {
    if (
      preview.targetType ===
      OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT
    ) {
      return assertWorkOrderAttempt(preview.targetId, state).projectId;
    }
    if (
      preview.targetType ===
      OPS_SUPERVISION_TARGET_TYPE.SPECIALIST_FIRST_ATTEMPT
    ) {
      return assertSpecialistBatch(preview.parentId, state).projectId;
    }
    const retry = assertSpecialistCellRetry(preview.parentId, state);
    return assertSpecialistBatch(retry.specialistBatchId, state).projectId;
  }

  function quarantineOpsAttempt(input) {
    let request;
    try {
      request = normalizeOpsAttemptDispositionRequest(input);
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `OpsAttemptDisposition requires supported state: ${error.message}`,
      );
    }

    const existing =
      Object.values(state.opsAttemptDispositions || {}).find(
        (record) =>
          record.targetType === request.targetType &&
          record.targetId === request.targetId,
      ) || null;
    if (existing) {
      assertOpsAttemptDispositionRecord(existing);
      if (!isExactOpsAttemptDispositionReplay(existing, request)) {
        throw conflict(
          'Ops attempt target already has a different quarantine disposition',
        );
      }
      return {
        idempotent: true,
        opsAttemptDisposition: existing,
        status: 'quarantined',
      };
    }

    const preview = getOpsSupervisionPreview(
      getOpsDispositionPreviewRequest(request),
    );
    if (
      preview.id !== request.previewId ||
      preview.previewDigest !== request.previewDigest
    ) {
      throw conflict(
        'OpsAttemptDisposition request is not bound to the exact source-current preview',
      );
    }

    const prospectiveId = `ops-attempt-disposition-${String(
      state.sequences.opsAttemptDisposition + 1,
    ).padStart(4, '0')}`;
    const disposition = createOpsAttemptDisposition({
      id: prospectiveId,
      projectId: getOpsDispositionProjectId(state, preview),
      preview,
      createdAt: opsSupervisionNowIso(),
    });
    const id = nextOpsAttemptDispositionId(state);
    if (id !== disposition.id) {
      throw new Error('OpsAttemptDisposition sequence is not deterministic');
    }
    state.opsAttemptDispositions[id] = disposition;
    store.saveState(state);
    return {
      idempotent: false,
      opsAttemptDisposition: disposition,
      status: 'quarantined',
    };
  }

  function getOpsAttemptDisposition(opsAttemptDispositionId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `OpsAttemptDisposition inspection requires supported state: ${error.message}`,
      );
    }
    try {
      const disposition = assertOpsAttemptDisposition(
        opsAttemptDispositionId,
        state,
      );
      assertOpsAttemptDispositionRecord(disposition);
      return { opsAttemptDisposition: disposition };
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getOpsAttemptResumeEnvelopeFromState(state, resume, idempotent) {
    assertOpsAttemptResumeRecord(resume);
    const sourceAttempt = assertWorkOrderAttempt(resume.sourceAttemptId, state);
    const replacementAttempt = assertWorkOrderAttempt(
      resume.replacementAttemptId,
      state,
    );
    return {
      idempotent,
      opsAttemptResume: resume,
      sourceAttempt,
      replacementAttempt,
      executionPlanBundle: getExecutionPlanBundleFromState(
        state,
        resume.executionPlanId,
      ),
      status: replacementAttempt.status,
    };
  }

  function resumeOpsAttemptFromSafeCheckpoint(
    opsAttemptDispositionId,
    input,
  ) {
    let request;
    try {
      request = normalizeOpsAttemptResumeRequest(input);
    } catch (error) {
      error.statusCode = error.statusCode || 400;
      throw error;
    }

    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`OpsAttemptResume requires supported state: ${error.message}`);
    }

    const disposition = assertOpsAttemptDisposition(
      opsAttemptDispositionId,
      state,
    );
    assertOpsAttemptDispositionRecord(disposition);
    const existing =
      Object.values(state.opsAttemptResumes || {}).find(
        (resume) => resume.sourceDispositionId === disposition.id,
      ) || null;
    if (existing) {
      if (
        !isExactOpsAttemptResumeReplay(existing, request) ||
        request.expectedExecutionPlanDigest !== disposition.parentDigest ||
        existing.sourceDispositionRecordDigest !== disposition.recordDigest
      ) {
        throw conflict(
          'Ops attempt disposition already has a different safe-checkpoint resume',
        );
      }
      return getOpsAttemptResumeEnvelopeFromState(state, existing, true);
    }

    const sourceAttempt = assertWorkOrderAttempt(request.sourceAttemptId, state);
    const executionPlan = assertExecutionPlan(request.executionPlanId, state);
    const bundle = getReviewedDeliveryRoleBundle(state, executionPlan.id);
    const { byRole, councilSession } = bundle;
    const workOrder = assertWorkOrder(request.expectedWorkOrderId, state);
    const checkpoint = assertWorkflowCheckpoint(request.checkpointId, state);
    const project = assertReviewedDeliverySourceCurrent(bundle, state);
    const source = assertBoundStaffingSchedulerSourceCurrent(
      state,
      councilSession,
      { executionPlan },
    );
    const executionPlanDigest = computeExecutionPlanRecordDigest(executionPlan);
    const dependencies = workOrder.dependencyIds.map((dependencyId) => {
      const dependency = assertWorkOrder(dependencyId, state);
      return { id: dependency.id, status: dependency.status };
    });
    const expectedDependencyDigest = computeWorkOrderAttemptDependencyDigest({
      executionPlanId: executionPlan.id,
      workOrderId: workOrder.id,
      dependencies,
    });
    const expectedAttemptAuthorityDigest = computeWorkOrderAttemptAuthorityDigest({
      executionPlanId: executionPlan.id,
      expectedWorkOrderId: workOrder.id,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: WORK_ORDER_ATTEMPT_ACTION.RUN_QA,
      sourceDigest: executionPlan.sourceDigest,
      checkpointRef: checkpoint.id,
      checkpointDigest: checkpoint.checkpointDigest,
      approvalRefs: sourceAttempt.approvalRefs,
    });
    const resumedAt = opsSupervisionNowIso();
    const now = Date.parse(resumedAt);
    const evaluatedAt = Date.parse(request.evaluatedAt);
    const workerStoppedAt = Date.parse(request.sourceWorkerStopConfirmedAt);
    const runnableAttempts = getPlanWorkOrderAttempts(
      state,
      executionPlan.id,
    ).filter((attempt) => isRunnableWorkOrderAttempt(state, attempt));

    if (
      disposition.targetType !==
        OPS_SUPERVISION_TARGET_TYPE.WORK_ORDER_ATTEMPT ||
      disposition.decision !== 'quarantine' ||
      disposition.recordDigest !== request.dispositionRecordDigest ||
      disposition.targetId !== sourceAttempt.id ||
      disposition.targetRecordDigest !== sourceAttempt.recordDigest ||
      disposition.parentId !== executionPlan.id ||
      disposition.parentDigest !== request.expectedExecutionPlanDigest ||
      executionPlanDigest !== request.expectedExecutionPlanDigest ||
      disposition.projectId !== executionPlan.projectId ||
      sourceAttempt.recordDigest !== request.sourceAttemptRecordDigest ||
      sourceAttempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
      sourceAttempt.role !== 'qa' ||
      sourceAttempt.action !== WORK_ORDER_ATTEMPT_ACTION.RUN_QA ||
      sourceAttempt.command !== WORK_ORDER_ATTEMPT_COMMAND.STEP ||
      sourceAttempt.attemptNumber !== 1 ||
      sourceAttempt.executionPlanId !== executionPlan.id ||
      sourceAttempt.workOrderId !== workOrder.id ||
      sourceAttempt.checkpointRef !== checkpoint.id ||
      sourceAttempt.staffingPlanId !== source.staffingPlan.id ||
      sourceAttempt.staffingEntryId !== source.staffingEntry.id ||
      sourceAttempt.councilSessionId !== councilSession.id ||
      sourceAttempt.sourceDigest !== executionPlan.sourceDigest ||
      sourceAttempt.dependencyDigest !== expectedDependencyDigest ||
      sourceAttempt.authorityDigest !== expectedAttemptAuthorityDigest ||
      checkpoint.executionPlanId !== executionPlan.id ||
      checkpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.QA_READY ||
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.CONSUMED ||
      checkpoint.checkpointDigest !== request.checkpointDigest ||
      checkpoint.inputDigest !== request.inputDigest ||
      checkpoint.authorityDigest !== request.authorityDigest ||
      executionPlan.latestCheckpointId !== checkpoint.id ||
      executionPlan.status !== EXECUTION_PLAN_STATUS.REVIEWING ||
      executionPlan.activeWorkOrderId !== workOrder.id ||
      byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.qa.id !== workOrder.id ||
      byRole.qa.status !== WORK_ORDER_STATUS.ACTIVE ||
      workOrder.role !== 'qa' ||
      workOrder.executionPlanId !== executionPlan.id ||
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB ||
      runnableAttempts.length !== 0 ||
      workerStoppedAt < Date.parse(disposition.createdAt) ||
      evaluatedAt < workerStoppedAt ||
      evaluatedAt > now
    ) {
      throw conflict('OpsAttemptResume source tuple is stale or ineligible');
    }

    const replacementAttempt = createWorkOrderAttempt({
      id: nextWorkOrderAttemptId(state),
      executionPlanId: sourceAttempt.executionPlanId,
      workOrderId: sourceAttempt.workOrderId,
      missionId: sourceAttempt.missionId,
      projectId: sourceAttempt.projectId,
      staffingPlanId: sourceAttempt.staffingPlanId,
      staffingEntryId: sourceAttempt.staffingEntryId,
      councilSessionId: sourceAttempt.councilSessionId,
      role: sourceAttempt.role,
      position: sourceAttempt.position,
      attemptNumber: OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER,
      command: sourceAttempt.command,
      action: sourceAttempt.action,
      sourceDigest: sourceAttempt.sourceDigest,
      workOrderDigest: sourceAttempt.workOrderDigest,
      dependencyDigest: sourceAttempt.dependencyDigest,
      authorityDigest: sourceAttempt.authorityDigest,
      checkpointRef: checkpoint.id,
      approvalRefs: sourceAttempt.approvalRefs,
      startedAt: resumedAt,
    });
    if (Date.parse(replacementAttempt.startedAt) < evaluatedAt) {
      throw conflict('OpsAttemptResume evaluatedAt must not follow replacement start');
    }
    const prospectiveResumeId = `ops-attempt-resume-${String(
      state.sequences.opsAttemptResume + 1,
    ).padStart(4, '0')}`;
    const resume = createOpsAttemptResume({
      id: prospectiveResumeId,
      projectId: executionPlan.projectId,
      executionPlanId: executionPlan.id,
      workOrderId: workOrder.id,
      sourceDispositionId: disposition.id,
      sourceDispositionRecordDigest: disposition.recordDigest,
      sourceAttemptId: sourceAttempt.id,
      sourceAttemptRecordDigest: sourceAttempt.recordDigest,
      sourceCheckpointId: checkpoint.id,
      sourceCheckpointDigest: checkpoint.checkpointDigest,
      sourceInputDigest: checkpoint.inputDigest,
      sourceAuthorityDigest: checkpoint.authorityDigest,
      replacementAttemptId: replacementAttempt.id,
      replacementAttemptStartDigest: replacementAttempt.recordDigest,
      sourceWorkerStopConfirmedAt: request.sourceWorkerStopConfirmedAt,
      evaluatedAt: request.evaluatedAt,
      createdAt: resumedAt,
    });
    const resumeId = nextOpsAttemptResumeId(state);
    if (resumeId !== resume.id) {
      throw new Error('OpsAttemptResume sequence is not deterministic');
    }
    state.workOrderAttempts[replacementAttempt.id] = replacementAttempt;
    state.opsAttemptResumes[resume.id] = resume;
    store.saveState(state);
    return getOpsAttemptResumeEnvelopeFromState(state, resume, false);
  }

  function getOpsAttemptResume(opsAttemptResumeId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `OpsAttemptResume inspection requires supported state: ${error.message}`,
      );
    }
    try {
      const resume = assertOpsAttemptResume(opsAttemptResumeId, state);
      return getOpsAttemptResumeEnvelopeFromState(state, resume, true);
    } catch (error) {
      if (/not found/i.test(error.message)) error.statusCode = 404;
      throw error;
    }
  }

  function getExactResearchReadiness() {
    return exactResearchAdapter.getReadiness();
  }

  async function fetchExactResearchEvidence(input) {
    return exactResearchAdapter.fetchExact(input);
  }

  function reportContextBudget(input) {
    return compileContextBudgetTelemetry(input);
  }

  function previewWorkOrderVerificationPlan(input) {
    const expectedFields = [
      'evaluatedAt',
      'executionPlanDigest',
      'executionPlanId',
      'sourceDigest',
      'workOrderDigest',
      'workOrderId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'WorkOrderVerificationPlan preview request has unexpected or missing fields',
      );
    }

    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(
        `WorkOrderVerificationPlan preview requires current state: ${error.message}`,
      );
    }
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const workOrder = assertWorkOrder(input.workOrderId, state);
    if (String(input.sourceDigest || '').trim() !== executionPlan.sourceDigest) {
      throw conflict('WorkOrderVerificationPlan sourceDigest does not match current evidence');
    }
    if (
      String(input.executionPlanDigest || '').trim() !==
      computeExecutionPlanRecordDigest(executionPlan)
    ) {
      throw conflict(
        'WorkOrderVerificationPlan executionPlanDigest does not match current evidence',
      );
    }
    if (
      String(input.workOrderDigest || '').trim() !== computeWorkOrderRecordDigest(workOrder)
    ) {
      throw conflict(
        'WorkOrderVerificationPlan workOrderDigest does not match current evidence',
      );
    }

    try {
      return compileWorkOrderVerificationPlanPreview({
        executionPlan,
        workOrder,
        evaluatedAt: input.evaluatedAt,
      });
    } catch (error) {
      if (/source-current ExecutionPlan|sourceDigest/.test(error.message)) {
        throw conflict(error.message);
      }
      throw error;
    }
  }

  function persistWorkOrderAcceptanceCriteria(input) {
    const expectedFields = [
      'evaluatedAt',
      'executionPlanDigest',
      'executionPlanId',
      'persistenceApproval',
      'previewDigest',
      'previewId',
      'sourceDigest',
      'workOrderDigest',
      'workOrderId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'AcceptanceCriterion persistence request has unexpected or missing fields',
      );
    }

    const state = store.loadStateSupportedReadonly();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const workOrder = assertWorkOrder(input.workOrderId, state);
    if (
      workOrder.id !== bundle.byRole.builder.id ||
      workOrder.role !== 'builder' ||
      bundle.executionPlan.status !== EXECUTION_PLAN_STATUS.ACTIVE ||
      bundle.executionPlan.activeWorkOrderId !== workOrder.id ||
      bundle.executionPlan.stoppedAt !== 'request-builder-live-mutation-approval' ||
      workOrder.status !== WORK_ORDER_STATUS.WAITING_GATE
    ) {
      throw conflict(
        'AcceptanceCriteria can only be persisted for the Builder waiting-gate',
      );
    }
    if (String(input.sourceDigest || '').trim() !== bundle.executionPlan.sourceDigest) {
      throw conflict('AcceptanceCriterion sourceDigest does not match current evidence');
    }
    if (
      String(input.executionPlanDigest || '').trim() !==
      computeExecutionPlanRecordDigest(bundle.executionPlan)
    ) {
      throw conflict('AcceptanceCriterion executionPlanDigest does not match current evidence');
    }
    if (
      String(input.workOrderDigest || '').trim() !== computeWorkOrderRecordDigest(workOrder)
    ) {
      throw conflict('AcceptanceCriterion workOrderDigest does not match current evidence');
    }

    const preview = compileWorkOrderVerificationPlanPreview({
      executionPlan: bundle.executionPlan,
      workOrder,
      evaluatedAt: input.evaluatedAt,
    });
    if (
      String(input.previewId || '').trim() !== preview.id ||
      String(input.previewDigest || '').trim() !== preview.previewDigest
    ) {
      throw conflict('AcceptanceCriterion preview does not match current evidence');
    }

    if (workOrder.acceptanceCriterionRefs.length > 0) {
      const existingCriteria = workOrder.acceptanceCriterionRefs.map((id) =>
        assertAcceptanceCriterion(id, state));
      if (
        existingCriteria.length === preview.criteria.length &&
        existingCriteria.every(
          (criterion, index) =>
            criterion.sourcePreviewId === preview.id &&
            criterion.sourcePreviewDigest === preview.previewDigest &&
            criterion.sourceCriterionId === preview.criteria[index].id,
        )
      ) {
        return {
          ...bundle,
          acceptanceCriteria: existingCriteria,
          verificationPlanPreview: preview,
          idempotent: true,
        };
      }
      throw conflict(`WorkOrder ${workOrder.id} already has different AcceptanceCriteria`);
    }

    const criteria = preview.criteria.map((sourceCriterion) => {
      const criterion = createAcceptanceCriterion({
        id: nextAcceptanceCriterionId(state),
        preview,
        sourceCriterion,
        persistenceApproval: input.persistenceApproval,
      });
      state.acceptanceCriteria[criterion.id] = criterion;
      return criterion;
    });
    workOrder.acceptanceCriterionRefs = criteria.map((criterion) => criterion.id);
    store.saveState(state);

    return {
      ...getExecutionPlanBundleFromState(state, bundle.executionPlan.id),
      acceptanceCriteria: criteria,
      verificationPlanPreview: preview,
      idempotent: false,
    };
  }

  function getCriterionProofs(state, acceptanceCriterionId) {
    return Object.values(state.verificationProofs)
      .filter((proof) => proof.acceptanceCriterionId === acceptanceCriterionId)
      .sort((left, right) => left.attempt - right.attempt);
  }

  function assertCriterionWorkOrderBinding(state, input) {
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const workOrder = assertWorkOrder(input.workOrderId, state);
    const criterion = assertAcceptanceCriterion(input.acceptanceCriterionId, state);
    if (
      workOrder.id !== bundle.byRole.builder.id ||
      workOrder.role !== 'builder' ||
      !workOrder.acceptanceCriterionRefs.includes(criterion.id) ||
      criterion.executionPlanId !== bundle.executionPlan.id ||
      criterion.workOrderId !== workOrder.id
    ) {
      throw conflict('VerificationProof source records do not share one Builder WorkOrder');
    }
    if (
      String(input.criterionRecordDigest || '').trim() !== criterion.recordDigest ||
      String(input.sourceDigest || '').trim() !== bundle.executionPlan.sourceDigest ||
      String(input.workOrderDigest || '').trim() !== computeWorkOrderRecordDigest(workOrder)
    ) {
      throw conflict('VerificationProof source digest tuple does not match current evidence');
    }
    if (
      workOrder.status !== WORK_ORDER_STATUS.COMPLETED ||
      bundle.executionPlan.activeWorkOrderId !== bundle.byRole.reviewer.id ||
      bundle.executionPlan.latestCheckpointId === null
    ) {
      throw conflict('VerificationProof requires Builder completion at reviewer-ready');
    }
    return { bundle, workOrder, criterion };
  }

  function buildManualVerificationInputDigest(state, artifactIds) {
    const artifactEvidence = artifactIds.map((artifactId) => {
      const artifact = assertArtifact(artifactId, state);
      return {
        id: artifact.id,
        runId: artifact.runId,
        taskId: artifact.taskId,
        type: artifact.type,
        createdAt: artifact.createdAt,
        sizeBytes: artifact.sizeBytes || null,
      };
    });
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(artifactEvidence))
      .digest('hex');
  }

  function recordWorkOrderVerificationProof(input) {
    const expectedFields = [
      'acceptanceCriterionId',
      'criterionRecordDigest',
      'evidenceArtifactIds',
      'executionPlanId',
      'proofApproval',
      'sourceDigest',
      'status',
      'workOrderDigest',
      'workOrderId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('VerificationProof request has unexpected or missing fields');
    }
    const state = store.loadStateReadonly();
    const { bundle, workOrder, criterion } = assertCriterionWorkOrderBinding(state, input);
    if (criterion.proofMode === 'command') {
      throw conflict('Command criterion must use the node-check proof path');
    }
    const evidenceArtifactIds = Array.isArray(input.evidenceArtifactIds)
      ? [...new Set(input.evidenceArtifactIds.map((id) => String(id).trim()))]
      : [];
    if (
      evidenceArtifactIds.length === 0 ||
      evidenceArtifactIds.some((artifactId) => !workOrder.artifactRefs.includes(artifactId))
    ) {
      throw conflict('VerificationProof artifact evidence must belong to the Builder WorkOrder');
    }
    if (!Object.values(VERIFICATION_PROOF_STATUS).includes(input.status)) {
      throw conflict('VerificationProof status must be passed or failed');
    }
    const requestDigest = computeVerificationProofRequestDigest({
      acceptanceCriterionId: criterion.id,
      criterionRecordDigest: criterion.recordDigest,
      workOrderDigest: input.workOrderDigest,
      status: input.status,
      evidenceArtifactIds,
      proofApproval: input.proofApproval,
    });
    const existing = getCriterionProofs(state, criterion.id).find(
      (proof) => proof.requestDigest === requestDigest,
    );
    if (existing) {
      return { ...bundle, criterion, proof: existing, idempotent: true };
    }
    const previousProofs = getCriterionProofs(state, criterion.id);
    const proof = createVerificationProof({
      id: nextVerificationProofId(state),
      criterion,
      workOrder,
      attempt: previousProofs.length + 1,
      status: input.status,
      verificationInputDigest: buildManualVerificationInputDigest(
        state,
        evidenceArtifactIds,
      ),
      evidenceArtifactIds,
      proofApproval: input.proofApproval,
      requestDigest,
    });
    state.verificationProofs[proof.id] = proof;
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, bundle.executionPlan.id),
      criterion,
      proof,
      idempotent: false,
    };
  }

  async function runWorkOrderVerificationProof(input) {
    const expectedFields = [
      'acceptanceCriterionId',
      'criterionRecordDigest',
      'executionPlanId',
      'proofApproval',
      'sourceDigest',
      'workOrderDigest',
      'workOrderId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('Command VerificationProof request has unexpected or missing fields');
    }
    const initialState = store.loadStateReadonly();
    const initial = assertCriterionWorkOrderBinding(initialState, input);
    if (initial.criterion.proofMode !== 'command') {
      throw conflict('Only command criteria can use the node-check proof path');
    }
    const project = assertProject(initial.bundle.executionPlan.projectId, initialState);
    const verificationInputDigest = computeSourceBoundVerificationInputDigest({
      projectRoot: project.projectPath,
      targetPathAllowlist: initial.workOrder.targetPathAllowlist,
      commands: initial.criterion.sourceValues,
    });
    const requestDigest = computeVerificationProofRequestDigest({
      acceptanceCriterionId: initial.criterion.id,
      criterionRecordDigest: initial.criterion.recordDigest,
      workOrderDigest: input.workOrderDigest,
      commands: initial.criterion.sourceValues,
      verificationInputDigest,
      proofApproval: input.proofApproval,
    });
    const existing = getCriterionProofs(initialState, initial.criterion.id).find(
      (proof) => proof.requestDigest === requestDigest,
    );
    if (existing) {
      return { ...initial.bundle, criterion: initial.criterion, proof: existing, idempotent: true };
    }
    const report = await runSourceBoundNodeChecks({
      projectRoot: project.projectPath,
      targetPathAllowlist: initial.workOrder.targetPathAllowlist,
      commands: initial.criterion.sourceValues,
    });
    if (report.verificationInputDigest !== verificationInputDigest) {
      throw conflict('Command VerificationProof source changed before execution');
    }

    const state = store.loadStateReadonly();
    const current = assertCriterionWorkOrderBinding(state, input);
    if (current.criterion.recordDigest !== initial.criterion.recordDigest) {
      throw conflict('Command VerificationProof criterion changed during execution');
    }
    const previousProofs = getCriterionProofs(state, current.criterion.id);
    const replay = previousProofs.find((proof) => proof.requestDigest === requestDigest);
    if (replay) {
      return { ...current.bundle, criterion: current.criterion, proof: replay, idempotent: true };
    }
    const proof = createVerificationProof({
      id: nextVerificationProofId(state),
      criterion: current.criterion,
      workOrder: current.workOrder,
      attempt: previousProofs.length + 1,
      status:
        report.verdict === 'passed'
          ? VERIFICATION_PROOF_STATUS.PASSED
          : VERIFICATION_PROOF_STATUS.FAILED,
      verificationInputDigest: report.verificationInputDigest,
      commandResults: report.checks,
      proofApproval: input.proofApproval,
      requestDigest,
    });
    state.verificationProofs[proof.id] = proof;
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, current.bundle.executionPlan.id),
      criterion: current.criterion,
      proof,
      idempotent: false,
    };
  }

  function buildWorkOrderVerificationStatusFromState(state, executionPlanId, workOrderId) {
    const bundle = getReviewedDeliveryRoleBundle(state, executionPlanId);
    const workOrder = assertWorkOrder(workOrderId, state);
    if (workOrder.executionPlanId !== bundle.executionPlan.id) {
      throw conflict('WorkOrder does not belong to the requested ExecutionPlan');
    }
    const project = assertProject(bundle.executionPlan.projectId, state);
    const criteria = workOrder.acceptanceCriterionRefs.map((id) =>
      assertAcceptanceCriterion(id, state));
    const entries = criteria.map((criterion) => {
      const proofs = getCriterionProofs(state, criterion.id);
      const latestProof = proofs.at(-1) || null;
      let current = Boolean(latestProof?.status === VERIFICATION_PROOF_STATUS.PASSED);
      if (current && criterion.proofMode === 'command') {
        const currentDigest = computeSourceBoundVerificationInputDigest({
          projectRoot: project.projectPath,
          targetPathAllowlist: workOrder.targetPathAllowlist,
          commands: criterion.sourceValues,
        });
        current = currentDigest === latestProof.verificationInputDigest;
      }
      return {
        criterion,
        latestProof,
        proofCount: proofs.length,
        current,
      };
    });
    return {
      executionPlanId,
      workOrderId,
      criteriaRequired: criteria.length > 0,
      ready: criteria.length > 0 && entries.every((entry) => entry.current),
      entries,
    };
  }

  function getWorkOrderVerificationStatus(executionPlanId, workOrderId) {
    return buildWorkOrderVerificationStatusFromState(
      store.loadStateReadonly(),
      executionPlanId,
      workOrderId,
    );
  }

  function assertBuilderVerificationReady(state, bundle) {
    const builder = bundle.byRole.builder;
    if (builder.acceptanceCriterionRefs.length === 0) return null;

    const status = buildWorkOrderVerificationStatusFromState(
      state,
      bundle.executionPlan.id,
      builder.id,
    );
    if (!status.ready) {
      throw conflict(
        `Builder WorkOrder ${builder.id} requires current passed VerificationProofs`,
      );
    }
    return status;
  }

  function getReviewedDeliveryRoleBundle(state, executionPlanId) {
    const bundle = getExecutionPlanBundleFromState(state, executionPlanId);
    const byRole = Object.fromEntries(bundle.workOrders.map((entry) => [entry.role, entry]));

    if (
      bundle.workOrders.length !== 3 ||
      !byRole.builder ||
      !byRole.reviewer ||
      !byRole.qa
    ) {
      throw conflict(`ExecutionPlan ${executionPlanId} must contain Builder, Reviewer, and QA`);
    }

    return { ...bundle, byRole };
  }

  function appendUniqueRefs(current, additions) {
    return [...new Set([...(current || []), ...(additions || [])].filter(Boolean))];
  }

  function getWorkflowCheckpointContext(state, bundle) {
    const project = assertProject(bundle.executionPlan.projectId, state);
    return {
      executionPlan: bundle.executionPlan,
      workOrders: bundle.workOrders,
      projectProvider: project.provider,
    };
  }

  function appendWorkflowCheckpoint(state, bundle, stage, options = {}) {
    const executionPlan = bundle.executionPlan;
    const createdAt = options.createdAt || new Date().toISOString();
    const checkpoint = createWorkflowCheckpoint({
      ...getWorkflowCheckpointContext(state, bundle),
      id: nextWorkflowCheckpointId(state),
      stage,
      attempt: executionPlan.checkpointRefs.length + 1,
      resumedFromCheckpointId: options.resumedFromCheckpointId || null,
      stopReason: options.stopReason || null,
      createdAt,
    });
    state.workflowCheckpoints[checkpoint.id] = checkpoint;
    executionPlan.checkpointRefs.push(checkpoint.id);
    executionPlan.latestCheckpointId = checkpoint.id;
    return checkpoint;
  }

  function consumeLatestCheckpoint(state, executionPlan, stage, stopReason) {
    if (!executionPlan.latestCheckpointId) return null;
    const checkpoint = assertWorkflowCheckpoint(executionPlan.latestCheckpointId, state);
    if (
      checkpoint.stage !== stage ||
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.READY
    ) {
      return null;
    }
    checkpoint.status = WORKFLOW_CHECKPOINT_STATUS.CONSUMED;
    checkpoint.stopReason = stopReason;
    checkpoint.updatedAt = new Date().toISOString();
    return checkpoint;
  }

  function assertReviewedDeliverySourceCurrent(bundle, state) {
    const project = assertProject(bundle.executionPlan.projectId, state);
    assertRealCouncilSourceCurrent(bundle.councilSession, bundle.mission, project);

    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw conflict('Reviewed-delivery continuation supports local-stub only');
    }

    return project;
  }

  function assertReviewedDeliveryPlanApproval(bundle) {
    const { approval, executionPlan } = bundle;

    if (
      approval.status !== APPROVAL_STATUS.APPROVED ||
      approval.allowedNextAction !== WORK_ORDER_ACTION.START_SEQUENTIAL ||
      approval.taskId !== executionPlan.controlTaskId ||
      approval.metadata?.executionPlanId !== executionPlan.id ||
      approval.metadata?.controlTaskId !== executionPlan.controlTaskId ||
      approval.metadata?.previewId !== executionPlan.previewId ||
      approval.metadata?.sourceDigest !== executionPlan.sourceDigest
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} does not have its exact plan approval`);
    }
  }

  function buildExecutionPlanRecoveryFromState(state, executionPlanId) {
    const bundle = getReviewedDeliveryRoleBundle(state, executionPlanId);
    const { executionPlan, latestCheckpoint } = bundle;
    const activeWorkOrder = executionPlan.activeWorkOrderId
      ? assertWorkOrder(executionPlan.activeWorkOrderId, state)
      : null;

    if (activeWorkOrder?.status === WORK_ORDER_STATUS.ACTIVE) {
      return deepFreeze({
        executionPlanId,
        checkpoint: latestCheckpoint ? cloneJsonValue(latestCheckpoint) : null,
        classification: WORKFLOW_CHECKPOINT_STATUS.QUARANTINED,
        current: false,
        nextAllowedActions: [],
        stopReason: `active-${activeWorkOrder.role}-stage-is-ambiguous`,
      });
    }
    if (!latestCheckpoint) {
      return deepFreeze({
        executionPlanId,
        checkpoint: null,
        classification: 'unavailable',
        current: false,
        nextAllowedActions: [],
        stopReason: 'no-workflow-checkpoint',
      });
    }

    const currentBindings = recomputeWorkflowCheckpoint(
      latestCheckpoint,
      getWorkflowCheckpointContext(state, bundle),
    );
    let sourceCurrent = true;
    try {
      assertReviewedDeliverySourceCurrent(bundle, state);
    } catch (_error) {
      sourceCurrent = false;
    }
    const current = currentBindings.current && sourceCurrent;
    const reviewerReexecutionQaGate = Boolean(
      latestCheckpoint.stage === WORKFLOW_CHECKPOINT_STAGE.QA_READY &&
        latestCheckpoint.stopReason === 'reviewer-reexecution-passed-qa-ready' &&
        executionPlan.stopReason === 'separate-qa-execution-decision-required',
    );
    let classification = latestCheckpoint.status;
    let stopReason = latestCheckpoint.stopReason;

    if (
      executionPlan.status === EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      latestCheckpoint.stage === WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY
    ) {
      classification = WORKFLOW_CHECKPOINT_STATUS.TERMINAL;
    } else if (
      latestCheckpoint.status === WORKFLOW_CHECKPOINT_STATUS.READY &&
      !current
    ) {
      classification = WORKFLOW_CHECKPOINT_STATUS.STALE;
      stopReason = 'checkpoint-input-authority-or-source-drift';
    }

    return deepFreeze({
      executionPlanId,
      checkpoint: cloneJsonValue(latestCheckpoint),
      classification,
      current,
      currentDigests: {
        sourceDigest: currentBindings.sourceDigest,
        inputDigest: currentBindings.inputDigest,
        authorityDigest: currentBindings.authorityDigest,
        checkpointDigest: currentBindings.checkpointDigest,
      },
      nextAllowedActions:
        classification === WORKFLOW_CHECKPOINT_STATUS.READY &&
        current &&
        !reviewerReexecutionQaGate
          ? latestCheckpoint.nextAllowedActions
          : [],
      stopReason: stopReason || null,
    });
  }

  function getExecutionPlanRecovery(executionPlanId) {
    return buildExecutionPlanRecoveryFromState(store.loadState(), executionPlanId);
  }

  function previewExecutionPlanContinuation(input) {
    const expectedFields = [
      'action',
      'authorityDigest',
      'checkpointDigest',
      'checkpointId',
      'continuationSpec',
      'evaluatedAt',
      'executionPlanId',
      'inputDigest',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('Execution continuation preview has unexpected or missing fields');
    }
    const continuationFields = [
      'cancellationRequested',
      'deadlineAt',
      'maxSteps',
      'previousProgressDigest',
    ].sort();
    const actualContinuationFields = Object.keys(input.continuationSpec || {}).sort();
    if (
      actualContinuationFields.length !== continuationFields.length ||
      actualContinuationFields.some((field, index) => field !== continuationFields[index])
    ) {
      throw conflict('continuationSpec has unexpected or missing fields');
    }

    const state = store.loadStateReadonly();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(
        `ExecutionPlan ${bundle.executionPlan.id} uses the operator-stepped scheduler`,
      );
    }
    const checkpoint = assertWorkflowCheckpoint(input.checkpointId, state);
    if (
      checkpoint.executionPlanId !== bundle.executionPlan.id ||
      bundle.executionPlan.latestCheckpointId !== checkpoint.id
    ) {
      throw conflict('Execution continuation requires the latest checkpoint for this plan');
    }
    assertExactCheckpointTuple(input, checkpoint);
    const action = String(input.action || '').trim();
    if (!checkpoint.nextAllowedActions.includes(action)) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} does not allow action ${action || 'empty'}`);
    }
    const recovery = buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id);
    if (
      recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      !recovery.current ||
      !recovery.nextAllowedActions.includes(action)
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is stale or not resumable`);
    }
    assertReviewedDeliveryPlanApproval(bundle);
    assertReviewedDeliverySourceCurrent(bundle, state);
    if (listPendingBlockingDecisionItems(bundle.executionPlan.controlTaskId, state).length > 0) {
      throw conflict('Execution continuation is blocked by an unresolved decision');
    }
    if (checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY) {
      assertBuilderVerificationReady(state, bundle);
    }

    try {
      return compileExecutionContinuationPreview({
        action,
        checkpoint,
        continuationSpec: input.continuationSpec,
        evaluatedAt: input.evaluatedAt,
        executionPlanId: bundle.executionPlan.id,
      });
    } catch (error) {
      throw conflict(error.message);
    }
  }

  function assertExactCheckpointTuple(input, checkpoint) {
    for (const field of ['checkpointDigest', 'inputDigest', 'authorityDigest']) {
      const requested = String(input[field] || '').trim();
      if (!requested || requested !== checkpoint[field]) {
        throw conflict(`WorkflowCheckpoint ${field} does not match`);
      }
    }
  }

  function resumeExecutionPlanFromCheckpoint(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(
        `ExecutionPlan ${bundle.executionPlan.id} requires the operator step endpoint`,
      );
    }
    const checkpoint = assertWorkflowCheckpoint(input.checkpointId, state);
    if (checkpoint.executionPlanId !== bundle.executionPlan.id) {
      throw conflict('WorkflowCheckpoint does not belong to the requested ExecutionPlan');
    }
    assertExactCheckpointTuple(input, checkpoint);
    const action = String(input.action || '').trim();
    if (!checkpoint.nextAllowedActions.includes(action)) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} does not allow action ${action || 'empty'}`);
    }

    if (checkpoint.status === WORKFLOW_CHECKPOINT_STATUS.CONSUMED) {
      const linkedCheckpoint = bundle.workflowCheckpoints.find(
        (entry) => entry.resumedFromCheckpointId === checkpoint.id,
      ) || null;
      return {
        ...bundle,
        checkpoint,
        linkedCheckpoint,
        recovery: buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id),
        resumeStage: null,
        idempotent: true,
      };
    }
    if (
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      bundle.executionPlan.latestCheckpointId !== checkpoint.id
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is not the current ready checkpoint`);
    }

    const recovery = buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id);
    if (
      recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      !recovery.current ||
      !recovery.nextAllowedActions.includes(action)
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is stale or not resumable`);
    }
    assertReviewedDeliveryPlanApproval(bundle);
    assertReviewedDeliverySourceCurrent(bundle, state);
    if (listPendingBlockingDecisionItems(bundle.executionPlan.controlTaskId, state).length > 0) {
      throw conflict('Checkpoint resume is blocked by an unresolved decision');
    }

    const now = new Date().toISOString();
    let resumeStage;
    if (
      checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY &&
      action === WORKFLOW_CHECKPOINT_ACTION.RESUME_REVIEWER &&
      bundle.executionPlan.status === EXECUTION_PLAN_STATUS.ACTIVE &&
      bundle.executionPlan.activeWorkOrderId === bundle.byRole.reviewer.id &&
      bundle.byRole.builder.status === WORK_ORDER_STATUS.COMPLETED &&
      bundle.byRole.reviewer.status === WORK_ORDER_STATUS.QUEUED
    ) {
      assertBuilderVerificationReady(state, bundle);
      resumeStage = 'reviewer';
      bundle.executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
      bundle.byRole.reviewer.status = WORK_ORDER_STATUS.ACTIVE;
      bundle.byRole.reviewer.startedAt = now;
      bundle.byRole.reviewer.updatedAt = now;
    } else if (
      checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.QA_READY &&
      action === WORKFLOW_CHECKPOINT_ACTION.RESUME_QA &&
      bundle.executionPlan.status === EXECUTION_PLAN_STATUS.REVIEWING &&
      bundle.executionPlan.activeWorkOrderId === bundle.byRole.qa.id &&
      bundle.byRole.reviewer.status === WORK_ORDER_STATUS.COMPLETED &&
      bundle.byRole.qa.status === WORK_ORDER_STATUS.QUEUED
    ) {
      resumeStage = 'qa';
      bundle.byRole.qa.status = WORK_ORDER_STATUS.ACTIVE;
      bundle.byRole.qa.startedAt = now;
      bundle.byRole.qa.updatedAt = now;
    } else {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} no longer matches its durable boundary`);
    }

    checkpoint.status = WORKFLOW_CHECKPOINT_STATUS.CONSUMED;
    checkpoint.stopReason = `operator-${action}`;
    checkpoint.updatedAt = now;
    bundle.executionPlan.updatedAt = now;
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, bundle.executionPlan.id),
      checkpoint,
      linkedCheckpoint: null,
      recovery: buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id),
      resumeStage,
      idempotent: false,
    };
  }

  function cancelExecutionPlanCheckpoint(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(
        `ExecutionPlan ${bundle.executionPlan.id} recovery commands remain blocked`,
      );
    }
    const checkpoint = assertWorkflowCheckpoint(input.checkpointId, state);
    if (checkpoint.executionPlanId !== bundle.executionPlan.id) {
      throw conflict('WorkflowCheckpoint does not belong to the requested ExecutionPlan');
    }
    assertExactCheckpointTuple(input, checkpoint);
    if (
      ![
        WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
        WORKFLOW_CHECKPOINT_STAGE.QA_READY,
      ].includes(checkpoint.stage)
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} stage is not cancellable`);
    }
    if (checkpoint.status === WORKFLOW_CHECKPOINT_STATUS.CANCELLED) {
      return {
        ...bundle,
        checkpoint,
        recovery: buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id),
        idempotent: true,
      };
    }
    const recovery = buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id);
    if (
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      bundle.executionPlan.latestCheckpointId !== checkpoint.id ||
      recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      !recovery.current
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is stale or not cancellable`);
    }
    checkpoint.status = WORKFLOW_CHECKPOINT_STATUS.CANCELLED;
    checkpoint.stopReason = String(input.reason || '').trim() || 'operator-cancelled';
    checkpoint.updatedAt = new Date().toISOString();
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, bundle.executionPlan.id),
      checkpoint,
      recovery: buildExecutionPlanRecoveryFromState(state, bundle.executionPlan.id),
      idempotent: false,
    };
  }

  function assertOperatorStepInput(input) {
    const expectedFields = [
      'action',
      'authorityDigest',
      'checkpointDigest',
      'checkpointId',
      'evaluatedAt',
      'executionPlanId',
      'expectedWorkOrderId',
      'inputDigest',
      'sourceDigest',
      'terminalGateApprovalId',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('Operator WorkOrder step has unexpected or missing fields');
    }
    if (
      ![
        WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER,
        WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER,
        WORK_ORDER_ATTEMPT_ACTION.RUN_QA,
      ].includes(input.action)
    ) {
      throw conflict('Operator WorkOrder step action is invalid');
    }
    const evaluatedAt = String(input.evaluatedAt || '').trim();
    if (
      !Number.isFinite(Date.parse(evaluatedAt)) ||
      new Date(evaluatedAt).toISOString() !== evaluatedAt ||
      Date.parse(evaluatedAt) > Date.now() + 5 * 60 * 1000
    ) {
      throw conflict('Operator WorkOrder step evaluatedAt is invalid');
    }
    return evaluatedAt;
  }

  function beginOperatorSteppedWorkOrderStep(input) {
    const evaluatedAt = assertOperatorStepInput(input);
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, terminalGateApproval, byRole, councilSession } = bundle;
    const source = assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
      executionPlan,
    });
    if (input.sourceDigest !== executionPlan.sourceDigest) {
      throw conflict('Operator WorkOrder step sourceDigest does not match the durable plan');
    }
    assertReviewedDeliveryPlanApproval(bundle);

    const checkpoint = assertWorkflowCheckpoint(input.checkpointId, state);
    const requiredBoundary = {
      [WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER]: {
        stage: WORKFLOW_CHECKPOINT_STAGE.BUILDER_WAITING_GATE,
        workOrder: byRole.builder,
      },
      [WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER]: {
        stage: WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
        workOrder: byRole.reviewer,
      },
      [WORK_ORDER_ATTEMPT_ACTION.RUN_QA]: {
        stage: WORKFLOW_CHECKPOINT_STAGE.QA_READY,
        workOrder: byRole.qa,
      },
    }[input.action];
    if (
      input.action === WORK_ORDER_ATTEMPT_ACTION.RUN_QA &&
      checkpoint.stopReason === 'reviewer-reexecution-passed-qa-ready' &&
      executionPlan.stopReason === 'separate-qa-execution-decision-required'
    ) {
      throw conflict(
        'Reviewer re-execution QA requires a separate execution decision',
      );
    }
    if (
      checkpoint.executionPlanId !== executionPlan.id ||
      checkpoint.stage !== requiredBoundary.stage ||
      checkpoint.sourceDigest !== executionPlan.sourceDigest ||
      input.checkpointDigest !== checkpoint.checkpointDigest ||
      input.inputDigest !== checkpoint.inputDigest ||
      input.authorityDigest !== checkpoint.authorityDigest ||
      input.expectedWorkOrderId !== requiredBoundary.workOrder.id ||
      Date.parse(evaluatedAt) < Date.parse(checkpoint.createdAt)
    ) {
      throw conflict('Operator WorkOrder step checkpoint tuple is stale or divergent');
    }

    const approvalRefs = [...new Set(checkpoint.approvalRefs || [])];
    const expectedAuthorityDigest = computeWorkOrderAttemptAuthorityDigest({
      executionPlanId: executionPlan.id,
      expectedWorkOrderId: requiredBoundary.workOrder.id,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      action: input.action,
      sourceDigest: executionPlan.sourceDigest,
      checkpointRef: checkpoint.id,
      checkpointDigest: checkpoint.checkpointDigest,
      approvalRefs,
    });
    const prior = getPlanWorkOrderAttempts(state, executionPlan.id).find(
      (attempt) => attempt.action === input.action,
    );
    if (prior) {
      if (prior.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE) {
        throw conflict(
          `WorkOrderAttempt ${prior.id} is active and requires separately authorized recovery`,
        );
      }
      if (
        prior.workOrderId !== requiredBoundary.workOrder.id ||
        prior.sourceDigest !== executionPlan.sourceDigest ||
        prior.authorityDigest !== expectedAuthorityDigest
      ) {
        throw conflict(`ExecutionPlan ${executionPlan.id} step replay diverges`);
      }
      return {
        ...getExecutionPlanBundleFromState(state, executionPlan.id),
        workOrderAttempt: prior,
        idempotent: true,
      };
    }
    if (
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.READY ||
      executionPlan.latestCheckpointId !== checkpoint.id
    ) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is not current`);
    }
    const recomputed = recomputeWorkflowCheckpoint(
      checkpoint,
      getWorkflowCheckpointContext(state, bundle),
    );
    if (!recomputed.current) {
      throw conflict(`WorkflowCheckpoint ${checkpoint.id} is stale`);
    }

    if (input.action === WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER) {
      const requestedApprovalId = String(input.terminalGateApprovalId || '').trim();
      if (
        !terminalGateApproval ||
        requestedApprovalId !== terminalGateApproval.id ||
        executionPlan.terminalGateApprovalId !== terminalGateApproval.id ||
        terminalGateApproval.status !== APPROVAL_STATUS.APPROVED ||
        terminalGateApproval.taskId !== executionPlan.controlTaskId ||
        terminalGateApproval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION
      ) {
        throw conflict('Builder step requires the exact approved terminal gate');
      }
      const targetArtifact = assertArtifact(terminalGateApproval.targetArtifactId, state);
      const targetRun = assertRun(terminalGateApproval.targetRunId, state);
      if (
        targetArtifact.type !== ARTIFACT_TYPE.PREFLIGHT ||
        targetArtifact.taskId !== executionPlan.controlTaskId ||
        targetArtifact.runId !== targetRun.id ||
        !byRole.builder.artifactRefs.includes(targetArtifact.id) ||
        !byRole.builder.runRefs.includes(targetRun.id) ||
        listPendingBlockingDecisionItems(executionPlan.controlTaskId, state).length > 0
      ) {
        throw conflict('Builder terminal gate does not match current preflight evidence');
      }
    } else if (input.terminalGateApprovalId !== null) {
      throw conflict('Reviewer and QA steps must not provide terminalGateApprovalId');
    }
    if (input.action === WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER) {
      assertBuilderVerificationReady(state, bundle);
    }

    const workOrder = selectOperatorSteppedWorkOrder(
      state,
      executionPlan,
      input.action,
      input.expectedWorkOrderId,
    );
    const attempt = createActiveSchedulerAttempt(state, {
      action: input.action,
      approvalRefs,
      checkpoint,
      command: WORK_ORDER_ATTEMPT_COMMAND.STEP,
      executionPlan,
      source,
      workOrder,
    });
    consumeLatestCheckpoint(
      state,
      executionPlan,
      checkpoint.stage,
      `operator-stepped:${input.action}`,
    );
    const now = attempt.startedAt;
    workOrder.status = WORK_ORDER_STATUS.ACTIVE;
    workOrder.startedAt ||= now;
    workOrder.updatedAt = now;
    executionPlan.stopReason = null;
    executionPlan.stoppedAt = null;
    executionPlan.updatedAt = now;
    if (input.action === WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER) {
      workOrder.continuedAt = now;
      executionPlan.reviewedDeliveryDecisionRef = 'DEC-172';
    } else if (input.action === WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER) {
      executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
    }
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, executionPlan.id),
      workOrderAttempt: attempt,
      idempotent: false,
    };
  }

  function beginReviewedDeliveryContinuation(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, terminalGateApproval, byRole } = bundle;
    const requestedApprovalId = String(input.terminalGateApprovalId || '').trim();
    const requestedSourceDigest = String(input.sourceDigest || '').trim();

    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(
        `ExecutionPlan ${executionPlan.id} requires one explicit operator step per role`,
      );
    }

    if (!requestedSourceDigest || requestedSourceDigest !== executionPlan.sourceDigest) {
      throw conflict('Reviewed-delivery sourceDigest does not match the durable plan');
    }
    assertReviewedDeliveryPlanApproval(bundle);
    assertReviewedDeliverySourceCurrent(bundle, state);

    if (
      !terminalGateApproval ||
      requestedApprovalId !== terminalGateApproval.id ||
      executionPlan.terminalGateApprovalId !== terminalGateApproval.id ||
      terminalGateApproval.status !== APPROVAL_STATUS.APPROVED ||
      terminalGateApproval.taskId !== executionPlan.controlTaskId ||
      terminalGateApproval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION
    ) {
      throw conflict('Reviewed-delivery continuation requires the exact approved terminal gate');
    }

    const targetArtifact = assertArtifact(terminalGateApproval.targetArtifactId, state);
    const targetRun = assertRun(terminalGateApproval.targetRunId, state);
    if (
      targetArtifact.type !== ARTIFACT_TYPE.PREFLIGHT ||
      targetArtifact.taskId !== executionPlan.controlTaskId ||
      targetArtifact.runId !== targetRun.id ||
      !byRole.builder.artifactRefs.includes(targetArtifact.id) ||
      !byRole.builder.runRefs.includes(targetRun.id)
    ) {
      throw conflict('Terminal approval does not match the Builder preflight evidence');
    }
    if (listPendingBlockingDecisionItems(executionPlan.controlTaskId, state).length > 0) {
      throw conflict('Reviewed-delivery continuation is blocked by an unresolved decision');
    }
    if (executionPlan.status === EXECUTION_PLAN_STATUS.DELIVERY_READY) {
      return { ...bundle, idempotent: true };
    }
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.ACTIVE ||
      executionPlan.activeWorkOrderId !== byRole.builder.id ||
      executionPlan.stoppedAt !== 'request-builder-live-mutation-approval' ||
      byRole.builder.status !== WORK_ORDER_STATUS.WAITING_GATE
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not at the Builder waiting-gate`);
    }

    const now = new Date().toISOString();
    consumeLatestCheckpoint(
      state,
      executionPlan,
      WORKFLOW_CHECKPOINT_STAGE.BUILDER_WAITING_GATE,
      'continued-by-dec-094',
    );
    byRole.builder.status = WORK_ORDER_STATUS.ACTIVE;
    byRole.builder.updatedAt = now;
    byRole.builder.continuedAt = now;
    executionPlan.stopReason = null;
    executionPlan.stoppedAt = null;
    executionPlan.reviewedDeliveryDecisionRef = 'DEC-094';
    executionPlan.nonGoals = [
      'Persist a DeliveryPackage or mark the Mission done.',
      'Automatically rework changes requested or retry failed WorkOrders.',
      'Run parallel, dynamic, autonomous, checkpoint, or provider-backed scheduling.',
      'Persist memory, mutate policy, commit, push, release, or call external connectors.',
    ];
    executionPlan.updatedAt = now;
    store.saveState(state);
    return { ...getExecutionPlanBundleFromState(state, executionPlan.id), idempotent: false };
  }

  function completeReviewedDeliveryBuilder(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, terminalGateApproval, byRole } = bundle;
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.ACTIVE ||
      executionPlan.activeWorkOrderId !== byRole.builder.id ||
      byRole.builder.status !== WORK_ORDER_STATUS.ACTIVE
    ) {
      throw conflict(`Builder WorkOrder ${byRole.builder.id} is not active`);
    }

    const run = assertRun(input.runId, state);
    const artifactInputs = [
      [input.changeSummaryArtifactId, ARTIFACT_TYPE.CHANGE_SUMMARY, 'changeSummary'],
      [input.patchArtifactId, ARTIFACT_TYPE.PATCH, 'patch'],
      [input.diffArtifactId, ARTIFACT_TYPE.DIFF, 'diff'],
    ];
    const changedFiles = [...new Set((input.changedFiles || []).map((entry) => String(entry)))];
    if (
      run.taskId !== executionPlan.controlTaskId ||
      run.role !== 'builder' ||
      run.status !== RUN_STATUS.COMPLETED ||
      run.summary?.executionMode !== 'live-mutation' ||
      run.summary?.approvalId !== executionPlan.terminalGateApprovalId ||
      terminalGateApproval?.metadata?.consumedByRunId !== run.id ||
      terminalGateApproval?.metadata?.consumedPreflightArtifactId !==
        terminalGateApproval?.targetArtifactId ||
      terminalGateApproval?.metadata?.consumedPreflightRunId !== terminalGateApproval?.targetRunId ||
      changedFiles.length === 0 ||
      !sameExactStringArrays(run.summary?.changedFiles || [], changedFiles)
    ) {
      throw conflict('Builder completion does not match the approved live-mutation run');
    }

    const artifacts = artifactInputs.map(([artifactId, type, summaryKey]) => {
      const artifact = assertArtifact(artifactId, state);
      if (
        artifact.type !== type ||
        artifact.taskId !== executionPlan.controlTaskId ||
        artifact.runId !== run.id ||
        run.summary?.artifactIds?.[summaryKey] !== artifact.id
      ) {
        throw conflict(`Builder ${type} evidence does not match run ${run.id}`);
      }
      return artifact;
    });

    const now = new Date().toISOString();
    byRole.builder.status = WORK_ORDER_STATUS.COMPLETED;
    byRole.builder.runRefs = appendUniqueRefs(byRole.builder.runRefs, [run.id]);
    byRole.builder.artifactRefs = appendUniqueRefs(
      byRole.builder.artifactRefs,
      artifacts.map((entry) => entry.id),
    );
    byRole.builder.changedFiles = changedFiles;
    byRole.builder.completionRunId = run.id;
    byRole.builder.completedAt = now;
    byRole.builder.updatedAt = now;
    byRole.reviewer.status = WORK_ORDER_STATUS.QUEUED;
    byRole.reviewer.authority = { ...byRole.reviewer.authority, executeAllowed: true };
    byRole.reviewer.updatedAt = now;
    executionPlan.activeWorkOrderId = byRole.reviewer.id;
    executionPlan.runRefs = appendUniqueRefs(executionPlan.runRefs, [run.id]);
    executionPlan.artifactRefs = appendUniqueRefs(
      executionPlan.artifactRefs,
      artifacts.map((entry) => entry.id),
    );
    executionPlan.updatedAt = now;
    const resumedFromCheckpointId = executionPlan.latestCheckpointId;
    const checkpoint = appendWorkflowCheckpoint(
      state,
      bundle,
      WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
      {
        createdAt: now,
        resumedFromCheckpointId,
        stopReason: 'builder-completed-reviewer-ready',
      },
    );
    if (bundle.councilSession.staffingEntryRef) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: WORK_ORDER_ATTEMPT_STATUS.COMPLETED,
        checkpointRef: checkpoint.id,
        approvalRefs: [
          executionPlan.approvalId,
          executionPlan.terminalGateApprovalId,
          ...byRole.builder.approvalRefs,
        ].filter(Boolean),
        runRefs: byRole.builder.runRefs,
        artifactRefs: byRole.builder.artifactRefs,
        decisionInboxItemRefs: byRole.builder.inboxItemRefs,
        stopReason: null,
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function beginReviewedDeliveryReviewer(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole } = bundle;
    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(
        `ExecutionPlan ${executionPlan.id} requires an explicit run-reviewer step`,
      );
    }
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.ACTIVE ||
      executionPlan.activeWorkOrderId !== byRole.reviewer.id ||
      byRole.builder.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.QUEUED
    ) {
      throw conflict(`Reviewer WorkOrder ${byRole.reviewer.id} is not dependency-ready`);
    }

    if (executionPlan.latestCheckpointId) {
      const recovery = buildExecutionPlanRecoveryFromState(state, executionPlan.id);
      if (
        recovery.checkpoint?.stage === WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY &&
        (recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.READY || !recovery.current)
      ) {
        throw conflict(`Reviewer checkpoint ${recovery.checkpoint.id} is not current`);
      }
    }
    assertBuilderVerificationReady(state, bundle);

    const now = new Date().toISOString();
    consumeLatestCheckpoint(
      state,
      executionPlan,
      WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
      'continued-by-dec-094',
    );
    executionPlan.status = EXECUTION_PLAN_STATUS.REVIEWING;
    executionPlan.updatedAt = now;
    byRole.reviewer.status = WORK_ORDER_STATUS.ACTIVE;
    byRole.reviewer.startedAt = now;
    byRole.reviewer.updatedAt = now;
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function completeReviewedDeliveryReviewer(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole } = bundle;
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.REVIEWING ||
      executionPlan.activeWorkOrderId !== byRole.reviewer.id ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.ACTIVE
    ) {
      throw conflict(`Reviewer WorkOrder ${byRole.reviewer.id} is not active`);
    }

    const run = assertRun(input.runId, state);
    const artifact = assertArtifact(input.reviewArtifactId, state);
    const reviewStatus = String(input.reviewStatus || '').trim();
    if (![REVIEW_STATUS.PASSED, REVIEW_STATUS.CHANGES_REQUESTED].includes(reviewStatus)) {
      throw conflict(`Reviewer completion has an invalid review status: ${reviewStatus || 'empty'}`);
    }
    const decisionInboxItem = input.decisionInboxItemId
      ? assertDecisionInboxItem(input.decisionInboxItemId, state)
      : null;
    if (
      run.taskId !== executionPlan.controlTaskId ||
      run.role !== 'reviewer' ||
      run.status !== RUN_STATUS.COMPLETED ||
      run.summary?.sourceRunId !== byRole.builder.completionRunId ||
      run.summary?.mappedReviewStatus !== reviewStatus ||
      run.summary?.reviewArtifactId !== artifact.id ||
      artifact.type !== ARTIFACT_TYPE.REVIEW ||
      artifact.taskId !== executionPlan.controlTaskId ||
      artifact.runId !== run.id
    ) {
      throw conflict('Reviewer completion does not match the Builder evidence chain');
    }
    if (
      decisionInboxItem &&
      (decisionInboxItem.taskId !== executionPlan.controlTaskId ||
        decisionInboxItem.sourceType !== DECISION_INBOX_SOURCE_TYPE.REVIEW ||
        decisionInboxItem.sourceId !== artifact.id ||
        decisionInboxItem.status !== DECISION_INBOX_STATUS.PENDING ||
        decisionInboxItem.blocksTask !== true)
    ) {
      throw conflict('Reviewer decision does not match the review artifact evidence chain');
    }

    const now = new Date().toISOString();
    byRole.reviewer.runRefs = appendUniqueRefs(byRole.reviewer.runRefs, [run.id]);
    byRole.reviewer.artifactRefs = appendUniqueRefs(byRole.reviewer.artifactRefs, [artifact.id]);
    byRole.reviewer.completionRunId = run.id;
    byRole.reviewer.reviewArtifactId = artifact.id;
    byRole.reviewer.completedAt = now;
    byRole.reviewer.updatedAt = now;
    executionPlan.runRefs = appendUniqueRefs(executionPlan.runRefs, [run.id]);
    executionPlan.artifactRefs = appendUniqueRefs(executionPlan.artifactRefs, [artifact.id]);
    executionPlan.updatedAt = now;
    let checkpoint = null;

    if (reviewStatus === REVIEW_STATUS.PASSED && !decisionInboxItem) {
      byRole.reviewer.status = WORK_ORDER_STATUS.COMPLETED;
      byRole.qa.status = WORK_ORDER_STATUS.QUEUED;
      byRole.qa.authority = { ...byRole.qa.authority, executeAllowed: true };
      byRole.qa.updatedAt = now;
      executionPlan.activeWorkOrderId = byRole.qa.id;
      executionPlan.stopReason = null;
      executionPlan.stoppedAt = null;
      checkpoint = appendWorkflowCheckpoint(state, bundle, WORKFLOW_CHECKPOINT_STAGE.QA_READY, {
        createdAt: now,
        resumedFromCheckpointId: executionPlan.latestCheckpointId,
        stopReason: 'reviewer-passed-qa-ready',
      });
    } else {
      byRole.reviewer.status = WORK_ORDER_STATUS.CHANGES_REQUESTED;
      byRole.reviewer.inboxItemRefs = appendUniqueRefs(
        byRole.reviewer.inboxItemRefs,
        [decisionInboxItem?.id],
      );
      executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
      executionPlan.activeWorkOrderId = null;
      executionPlan.stopReason = 'reviewer-changes-requested';
      executionPlan.stoppedAt = 'reviewer';
    }

    if (bundle.councilSession.staffingEntryRef) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: checkpoint
          ? WORK_ORDER_ATTEMPT_STATUS.COMPLETED
          : WORK_ORDER_ATTEMPT_STATUS.CHANGES_REQUESTED,
        checkpointRef: checkpoint?.id || null,
        approvalRefs: byRole.reviewer.approvalRefs,
        runRefs: byRole.reviewer.runRefs,
        artifactRefs: byRole.reviewer.artifactRefs,
        decisionInboxItemRefs: byRole.reviewer.inboxItemRefs,
        stopReason: checkpoint ? null : 'reviewer-changes-requested',
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }

    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function beginReviewedDeliveryQa(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole } = bundle;
    if (bundle.councilSession.staffingEntryRef) {
      throw conflict(`ExecutionPlan ${executionPlan.id} requires an explicit run-qa step`);
    }
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.REVIEWING ||
      executionPlan.activeWorkOrderId !== byRole.qa.id ||
      byRole.reviewer.status !== WORK_ORDER_STATUS.COMPLETED ||
      byRole.qa.status !== WORK_ORDER_STATUS.QUEUED
    ) {
      throw conflict(`QA WorkOrder ${byRole.qa.id} is not dependency-ready`);
    }

    if (executionPlan.latestCheckpointId) {
      const recovery = buildExecutionPlanRecoveryFromState(state, executionPlan.id);
      if (
        recovery.checkpoint?.stage === WORKFLOW_CHECKPOINT_STAGE.QA_READY &&
        (recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.READY || !recovery.current)
      ) {
        throw conflict(`QA checkpoint ${recovery.checkpoint.id} is not current`);
      }
    }

    const now = new Date().toISOString();
    consumeLatestCheckpoint(
      state,
      executionPlan,
      WORKFLOW_CHECKPOINT_STAGE.QA_READY,
      'continued-by-dec-094',
    );
    byRole.qa.status = WORK_ORDER_STATUS.ACTIVE;
    byRole.qa.startedAt = now;
    byRole.qa.updatedAt = now;
    executionPlan.updatedAt = now;
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function completeReviewedDeliveryQa(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole, mission } = bundle;
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.REVIEWING ||
      executionPlan.activeWorkOrderId !== byRole.qa.id ||
      byRole.qa.status !== WORK_ORDER_STATUS.ACTIVE
    ) {
      throw conflict(`QA WorkOrder ${byRole.qa.id} is not active`);
    }

    const run = assertRun(input.runId, state);
    const artifact = assertArtifact(input.qaEvidenceArtifactId, state);
    let evidence;
    try {
      evidence = JSON.parse(store.readArtifact(artifact.path));
    } catch (_error) {
      throw conflict(`QA evidence artifact ${artifact.id} is not valid JSON`);
    }
    const opsAttemptResume =
      Object.values(state.opsAttemptResumes || {}).find(
        (resume) => resume.executionPlanId === executionPlan.id,
      ) || null;
    if (
      run.taskId !== executionPlan.controlTaskId ||
      run.role !== 'qa' ||
      run.status !== RUN_STATUS.COMPLETED ||
      run.summary?.qaEvidenceArtifactId !== artifact.id ||
      artifact.type !== ARTIFACT_TYPE.QA_EVIDENCE ||
      artifact.taskId !== executionPlan.controlTaskId ||
      artifact.runId !== run.id ||
      evidence.executionPlanId !== executionPlan.id ||
      evidence.workOrderId !== byRole.qa.id ||
      evidence.builderRunId !== byRole.builder.completionRunId ||
      evidence.reviewerRunId !== byRole.reviewer.completionRunId ||
      evidence.sourceDigest !== executionPlan.sourceDigest ||
      !sameExactStringArrays(evidence.changedFiles || [], byRole.builder.changedFiles || []) ||
      (opsAttemptResume &&
        (input.opsAttemptResumeId !== opsAttemptResume.id ||
          input.workOrderAttemptId !== opsAttemptResume.replacementAttemptId ||
          run.metadata?.opsAttemptResumeId !== opsAttemptResume.id ||
          run.metadata?.workOrderAttemptId !==
            opsAttemptResume.replacementAttemptId ||
          evidence.opsAttemptResumeId !== opsAttemptResume.id ||
          evidence.workOrderAttemptId !==
            opsAttemptResume.replacementAttemptId))
    ) {
      throw conflict('QA completion does not match the reviewed Builder evidence chain');
    }

    const now = new Date().toISOString();
    byRole.qa.runRefs = appendUniqueRefs(byRole.qa.runRefs, [run.id]);
    byRole.qa.artifactRefs = appendUniqueRefs(byRole.qa.artifactRefs, [artifact.id]);
    byRole.qa.completionRunId = run.id;
    byRole.qa.qaEvidenceArtifactId = artifact.id;
    byRole.qa.completedAt = now;
    byRole.qa.updatedAt = now;
    executionPlan.runRefs = appendUniqueRefs(executionPlan.runRefs, [run.id]);
    executionPlan.artifactRefs = appendUniqueRefs(executionPlan.artifactRefs, [artifact.id]);
    executionPlan.activeWorkOrderId = null;
    executionPlan.updatedAt = now;

    const passed =
      evidence.verdict === 'passed' &&
      evidence.mutationDetected === false &&
      Array.isArray(evidence.checks) &&
      evidence.checks.length > 0 &&
      evidence.checks.every((check) => check.passed === true);
    let checkpoint = null;
    if (passed) {
      byRole.qa.status = WORK_ORDER_STATUS.COMPLETED;
      executionPlan.status = EXECUTION_PLAN_STATUS.DELIVERY_READY;
      executionPlan.stopReason = null;
      executionPlan.stoppedAt = 'response-only-delivery-package-preview';
      executionPlan.deliveryReadyAt = now;
      checkpoint = appendWorkflowCheckpoint(state, bundle, WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY, {
        createdAt: now,
        resumedFromCheckpointId: executionPlan.latestCheckpointId,
        stopReason: 'reviewed-delivery-completed',
      });
    } else {
      byRole.qa.status = WORK_ORDER_STATUS.FAILED;
      executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
      executionPlan.stopReason = 'qa-failed';
      executionPlan.stoppedAt = 'qa';
    }
    mission.status = 'executing';
    mission.updatedAt = now;

    if (bundle.councilSession.staffingEntryRef) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: passed
          ? WORK_ORDER_ATTEMPT_STATUS.COMPLETED
          : WORK_ORDER_ATTEMPT_STATUS.FAILED,
        checkpointRef: checkpoint?.id || null,
        approvalRefs: byRole.qa.approvalRefs,
        runRefs: byRole.qa.runRefs,
        artifactRefs: byRole.qa.artifactRefs,
        decisionInboxItemRefs: byRole.qa.inboxItemRefs,
        stopReason: passed ? null : 'qa-failed',
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }

    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function failReviewedDeliveryContinuation(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan } = bundle;
    if (executionPlan.status === EXECUTION_PLAN_STATUS.DELIVERY_READY) return bundle;

    const active = executionPlan.activeWorkOrderId
      ? assertWorkOrder(executionPlan.activeWorkOrderId, state)
      : null;
    const now = new Date().toISOString();
    executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
    executionPlan.activeWorkOrderId = null;
    executionPlan.stopReason = String(input.reason || 'reviewed-delivery-failed');
    executionPlan.stoppedAt = String(input.stoppedAt || active?.role || 'reviewed-delivery');
    executionPlan.updatedAt = now;
    if (
      active &&
      [WORK_ORDER_STATUS.ACTIVE, WORK_ORDER_STATUS.QUEUED].includes(active.status)
    ) {
      active.status = WORK_ORDER_STATUS.BLOCKED;
      active.updatedAt = now;
    }
    if (
      bundle.councilSession.staffingEntryRef &&
      getPlanWorkOrderAttempts(state, executionPlan.id).some(
        (attempt) =>
          attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE &&
          attempt.action !==
            WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
      )
    ) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: WORK_ORDER_ATTEMPT_STATUS.FAILED,
        approvalRefs: active?.approvalRefs || [],
        runRefs: active?.runRefs || [],
        artifactRefs: active?.artifactRefs || [],
        decisionInboxItemRefs: active?.inboxItemRefs || [],
        stopReason: executionPlan.stopReason,
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
  }

  function buildExecutionPlanDeliveryPreviewFromState(state, input) {
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole, mission } = bundle;
    if (input.sourceDigest && input.sourceDigest !== executionPlan.sourceDigest) {
      throw conflict('DeliveryPackage sourceDigest does not match the durable plan');
    }
    assertReviewedDeliveryPlanApproval(bundle);
    assertReviewedDeliverySourceCurrent(bundle, state);
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      Object.values(byRole).some((workOrder) => workOrder.status !== WORK_ORDER_STATUS.COMPLETED)
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not delivery-ready`);
    }
    if (listPendingBlockingDecisionItems(executionPlan.controlTaskId, state).length > 0) {
      throw conflict('DeliveryPackage is blocked by an unresolved decision');
    }
    const recovery = buildExecutionPlanRecoveryFromState(state, executionPlan.id);
    const terminalCheckpoint = bundle.latestCheckpoint;
    if (
      !terminalCheckpoint ||
      terminalCheckpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY ||
      terminalCheckpoint.status !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL ||
      recovery.classification !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL ||
      !recovery.current ||
      recovery.currentDigests?.checkpointDigest !== terminalCheckpoint.checkpointDigest
    ) {
      throw conflict('DeliveryPackage requires the exact current terminal WorkflowCheckpoint');
    }

    const reviewerRun = assertRun(byRole.reviewer.completionRunId, state);
    const reviewArtifact = assertArtifact(byRole.reviewer.reviewArtifactId, state);
    const qaRun = assertRun(byRole.qa.completionRunId, state);
    const qaArtifact = assertArtifact(byRole.qa.qaEvidenceArtifactId, state);
    const terminalGateApproval = assertApproval(executionPlan.terminalGateApprovalId, state);
    let qaEvidence;
    try {
      qaEvidence = JSON.parse(store.readArtifact(qaArtifact.path));
    } catch (_error) {
      throw conflict(`QA evidence artifact ${qaArtifact.id} is not valid JSON`);
    }
    if (
      reviewerRun.summary?.mappedReviewStatus !== REVIEW_STATUS.PASSED ||
      reviewerRun.summary?.reviewArtifactId !== reviewArtifact.id ||
      reviewArtifact.type !== ARTIFACT_TYPE.REVIEW ||
      reviewArtifact.runId !== reviewerRun.id ||
      qaRun.summary?.qaEvidenceArtifactId !== qaArtifact.id ||
      qaArtifact.type !== ARTIFACT_TYPE.QA_EVIDENCE ||
      qaArtifact.runId !== qaRun.id ||
      qaEvidence.verdict !== 'passed' ||
      qaEvidence.mutationDetected !== false ||
      terminalGateApproval.status !== APPROVAL_STATUS.APPROVED ||
      terminalGateApproval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION ||
      terminalGateApproval.metadata?.consumedByRunId !== byRole.builder.completionRunId
    ) {
      throw conflict('DeliveryPackage evidence chain is incomplete or failed');
    }

    const deliveredArtifactRefs = appendUniqueRefs(
      [],
      bundle.workOrders.flatMap((workOrder) => workOrder.artifactRefs),
    );
    const idDigest = crypto
      .createHash('sha256')
      .update(JSON.stringify([executionPlan.id, executionPlan.sourceDigest, deliveredArtifactRefs]))
      .digest('hex')
      .slice(0, 16);
    const preview = {
      id: `delivery-package-preview-${idDigest}`,
      projectId: executionPlan.projectId,
      missionId: mission.id,
      executionPlanId: executionPlan.id,
      terminalCheckpointId: terminalCheckpoint.id,
      terminalCheckpointDigest: terminalCheckpoint.checkpointDigest,
      deliveredArtifactRefs,
      workOrderResults: bundle.workOrders.map((workOrder) => ({
        workOrderId: workOrder.id,
        role: workOrder.role,
        status: workOrder.status,
        runRefs: [...workOrder.runRefs],
        artifactRefs: [...workOrder.artifactRefs],
      })),
      reviewerEvidenceRef: reviewArtifact.id,
      qaEvidenceRefs: [qaArtifact.id],
      verificationSummary: {
        kind: 'node-syntax-check',
        verdict: qaEvidence.verdict,
        checkCount: qaEvidence.checks.length,
        passedCheckCount: qaEvidence.checks.filter((entry) => entry.passed).length,
      },
      acceptedRisks: ['QA evidence covers Node.js syntax only.'],
      unresolvedItems: [],
      authoritySummary: {
        durablePersistenceAllowed: true,
        packageAcceptanceAllowed: false,
        missionDoneAllowed: false,
        taskCloseOutAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
        releaseAllowed: false,
        memoryPersistenceAllowed: false,
        learningAllowed: false,
        schedulingAllowed: false,
        providerExpansionAllowed: false,
        profilePolicyMutationAllowed: false,
      },
      sourceDigest: executionPlan.sourceDigest,
      generatedAt: qaArtifact.createdAt,
      persisted: false,
      missionDone: false,
    };
    preview.packageDigest = computeDeliveryPackageDigest(preview);
    return deepFreeze(preview);
  }

  function previewExecutionPlanDelivery(input) {
    return buildExecutionPlanDeliveryPreviewFromState(store.loadState(), input);
  }

  function getExecutionPlanDeliveryPackage(executionPlanId) {
    const bundle = getExecutionPlanBundleFromState(store.loadState(), executionPlanId);
    return {
      executionPlanId,
      deliveryPackage: bundle.latestDeliveryPackage,
      deliveryPackageRefs: [...bundle.executionPlan.deliveryPackageRefs],
    };
  }

  function findDeliveryPackageAcceptance(state, deliveryPackageId) {
    return (
      Object.values(state.deliveryPackageAcceptances).find(
        (acceptance) => acceptance.deliveryPackageId === deliveryPackageId,
      ) || null
    );
  }

  function getDeliveryPackageAcceptance(deliveryPackageId) {
    const state = store.loadState();
    const deliveryPackage = assertDeliveryPackage(deliveryPackageId, state);
    const acceptance = findDeliveryPackageAcceptance(state, deliveryPackageId);
    return {
      deliveryPackageId,
      deliveryPackage,
      acceptance,
      reviewStatus: acceptance
        ? DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED
        : DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED,
    };
  }

  function assertExactDeliveryPackageAcceptanceInput(input) {
    const expectedFields = [
      'deliveryPackageId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'checkpointId',
      'checkpointDigest',
      'decision',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('DeliveryPackage acceptance request has unexpected or missing fields');
    }
    if (String(input.decision || '').trim() !== 'accept') {
      throw conflict('DeliveryPackage acceptance decision must be accept');
    }
  }

  function assertExactDeliveryPackageAcceptanceTuple(input, deliveryPackage, preview) {
    const exactFields = [
      ['deliveryPackageId', deliveryPackage.id],
      ['previewId', preview.id],
      ['sourceDigest', preview.sourceDigest],
      ['packageDigest', preview.packageDigest],
      ['checkpointId', preview.terminalCheckpointId],
      ['checkpointDigest', preview.terminalCheckpointDigest],
    ];
    for (const [field, expected] of exactFields) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`DeliveryPackage acceptance ${field} does not match current evidence`);
      }
    }
    if (
      deliveryPackage.previewId !== preview.id ||
      deliveryPackage.sourceDigest !== preview.sourceDigest ||
      deliveryPackage.packageDigest !== preview.packageDigest ||
      deliveryPackage.terminalCheckpointId !== preview.terminalCheckpointId ||
      deliveryPackage.terminalCheckpointDigest !== preview.terminalCheckpointDigest ||
      deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED ||
      deliveryPackage.unresolvedItems.length !== 0
    ) {
      throw conflict(`DeliveryPackage ${deliveryPackage.id} is not acceptance-ready`);
    }
  }

  function acceptDeliveryPackage(input) {
    assertExactDeliveryPackageAcceptanceInput(input);
    const state = store.loadState();
    const deliveryPackage = assertDeliveryPackage(input.deliveryPackageId, state);
    const preview = buildExecutionPlanDeliveryPreviewFromState(state, {
      executionPlanId: deliveryPackage.executionPlanId,
      sourceDigest: input.sourceDigest,
    });
    assertExactDeliveryPackageAcceptanceTuple(input, deliveryPackage, preview);

    const existing = findDeliveryPackageAcceptance(state, deliveryPackage.id);
    if (existing) {
      for (const [field, expected] of [
        ['previewId', deliveryPackage.previewId],
        ['sourceDigest', deliveryPackage.sourceDigest],
        ['packageDigest', deliveryPackage.packageDigest],
        ['terminalCheckpointId', deliveryPackage.terminalCheckpointId],
        ['terminalCheckpointDigest', deliveryPackage.terminalCheckpointDigest],
      ]) {
        if (existing[field] !== expected) {
          throw conflict(`DeliveryPackage ${deliveryPackage.id} already has a different acceptance`);
        }
      }
      return {
        ...getExecutionPlanBundleFromState(state, deliveryPackage.executionPlanId),
        deliveryPackage,
        deliveryPackageAcceptance: assertDeliveryPackageAcceptance(existing.id, state),
        reviewStatus: DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED,
        idempotent: true,
      };
    }

    const acceptance = createDeliveryPackageAcceptance({
      id: nextDeliveryPackageAcceptanceId(state),
      deliveryPackage,
      createdAt: new Date().toISOString(),
    });
    state.deliveryPackageAcceptances[acceptance.id] = acceptance;
    store.saveState(state);

    return {
      ...getExecutionPlanBundleFromState(state, deliveryPackage.executionPlanId),
      deliveryPackage,
      deliveryPackageAcceptance: acceptance,
      reviewStatus: DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED,
      idempotent: false,
    };
  }

  function findMissionCloseOut(state, missionId) {
    return (
      Object.values(state.missionCloseOuts).find(
        (missionCloseOut) => missionCloseOut.missionId === missionId,
      ) || null
    );
  }

  function findExecutionPlanForMissionControlTask(state, mission, task) {
    return (
      Object.values(state.executionPlans).find(
        (executionPlan) =>
          executionPlan.missionId === mission.id && executionPlan.controlTaskId === task.id,
      ) || null
    );
  }

  function buildMissionCloseOutEnvelopeFromState(state, missionId) {
    const mission = assertMission(missionId, state);
    const linkedTask = mission.linkedTaskId ? assertTask(mission.linkedTaskId, state) : null;
    if (!linkedTask || linkedTask.missionId !== mission.id) {
      throw conflict(`Mission ${mission.id} does not have a valid linked control task`);
    }
    const executionPlan = findExecutionPlanForMissionControlTask(state, mission, linkedTask);
    if (!executionPlan) {
      throw conflict(`Mission ${mission.id} does not have a durable ExecutionPlan control task`);
    }
    const bundle = getExecutionPlanBundleFromState(state, executionPlan.id);
    const deliveryPackage = bundle.latestDeliveryPackage;
    const deliveryPackageAcceptance = bundle.latestDeliveryPackageAcceptance;
    if (!deliveryPackage || !deliveryPackageAcceptance) {
      throw conflict(`Mission ${mission.id} does not have accepted DeliveryPackage evidence`);
    }
    const missionCloseOut = findMissionCloseOut(state, mission.id);
    return {
      missionId: mission.id,
      mission,
      linkedTask,
      executionPlanBundle: bundle,
      deliveryPackage,
      deliveryPackageAcceptance,
      missionCloseOut,
      closeOutStatus: missionCloseOut
        ? MISSION_CLOSE_OUT_DECISION.CLOSED_OUT
        : 'ready-for-close-out-review',
    };
  }

  function getMissionCloseOut(missionId) {
    return buildMissionCloseOutEnvelopeFromState(store.loadState(), missionId);
  }

  function assertExactMissionCloseOutInput(input) {
    const expectedFields = [
      'missionId',
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'checkpointId',
      'checkpointDigest',
      'decision',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('Mission close-out request has unexpected or missing fields');
    }
    if (String(input.decision || '').trim() !== 'close-out') {
      throw conflict('Mission close-out decision must be close-out');
    }
  }

  function assertExactMissionCloseOutRecordInput(input, missionCloseOut) {
    for (const [field, expected] of [
      ['missionId', missionCloseOut.missionId],
      ['linkedTaskId', missionCloseOut.linkedTaskId],
      ['executionPlanId', missionCloseOut.executionPlanId],
      ['deliveryPackageId', missionCloseOut.deliveryPackageId],
      ['deliveryPackageAcceptanceId', missionCloseOut.deliveryPackageAcceptanceId],
      ['previewId', missionCloseOut.previewId],
      ['sourceDigest', missionCloseOut.sourceDigest],
      ['packageDigest', missionCloseOut.packageDigest],
      ['acceptanceDigest', missionCloseOut.acceptanceDigest],
      ['checkpointId', missionCloseOut.terminalCheckpointId],
      ['checkpointDigest', missionCloseOut.terminalCheckpointDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`Mission close-out ${field} does not match terminal evidence`);
      }
    }
  }

  function assertMissionCloseOutReady(state, input, envelope) {
    const {
      mission,
      linkedTask,
      executionPlanBundle,
      deliveryPackage,
      deliveryPackageAcceptance,
    } = envelope;
    const { executionPlan, workOrders, latestCheckpoint } = executionPlanBundle;
    const gateState = computeTaskGateState(linkedTask, state);
    const activeGates = listActiveTaskGates(gateState);
    if (mission.status !== 'executing') {
      throw conflict(`Mission ${mission.id} must be executing before close-out`);
    }
    if (
      linkedTask.lifecycleState !== TASK_LIFECYCLE.REVIEW ||
      linkedTask.review?.required !== true ||
      linkedTask.review?.status !== REVIEW_STATUS.PASSED
    ) {
      throw conflict(`Task ${linkedTask.id} must have passed review in Review before close-out`);
    }
    if (activeGates.length > 0) {
      throw conflict(
        `Task ${linkedTask.id} cannot close out while gates remain active: ${activeGates.join(', ')}`,
      );
    }
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      executionPlan.activeWorkOrderId !== null ||
      workOrders.length !== 3 ||
      workOrders.some((workOrder) => workOrder.status !== WORK_ORDER_STATUS.COMPLETED)
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not delivery-ready for close-out`);
    }
    const preview = buildExecutionPlanDeliveryPreviewFromState(state, {
      executionPlanId: executionPlan.id,
      sourceDigest: input.sourceDigest,
    });
    for (const [field, expected] of [
      ['missionId', mission.id],
      ['linkedTaskId', linkedTask.id],
      ['executionPlanId', executionPlan.id],
      ['deliveryPackageId', deliveryPackage.id],
      ['deliveryPackageAcceptanceId', deliveryPackageAcceptance.id],
      ['previewId', preview.id],
      ['sourceDigest', preview.sourceDigest],
      ['packageDigest', preview.packageDigest],
      ['acceptanceDigest', deliveryPackageAcceptance.acceptanceDigest],
      ['checkpointId', preview.terminalCheckpointId],
      ['checkpointDigest', preview.terminalCheckpointDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`Mission close-out ${field} does not match current evidence`);
      }
    }
    if (
      deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED ||
      deliveryPackage.unresolvedItems.length !== 0 ||
      deliveryPackage.previewId !== preview.id ||
      deliveryPackage.sourceDigest !== preview.sourceDigest ||
      deliveryPackage.packageDigest !== preview.packageDigest ||
      deliveryPackage.terminalCheckpointId !== preview.terminalCheckpointId ||
      deliveryPackage.terminalCheckpointDigest !== preview.terminalCheckpointDigest ||
      deliveryPackageAcceptance.deliveryPackageId !== deliveryPackage.id ||
      deliveryPackageAcceptance.decision !== DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED ||
      deliveryPackageAcceptance.previewId !== preview.id ||
      deliveryPackageAcceptance.sourceDigest !== preview.sourceDigest ||
      deliveryPackageAcceptance.packageDigest !== preview.packageDigest ||
      deliveryPackageAcceptance.terminalCheckpointId !== preview.terminalCheckpointId ||
      deliveryPackageAcceptance.terminalCheckpointDigest !== preview.terminalCheckpointDigest ||
      !latestCheckpoint ||
      latestCheckpoint.id !== preview.terminalCheckpointId ||
      latestCheckpoint.checkpointDigest !== preview.terminalCheckpointDigest ||
      latestCheckpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY ||
      latestCheckpoint.status !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL
    ) {
      throw conflict(`Mission ${mission.id} accepted delivery evidence is not close-out-ready`);
    }
    return gateState;
  }

  function closeOutMissionAndTask(input) {
    assertExactMissionCloseOutInput(input);
    const state = store.loadState();
    const existing = findMissionCloseOut(state, input.missionId);
    if (existing) {
      assertExactMissionCloseOutRecordInput(input, existing);
      return {
        ...buildMissionCloseOutEnvelopeFromState(state, input.missionId),
        missionCloseOut: assertMissionCloseOut(existing.id, state),
        idempotent: true,
      };
    }

    const envelope = buildMissionCloseOutEnvelopeFromState(state, input.missionId);
    const gateState = assertMissionCloseOutReady(state, input, envelope);
    const now = new Date().toISOString();
    const missionCloseOut = createMissionCloseOut({
      id: nextMissionCloseOutId(state),
      mission: envelope.mission,
      linkedTask: envelope.linkedTask,
      executionPlan: envelope.executionPlanBundle.executionPlan,
      deliveryPackage: envelope.deliveryPackage,
      acceptance: envelope.deliveryPackageAcceptance,
      createdAt: now,
    });
    state.missionCloseOuts[missionCloseOut.id] = missionCloseOut;
    applyTaskGateFlags(envelope.linkedTask, gateState);
    envelope.linkedTask.lifecycleState = TASK_LIFECYCLE.DONE;
    envelope.linkedTask.updatedAt = now;
    envelope.mission.status = 'completed';
    envelope.mission.updatedAt = now;
    store.saveState(state);

    return {
      ...buildMissionCloseOutEnvelopeFromState(state, envelope.mission.id),
      missionCloseOut,
      idempotent: false,
    };
  }

  function assertExactLearningCandidatePreviewInput(input) {
    const expectedFields = [
      'missionId',
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'missionCloseOutId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'checkpointId',
      'checkpointDigest',
      'closeOutDigest',
      'retrospectiveSpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'LearningCandidate preview request has unexpected or missing fields',
      );
    }
  }

  function buildLearningCandidateSourceFromState(state, missionId) {
    const envelope = buildMissionCloseOutEnvelopeFromState(state, missionId);
    const {
      mission,
      linkedTask,
      deliveryPackage,
      deliveryPackageAcceptance,
      missionCloseOut,
    } = envelope;
    if (!missionCloseOut) {
      throw conflict(`Mission ${mission.id} does not have MissionCloseOut evidence`);
    }

    const bundle = getReviewedDeliveryRoleBundle(
      state,
      envelope.executionPlanBundle.executionPlan.id,
    );
    const {
      executionPlan,
      workOrders,
      byRole,
      latestCheckpoint,
      councilSession,
      terminalGateApproval,
    } = bundle;
    assertReviewedDeliveryPlanApproval(bundle);
    assertReviewedDeliverySourceCurrent(bundle, state);

    const gateState = computeTaskGateState(linkedTask, state);
    const activeGates = listActiveTaskGates(gateState);
    if (
      mission.status !== 'completed' ||
      linkedTask.lifecycleState !== TASK_LIFECYCLE.DONE ||
      linkedTask.review?.required !== true ||
      linkedTask.review?.status !== REVIEW_STATUS.PASSED ||
      activeGates.length > 0
    ) {
      throw conflict(`Mission ${mission.id} is not closed with a passed gate-free task`);
    }
    if (
      executionPlan.status !== EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      executionPlan.activeWorkOrderId !== null ||
      workOrders.length !== 3 ||
      workOrders.some((workOrder) => workOrder.status !== WORK_ORDER_STATUS.COMPLETED)
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not terminal delivery evidence`);
    }
    if (
      !latestCheckpoint ||
      latestCheckpoint.id !== deliveryPackage.terminalCheckpointId ||
      latestCheckpoint.checkpointDigest !== deliveryPackage.terminalCheckpointDigest ||
      latestCheckpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY ||
      latestCheckpoint.status !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} terminal checkpoint is not current`);
    }

    const reviewerRun = assertRun(byRole.reviewer.completionRunId, state);
    const reviewArtifact = assertArtifact(byRole.reviewer.reviewArtifactId, state);
    const qaRun = assertRun(byRole.qa.completionRunId, state);
    const qaArtifact = assertArtifact(byRole.qa.qaEvidenceArtifactId, state);
    if (
      reviewerRun.status !== RUN_STATUS.COMPLETED ||
      reviewerRun.summary?.mappedReviewStatus !== REVIEW_STATUS.PASSED ||
      reviewerRun.summary?.reviewArtifactId !== reviewArtifact.id ||
      reviewArtifact.type !== ARTIFACT_TYPE.REVIEW ||
      reviewArtifact.taskId !== linkedTask.id ||
      reviewArtifact.runId !== reviewerRun.id ||
      qaRun.status !== RUN_STATUS.COMPLETED ||
      qaRun.summary?.qaEvidenceArtifactId !== qaArtifact.id ||
      qaArtifact.type !== ARTIFACT_TYPE.QA_EVIDENCE ||
      qaArtifact.taskId !== linkedTask.id ||
      qaArtifact.runId !== qaRun.id ||
      !terminalGateApproval ||
      terminalGateApproval.status !== APPROVAL_STATUS.APPROVED ||
      terminalGateApproval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION ||
      terminalGateApproval.metadata?.consumedByRunId !== byRole.builder.completionRunId
    ) {
      throw conflict(`Mission ${mission.id} review or QA evidence is incomplete`);
    }

    if (
      deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED ||
      deliveryPackage.unresolvedItems.length !== 0 ||
      deliveryPackage.projectId !== mission.projectId ||
      deliveryPackage.missionId !== mission.id ||
      deliveryPackage.executionPlanId !== executionPlan.id ||
      deliveryPackage.packageDigest !== computeDeliveryPackageDigest(deliveryPackage) ||
      deliveryPackage.reviewerEvidenceRef !== reviewArtifact.id ||
      !deliveryPackage.qaEvidenceRefs.includes(qaArtifact.id) ||
      deliveryPackage.verificationSummary?.verdict !== 'passed' ||
      deliveryPackage.verificationSummary?.passedCheckCount !==
        deliveryPackage.verificationSummary?.checkCount ||
      deliveryPackage.verificationSummary?.checkCount < 1
    ) {
      throw conflict(`Mission ${mission.id} DeliveryPackage evidence is not source-current`);
    }
    const currentDeliveryPreview = buildExecutionPlanDeliveryPreviewFromState(state, {
      executionPlanId: executionPlan.id,
      sourceDigest: deliveryPackage.sourceDigest,
    });
    if (
      deliveryPackage.previewId !== currentDeliveryPreview.id ||
      deliveryPackage.sourceDigest !== currentDeliveryPreview.sourceDigest ||
      deliveryPackage.packageDigest !== currentDeliveryPreview.packageDigest ||
      deliveryPackage.terminalCheckpointId !== currentDeliveryPreview.terminalCheckpointId ||
      deliveryPackage.terminalCheckpointDigest !==
        currentDeliveryPreview.terminalCheckpointDigest
    ) {
      throw conflict(`Mission ${mission.id} DeliveryPackage preview is not current`);
    }
    if (
      deliveryPackageAcceptance.deliveryPackageId !== deliveryPackage.id ||
      deliveryPackageAcceptance.decision !== DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED ||
      deliveryPackageAcceptance.previewId !== deliveryPackage.previewId ||
      deliveryPackageAcceptance.sourceDigest !== deliveryPackage.sourceDigest ||
      deliveryPackageAcceptance.packageDigest !== deliveryPackage.packageDigest ||
      deliveryPackageAcceptance.terminalCheckpointId !== deliveryPackage.terminalCheckpointId ||
      deliveryPackageAcceptance.terminalCheckpointDigest !==
        deliveryPackage.terminalCheckpointDigest ||
      deliveryPackageAcceptance.acceptanceDigest !==
        computeDeliveryPackageAcceptanceDigest(deliveryPackageAcceptance)
    ) {
      throw conflict(`Mission ${mission.id} DeliveryPackageAcceptance evidence is not current`);
    }
    if (
      missionCloseOut.projectId !== mission.projectId ||
      missionCloseOut.missionId !== mission.id ||
      missionCloseOut.linkedTaskId !== linkedTask.id ||
      missionCloseOut.executionPlanId !== executionPlan.id ||
      missionCloseOut.deliveryPackageId !== deliveryPackage.id ||
      missionCloseOut.deliveryPackageAcceptanceId !== deliveryPackageAcceptance.id ||
      missionCloseOut.previewId !== deliveryPackage.previewId ||
      missionCloseOut.sourceDigest !== deliveryPackage.sourceDigest ||
      missionCloseOut.packageDigest !== deliveryPackage.packageDigest ||
      missionCloseOut.acceptanceDigest !== deliveryPackageAcceptance.acceptanceDigest ||
      missionCloseOut.terminalCheckpointId !== latestCheckpoint.id ||
      missionCloseOut.terminalCheckpointDigest !== latestCheckpoint.checkpointDigest ||
      missionCloseOut.decision !== MISSION_CLOSE_OUT_DECISION.CLOSED_OUT ||
      missionCloseOut.closeOutDigest !== computeMissionCloseOutDigest(missionCloseOut)
    ) {
      throw conflict(`Mission ${mission.id} MissionCloseOut evidence is not current`);
    }

    const currentAttempt =
      councilSession.attempts?.find(
        (attempt) => attempt.id === councilSession.currentAttemptId,
      ) || councilSession.attempts?.at(-1) || null;
    const sourceEvidenceRefs = appendUniqueRefs(
      [
        mission.id,
        linkedTask.id,
        executionPlan.id,
        deliveryPackage.id,
        deliveryPackageAcceptance.id,
        missionCloseOut.id,
        latestCheckpoint.id,
        councilSession.id,
        currentAttempt?.id,
        currentAttempt?.synthesis?.id,
        terminalGateApproval.id,
        reviewArtifact.id,
        qaArtifact.id,
        reviewerRun.id,
        qaRun.id,
      ],
      [
        ...executionPlan.runRefs,
        ...executionPlan.artifactRefs,
        ...deliveryPackage.deliveredArtifactRefs,
        ...workOrders.flatMap((workOrder) => [
          workOrder.id,
          ...(workOrder.inputRefs || []),
          ...(workOrder.runRefs || []),
          ...(workOrder.artifactRefs || []),
        ]),
        ...(currentAttempt?.synthesis?.adoptedPositionRefs || []),
        ...(currentAttempt?.synthesis?.dissentRefs || []),
      ],
    );
    const allowedNegativeEvidenceRefs = appendUniqueRefs(
      [
        deliveryPackage.id,
        missionCloseOut.id,
        reviewArtifact.id,
        qaArtifact.id,
        councilSession.id,
        currentAttempt?.id,
        currentAttempt?.synthesis?.id,
      ],
      currentAttempt?.synthesis?.dissentRefs || [],
    );

    return {
      projectId: mission.projectId,
      missionId: mission.id,
      linkedTaskId: linkedTask.id,
      executionPlanId: executionPlan.id,
      deliveryPackageId: deliveryPackage.id,
      deliveryPackageAcceptanceId: deliveryPackageAcceptance.id,
      missionCloseOutId: missionCloseOut.id,
      sourceDeliveryPreviewId: deliveryPackage.previewId,
      sourceDigest: deliveryPackage.sourceDigest,
      sourcePackageDigest: deliveryPackage.packageDigest,
      sourcePackageAcceptanceDigest: deliveryPackageAcceptance.acceptanceDigest,
      sourceTerminalCheckpointId: latestCheckpoint.id,
      sourceTerminalCheckpointDigest: latestCheckpoint.checkpointDigest,
      sourceMissionCloseOutDigest: missionCloseOut.closeOutDigest,
      missionCloseOutCreatedAt: missionCloseOut.createdAt,
      sourceEvidenceRefs,
      allowedTargetPaths: appendUniqueRefs(
        [],
        workOrders.flatMap((workOrder) => workOrder.targetPathAllowlist || []),
      ),
      allowedVerificationCommands: appendUniqueRefs(
        executionPlan.verificationPlan || [],
        workOrders.flatMap((workOrder) => workOrder.verificationCommands || []),
      ),
      allowedNegativeEvidenceRefs,
    };
  }

  function assertLearningCandidateSourceRequest(input, source) {
    const exactFields = [
      ['missionId', source.missionId],
      ['linkedTaskId', source.linkedTaskId],
      ['executionPlanId', source.executionPlanId],
      ['deliveryPackageId', source.deliveryPackageId],
      ['deliveryPackageAcceptanceId', source.deliveryPackageAcceptanceId],
      ['missionCloseOutId', source.missionCloseOutId],
      ['previewId', source.sourceDeliveryPreviewId],
      ['sourceDigest', source.sourceDigest],
      ['packageDigest', source.sourcePackageDigest],
      ['acceptanceDigest', source.sourcePackageAcceptanceDigest],
      ['checkpointId', source.sourceTerminalCheckpointId],
      ['checkpointDigest', source.sourceTerminalCheckpointDigest],
      ['closeOutDigest', source.sourceMissionCloseOutDigest],
    ];
    for (const [field, expected] of exactFields) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`LearningCandidate preview ${field} does not match current evidence`);
      }
    }
  }

  function previewMissionLearningCandidate(input) {
    assertExactLearningCandidatePreviewInput(input);
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`LearningCandidate preview requires current state: ${error.message}`);
    }
    const source = buildLearningCandidateSourceFromState(state, input.missionId);
    assertLearningCandidateSourceRequest(input, source);
    return compileLearningCandidatePreview({
      source,
      retrospectiveSpec: input.retrospectiveSpec,
    });
  }

  function findLearningCandidate(state, missionId) {
    return (
      Object.values(state.learningCandidates).find(
        (candidate) => candidate.sourceMissionId === missionId,
      ) || null
    );
  }

  function assertExactLearningCandidatePersistenceInput(input) {
    const expectedFields = [
      'missionId',
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'missionCloseOutId',
      'sourceDeliveryPreviewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'checkpointId',
      'checkpointDigest',
      'closeOutDigest',
      'retrospectiveSpec',
      'previewId',
      'candidateDigest',
      'decision',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'LearningCandidate persistence request has unexpected or missing fields',
      );
    }
    if (String(input.decision || '').trim() !== 'persist') {
      throw conflict('LearningCandidate persistence decision must be persist');
    }
  }

  function assertLearningCandidatePersistenceSourceRequest(input, source) {
    assertLearningCandidateSourceRequest(
      {
        ...input,
        previewId: input.sourceDeliveryPreviewId,
      },
      source,
    );
  }

  function assertLearningCandidatePreviewTuple(input, preview) {
    if (String(input.previewId || '').trim() !== preview.previewId) {
      throw conflict('LearningCandidate previewId does not match current recomputation');
    }
    if (String(input.candidateDigest || '').trim() !== preview.candidateDigest) {
      throw conflict('LearningCandidate candidateDigest does not match current recomputation');
    }
  }

  function getMissionLearningCandidate(missionId) {
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`LearningCandidate read requires current state: ${error.message}`);
    }
    const candidate = findLearningCandidate(state, missionId);
    return {
      missionId,
      learningCandidate: candidate
        ? assertLearningCandidate(candidate.id, state)
        : null,
      persisted: Boolean(candidate),
    };
  }

  function persistMissionLearningCandidate(input) {
    assertExactLearningCandidatePersistenceInput(input);
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`LearningCandidate persistence requires supported state: ${error.message}`);
    }

    const source = buildLearningCandidateSourceFromState(state, input.missionId);
    assertLearningCandidatePersistenceSourceRequest(input, source);
    const existing = findLearningCandidate(state, input.missionId);
    const evaluatedAt = existing?.createdAt || new Date().toISOString();
    const preview = compileLearningCandidatePreview(
      {
        source,
        retrospectiveSpec: input.retrospectiveSpec,
      },
      { evaluatedAt },
    );
    assertLearningCandidatePreviewTuple(input, preview);

    if (existing) {
      if (
        existing.previewId !== preview.previewId ||
        existing.candidateDigest !== preview.candidateDigest
      ) {
        throw conflict(
          `Mission ${input.missionId} already has a different LearningCandidate`,
        );
      }
      return {
        learningCandidate: assertLearningCandidate(existing.id, state),
        learningCandidatePreview: preview,
        idempotent: true,
      };
    }

    const learningCandidate = createLearningCandidate({
      id: nextLearningCandidateId(state),
      preview,
      source,
      createdAt: evaluatedAt,
    });
    state.learningCandidates[learningCandidate.id] = learningCandidate;
    store.saveState(state);
    return {
      learningCandidate,
      learningCandidatePreview: preview,
      idempotent: false,
    };
  }

  function findLearningCandidateReview(state, learningCandidateId) {
    return (
      Object.values(state.learningCandidateReviews).find(
        (review) => review.learningCandidateId === learningCandidateId,
      ) || null
    );
  }

  function assertLearningCandidateReviewSourceCurrent(state, candidate) {
    const source = buildLearningCandidateSourceFromState(
      state,
      candidate.sourceMissionId,
    );
    const exactFields = [
      ['projectId', source.projectId],
      ['sourceMissionId', source.missionId],
      ['sourceMissionCloseOutId', source.missionCloseOutId],
      ['sourceExecutionPlanId', source.executionPlanId],
      ['sourceDeliveryPackageId', source.deliveryPackageId],
      ['sourceDeliveryPackageAcceptanceId', source.deliveryPackageAcceptanceId],
      ['sourceTerminalCheckpointId', source.sourceTerminalCheckpointId],
      ['sourceDeliveryPreviewId', source.sourceDeliveryPreviewId],
      ['sourceDigest', source.sourceDigest],
      ['sourcePackageDigest', source.sourcePackageDigest],
      ['sourcePackageAcceptanceDigest', source.sourcePackageAcceptanceDigest],
      ['sourceTerminalCheckpointDigest', source.sourceTerminalCheckpointDigest],
      ['sourceMissionCloseOutDigest', source.sourceMissionCloseOutDigest],
    ];
    for (const [field, expected] of exactFields) {
      if (candidate[field] !== expected) {
        throw conflict(
          `LearningCandidate ${candidate.id} ${field} is not source-current`,
        );
      }
    }
    const candidateSourceEvidenceRefs = [...candidate.sourceEvidenceRefs].sort();
    const currentSourceEvidenceRefs = [...source.sourceEvidenceRefs].sort();
    if (
      candidateSourceEvidenceRefs.length !== currentSourceEvidenceRefs.length ||
      candidateSourceEvidenceRefs.some(
        (sourceEvidenceRef, index) =>
          sourceEvidenceRef !== currentSourceEvidenceRefs[index],
      )
    ) {
      throw conflict(
        `LearningCandidate ${candidate.id} sourceEvidenceRefs are not source-current`,
      );
    }
    return source;
  }

  function getLearningCandidateReview(learningCandidateId) {
    const state = store.loadState();
    const candidate = assertLearningCandidate(learningCandidateId, state);
    const review = findLearningCandidateReview(state, candidate.id);
    return {
      learningCandidate: candidate,
      learningCandidateReview: review
        ? assertLearningCandidateReview(review.id, state)
        : null,
      reviewed: Boolean(review),
    };
  }

  function reviewLearningCandidate(input) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`LearningCandidate review requires supported state: ${error.message}`);
    }
    const candidate = assertLearningCandidate(input.learningCandidateId, state);
    assertLearningCandidateReviewSourceCurrent(state, candidate);
    const existing = findLearningCandidateReview(state, candidate.id);
    const createdAt = existing?.createdAt || new Date().toISOString();
    let reviewSpec;
    try {
      reviewSpec = normalizeLearningCandidateReviewRequest(
        input,
        candidate,
        createdAt,
      );
    } catch (error) {
      throw conflict(error.message);
    }
    const candidateReview = createLearningCandidateReview({
      id: existing?.id || nextLearningCandidateReviewId(state),
      learningCandidate: candidate,
      reviewSpec,
      createdAt,
    });

    if (existing) {
      if (existing.reviewDigest !== candidateReview.reviewDigest) {
        throw conflict(
          `LearningCandidate ${candidate.id} already has a different review`,
        );
      }
      return {
        learningCandidate: candidate,
        learningCandidateReview: assertLearningCandidateReview(existing.id, state),
        idempotent: true,
      };
    }

    state.learningCandidateReviews[candidateReview.id] = candidateReview;
    store.saveState(state);
    return {
      learningCandidate: candidate,
      learningCandidateReview: candidateReview,
      idempotent: false,
    };
  }

  function assertExactMemoryCandidatePreviewInput(input) {
    const expectedFields = [
      'learningCandidateId',
      'learningCandidateReviewId',
      'previewId',
      'candidateDigest',
      'candidateRecordDigest',
      'reviewDigest',
      'evaluatedAt',
      'memorySpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'MemoryCandidate preview request has unexpected or missing fields',
      );
    }
  }

  function buildLearningCandidateMemoryPreviewFromState(state, input) {
    const candidate = assertLearningCandidate(input.learningCandidateId, state);
    const review = assertLearningCandidateReview(
      input.learningCandidateReviewId,
      state,
    );
    assertLearningCandidateReviewSourceCurrent(state, candidate);
    const currentReview = findLearningCandidateReview(state, candidate.id);
    if (!currentReview || currentReview.id !== review.id) {
      throw conflict(
        `LearningCandidate ${candidate.id} does not have the requested current review`,
      );
    }
    for (const [field, expected] of [
      ['previewId', candidate.previewId],
      ['candidateDigest', candidate.candidateDigest],
      ['candidateRecordDigest', candidate.recordDigest],
      ['reviewDigest', review.reviewDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`MemoryCandidate preview ${field} does not match current evidence`);
      }
    }
    if (review.decision !== 'accepted') {
      throw conflict(
        `LearningCandidateReview ${review.id} is not accepted for memory readiness`,
      );
    }

    try {
      return compileMemoryCandidatePreview({
        candidate,
        review,
        evaluatedAt: input.evaluatedAt,
        memorySpec: input.memorySpec,
      });
    } catch (error) {
      if (/source LearningCandidate|source LearningCandidateReview|expired/.test(error.message)) {
        throw conflict(error.message);
      }
      throw error;
    }
  }

  function previewLearningCandidateMemory(input) {
    assertExactMemoryCandidatePreviewInput(input);
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`MemoryCandidate preview requires current state: ${error.message}`);
    }

    return buildLearningCandidateMemoryPreviewFromState(state, input);
  }

  function findMemoryItem(state, learningCandidateReviewId) {
    return (
      Object.values(state.memoryItems).find(
        (item) => item.sourceLearningCandidateReviewId === learningCandidateReviewId,
      ) || null
    );
  }

  function getLearningCandidateMemoryItem(learningCandidateId) {
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`MemoryItem inspection requires current state: ${error.message}`);
    }
    const candidate = assertLearningCandidate(learningCandidateId, state);
    assertLearningCandidateReviewSourceCurrent(state, candidate);
    const review = findLearningCandidateReview(state, candidate.id);
    const item = review ? findMemoryItem(state, review.id) : null;
    return {
      learningCandidate: candidate,
      learningCandidateReview: review,
      memoryItem: item ? assertMemoryItem(item.id, state) : null,
      persisted: Boolean(item),
    };
  }

  function assertExactMemoryItemPersistenceInput(input) {
    const expectedFields = [
      'learningCandidateId',
      'learningCandidateReviewId',
      'previewId',
      'candidateDigest',
      'candidateRecordDigest',
      'reviewDigest',
      'evaluatedAt',
      'memorySpec',
      'memoryCandidatePreviewId',
      'memoryCandidatePreviewDigest',
      'storageApproval',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('MemoryItem persistence request has unexpected or missing fields');
    }
  }

  function persistLearningCandidateMemoryItem(input) {
    assertExactMemoryItemPersistenceInput(input);
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`MemoryItem persistence requires supported state: ${error.message}`);
    }
    const preview = buildLearningCandidateMemoryPreviewFromState(state, input);
    for (const [field, expected] of [
      ['memoryCandidatePreviewId', preview.id],
      ['memoryCandidatePreviewDigest', preview.previewDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`MemoryItem ${field} does not match current recomputation`);
      }
    }
    const reviewedAtMs = Date.parse(input.storageApproval?.reviewedAt);
    if (
      Number.isFinite(reviewedAtMs) &&
      reviewedAtMs > Date.now() + 5 * 60 * 1000
    ) {
      throw conflict('storageApproval.reviewedAt is too far in the future');
    }

    const existing = findMemoryItem(state, input.learningCandidateReviewId);
    let memoryItem;
    try {
      memoryItem = createMemoryItem({
        id: existing?.id || `memory-item-${String(state.sequences.memoryItem + 1).padStart(4, '0')}`,
        preview,
        storageApproval: input.storageApproval,
      });
    } catch (error) {
      throw conflict(error.message);
    }
    if (existing) {
      if (existing.recordDigest !== memoryItem.recordDigest) {
        throw conflict(
          `LearningCandidateReview ${input.learningCandidateReviewId} already has a different MemoryItem`,
        );
      }
      return {
        learningCandidate: assertLearningCandidate(input.learningCandidateId, state),
        learningCandidateReview: assertLearningCandidateReview(
          input.learningCandidateReviewId,
          state,
        ),
        memoryCandidatePreview: preview,
        memoryItem: assertMemoryItem(existing.id, state),
        idempotent: true,
      };
    }

    const id = nextMemoryItemId(state);
    if (id !== memoryItem.id) {
      throw new Error('MemoryItem sequence is not deterministic');
    }
    state.memoryItems[memoryItem.id] = memoryItem;
    store.saveState(state);
    return {
      learningCandidate: assertLearningCandidate(input.learningCandidateId, state),
      learningCandidateReview: assertLearningCandidateReview(
        input.learningCandidateReviewId,
        state,
      ),
      memoryCandidatePreview: preview,
      memoryItem,
      idempotent: false,
    };
  }

  function assertExactMemoryRecallPreviewInput(input) {
    const expectedFields = [
      'memoryItemId',
      'memoryItemRecordDigest',
      'evaluatedAt',
      'recallSpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('MemoryRecall preview request has unexpected or missing fields');
    }
  }

  function buildMemoryItemRecallPreviewFromState(state, input) {
    const item = assertMemoryItem(input.memoryItemId, state);
    if (String(input.memoryItemRecordDigest || '').trim() !== item.recordDigest) {
      throw conflict('MemoryRecall preview recordDigest does not match current evidence');
    }
    try {
      return compileMemoryRecallPreview({
        item,
        evaluatedAt: input.evaluatedAt,
        recallSpec: input.recallSpec,
      });
    } catch (error) {
      if (/source MemoryItem|expired|widened downstream authority/.test(error.message)) {
        throw conflict(error.message);
      }
      throw error;
    }
  }

  function previewMemoryItemRecall(input) {
    assertExactMemoryRecallPreviewInput(input);
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`MemoryRecall preview requires current state: ${error.message}`);
    }
    return buildMemoryItemRecallPreviewFromState(state, input);
  }

  function assertExactMissionMemoryContextPreviewInput(input) {
    const expectedFields = [
      'missionId',
      'memoryRecallId',
      'memoryRecallRecordDigest',
      'memoryItemId',
      'memoryItemRecordDigest',
      'targetMissionDigest',
      'evaluatedAt',
      'contextSpec',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'MissionMemoryContext preview request has unexpected or missing fields',
      );
    }
  }

  function buildMissionMemoryContextPreviewFromState(state, input) {
    const mission = assertMission(input.missionId, state);
    const memoryRecall = assertMemoryRecall(input.memoryRecallId, state);
    const memoryItem = assertMemoryItem(input.memoryItemId, state);
    if (String(input.memoryRecallRecordDigest || '').trim() !== memoryRecall.recordDigest) {
      throw conflict(
        'MissionMemoryContext memoryRecallRecordDigest does not match current evidence',
      );
    }
    if (String(input.memoryItemRecordDigest || '').trim() !== memoryItem.recordDigest) {
      throw conflict(
        'MissionMemoryContext memoryItemRecordDigest does not match current evidence',
      );
    }
    const targetMissionDigest = computeMissionMemoryContextTargetDigest(mission);
    if (String(input.targetMissionDigest || '').trim() !== targetMissionDigest) {
      throw conflict(
        'MissionMemoryContext targetMissionDigest does not match current evidence',
      );
    }

    try {
      return compileMissionMemoryContextPreview({
        recall: memoryRecall,
        item: memoryItem,
        mission,
        evaluatedAt: input.evaluatedAt,
        contextSpec: input.contextSpec,
      });
    } catch (error) {
      if (
        /source Memory|source item tuple|source and target|target Mission|expired|widened downstream authority/.test(
          error.message,
        )
      ) {
        throw conflict(error.message);
      }
      throw error;
    }
  }

  function previewMissionMemoryContext(input) {
    assertExactMissionMemoryContextPreviewInput(input);
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `MissionMemoryContext preview requires supported state: ${error.message}`,
      );
    }
    return buildMissionMemoryContextPreviewFromState(state, input);
  }

  function findMissionContextAttachment(state, missionId) {
    return (
      Object.values(state.missionContextAttachments || {}).find(
        (attachment) => attachment.targetMissionId === missionId,
      ) || null
    );
  }

  function assertExactMissionContextAttachmentInput(input) {
    const expectedFields = [
      'missionId',
      'memoryRecallId',
      'memoryRecallRecordDigest',
      'memoryItemId',
      'memoryItemRecordDigest',
      'targetMissionDigest',
      'sourcePreviewId',
      'sourcePreviewDigest',
      'contextSpec',
      'evaluatedAt',
      'attachmentReview',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict(
        'MissionContextAttachment request has unexpected or missing fields',
      );
    }
  }

  function getMissionContextAttachment(missionId) {
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `MissionContextAttachment inspection requires supported state: ${error.message}`,
      );
    }
    const mission = assertMission(missionId, state);
    const attachment = findMissionContextAttachment(state, mission.id);
    return {
      mission,
      missionContextAttachment: attachment
        ? assertMissionContextAttachment(attachment.id, state)
        : null,
      attached: Boolean(attachment),
    };
  }

  function attachReviewedMissionContext(input) {
    assertExactMissionContextAttachmentInput(input);
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(
        `MissionContextAttachment persistence requires supported state: ${error.message}`,
      );
    }

    const existing = findMissionContextAttachment(state, input.missionId);
    if (existing) {
      if (!isExactMissionContextAttachmentReplay(existing, input)) {
        throw conflict(
          `Mission ${input.missionId} already has a different MissionContextAttachment`,
        );
      }
      return {
        mission: assertMission(input.missionId, state),
        missionContextAttachment: assertMissionContextAttachment(existing.id, state),
        idempotent: true,
      };
    }

    const previewInput = {
      missionId: input.missionId,
      memoryRecallId: input.memoryRecallId,
      memoryRecallRecordDigest: input.memoryRecallRecordDigest,
      memoryItemId: input.memoryItemId,
      memoryItemRecordDigest: input.memoryItemRecordDigest,
      targetMissionDigest: input.targetMissionDigest,
      evaluatedAt: input.evaluatedAt,
      contextSpec: input.contextSpec,
    };
    const preview = buildMissionMemoryContextPreviewFromState(state, previewInput);
    if (
      input.sourcePreviewId !== preview.id ||
      input.sourcePreviewDigest !== preview.previewDigest
    ) {
      throw conflict(
        'MissionContextAttachment source preview does not match current recomputation',
      );
    }

    let attachment;
    const now = new Date().toISOString();
    try {
      attachment = createMissionContextAttachment({
        id: `mission-context-attachment-${String(
          state.sequences.missionContextAttachment + 1,
        ).padStart(4, '0')}`,
        preview,
        attachmentReview: input.attachmentReview,
        now,
      });
    } catch (error) {
      throw conflict(error.message);
    }

    const id = nextMissionContextAttachmentId(state);
    if (id !== attachment.id) {
      throw new Error('MissionContextAttachment sequence is not deterministic');
    }
    state.missionContextAttachments[attachment.id] = attachment;
    store.saveState(state);
    return {
      mission: assertMission(input.missionId, state),
      missionContextAttachment: attachment,
      idempotent: false,
    };
  }

  function findMemoryRecall(state, memoryItemId) {
    return (
      Object.values(state.memoryRecalls).find(
        (recall) => recall.sourceMemoryItemId === memoryItemId,
      ) || null
    );
  }

  function getMemoryItemRecall(memoryItemId) {
    let state;
    try {
      state = store.loadStateReadonly();
    } catch (error) {
      throw conflict(`MemoryRecall inspection requires current state: ${error.message}`);
    }
    const memoryItem = assertMemoryItem(memoryItemId, state);
    const recall = findMemoryRecall(state, memoryItem.id);
    return {
      memoryItem,
      memoryRecall: recall ? assertMemoryRecall(recall.id, state) : null,
      persisted: Boolean(recall),
    };
  }

  function assertExactMemoryRecallPersistenceInput(input) {
    const expectedFields = [
      'memoryItemId',
      'memoryItemRecordDigest',
      'evaluatedAt',
      'recallSpec',
      'memoryRecallPreviewId',
      'memoryRecallPreviewDigest',
      'recordApproval',
    ].sort();
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('MemoryRecall persistence request has unexpected or missing fields');
    }
  }

  function persistMemoryItemRecall(input) {
    assertExactMemoryRecallPersistenceInput(input);
    let state;
    try {
      state = store.loadStateSupportedReadonly();
    } catch (error) {
      throw conflict(`MemoryRecall persistence requires supported state: ${error.message}`);
    }
    const preview = buildMemoryItemRecallPreviewFromState(state, input);
    for (const [field, expected] of [
      ['memoryRecallPreviewId', preview.id],
      ['memoryRecallPreviewDigest', preview.previewDigest],
    ]) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`MemoryRecall ${field} does not match current recomputation`);
      }
    }
    const reviewedAtMs = Date.parse(input.recordApproval?.reviewedAt);
    if (Number.isFinite(reviewedAtMs) && reviewedAtMs > Date.now() + 5 * 60 * 1000) {
      throw conflict('recordApproval.reviewedAt is too far in the future');
    }

    const existing = findMemoryRecall(state, input.memoryItemId);
    let memoryRecall;
    try {
      memoryRecall = createMemoryRecall({
        id:
          existing?.id ||
          `memory-recall-${String(state.sequences.memoryRecall + 1).padStart(4, '0')}`,
        preview,
        recordApproval: input.recordApproval,
      });
    } catch (error) {
      throw conflict(error.message);
    }
    if (existing) {
      if (existing.recordDigest !== memoryRecall.recordDigest) {
        throw conflict(`MemoryItem ${input.memoryItemId} already has a different MemoryRecall`);
      }
      return {
        memoryItem: assertMemoryItem(input.memoryItemId, state),
        memoryRecallPreview: preview,
        memoryRecall: assertMemoryRecall(existing.id, state),
        idempotent: true,
      };
    }

    const id = nextMemoryRecallId(state);
    if (id !== memoryRecall.id) {
      throw new Error('MemoryRecall sequence is not deterministic');
    }
    state.memoryRecalls[memoryRecall.id] = memoryRecall;
    store.saveState(state);
    return {
      memoryItem: assertMemoryItem(input.memoryItemId, state),
      memoryRecallPreview: preview,
      memoryRecall,
      idempotent: false,
    };
  }

  function assertExactDeliveryPackageTuple(input, preview) {
    const exactFields = [
      ['previewId', preview.id],
      ['sourceDigest', preview.sourceDigest],
      ['packageDigest', preview.packageDigest],
      ['checkpointId', preview.terminalCheckpointId],
      ['checkpointDigest', preview.terminalCheckpointDigest],
    ];
    for (const [field, expected] of exactFields) {
      if (String(input[field] || '').trim() !== expected) {
        throw conflict(`DeliveryPackage ${field} does not match the current preview`);
      }
    }
  }

  function persistExecutionPlanDeliveryPackage(input) {
    const state = store.loadState();
    const preview = buildExecutionPlanDeliveryPreviewFromState(state, input);
    assertExactDeliveryPackageTuple(input, preview);
    const bundle = getExecutionPlanBundleFromState(state, input.executionPlanId);

    if (bundle.latestDeliveryPackage) {
      const existing = bundle.latestDeliveryPackage;
      if (
        existing.previewId !== preview.id ||
        existing.sourceDigest !== preview.sourceDigest ||
        existing.packageDigest !== preview.packageDigest ||
        existing.terminalCheckpointId !== preview.terminalCheckpointId ||
        existing.terminalCheckpointDigest !== preview.terminalCheckpointDigest ||
        existing.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED
      ) {
        throw conflict(`ExecutionPlan ${bundle.executionPlan.id} already has a different package`);
      }
      return {
        ...bundle,
        deliveryPackage: existing,
        deliveryPackagePreview: preview,
        idempotent: true,
      };
    }

    const now = new Date().toISOString();
    const deliveryPackage = createDeliveryPackage({
      id: nextDeliveryPackageId(state),
      preview,
      createdAt: now,
    });
    state.deliveryPackages[deliveryPackage.id] = deliveryPackage;
    bundle.executionPlan.deliveryPackageRefs.push(deliveryPackage.id);
    bundle.executionPlan.latestDeliveryPackageId = deliveryPackage.id;
    store.saveState(state);

    return {
      ...getExecutionPlanBundleFromState(state, bundle.executionPlan.id),
      deliveryPackage,
      deliveryPackagePreview: preview,
      idempotent: false,
    };
  }

  function persistMissionWorkOrderPlan(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const existing = Object.values(state.executionPlans).find(
      (entry) => entry.councilSessionId === councilSession.id,
    );
    let companyBlueprint = companyRuntime?.blueprint || null;

    if (councilSession.staffingEntryRef) {
      const bound = assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
        executionPlan: existing || null,
        requireUnlinkedMission: !existing,
      });
      companyBlueprint = bound.blueprintEvidence.blueprint;
    }

    if (!companyBlueprint) {
      throw new Error('CompanyBlueprint must be ready before WorkOrder persistence');
    }
    assertRealCouncilSourceCurrent(councilSession, mission, project);

    const preview = compileMissionWorkOrderPreview({
      mission,
      project,
      councilSession,
      companyBlueprint,
      compileSpec: input.compileSpec,
    });
    const previewId = String(input.previewId || '').trim();
    const sourceDigest = String(input.sourceDigest || '').trim();
    if (!previewId || previewId !== preview.previewId) {
      throw conflict('WorkOrder previewId does not match the source-current preview');
    }
    if (!sourceDigest || sourceDigest !== preview.sourceDigest) {
      throw conflict('WorkOrder sourceDigest does not match the source-current preview');
    }

    if (existing) {
      if (existing.previewId === previewId && existing.sourceDigest === sourceDigest) {
        return { ...getExecutionPlanBundleFromState(state, existing.id), idempotent: true };
      }
      throw conflict(`Council session ${councilSession.id} already has a different ExecutionPlan`);
    }
    if (mission.linkedTaskId) {
      throw conflict(`Mission ${mission.id} already has a linked task: ${mission.linkedTaskId}`);
    }

    const now = new Date().toISOString();
    const compileSpec = normalizeCompileSpec(input.compileSpec);
    const controlTask = createTaskRecord(
      state,
      project,
      {
        deliverableType: mission.deliverableType,
        title: mission.title,
        intent: mission.goal,
        now,
      },
      mission,
    );
    mission.linkedTaskId = controlTask.id;
    mission.status = 'waiting-approval';
    mission.updatedAt = now;
    state.activeProjectId = project.id;
    state.selectedMissionId = mission.id;

    const approval = createApprovalPlaceholderRecord(
      state,
      {
        taskId: controlTask.id,
        scope: 'execution-plan',
        allowedNextAction: WORK_ORDER_ACTION.START_SEQUENTIAL,
        metadata: {
          executionPlanId: preview.executionPlan.id,
          previewId,
          sourceDigest,
          controlTaskId: controlTask.id,
        },
        title: `ExecutionPlan 승인 필요: ${mission.title}`,
        prompt: `ExecutionPlan ${preview.executionPlan.id}의 local sequential Builder dispatch를 승인합니다.`,
      },
      now,
    );

    state.sequences.executionPlan += 1;
    state.sequences.workOrder += preview.workOrders.length;
    state.sequences.handoffPacket += preview.handoffPackets.length;

    const handoffPacketIds = preview.handoffPackets.map((packet) => packet.id);
    const roleByPosition = ['builder', 'reviewer', 'qa'];
    const executionPlan = {
      ...preview.executionPlan,
      nonGoals: [
        'Execute Reviewer or QA WorkOrders.',
        'Run parallel, dynamic, autonomous, retry, or provider-backed scheduling.',
        'Persist memory, commit, push, release, or use external connectors.',
      ],
      authorityBoundary: {
        ...preview.executionPlan.authorityBoundary,
        approvalAllowed: true,
        executeAllowed: true,
        persistenceAllowed: true,
        mode: 'durable-gated',
      },
      projectId: project.id,
      previewId,
      sourceDigest,
      compileSpecDigest: digestCompileSpec(compileSpec),
      status: EXECUTION_PLAN_STATUS.PENDING_APPROVAL,
      handoffPacketIds,
      controlTaskId: controlTask.id,
      approvalId: approval.id,
      activeWorkOrderId: null,
      runRefs: [],
      artifactRefs: [],
      checkpointRefs: [],
      latestCheckpointId: null,
      deliveryPackageRefs: [],
      latestDeliveryPackageId: null,
      createdAt: now,
      updatedAt: now,
    };
    state.executionPlans[executionPlan.id] = executionPlan;

    preview.handoffPackets.forEach((packet, index) => {
      state.handoffPackets[packet.id] = {
        ...packet,
        authorityBoundary: {
          ...packet.authorityBoundary,
          persistenceAllowed: true,
          mode: 'durable-gated',
        },
        executionPlanId: executionPlan.id,
        workOrderId: preview.workOrders[index].id,
        createdAt: now,
        updatedAt: now,
      };
    });
    preview.workOrders.forEach((workOrder, index) => {
      const role = roleByPosition[index];
      state.workOrders[workOrder.id] = {
        ...workOrder,
        role,
        position: index + 1,
        dependencies: undefined,
        dependencyIds: [...workOrder.dependencies],
        status:
          index === 0
            ? WORK_ORDER_STATUS.PENDING_APPROVAL
            : WORK_ORDER_STATUS.BLOCKED_DEPENDENCY,
        handoffPacketId: handoffPacketIds[index],
        linkedTaskId: index === 0 ? controlTask.id : null,
        runRefs: [],
        artifactRefs: [],
        acceptanceCriterionRefs: [],
        sourceDigest,
        authority: {
          ...workOrder.authority,
          mode: 'durable-gated',
          executeAllowed: role === 'builder',
          persistenceAllowed: true,
        },
        createdAt: now,
        updatedAt: now,
      };
      delete state.workOrders[workOrder.id].dependencies;
    });

    recalculateTaskFlags(controlTask, state);
    controlTask.updatedAt = now;
    store.saveState(state);
    return { ...getExecutionPlanBundleFromState(state, executionPlan.id), idempotent: false };
  }

  function reconcileExecutionPlanApproval(state, approval, action, now) {
    if (approval.scope !== 'execution-plan') return;
    if (approval.allowedNextAction !== WORK_ORDER_ACTION.START_SEQUENTIAL) {
      throw conflict(`ExecutionPlan approval ${approval.id} has an invalid next action`);
    }

    const metadata = approval.metadata || {};
    const executionPlan = assertExecutionPlan(metadata.executionPlanId, state);
    if (
      executionPlan.approvalId !== approval.id ||
      executionPlan.controlTaskId !== approval.taskId ||
      metadata.controlTaskId !== approval.taskId ||
      metadata.previewId !== executionPlan.previewId ||
      metadata.sourceDigest !== executionPlan.sourceDigest
    ) {
      throw conflict(`ExecutionPlan approval ${approval.id} does not match its durable plan`);
    }
    if (executionPlan.status !== EXECUTION_PLAN_STATUS.PENDING_APPROVAL) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not pending approval`);
    }

    const workOrders = executionPlan.workOrderIds.map((id) => assertWorkOrder(id, state));
    if (action === APPROVAL_STATUS.APPROVED) {
      executionPlan.status = EXECUTION_PLAN_STATUS.APPROVED;
      const ready = workOrders.filter((entry) => entry.dependencyIds.length === 0);
      if (ready.length !== 1 || ready[0].role !== 'builder') {
        throw conflict(`ExecutionPlan ${executionPlan.id} has an invalid first WorkOrder`);
      }
      ready[0].status = WORK_ORDER_STATUS.QUEUED;
      ready[0].updatedAt = now;
    } else {
      executionPlan.status = EXECUTION_PLAN_STATUS.REJECTED;
      for (const workOrder of workOrders) {
        workOrder.status = WORK_ORDER_STATUS.CANCELLED;
        workOrder.updatedAt = now;
      }
    }
    executionPlan.updatedAt = now;
  }

  function getPlanWorkOrderAttempts(state, executionPlanId) {
    return Object.values(state.workOrderAttempts || {})
      .filter((attempt) => attempt.executionPlanId === executionPlanId)
      .sort(
        (left, right) =>
          left.startedAt.localeCompare(right.startedAt) || left.id.localeCompare(right.id),
      );
  }

  function validateOperatorSteppedGraph(state, executionPlan) {
    if (
      !Array.isArray(executionPlan.workOrderIds) ||
      executionPlan.workOrderIds.length !== 3 ||
      new Set(executionPlan.workOrderIds).size !== executionPlan.workOrderIds.length
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} has an invalid WorkOrder graph`);
    }
    const workOrders = executionPlan.workOrderIds.map((id) => assertWorkOrder(id, state));
    const byId = new Map(workOrders.map((workOrder) => [workOrder.id, workOrder]));
    for (const workOrder of workOrders) {
      if (
        workOrder.executionPlanId !== executionPlan.id ||
        !Number.isInteger(workOrder.position) ||
        workOrder.position < 1 ||
        !Array.isArray(workOrder.dependencyIds) ||
        new Set(workOrder.dependencyIds).size !== workOrder.dependencyIds.length ||
        workOrder.dependencyIds.some(
          (dependencyId) => dependencyId === workOrder.id || !byId.has(dependencyId),
        )
      ) {
        throw conflict(`WorkOrder ${workOrder.id} has an invalid dependency graph`);
      }
    }
    const visiting = new Set();
    const visited = new Set();
    function visit(workOrderId) {
      if (visiting.has(workOrderId)) {
        throw conflict(`ExecutionPlan ${executionPlan.id} contains a dependency cycle`);
      }
      if (visited.has(workOrderId)) return;
      visiting.add(workOrderId);
      for (const dependencyId of byId.get(workOrderId).dependencyIds) {
        visit(dependencyId);
      }
      visiting.delete(workOrderId);
      visited.add(workOrderId);
    }
    for (const workOrder of workOrders) visit(workOrder.id);
    return workOrders.sort(
      (left, right) => left.position - right.position || left.id.localeCompare(right.id),
    );
  }

  function assertNoActiveSchedulerAttempt(state, executionPlan) {
    const active = getPlanWorkOrderAttempts(state, executionPlan.id).find(
      (attempt) => isRunnableWorkOrderAttempt(state, attempt),
    );
    if (active) {
      throw conflict(
        `WorkOrderAttempt ${active.id} is active and requires separately authorized recovery`,
      );
    }
  }

  function selectOperatorSteppedWorkOrder(state, executionPlan, action, expectedWorkOrderId) {
    const workOrders = validateOperatorSteppedGraph(state, executionPlan);
    assertNoActiveSchedulerAttempt(state, executionPlan);
    const actionBoundary = {
      [WORK_ORDER_ATTEMPT_ACTION.START_BUILDER]: {
        planStatuses: [EXECUTION_PLAN_STATUS.APPROVED],
        role: 'builder',
        workOrderStatuses: [WORK_ORDER_STATUS.QUEUED],
      },
      [WORK_ORDER_ATTEMPT_ACTION.CONTINUE_BUILDER]: {
        planStatuses: [EXECUTION_PLAN_STATUS.ACTIVE],
        role: 'builder',
        workOrderStatuses: [WORK_ORDER_STATUS.WAITING_GATE],
      },
      [WORK_ORDER_ATTEMPT_ACTION.RUN_REVIEWER]: {
        planStatuses: [EXECUTION_PLAN_STATUS.ACTIVE],
        role: 'reviewer',
        workOrderStatuses: [WORK_ORDER_STATUS.QUEUED],
      },
      [WORK_ORDER_ATTEMPT_ACTION.RUN_QA]: {
        planStatuses: [EXECUTION_PLAN_STATUS.REVIEWING],
        role: 'qa',
        workOrderStatuses: [WORK_ORDER_STATUS.QUEUED],
      },
    }[action];
    if (!actionBoundary || !actionBoundary.planStatuses.includes(executionPlan.status)) {
      throw conflict(
        `ExecutionPlan ${executionPlan.id} is not at the ${action || 'unknown'} boundary`,
      );
    }
    const ready = workOrders.filter(
      (workOrder) =>
        workOrder.role === actionBoundary.role &&
        actionBoundary.workOrderStatuses.includes(workOrder.status) &&
        workOrder.dependencyIds.every(
          (dependencyId) => state.workOrders[dependencyId].status === WORK_ORDER_STATUS.COMPLETED,
        ),
    );
    const selected = ready[0] || null;
    if (
      !selected ||
      ready.length !== 1 ||
      selected.id !== expectedWorkOrderId ||
      (executionPlan.activeWorkOrderId !== null &&
        executionPlan.activeWorkOrderId !== selected.id)
    ) {
      throw conflict(
        `Expected WorkOrder ${expectedWorkOrderId || 'empty'} is not dependency-ready`,
      );
    }
    return selected;
  }

  function assertNoOverlappingBuilderAttempt(state, projectId, workOrder) {
    const targets = new Set(workOrder.targetPathAllowlist || []);
    for (const attempt of Object.values(state.workOrderAttempts || {})) {
      if (
        attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
        attempt.role !== 'builder' ||
        attempt.projectId !== projectId
      ) {
        continue;
      }
      const activeWorkOrder = assertWorkOrder(attempt.workOrderId, state);
      if ((activeWorkOrder.targetPathAllowlist || []).some((target) => targets.has(target))) {
        throw conflict(
          `Builder WorkOrder ${workOrder.id} overlaps active attempt ${attempt.id}`,
        );
      }
    }
  }

  function createActiveSchedulerAttempt(
    state,
    { action, approvalRefs, checkpoint, command, executionPlan, source, workOrder },
  ) {
    if (workOrder.role === 'builder') {
      assertNoOverlappingBuilderAttempt(state, executionPlan.projectId, workOrder);
    }
    const dependencies = workOrder.dependencyIds.map((dependencyId) => {
      const dependency = assertWorkOrder(dependencyId, state);
      return { id: dependency.id, status: dependency.status };
    });
    const checkpointRef = checkpoint?.id || null;
    const checkpointDigest = checkpoint?.checkpointDigest || null;
    const authorityDigest = computeWorkOrderAttemptAuthorityDigest({
      executionPlanId: executionPlan.id,
      expectedWorkOrderId: workOrder.id,
      command,
      action,
      sourceDigest: executionPlan.sourceDigest,
      checkpointRef,
      checkpointDigest,
      approvalRefs,
    });
    const attemptNumber =
      getPlanWorkOrderAttempts(state, executionPlan.id).filter(
        (attempt) => attempt.workOrderId === workOrder.id,
      ).length + 1;
    const attempt = createWorkOrderAttempt({
      id: nextWorkOrderAttemptId(state),
      executionPlanId: executionPlan.id,
      workOrderId: workOrder.id,
      missionId: executionPlan.missionId,
      projectId: executionPlan.projectId,
      staffingPlanId: source.staffingPlan.id,
      staffingEntryId: source.staffingEntry.id,
      councilSessionId: source.councilSession.id,
      role: workOrder.role,
      position: workOrder.position,
      attemptNumber,
      command,
      action,
      sourceDigest: executionPlan.sourceDigest,
      workOrderDigest: computeWorkOrderRecordDigest(workOrder),
      dependencyDigest: computeWorkOrderAttemptDependencyDigest({
        executionPlanId: executionPlan.id,
        workOrderId: workOrder.id,
        dependencies,
      }),
      authorityDigest,
      checkpointRef,
      approvalRefs,
      startedAt: new Date().toISOString(),
    });
    state.workOrderAttempts[attempt.id] = attempt;
    return attempt;
  }

  function transitionActiveSchedulerAttempt(state, executionPlan, input) {
    const planAttempts = getPlanWorkOrderAttempts(state, executionPlan.id);
    const activeAttempts = planAttempts.filter(
      (candidate) => isRunnableWorkOrderAttempt(state, candidate),
    );
    const rawActiveAttempts = planAttempts.filter(
      (candidate) =>
        candidate.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE &&
        candidate.action !==
          WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
    );
    const hasResume = Object.values(state.opsAttemptResumes || {}).some(
      (resume) => resume.executionPlanId === executionPlan.id,
    );
    if (hasResume && !input.workOrderAttemptId) {
      throw conflict(
        `ExecutionPlan ${executionPlan.id} requires an exact replacement WorkOrderAttempt id`,
      );
    }
    let attempt = null;
    if (input.workOrderAttemptId) {
      attempt =
        rawActiveAttempts.find(
          (candidate) => candidate.id === input.workOrderAttemptId,
        ) || null;
    } else if (activeAttempts.length === 1) {
      attempt = activeAttempts[0];
    } else if (!hasResume && rawActiveAttempts.length === 1) {
      attempt = rawActiveAttempts[0];
    }
    if (!attempt) {
      throw conflict(
        `ExecutionPlan ${executionPlan.id} has no matching active WorkOrderAttempt`,
      );
    }
    const next = transitionWorkOrderAttemptWithOpsGuard(state, attempt, {
      status: input.status,
      checkpointRef: input.checkpointRef || null,
      approvalRefs: [...new Set([...attempt.approvalRefs, ...(input.approvalRefs || [])])],
      runRefs: [...new Set([...attempt.runRefs, ...(input.runRefs || [])])],
      artifactRefs: [...new Set([...attempt.artifactRefs, ...(input.artifactRefs || [])])],
      decisionInboxItemRefs: [
        ...new Set([
          ...attempt.decisionInboxItemRefs,
          ...(input.decisionInboxItemRefs || []),
        ]),
      ],
      stopReason: input.stopReason || null,
      completedAt: new Date().toISOString(),
    });
    state.workOrderAttempts[next.id] = next;
    return next;
  }

  function beginOperatorSteppedWorkOrderExecution(state, input) {
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const approval = assertApproval(input.approvalId, state);
    const councilSession = assertCouncilSession(executionPlan.councilSessionId, state);
    const source = assertBoundStaffingSchedulerSourceCurrent(state, councilSession, {
      executionPlan,
    });
    const priorStart = getPlanWorkOrderAttempts(state, executionPlan.id).find(
      (attempt) => attempt.action === WORK_ORDER_ATTEMPT_ACTION.START_BUILDER,
    );
    if (priorStart) {
      if (priorStart.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE) {
        throw conflict(
          `WorkOrderAttempt ${priorStart.id} is active and requires separately authorized recovery`,
        );
      }
      if (
        priorStart.sourceDigest !== executionPlan.sourceDigest ||
        !priorStart.approvalRefs.includes(approval.id)
      ) {
        throw conflict(`ExecutionPlan ${executionPlan.id} start replay diverges`);
      }
      return {
        ...getExecutionPlanBundleFromState(state, executionPlan.id),
        workOrderAttempt: priorStart,
        idempotent: true,
      };
    }
    if (
      approval.id !== executionPlan.approvalId ||
      approval.status !== APPROVAL_STATUS.APPROVED ||
      approval.allowedNextAction !== WORK_ORDER_ACTION.START_SEQUENTIAL ||
      approval.taskId !== executionPlan.controlTaskId ||
      approval.metadata?.executionPlanId !== executionPlan.id ||
      approval.metadata?.controlTaskId !== executionPlan.controlTaskId ||
      approval.metadata?.previewId !== executionPlan.previewId ||
      approval.metadata?.sourceDigest !== executionPlan.sourceDigest
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} does not have the required approval`);
    }
    const expectedWorkOrderId = executionPlan.workOrderIds
      .map((id) => assertWorkOrder(id, state))
      .sort(
        (left, right) => left.position - right.position || left.id.localeCompare(right.id),
      )[0]?.id;
    const workOrder = selectOperatorSteppedWorkOrder(
      state,
      executionPlan,
      WORK_ORDER_ATTEMPT_ACTION.START_BUILDER,
      expectedWorkOrderId,
    );
    const attempt = createActiveSchedulerAttempt(state, {
      action: WORK_ORDER_ATTEMPT_ACTION.START_BUILDER,
      approvalRefs: [approval.id],
      checkpoint: null,
      command: WORK_ORDER_ATTEMPT_COMMAND.START,
      executionPlan,
      source,
      workOrder,
    });
    const now = attempt.startedAt;
    executionPlan.status = EXECUTION_PLAN_STATUS.ACTIVE;
    executionPlan.activeWorkOrderId = workOrder.id;
    executionPlan.startedAt = now;
    executionPlan.updatedAt = now;
    workOrder.status = WORK_ORDER_STATUS.ACTIVE;
    workOrder.startedAt = now;
    workOrder.updatedAt = now;
    source.mission.status = 'executing';
    source.mission.updatedAt = now;
    store.saveState(state);
    return {
      ...getExecutionPlanBundleFromState(state, executionPlan.id),
      workOrderAttempt: attempt,
      idempotent: false,
    };
  }

  function beginSequentialWorkOrderExecution(input) {
    const expectedFields = ['approvalId', 'executionPlanId'];
    const actualFields = Object.keys(input || {}).sort();
    if (
      actualFields.length !== expectedFields.length ||
      actualFields.some((field, index) => field !== expectedFields[index])
    ) {
      throw conflict('Sequential WorkOrder start has unexpected or missing fields');
    }
    const state = store.loadState();
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const approval = assertApproval(input.approvalId, state);
    const mission = assertMission(executionPlan.missionId, state);
    const project = assertProject(executionPlan.projectId, state);
    const councilSession = assertCouncilSession(executionPlan.councilSessionId, state);

    if (councilSession.staffingEntryRef) {
      return beginOperatorSteppedWorkOrderExecution(state, input);
    }

    if (executionPlan.status !== EXECUTION_PLAN_STATUS.APPROVED) {
      throw conflict(`ExecutionPlan ${executionPlan.id} is not approved`);
    }
    if (
      approval.id !== executionPlan.approvalId ||
      approval.status !== APPROVAL_STATUS.APPROVED ||
      approval.allowedNextAction !== WORK_ORDER_ACTION.START_SEQUENTIAL ||
      approval.taskId !== executionPlan.controlTaskId ||
      approval.metadata?.executionPlanId !== executionPlan.id ||
      approval.metadata?.controlTaskId !== executionPlan.controlTaskId ||
      approval.metadata?.previewId !== executionPlan.previewId ||
      approval.metadata?.sourceDigest !== executionPlan.sourceDigest
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} does not have the required approval`);
    }
    assertRealCouncilSourceCurrent(councilSession, mission, project);
    if (
      project.provider?.mode !== PROVIDER_MODE.LOCAL_STUB ||
      project.provider?.adapter !== PROVIDER_ADAPTER_ID.LOCAL_STUB
    ) {
      throw conflict('Sequential WorkOrder dispatch supports local-stub only');
    }

    const ready = executionPlan.workOrderIds
      .map((id) => assertWorkOrder(id, state))
      .filter((entry) => entry.status === WORK_ORDER_STATUS.QUEUED);
    if (
      ready.length !== 1 ||
      ready[0].role !== 'builder' ||
      ready[0].dependencyIds.length !== 0
    ) {
      throw conflict(`ExecutionPlan ${executionPlan.id} does not have one ready Builder WorkOrder`);
    }

    const now = new Date().toISOString();
    executionPlan.status = EXECUTION_PLAN_STATUS.ACTIVE;
    executionPlan.activeWorkOrderId = ready[0].id;
    executionPlan.startedAt = now;
    executionPlan.updatedAt = now;
    ready[0].status = WORK_ORDER_STATUS.ACTIVE;
    ready[0].startedAt = now;
    ready[0].updatedAt = now;
    mission.status = 'executing';
    mission.updatedAt = now;
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function finalizeSequentialWorkOrderExecution(input) {
    const state = store.loadState();
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const workOrder = assertWorkOrder(input.workOrderId, state);
    if (
      executionPlan.activeWorkOrderId !== workOrder.id ||
      workOrder.status !== WORK_ORDER_STATUS.ACTIVE
    ) {
      throw conflict(`WorkOrder ${workOrder.id} is not the active sequential dispatch`);
    }

    const stageResults = Array.isArray(input.stageResults) ? input.stageResults : [];
    const uniqueRefs = (key) => [...new Set(stageResults.map((entry) => entry[key]).filter(Boolean))];
    const now = new Date().toISOString();
    workOrder.runRefs = uniqueRefs('runId');
    workOrder.artifactRefs = uniqueRefs('artifactId');
    workOrder.inboxItemRefs = uniqueRefs('inboxItemId');
    workOrder.approvalRefs = uniqueRefs('approvalId');
    executionPlan.runRefs = [...workOrder.runRefs];
    executionPlan.artifactRefs = [...workOrder.artifactRefs];
    executionPlan.terminalGateApprovalId = input.terminalGateApprovalId || null;
    executionPlan.stopReason = String(input.stopReason || '').trim() || null;
    executionPlan.stoppedAt = String(input.stoppedAt || '').trim() || null;
    executionPlan.updatedAt = now;
    workOrder.updatedAt = now;
    let checkpoint = null;

    if (
      executionPlan.stoppedAt === 'request-builder-live-mutation-approval' &&
      executionPlan.terminalGateApprovalId
    ) {
      const gateApproval = assertApproval(executionPlan.terminalGateApprovalId, state);
      if (
        gateApproval.taskId !== executionPlan.controlTaskId ||
        gateApproval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION ||
        gateApproval.status !== APPROVAL_STATUS.PENDING
      ) {
        throw conflict('Builder terminal gate approval does not match the control task');
      }
      workOrder.status = WORK_ORDER_STATUS.WAITING_GATE;
      checkpoint = appendWorkflowCheckpoint(
        state,
        getReviewedDeliveryRoleBundle(state, executionPlan.id),
        WORKFLOW_CHECKPOINT_STAGE.BUILDER_WAITING_GATE,
        {
          createdAt: now,
          stopReason: 'builder-waiting-for-live-mutation-approval',
        },
      );
    } else {
      executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
      workOrder.status = WORK_ORDER_STATUS.BLOCKED;
    }

    if (getPlanWorkOrderAttempts(state, executionPlan.id).some(
      (attempt) =>
        attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE &&
        attempt.action !==
          WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
    )) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: checkpoint
          ? WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE
          : WORK_ORDER_ATTEMPT_STATUS.FAILED,
        checkpointRef: checkpoint?.id || null,
        approvalRefs: [
          executionPlan.approvalId,
          executionPlan.terminalGateApprovalId,
          ...workOrder.approvalRefs,
        ].filter(Boolean),
        runRefs: workOrder.runRefs,
        artifactRefs: workOrder.artifactRefs,
        decisionInboxItemRefs: workOrder.inboxItemRefs,
        stopReason: checkpoint
          ? 'builder-waiting-for-live-mutation-approval'
          : executionPlan.stopReason || 'builder-preflight-failed',
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }

    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function failSequentialWorkOrderExecution(input) {
    const state = store.loadState();
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const workOrder = executionPlan.activeWorkOrderId
      ? assertWorkOrder(executionPlan.activeWorkOrderId, state)
      : null;
    const now = new Date().toISOString();
    executionPlan.status = EXECUTION_PLAN_STATUS.BLOCKED;
    executionPlan.stopReason = String(input.reason || 'sequential-dispatch-failed');
    executionPlan.updatedAt = now;
    if (workOrder && workOrder.status === WORK_ORDER_STATUS.ACTIVE) {
      workOrder.status = WORK_ORDER_STATUS.BLOCKED;
      workOrder.updatedAt = now;
    }
    if (getPlanWorkOrderAttempts(state, executionPlan.id).some(
      (attempt) =>
        attempt.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE &&
        attempt.action !==
          WORK_ORDER_ATTEMPT_ACTION.START_BUILDER_REWORK_PREFLIGHT,
    )) {
      transitionActiveSchedulerAttempt(state, executionPlan, {
        status: WORK_ORDER_ATTEMPT_STATUS.FAILED,
        approvalRefs: [executionPlan.approvalId].filter(Boolean),
        runRefs: workOrder?.runRefs || [],
        artifactRefs: workOrder?.artifactRefs || [],
        decisionInboxItemRefs: workOrder?.inboxItemRefs || [],
        stopReason: executionPlan.stopReason,
        workOrderAttemptId: input.workOrderAttemptId || null,
      });
    }
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function getCouncilProviderReadiness(input = {}) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);
    const reasons = [];

    if (project.pack !== PACKS.DEVELOPMENT) {
      reasons.push('Council provider mode supports the development pack only');
    }

    if (companyRuntime?.status !== 'ready' || !companyRuntime.blueprint) {
      reasons.push('CompanyBlueprint is not ready');
    }

    const councilRoles = ['strategist', 'architect', 'decomposer', 'conductor'];
    const roleReadiness = councilRoles.map((role) => {
      const profile = companyRuntime?.blueprint?.agentProfiles?.find(
        (candidate) => candidate.role === role,
      );
      const readiness = councilLiveAdapter.getReadiness({
        profile,
        providerConfig: project.provider,
      });

      if (!readiness.allowed) {
        reasons.push(...readiness.reasons.map((reason) => `${role}: ${reason}`));
      }

      return {
        role,
        allowed: readiness.allowed,
        readiness: readiness.readiness,
        reasons: [...readiness.reasons],
      };
    });

    return {
      projectId: project.id,
      mode: PROVIDER_COUNCIL_MODE,
      adapter: 'openai-responses',
      allowed: reasons.length === 0,
      readiness: reasons.length === 0 ? 'ready' : 'blocked',
      reasons: [...new Set(reasons)],
      roles: roleReadiness,
    };
  }

  function listCouncilProviderReadinessSummaries() {
    const state = store.loadState();

    return Object.fromEntries(
      Object.values(state.projects).map((project) => [
        project.id,
        getCouncilProviderReadiness({ projectId: project.id }),
      ]),
    );
  }

  function startRealCouncilForMission(input) {
    if (input.mode && input.mode !== REAL_COUNCIL_MODE) {
      throw new Error(`Unsupported Council mode: ${input.mode}`);
    }
    const error = new Error(
      'Local Council start requires one exact accepted StaffingPlan Council entry',
    );
    error.code = 'STAFFING_PLAN_ENTRY_REQUIRED';
    error.statusCode = 409;
    throw error;
  }

  async function startProviderCouncilForMission(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);
    const project = assertProject(mission.projectId, state);
    const now = new Date().toISOString();

    if (input.mode !== PROVIDER_COUNCIL_MODE) {
      throw new Error(`Unsupported Council mode: ${input.mode}`);
    }

    const readiness = getCouncilProviderReadiness({ projectId: project.id });

    if (!readiness.allowed) {
      const error = new Error('OpenAI Responses Council provider is not ready');
      error.code = 'COUNCIL_PROVIDER_NOT_READY';
      error.statusCode = 409;
      error.reasons = readiness.reasons;
      throw error;
    }

    if (mission.councilSessionId && state.councilSessions[mission.councilSessionId]) {
      const error = new Error(
        `Mission ${mission.id} already has a council session: ${mission.councilSessionId}`,
      );
      error.statusCode = 409;
      throw error;
    }

    const councilSession = createRealCouncilSession({
      id: nextId(state, 'councilSession'),
      mission,
      project,
      companyRuntime,
      mode: PROVIDER_COUNCIL_MODE,
      now,
    });

    await councilLiveCoordinator.runAsyncAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      providerConfig: project.provider,
      signal: input.signal || null,
      now,
    });

    state.councilSessions[councilSession.id] = councilSession;
    mission.councilSessionId = councilSession.id;
    mission.status = councilSession.phase === 'terminal' ? 'blocked' : 'aligning';
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  function resumeRealCouncilSession(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const now = new Date().toISOString();

    if (councilSession.mode !== REAL_COUNCIL_MODE) {
      throw new Error(`Council session ${councilSession.id} is not a Real Council session`);
    }

    if (councilSession.staffingEntryRef) {
      const error = new Error(
        `StaffingEntry-bound Council session ${councilSession.id} cannot resume`,
      );
      error.code = 'STAFFING_ENTRY_ACTION_BLOCKED';
      error.statusCode = 409;
      throw error;
    }

    if (councilSession.phase === 'terminal') {
      const error = new Error(`Council session ${councilSession.id} is terminal`);
      error.statusCode = 409;
      throw error;
    }

    if (companyRuntime?.status !== 'ready' || !companyRuntime.blueprint) {
      throw new Error('CompanyBlueprint must be ready before Real Council resumes');
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);
    const currentAttempt = councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    );
    const failures = currentAttempt?.conflictSummary?.requiredRoleFailures || [];
    const unsupportedEvidenceRefs =
      currentAttempt?.conflictSummary?.unsupportedEvidenceRefs || [];

    if (
      currentAttempt?.status !== 'failed' ||
      (failures.length === 0 && unsupportedEvidenceRefs.length === 0)
    ) {
      const error = new Error(`Council session ${councilSession.id} has no failed attempt to resume`);
      error.statusCode = 409;
      throw error;
    }

    const synthesisOnly =
      failures.length > 0 && failures.every((failure) => failure.role === 'conductor');
    const failedAgentIds = failures
      .filter((failure) => failure.role !== 'conductor')
      .map((failure) => failure.agentId);
    const unsupportedAgentIds = (currentAttempt.positions || [])
      .filter((position) =>
        position.evidenceRefs.some((ref) => unsupportedEvidenceRefs.includes(ref)),
      )
      .map((position) => position.agentId);
    const targetAgentIds = Array.isArray(input.targetAgentIds)
      ? input.targetAgentIds
      : [...new Set([...failedAgentIds, ...unsupportedAgentIds])];
    const attempt = councilCoordinator.runAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      targetAgentIds,
      synthesisOnly,
      revisionRequest: {
        note: 'Resume failed Council attempt',
        targetAgentIds: synthesisOnly ? [councilSession.staffingSnapshot.conductorAgentId] : targetAgentIds,
      },
      now,
    });

    councilSession.alignment = {
      action: 'resume',
      decidedAt: now,
      status: 'pending',
    };
    store.saveState(state);

    return {
      attempt,
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  async function resumeProviderCouncilSession(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const now = new Date().toISOString();

    if (councilSession.mode !== PROVIDER_COUNCIL_MODE) {
      throw new Error(`Council session ${councilSession.id} is not a provider Council session`);
    }

    if (councilSession.phase === 'terminal') {
      const error = new Error(`Council session ${councilSession.id} is terminal`);
      error.statusCode = 409;
      throw error;
    }

    const readiness = getCouncilProviderReadiness({ projectId: project.id });

    if (!readiness.allowed) {
      const error = new Error('OpenAI Responses Council provider is not ready');
      error.code = 'COUNCIL_PROVIDER_NOT_READY';
      error.statusCode = 409;
      throw error;
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);
    const currentAttempt = councilSession.attempts.find(
      (attempt) => attempt.id === councilSession.currentAttemptId,
    );
    const failures = currentAttempt?.conflictSummary?.requiredRoleFailures || [];
    const unsupportedEvidenceRefs = currentAttempt?.conflictSummary?.unsupportedEvidenceRefs || [];

    if (
      currentAttempt?.status !== 'failed' ||
      (failures.length === 0 && unsupportedEvidenceRefs.length === 0)
    ) {
      const error = new Error(`Council session ${councilSession.id} has no failed attempt to resume`);
      error.statusCode = 409;
      throw error;
    }

    const synthesisOnly = failures.length > 0 && failures.every(
      (failure) => failure.role === 'conductor',
    );
    const failedAgentIds = failures
      .filter((failure) => failure.role !== 'conductor')
      .map((failure) => failure.agentId);
    const unsupportedAgentIds = (currentAttempt.positions || [])
      .filter((position) =>
        position.evidenceRefs.some((ref) => unsupportedEvidenceRefs.includes(ref)),
      )
      .map((position) => position.agentId);
    const targetAgentIds = Array.isArray(input.targetAgentIds)
      ? input.targetAgentIds
      : [...new Set([...failedAgentIds, ...unsupportedAgentIds])];
    const attempt = await councilLiveCoordinator.runAsyncAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      providerConfig: project.provider,
      targetAgentIds,
      synthesisOnly,
      revisionRequest: {
        note: 'Resume failed Council attempt',
        targetAgentIds: synthesisOnly
          ? [councilSession.staffingSnapshot.conductorAgentId]
          : targetAgentIds,
      },
      signal: input.signal || null,
      now,
    });

    councilSession.alignment = { action: 'resume', decidedAt: now, status: 'pending' };
    mission.status = councilSession.phase === 'terminal' ? 'blocked' : 'aligning';
    mission.updatedAt = now;
    store.saveState(state);

    return {
      attempt,
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  function decideRealCouncilSession(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const action = String(input.action || '').trim();
    const now = new Date().toISOString();

    if (councilSession.mode !== REAL_COUNCIL_MODE) {
      throw new Error(`Council session ${councilSession.id} is not a Real Council session`);
    }

    if (!['approve', 'request-revision', 'stop'].includes(action)) {
      throw new Error('Real Council decision must be approve, request-revision, or stop');
    }

    if (councilSession.staffingEntryRef && action === 'request-revision') {
      const error = new Error(
        `StaffingEntry-bound Council session ${councilSession.id} cannot request revision`,
      );
      error.code = 'STAFFING_ENTRY_ACTION_BLOCKED';
      error.statusCode = 409;
      throw error;
    }

    if (councilSession.phase === 'terminal') {
      const error = new Error(`Council session ${councilSession.id} is terminal`);
      error.statusCode = 409;
      throw error;
    }

    if (action === 'stop') {
      councilSession.phase = 'terminal';
      councilSession.status = 'stopped';
      councilSession.terminalReason = 'operator-stopped';
      councilSession.alignment = {
        action,
        decidedAt: now,
        status: 'stopped',
      };
      councilSession.updatedAt = now;
      mission.status = 'blocked';
      mission.updatedAt = now;
      store.saveState(state);
      return {
        attempt: null,
        councilSession: state.councilSessions[councilSession.id],
        mission: state.missions[mission.id],
      };
    }

    if (councilSession.phase !== 'awaiting-alignment') {
      const error = new Error(`Council session ${councilSession.id} is not awaiting alignment`);
      error.statusCode = 409;
      throw error;
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);

    if (action === 'approve') {
      councilSession.phase = 'terminal';
      councilSession.status = 'approved';
      councilSession.terminalReason = 'operator-approved';
      councilSession.alignment = {
        action,
        decidedAt: now,
        status: 'approved',
      };
      councilSession.updatedAt = now;
      mission.status = mission.linkedTaskId ? 'executing' : 'aligned';
      mission.updatedAt = now;
      store.saveState(state);
      return {
        attempt: null,
        councilSession: state.councilSessions[councilSession.id],
        mission: state.missions[mission.id],
      };
    }

    const note = String(input.note || '').trim();
    const targetAgentIds = Array.isArray(input.targetAgentIds)
      ? [...new Set(input.targetAgentIds.map((agentId) => String(agentId || '').trim()).filter(Boolean))]
      : [];

    if (!note || targetAgentIds.length === 0) {
      throw new Error('request-revision requires a note and targetAgentIds');
    }

    const revisionRequest = {
      note,
      targetAgentIds,
      requestedAt: now,
    };
    const attempt = councilCoordinator.runAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      targetAgentIds,
      revisionRequest,
      now,
    });

    councilSession.alignment = {
      action,
      decidedAt: now,
      status: 'pending',
    };
    store.saveState(state);

    return {
      attempt,
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  async function decideProviderCouncilSession(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);
    const action = String(input.action || '').trim();
    const now = new Date().toISOString();

    if (councilSession.mode !== PROVIDER_COUNCIL_MODE) {
      throw new Error(`Council session ${councilSession.id} is not a provider Council session`);
    }

    if (!['approve', 'request-revision', 'stop'].includes(action)) {
      throw new Error('Real Council decision must be approve, request-revision, or stop');
    }

    if (councilSession.phase === 'terminal') {
      const error = new Error(`Council session ${councilSession.id} is terminal`);
      error.statusCode = 409;
      throw error;
    }

    if (action === 'stop') {
      councilSession.phase = 'terminal';
      councilSession.status = 'stopped';
      councilSession.terminalReason = 'operator-stopped';
      councilSession.alignment = { action, decidedAt: now, status: 'stopped' };
      councilSession.updatedAt = now;
      mission.status = 'blocked';
      mission.updatedAt = now;
      store.saveState(state);
      return { attempt: null, councilSession, mission };
    }

    if (councilSession.phase !== 'awaiting-alignment') {
      const error = new Error(`Council session ${councilSession.id} is not awaiting alignment`);
      error.statusCode = 409;
      throw error;
    }

    assertRealCouncilSourceCurrent(councilSession, mission, project);

    if (action === 'approve') {
      councilSession.phase = 'terminal';
      councilSession.status = 'approved';
      councilSession.terminalReason = 'operator-approved';
      councilSession.alignment = { action, decidedAt: now, status: 'approved' };
      councilSession.updatedAt = now;
      mission.status = mission.linkedTaskId ? 'executing' : 'aligned';
      mission.updatedAt = now;
      store.saveState(state);
      return { attempt: null, councilSession, mission };
    }

    const note = String(input.note || '').trim();
    const targetAgentIds = Array.isArray(input.targetAgentIds)
      ? [...new Set(input.targetAgentIds.map((agentId) => String(agentId || '').trim()).filter(Boolean))]
      : [];

    if (!note || targetAgentIds.length === 0) {
      throw new Error('request-revision requires a note and targetAgentIds');
    }

    const revisionRequest = { note, targetAgentIds, requestedAt: now };
    const attempt = await councilLiveCoordinator.runAsyncAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      providerConfig: project.provider,
      targetAgentIds,
      revisionRequest,
      signal: input.signal || null,
      now,
    });

    councilSession.alignment = { action, decidedAt: now, status: 'pending' };
    mission.status = councilSession.phase === 'terminal' ? 'blocked' : 'aligning';
    mission.updatedAt = now;
    store.saveState(state);
    return { attempt, councilSession, mission };
  }

  function approveCouncilRecommendation(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);

    if (!mission.councilSessionId) {
      throw new Error(`Mission ${mission.id} does not have a council session`);
    }

    const councilSession = assertCouncilSession(mission.councilSessionId, state);
    const now = new Date().toISOString();

    if (isRealCouncilMode(councilSession.mode)) {
      const error = new Error(
        `Council session ${councilSession.id} requires the Real Council decision path`,
      );
      error.statusCode = 409;
      throw error;
    }

    if (councilSession.missionId !== mission.id) {
      throw new Error(
        `Council session ${councilSession.id} is not linked to mission ${mission.id}`,
      );
    }

    if (councilSession.alignment?.status === 'approved') {
      const error = new Error(
        `Council session ${councilSession.id} is already approved for mission ${mission.id}`,
      );
      error.statusCode = 409;
      throw error;
    }

    councilSession.status = 'approved';
    councilSession.alignment = {
      action: 'approve-recommendation',
      decidedAt: now,
      status: 'approved',
    };
    councilSession.updatedAt = now;
    mission.status = mission.linkedTaskId ? 'executing' : 'aligned';
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
  }

  function syncMissionExecutionStateFromTask(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);
    const taskId = input.taskId || mission.linkedTaskId || null;
    const task = taskId ? assertTask(taskId, state) : null;
    const now = new Date().toISOString();
    let nextStatus = mission.status || 'draft';

    if (!task) {
      nextStatus = mission.councilSessionId ? 'aligned' : 'draft';
    } else if (task.missionId !== mission.id) {
      throw new Error(`Task ${task.id} is not linked to mission ${mission.id}`);
    } else if (
      task.lifecycleState === TASK_LIFECYCLE.DONE &&
      task.review?.status === REVIEW_STATUS.PASSED
    ) {
      const executionPlan = findExecutionPlanForMissionControlTask(state, mission, task);
      if (executionPlan) {
        const closeOut = findMissionCloseOut(state, mission.id);
        if (!closeOut || closeOut.executionPlanId !== executionPlan.id) {
          throw conflict(
            `Mission ${mission.id} requires MissionCloseOut evidence before completed sync`,
          );
        }
        if (mission.status === 'completed') return mission;
      }
      nextStatus = 'completed';
    } else if (task.flags?.blocked || task.flags?.waitingDecision) {
      nextStatus = 'blocked';
    } else {
      nextStatus = 'executing';
    }

    mission.status = nextStatus;
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return state.missions[mission.id];
  }

  function getTask(taskId) {
    const state = store.loadState();
    return assertTask(taskId, state);
  }

  function normalizeTaskWorktreeRef(worktreeRef) {
    if (worktreeRef === null || worktreeRef === undefined) {
      return null;
    }

    const trimmedWorktreeRef = String(worktreeRef).trim();

    if (!trimmedWorktreeRef) {
      return null;
    }

    const resolvedWorktreeRef = path.resolve(trimmedWorktreeRef);

    if (!fs.existsSync(resolvedWorktreeRef)) {
      throw new Error(`worktreeRef does not exist: ${trimmedWorktreeRef}`);
    }

    if (!fs.statSync(resolvedWorktreeRef).isDirectory()) {
      throw new Error(`worktreeRef must be a directory: ${trimmedWorktreeRef}`);
    }

    return fs.realpathSync(resolvedWorktreeRef);
  }

  function setTaskWorktreeRef(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const now = new Date().toISOString();

    task.worktreeRef = normalizeTaskWorktreeRef(input.worktreeRef);
    task.updatedAt = now;
    store.saveState(state);

    return state.tasks[task.id];
  }

  function createDecisionInboxItem(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const now = new Date().toISOString();
    const item = createDecisionInboxItemRecord(state, {
      ...input,
      taskId: task.id,
      kind: DECISION_INBOX_KIND.DECISION,
      now,
    });

    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return item;
  }

  function getDecisionInboxItem(itemId) {
    const state = store.loadState();
    return assertDecisionInboxItem(itemId, state);
  }

  function getApproval(approvalId) {
    const state = store.loadState();
    return assertApproval(approvalId, state);
  }

  function listApprovals(input = {}) {
    const state = store.loadState();
    let approvals = Object.values(state.approvals);

    if (input.projectId) {
      approvals = approvals.filter((approval) => approval.projectId === input.projectId);
    }

    if (input.taskId) {
      approvals = approvals.filter((approval) => approval.taskId === input.taskId);
    }

    if (input.status) {
      approvals = approvals.filter((approval) => approval.status === input.status);
    }

    if (input.scope) {
      approvals = approvals.filter((approval) => approval.scope === input.scope);
    }

    if (input.allowedNextAction) {
      approvals = approvals.filter(
        (approval) => approval.allowedNextAction === input.allowedNextAction,
      );
    }

    return approvals.sort((left, right) => {
      if (left.createdAt === right.createdAt) {
        return left.id.localeCompare(right.id);
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  function listDecisionInboxItems(input = {}) {
    const state = store.loadState();
    let items = Object.values(state.decisionInboxItems);

    if (input.projectId) {
      items = items.filter((item) => item.projectId === input.projectId);
    }

    if (input.taskId) {
      items = items.filter((item) => item.taskId === input.taskId);
    }

    if (input.kind) {
      items = items.filter((item) => item.kind === input.kind);
    }

    if (input.status) {
      items = items.filter((item) => item.status === input.status);
    }

    return items.sort((left, right) => {
      if (left.createdAt === right.createdAt) {
        return left.id.localeCompare(right.id);
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
  }

  function resolveReview(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const item = input.itemId
      ? assertDecisionInboxItem(input.itemId, state)
      : findPendingReviewItem(task.id, state);
    const now = new Date().toISOString();

    if (!item) {
      throw new Error(`Pending review item not found for task ${task.id}`);
    }

    if (item.taskId !== task.id || item.kind !== DECISION_INBOX_KIND.REVIEW) {
      throw new Error(`Review item does not match task ${task.id}`);
    }

    applyReviewResolution(task, item, input, now, state);
    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return task.review;
  }

  function openReviewGate(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const now = new Date().toISOString();
    const result = ensurePendingReviewGateRecord(state, task, now);

    store.saveState(state);

    return {
      review: task.review,
      reviewItem: result.reviewItem,
      task,
    };
  }

  function resolveBuilderReworkMutationApprovalDecision(
    state,
    item,
    task,
    input,
    now,
  ) {
    const approval = assertBuilderReworkMutationApproval(item.sourceId, state);
    assertBuilderReworkMutationApprovalRecord(approval);
    if (
      item.kind !== DECISION_INBOX_KIND.APPROVAL ||
      item.sourceType !== DECISION_INBOX_SOURCE_TYPE.APPROVAL ||
      item.sourceId !== approval.id ||
      approval.inboxItemId !== item.id
    ) {
      throw conflict(
        'Builder rework mutation Approval Decision Inbox binding is invalid',
      );
    }
    if (
      item.status !== DECISION_INBOX_STATUS.PENDING ||
      approval.status !== APPROVAL_STATUS.PENDING
    ) {
      throw conflict(
        `Builder rework mutation Approval ${approval.id} is already terminal`,
      );
    }
    if (
      input.action !== APPROVAL_STATUS.APPROVED &&
      input.action !== APPROVAL_STATUS.REJECTED
    ) {
      const error = new Error(
        'Builder rework mutation Approval must resolve to approved or rejected',
      );
      error.statusCode = 400;
      throw error;
    }
    const source = buildBuilderReworkMutationApprovalSource(
      state,
      approval.metadata.reworkPlanId,
      now,
    );
    const currentMetadata = buildBuilderReworkMutationApprovalMetadata(
      source.sourceFields,
    );
    if (
      approval.taskId !== source.task.id ||
      approval.targetRunId !== source.preflightRun.id ||
      approval.targetArtifactId !== source.preflightArtifact.id ||
      digestBuilderReworkMutationCanonical(approval.metadata) !==
        digestBuilderReworkMutationCanonical(currentMetadata)
    ) {
      throw conflict(
        'Builder rework mutation Approval source binding is stale',
      );
    }
    const beforeFlags = {
      blocked: task.flags?.blocked,
      waitingDecision: task.flags?.waitingDecision,
    };
    resolveInboxItemRecord(item, input.action, input.note || '', now);
    approval.status = input.action;
    approval.updatedAt = now;
    approval.resolvedAt = now;
    recalculateTaskFlags(task, state);
    if (
      task.flags.blocked !== beforeFlags.blocked ||
      task.flags.waitingDecision !== beforeFlags.waitingDecision
    ) {
      throw conflict(
        'Builder rework mutation Approval resolution changed unrelated task gates',
      );
    }
    task.updatedAt = now;
    store.saveState(state);
    return item;
  }

  function resolveDecisionInboxItem(input) {
    const state = store.loadState();
    const item = assertDecisionInboxItem(input.itemId, state);
    const task = assertTask(item.taskId, state);
    const now = new Date().toISOString();

    if (!input.action) {
      throw new Error('Resolution action is required');
    }

    if (
      item.kind === DECISION_INBOX_KIND.APPROVAL &&
      state.approvals[item.sourceId]?.allowedNextAction ===
        BUILDER_REWORK_MUTATION_ACTION
    ) {
      return resolveBuilderReworkMutationApprovalDecision(
        state,
        item,
        task,
        input,
        now,
      );
    }

    if (item.kind === DECISION_INBOX_KIND.REVIEW) {
      applyReviewResolution(task, item, input, now, state);
      recalculateTaskFlags(task, state);
      task.updatedAt = now;
      store.saveState(state);

      return item;
    }

    resolveInboxItemRecord(item, input.action, input.note || '', now);

    if (item.kind === DECISION_INBOX_KIND.APPROVAL) {
      const approval = assertApproval(item.sourceId, state);

      if (
        input.action !== APPROVAL_STATUS.APPROVED &&
        input.action !== APPROVAL_STATUS.REJECTED
      ) {
        throw new Error('Approval items must resolve to approved or rejected');
      }

      approval.status = input.action;
      approval.updatedAt = now;
      approval.resolvedAt = now;
      reconcileExecutionPlanApproval(state, approval, input.action, now);
    }

    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return item;
  }

  function createApprovalPlaceholderRecord(state, input, now) {
    const task = assertTask(input.taskId, state);
    if (input.allowedNextAction === BUILDER_REWORK_MUTATION_ACTION) {
      throw conflict(
        'Builder rework live mutation requires the dedicated builder-rework-live-mutation approval path',
      );
    }
    const approvalId = nextId(state, 'approval');
    const inboxItemId = nextId(state, 'decisionInboxItem');
    const metadata =
      input.metadata && typeof input.metadata === 'object' ? { ...input.metadata } : null;
    let targetArtifactId = null;
    let targetRunId = null;

    if (input.targetArtifactId || input.targetRunId) {
      if (!input.targetArtifactId || !input.targetRunId) {
        throw new Error('targetArtifactId and targetRunId must be provided together');
      }

      const artifact = assertArtifact(input.targetArtifactId, state);
      const run = assertRun(input.targetRunId, state);

      if (artifact.taskId !== task.id) {
        throw new Error(`Artifact ${artifact.id} is not linked to task ${task.id}`);
      }

      if (artifact.type !== 'preflight') {
        throw new Error('Approval targets must reference a preflight artifact');
      }

      if (artifact.runId !== run.id) {
        throw new Error(`Approval target run ${run.id} does not match artifact ${artifact.id}`);
      }

      targetArtifactId = artifact.id;
      targetRunId = run.id;
    }

    if (
      (input.allowedNextAction || 'commit') === BUILDER_ACTION.LIVE_MUTATION &&
      (!targetArtifactId || !targetRunId)
    ) {
      throw new Error('Builder live mutation approvals require targetArtifactId and targetRunId');
    }

    state.approvals[approvalId] = {
      id: approvalId,
      projectId: task.projectId,
      taskId: task.id,
      scope: input.scope || 'commit',
      status: APPROVAL_STATUS.PENDING,
      placeholder: true,
      allowedNextAction: input.allowedNextAction || 'commit',
      metadata,
      inboxItemId,
      title: input.title || `Approval required: ${input.scope || 'commit'}`,
      prompt:
        input.prompt ||
        `Approval required before ${input.allowedNextAction || 'commit'}.`,
      targetArtifactId,
      targetRunId,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    createDecisionInboxItemRecord(state, {
      id: inboxItemId,
      taskId: task.id,
      kind: DECISION_INBOX_KIND.APPROVAL,
      title: state.approvals[approvalId].title,
      prompt: state.approvals[approvalId].prompt,
      sourceType: DECISION_INBOX_SOURCE_TYPE.APPROVAL,
      sourceId: approvalId,
      blocksTask: false,
      now,
    });

    return state.approvals[approvalId];
  }

  function createApprovalPlaceholder(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const now = new Date().toISOString();
    const approval = createApprovalPlaceholderRecord(state, input, now);

    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return approval;
  }

  function requestBuilderLiveMutationApproval(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const reworkWaitingGate = Object.values(
      state.builderReworkDispatches || {},
    ).find((dispatch) => {
      const executionPlan = state.executionPlans[dispatch.executionPlanId];
      const attempt = state.workOrderAttempts[dispatch.workOrderAttemptId];
      return (
        executionPlan?.controlTaskId === task.id &&
        attempt?.status === WORK_ORDER_ATTEMPT_STATUS.WAITING_GATE &&
        attempt.stopReason ===
          'builder-rework-preflight-complete-mutation-approval-blocked'
      );
    });
    if (reworkWaitingGate) {
      throw conflict(
        `Task ${task.id} must use the dedicated builder-rework-live-mutation approval path for ${reworkWaitingGate.id}`,
      );
    }
    const summary = buildBuilderLiveMutationApprovalRequestSummary(task, state);

    if (!summary.allowed) {
      const error = new Error(
        `Task ${task.id} cannot request builder live mutation approval: ${summary.reasons.join('; ')}`,
      );

      error.statusCode = summary.conflict ? 409 : 400;
      throw error;
    }

    const now = new Date().toISOString();
    const approval = createApprovalPlaceholderRecord(
      state,
      {
        taskId: task.id,
        scope: input.scope || 'builder',
        allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
        targetArtifactId: summary.currentPreflightArtifactId,
        targetRunId: summary.currentPreflightRunId,
        title: input.title || 'Approval required: builder live mutation',
        prompt:
          input.prompt ||
          `Approval required before builder live mutation for preflight ${summary.currentPreflightArtifactId}.`,
      },
      now,
    );

    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return approval;
  }

  function transitionTaskLifecycle(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const nextLifecycleState = input.to;
    const now = new Date().toISOString();
    const gateState = computeTaskGateState(task, state);

    if (!Object.values(TASK_LIFECYCLE).includes(nextLifecycleState)) {
      throw new Error(`Unsupported task lifecycle transition target: ${nextLifecycleState}`);
    }

    if (task.missionId) {
      const mission = assertMission(task.missionId, state);
      const executionPlan = findExecutionPlanForMissionControlTask(state, mission, task);
      const closeOut = executionPlan ? findMissionCloseOut(state, mission.id) : null;
      if (
        closeOut &&
        closeOut.executionPlanId === executionPlan.id &&
        task.lifecycleState === TASK_LIFECYCLE.DONE
      ) {
        if (nextLifecycleState === TASK_LIFECYCLE.DONE) return task;
        throw conflict(
          `Task ${task.id} is terminal under MissionCloseOut ${closeOut.id} and cannot reopen`,
        );
      }
    }

    if (
      nextLifecycleState === TASK_LIFECYCLE.DONE &&
      task.review.required &&
      task.review.status !== REVIEW_STATUS.PASSED
    ) {
      throw new Error(`Task ${task.id} cannot move to Done while review is unresolved`);
    }

    if (nextLifecycleState === TASK_LIFECYCLE.DONE) {
      const activeGates = listActiveTaskGates(gateState);

      if (activeGates.length > 0) {
        throw new Error(
          `Task ${task.id} cannot move to Done while gates remain active: ${activeGates.join(', ')}`,
        );
      }
      if (task.missionId) {
        const mission = assertMission(task.missionId, state);
        const executionPlan = findExecutionPlanForMissionControlTask(state, mission, task);
        if (executionPlan) {
          const closeOut = findMissionCloseOut(state, mission.id);
          if (!closeOut || closeOut.executionPlanId !== executionPlan.id) {
            throw conflict(
              `Task ${task.id} requires MissionCloseOut evidence before Done transition`,
            );
          }
          if (task.lifecycleState === TASK_LIFECYCLE.DONE) return task;
        }
      }
    }

    applyTaskGateFlags(task, gateState);
    task.lifecycleState = nextLifecycleState;
    task.updatedAt = now;
    store.saveState(state);

    return task;
  }

  function ensureCommitActionAllowed(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const action = input.action;
    const currentPreflight = getLatestPreflightContext(task, state);
    const approvalEvaluation = evaluateLatestApprovalForAction({
      action,
      currentPreflight,
      requireCurrentPreflightTarget: Boolean(currentPreflight.artifact),
      state,
      task,
    });

    if (!isCommitAction(action)) {
      throw new Error('Commit action must be commit-intent or commit-ready');
    }

    if (approvalEvaluation.latestApproval?.status === APPROVAL_STATUS.PENDING) {
      throw new Error(`Task ${task.id} cannot transition to ${action} while approval is unresolved`);
    }

    if (!approvalEvaluation.latestApproval) {
      throw new Error(
        `Task ${task.id} cannot transition to ${action} without an approved commit approval record`,
      );
    }

    if (approvalEvaluation.stale) {
      throw new Error(
        `Task ${task.id} cannot transition to ${action} because approval ${approvalEvaluation.latestApproval.id} is stale for the latest preflight`,
      );
    }

    if (approvalEvaluation.latestApproval.status === APPROVAL_STATUS.REJECTED) {
      throw new Error(
        `Task ${task.id} cannot transition to ${action} because approval ${approvalEvaluation.latestApproval.id} was rejected`,
      );
    }

    if (!approvalEvaluation.allowed) {
      throw new Error(
        `Task ${task.id} cannot transition to ${action} without an approved commit approval record`,
      );
    }

    return {
      approvalId: approvalEvaluation.latestApproval.id,
      taskId: task.id,
      action,
      allowed: true,
    };
  }

  function startRun(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);

    const id = nextId(state, 'run');
    const now = new Date().toISOString();
    const logPath = path.join(store.logsDir, `${id}.jsonl`);

    state.runs[id] = {
      id,
      taskId: task.id,
      kind: input.kind || 'placeholder',
      role: input.role || null,
      status: RUN_STATUS.RUNNING,
      metadata: input.metadata || null,
      summary: null,
      startedAt: now,
      finishedAt: null,
      logPath,
    };

    task.latestRunId = id;

    if (input.lifecycleState) {
      task.lifecycleState = input.lifecycleState;
    }

    task.updatedAt = now;

    store.saveState(state);

    return state.runs[id];
  }

  function startBuilderReworkPreflightRun(input) {
    const state = store.loadStateReadonly();
    const dispatch = assertBuilderReworkDispatch(
      input.builderReworkDispatchId,
      state,
    );
    const attempt = assertWorkOrderAttempt(dispatch.workOrderAttemptId, state);
    const executionPlan = assertExecutionPlan(dispatch.executionPlanId, state);
    assertTask(executionPlan.controlTaskId, state);
    if (
      attempt.id !== input.workOrderAttemptId ||
      attempt.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE
    ) {
      throw conflict(
        'Builder rework preflight Run requires its persisted active attempt',
      );
    }

    const id = nextId(state, 'run');
    const startedAt = new Date().toISOString();
    state.runs[id] = {
      id,
      taskId: executionPlan.controlTaskId,
      kind: 'role',
      role: 'builder',
      status: RUN_STATUS.RUNNING,
      metadata: {
        ...input.metadata,
        builderReworkDispatchId: dispatch.id,
        executionMode: 'rework-preflight',
        mutationAllowed: false,
        workOrderAttemptId: attempt.id,
      },
      summary: null,
      startedAt,
      finishedAt: null,
      logPath: path.join(store.logsDir, `${id}.jsonl`),
    };
    store.saveState(state);
    return state.runs[id];
  }

  function completeBuilderReworkPreflightRun(input) {
    const state = store.loadStateReadonly();
    const run = assertRun(input.runId, state);
    if (
      run.status !== RUN_STATUS.RUNNING ||
      run.metadata?.builderReworkDispatchId !== input.builderReworkDispatchId ||
      run.metadata?.executionMode !== 'rework-preflight' ||
      run.metadata?.mutationAllowed !== false
    ) {
      throw conflict('Builder rework preflight Run lineage is invalid');
    }
    run.status = input.status || RUN_STATUS.COMPLETED;
    run.finishedAt = new Date().toISOString();
    run.summary = input.summary || run.summary || null;
    store.saveState(state);
    return run;
  }

  function recordBuilderReworkPreflightArtifact(input) {
    const state = store.loadStateReadonly();
    const dispatch = assertBuilderReworkDispatch(
      input.builderReworkDispatchId,
      state,
    );
    const run = assertRun(input.runId, state);
    if (
      run.status !== RUN_STATUS.RUNNING ||
      run.taskId !== assertExecutionPlan(dispatch.executionPlanId, state).controlTaskId ||
      run.metadata?.builderReworkDispatchId !== dispatch.id ||
      run.metadata?.executionMode !== 'rework-preflight'
    ) {
      throw conflict('Builder rework preflight Artifact lineage is invalid');
    }

    const id = nextId(state, 'artifact');
    const filename = `${id}.md`;
    const artifactPath = store.writeArtifact(filename, input.content);
    state.artifacts[id] = {
      id,
      taskId: run.taskId,
      runId: run.id,
      type: 'preflight',
      path: artifactPath,
      createdAt: new Date().toISOString(),
    };
    store.saveState(state);
    return state.artifacts[id];
  }

  function startPlaceholderRun(input) {
    return startRun({
      ...input,
      kind: 'placeholder',
      lifecycleState: TASK_LIFECYCLE.IN_PROGRESS,
    });
  }

  function completeRun(input) {
    const state = store.loadState();
    const run = assertRun(input.runId, state);
    const task = assertTask(run.taskId, state);
    const now = new Date().toISOString();

    run.status = input.status || RUN_STATUS.COMPLETED;
    run.finishedAt = now;
    run.summary = input.summary || run.summary || null;

    task.updatedAt = now;
    store.saveState(state);

    return run;
  }

  function getRun(runId) {
    const state = store.loadState();
    return assertRun(runId, state);
  }

  function appendLog(input) {
    const state = store.loadState();
    const run = assertRun(input.runId, state);
    const record = {
      ts: new Date().toISOString(),
      level: input.level || 'info',
      message: input.message,
    };

    if (!record.message) {
      throw new Error('Log message is required');
    }

    store.appendLogRecord(run.id, record);
    return record;
  }

  function getLogs(runId) {
    const state = store.loadState();
    assertRun(runId, state);
    return store.readLogRecords(runId);
  }

  function recordArtifact(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const run = assertRun(input.runId, state);
    const type = input.type || 'output';

    assertSupportedArtifactType(type);

    const id = nextId(state, 'artifact');
    const createdAt = new Date().toISOString();
    const extension = input.extension || 'md';
    const filename = `${id}.${extension}`;
    const content = input.content || `# ${id}\n`;
    const artifactPath = store.writeArtifact(filename, content);

    state.artifacts[id] = {
      id,
      taskId: task.id,
      runId: run.id,
      type,
      path: artifactPath,
      createdAt,
    };

    task.artifactIds.push(id);
    task.updatedAt = createdAt;
    store.saveState(state);

    return state.artifacts[id];
  }

  function recordArtifactBundleInState(state, input) {
    const task = assertTask(input.taskId, state);
    const run = assertRun(input.runId, state);
    const createdAt = new Date().toISOString();
    const writtenArtifactPaths = [];
    const artifactsByKey = {};

    for (const artifactInput of input.artifacts || []) {
      const type = artifactInput.type || 'output';

      assertSupportedArtifactType(type);

      const id = nextId(state, 'artifact');
      const extension = artifactInput.extension || 'md';
      const filename = `${id}.${extension}`;
      const content = artifactInput.content || `# ${id}\n`;
      const artifactPath = store.writeArtifact(filename, content);

      writtenArtifactPaths.push(artifactPath);
      state.artifacts[id] = {
        id,
        taskId: task.id,
        runId: run.id,
        type,
        path: artifactPath,
        createdAt,
      };
      task.artifactIds.push(id);

      if (artifactInput.key) {
        artifactsByKey[artifactInput.key] = state.artifacts[id];
      }
    }

    task.updatedAt = createdAt;

    return {
      artifactsByKey,
      createdAt,
      writtenArtifactPaths,
    };
  }

  function finalizeBuilderLiveMutationSuccess(input) {
    const state = store.loadState();
    const run = assertRun(input.runId, state);
    const task = assertTask(run.taskId, state);
    const approval = assertApproval(input.approvalId, state);
    const now = new Date().toISOString();
    let writtenArtifactPaths = [];
    let artifactsByKey = {};
    let successLogMessages = [];

    if (approval.taskId !== task.id) {
      throw new Error(`Approval ${approval.id} is not linked to task ${task.id}`);
    }

    if (approval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION) {
      throw new Error(`Approval ${approval.id} is not a builder live mutation approval`);
    }

    if (approval.status !== APPROVAL_STATUS.APPROVED) {
      throw new Error(`Approval ${approval.id} must be approved before builder live mutation succeeds`);
    }

    if (isBuilderLiveMutationApprovalConsumed(approval)) {
      const metadata = getApprovalMetadata(approval);

      throw new Error(
        `Approval ${approval.id} is already consumed by builder live mutation run ${metadata.consumedByRunId}`,
      );
    }

    try {
      const bundle = recordArtifactBundleInState(state, {
        taskId: task.id,
        runId: run.id,
        artifacts: (input.artifacts || []).map((artifactInput) => ({
          ...artifactInput,
          key: artifactInput.key || artifactInput.type,
        })),
      });

      writtenArtifactPaths = bundle.writtenArtifactPaths;
      artifactsByKey = bundle.artifactsByKey;
      approval.metadata = {
        ...getApprovalMetadata(approval),
        consumedArtifactIds: Object.values(artifactsByKey).map((artifact) => artifact.id),
        consumedAt: now,
        consumedByRunId: run.id,
        consumedPreflightArtifactId: input.summary?.preflightArtifactId || approval.targetArtifactId,
        consumedPreflightRunId: input.summary?.preflightRunId || approval.targetRunId,
      };
      approval.updatedAt = now;

      run.status = RUN_STATUS.COMPLETED;
      run.finishedAt = now;
      run.summary = {
        ...(input.summary || {}),
        approvalConsumedAt: now,
        artifactIds: {
          changeSummary: artifactsByKey['change-summary']?.id || null,
          patch: artifactsByKey.patch?.id || null,
          diff: artifactsByKey.diff?.id || null,
        },
      };
      successLogMessages = [
        `saved builder live mutation bundle ${artifactsByKey['change-summary']?.id || '(missing-change-summary)'}, ${artifactsByKey.patch?.id || '(missing-patch)'}, ${artifactsByKey.diff?.id || '(missing-diff)'}`,
      ];

      if ((input.summary?.changedFiles || []).length > 0) {
        successLogMessages.unshift(
          `applied limited live mutation to ${input.summary.changedFiles.join(', ')}`,
        );
      }

      for (const message of successLogMessages) {
        store.appendLogRecord(run.id, {
          ts: now,
          level: 'info',
          message,
        });
      }

      task.updatedAt = now;
      store.saveState(state);
    } catch (error) {
      for (const artifactPath of writtenArtifactPaths) {
        fs.rmSync(artifactPath, { force: true });
      }

      throw error;
    }

    return {
      approval: state.approvals[approval.id],
      artifacts: {
        changeSummary: artifactsByKey['change-summary'],
        diff: artifactsByKey.diff,
        patch: artifactsByKey.patch,
      },
      run: state.runs[run.id],
    };
  }

  function getArtifact(artifactId) {
    const state = store.loadState();
    const artifact = state.artifacts[artifactId];

    if (!artifact) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }

    const contentPayload = getArtifactContentPayload(artifact);

    return {
      ...artifact,
      ...contentPayload,
    };
  }

  function finishRunWithReviewPending(input) {
    const state = store.loadState();
    const run = assertRun(input.runId, state);
    const task = assertTask(run.taskId, state);
    const now = new Date().toISOString();

    run.status = RUN_STATUS.COMPLETED;
    run.finishedAt = now;
    const result = ensurePendingReviewGateRecord(state, task, now);

    store.saveState(state);

    return {
      run,
      task,
      reviewItem: result.reviewItem,
    };
  }

  function getSnapshot() {
    const state = store.loadStateSupportedReadonly();
    normalizeProjectsInState(state);
    const snapshot = normalizeMissionsInState(state);
    const snapshotForPublicProjection = structuredClone(snapshot);
    delete snapshotForPublicProjection.specialistBatches;
    delete snapshotForPublicProjection.specialistCellAttempts;
    delete snapshotForPublicProjection.specialistCellRetries;
    delete snapshotForPublicProjection.reworkPlans;
    delete snapshotForPublicProjection.reworkPlanAcceptances;
    delete snapshotForPublicProjection.builderReworkDispatches;
    delete snapshotForPublicProjection.reworkDeliveryPackages;
    delete snapshotForPublicProjection.reworkDeliveryPackageAcceptances;
    delete snapshotForPublicProjection.opsAttemptDispositions;
    delete snapshotForPublicProjection.opsAttemptResumes;
    delete snapshotForPublicProjection.missionContextAttachments;
    for (const staffingEntry of Object.values(
      snapshotForPublicProjection.staffingEntries || {},
    )) {
      delete staffingEntry.missionContextAttachmentRef;
    }
    for (const councilSession of Object.values(
      snapshotForPublicProjection.councilSessions || {},
    )) {
      delete councilSession.strategistContextConsumption;
      for (const attempt of councilSession.attempts || []) {
        for (const position of attempt.positions || []) {
          delete position.contextRef;
        }
      }
    }
    let currentCompanyRuntime = null;

    if (companyBlueprintOptions) {
      try {
        const evidence = loadCompanyBlueprintEvidence(companyBlueprintOptions);
        const councilSynthesisDigests = Object.values(
          snapshot.councilSessions || {},
        )
          .flatMap((councilSession) => {
            const currentAttempt = (councilSession.attempts || []).find(
              (attempt) => attempt.id === councilSession.currentAttemptId,
            );
            if (!currentAttempt?.synthesis) return [];
            return [
              Object.freeze({
                councilSessionId: councilSession.id,
                currentAttemptId: currentAttempt.id,
                sha256: digestSpecialistCanonical(currentAttempt.synthesis),
              }),
            ];
          })
          .sort((left, right) =>
            left.councilSessionId.localeCompare(right.councilSessionId));
        currentCompanyRuntime = Object.freeze({
          status: 'ready',
          blueprint: evidence.blueprint,
          sourceRefs: evidence.sourceRefs,
          errors: [],
          blueprintDigest: evidence.blueprintDigest,
          roleSourceDigests: evidence.roleSourceDigests,
          councilSynthesisDigests: Object.freeze(councilSynthesisDigests),
        });
      } catch {
        currentCompanyRuntime = readCompanyBlueprintStatus(companyBlueprintOptions);
      }
    }

    return currentCompanyRuntime
      ? {
          ...snapshotForPublicProjection,
          companyRuntime: currentCompanyRuntime,
        }
      : snapshotForPublicProjection;
  }

  function resetRuntime() {
    store.reset();
  }

  return {
    appendLog,
    beginBuilderReworkPreflight,
    beginBuilderReworkSourceMutation,
    acceptDeliveryPackage,
    acceptReworkDeliveryPackage,
    acceptReworkPlan,
    acceptMissionStaffingPlan,
    approveCouncilRecommendation,
    assertTaskCanRunBuilderLiveMutation,
    assertTaskCanRunBuilderPreflight,
    assertTaskCanRunTaskBreaker,
    completeRun,
    closeOutMissionAndTask,
    completeReviewedDeliveryBuilder,
    completeReviewedDeliveryQa,
    completeReviewedDeliveryReviewer,
    cancelExecutionPlanCheckpoint,
    beginReviewedDeliveryContinuation,
    beginReviewedDeliveryQa,
    beginReviewedDeliveryReviewer,
    beginOperatorSteppedWorkOrderStep,
    beginSequentialWorkOrderExecution,
    createApprovalPlaceholder,
    createCouncilSessionForMission,
    decideProviderCouncilSession,
    decideRealCouncilSession,
    createDecisionInboxItem,
    createLinkedTaskForMission,
    createMission,
    applyProposalSourceMutation,
    createProposalApplicationAttempt,
    createProject,
    createProposalRecord,
    createTask,
    applyRetentionConsumer,
    ensureCommitActionAllowed,
    finalizeBuilderLiveMutationSuccess,
    finalizeBuilderReworkSourceMutation,
    completeReviewerReexecution,
    completeReworkQaExecution,
    failSequentialWorkOrderExecution,
    failBuilderReworkSourceMutation,
    failReviewerReexecution,
    failReworkQaExecution,
    failReviewedDeliveryContinuation,
    finalizeSequentialWorkOrderExecution,
    finishRunWithReviewPending,
    getArtifact,
    getApproval,
    getCouncilSession,
    getCouncilProviderReadiness,
    getDecisionInboxItem,
    getDeliveryPackageAcceptance,
    getExecutionPlan,
    getWorkOrderAttempt,
    getExactResearchReadiness,
    getExecutionPlanDeliveryPackage,
    getExecutionPlanRecovery,
    getLogs,
    getMission,
    getMissionContextAttachment,
    getMissionEvidenceGraph,
    getTaskExecutionProvenance,
    getOpsSupervisionPreview,
    getOpsAttemptDisposition,
    getOpsAttemptResume,
    getReviewerReworkPlanPreview,
    getReviewerReexecution,
    getReviewerReexecutionWorkerInput,
    getReworkQaExecution,
    getReworkDeliveryPackage,
    getReworkDeliveryPackageAcceptance,
    getReworkPlanDeliveryPackage,
    getReworkQaExecutionWorkerInput,
    getReworkPlan,
    getReworkPlanAcceptance,
    getBuilderReworkDispatch,
    getBuilderReworkDispatchById,
    getBuilderReworkMutationApproval,
    getBuilderReworkSourceMutation,
    getExecutionPlanReworkPlan,
    getMissionCloseOut,
    getMissionLearningCandidate,
    getLearningCandidateReview,
    getLearningCandidateMemoryItem,
    getMemoryItemRecall,
    getProposalApplicationAttempt,
    getProposalSourceMutation,
    getProposalRecord,
    getProject,
    getRun,
    getSnapshot,
    quarantineOpsAttempt,
    resumeOpsAttemptFromSafeCheckpoint,
    getSpecialistBatch,
    getSpecialistBatchCellRetry,
    getSpecialistCellRetry,
    getCurrentCouncilSpecialistBatch,
    getStaffingEntry,
    getStaffingPlan,
    getTask,
    getTaskGuardSummary,
    previewRetentionConsumer,
    fetchExactResearchEvidence,
    preflightMissionWorkOrderPreview,
    previewMissionLearningCandidate,
    previewMissionStaffingPlan,
    previewLearningCandidateMemory,
    previewMemoryItemRecall,
    previewMissionMemoryContext,
    attachReviewedMissionContext,
    previewCouncilSpecialistBatch,
    previewWorkOrderVerificationPlan,
    persistReviewerReworkPlan,
    persistReworkDeliveryPackage,
    persistWorkOrderAcceptanceCriteria,
    recordWorkOrderVerificationProof,
    reportContextBudget,
    runWorkOrderVerificationProof,
    getWorkOrderVerificationStatus,
    previewMissionWorkOrders,
    previewExecutionPlanDelivery,
    previewReworkDeliveryPackage,
    previewExecutionPlanContinuation,
    prepareBuilderReworkSourceMutation,
    beginReviewerReexecution,
    beginReworkQaExecution,
    persistExecutionPlanDeliveryPackage,
    persistMissionLearningCandidate,
    persistLearningCandidateMemoryItem,
    persistMemoryItemRecall,
    reviewLearningCandidate,
    enterStaffingPlanCouncil,
    enterStaffingPlanCouncilWithStrategistContext,
    persistMissionWorkOrderPlan,
    listApprovals,
    listCouncilProviderReadinessSummaries,
    listDecisionInboxItems,
    listProposalApplicationAttempts,
    listProposalSourceMutations,
    listProposalRecords,
    listTaskGuardSummaries,
    openReviewGate,
    quarantineProposalApplicationAttempt,
    quarantineProposalSourceMutation,
    rollbackProposalSourceMutation,
    quarantineProposalRecord,
    recordBuilderReworkPreflightArtifact,
    recordArtifact,
    requestBuilderLiveMutationApproval,
    requestBuilderReworkMutationApproval,
    resolveReview,
    resolveDecisionInboxItem,
    resetRuntime,
    setProjectProviderConfig,
    settleBuilderReworkPreflight,
    setTaskWorktreeRef,
    selectMission,
    selectProject,
    startBuilderReworkPreflightRun,
    startRealCouncilForMission,
    startProviderCouncilForMission,
    startRun,
    completeBuilderReworkPreflightRun,
    startPlaceholderRun,
    startCouncilSpecialistBatch,
    retrySpecialistBatchCell,
    resumeRealCouncilSession,
    resumeProviderCouncilSession,
    resumeExecutionPlanFromCheckpoint,
    syncMissionExecutionStateFromTask,
    transitionTaskLifecycle,
  };
}

module.exports = {
  createRuntimeService,
};
