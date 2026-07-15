'use strict';

const fs = require('fs');
const path = require('path');

const {
  EXECUTION_PLAN_STATUS,
  MIGRATABLE_STATE_SCHEMA_VERSION,
  RETENTION_CONSUMER_STATUS,
  REVIEW_STATUS,
  STATE_SCHEMA_VERSION,
  WORK_ORDER_STATUS,
  createEmptyState,
} = require('./contracts');

function assertStringField(record, field, label) {
  if (typeof record[field] !== 'string' || !record[field]) {
    throw new Error(`${label} is missing ${field}`);
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
    for (const field of ['dependencyIds', 'runRefs', 'artifactRefs']) {
      assertStringArrayField(workOrder, field, label);
    }
    if (!workOrderStatuses.has(workOrder.status)) throw new Error(`${label} has invalid status`);
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

function createFileStore(options = {}) {
  const runtimeRoot = options.runtimeRoot || path.join(process.cwd(), 'var', 'runtime');
  const statePath = path.join(runtimeRoot, 'state.json');
  const logsDir = path.join(runtimeRoot, 'logs');
  const artifactsDir = path.join(runtimeRoot, 'artifacts');
  const archivedArtifactsDir = path.join(artifactsDir, 'archive');
  const deletedArtifactsDir = path.join(artifactsDir, 'deleted');

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
      sourceSchemaVersion !== MIGRATABLE_STATE_SCHEMA_VERSION &&
      sourceSchemaVersion !== STATE_SCHEMA_VERSION
    ) {
      throw new Error(`Unsupported runtime state schemaVersion: ${sourceSchemaVersion}`);
    }

    if (sourceSchemaVersion === STATE_SCHEMA_VERSION) {
      const requiredSequences = ['executionPlan', 'workOrder', 'handoffPacket'];
      const requiredMaps = ['executionPlans', 'workOrders', 'handoffPackets'];
      if (
        !state.sequences ||
        requiredSequences.some((key) => !Number.isInteger(state.sequences[key])) ||
        requiredMaps.some(
          (key) => !state[key] || typeof state[key] !== 'object' || Array.isArray(state[key]),
        )
      ) {
        throw new Error('Runtime state schemaVersion 7 is missing durable WorkOrder fields');
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
    };

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

    normalizedState.schemaVersion = STATE_SCHEMA_VERSION;
    validateDurableWorkOrderRecords(normalizedState);
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
      fs.writeFileSync(statePath, `${JSON.stringify(createEmptyState(), null, 2)}\n`);
    }
  }

  function loadState() {
    ensureStateFile();
    return normalizeState(JSON.parse(fs.readFileSync(statePath, 'utf8')));
  }

  function saveState(state) {
    ensureDirs();
    const temporaryStatePath = `${statePath}.tmp-${process.pid}`;
    fs.writeFileSync(temporaryStatePath, `${JSON.stringify(normalizeState(state), null, 2)}\n`);
    fs.renameSync(temporaryStatePath, statePath);
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
    writeArtifact,
    writeArtifactAtPath,
  };
}

module.exports = {
  createFileStore,
};
