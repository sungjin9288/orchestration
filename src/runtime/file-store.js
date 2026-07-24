'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const STATE_REVISION = Symbol('orchestration.stateRevision');

class StateConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StateConflictError';
    this.statusCode = 409;
  }
}

class StateLockTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StateLockTimeoutError';
    this.statusCode = 409;
  }
}

const {
  ACCEPTANCE_CRITERION_STATE_SCHEMA_VERSION,
  APPROVAL_STATUS,
  ARTIFACT_TYPE,
  DECISION_INBOX_STATUS,
  DELIVERY_PACKAGE_ACCEPTANCE_DECISION,
  DELIVERY_PACKAGE_ACCEPTANCE_STATE_SCHEMA_VERSION,
  DELIVERY_PACKAGE_STATUS,
  DELIVERY_PACKAGE_STATE_SCHEMA_VERSION,
  EXECUTION_PLAN_STATUS,
  LEGACY_STATE_SCHEMA_VERSION,
  LEARNING_CANDIDATE_REVIEW_STATE_SCHEMA_VERSION,
  LEARNING_CANDIDATE_STATE_SCHEMA_VERSION,
  MEMORY_ITEM_STATE_SCHEMA_VERSION,
  MEMORY_RECALL_STATE_SCHEMA_VERSION,
  MIGRATABLE_STATE_SCHEMA_VERSION,
  MISSION_CLOSE_OUT_DECISION,
  MISSION_CLOSE_OUT_STATE_SCHEMA_VERSION,
  RETENTION_CONSUMER_STATUS,
  REVIEW_STATUS,
  STAFFING_PLAN_STATE_SCHEMA_VERSION,
  STATE_SCHEMA_VERSION,
  WORK_ORDER_STATUS,
  WORKFLOW_CHECKPOINT_ACTION,
  WORKFLOW_CHECKPOINT_STAGE,
  WORKFLOW_CHECKPOINT_STATUS,
  WORKFLOW_CHECKPOINT_STATE_SCHEMA_VERSION,
  WORKFLOW_TYPE,
  createEmptyState,
} = require('./contracts');
const {
  ACCEPTANCE_CRITERION_STATUS,
  BLOCKED_ACTIONS: ACCEPTANCE_CRITERION_BLOCKED_ACTIONS,
  PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT,
  PERSISTENCE_APPROVAL_DECISION,
  computeAcceptanceCriterionRecordDigest,
} = require('./acceptance-criteria');
const {
  ACCEPTANCE_AUTHORITY_SUMMARY,
  computeDeliveryPackageAcceptanceDigest,
} = require('./delivery-package-acceptances');
const { computeDeliveryPackageDigest } = require('./delivery-packages');
const {
  MISSION_CLOSE_OUT_AUTHORITY_SUMMARY,
  MISSION_STATUS_TRANSITION,
  TASK_LIFECYCLE_TRANSITION,
  computeMissionCloseOutDigest,
} = require('./mission-close-outs');
const { CLOSED_AUTHORITY } = require('./learning-candidate-preview');
const {
  LEARNING_CANDIDATE_STATUS,
  computeLearningCandidateRecordDigest,
} = require('./learning-candidates');
const {
  LEARNING_CANDIDATE_REVIEW_AUTHORITY,
  LEARNING_CANDIDATE_REVIEW_DECISION,
  assertLearningCandidateReviewRecordContent,
  computeLearningCandidateReviewDigest,
} = require('./learning-candidate-reviews');
const {
  MEMORY_ITEM_BLOCKED_ACTIONS,
  MEMORY_ITEM_NON_PERSISTENCE_STATEMENT,
  MEMORY_ITEM_STATUS,
  STORAGE_APPROVAL_ACKNOWLEDGEMENT,
  STORAGE_APPROVAL_DECISION,
  computeMemoryItemRecordDigest,
} = require('./memory-items');
const {
  MEMORY_RECALL_BLOCKED_ACTIONS,
  MEMORY_RECALL_NON_APPLICATION_STATEMENT,
  MEMORY_RECALL_STATUS,
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  computeMemoryRecallRecordDigest,
} = require('./memory-recalls');
const {
  STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT,
  STAFFING_PLAN_ACCEPTANCE_DECISION,
  STAFFING_PLAN_BLOCKED_ACTIONS,
  STAFFING_PLAN_STATUS,
  computeStaffingPlanRecordDigest,
} = require('./staffing-plans');
const { createWorkflowCheckpoint } = require('./workflow-checkpoints');
const {
  BLOCKED_ACTIONS: VERIFICATION_PROOF_BLOCKED_ACTIONS,
  PROOF_APPROVAL_ACKNOWLEDGEMENT,
  PROOF_APPROVAL_DECISION,
  VERIFICATION_PROOF_STATUS,
  computeVerificationProofRecordDigest,
} = require('./verification-proofs');

function assertStringField(record, field, label) {
  if (typeof record[field] !== 'string' || !record[field]) {
    throw new Error(`${label} is missing ${field}`);
  }
}

