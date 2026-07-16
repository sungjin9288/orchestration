'use strict';

const crypto = require('crypto');

const {
  WORKFLOW_CHECKPOINT_ACTION,
  WORKFLOW_CHECKPOINT_STAGE,
  WORKFLOW_CHECKPOINT_STATUS,
  WORKFLOW_TYPE,
} = require('./contracts');

const FAILED_WORK_ORDER_STATUSES = new Set([
  'blocked',
  'blocked-dependency',
  'cancelled',
  'changes-requested',
  'failed',
]);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function digest(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function uniqueSorted(values) {
  return [...new Set((values || []).filter(Boolean))].sort();
}

function nextAllowedActionsForStage(stage) {
  if (stage === WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY) {
    return [WORKFLOW_CHECKPOINT_ACTION.RESUME_REVIEWER];
  }
  if (stage === WORKFLOW_CHECKPOINT_STAGE.QA_READY) {
    return [WORKFLOW_CHECKPOINT_ACTION.RESUME_QA];
  }
  return [];
}

function buildCheckpointBindings(input) {
  const executionPlan = input.executionPlan;
  const workOrders = [...input.workOrders].sort(
    (left, right) => left.position - right.position || left.id.localeCompare(right.id),
  );
  const nextAllowedActions = nextAllowedActionsForStage(input.stage);
  const completedUnitRefs = workOrders
    .filter((workOrder) => workOrder.status === 'completed')
    .map((workOrder) => workOrder.id);
  const failedUnitRefs = workOrders
    .filter((workOrder) => FAILED_WORK_ORDER_STATUSES.has(workOrder.status))
    .map((workOrder) => workOrder.id);
  const pendingUnitRefs = workOrders
    .filter(
      (workOrder) =>
        !completedUnitRefs.includes(workOrder.id) && !failedUnitRefs.includes(workOrder.id),
    )
    .map((workOrder) => workOrder.id);
  const runRefs = uniqueSorted([
    ...(executionPlan.runRefs || []),
    ...workOrders.flatMap((workOrder) => workOrder.runRefs || []),
  ]);
  const artifactRefs = uniqueSorted([
    ...(executionPlan.artifactRefs || []),
    ...workOrders.flatMap((workOrder) => workOrder.artifactRefs || []),
  ]);
  const approvalRefs = uniqueSorted([
    executionPlan.approvalId,
    executionPlan.terminalGateApprovalId,
    ...workOrders.flatMap((workOrder) => workOrder.approvalRefs || []),
  ]);
  const orderedWorkOrders = workOrders.map((workOrder) => ({
    id: workOrder.id,
    role: workOrder.role,
    position: workOrder.position,
    status: workOrder.status,
    dependencyIds: workOrder.dependencyIds || [],
    runRefs: workOrder.runRefs || [],
    artifactRefs: workOrder.artifactRefs || [],
    approvalRefs: workOrder.approvalRefs || [],
    changedFiles: workOrder.changedFiles || [],
  }));
  const inputDigest = digest({
    sourceDigest: executionPlan.sourceDigest,
    compileSpecDigest: executionPlan.compileSpecDigest,
    stage: input.stage,
    workOrders: orderedWorkOrders,
    completedUnitRefs,
    pendingUnitRefs,
    failedUnitRefs,
    runRefs,
    artifactRefs,
    approvalRefs,
  });
  const authorityDigest = digest({
    provider: {
      mode: input.projectProvider?.mode || null,
      adapter: input.projectProvider?.adapter || null,
    },
    nextAllowedActions,
    nonGoals: executionPlan.nonGoals || [],
    workOrders: workOrders.map((workOrder) => ({
      id: workOrder.id,
      role: workOrder.role,
      authority: workOrder.authority || {},
      targetPathAllowlist: workOrder.targetPathAllowlist || [],
      verificationCommands: workOrder.verificationCommands || [],
      expectedArtifacts: workOrder.expectedArtifacts || [],
      stopConditions: workOrder.stopConditions || [],
    })),
  });

  return {
    sourceDigest: executionPlan.sourceDigest,
    inputDigest,
    authorityDigest,
    completedUnitRefs,
    pendingUnitRefs,
    failedUnitRefs,
    runRefs,
    artifactRefs,
    approvalRefs,
    nextAllowedActions,
  };
}

function immutableCheckpointPayload(checkpoint) {
  return {
    id: checkpoint.id,
    projectId: checkpoint.projectId,
    missionId: checkpoint.missionId,
    executionPlanId: checkpoint.executionPlanId,
    workflowType: checkpoint.workflowType,
    stage: checkpoint.stage,
    attempt: checkpoint.attempt,
    sourceDigest: checkpoint.sourceDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    completedUnitRefs: checkpoint.completedUnitRefs,
    pendingUnitRefs: checkpoint.pendingUnitRefs,
    failedUnitRefs: checkpoint.failedUnitRefs,
    runRefs: checkpoint.runRefs,
    artifactRefs: checkpoint.artifactRefs,
    approvalRefs: checkpoint.approvalRefs,
    nextAllowedActions: checkpoint.nextAllowedActions,
    resumedFromCheckpointId: checkpoint.resumedFromCheckpointId,
    createdAt: checkpoint.createdAt,
  };
}

function createWorkflowCheckpoint(input) {
  const bindings = buildCheckpointBindings(input);
  const checkpoint = {
    id: input.id,
    projectId: input.executionPlan.projectId,
    missionId: input.executionPlan.missionId,
    executionPlanId: input.executionPlan.id,
    workflowType: WORKFLOW_TYPE.REVIEWED_DELIVERY,
    stage: input.stage,
    attempt: input.attempt,
    status:
      input.stage === WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY
        ? WORKFLOW_CHECKPOINT_STATUS.TERMINAL
        : WORKFLOW_CHECKPOINT_STATUS.READY,
    ...bindings,
    resumedFromCheckpointId: input.resumedFromCheckpointId || null,
    stopReason: input.stopReason || null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
  checkpoint.checkpointDigest = digest(immutableCheckpointPayload(checkpoint));
  return checkpoint;
}

function recomputeWorkflowCheckpoint(checkpoint, input) {
  const bindings = buildCheckpointBindings({
    ...input,
    stage: checkpoint.stage,
  });
  return {
    ...bindings,
    checkpointDigest: digest(immutableCheckpointPayload(checkpoint)),
    current:
      bindings.sourceDigest === checkpoint.sourceDigest &&
      bindings.inputDigest === checkpoint.inputDigest &&
      bindings.authorityDigest === checkpoint.authorityDigest &&
      digest(immutableCheckpointPayload(checkpoint)) === checkpoint.checkpointDigest,
  };
}

module.exports = {
  buildCheckpointBindings,
  createWorkflowCheckpoint,
  digest,
  recomputeWorkflowCheckpoint,
};
