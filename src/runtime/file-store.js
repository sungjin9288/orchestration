'use strict';

const fs = require('fs');
const path = require('path');

const { RETENTION_CONSUMER_STATUS, REVIEW_STATUS, createEmptyState } = require('./contracts');

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

    normalizedState.schemaVersion = emptyState.schemaVersion;
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
