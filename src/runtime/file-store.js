'use strict';

const fs = require('fs');
const path = require('path');

const { REVIEW_STATUS, createEmptyState } = require('./contracts');

function createFileStore(options = {}) {
  const runtimeRoot = options.runtimeRoot || path.join(process.cwd(), 'var', 'runtime');
  const statePath = path.join(runtimeRoot, 'state.json');
  const logsDir = path.join(runtimeRoot, 'logs');
  const artifactsDir = path.join(runtimeRoot, 'artifacts');

  function normalizeState(state) {
    const emptyState = createEmptyState();
    const normalizedState = {
      ...emptyState,
      ...state,
      sequences: {
        ...emptyState.sequences,
        ...(state.sequences || {}),
      },
      projects: state.projects || {},
      tasks: state.tasks || {},
      runs: state.runs || {},
      artifacts: state.artifacts || {},
      decisionInboxItems: state.decisionInboxItems || {},
      approvals: state.approvals || {},
    };

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
    }

    normalizedState.schemaVersion = emptyState.schemaVersion;
    return normalizedState;
  }

  function ensureDirs() {
    fs.mkdirSync(logsDir, { recursive: true });
    fs.mkdirSync(artifactsDir, { recursive: true });
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
    fs.writeFileSync(statePath, `${JSON.stringify(normalizeState(state), null, 2)}\n`);
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

  function readArtifact(filename) {
    const artifactPath = path.join(artifactsDir, filename);
    return fs.readFileSync(artifactPath, 'utf8');
  }

  function reset() {
    fs.rmSync(runtimeRoot, { recursive: true, force: true });
    ensureStateFile();
  }

  return {
    appendLogRecord,
    artifactsDir,
    loadState,
    logsDir,
    readArtifact,
    readLogRecords,
    reset,
    runtimeRoot,
    saveState,
    statePath,
    writeArtifact,
  };
}

module.exports = {
  createFileStore,
};
