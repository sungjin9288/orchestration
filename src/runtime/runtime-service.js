'use strict';

const fs = require('fs');
const path = require('path');

const {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  COMMIT_ACTION,
  DECISION_INBOX_KIND,
  DECISION_INBOX_STATUS,
  PACKS,
  REVIEW_STATUS,
  RUN_STATUS,
  TASK_LIFECYCLE,
} = require('./contracts');
const { createFileStore } = require('./file-store');

function createRuntimeService(options = {}) {
  const store = createFileStore(options);

  function nextId(state, entity) {
    state.sequences[entity] += 1;
    return `${entity}-${String(state.sequences[entity]).padStart(4, '0')}`;
  }

  function assertProject(projectId, state) {
    const project = state.projects[projectId];

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return project;
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

  function compareRecordsByCreatedDesc(left, right) {
    const leftValue = left.createdAt || '';
    const rightValue = right.createdAt || '';

    if (leftValue === rightValue) {
      return String(right.id || '').localeCompare(String(left.id || ''));
    }

    return rightValue.localeCompare(leftValue);
  }

  function listTaskApprovals(taskId, state) {
    return Object.values(state.approvals).filter((approval) => approval.taskId === taskId);
  }

  function listPendingBlockingDecisionItems(taskId, state) {
    return Object.values(state.decisionInboxItems).filter(
      (item) =>
        item.taskId === taskId &&
        item.status === DECISION_INBOX_STATUS.PENDING &&
        item.kind === DECISION_INBOX_KIND.DECISION &&
        item.blocksTask,
    );
  }

  function findLatestTaskArtifactMeta(task, state, type) {
    const artifactIds = Array.isArray(task.artifactIds) ? [...task.artifactIds].reverse() : [];

    for (const artifactId of artifactIds) {
      const artifact = state.artifacts[artifactId];

      if (artifact && artifact.type === type) {
        return artifact;
      }
    }

    return null;
  }

  function getLatestPreflightContext(task, state) {
    const artifact = findLatestTaskArtifactMeta(task, state, 'preflight');
    const run = artifact?.runId ? assertRun(artifact.runId, state) : null;

    return {
      artifact,
      run,
    };
  }

  function uniqueReasons(reasons) {
    return [...new Set(reasons.filter(Boolean))];
  }

  function readStoredArtifactContent(artifact) {
    if (!artifact) {
      return '';
    }

    return store.readArtifact(path.basename(artifact.path));
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

  function normalizeRelativeArtifactPath(value) {
    const normalized = String(value || '')
      .trim()
      .replace(/\\/g, '/')
      .replace(/^\.\//, '');

    if (
      !normalized ||
      path.posix.isAbsolute(normalized) ||
      normalized === '..' ||
      normalized.startsWith('../') ||
      normalized.includes('/../')
    ) {
      return null;
    }

    return normalized;
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

  function computeTaskGateState(task, state) {
    const pendingDecisionItems = Object.values(state.decisionInboxItems).filter(
      (item) =>
        item.taskId === task.id &&
        item.kind === DECISION_INBOX_KIND.DECISION &&
        item.status === DECISION_INBOX_STATUS.PENDING,
    );
    const taskApprovals = listTaskApprovals(task.id, state);
    const pendingApprovals = taskApprovals.filter(
      (approval) => approval.status === APPROVAL_STATUS.PENDING,
    );

    return {
      pendingDecisionItems,
      pendingApprovals,
      taskApprovals,
      flags: {
        blocked: pendingDecisionItems.some((item) => item.blocksTask),
        waitingDecision: pendingDecisionItems.length > 0,
        waitingApproval: pendingApprovals.length > 0,
      },
    };
  }

  function applyTaskGateFlags(task, gateState) {
    task.flags.blocked = gateState.flags.blocked;
    task.flags.waitingDecision = gateState.flags.waitingDecision;
    task.flags.waitingApproval = gateState.flags.waitingApproval;
  }

  function recalculateTaskFlags(task, state) {
    applyTaskGateFlags(task, computeTaskGateState(task, state));
  }

  function listActiveTaskGates(gateState) {
    const activeGates = [];

    if (gateState.flags.blocked) {
      activeGates.push('blocked');
    }

    if (gateState.flags.waitingDecision) {
      activeGates.push('waitingDecision');
    }

    if (gateState.flags.waitingApproval) {
      activeGates.push('waitingApproval');
    }

    return activeGates;
  }

  function evaluateLatestApprovalForAction(input) {
    const task = input.task;
    const state = input.state;
    const action = input.action;
    const currentPreflight = input.currentPreflight || null;
    const requireCurrentPreflightTarget = Boolean(input.requireCurrentPreflightTarget);
    const latestApproval =
      listTaskApprovals(task.id, state)
        .filter((approval) => approval.allowedNextAction === action)
        .sort(compareRecordsByCreatedDesc)[0] || null;
    const reasons = [];
    let stale = false;

    if (!latestApproval) {
      reasons.push(`latest approval for ${action} is missing`);
    } else {
      if (latestApproval.status === APPROVAL_STATUS.PENDING) {
        reasons.push(`latest approval ${latestApproval.id} for ${action} is pending`);
      }

      if (latestApproval.status === APPROVAL_STATUS.REJECTED) {
        reasons.push(`latest approval ${latestApproval.id} for ${action} is rejected`);
      }

      if (requireCurrentPreflightTarget && currentPreflight?.artifact) {
        const targetArtifactId = latestApproval.targetArtifactId || null;
        const targetRunId = latestApproval.targetRunId || null;
        const currentArtifactId = currentPreflight.artifact.id;
        const currentRunId = currentPreflight.run?.id || null;

        if (targetArtifactId !== currentArtifactId || targetRunId !== currentRunId) {
          stale = true;
          reasons.push(
            `latest approval ${latestApproval.id} for ${action} is stale for preflight ${currentArtifactId}`,
          );
        }
      }
    }

    return {
      action,
      allowed:
        Boolean(latestApproval) &&
        latestApproval.status === APPROVAL_STATUS.APPROVED &&
        (!requireCurrentPreflightTarget || !stale),
      currentPreflightArtifactId: currentPreflight?.artifact?.id || null,
      currentPreflightRunId: currentPreflight?.run?.id || null,
      latestApproval: latestApproval || null,
      reasons: uniqueReasons(reasons),
      stale,
    };
  }

  function buildLatestApprovalDisplayStatus(approvalEvaluation) {
    if (approvalEvaluation.stale) {
      return 'stale';
    }

    return approvalEvaluation.latestApproval?.status || 'none';
  }

  function buildTaskBreakerGuardSummary(task, state) {
    const latestPlanArtifact = findLatestTaskArtifactMeta(task, state, 'plan');
    const latestArchitectureArtifact = findLatestTaskArtifactMeta(task, state, 'architecture');
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
    const reasons = [];

    if (!latestPlanArtifact) {
      reasons.push('latest plan artifact required');
    }

    if (!latestArchitectureArtifact) {
      reasons.push('latest architecture artifact required');
    }

    if (pendingBlockingDecisionItems.length > 0) {
      reasons.push(
        `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
      );
    }

    if (pendingApprovals.length > 0) {
      reasons.push(`pending approvals: ${pendingApprovals.map((item) => item.id).join(', ')}`);
    }

    return {
      allowed: reasons.length === 0,
      latestArchitectureArtifactId: latestArchitectureArtifact?.id || null,
      latestPlanArtifactId: latestPlanArtifact?.id || null,
      pendingApprovalIds: pendingApprovals.map((approval) => approval.id),
      pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
      reasons: uniqueReasons(reasons),
    };
  }

  function buildBuilderPreflightGuardSummary(task, state) {
    const latestPlanArtifact = findLatestTaskArtifactMeta(task, state, 'plan');
    const latestArchitectureArtifact = findLatestTaskArtifactMeta(task, state, 'architecture');
    const latestBreakdownArtifact = findLatestTaskArtifactMeta(task, state, 'breakdown');
    const latestPreflightArtifact = findLatestTaskArtifactMeta(task, state, 'preflight');
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
    const reasons = [];

    if (!latestPlanArtifact) {
      reasons.push('latest plan artifact required');
    }

    if (!latestArchitectureArtifact) {
      reasons.push('latest architecture artifact required');
    }

    if (!latestBreakdownArtifact) {
      reasons.push('latest breakdown artifact required');
    }

    if (pendingBlockingDecisionItems.length > 0) {
      reasons.push(
        `blocking decision items: ${pendingBlockingDecisionItems.map((item) => item.id).join(', ')}`,
      );
    }

    if (pendingApprovals.length > 0) {
      reasons.push(`pending approvals: ${pendingApprovals.map((item) => item.id).join(', ')}`);
    }

    return {
      allowed: reasons.length === 0,
      latestArchitectureArtifactId: latestArchitectureArtifact?.id || null,
      latestBreakdownArtifactId: latestBreakdownArtifact?.id || null,
      latestPlanArtifactId: latestPlanArtifact?.id || null,
      latestPreflightArtifactId: latestPreflightArtifact?.id || null,
      pendingApprovalIds: pendingApprovals.map((approval) => approval.id),
      pendingBlockingDecisionItemIds: pendingBlockingDecisionItems.map((item) => item.id),
      reasons: uniqueReasons(reasons),
    };
  }

  function buildBuilderLiveMutationGuardSummary(task, state) {
    const currentPreflight = getLatestPreflightContext(task, state);
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const pendingApprovals = computeTaskGateState(task, state).pendingApprovals;
    const approvalEvaluation = evaluateLatestApprovalForAction({
      action: BUILDER_ACTION.LIVE_MUTATION,
      currentPreflight,
      requireCurrentPreflightTarget: true,
      state,
      task,
    });
    const latestPlanArtifact = findLatestTaskArtifactMeta(task, state, 'plan');
    const latestArchitectureArtifact = findLatestTaskArtifactMeta(task, state, 'architecture');
    const latestBreakdownArtifact = findLatestTaskArtifactMeta(task, state, 'breakdown');
    const targetFiles = currentPreflight.artifact
      ? parseArtifactPathList(currentPreflight.artifact, 'Target Files')
      : [];
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
      latestPlanArtifact &&
      latestPlanArtifact.createdAt > currentPreflight.artifact.createdAt
    ) {
      reasons.push(`latest preflight ${currentPreflight.artifact.id} is stale for current plan`);
    }

    if (
      currentPreflight.artifact &&
      latestArchitectureArtifact &&
      latestArchitectureArtifact.createdAt > currentPreflight.artifact.createdAt
    ) {
      reasons.push(
        `latest preflight ${currentPreflight.artifact.id} is stale for current architecture`,
      );
    }

    if (
      currentPreflight.artifact &&
      latestBreakdownArtifact &&
      latestBreakdownArtifact.createdAt > currentPreflight.artifact.createdAt
    ) {
      reasons.push(`latest preflight ${currentPreflight.artifact.id} is stale for current breakdown`);
    }

    reasons.push(...approvalEvaluation.reasons);

    return {
      allowed: reasons.length === 0 && approvalEvaluation.allowed,
      approvalStale: approvalEvaluation.stale,
      currentPreflightArtifactId: approvalEvaluation.currentPreflightArtifactId,
      currentPreflightRunId: approvalEvaluation.currentPreflightRunId,
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
    const currentPreflight = getLatestPreflightContext(task, state);
    const pendingBlockingDecisionItems = listPendingBlockingDecisionItems(task.id, state);
    const approvalEvaluation = evaluateLatestApprovalForAction({
      action: BUILDER_ACTION.LIVE_MUTATION,
      currentPreflight,
      requireCurrentPreflightTarget: true,
      state,
      task,
    });
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
    const kind = input.kind || DECISION_INBOX_KIND.DECISION;
    const id = input.id || nextId(state, 'decisionInboxItem');
    const now = input.now || new Date().toISOString();

    if (!input.title) {
      throw new Error('Decision inbox item title is required');
    }

    state.decisionInboxItems[id] = {
      id,
      projectId: task.projectId,
      taskId: task.id,
      kind,
      status: DECISION_INBOX_STATUS.PENDING,
      title: input.title,
      prompt: input.prompt || '',
      blocksTask: Boolean(input.blocksTask),
      sourceType: input.sourceType || kind,
      sourceId: input.sourceId || null,
      resolution: null,
      createdAt: now,
      updatedAt: now,
    };

    return state.decisionInboxItems[id];
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
        sourceType: DECISION_INBOX_KIND.REVIEW,
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

    if (!input.name) {
      throw new Error('Project name is required');
    }

    if (!input.projectPath) {
      throw new Error('project_path is required');
    }

    if (!fs.existsSync(projectPath)) {
      throw new Error(`project_path does not exist: ${projectPath}`);
    }

    const id = nextId(state, 'project');
    const now = new Date().toISOString();

    state.projects[id] = {
      id,
      name: input.name,
      projectPath,
      pack: PACKS.DEVELOPMENT,
      readiness: 'ready',
      createdAt: now,
      updatedAt: now,
    };
    state.activeProjectId = id;
    store.saveState(state);

    return state.projects[id];
  }

  function getProject(projectId) {
    const state = store.loadState();
    return assertProject(projectId, state);
  }

  function createTask(input) {
    const state = store.loadState();
    const project = assertProject(input.projectId, state);

    if (!input.title) {
      throw new Error('Task title is required');
    }

    const id = nextId(state, 'task');
    const now = new Date().toISOString();

    state.tasks[id] = {
      id,
      projectId: project.id,
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
    store.saveState(state);

    return state.tasks[id];
  }

  function getTask(taskId) {
    const state = store.loadState();
    return assertTask(taskId, state);
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
      sourceType: DECISION_INBOX_KIND.APPROVAL,
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
      type: input.type || 'output',
      path: artifactPath,
      createdAt,
    };

    task.artifactIds.push(id);
    task.updatedAt = createdAt;
    store.saveState(state);

    return state.artifacts[id];
  }

  function getArtifact(artifactId) {
    const state = store.loadState();
    const artifact = state.artifacts[artifactId];

    if (!artifact) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }

    return {
      ...artifact,
      content: store.readArtifact(path.basename(artifact.path)),
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
    return store.loadState();
  }

  function resetRuntime() {
    store.reset();
  }

  return {
    appendLog,
    assertTaskCanRunBuilderLiveMutation,
    assertTaskCanRunBuilderPreflight,
    assertTaskCanRunTaskBreaker,
    completeRun,
    createApprovalPlaceholder,
    createDecisionInboxItem,
    createProject,
    createTask,
    ensureCommitActionAllowed,
    finishRunWithReviewPending,
    getArtifact,
    getApproval,
    getDecisionInboxItem,
    getLogs,
    getProject,
    getRun,
    getSnapshot,
    getTask,
    getTaskGuardSummary,
    listApprovals,
    listDecisionInboxItems,
    listTaskGuardSummaries,
    openReviewGate,
    recordArtifact,
    requestBuilderLiveMutationApproval,
    resolveReview,
    resolveDecisionInboxItem,
    resetRuntime,
    startRun,
    startPlaceholderRun,
    transitionTaskLifecycle,
  };
}

module.exports = {
  createRuntimeService,
};
