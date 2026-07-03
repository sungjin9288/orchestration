'use strict';

const fs = require('fs');
const path = require('path');

const {
  APPROVAL_STATUS,
  ARTIFACT_CATALOG,
  ARTIFACT_RETENTION_TIER,
  BUILDER_ACTION,
  COMMIT_ACTION,
  DECISION_INBOX_ALLOWED_KIND_BY_SOURCE_TYPE,
  DECISION_INBOX_KIND,
  DECISION_INBOX_SOURCE_TYPE,
  DECISION_INBOX_STATUS,
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
} = require('./contracts');
const { createFileStore } = require('./file-store');
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
  buildBuilderPreflightGuardSummary,
  buildLatestApprovalDisplayStatus,
  buildTaskBreakerGuardSummary,
  compareRecordsByCreatedDesc,
  computeTaskGateState,
  evaluateLatestApprovalForAction,
  evaluateLatestBuilderPreflightProvenance,
  findLatestTaskArtifactMeta,
  getApprovalMetadata,
  isBuilderLiveMutationApprovalConsumed,
  listActiveTaskGates,
  listPendingBlockingDecisionItems,
  listTaskApprovals,
  recalculateTaskFlags,
  sameExactStringArrays,
  uniqueReasons,
} = require('./task-gates');
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
  const decisionInboxKinds = new Set(Object.values(DECISION_INBOX_KIND));
  const decisionInboxSourceTypes = new Set(Object.values(DECISION_INBOX_SOURCE_TYPE));
  const proposalRecordTypes = new Set(Object.values(PROPOSAL_RECORD_TYPE));
  const proposalRecordRiskClasses = new Set(Object.values(PROPOSAL_RECORD_RISK_CLASS));

  function nextId(state, entity) {
    state.sequences[entity] += 1;
    return `${entity}-${String(state.sequences[entity]).padStart(4, '0')}`;
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

  function assertRun(runId, state) {
    const run = state.runs[runId];

    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    return run;
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

  function compareRunsByStartedDesc(left, right) {
    const leftValue = left.startedAt || '';
    const rightValue = right.startedAt || '';

    if (leftValue === rightValue) {
      return String(right.id || '').localeCompare(String(left.id || ''));
    }

    return rightValue.localeCompare(leftValue);
  }

  function getLatestPreflightContext(task, state) {
    const artifact = findLatestTaskArtifactMeta(task, state, 'preflight');
    const run = artifact?.runId ? assertRun(artifact.runId, state) : null;

    return {
      artifact,
      run,
    };
  }

  function findLatestSuccessfulBuilderLiveMutationRun(task, state, filters = {}) {
    return (
      Object.values(state.runs)
        .filter((run) => {
          const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
          const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : null;

          if (
            run.taskId !== task.id ||
            run.role !== 'builder' ||
            run.status !== RUN_STATUS.COMPLETED ||
            (summary?.executionMode !== 'live-mutation' && metadata?.executionMode !== 'live-mutation') ||
            summary?.error
          ) {
            return false;
          }

          if (
            filters.preflightArtifactId &&
            summary?.preflightArtifactId !== filters.preflightArtifactId
          ) {
            return false;
          }

          if (filters.preflightRunId && summary?.preflightRunId !== filters.preflightRunId) {
            return false;
          }

          if (filters.approvalId && summary?.approvalId !== filters.approvalId) {
            return false;
          }

          return Boolean(
            summary?.artifactIds &&
              summary.artifactIds.changeSummary &&
              summary.artifactIds.patch &&
              summary.artifactIds.diff,
          );
        })
        .sort(compareRunsByStartedDesc)[0] || null
    );
  }

  function evaluateCurrentBuilderLiveMutationProvenance(task, state) {
    const builderPreflightProvenance = evaluateLatestBuilderPreflightProvenance(task, state);
    const currentPreflight = getLatestPreflightContext(task, state);
    const currentPreflightRun = currentPreflight.run;
    const preflightSummary =
      currentPreflightRun?.summary && typeof currentPreflightRun.summary === 'object'
        ? currentPreflightRun.summary
        : {};
    const inputArtifactIds = Array.isArray(preflightSummary.inputArtifactIds)
      ? preflightSummary.inputArtifactIds
      : [];
    const inputRunIds = Array.isArray(preflightSummary.inputRunIds) ? preflightSummary.inputRunIds : [];
    const latestPlanArtifact = builderPreflightProvenance.latestPlanArtifact;
    const latestArchitectureArtifact = builderPreflightProvenance.latestArchitectureArtifact;
    const latestBreakdownArtifact = builderPreflightProvenance.latestBreakdownArtifact;
    const hasMatchingPreflightProvenance =
      Boolean(currentPreflight.artifact) &&
      Boolean(currentPreflightRun) &&
      Boolean(latestPlanArtifact?.runId) &&
      Boolean(latestArchitectureArtifact?.runId) &&
      Boolean(latestBreakdownArtifact?.runId) &&
      preflightSummary.planArtifactId === latestPlanArtifact.id &&
      preflightSummary.planRunId === latestPlanArtifact.runId &&
      preflightSummary.architectureArtifactId === latestArchitectureArtifact.id &&
      preflightSummary.architectureRunId === latestArchitectureArtifact.runId &&
      preflightSummary.breakdownArtifactId === latestBreakdownArtifact.id &&
      preflightSummary.breakdownRunId === latestBreakdownArtifact.runId &&
      sameExactStringArrays(inputArtifactIds, [
        latestPlanArtifact.id,
        latestArchitectureArtifact.id,
        latestBreakdownArtifact.id,
      ]) &&
      sameExactStringArrays(inputRunIds, [
        latestPlanArtifact.runId,
        latestArchitectureArtifact.runId,
        latestBreakdownArtifact.runId,
      ]);

    return {
      currentPreflight,
      hasMatchingBreakdownProvenance: builderPreflightProvenance.hasMatchingBreakdownProvenance,
      hasMatchingPlanArchitectureProvenance:
        builderPreflightProvenance.hasMatchingArchitecturePlanProvenance,
      hasMatchingPreflightProvenance,
      latestArchitectureArtifact,
      latestBreakdownArtifact,
      latestPlanArtifact,
    };
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

  function buildBuilderLiveMutationApprovalRequestSummary(task, state) {
    const provenance = evaluateCurrentBuilderLiveMutationProvenance(task, state);
    const currentPreflight = provenance.currentPreflight;
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const approvalEvaluation = evaluateLatestApprovalForAction({
      action: BUILDER_ACTION.LIVE_MUTATION,
      currentPreflight,
      requireCurrentPreflightTarget: true,
      state,
      task,
    });
    const existingSuccessfulRun =
      currentPreflight.artifact && currentPreflight.run
        ? findLatestSuccessfulBuilderLiveMutationRun(task, state, {
            preflightArtifactId: currentPreflight.artifact.id,
            preflightRunId: currentPreflight.run.id,
          })
        : null;
    const reasons = [];
    let conflict = false;

    if (!currentPreflight.artifact || !currentPreflight.run) {
      reasons.push('latest preflight artifact required');
    }

    if (pendingBlockingDecisionItems.length > 0) {
      reasons.push(
        `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
      );
    }

    if (
      currentPreflight.artifact &&
      (!provenance.hasMatchingPlanArchitectureProvenance ||
        !provenance.hasMatchingBreakdownProvenance ||
        !provenance.hasMatchingPreflightProvenance)
    ) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} does not match the current latest plan-plus-architecture-plus-breakdown provenance chain`,
      );
    }

    if (existingSuccessfulRun) {
      conflict = true;
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} already has successful builder live mutation run ${existingSuccessfulRun.id}`,
      );
    }

    if (approvalEvaluation.latestApproval && !approvalEvaluation.stale) {
      if (approvalEvaluation.latestApproval.status === APPROVAL_STATUS.PENDING) {
        conflict = true;
        reasons.push(
          `latest approval ${approvalEvaluation.latestApproval.id} for ${BUILDER_ACTION.LIVE_MUTATION} is already pending for preflight ${approvalEvaluation.currentPreflightArtifactId}`,
        );
      }

      if (approvalEvaluation.latestApproval.status === APPROVAL_STATUS.APPROVED) {
        conflict = true;
        reasons.push(
          `latest approval ${approvalEvaluation.latestApproval.id} for ${BUILDER_ACTION.LIVE_MUTATION} already covers preflight ${approvalEvaluation.currentPreflightArtifactId}`,
        );
      }
    }

    return {
      allowed: reasons.length === 0,
      approvalStale: approvalEvaluation.stale,
      conflict,
      currentPreflightArtifactId: approvalEvaluation.currentPreflightArtifactId,
      currentPreflightRunId: approvalEvaluation.currentPreflightRunId,
      existingSuccessfulBuilderRunId: existingSuccessfulRun?.id || null,
      latestApprovalDisplayStatus: buildLatestApprovalDisplayStatus(approvalEvaluation),
      latestApprovalId: approvalEvaluation.latestApproval?.id || null,
      latestApprovalStatus: approvalEvaluation.latestApproval?.status || null,
      pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
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

    const resolvedProjectPath = path.resolve(project.projectPath);
    const targetPath = path.resolve(resolvedProjectPath, relativePath);

    if (
      targetPath !== resolvedProjectPath &&
      !targetPath.startsWith(`${resolvedProjectPath}${path.sep}`)
    ) {
      throw new Error('mutation.relativePath must stay inside the project path');
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
    const now = new Date().toISOString();

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

  function approveCouncilRecommendation(input) {
    const state = store.loadState();
    const mission = assertMission(input.missionId, state);

    if (!mission.councilSessionId) {
      throw new Error(`Mission ${mission.id} does not have a council session`);
    }

    const councilSession = assertCouncilSession(mission.councilSessionId, state);
    const now = new Date().toISOString();

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
    return normalizeMissionsInState(state);
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
    createApprovalPlaceholder,
    createCouncilSessionForMission,
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
    finishRunWithReviewPending,
    getArtifact,
    getApproval,
    getCouncilSession,
    getDecisionInboxItem,
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
    listApprovals,
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
    startRun,
    startPlaceholderRun,
    syncMissionExecutionStateFromTask,
    transitionTaskLifecycle,
  };
}

module.exports = {
  createRuntimeService,
};