function validateWorkflowCheckpointRecords(state) {
  const stages = new Set(Object.values(WORKFLOW_CHECKPOINT_STAGE));
  const statuses = new Set(Object.values(WORKFLOW_CHECKPOINT_STATUS));
  const actions = new Set(Object.values(WORKFLOW_CHECKPOINT_ACTION));
  const digestPattern = /^[a-f0-9]{64}$/;

  for (const [key, checkpoint] of Object.entries(state.workflowCheckpoints)) {
    const label = `WorkflowCheckpoint ${key}`;
    if (
      !checkpoint ||
      typeof checkpoint !== 'object' ||
      Array.isArray(checkpoint) ||
      checkpoint.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    for (const field of [
      'projectId',
      'missionId',
      'executionPlanId',
      'workflowType',
      'stage',
      'status',
      'sourceDigest',
      'inputDigest',
      'authorityDigest',
      'checkpointDigest',
      'createdAt',
      'updatedAt',
    ]) {
      assertStringField(checkpoint, field, label);
    }
    for (const field of [
      'completedUnitRefs',
      'pendingUnitRefs',
      'failedUnitRefs',
      'runRefs',
      'artifactRefs',
      'approvalRefs',
      'nextAllowedActions',
    ]) {
      assertStringArrayField(checkpoint, field, label);
    }
    if (!Number.isInteger(checkpoint.attempt) || checkpoint.attempt < 1) {
      throw new Error(`${label} has invalid attempt`);
    }
    if (checkpoint.workflowType !== WORKFLOW_TYPE.REVIEWED_DELIVERY) {
      throw new Error(`${label} has invalid workflowType`);
    }
    if (!stages.has(checkpoint.stage) || !statuses.has(checkpoint.status)) {
      throw new Error(`${label} has invalid stage or status`);
    }
    if (checkpoint.nextAllowedActions.some((action) => !actions.has(action))) {
      throw new Error(`${label} has invalid nextAllowedActions`);
    }
    const expectedActions =
      checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY
        ? [WORKFLOW_CHECKPOINT_ACTION.RESUME_REVIEWER]
        : checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.QA_READY
          ? [WORKFLOW_CHECKPOINT_ACTION.RESUME_QA]
          : [];
    if (
      checkpoint.nextAllowedActions.length !== expectedActions.length ||
      checkpoint.nextAllowedActions.some((action, index) => action !== expectedActions[index])
    ) {
      throw new Error(`${label} has actions that do not match its stage`);
    }
    if (
      (checkpoint.stage === WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY) !==
      (checkpoint.status === WORKFLOW_CHECKPOINT_STATUS.TERMINAL)
    ) {
      throw new Error(`${label} has an invalid terminal disposition`);
    }
    for (const field of ['sourceDigest', 'inputDigest', 'authorityDigest', 'checkpointDigest']) {
      if (!digestPattern.test(checkpoint[field])) throw new Error(`${label} has invalid ${field}`);
    }
    const plan = state.executionPlans[checkpoint.executionPlanId];
    if (
      !plan ||
      checkpoint.projectId !== plan.projectId ||
      checkpoint.missionId !== plan.missionId ||
      !plan.checkpointRefs.includes(checkpoint.id)
    ) {
      throw new Error(`${label} has invalid ExecutionPlan references`);
    }
    const unitRefs = [
      ...checkpoint.completedUnitRefs,
      ...checkpoint.pendingUnitRefs,
      ...checkpoint.failedUnitRefs,
    ];
    if (unitRefs.some((id) => !plan.workOrderIds.includes(id))) {
      throw new Error(`${label} has invalid WorkOrder references`);
    }
    if (
      checkpoint.runRefs.some((id) => !state.runs[id]) ||
      checkpoint.artifactRefs.some((id) => !state.artifacts[id]) ||
      checkpoint.approvalRefs.some((id) => !state.approvals[id])
    ) {
      throw new Error(`${label} has missing evidence references`);
    }
    if (
      checkpoint.resumedFromCheckpointId !== null &&
      (typeof checkpoint.resumedFromCheckpointId !== 'string' ||
        !state.workflowCheckpoints[checkpoint.resumedFromCheckpointId] ||
        state.workflowCheckpoints[checkpoint.resumedFromCheckpointId].executionPlanId !== plan.id)
    ) {
      throw new Error(`${label} has invalid resumedFromCheckpointId`);
    }
    if (checkpoint.stopReason !== null && typeof checkpoint.stopReason !== 'string') {
      throw new Error(`${label} has invalid stopReason`);
    }
  }
}

function assertStringArrayField(record, field, label) {
  if (
    !Array.isArray(record[field]) ||
    record[field].some((value) => typeof value !== 'string')
  ) {
    throw new Error(`${label} has invalid ${field}`);
  }
}

function sameStringArrays(left, right) {
  return (
    left.length === right.length && left.every((value, index) => value === right[index])
  );
}

function assertExactObjectKeys(record, expectedKeys, label) {
  const actualKeys = Object.keys(record).sort();
  const normalizedExpected = [...expectedKeys].sort();
  if (!sameStringArrays(actualKeys, normalizedExpected)) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function validateDeliveryPackageRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const requiredAuthority = {
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
  };

  for (const [key, deliveryPackage] of Object.entries(state.deliveryPackages)) {
    const label = `DeliveryPackage ${key}`;
    if (
      !deliveryPackage ||
      typeof deliveryPackage !== 'object' ||
      Array.isArray(deliveryPackage) ||
      deliveryPackage.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      deliveryPackage,
      [
        'id',
        'projectId',
        'missionId',
        'executionPlanId',
        'terminalCheckpointId',
        'terminalCheckpointDigest',
        'previewId',
        'sourceDigest',
        'packageDigest',
        'status',
        'deliveredArtifactRefs',
        'workOrderResults',
        'reviewerEvidenceRef',
        'qaEvidenceRefs',
        'verificationSummary',
        'acceptedRisks',
        'unresolvedItems',
        'authoritySummary',
        'createdAt',
        'updatedAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'missionId',
      'executionPlanId',
      'terminalCheckpointId',
      'terminalCheckpointDigest',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'status',
      'reviewerEvidenceRef',
      'createdAt',
      'updatedAt',
    ]) {
      assertStringField(deliveryPackage, field, label);
    }
    for (const field of [
      'deliveredArtifactRefs',
      'qaEvidenceRefs',
      'acceptedRisks',
      'unresolvedItems',
    ]) {
      assertStringArrayField(deliveryPackage, field, label);
    }
    if (deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED) {
      throw new Error(`${label} has invalid status`);
    }
    if (deliveryPackage.updatedAt !== deliveryPackage.createdAt) {
      throw new Error(`${label} must remain immutable while review-required`);
    }
    for (const field of ['terminalCheckpointDigest', 'sourceDigest', 'packageDigest']) {
      if (!digestPattern.test(deliveryPackage[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }

    const plan = state.executionPlans[deliveryPackage.executionPlanId];
    const checkpoint = state.workflowCheckpoints[deliveryPackage.terminalCheckpointId];
    if (
      !plan ||
      plan.projectId !== deliveryPackage.projectId ||
      plan.missionId !== deliveryPackage.missionId ||
      plan.sourceDigest !== deliveryPackage.sourceDigest ||
      !plan.deliveryPackageRefs.includes(deliveryPackage.id) ||
      plan.latestDeliveryPackageId !== deliveryPackage.id
    ) {
      throw new Error(`${label} has invalid ExecutionPlan references`);
    }
    if (
      plan.status !== EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      !checkpoint ||
      checkpoint.executionPlanId !== plan.id ||
      plan.latestCheckpointId !== checkpoint.id ||
      checkpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY ||
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL ||
      checkpoint.checkpointDigest !== deliveryPackage.terminalCheckpointDigest
    ) {
      throw new Error(`${label} has invalid terminal WorkflowCheckpoint binding`);
    }
    if (
      deliveryPackage.deliveredArtifactRefs.some((id) => !state.artifacts[id]) ||
      state.artifacts[deliveryPackage.reviewerEvidenceRef]?.type !== ARTIFACT_TYPE.REVIEW ||
      deliveryPackage.qaEvidenceRefs.length === 0 ||
      deliveryPackage.qaEvidenceRefs.some(
        (id) => state.artifacts[id]?.type !== ARTIFACT_TYPE.QA_EVIDENCE,
      )
    ) {
      throw new Error(`${label} has invalid evidence references`);
    }
    const workOrders = plan.workOrderIds.map((id) => state.workOrders[id]);
    const expectedDeliveredArtifactRefs = [
      ...new Set(workOrders.flatMap((workOrder) => workOrder.artifactRefs)),
    ];
    if (!sameStringArrays(deliveryPackage.deliveredArtifactRefs, expectedDeliveredArtifactRefs)) {
      throw new Error(`${label} deliveredArtifactRefs do not match its WorkOrders`);
    }
    if (
      !Array.isArray(deliveryPackage.workOrderResults) ||
      deliveryPackage.workOrderResults.length !== plan.workOrderIds.length
    ) {
      throw new Error(`${label} has invalid workOrderResults`);
    }
    deliveryPackage.workOrderResults.forEach((result, index) => {
      const workOrder = workOrders[index];
      assertExactObjectKeys(
        result,
        ['workOrderId', 'role', 'status', 'runRefs', 'artifactRefs'],
        `${label} WorkOrder result ${index + 1}`,
      );
      if (
        !workOrder ||
        result.workOrderId !== workOrder.id ||
        result.role !== workOrder.role ||
        result.status !== WORK_ORDER_STATUS.COMPLETED ||
        !Array.isArray(result.runRefs) ||
        !Array.isArray(result.artifactRefs) ||
        !sameStringArrays(result.runRefs, workOrder.runRefs) ||
        !sameStringArrays(result.artifactRefs, workOrder.artifactRefs)
      ) {
        throw new Error(`${label} has a WorkOrder result mismatch`);
      }
    });
    const resultByRole = Object.fromEntries(
      deliveryPackage.workOrderResults.map((result) => [result.role, result]),
    );
    if (
      !resultByRole.reviewer?.artifactRefs.includes(deliveryPackage.reviewerEvidenceRef) ||
      deliveryPackage.qaEvidenceRefs.some(
        (artifactId) => !resultByRole.qa?.artifactRefs.includes(artifactId),
      )
    ) {
      throw new Error(`${label} reviewer or QA evidence is not bound to its WorkOrder`);
    }
    const summary = deliveryPackage.verificationSummary;
    if (summary && typeof summary === 'object' && !Array.isArray(summary)) {
      assertExactObjectKeys(
        summary,
        ['kind', 'verdict', 'checkCount', 'passedCheckCount'],
        `${label} verificationSummary`,
      );
    }
    if (
      !summary ||
      summary.kind !== 'node-syntax-check' ||
      summary.verdict !== 'passed' ||
      !Number.isInteger(summary.checkCount) ||
      summary.checkCount < 1 ||
      summary.passedCheckCount !== summary.checkCount
    ) {
      throw new Error(`${label} has invalid verificationSummary`);
    }
    if (
      !deliveryPackage.authoritySummary ||
      typeof deliveryPackage.authoritySummary !== 'object' ||
      Array.isArray(deliveryPackage.authoritySummary) ||
      Object.keys(deliveryPackage.authoritySummary).length !== Object.keys(requiredAuthority).length ||
      Object.keys(requiredAuthority).some(
        (field) => deliveryPackage.authoritySummary[field] !== requiredAuthority[field],
      )
    ) {
      throw new Error(`${label} has invalid authoritySummary`);
    }
    if (computeDeliveryPackageDigest(deliveryPackage) !== deliveryPackage.packageDigest) {
      throw new Error(`${label} packageDigest does not match its immutable payload`);
    }
  }
}

function validateDeliveryPackageAcceptanceRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const acceptedPackageIds = new Set();

  for (const [key, acceptance] of Object.entries(state.deliveryPackageAcceptances)) {
    const label = `DeliveryPackageAcceptance ${key}`;
    if (
      !acceptance ||
      typeof acceptance !== 'object' ||
      Array.isArray(acceptance) ||
      acceptance.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      acceptance,
      [
        'id',
        'projectId',
        'missionId',
        'executionPlanId',
        'deliveryPackageId',
        'previewId',
        'sourceDigest',
        'packageDigest',
        'terminalCheckpointId',
        'terminalCheckpointDigest',
        'decision',
        'authoritySummary',
        'acceptanceDigest',
        'createdAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'missionId',
      'executionPlanId',
      'deliveryPackageId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'terminalCheckpointId',
      'terminalCheckpointDigest',
      'decision',
      'acceptanceDigest',
      'createdAt',
    ]) {
      assertStringField(acceptance, field, label);
    }
    if (acceptance.decision !== DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED) {
      throw new Error(`${label} has invalid decision`);
    }
    for (const field of [
      'sourceDigest',
      'packageDigest',
      'terminalCheckpointDigest',
      'acceptanceDigest',
    ]) {
      if (!digestPattern.test(acceptance[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      Number.isNaN(Date.parse(acceptance.createdAt)) ||
      new Date(acceptance.createdAt).toISOString() !== acceptance.createdAt
    ) {
      throw new Error(`${label} has invalid createdAt`);
    }
    if (
      !acceptance.authoritySummary ||
      typeof acceptance.authoritySummary !== 'object' ||
      Array.isArray(acceptance.authoritySummary) ||
      Object.keys(acceptance.authoritySummary).length !==
        Object.keys(ACCEPTANCE_AUTHORITY_SUMMARY).length ||
      Object.keys(ACCEPTANCE_AUTHORITY_SUMMARY).some(
        (field) => acceptance.authoritySummary[field] !== ACCEPTANCE_AUTHORITY_SUMMARY[field],
      )
    ) {
      throw new Error(`${label} has invalid authoritySummary`);
    }

    const deliveryPackage = state.deliveryPackages[acceptance.deliveryPackageId];
    if (
      !deliveryPackage ||
      deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED ||
      deliveryPackage.projectId !== acceptance.projectId ||
      deliveryPackage.missionId !== acceptance.missionId ||
      deliveryPackage.executionPlanId !== acceptance.executionPlanId ||
      deliveryPackage.previewId !== acceptance.previewId ||
      deliveryPackage.sourceDigest !== acceptance.sourceDigest ||
      deliveryPackage.packageDigest !== acceptance.packageDigest ||
      deliveryPackage.terminalCheckpointId !== acceptance.terminalCheckpointId ||
      deliveryPackage.terminalCheckpointDigest !== acceptance.terminalCheckpointDigest ||
      deliveryPackage.unresolvedItems.length !== 0
    ) {
      throw new Error(`${label} has invalid DeliveryPackage binding`);
    }
    if (acceptedPackageIds.has(acceptance.deliveryPackageId)) {
      throw new Error(`${label} duplicates DeliveryPackage acceptance`);
    }
    acceptedPackageIds.add(acceptance.deliveryPackageId);
    if (computeDeliveryPackageAcceptanceDigest(acceptance) !== acceptance.acceptanceDigest) {
      throw new Error(`${label} acceptanceDigest does not match its immutable payload`);
    }
  }
}

function validateMissionCloseOutRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const closedMissionIds = new Set();
  const closedTaskIds = new Set();
  const closedPackageIds = new Set();
  const closedAcceptanceIds = new Set();

  for (const [key, closeOut] of Object.entries(state.missionCloseOuts)) {
    const label = `MissionCloseOut ${key}`;
    if (!closeOut || typeof closeOut !== 'object' || Array.isArray(closeOut) || closeOut.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      closeOut,
      [
        'id',
        'projectId',
        'missionId',
        'linkedTaskId',
        'executionPlanId',
        'deliveryPackageId',
        'deliveryPackageAcceptanceId',
        'previewId',
        'sourceDigest',
        'packageDigest',
        'acceptanceDigest',
        'terminalCheckpointId',
        'terminalCheckpointDigest',
        'decision',
        'taskLifecycleTransition',
        'missionStatusTransition',
        'authoritySummary',
        'closeOutDigest',
        'createdAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'missionId',
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'terminalCheckpointId',
      'terminalCheckpointDigest',
      'decision',
      'taskLifecycleTransition',
      'missionStatusTransition',
      'closeOutDigest',
      'createdAt',
    ]) {
      assertStringField(closeOut, field, label);
    }
    for (const field of [
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'terminalCheckpointDigest',
      'closeOutDigest',
    ]) {
      if (!digestPattern.test(closeOut[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      Number.isNaN(Date.parse(closeOut.createdAt)) ||
      new Date(closeOut.createdAt).toISOString() !== closeOut.createdAt
    ) {
      throw new Error(`${label} has invalid createdAt`);
    }
    if (
      closeOut.decision !== MISSION_CLOSE_OUT_DECISION.CLOSED_OUT ||
      closeOut.taskLifecycleTransition !== TASK_LIFECYCLE_TRANSITION ||
      closeOut.missionStatusTransition !== MISSION_STATUS_TRANSITION
    ) {
      throw new Error(`${label} has invalid terminal transition`);
    }
    if (
      !closeOut.authoritySummary ||
      typeof closeOut.authoritySummary !== 'object' ||
      Array.isArray(closeOut.authoritySummary) ||
      Object.keys(closeOut.authoritySummary).length !==
        Object.keys(MISSION_CLOSE_OUT_AUTHORITY_SUMMARY).length ||
      Object.keys(MISSION_CLOSE_OUT_AUTHORITY_SUMMARY).some(
        (field) =>
          closeOut.authoritySummary[field] !== MISSION_CLOSE_OUT_AUTHORITY_SUMMARY[field],
      )
    ) {
      throw new Error(`${label} has invalid authoritySummary`);
    }

    const mission = state.missions[closeOut.missionId];
    const task = state.tasks[closeOut.linkedTaskId];
    const plan = state.executionPlans[closeOut.executionPlanId];
    const deliveryPackage = state.deliveryPackages[closeOut.deliveryPackageId];
    const acceptance = state.deliveryPackageAcceptances[closeOut.deliveryPackageAcceptanceId];
    const checkpoint = state.workflowCheckpoints[closeOut.terminalCheckpointId];
    if (
      !mission ||
      mission.projectId !== closeOut.projectId ||
      mission.linkedTaskId !== closeOut.linkedTaskId ||
      mission.status !== 'completed' ||
      mission.updatedAt !== closeOut.createdAt
    ) {
      throw new Error(`${label} has invalid Mission terminal binding`);
    }
    if (
      !task ||
      task.projectId !== closeOut.projectId ||
      task.missionId !== closeOut.missionId ||
      task.lifecycleState !== 'Done' ||
      task.review?.required !== true ||
      task.review?.status !== REVIEW_STATUS.PASSED ||
      task.flags?.blocked ||
      task.flags?.waitingApproval ||
      task.flags?.waitingDecision ||
      task.updatedAt !== closeOut.createdAt
    ) {
      throw new Error(`${label} has invalid linked task terminal binding`);
    }
    if (
      Object.values(state.approvals).some(
        (approval) =>
          approval.taskId === task.id && approval.status === APPROVAL_STATUS.PENDING,
      ) ||
      Object.values(state.decisionInboxItems).some(
        (item) => item.taskId === task.id && item.status === DECISION_INBOX_STATUS.PENDING,
      )
    ) {
      throw new Error(`${label} has active linked task gates`);
    }
    if (
      !plan ||
      plan.projectId !== closeOut.projectId ||
      plan.missionId !== closeOut.missionId ||
      plan.controlTaskId !== closeOut.linkedTaskId ||
      plan.status !== EXECUTION_PLAN_STATUS.DELIVERY_READY ||
      plan.activeWorkOrderId !== null ||
      plan.sourceDigest !== closeOut.sourceDigest ||
      plan.latestDeliveryPackageId !== closeOut.deliveryPackageId ||
      plan.latestCheckpointId !== closeOut.terminalCheckpointId ||
      plan.workOrderIds.length !== 3 ||
      plan.workOrderIds.some((id) => state.workOrders[id]?.status !== WORK_ORDER_STATUS.COMPLETED)
    ) {
      throw new Error(`${label} has invalid ExecutionPlan terminal binding`);
    }
    if (
      !deliveryPackage ||
      deliveryPackage.projectId !== closeOut.projectId ||
      deliveryPackage.missionId !== closeOut.missionId ||
      deliveryPackage.executionPlanId !== closeOut.executionPlanId ||
      deliveryPackage.previewId !== closeOut.previewId ||
      deliveryPackage.sourceDigest !== closeOut.sourceDigest ||
      deliveryPackage.packageDigest !== closeOut.packageDigest ||
      deliveryPackage.terminalCheckpointId !== closeOut.terminalCheckpointId ||
      deliveryPackage.terminalCheckpointDigest !== closeOut.terminalCheckpointDigest ||
      deliveryPackage.status !== DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED ||
      deliveryPackage.unresolvedItems.length !== 0
    ) {
      throw new Error(`${label} has invalid DeliveryPackage binding`);
    }
    if (
      !acceptance ||
      acceptance.deliveryPackageId !== deliveryPackage.id ||
      acceptance.projectId !== closeOut.projectId ||
      acceptance.missionId !== closeOut.missionId ||
      acceptance.executionPlanId !== closeOut.executionPlanId ||
      acceptance.previewId !== closeOut.previewId ||
      acceptance.sourceDigest !== closeOut.sourceDigest ||
      acceptance.packageDigest !== closeOut.packageDigest ||
      acceptance.terminalCheckpointId !== closeOut.terminalCheckpointId ||
      acceptance.terminalCheckpointDigest !== closeOut.terminalCheckpointDigest ||
      acceptance.acceptanceDigest !== closeOut.acceptanceDigest ||
      acceptance.decision !== DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED
    ) {
      throw new Error(`${label} has invalid DeliveryPackageAcceptance binding`);
    }
    if (
      !checkpoint ||
      checkpoint.executionPlanId !== plan.id ||
      checkpoint.stage !== WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY ||
      checkpoint.status !== WORKFLOW_CHECKPOINT_STATUS.TERMINAL ||
      checkpoint.checkpointDigest !== closeOut.terminalCheckpointDigest
    ) {
      throw new Error(`${label} has invalid WorkflowCheckpoint binding`);
    }
    if (
      closedMissionIds.has(closeOut.missionId) ||
      closedTaskIds.has(closeOut.linkedTaskId) ||
      closedPackageIds.has(closeOut.deliveryPackageId) ||
      closedAcceptanceIds.has(closeOut.deliveryPackageAcceptanceId)
    ) {
      throw new Error(`${label} duplicates Mission close-out evidence`);
    }
    closedMissionIds.add(closeOut.missionId);
    closedTaskIds.add(closeOut.linkedTaskId);
    closedPackageIds.add(closeOut.deliveryPackageId);
    closedAcceptanceIds.add(closeOut.deliveryPackageAcceptanceId);
    if (computeMissionCloseOutDigest(closeOut) !== closeOut.closeOutDigest) {
      throw new Error(`${label} closeOutDigest does not match its immutable payload`);
    }
  }
}

function validateLearningCandidateRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const sourceMissionIds = new Set();

  for (const [key, candidate] of Object.entries(state.learningCandidates)) {
    const label = `LearningCandidate ${key}`;
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      Array.isArray(candidate) ||
      candidate.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      candidate,
      [
        'id',
        'projectId',
        'sourceMissionId',
        'sourceMissionCloseOutId',
        'sourceExecutionPlanId',
        'sourceDeliveryPackageId',
        'sourceDeliveryPackageAcceptanceId',
        'sourceTerminalCheckpointId',
        'sourceDeliveryPreviewId',
        'sourceDigest',
        'sourcePackageDigest',
        'sourcePackageAcceptanceDigest',
        'sourceTerminalCheckpointDigest',
        'sourceMissionCloseOutDigest',
        'sourceEvidenceRefs',
        'lesson',
        'applicability',
        'negativeEvidence',
        'redactionMode',
        'redactionStatus',
        'expiry',
        'reviewerStatus',
        'promotionStatus',
        'authoritySummary',
        'previewId',
        'candidateDigest',
        'persisted',
        'createdAt',
        'recordDigest',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'sourceMissionId',
      'sourceMissionCloseOutId',
      'sourceExecutionPlanId',
      'sourceDeliveryPackageId',
      'sourceDeliveryPackageAcceptanceId',
      'sourceTerminalCheckpointId',
      'sourceDeliveryPreviewId',
      'sourceDigest',
      'sourcePackageDigest',
      'sourcePackageAcceptanceDigest',
      'sourceTerminalCheckpointDigest',
      'sourceMissionCloseOutDigest',
      'lesson',
      'redactionMode',
      'redactionStatus',
      'reviewerStatus',
      'promotionStatus',
      'previewId',
      'candidateDigest',
      'createdAt',
      'recordDigest',
    ]) {
      assertStringField(candidate, field, label);
    }
    assertStringArrayField(candidate, 'sourceEvidenceRefs', label);
    if (
      candidate.persisted !== true ||
      candidate.redactionMode !== 'source-summary-only' ||
      candidate.redactionStatus !== LEARNING_CANDIDATE_STATUS.REDACTION ||
      candidate.reviewerStatus !== LEARNING_CANDIDATE_STATUS.REVIEWER ||
      candidate.promotionStatus !== LEARNING_CANDIDATE_STATUS.PROMOTION
    ) {
      throw new Error(`${label} has invalid immutable status`);
    }
    for (const field of [
      'sourceDigest',
      'sourcePackageDigest',
      'sourcePackageAcceptanceDigest',
      'sourceTerminalCheckpointDigest',
      'sourceMissionCloseOutDigest',
      'candidateDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(candidate[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      Number.isNaN(Date.parse(candidate.createdAt)) ||
      new Date(candidate.createdAt).toISOString() !== candidate.createdAt
    ) {
      throw new Error(`${label} has invalid createdAt`);
    }
    if (
      !candidate.expiry ||
      typeof candidate.expiry !== 'object' ||
      Array.isArray(candidate.expiry)
    ) {
      throw new Error(`${label} has invalid expiry`);
    }
    assertExactObjectKeys(candidate.expiry, ['expiresAt', 'status'], `${label} expiry`);
    if (
      typeof candidate.expiry.expiresAt !== 'string' ||
      Number.isNaN(Date.parse(candidate.expiry.expiresAt)) ||
      new Date(candidate.expiry.expiresAt).toISOString() !== candidate.expiry.expiresAt ||
      candidate.expiry.status !== 'review-required' ||
      Date.parse(candidate.expiry.expiresAt) <= Date.parse(candidate.createdAt)
    ) {
      throw new Error(`${label} has invalid expiry`);
    }
    if (
      !candidate.applicability ||
      typeof candidate.applicability !== 'object' ||
      Array.isArray(candidate.applicability)
    ) {
      throw new Error(`${label} has invalid applicability`);
    }
    assertExactObjectKeys(
      candidate.applicability,
      ['summary', 'projectId', 'targetPathAllowlist', 'verificationCommands'],
      `${label} applicability`,
    );
    assertStringField(candidate.applicability, 'summary', `${label} applicability`);
    assertStringField(candidate.applicability, 'projectId', `${label} applicability`);
    assertStringArrayField(
      candidate.applicability,
      'targetPathAllowlist',
      `${label} applicability`,
    );
    assertStringArrayField(
      candidate.applicability,
      'verificationCommands',
      `${label} applicability`,
    );
    if (
      candidate.applicability.projectId !== candidate.projectId ||
      !Array.isArray(candidate.negativeEvidence) ||
      candidate.negativeEvidence.length === 0 ||
      candidate.negativeEvidence.some(
        (entry) =>
          !entry ||
          typeof entry !== 'object' ||
          Array.isArray(entry) ||
          Object.keys(entry).sort().join(',') !== 'sourceEvidenceRef,statement' ||
          typeof entry.sourceEvidenceRef !== 'string' ||
          !entry.sourceEvidenceRef ||
          typeof entry.statement !== 'string' ||
          !entry.statement ||
          !candidate.sourceEvidenceRefs.includes(entry.sourceEvidenceRef),
      )
    ) {
      throw new Error(`${label} has invalid applicability or negative evidence`);
    }
    if (
      !candidate.authoritySummary ||
      typeof candidate.authoritySummary !== 'object' ||
      Array.isArray(candidate.authoritySummary) ||
      Object.keys(candidate.authoritySummary).length !== Object.keys(CLOSED_AUTHORITY).length ||
      Object.keys(CLOSED_AUTHORITY).some(
        (field) => candidate.authoritySummary[field] !== CLOSED_AUTHORITY[field],
      )
    ) {
      throw new Error(`${label} has invalid authoritySummary`);
    }

    const mission = state.missions[candidate.sourceMissionId];
    const closeOut = state.missionCloseOuts[candidate.sourceMissionCloseOutId];
    const plan = state.executionPlans[candidate.sourceExecutionPlanId];
    const deliveryPackage = state.deliveryPackages[candidate.sourceDeliveryPackageId];
    const acceptance =
      state.deliveryPackageAcceptances[candidate.sourceDeliveryPackageAcceptanceId];
    const checkpoint = state.workflowCheckpoints[candidate.sourceTerminalCheckpointId];
    if (
      !mission ||
      mission.projectId !== candidate.projectId ||
      mission.status !== 'completed' ||
      !closeOut ||
      closeOut.missionId !== mission.id ||
      closeOut.executionPlanId !== candidate.sourceExecutionPlanId ||
      closeOut.deliveryPackageId !== candidate.sourceDeliveryPackageId ||
      closeOut.deliveryPackageAcceptanceId !==
        candidate.sourceDeliveryPackageAcceptanceId ||
      closeOut.terminalCheckpointId !== candidate.sourceTerminalCheckpointId ||
      closeOut.closeOutDigest !== candidate.sourceMissionCloseOutDigest ||
      !plan ||
      plan.missionId !== mission.id ||
      plan.sourceDigest !== candidate.sourceDigest ||
      !deliveryPackage ||
      deliveryPackage.previewId !== candidate.sourceDeliveryPreviewId ||
      deliveryPackage.packageDigest !== candidate.sourcePackageDigest ||
      !acceptance ||
      acceptance.acceptanceDigest !== candidate.sourcePackageAcceptanceDigest ||
      !checkpoint ||
      checkpoint.checkpointDigest !== candidate.sourceTerminalCheckpointDigest
    ) {
      throw new Error(`${label} has invalid terminal source binding`);
    }
    if (sourceMissionIds.has(candidate.sourceMissionId)) {
      throw new Error(`${label} duplicates Mission learning evidence`);
    }
    sourceMissionIds.add(candidate.sourceMissionId);
    if (computeLearningCandidateRecordDigest(candidate) !== candidate.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }
}

function validateLearningCandidateReviewRecords(state) {
  const decisions = new Set(Object.values(LEARNING_CANDIDATE_REVIEW_DECISION));
  const digestPattern = /^[a-f0-9]{64}$/;
  const reviewedCandidateIds = new Set();

  for (const [key, review] of Object.entries(state.learningCandidateReviews)) {
    const label = `LearningCandidateReview ${key}`;
    if (!review || typeof review !== 'object' || Array.isArray(review) || review.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      review,
      [
        'id',
        'projectId',
        'sourceMissionId',
        'learningCandidateId',
        'previewId',
        'candidateDigest',
        'candidateRecordDigest',
        'decision',
        'rationale',
        'evidenceRefs',
        'reviewerAcknowledgement',
        'authoritySummary',
        'reviewDigest',
        'createdAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'sourceMissionId',
      'learningCandidateId',
      'previewId',
      'candidateDigest',
      'candidateRecordDigest',
      'decision',
      'rationale',
      'reviewerAcknowledgement',
      'reviewDigest',
      'createdAt',
    ]) {
      assertStringField(review, field, label);
    }
    assertStringArrayField(review, 'evidenceRefs', label);
    if (
      review.evidenceRefs.length === 0 ||
      review.evidenceRefs.length > 64 ||
      new Set(review.evidenceRefs).size !== review.evidenceRefs.length ||
      [...review.evidenceRefs].sort().some((entry, index) => entry !== review.evidenceRefs[index])
    ) {
      throw new Error(`${label} has invalid evidenceRefs`);
    }
    if (
      !decisions.has(review.decision) ||
      review.reviewerAcknowledgement !== 'human-reviewed' ||
      !digestPattern.test(review.candidateDigest) ||
      !digestPattern.test(review.candidateRecordDigest) ||
      !digestPattern.test(review.reviewDigest) ||
      Number.isNaN(Date.parse(review.createdAt)) ||
      new Date(review.createdAt).toISOString() !== review.createdAt
    ) {
      throw new Error(`${label} has invalid review evidence`);
    }
    if (
      !review.authoritySummary ||
      typeof review.authoritySummary !== 'object' ||
      Array.isArray(review.authoritySummary) ||
      Object.keys(review.authoritySummary).length !==
        Object.keys(LEARNING_CANDIDATE_REVIEW_AUTHORITY).length ||
      Object.keys(LEARNING_CANDIDATE_REVIEW_AUTHORITY).some(
        (field) =>
          review.authoritySummary[field] !== LEARNING_CANDIDATE_REVIEW_AUTHORITY[field],
      )
    ) {
      throw new Error(`${label} has invalid authoritySummary`);
    }
    const candidate = state.learningCandidates[review.learningCandidateId];
    if (
      !candidate ||
      candidate.projectId !== review.projectId ||
      candidate.sourceMissionId !== review.sourceMissionId ||
      candidate.previewId !== review.previewId ||
      candidate.candidateDigest !== review.candidateDigest ||
      candidate.recordDigest !== review.candidateRecordDigest ||
      review.evidenceRefs.some((entry) => !candidate.sourceEvidenceRefs.includes(entry)) ||
      Date.parse(review.createdAt) < Date.parse(candidate.createdAt) ||
      Date.parse(review.createdAt) >= Date.parse(candidate.expiry.expiresAt)
    ) {
      throw new Error(`${label} has invalid LearningCandidate binding`);
    }
    try {
      assertLearningCandidateReviewRecordContent(review, candidate);
    } catch (error) {
      throw new Error(`${label} has invalid normalized content: ${error.message}`);
    }
    if (reviewedCandidateIds.has(review.learningCandidateId)) {
      throw new Error(`${label} duplicates LearningCandidate review evidence`);
    }
    reviewedCandidateIds.add(review.learningCandidateId);
    if (computeLearningCandidateReviewDigest(review) !== review.reviewDigest) {
      throw new Error(`${label} reviewDigest does not match its immutable payload`);
    }
  }
}

function validateMemoryItemRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const sourceReviewIds = new Set();

  for (const [key, item] of Object.entries(state.memoryItems)) {
    const label = `MemoryItem ${key}`;
    if (!item || typeof item !== 'object' || Array.isArray(item) || item.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      item,
      [
        'id',
        'persisted',
        'status',
        'projectId',
        'workspaceScope',
        'sourceMissionId',
        'sourceLearningCandidateId',
        'sourceLearningCandidateReviewId',
        'sourceMemoryCandidatePreviewId',
        'sourceMemoryCandidatePreviewDigest',
        'sourceLearningPreviewId',
        'candidateDigest',
        'candidateRecordDigest',
        'reviewDigest',
        'summary',
        'applicability',
        'sourceRefs',
        'evidenceRefs',
        'negativeEvidenceRefs',
        'redactionRefs',
        'reviewRefs',
        'storageApproval',
        'redactionStatus',
        'applicationStatus',
        'promotionStatus',
        'expiresAt',
        'exportRefs',
        'deletionRefs',
        'blockedActions',
        'nonPersistenceStatement',
        'recordDigest',
        'createdAt',
        'updatedAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'sourceMissionId',
      'sourceLearningCandidateId',
      'sourceLearningCandidateReviewId',
      'sourceMemoryCandidatePreviewId',
      'sourceMemoryCandidatePreviewDigest',
      'sourceLearningPreviewId',
      'candidateDigest',
      'candidateRecordDigest',
      'reviewDigest',
      'summary',
      'redactionStatus',
      'applicationStatus',
      'promotionStatus',
      'expiresAt',
      'nonPersistenceStatement',
      'recordDigest',
      'createdAt',
      'updatedAt',
    ]) {
      assertStringField(item, field, label);
    }
    for (const field of [
      'sourceRefs',
      'evidenceRefs',
      'negativeEvidenceRefs',
      'redactionRefs',
      'reviewRefs',
      'exportRefs',
      'deletionRefs',
      'blockedActions',
    ]) {
      assertStringArrayField(item, field, label);
    }
    if (
      item.persisted !== true ||
      item.status !== MEMORY_ITEM_STATUS ||
      item.redactionStatus !== 'review-required' ||
      item.applicationStatus !== 'blocked' ||
      item.promotionStatus !== 'blocked' ||
      item.nonPersistenceStatement !== MEMORY_ITEM_NON_PERSISTENCE_STATEMENT ||
      item.exportRefs.length !== 0 ||
      item.deletionRefs.length !== 0 ||
      item.blockedActions.length !== MEMORY_ITEM_BLOCKED_ACTIONS.length ||
      item.blockedActions.some(
        (action, index) => action !== MEMORY_ITEM_BLOCKED_ACTIONS[index],
      )
    ) {
      throw new Error(`${label} has invalid immutable status or blocked authority`);
    }
    for (const field of [
      'sourceMemoryCandidatePreviewDigest',
      'candidateDigest',
      'candidateRecordDigest',
      'reviewDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(item[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      item.sourceMemoryCandidatePreviewId !==
      `memory-candidate-preview-${item.sourceMemoryCandidatePreviewDigest.slice(0, 16)}`
    ) {
      throw new Error(`${label} has invalid MemoryCandidate preview identity`);
    }
    for (const field of ['createdAt', 'updatedAt', 'expiresAt']) {
      if (
        Number.isNaN(Date.parse(item[field])) ||
        new Date(item[field]).toISOString() !== item[field]
      ) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      !item.storageApproval ||
      typeof item.storageApproval !== 'object' ||
      Array.isArray(item.storageApproval)
    ) {
      throw new Error(`${label} has invalid storageApproval`);
    }
    assertExactObjectKeys(
      item.storageApproval,
      ['decision', 'acknowledgement', 'rationale', 'reviewedAt'],
      `${label} storageApproval`,
    );
    assertStringField(item.storageApproval, 'rationale', `${label} storageApproval`);
    if (
      item.storageApproval.decision !== STORAGE_APPROVAL_DECISION ||
      item.storageApproval.acknowledgement !== STORAGE_APPROVAL_ACKNOWLEDGEMENT ||
      item.storageApproval.reviewedAt !== item.createdAt ||
      item.updatedAt !== item.createdAt ||
      Date.parse(item.expiresAt) <= Date.parse(item.createdAt)
    ) {
      throw new Error(`${label} has invalid storage approval timing or decision`);
    }
    if (
      !item.workspaceScope ||
      typeof item.workspaceScope !== 'object' ||
      Array.isArray(item.workspaceScope)
    ) {
      throw new Error(`${label} has invalid workspaceScope`);
    }
    assertExactObjectKeys(item.workspaceScope, ['projectId'], `${label} workspaceScope`);
    if (item.workspaceScope.projectId !== item.projectId) {
      throw new Error(`${label} has invalid project-only workspace scope`);
    }
    if (
      !item.applicability ||
      typeof item.applicability !== 'object' ||
      Array.isArray(item.applicability)
    ) {
      throw new Error(`${label} has invalid applicability`);
    }
    assertExactObjectKeys(
      item.applicability,
      ['summary', 'targetPathAllowlist', 'verificationCommands'],
      `${label} applicability`,
    );
    assertStringField(item.applicability, 'summary', `${label} applicability`);
    assertStringArrayField(
      item.applicability,
      'targetPathAllowlist',
      `${label} applicability`,
    );
    assertStringArrayField(
      item.applicability,
      'verificationCommands',
      `${label} applicability`,
    );

    const candidate = state.learningCandidates[item.sourceLearningCandidateId];
    const review = state.learningCandidateReviews[item.sourceLearningCandidateReviewId];
    const candidateNegativeEvidenceRefs = new Set(
      (candidate?.negativeEvidence || []).map((entry) => entry.sourceEvidenceRef),
    );
    if (
      !candidate ||
      !review ||
      review.decision !== LEARNING_CANDIDATE_REVIEW_DECISION.ACCEPT ||
      candidate.projectId !== item.projectId ||
      candidate.sourceMissionId !== item.sourceMissionId ||
      candidate.previewId !== item.sourceLearningPreviewId ||
      candidate.candidateDigest !== item.candidateDigest ||
      candidate.recordDigest !== item.candidateRecordDigest ||
      review.learningCandidateId !== candidate.id ||
      review.reviewDigest !== item.reviewDigest ||
      item.expiresAt > candidate.expiry.expiresAt ||
      !item.sourceRefs.includes(candidate.id) ||
      !item.sourceRefs.includes(review.id) ||
      item.evidenceRefs.some((ref) => !candidate.sourceEvidenceRefs.includes(ref)) ||
      item.negativeEvidenceRefs.some((ref) => !candidateNegativeEvidenceRefs.has(ref)) ||
      item.redactionRefs.some((ref) => !item.sourceRefs.includes(ref)) ||
      item.reviewRefs.some(
        (ref) => ref !== candidate.id && ref !== review.id && !review.evidenceRefs.includes(ref),
      )
    ) {
      throw new Error(`${label} has invalid source evidence binding`);
    }
    if (sourceReviewIds.has(review.id)) {
      throw new Error(`${label} duplicates accepted review storage evidence`);
    }
    sourceReviewIds.add(review.id);
    if (computeMemoryItemRecordDigest(item) !== item.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }
}

function validateMemoryRecallRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const sourceMemoryItemIds = new Set();

  for (const [key, recall] of Object.entries(state.memoryRecalls)) {
    const label = `MemoryRecall ${key}`;
    if (!recall || typeof recall !== 'object' || Array.isArray(recall) || recall.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      recall,
      [
        'id',
        'persisted',
        'status',
        'projectId',
        'workspaceScope',
        'sourceMemoryItemId',
        'sourceMemoryItemRecordDigest',
        'sourceMemoryCandidatePreviewId',
        'sourceLearningCandidateId',
        'sourceLearningCandidateReviewId',
        'sourceMemoryRecallPreviewId',
        'sourceMemoryRecallPreviewDigest',
        'retrievalMode',
        'purpose',
        'summary',
        'applicability',
        'sourceRefs',
        'evidenceRefs',
        'negativeEvidenceRefs',
        'redactionRefs',
        'reviewRefs',
        'recordApproval',
        'recommendationStatus',
        'applicationStatus',
        'missionInjectionStatus',
        'expiresAt',
        'blockedActions',
        'nonApplicationStatement',
        'recordDigest',
        'createdAt',
        'updatedAt',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'sourceMemoryItemId',
      'sourceMemoryItemRecordDigest',
      'sourceMemoryCandidatePreviewId',
      'sourceLearningCandidateId',
      'sourceLearningCandidateReviewId',
      'sourceMemoryRecallPreviewId',
      'sourceMemoryRecallPreviewDigest',
      'retrievalMode',
      'purpose',
      'summary',
      'recommendationStatus',
      'applicationStatus',
      'missionInjectionStatus',
      'expiresAt',
      'nonApplicationStatement',
      'recordDigest',
      'createdAt',
      'updatedAt',
    ]) {
      assertStringField(recall, field, label);
    }
    for (const field of [
      'sourceRefs',
      'evidenceRefs',
      'negativeEvidenceRefs',
      'redactionRefs',
      'reviewRefs',
      'blockedActions',
    ]) {
      assertStringArrayField(recall, field, label);
    }
    if (
      recall.persisted !== true ||
      recall.status !== MEMORY_RECALL_STATUS ||
      recall.retrievalMode !== 'exact-id-operator-selected' ||
      recall.recommendationStatus !== 'blocked' ||
      recall.applicationStatus !== 'blocked' ||
      recall.missionInjectionStatus !== 'blocked' ||
      recall.nonApplicationStatement !== MEMORY_RECALL_NON_APPLICATION_STATEMENT ||
      recall.blockedActions.length !== MEMORY_RECALL_BLOCKED_ACTIONS.length ||
      recall.blockedActions.some(
        (action, index) => action !== MEMORY_RECALL_BLOCKED_ACTIONS[index],
      )
    ) {
      throw new Error(`${label} has invalid immutable status or blocked authority`);
    }
    for (const field of [
      'sourceMemoryItemRecordDigest',
      'sourceMemoryRecallPreviewDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(recall[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      recall.sourceMemoryRecallPreviewId !==
      `memory-recall-preview-${recall.sourceMemoryRecallPreviewDigest.slice(0, 16)}`
    ) {
      throw new Error(`${label} has invalid MemoryRecall preview identity`);
    }
    for (const field of ['createdAt', 'updatedAt', 'expiresAt']) {
      if (
        Number.isNaN(Date.parse(recall[field])) ||
        new Date(recall[field]).toISOString() !== recall[field]
      ) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      !recall.recordApproval ||
      typeof recall.recordApproval !== 'object' ||
      Array.isArray(recall.recordApproval)
    ) {
      throw new Error(`${label} has invalid recordApproval`);
    }
    assertExactObjectKeys(
      recall.recordApproval,
      ['decision', 'acknowledgement', 'rationale', 'reviewedAt'],
      `${label} recordApproval`,
    );
    assertStringField(recall.recordApproval, 'rationale', `${label} recordApproval`);
    if (
      recall.recordApproval.decision !== RECORD_APPROVAL_DECISION ||
      recall.recordApproval.acknowledgement !== RECORD_APPROVAL_ACKNOWLEDGEMENT ||
      recall.recordApproval.reviewedAt !== recall.createdAt ||
      recall.updatedAt !== recall.createdAt ||
      Date.parse(recall.expiresAt) <= Date.parse(recall.createdAt)
    ) {
      throw new Error(`${label} has invalid record approval timing or decision`);
    }
    if (
      !recall.workspaceScope ||
      typeof recall.workspaceScope !== 'object' ||
      Array.isArray(recall.workspaceScope)
    ) {
      throw new Error(`${label} has invalid workspaceScope`);
    }
    assertExactObjectKeys(recall.workspaceScope, ['projectId'], `${label} workspaceScope`);
    if (recall.workspaceScope.projectId !== recall.projectId) {
      throw new Error(`${label} has invalid project-only workspace scope`);
    }
    if (
      !recall.applicability ||
      typeof recall.applicability !== 'object' ||
      Array.isArray(recall.applicability)
    ) {
      throw new Error(`${label} has invalid applicability`);
    }
    assertExactObjectKeys(
      recall.applicability,
      ['summary', 'targetPathAllowlist', 'verificationCommands'],
      `${label} applicability`,
    );
    assertStringField(recall.applicability, 'summary', `${label} applicability`);
    assertStringArrayField(
      recall.applicability,
      'targetPathAllowlist',
      `${label} applicability`,
    );
    assertStringArrayField(
      recall.applicability,
      'verificationCommands',
      `${label} applicability`,
    );

    const item = state.memoryItems[recall.sourceMemoryItemId];
    const expectedSourceRefs = item
      ? [...new Set([item.id, ...item.sourceRefs])].sort()
      : [];
    const expectedNegativeEvidenceRefs = item
      ? [...new Set(item.negativeEvidenceRefs)].sort()
      : [];
    if (
      !item ||
      item.projectId !== recall.projectId ||
      item.recordDigest !== recall.sourceMemoryItemRecordDigest ||
      item.sourceMemoryCandidatePreviewId !== recall.sourceMemoryCandidatePreviewId ||
      item.sourceLearningCandidateId !== recall.sourceLearningCandidateId ||
      item.sourceLearningCandidateReviewId !== recall.sourceLearningCandidateReviewId ||
      item.summary !== recall.summary ||
      item.expiresAt !== recall.expiresAt ||
      Date.parse(recall.createdAt) < Date.parse(item.createdAt) ||
      recall.sourceRefs.length !== expectedSourceRefs.length ||
      recall.sourceRefs.some((ref, index) => ref !== expectedSourceRefs[index]) ||
      recall.evidenceRefs.some((ref) => !item.evidenceRefs.includes(ref)) ||
      recall.negativeEvidenceRefs.length !== expectedNegativeEvidenceRefs.length ||
      recall.negativeEvidenceRefs.some(
        (ref, index) => ref !== expectedNegativeEvidenceRefs[index],
      ) ||
      recall.redactionRefs.some((ref) => !item.redactionRefs.includes(ref)) ||
      recall.reviewRefs.some((ref) => !item.reviewRefs.includes(ref)) ||
      recall.applicability.targetPathAllowlist.some(
        (entry) => !item.applicability.targetPathAllowlist.includes(entry),
      ) ||
      recall.applicability.verificationCommands.some(
        (entry) => !item.applicability.verificationCommands.includes(entry),
      )
    ) {
      throw new Error(`${label} has invalid source MemoryItem binding`);
    }
    if (sourceMemoryItemIds.has(item.id)) {
      throw new Error(`${label} duplicates MemoryItem recall evidence`);
    }
    sourceMemoryItemIds.add(item.id);
    if (computeMemoryRecallRecordDigest(recall) !== recall.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }
}

function validateStaffingPlanRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const missionIds = new Set();

  for (const [key, staffingPlan] of Object.entries(state.staffingPlans)) {
    const label = `StaffingPlan ${key}`;
    if (
      !staffingPlan ||
      typeof staffingPlan !== 'object' ||
      Array.isArray(staffingPlan) ||
      staffingPlan.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      staffingPlan,
      [
        'id',
        'persisted',
        'status',
        'missionId',
        'projectId',
        'projectPack',
        'workspaceScope',
        'mode',
        'selectedAgentIds',
        'selectedRoles',
        'selectionRationale',
        'parallelGroups',
        'providerMode',
        'terminationPolicy',
        'sourceRefs',
        'blueprintSourceRefs',
        'sourceDigest',
        'missionDigest',
        'blueprintDigest',
        'staffingSpecDigest',
        'sourcePreviewId',
        'sourcePreviewDigest',
        'acceptance',
        'blockedActions',
        'evaluatedAt',
        'acceptedAt',
        'createdAt',
        'updatedAt',
        'recordDigest',
      ],
      label,
    );
    for (const field of [
      'id',
      'status',
      'missionId',
      'projectId',
      'projectPack',
      'mode',
      'selectionRationale',
      'providerMode',
      'sourceDigest',
      'missionDigest',
      'blueprintDigest',
      'staffingSpecDigest',
      'sourcePreviewId',
      'sourcePreviewDigest',
      'evaluatedAt',
      'acceptedAt',
      'createdAt',
      'updatedAt',
      'recordDigest',
    ]) {
      assertStringField(staffingPlan, field, label);
    }
    for (const field of [
      'selectedAgentIds',
      'selectedRoles',
      'sourceRefs',
      'blueprintSourceRefs',
      'blockedActions',
    ]) {
      assertStringArrayField(staffingPlan, field, label);
      if (
        new Set(staffingPlan[field]).size !== staffingPlan[field].length ||
        !sameStringArrays(staffingPlan[field], [...staffingPlan[field]].sort())
      ) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      staffingPlan.persisted !== true ||
      staffingPlan.status !== STAFFING_PLAN_STATUS ||
      staffingPlan.providerMode !== 'local-stub' ||
      !['solo', 'council'].includes(staffingPlan.mode)
    ) {
      throw new Error(`${label} has invalid immutable status or mode`);
    }
    if (
      !/^staffing-plan-\d{4}$/.test(staffingPlan.id) ||
      !/^staffing-plan-preview-[a-f0-9]{16}$/.test(staffingPlan.sourcePreviewId) ||
      staffingPlan.sourcePreviewId !==
        `staffing-plan-preview-${staffingPlan.sourcePreviewDigest.slice(0, 16)}`
    ) {
      throw new Error(`${label} has invalid durable or preview identity`);
    }
    for (const field of [
      'sourceDigest',
      'missionDigest',
      'blueprintDigest',
      'staffingSpecDigest',
      'sourcePreviewDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(staffingPlan[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      !staffingPlan.workspaceScope ||
      typeof staffingPlan.workspaceScope !== 'object' ||
      Array.isArray(staffingPlan.workspaceScope)
    ) {
      throw new Error(`${label} has invalid workspaceScope`);
    }
    assertExactObjectKeys(staffingPlan.workspaceScope, ['projectId'], `${label} workspaceScope`);
    if (staffingPlan.workspaceScope.projectId !== staffingPlan.projectId) {
      throw new Error(`${label} has invalid project-only workspace scope`);
    }
    if (
      !staffingPlan.terminationPolicy ||
      typeof staffingPlan.terminationPolicy !== 'object' ||
      Array.isArray(staffingPlan.terminationPolicy)
    ) {
      throw new Error(`${label} has invalid terminationPolicy`);
    }
    assertExactObjectKeys(
      staffingPlan.terminationPolicy,
      ['deadlineMs', 'maxProviderCalls', 'maxTurnsPerAgent', 'stopOnRequiredRoleFailure'],
      `${label} terminationPolicy`,
    );
    if (
      staffingPlan.terminationPolicy.maxProviderCalls !== 0 ||
      !Number.isInteger(staffingPlan.terminationPolicy.maxTurnsPerAgent) ||
      staffingPlan.terminationPolicy.maxTurnsPerAgent < 1 ||
      !Number.isInteger(staffingPlan.terminationPolicy.deadlineMs) ||
      staffingPlan.terminationPolicy.deadlineMs < 1 ||
      staffingPlan.terminationPolicy.stopOnRequiredRoleFailure !== true
    ) {
      throw new Error(`${label} has invalid terminationPolicy values`);
    }
    if (
      !Array.isArray(staffingPlan.parallelGroups) ||
      staffingPlan.parallelGroups.length !== 0
    ) {
      throw new Error(`${label} has invalid parallelGroups`);
    }
    if (
      staffingPlan.selectedAgentIds.length === 0 ||
      staffingPlan.selectedAgentIds.length !== staffingPlan.selectedRoles.length ||
      (staffingPlan.mode === 'solo' && staffingPlan.selectedAgentIds.length !== 1) ||
      (staffingPlan.mode === 'council' && staffingPlan.selectedAgentIds.length !== 4)
    ) {
      throw new Error(`${label} has invalid selected agents`);
    }
    if (
      !staffingPlan.acceptance ||
      typeof staffingPlan.acceptance !== 'object' ||
      Array.isArray(staffingPlan.acceptance)
    ) {
      throw new Error(`${label} has invalid acceptance`);
    }
    assertExactObjectKeys(
      staffingPlan.acceptance,
      ['acknowledgement', 'decision', 'rationale', 'reviewedAt'],
      `${label} acceptance`,
    );
    assertStringField(staffingPlan.acceptance, 'rationale', `${label} acceptance`);
    if (
      staffingPlan.acceptance.decision !== STAFFING_PLAN_ACCEPTANCE_DECISION ||
      staffingPlan.acceptance.acknowledgement !==
        STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT
    ) {
      throw new Error(`${label} has invalid acceptance decision`);
    }
    for (const field of ['evaluatedAt', 'acceptedAt', 'createdAt', 'updatedAt']) {
      if (
        Number.isNaN(Date.parse(staffingPlan[field])) ||
        new Date(staffingPlan[field]).toISOString() !== staffingPlan[field]
      ) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      staffingPlan.acceptance.reviewedAt !== staffingPlan.acceptedAt ||
      staffingPlan.createdAt !== staffingPlan.acceptedAt ||
      staffingPlan.updatedAt !== staffingPlan.acceptedAt ||
      Date.parse(staffingPlan.acceptedAt) < Date.parse(staffingPlan.evaluatedAt)
    ) {
      throw new Error(`${label} has invalid acceptance timing`);
    }
    if (
      !sameStringArrays(staffingPlan.blockedActions, STAFFING_PLAN_BLOCKED_ACTIONS) ||
      !staffingPlan.blueprintSourceRefs.includes('company/blueprint.json') ||
      staffingPlan.blueprintSourceRefs.length !== 10
    ) {
      throw new Error(`${label} has invalid source or blocked-action evidence`);
    }
    const mission = state.missions[staffingPlan.missionId];
    if (
      !mission ||
      mission.projectId !== staffingPlan.projectId ||
      !state.projects[staffingPlan.projectId]
    ) {
      throw new Error(`${label} has invalid Mission or project binding`);
    }
    if (missionIds.has(staffingPlan.missionId)) {
      throw new Error(`${label} duplicates Mission staffing evidence`);
    }
    missionIds.add(staffingPlan.missionId);
    if (computeStaffingPlanRecordDigest(staffingPlan) !== staffingPlan.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }
}

function validateDurableWorkOrderRecords(state) {
  const planStatuses = new Set(Object.values(EXECUTION_PLAN_STATUS));
  const workOrderStatuses = new Set(Object.values(WORK_ORDER_STATUS));

  for (const [key, plan] of Object.entries(state.executionPlans)) {
    const label = `ExecutionPlan ${key}`;
    if (!plan || typeof plan !== 'object' || Array.isArray(plan) || plan.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    for (const field of [
      'projectId',
      'missionId',
      'councilSessionId',
      'previewId',
      'sourceDigest',
      'compileSpecDigest',
      'controlTaskId',
      'approvalId',
    ]) {
      assertStringField(plan, field, label);
    }
    assertStringArrayField(plan, 'workOrderIds', label);
    assertStringArrayField(plan, 'handoffPacketIds', label);
    if (!planStatuses.has(plan.status)) throw new Error(`${label} has invalid status`);
    if (
      !state.projects[plan.projectId] ||
      !state.missions[plan.missionId] ||
      !state.councilSessions[plan.councilSessionId] ||
      !state.tasks[plan.controlTaskId] ||
      !state.approvals[plan.approvalId]
    ) {
      throw new Error(`${label} has missing source or approval references`);
    }
    if (plan.workOrderIds.some((id) => !state.workOrders[id])) {
      throw new Error(`${label} has missing WorkOrder references`);
    }
    if (plan.handoffPacketIds.some((id) => !state.handoffPackets[id])) {
      throw new Error(`${label} has missing HandoffPacket references`);
    }
  }

  for (const [key, workOrder] of Object.entries(state.workOrders)) {
    const label = `WorkOrder ${key}`;
    if (
      !workOrder ||
      typeof workOrder !== 'object' ||
      Array.isArray(workOrder) ||
      workOrder.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    for (const field of ['executionPlanId', 'handoffPacketId', 'role', 'sourceDigest']) {
      assertStringField(workOrder, field, label);
    }
    for (const field of [
      'dependencyIds',
      'runRefs',
      'artifactRefs',
      'acceptanceCriterionRefs',
    ]) {
      assertStringArrayField(workOrder, field, label);
    }
    for (const field of ['approvalRefs', 'changedFiles', 'inboxItemRefs']) {
      if (workOrder[field] !== undefined) assertStringArrayField(workOrder, field, label);
    }
    if (!workOrderStatuses.has(workOrder.status)) throw new Error(`${label} has invalid status`);
    if (
      [
        WORK_ORDER_STATUS.COMPLETED,
        WORK_ORDER_STATUS.CHANGES_REQUESTED,
        WORK_ORDER_STATUS.FAILED,
      ].includes(workOrder.status) &&
      (workOrder.runRefs.length === 0 || workOrder.artifactRefs.length === 0)
    ) {
      throw new Error(`${label} terminal evidence refs are required`);
    }
    const plan = state.executionPlans[workOrder.executionPlanId];
    if (!plan || !plan.workOrderIds.includes(workOrder.id)) {
      throw new Error(`${label} has an invalid ExecutionPlan reference`);
    }
    if (!state.handoffPackets[workOrder.handoffPacketId]) {
      throw new Error(`${label} has a missing HandoffPacket reference`);
    }
  }

  for (const [key, packet] of Object.entries(state.handoffPackets)) {
    const label = `HandoffPacket ${key}`;
    if (!packet || typeof packet !== 'object' || Array.isArray(packet) || packet.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    for (const field of ['executionPlanId', 'workOrderId', 'sourceDigest']) {
      assertStringField(packet, field, label);
    }
    const plan = state.executionPlans[packet.executionPlanId];
    const workOrder = state.workOrders[packet.workOrderId];
    if (
      !plan ||
      !plan.handoffPacketIds.includes(packet.id) ||
      !workOrder ||
      workOrder.handoffPacketId !== packet.id
    ) {
      throw new Error(`${label} has invalid plan or WorkOrder references`);
    }
  }
}

function validateAcceptanceCriterionRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const sourceCriterionKeys = new Set();

  for (const [key, criterion] of Object.entries(state.acceptanceCriteria)) {
    const label = `AcceptanceCriterion ${key}`;
    if (
      !criterion ||
      typeof criterion !== 'object' ||
      Array.isArray(criterion) ||
      criterion.id !== key
    ) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      criterion,
      [
        'id',
        'persisted',
        'status',
        'projectId',
        'missionId',
        'executionPlanId',
        'workOrderId',
        'sourcePreviewId',
        'sourcePreviewDigest',
        'sourceExecutionPlanDigest',
        'sourceWorkOrderDigest',
        'sourceDigest',
        'sourceCriterionId',
        'kind',
        'title',
        'essential',
        'proofMode',
        'sourceField',
        'sourceValues',
        'requiredEvidenceKinds',
        'newInformationRequired',
        'persistenceApproval',
        'blockedActions',
        'createdAt',
        'recordDigest',
      ],
      label,
    );
    for (const field of [
      'projectId',
      'missionId',
      'executionPlanId',
      'workOrderId',
      'sourcePreviewId',
      'sourcePreviewDigest',
      'sourceExecutionPlanDigest',
      'sourceWorkOrderDigest',
      'sourceDigest',
      'sourceCriterionId',
      'kind',
      'title',
      'proofMode',
      'sourceField',
      'createdAt',
      'recordDigest',
    ]) {
      assertStringField(criterion, field, label);
    }
    for (const field of ['sourceValues', 'requiredEvidenceKinds', 'blockedActions']) {
      assertStringArrayField(criterion, field, label);
    }
    if (
      criterion.persisted !== true ||
      criterion.status !== ACCEPTANCE_CRITERION_STATUS ||
      criterion.essential !== true ||
      criterion.newInformationRequired !== true
    ) {
      throw new Error(`${label} has invalid immutable status`);
    }
    for (const field of [
      'sourcePreviewDigest',
      'sourceExecutionPlanDigest',
      'sourceWorkOrderDigest',
      'sourceDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(criterion[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      Number.isNaN(Date.parse(criterion.createdAt)) ||
      new Date(criterion.createdAt).toISOString() !== criterion.createdAt
    ) {
      throw new Error(`${label} has invalid createdAt`);
    }
    if (
      !criterion.persistenceApproval ||
      typeof criterion.persistenceApproval !== 'object' ||
      Array.isArray(criterion.persistenceApproval)
    ) {
      throw new Error(`${label} has invalid persistenceApproval`);
    }
    assertExactObjectKeys(
      criterion.persistenceApproval,
      ['decision', 'acknowledgement', 'rationale', 'reviewedAt'],
      `${label} persistenceApproval`,
    );
    assertStringField(
      criterion.persistenceApproval,
      'rationale',
      `${label} persistenceApproval`,
    );
    if (
      criterion.persistenceApproval.decision !== PERSISTENCE_APPROVAL_DECISION ||
      criterion.persistenceApproval.acknowledgement !==
        PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT ||
      criterion.persistenceApproval.reviewedAt !== criterion.createdAt
    ) {
      throw new Error(`${label} has invalid persistence approval evidence`);
    }
    if (
      criterion.blockedActions.length !== ACCEPTANCE_CRITERION_BLOCKED_ACTIONS.length ||
      criterion.blockedActions.some(
        (action, index) => action !== ACCEPTANCE_CRITERION_BLOCKED_ACTIONS[index],
      )
    ) {
      throw new Error(`${label} has invalid blockedActions`);
    }
    const plan = state.executionPlans[criterion.executionPlanId];
    const workOrder = state.workOrders[criterion.workOrderId];
    if (
      !plan ||
      !workOrder ||
      plan.projectId !== criterion.projectId ||
      plan.missionId !== criterion.missionId ||
      plan.sourceDigest !== criterion.sourceDigest ||
      workOrder.executionPlanId !== plan.id ||
      workOrder.sourceDigest !== criterion.sourceDigest ||
      !workOrder.acceptanceCriterionRefs.includes(criterion.id)
    ) {
      throw new Error(`${label} has invalid ExecutionPlan or WorkOrder binding`);
    }
    const allowedSourceFields = new Set([
      'acceptanceCriteria',
      'expectedArtifacts',
      'stopConditions',
      'verificationCommands',
    ]);
    if (
      !allowedSourceFields.has(criterion.sourceField) ||
      JSON.stringify(criterion.sourceValues) !==
        JSON.stringify(workOrder[criterion.sourceField])
    ) {
      throw new Error(`${label} has invalid source values`);
    }
    const sourceKey = `${criterion.workOrderId}:${criterion.sourceCriterionId}`;
    if (sourceCriterionKeys.has(sourceKey)) {
      throw new Error(`${label} duplicates one source criterion`);
    }
    sourceCriterionKeys.add(sourceKey);
    if (computeAcceptanceCriterionRecordDigest(criterion) !== criterion.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }
}

function validateVerificationProofRecords(state) {
  const digestPattern = /^[a-f0-9]{64}$/;
  const requestKeys = new Set();
  const attemptsByCriterion = new Map();

  for (const [key, proof] of Object.entries(state.verificationProofs)) {
    const label = `VerificationProof ${key}`;
    if (!proof || typeof proof !== 'object' || Array.isArray(proof) || proof.id !== key) {
      throw new Error(`${label} has an invalid record identity`);
    }
    assertExactObjectKeys(
      proof,
      [
        'id',
        'persisted',
        'status',
        'proofKind',
        'attempt',
        'projectId',
        'missionId',
        'executionPlanId',
        'workOrderId',
        'acceptanceCriterionId',
        'acceptanceCriterionRecordDigest',
        'sourceDigest',
        'sourceWorkOrderDigest',
        'verificationInputDigest',
        'commandResults',
        'evidenceArtifactIds',
        'requiredEvidenceKinds',
        'newInformationClass',
        'proofApproval',
        'requestDigest',
        'blockedActions',
        'createdAt',
        'recordDigest',
      ],
      label,
    );
    for (const field of [
      'proofKind',
      'projectId',
      'missionId',
      'executionPlanId',
      'workOrderId',
      'acceptanceCriterionId',
      'acceptanceCriterionRecordDigest',
      'sourceDigest',
      'sourceWorkOrderDigest',
      'verificationInputDigest',
      'newInformationClass',
      'requestDigest',
      'createdAt',
      'recordDigest',
    ]) {
      assertStringField(proof, field, label);
    }
    for (const field of [
      'evidenceArtifactIds',
      'requiredEvidenceKinds',
      'blockedActions',
    ]) {
      assertStringArrayField(proof, field, label);
    }
    if (!Array.isArray(proof.commandResults)) {
      throw new Error(`${label} has invalid commandResults`);
    }
    if (
      proof.persisted !== true ||
      !Object.values(VERIFICATION_PROOF_STATUS).includes(proof.status) ||
      !Number.isInteger(proof.attempt) ||
      proof.attempt < 1
    ) {
      throw new Error(`${label} has invalid immutable status or attempt`);
    }
    for (const field of [
      'acceptanceCriterionRecordDigest',
      'sourceDigest',
      'sourceWorkOrderDigest',
      'verificationInputDigest',
      'requestDigest',
      'recordDigest',
    ]) {
      if (!digestPattern.test(proof[field])) {
        throw new Error(`${label} has invalid ${field}`);
      }
    }
    if (
      Number.isNaN(Date.parse(proof.createdAt)) ||
      new Date(proof.createdAt).toISOString() !== proof.createdAt
    ) {
      throw new Error(`${label} has invalid createdAt`);
    }
    if (
      !proof.proofApproval ||
      typeof proof.proofApproval !== 'object' ||
      Array.isArray(proof.proofApproval)
    ) {
      throw new Error(`${label} has invalid proofApproval`);
    }
    assertExactObjectKeys(
      proof.proofApproval,
      ['decision', 'acknowledgement', 'rationale', 'reviewedAt'],
      `${label} proofApproval`,
    );
    assertStringField(proof.proofApproval, 'rationale', `${label} proofApproval`);
    if (
      proof.proofApproval.decision !== PROOF_APPROVAL_DECISION ||
      proof.proofApproval.acknowledgement !== PROOF_APPROVAL_ACKNOWLEDGEMENT ||
      proof.proofApproval.reviewedAt !== proof.createdAt
    ) {
      throw new Error(`${label} has invalid proof approval evidence`);
    }
    if (
      proof.blockedActions.length !== VERIFICATION_PROOF_BLOCKED_ACTIONS.length ||
      proof.blockedActions.some(
        (action, index) => action !== VERIFICATION_PROOF_BLOCKED_ACTIONS[index],
      )
    ) {
      throw new Error(`${label} has invalid blockedActions`);
    }
    const criterion = state.acceptanceCriteria[proof.acceptanceCriterionId];
    const workOrder = state.workOrders[proof.workOrderId];
    if (
      !criterion ||
      !workOrder ||
      criterion.recordDigest !== proof.acceptanceCriterionRecordDigest ||
      criterion.projectId !== proof.projectId ||
      criterion.missionId !== proof.missionId ||
      criterion.executionPlanId !== proof.executionPlanId ||
      criterion.workOrderId !== proof.workOrderId ||
      criterion.sourceDigest !== proof.sourceDigest ||
      criterion.sourceWorkOrderDigest !== proof.sourceWorkOrderDigest
    ) {
      throw new Error(`${label} has invalid AcceptanceCriterion binding`);
    }
    if (
      proof.evidenceArtifactIds.some(
        (artifactId) =>
          !state.artifacts[artifactId] || !workOrder.artifactRefs.includes(artifactId),
      )
    ) {
      throw new Error(`${label} has invalid artifact evidence`);
    }
    if (
      (proof.proofKind === 'command' &&
        (criterion.proofMode !== 'command' ||
          proof.commandResults.length === 0 ||
          proof.evidenceArtifactIds.length !== 0)) ||
      (proof.proofKind === 'review' &&
        (criterion.proofMode === 'command' ||
          proof.evidenceArtifactIds.length === 0 ||
          proof.commandResults.length !== 0)) ||
      JSON.stringify(proof.requiredEvidenceKinds) !==
        JSON.stringify(criterion.requiredEvidenceKinds) ||
      proof.newInformationClass !==
        (proof.proofKind === 'command' ? 'execution' : 'human-review')
    ) {
      throw new Error(`${label} has invalid proof mode evidence`);
    }
    if (
      proof.commandResults.some((result) => {
        if (!result || typeof result !== 'object' || Array.isArray(result)) return true;
        try {
          assertExactObjectKeys(
            result,
            [
              'kind',
              'argv',
              'exitCode',
              'durationMs',
              'stdoutDigest',
              'stderrDigest',
              'truncated',
              'timedOut',
              'error',
              'passed',
            ],
            `${label} commandResult`,
          );
        } catch (_error) {
          return true;
        }
        return (
          result.kind !== 'node-check' ||
          !Array.isArray(result.argv) ||
          result.argv.length !== 3 ||
          result.argv[1] !== '--check' ||
          !Number.isInteger(result.durationMs) ||
          result.durationMs < 0 ||
          (result.exitCode !== null && !Number.isInteger(result.exitCode)) ||
          !digestPattern.test(result.stdoutDigest) ||
          !digestPattern.test(result.stderrDigest) ||
          typeof result.truncated !== 'boolean' ||
          typeof result.timedOut !== 'boolean' ||
          (result.error !== null && typeof result.error !== 'string') ||
          typeof result.passed !== 'boolean'
        );
      }) ||
      new Set(proof.evidenceArtifactIds).size !== proof.evidenceArtifactIds.length
    ) {
      throw new Error(`${label} has invalid command or artifact evidence shape`);
    }
    const requestKey = `${proof.acceptanceCriterionId}:${proof.requestDigest}`;
    if (requestKeys.has(requestKey)) {
      throw new Error(`${label} duplicates one proof request`);
    }
    requestKeys.add(requestKey);
    const attempts = attemptsByCriterion.get(proof.acceptanceCriterionId) || [];
    attempts.push(proof.attempt);
    attemptsByCriterion.set(proof.acceptanceCriterionId, attempts);
    if (computeVerificationProofRecordDigest(proof) !== proof.recordDigest) {
      throw new Error(`${label} recordDigest does not match its immutable payload`);
    }
  }

  for (const [criterionId, attempts] of attemptsByCriterion) {
    attempts.sort((left, right) => left - right);
    if (attempts.some((attempt, index) => attempt !== index + 1)) {
      throw new Error(`AcceptanceCriterion ${criterionId} has invalid proof attempt history`);
    }
  }
}

function inferMigratedWorkflowCheckpointStage(executionPlan, workOrders) {
  const byRole = Object.fromEntries(workOrders.map((workOrder) => [workOrder.role, workOrder]));
  if (workOrders.length !== 3 || !byRole.builder || !byRole.reviewer || !byRole.qa) return null;

  if (
    executionPlan.status === EXECUTION_PLAN_STATUS.ACTIVE &&
    executionPlan.activeWorkOrderId === byRole.builder.id &&
    executionPlan.stoppedAt === 'request-builder-live-mutation-approval' &&
    byRole.builder.status === WORK_ORDER_STATUS.WAITING_GATE
  ) {
    return WORKFLOW_CHECKPOINT_STAGE.BUILDER_WAITING_GATE;
  }
  if (
    executionPlan.status === EXECUTION_PLAN_STATUS.ACTIVE &&
    executionPlan.activeWorkOrderId === byRole.reviewer.id &&
    byRole.builder.status === WORK_ORDER_STATUS.COMPLETED &&
    byRole.reviewer.status === WORK_ORDER_STATUS.QUEUED
  ) {
    return WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY;
  }
  if (
    executionPlan.status === EXECUTION_PLAN_STATUS.REVIEWING &&
    executionPlan.activeWorkOrderId === byRole.qa.id &&
    byRole.reviewer.status === WORK_ORDER_STATUS.COMPLETED &&
    byRole.qa.status === WORK_ORDER_STATUS.QUEUED
  ) {
    return WORKFLOW_CHECKPOINT_STAGE.QA_READY;
  }
  if (
    executionPlan.status === EXECUTION_PLAN_STATUS.DELIVERY_READY &&
    executionPlan.activeWorkOrderId === null &&
    workOrders.every((workOrder) => workOrder.status === WORK_ORDER_STATUS.COMPLETED)
  ) {
    return WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY;
  }
  return null;
}

function bootstrapMigratedWorkflowCheckpoints(state) {
  for (const executionPlan of Object.values(state.executionPlans)) {
    const workOrders = executionPlan.workOrderIds.map((id) => state.workOrders[id]).filter(Boolean);
    const stage = inferMigratedWorkflowCheckpointStage(executionPlan, workOrders);
    if (!stage) continue;

    state.sequences.workflowCheckpoint += 1;
    const checkpoint = createWorkflowCheckpoint({
      id: `workflow-checkpoint-${String(state.sequences.workflowCheckpoint).padStart(4, '0')}`,
      executionPlan,
      workOrders,
      projectProvider: state.projects[executionPlan.projectId]?.provider,
      stage,
      attempt: 1,
      resumedFromCheckpointId: null,
      stopReason:
        executionPlan.stopReason || `schema-v7-migration-${stage}`,
      createdAt:
        executionPlan.updatedAt || executionPlan.createdAt || '1970-01-01T00:00:00.000Z',
    });
    state.workflowCheckpoints[checkpoint.id] = checkpoint;
    executionPlan.checkpointRefs.push(checkpoint.id);
    executionPlan.latestCheckpointId = checkpoint.id;
  }
}

function createFileStore(options = {}) {
  const runtimeRoot = options.runtimeRoot || path.join(process.cwd(), 'var', 'runtime');
  const statePath = path.join(runtimeRoot, 'state.json');
  const stateLockPath = `${statePath}.lock`;
  const logsDir = path.join(runtimeRoot, 'logs');
  const artifactsDir = path.join(runtimeRoot, 'artifacts');
  const archivedArtifactsDir = path.join(artifactsDir, 'archive');
  const deletedArtifactsDir = path.join(artifactsDir, 'deleted');
  const lockTimeoutMs = options.stateLockTimeoutMs || 2_000;
  const staleLockMs = options.stateStaleLockMs || 30_000;
  const lockRetryMs = options.stateLockRetryMs || 10;

  function digestStateBytes(bytes) {
    return crypto.createHash('sha256').update(bytes).digest('hex');
  }

  function attachStateRevision(state, revision) {
    Object.defineProperty(state, STATE_REVISION, {
      configurable: true,
      enumerable: false,
      value: revision,
      writable: true,
    });
    return state;
  }

  function assertRegularStateFile() {
    const stat = fs.lstatSync(statePath);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error('state file must be a regular file');
    }
  }

  function readStateBytes() {
    assertRegularStateFile();
    return fs.readFileSync(statePath, 'utf8');
  }

  function sleep(milliseconds) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
  }

  function isProcessAlive(pid) {
    if (!Number.isInteger(pid) || pid < 1) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return error.code === 'EPERM';
    }
  }

  function reclaimStaleLock() {
    let lockStat;
    let owner;
    try {
      lockStat = fs.lstatSync(stateLockPath);
      if (lockStat.isSymbolicLink() || !lockStat.isFile()) return false;
      owner = JSON.parse(fs.readFileSync(stateLockPath, 'utf8'));
    } catch (_error) {
      return false;
    }
    const createdAt = Date.parse(owner.createdAt);
    if (
      !Number.isFinite(createdAt) ||
      Date.now() - createdAt <= staleLockMs ||
      isProcessAlive(owner.pid)
    ) {
      return false;
    }
    try {
      const current = fs.lstatSync(stateLockPath);
      if (current.dev !== lockStat.dev || current.ino !== lockStat.ino) return false;
      fs.unlinkSync(stateLockPath);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function acquireStateLock() {
    ensureDirs();
    const startedAt = Date.now();
    while (true) {
      try {
        const flags =
          fs.constants.O_CREAT |
          fs.constants.O_EXCL |
          fs.constants.O_WRONLY |
          (fs.constants.O_NOFOLLOW || 0);
        const descriptor = fs.openSync(stateLockPath, flags, 0o600);
        fs.writeFileSync(
          descriptor,
          `${JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() })}\n`,
        );
        fs.fsyncSync(descriptor);
        return descriptor;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        if (reclaimStaleLock()) continue;
        if (Date.now() - startedAt >= lockTimeoutMs) {
          throw new StateLockTimeoutError('Timed out waiting for the runtime state lock');
        }
        sleep(lockRetryMs);
      }
    }
  }

  function releaseStateLock(descriptor) {
    let ownedStat = null;
    try {
      ownedStat = fs.fstatSync(descriptor);
    } finally {
      fs.closeSync(descriptor);
    }
    try {
      const current = fs.lstatSync(stateLockPath);
      if (current.dev === ownedStat.dev && current.ino === ownedStat.ino) {
        fs.unlinkSync(stateLockPath);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  function createDefaultArtifactRetentionState() {
    return {
      actionLog: [],
      lastAction: null,
      lastActionAt: null,
      status: RETENTION_CONSUMER_STATUS.ACTIVE,
    };
  }

  function normalizeState(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      throw new Error('Runtime state must be an object');
    }

    const sourceSchemaVersion = state.schemaVersion;
    if (
      sourceSchemaVersion !== LEGACY_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== MIGRATABLE_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== WORKFLOW_CHECKPOINT_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== DELIVERY_PACKAGE_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== DELIVERY_PACKAGE_ACCEPTANCE_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== MISSION_CLOSE_OUT_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== LEARNING_CANDIDATE_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== LEARNING_CANDIDATE_REVIEW_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== MEMORY_ITEM_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== MEMORY_RECALL_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== ACCEPTANCE_CRITERION_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== STATE_SCHEMA_VERSION
    ) {
      throw new Error(`Unsupported runtime state schemaVersion: ${sourceSchemaVersion}`);
    }

    if (sourceSchemaVersion >= MIGRATABLE_STATE_SCHEMA_VERSION) {
      const requiredSequences = ['executionPlan', 'workOrder', 'handoffPacket'];
      const requiredMaps = ['executionPlans', 'workOrders', 'handoffPackets'];
      if (
        !state.sequences ||
        requiredSequences.some((key) => !Number.isInteger(state.sequences[key])) ||
        requiredMaps.some(
          (key) => !state[key] || typeof state[key] !== 'object' || Array.isArray(state[key]),
        )
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing durable WorkOrder fields`,
        );
      }
    }

    if (sourceSchemaVersion >= WORKFLOW_CHECKPOINT_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.workflowCheckpoint) ||
        !state.workflowCheckpoints ||
        typeof state.workflowCheckpoints !== 'object' ||
        Array.isArray(state.workflowCheckpoints) ||
        Object.values(state.executionPlans).some(
          (plan) =>
            !Array.isArray(plan.checkpointRefs) ||
            !Object.prototype.hasOwnProperty.call(plan, 'latestCheckpointId'),
        )
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing WorkflowCheckpoint fields`,
        );
      }
    }

    if (sourceSchemaVersion >= DELIVERY_PACKAGE_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.deliveryPackage) ||
        !state.deliveryPackages ||
        typeof state.deliveryPackages !== 'object' ||
        Array.isArray(state.deliveryPackages) ||
        Object.values(state.executionPlans).some(
          (plan) =>
            !Array.isArray(plan.deliveryPackageRefs) ||
            !Object.prototype.hasOwnProperty.call(plan, 'latestDeliveryPackageId'),
        )
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing DeliveryPackage fields`,
        );
      }
    }

    if (sourceSchemaVersion >= DELIVERY_PACKAGE_ACCEPTANCE_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.deliveryPackageAcceptance) ||
        !state.deliveryPackageAcceptances ||
        typeof state.deliveryPackageAcceptances !== 'object' ||
        Array.isArray(state.deliveryPackageAcceptances)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing DeliveryPackageAcceptance fields`,
        );
      }
    }

    if (sourceSchemaVersion >= MISSION_CLOSE_OUT_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.missionCloseOut) ||
        !state.missionCloseOuts ||
        typeof state.missionCloseOuts !== 'object' ||
        Array.isArray(state.missionCloseOuts)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing MissionCloseOut fields`,
        );
      }
    }

    if (sourceSchemaVersion >= LEARNING_CANDIDATE_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.learningCandidate) ||
        !state.learningCandidates ||
        typeof state.learningCandidates !== 'object' ||
        Array.isArray(state.learningCandidates)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing LearningCandidate fields`,
        );
      }
    }

    if (sourceSchemaVersion >= LEARNING_CANDIDATE_REVIEW_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.learningCandidateReview) ||
        !state.learningCandidateReviews ||
        typeof state.learningCandidateReviews !== 'object' ||
        Array.isArray(state.learningCandidateReviews)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing LearningCandidateReview fields`,
        );
      }
    }

    if (sourceSchemaVersion >= MEMORY_ITEM_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.memoryItem) ||
        !state.memoryItems ||
        typeof state.memoryItems !== 'object' ||
        Array.isArray(state.memoryItems)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing MemoryItem fields`,
        );
      }
    }

    if (sourceSchemaVersion >= MEMORY_RECALL_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.memoryRecall) ||
        !state.memoryRecalls ||
        typeof state.memoryRecalls !== 'object' ||
        Array.isArray(state.memoryRecalls)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing MemoryRecall fields`,
        );
      }
    }

    if (sourceSchemaVersion >= ACCEPTANCE_CRITERION_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.acceptanceCriterion) ||
        !Number.isInteger(state.sequences?.verificationProof) ||
        !state.acceptanceCriteria ||
        typeof state.acceptanceCriteria !== 'object' ||
        Array.isArray(state.acceptanceCriteria) ||
        !state.verificationProofs ||
        typeof state.verificationProofs !== 'object' ||
        Array.isArray(state.verificationProofs) ||
        Object.values(state.workOrders).some(
          (workOrder) => !Array.isArray(workOrder.acceptanceCriterionRefs),
        )
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing AcceptanceCriterion fields`,
        );
      }
    }

    if (sourceSchemaVersion >= STAFFING_PLAN_STATE_SCHEMA_VERSION) {
      if (
        !Number.isInteger(state.sequences?.staffingPlan) ||
        !state.staffingPlans ||
        typeof state.staffingPlans !== 'object' ||
        Array.isArray(state.staffingPlans)
      ) {
        throw new Error(
          `Runtime state schemaVersion ${sourceSchemaVersion} is missing StaffingPlan fields`,
        );
      }
    }

    const emptyState = createEmptyState();
    const normalizedState = {
      ...emptyState,
      ...state,
      sequences: {
        ...emptyState.sequences,
        ...(state.sequences || {}),
      },
      missions: state.missions || {},
      councilSessions: state.councilSessions || {},
      projects: state.projects || {},
      tasks: state.tasks || {},
      runs: state.runs || {},
      artifacts: state.artifacts || {},
      decisionInboxItems: state.decisionInboxItems || {},
      approvals: state.approvals || {},
      proposalRecords: state.proposalRecords || {},
      proposalApplicationAttempts: state.proposalApplicationAttempts || {},
      proposalSourceMutations: state.proposalSourceMutations || {},
      executionPlans: state.executionPlans || {},
      workOrders: state.workOrders || {},
      handoffPackets: state.handoffPackets || {},
      workflowCheckpoints: state.workflowCheckpoints || {},
      deliveryPackages: state.deliveryPackages || {},
      deliveryPackageAcceptances: state.deliveryPackageAcceptances || {},
      missionCloseOuts: state.missionCloseOuts || {},
      learningCandidates: state.learningCandidates || {},
      learningCandidateReviews: state.learningCandidateReviews || {},
      memoryItems: state.memoryItems || {},
      memoryRecalls: state.memoryRecalls || {},
      acceptanceCriteria: state.acceptanceCriteria || {},
      verificationProofs: state.verificationProofs || {},
      staffingPlans: state.staffingPlans || {},
    };

    if (sourceSchemaVersion < ACCEPTANCE_CRITERION_STATE_SCHEMA_VERSION) {
      for (const workOrder of Object.values(normalizedState.workOrders)) {
        workOrder.acceptanceCriterionRefs = [];
      }
    }

    if (sourceSchemaVersion < WORKFLOW_CHECKPOINT_STATE_SCHEMA_VERSION) {
      for (const executionPlan of Object.values(normalizedState.executionPlans)) {
        executionPlan.checkpointRefs = [];
        executionPlan.latestCheckpointId = null;
      }
    }

    if (sourceSchemaVersion < DELIVERY_PACKAGE_STATE_SCHEMA_VERSION) {
      for (const executionPlan of Object.values(normalizedState.executionPlans)) {
        executionPlan.deliveryPackageRefs = [];
        executionPlan.latestDeliveryPackageId = null;
      }
    }

    for (const mission of Object.values(normalizedState.missions)) {
      mission.goal = mission.goal || '';
      mission.constraints = mission.constraints || '';
      mission.status = mission.status || 'draft';

      if (mission.linkedTaskId === undefined) {
        mission.linkedTaskId = null;
      }

      if (mission.councilSessionId === undefined) {
        mission.councilSessionId = null;
      }
    }

    for (const councilSession of Object.values(normalizedState.councilSessions)) {
      councilSession.status = councilSession.status || 'pending-alignment';
      councilSession.participants = Array.isArray(councilSession.participants)
        ? councilSession.participants
        : [];
      councilSession.summary = councilSession.summary || '';
      councilSession.recommendation = councilSession.recommendation || '';
      councilSession.openQuestions = Array.isArray(councilSession.openQuestions)
        ? councilSession.openQuestions
        : [];
      councilSession.transcript = Array.isArray(councilSession.transcript)
        ? councilSession.transcript
        : [];
      councilSession.selectedPlan =
        councilSession.selectedPlan && typeof councilSession.selectedPlan === 'object'
          ? councilSession.selectedPlan
          : {
              scope: '',
              title: '',
            };
      councilSession.alignment =
        councilSession.alignment && typeof councilSession.alignment === 'object'
          ? {
              action: councilSession.alignment.action || null,
              decidedAt: councilSession.alignment.decidedAt || null,
              status: councilSession.alignment.status || 'pending',
            }
          : {
              action: null,
              decidedAt: null,
              status: 'pending',
            };
    }

    for (const task of Object.values(normalizedState.tasks)) {
      task.flags = {
        blocked: false,
        waitingApproval: false,
        waitingDecision: false,
        ...(task.flags || {}),
      };
      task.review = {
        required: true,
        status: REVIEW_STATUS.PENDING,
        inboxItemId: null,
        resolution: null,
        verificationArtifactIds: [],
        ...(task.review || {}),
      };
      task.review.verificationArtifactIds = task.review.verificationArtifactIds || [];
      task.artifactIds = task.artifactIds || [];

      if (task.worktreeRef === undefined) {
        task.worktreeRef = null;
      }

      if (task.missionId === undefined) {
        task.missionId = null;
      }
    }

    for (const artifact of Object.values(normalizedState.artifacts)) {
      const existingRetention =
        artifact.retention && typeof artifact.retention === 'object' ? artifact.retention : {};
      artifact.retention = {
        ...createDefaultArtifactRetentionState(),
        ...existingRetention,
        actionLog: Array.isArray(existingRetention.actionLog) ? existingRetention.actionLog : [],
      };
    }

    for (const proposalRecord of Object.values(normalizedState.proposalRecords)) {
      proposalRecord.sourceClaimIds = Array.isArray(proposalRecord.sourceClaimIds)
        ? proposalRecord.sourceClaimIds
        : [];
      proposalRecord.evidenceRefs = Array.isArray(proposalRecord.evidenceRefs)
        ? proposalRecord.evidenceRefs
        : [];
      proposalRecord.negativeEvidenceRefs = Array.isArray(proposalRecord.negativeEvidenceRefs)
        ? proposalRecord.negativeEvidenceRefs
        : [];
      proposalRecord.reviewerRefs = Array.isArray(proposalRecord.reviewerRefs)
        ? proposalRecord.reviewerRefs
        : [];
      proposalRecord.approvalRefs = Array.isArray(proposalRecord.approvalRefs)
        ? proposalRecord.approvalRefs
        : [];
      proposalRecord.applicationAttemptIds = Array.isArray(proposalRecord.applicationAttemptIds)
        ? proposalRecord.applicationAttemptIds
        : [];
      proposalRecord.affectedFiles = Array.isArray(proposalRecord.affectedFiles)
        ? proposalRecord.affectedFiles
        : [];
      proposalRecord.blockedActions = Array.isArray(proposalRecord.blockedActions)
        ? proposalRecord.blockedActions
        : [];
      proposalRecord.applyAllowed = false;
    }

    for (const proposalApplicationAttempt of Object.values(
      normalizedState.proposalApplicationAttempts,
    )) {
      proposalApplicationAttempt.applicationApprovalRefs = Array.isArray(
        proposalApplicationAttempt.applicationApprovalRefs,
      )
        ? proposalApplicationAttempt.applicationApprovalRefs
        : [];
      proposalApplicationAttempt.sourceEvidenceRefs = Array.isArray(
        proposalApplicationAttempt.sourceEvidenceRefs,
      )
        ? proposalApplicationAttempt.sourceEvidenceRefs
        : [];
      proposalApplicationAttempt.negativeEvidenceRefs = Array.isArray(
        proposalApplicationAttempt.negativeEvidenceRefs,
      )
        ? proposalApplicationAttempt.negativeEvidenceRefs
        : [];
      proposalApplicationAttempt.rollbackRefs = Array.isArray(
        proposalApplicationAttempt.rollbackRefs,
      )
        ? proposalApplicationAttempt.rollbackRefs
        : [];
      proposalApplicationAttempt.focusedSmokeRefs = Array.isArray(
        proposalApplicationAttempt.focusedSmokeRefs,
      )
        ? proposalApplicationAttempt.focusedSmokeRefs
        : [];
      proposalApplicationAttempt.blockedActions = Array.isArray(
        proposalApplicationAttempt.blockedActions,
      )
        ? proposalApplicationAttempt.blockedActions
        : [];
      proposalApplicationAttempt.proposalGenerationAllowed = false;
      proposalApplicationAttempt.providerCallsAllowed = false;
      proposalApplicationAttempt.memoryPersistenceAllowed = false;
      proposalApplicationAttempt.sourceMutationAllowed = false;
      proposalApplicationAttempt.commitAllowed = false;
      proposalApplicationAttempt.pushAllowed = false;
    }

    for (const proposalSourceMutation of Object.values(
      normalizedState.proposalSourceMutations,
    )) {
      proposalSourceMutation.sourceMutationApprovalRefs = Array.isArray(
        proposalSourceMutation.sourceMutationApprovalRefs,
      )
        ? proposalSourceMutation.sourceMutationApprovalRefs
        : [];
      proposalSourceMutation.mutationPlanRefs = Array.isArray(
        proposalSourceMutation.mutationPlanRefs,
      )
        ? proposalSourceMutation.mutationPlanRefs
        : [];
      proposalSourceMutation.sourceEvidenceRefs = Array.isArray(
        proposalSourceMutation.sourceEvidenceRefs,
      )
        ? proposalSourceMutation.sourceEvidenceRefs
        : [];
      proposalSourceMutation.negativeEvidenceRefs = Array.isArray(
        proposalSourceMutation.negativeEvidenceRefs,
      )
        ? proposalSourceMutation.negativeEvidenceRefs
        : [];
      proposalSourceMutation.rollbackRefs = Array.isArray(proposalSourceMutation.rollbackRefs)
        ? proposalSourceMutation.rollbackRefs
        : [];
      proposalSourceMutation.focusedSmokeRefs = Array.isArray(
        proposalSourceMutation.focusedSmokeRefs,
      )
        ? proposalSourceMutation.focusedSmokeRefs
        : [];
      proposalSourceMutation.blockedActions = Array.isArray(proposalSourceMutation.blockedActions)
        ? proposalSourceMutation.blockedActions
        : [];
      proposalSourceMutation.proposalGenerationAllowed = false;
      proposalSourceMutation.providerCallsAllowed = false;
      proposalSourceMutation.memoryPersistenceAllowed = false;
      proposalSourceMutation.sourceMutationOutsideNamedPathAllowed = false;
      proposalSourceMutation.commitAllowed = false;
      proposalSourceMutation.pushAllowed = false;
    }

    if (sourceSchemaVersion === MIGRATABLE_STATE_SCHEMA_VERSION) {
      bootstrapMigratedWorkflowCheckpoints(normalizedState);
    }

    normalizedState.schemaVersion = STATE_SCHEMA_VERSION;
    validateDurableWorkOrderRecords(normalizedState);
    validateAcceptanceCriterionRecords(normalizedState);
    validateVerificationProofRecords(normalizedState);
    for (const [key, plan] of Object.entries(normalizedState.executionPlans)) {
      const label = `ExecutionPlan ${key}`;
      assertStringArrayField(plan, 'checkpointRefs', label);
      if (new Set(plan.checkpointRefs).size !== plan.checkpointRefs.length) {
        throw new Error(`${label} has duplicate WorkflowCheckpoint references`);
      }
      if (
        plan.latestCheckpointId !== null &&
        (typeof plan.latestCheckpointId !== 'string' ||
          plan.latestCheckpointId !== plan.checkpointRefs.at(-1))
      ) {
        throw new Error(`${label} has invalid latestCheckpointId`);
      }
      if (plan.checkpointRefs.some((id) => !normalizedState.workflowCheckpoints[id])) {
        throw new Error(`${label} has missing WorkflowCheckpoint references`);
      }
      plan.checkpointRefs.forEach((id, index) => {
        const checkpoint = normalizedState.workflowCheckpoints[id];
        const expectedParentId = index === 0 ? null : plan.checkpointRefs[index - 1];
        if (
          checkpoint.attempt !== index + 1 ||
          checkpoint.resumedFromCheckpointId !== expectedParentId
        ) {
          throw new Error(`${label} has invalid WorkflowCheckpoint attempt history`);
        }
      });
      assertStringArrayField(plan, 'deliveryPackageRefs', label);
      if (
        plan.deliveryPackageRefs.length > 1 ||
        new Set(plan.deliveryPackageRefs).size !== plan.deliveryPackageRefs.length
      ) {
        throw new Error(`${label} has invalid DeliveryPackage references`);
      }
      if (
        plan.latestDeliveryPackageId !== null &&
        (typeof plan.latestDeliveryPackageId !== 'string' ||
          plan.latestDeliveryPackageId !== plan.deliveryPackageRefs.at(-1))
      ) {
        throw new Error(`${label} has invalid latestDeliveryPackageId`);
      }
      if (plan.deliveryPackageRefs.some((id) => !normalizedState.deliveryPackages[id])) {
        throw new Error(`${label} has missing DeliveryPackage references`);
      }
    }
    validateWorkflowCheckpointRecords(normalizedState);
    validateDeliveryPackageRecords(normalizedState);
    validateDeliveryPackageAcceptanceRecords(normalizedState);
    validateMissionCloseOutRecords(normalizedState);
    validateLearningCandidateRecords(normalizedState);
    validateLearningCandidateReviewRecords(normalizedState);
    validateMemoryItemRecords(normalizedState);
    validateMemoryRecallRecords(normalizedState);
    validateStaffingPlanRecords(normalizedState);
    return normalizedState;
  }

  function ensureDirs() {
    fs.mkdirSync(logsDir, { recursive: true });
    fs.mkdirSync(artifactsDir, { recursive: true });
    fs.mkdirSync(archivedArtifactsDir, { recursive: true });
    fs.mkdirSync(deletedArtifactsDir, { recursive: true });
  }

  function ensureStateFile() {
    ensureDirs();

    if (!fs.existsSync(statePath)) {
      try {
        fs.writeFileSync(
          statePath,
          `${JSON.stringify(createEmptyState(), null, 2)}\n`,
          { flag: 'wx', mode: 0o600 },
        );
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
    }
    assertRegularStateFile();
  }

  function loadState() {
    ensureStateFile();
    const sourceBytes = readStateBytes();
    const sourceState = JSON.parse(sourceBytes);
    const normalizedState = normalizeState(sourceState);
    if (sourceState.schemaVersion !== STATE_SCHEMA_VERSION) {
      const revision = writeStateAtomically(
        normalizedState,
        digestStateBytes(sourceBytes),
      );
      return attachStateRevision(normalizedState, revision);
    }
    return attachStateRevision(normalizedState, digestStateBytes(sourceBytes));
  }

  function loadStateReadonly() {
    if (!fs.existsSync(statePath)) {
      throw new Error('state file does not exist');
    }
    const sourceBytes = readStateBytes();
    const sourceState = JSON.parse(sourceBytes);
    if (sourceState.schemaVersion !== STATE_SCHEMA_VERSION) {
      throw new Error(`state must use current schema v${STATE_SCHEMA_VERSION}`);
    }
    return attachStateRevision(normalizeState(sourceState), digestStateBytes(sourceBytes));
  }

  function loadStateSupportedReadonly() {
    if (!fs.existsSync(statePath)) {
      throw new Error('state file does not exist');
    }
    const sourceBytes = readStateBytes();
    return attachStateRevision(
      normalizeState(JSON.parse(sourceBytes)),
      digestStateBytes(sourceBytes),
    );
  }

  function writeStateAtomically(state, expectedRevision) {
    ensureDirs();
    const lock = acquireStateLock();
    const temporaryStatePath = `${statePath}.tmp-${process.pid}-${crypto.randomBytes(8).toString('hex')}`;
    try {
      const currentBytes = readStateBytes();
      if (expectedRevision !== digestStateBytes(currentBytes)) {
        throw new StateConflictError(
          'Runtime state changed after it was loaded; retry from current state',
        );
      }
      const nextBytes = `${JSON.stringify(state, null, 2)}\n`;
      const flags =
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_WRONLY |
        (fs.constants.O_NOFOLLOW || 0);
      const descriptor = fs.openSync(temporaryStatePath, flags, 0o600);
      try {
        fs.writeFileSync(descriptor, nextBytes);
        fs.fsyncSync(descriptor);
      } finally {
        fs.closeSync(descriptor);
      }
      fs.renameSync(temporaryStatePath, statePath);
      return digestStateBytes(nextBytes);
    } finally {
      fs.rmSync(temporaryStatePath, { force: true });
      releaseStateLock(lock);
    }
  }

  function saveState(state) {
    const expectedRevision = state?.[STATE_REVISION];
    if (!expectedRevision) {
      throw new StateConflictError('Runtime state must be loaded before it can be saved');
    }
    const revision = writeStateAtomically(normalizeState(state), expectedRevision);
    attachStateRevision(state, revision);
  }

  function appendLogRecord(runId, record) {
    ensureDirs();
    const logPath = path.join(logsDir, `${runId}.jsonl`);
    fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`);
    return logPath;
  }

  function readLogRecords(runId) {
    const logPath = path.join(logsDir, `${runId}.jsonl`);

    if (!fs.existsSync(logPath)) {
      return [];
    }

    return fs
      .readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  function writeArtifact(filename, content) {
    ensureDirs();
    const artifactPath = path.join(artifactsDir, filename);
    fs.writeFileSync(artifactPath, content);
    return artifactPath;
  }

  function resolveArtifactPath(location) {
    if (path.isAbsolute(location)) {
      return location;
    }

    return path.join(artifactsDir, location);
  }

  function readArtifact(location) {
    const artifactPath = resolveArtifactPath(location);
    return fs.readFileSync(artifactPath, 'utf8');
  }

  function writeArtifactAtPath(artifactPath, content) {
    ensureDirs();
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(artifactPath, content);
    return artifactPath;
  }

  function moveArtifactToArchive(artifactPath) {
    ensureDirs();
    const resolvedSource = resolveArtifactPath(artifactPath);
    const targetPath = path.join(archivedArtifactsDir, path.basename(resolvedSource));

    if (resolvedSource === targetPath) {
      return targetPath;
    }

    fs.rmSync(targetPath, { force: true });
    fs.renameSync(resolvedSource, targetPath);
    return targetPath;
  }

  function moveArtifactToDeleted(artifactPath) {
    ensureDirs();
    const resolvedSource = resolveArtifactPath(artifactPath);
    const targetPath = path.join(deletedArtifactsDir, path.basename(resolvedSource));

    if (resolvedSource === targetPath) {
      return targetPath;
    }

    fs.rmSync(targetPath, { force: true });
    fs.renameSync(resolvedSource, targetPath);
    return targetPath;
  }

  function removeArtifactAtPath(artifactPath) {
    const resolvedPath = resolveArtifactPath(artifactPath);
    fs.rmSync(resolvedPath, { force: true });
    return resolvedPath;
  }

  function reset() {
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
    ensureStateFile();
  }

  return {
    appendLogRecord,
    archivedArtifactsDir,
    artifactsDir,
    deletedArtifactsDir,
    loadState,
    loadStateReadonly,
    loadStateSupportedReadonly,
    logsDir,
    moveArtifactToArchive,
    moveArtifactToDeleted,
    readArtifact,
    readLogRecords,
    removeArtifactAtPath,
    resolveArtifactPath,
    reset,
    runtimeRoot,
    saveState,
    statePath,
    stateLockPath,
    writeArtifact,
    writeArtifactAtPath,
  };
}

module.exports = {
  StateConflictError,
  StateLockTimeoutError,
  createFileStore,
};
