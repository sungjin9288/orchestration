'use strict';

const fs = require('fs');
const path = require('path');

const {
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

    run.status = RUN_STATUS.COMPLETED;
    run.finishedAt = now;
    task.lifecycleState = TASK_LIFECYCLE.REVIEW;
    task.review.status = REVIEW_STATUS.PENDING;
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
    createProject,
    createTask,
    finishRunWithReviewPending,
    getArtifact,
    getLogs,
    getProject,
    getRun,
    getSnapshot,
    getTask,
    recordArtifact,
    resetRuntime,
    startPlaceholderRun,
  };
}

module.exports = {
  createRuntimeService,
};
