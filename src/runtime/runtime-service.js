'use strict';

const fs = require('fs');
const path = require('path');

const {
  APPROVAL_STATUS,
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

  function recalculateTaskFlags(task, state) {
    const pendingDecisionItems = Object.values(state.decisionInboxItems).filter(
      (item) =>
        item.taskId === task.id &&
        item.kind === DECISION_INBOX_KIND.DECISION &&
        item.status === DECISION_INBOX_STATUS.PENDING,
    );
    const pendingApprovals = Object.values(state.approvals).filter(
      (approval) => approval.taskId === task.id && approval.status === APPROVAL_STATUS.PENDING,
    );

    task.flags.blocked = pendingDecisionItems.some((item) => item.blocksTask);
    task.flags.waitingDecision = pendingDecisionItems.length > 0;
    task.flags.waitingApproval = pendingApprovals.length > 0;
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

  function resolveDecisionInboxItem(input) {
    const state = store.loadState();
    const item = assertDecisionInboxItem(input.itemId, state);
    const task = assertTask(item.taskId, state);
    const now = new Date().toISOString();

    if (!input.action) {
      throw new Error('Resolution action is required');
    }

    item.status = DECISION_INBOX_STATUS.RESOLVED;
    item.resolution = {
      action: input.action,
      note: input.note || '',
      resolvedAt: now,
    };
    item.updatedAt = now;

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

  function createApprovalPlaceholder(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);
    const now = new Date().toISOString();
    const approvalId = nextId(state, 'approval');
    const inboxItemId = nextId(state, 'decisionInboxItem');

    state.approvals[approvalId] = {
      id: approvalId,
      projectId: task.projectId,
      taskId: task.id,
      scope: input.scope || 'commit',
      status: APPROVAL_STATUS.PENDING,
      placeholder: true,
      allowedNextAction: input.allowedNextAction || 'commit',
      inboxItemId,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    };

    createDecisionInboxItemRecord(state, {
      id: inboxItemId,
      taskId: task.id,
      kind: DECISION_INBOX_KIND.APPROVAL,
      title: input.title || `Approval required: ${state.approvals[approvalId].scope}`,
      prompt:
        input.prompt ||
        `Approval required before ${state.approvals[approvalId].allowedNextAction}.`,
      sourceType: DECISION_INBOX_KIND.APPROVAL,
      sourceId: approvalId,
      blocksTask: false,
      now,
    });

    recalculateTaskFlags(task, state);
    task.updatedAt = now;
    store.saveState(state);

    return state.approvals[approvalId];
  }

  function startPlaceholderRun(input) {
    const state = store.loadState();
    const task = assertTask(input.taskId, state);

    const id = nextId(state, 'run');
    const now = new Date().toISOString();
    const logPath = path.join(store.logsDir, `${id}.jsonl`);

    state.runs[id] = {
      id,
      taskId: task.id,
      kind: 'placeholder',
      status: RUN_STATUS.RUNNING,
      startedAt: now,
      finishedAt: null,
      logPath,
    };

    task.latestRunId = id;
    task.lifecycleState = TASK_LIFECYCLE.IN_PROGRESS;
    task.updatedAt = now;

    store.saveState(state);

    return state.runs[id];
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
    const filename = `${id}.md`;
    const content = input.content || `# ${id}\n`;
    const artifactPath = store.writeArtifact(filename, content);

    state.artifacts[id] = {
      id,
      taskId: task.id,
      runId: run.id,
      type: 'output',
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
    const pendingReviewItem = findPendingReviewItem(task.id, state);

    run.status = RUN_STATUS.COMPLETED;
    run.finishedAt = now;
    task.lifecycleState = TASK_LIFECYCLE.REVIEW;
    task.review.status = REVIEW_STATUS.PENDING;
    task.review.inboxItemId = pendingReviewItem ? pendingReviewItem.id : null;

    if (!pendingReviewItem) {
      const reviewItem = createDecisionInboxItemRecord(state, {
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

    store.saveState(state);

    return {
      run,
      task,
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
    createApprovalPlaceholder,
    createDecisionInboxItem,
    createProject,
    createTask,
    finishRunWithReviewPending,
    getArtifact,
    getDecisionInboxItem,
    getLogs,
    getProject,
    getRun,
    getSnapshot,
    getTask,
    listDecisionInboxItems,
    recordArtifact,
    resolveDecisionInboxItem,
    resetRuntime,
    startPlaceholderRun,
  };
}

module.exports = {
  createRuntimeService,
};
