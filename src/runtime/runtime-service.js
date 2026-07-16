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
  EXECUTION_PLAN_STATUS,
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
  TASK_LIFECYCLE,
  WORK_ORDER_ACTION,
  WORK_ORDER_STATUS,
  WORKFLOW_CHECKPOINT_ACTION,
  WORKFLOW_CHECKPOINT_STAGE,
  WORKFLOW_CHECKPOINT_STATUS,
} = require('./contracts');
const { createFileStore } = require('./file-store');
const { readCompanyBlueprintStatus } = require('./company-blueprint');
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
  assertExecutionPlan,
  assertHandoffPacket,
  assertRun,
  assertWorkOrder,
  assertWorkflowCheckpoint,
} = require('./assertions');
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
  const companyRuntime = options.companyBlueprintPath
    ? readCompanyBlueprintStatus({
        blueprintPath: options.companyBlueprintPath,
        repoRoot: options.companyRepoRoot,
      })
    : null;
  const councilCoordinator = createCouncilCoordinator({
    adapter: options.councilAdapter || createCouncilLocalStubAdapter(),
  });
  const councilLiveAdapter =
    options.councilLiveAdapter ||
    createCouncilOpenAIResponsesAdapter({ repoRoot: options.companyRepoRoot });
  const councilLiveCoordinator = createCouncilCoordinator({ adapter: councilLiveAdapter });
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

  function getMissionWorkOrderCompilerInput(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);

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

  function digestCompileSpec(compileSpec) {
    return crypto.createHash('sha256').update(JSON.stringify(compileSpec)).digest('hex');
  }

  function getExecutionPlanBundleFromState(state, executionPlanId) {
    const executionPlan = assertExecutionPlan(executionPlanId, state);
    const workOrders = executionPlan.workOrderIds.map((id) => assertWorkOrder(id, state));
    const handoffPackets = executionPlan.handoffPacketIds.map((id) =>
      assertHandoffPacket(id, state));
    const workflowCheckpoints = executionPlan.checkpointRefs.map((id) =>
      assertWorkflowCheckpoint(id, state));

    return {
      executionPlan,
      workOrders,
      handoffPackets,
      workflowCheckpoints,
      latestCheckpoint: executionPlan.latestCheckpointId
        ? assertWorkflowCheckpoint(executionPlan.latestCheckpointId, state)
        : null,
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
        classification === WORKFLOW_CHECKPOINT_STATUS.READY && current
          ? latestCheckpoint.nextAllowedActions
          : [],
      stopReason: stopReason || null,
    });
  }

  function getExecutionPlanRecovery(executionPlanId) {
    return buildExecutionPlanRecoveryFromState(store.loadState(), executionPlanId);
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

  function beginReviewedDeliveryContinuation(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, terminalGateApproval, byRole } = bundle;
    const requestedApprovalId = String(input.terminalGateApprovalId || '').trim();
    const requestedSourceDigest = String(input.sourceDigest || '').trim();

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
    appendWorkflowCheckpoint(
      state,
      bundle,
      WORKFLOW_CHECKPOINT_STAGE.REVIEWER_READY,
      {
        createdAt: now,
        resumedFromCheckpointId,
        stopReason: 'builder-completed-reviewer-ready',
      },
    );
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function beginReviewedDeliveryReviewer(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole } = bundle;
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

    if (reviewStatus === REVIEW_STATUS.PASSED && !decisionInboxItem) {
      byRole.reviewer.status = WORK_ORDER_STATUS.COMPLETED;
      byRole.qa.status = WORK_ORDER_STATUS.QUEUED;
      byRole.qa.authority = { ...byRole.qa.authority, executeAllowed: true };
      byRole.qa.updatedAt = now;
      executionPlan.activeWorkOrderId = byRole.qa.id;
      executionPlan.stopReason = null;
      executionPlan.stoppedAt = null;
      appendWorkflowCheckpoint(state, bundle, WORKFLOW_CHECKPOINT_STAGE.QA_READY, {
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

    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function beginReviewedDeliveryQa(input) {
    const state = store.loadState();
    const bundle = getReviewedDeliveryRoleBundle(state, input.executionPlanId);
    const { executionPlan, byRole } = bundle;
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
      !sameExactStringArrays(evidence.changedFiles || [], byRole.builder.changedFiles || [])
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
    if (passed) {
      byRole.qa.status = WORK_ORDER_STATUS.COMPLETED;
      executionPlan.status = EXECUTION_PLAN_STATUS.DELIVERY_READY;
      executionPlan.stopReason = null;
      executionPlan.stoppedAt = 'response-only-delivery-package-preview';
      executionPlan.deliveryReadyAt = now;
      appendWorkflowCheckpoint(state, bundle, WORKFLOW_CHECKPOINT_STAGE.DELIVERY_READY, {
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
    store.saveState(state);
    return getExecutionPlanBundleFromState(state, executionPlan.id);
  }

  function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    for (const child of Object.values(value)) deepFreeze(child);
    return Object.freeze(value);
  }

  function previewExecutionPlanDelivery(input) {
    const state = store.loadState();
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
    return deepFreeze({
      id: `delivery-package-preview-${idDigest}`,
      missionId: mission.id,
      executionPlanId: executionPlan.id,
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
        durablePersistenceAllowed: false,
        missionDoneAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
        releaseAllowed: false,
        memoryPersistenceAllowed: false,
        schedulingAllowed: false,
        providerExpansionAllowed: false,
      },
      sourceDigest: executionPlan.sourceDigest,
      generatedAt: qaArtifact.createdAt,
      persisted: false,
      missionDone: false,
    });
  }

  function persistMissionWorkOrderPlan(input) {
    const state = store.loadState();
    const councilSession = assertCouncilSession(input.councilSessionId, state);
    const mission = assertMission(councilSession.missionId, state);
    const project = assertProject(mission.projectId, state);

    if (companyRuntime?.status !== 'ready' || !companyRuntime.blueprint) {
      throw new Error('CompanyBlueprint must be ready before WorkOrder persistence');
    }
    assertRealCouncilSourceCurrent(councilSession, mission, project);

    const preview = compileMissionWorkOrderPreview({
      mission,
      project,
      councilSession,
      companyBlueprint: companyRuntime.blueprint,
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

    const existing = Object.values(state.executionPlans).find(
      (entry) => entry.councilSessionId === councilSession.id,
    );
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

  function beginSequentialWorkOrderExecution(input) {
    const state = store.loadState();
    const executionPlan = assertExecutionPlan(input.executionPlanId, state);
    const approval = assertApproval(input.approvalId, state);
    const mission = assertMission(executionPlan.missionId, state);
    const project = assertProject(executionPlan.projectId, state);
    const councilSession = assertCouncilSession(executionPlan.councilSessionId, state);

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
      appendWorkflowCheckpoint(
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
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);
    const project = assertProject(mission.projectId, state);
    const now = new Date().toISOString();

    if (input.mode && input.mode !== REAL_COUNCIL_MODE) {
      throw new Error(`Unsupported Council mode: ${input.mode}`);
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
      now,
    });

    councilCoordinator.runAttempt({
      session: councilSession,
      blueprint: companyRuntime.blueprint,
      projectPack: project.pack,
      now,
    });

    state.councilSessions[councilSession.id] = councilSession;
    mission.councilSessionId = councilSession.id;
    mission.status = 'aligning';
    mission.updatedAt = now;
    state.activeProjectId = mission.projectId;
    state.selectedMissionId = mission.id;
    store.saveState(state);

    return {
      councilSession: state.councilSessions[councilSession.id],
      mission: state.missions[mission.id],
    };
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

  function resolveDecisionInboxItem(input) {
    const state = store.loadState();
    const item = assertDecisionInboxItem(input.itemId, state);
    const task = assertTask(item.taskId, state);
    const now = new Date().toISOString();

    if (!input.action) {
      throw new Error('Resolution action is required');
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
    const state = store.loadState();
    normalizeProjectsInState(state);
    const snapshot = normalizeMissionsInState(state);

    return companyRuntime
      ? {
          ...snapshot,
          companyRuntime,
        }
      : snapshot;
  }

  function resetRuntime() {
    store.reset();
  }

  return {
    appendLog,
    approveCouncilRecommendation,
    assertTaskCanRunBuilderLiveMutation,
    assertTaskCanRunBuilderPreflight,
    assertTaskCanRunTaskBreaker,
    completeRun,
    completeReviewedDeliveryBuilder,
    completeReviewedDeliveryQa,
    completeReviewedDeliveryReviewer,
    cancelExecutionPlanCheckpoint,
    beginReviewedDeliveryContinuation,
    beginReviewedDeliveryQa,
    beginReviewedDeliveryReviewer,
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
    failSequentialWorkOrderExecution,
    failReviewedDeliveryContinuation,
    finalizeSequentialWorkOrderExecution,
    finishRunWithReviewPending,
    getArtifact,
    getApproval,
    getCouncilSession,
    getCouncilProviderReadiness,
    getDecisionInboxItem,
    getExecutionPlan,
    getExecutionPlanRecovery,
    getLogs,
    getMission,
    getProposalApplicationAttempt,
    getProposalSourceMutation,
    getProposalRecord,
    getProject,
    getRun,
    getSnapshot,
    getTask,
    getTaskGuardSummary,
    previewRetentionConsumer,
    preflightMissionWorkOrderPreview,
    previewMissionWorkOrders,
    previewExecutionPlanDelivery,
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
    recordArtifact,
    requestBuilderLiveMutationApproval,
    resolveReview,
    resolveDecisionInboxItem,
    resetRuntime,
    setProjectProviderConfig,
    setTaskWorktreeRef,
    selectMission,
    selectProject,
    startRealCouncilForMission,
    startProviderCouncilForMission,
    startRun,
    startPlaceholderRun,
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
