const SURFACE_IDS = ['mission', 'council', 'execution', 'deliverables', 'taskboard', 'logs', 'artifacts', 'decision-inbox'];
const TASK_LIFECYCLE_ORDER = ['Inbox', 'In Progress', 'Review', 'Done'];

const state = {
  surface: 'mission',
  payload: null,
  loading: false,
  mutating: false,
  selectionSeeded: false,
  error: null,
  selectedMissionId: null,
  selectedTaskId: null,
  selectedRunId: null,
  selectedArtifactId: null,
  selectedInboxItemId: null,
  selectedRunLogs: null,
  selectedArtifact: null,
  selectedTaskBreakdownArtifact: null,
  selectedTaskPreflightArtifact: null,
  linkedWorktreeDraftSlug: '',
  projectDraftName: '',
  projectDraftPath: '',
  projectDraftProviderMode: 'local-stub',
  projectDraftProviderModel: '',
  projectDraftProviderApiKeyVar: '',
  projectProviderDraftProjectId: null,
  projectProviderDraftMode: 'local-stub',
  projectProviderDraftModel: '',
  projectProviderDraftApiKeyVar: '',
  missionDraftTitle: '',
  missionDraftGoal: '',
  missionDraftConstraints: '',
  taskDraftTitle: '',
  taskDraftIntent: '',
  timerId: null,
};

const elements = {
  refreshButton: document.querySelector('#refresh-button'),
  refreshStatus: document.querySelector('#refresh-status'),
  activeProjectName: document.querySelector('#active-project-name'),
  activeProjectPath: document.querySelector('#active-project-path'),
  runtimeRoot: document.querySelector('#runtime-root'),
  activeRunCount: document.querySelector('#active-run-count'),
  pendingGateCount: document.querySelector('#pending-gate-count'),
  surfaces: {
    mission: document.querySelector('#surface-mission'),
    council: document.querySelector('#surface-council'),
    execution: document.querySelector('#surface-execution'),
    deliverables: document.querySelector('#surface-deliverables'),
    taskboard: document.querySelector('#surface-taskboard'),
    logs: document.querySelector('#surface-logs'),
    artifacts: document.querySelector('#surface-artifacts'),
    'decision-inbox': document.querySelector('#surface-decision-inbox'),
  },
  navButtons: [...document.querySelectorAll('.nav-button')],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(value) {
  if (!value) {
    return 'Not recorded';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatWorktreeOptionLabel(option) {
  const parts = [option.branch || 'detached', option.path];

  if (option.isCurrentProjectPath) {
    parts.push('current project_path');
  }

  return parts.join(' · ');
}

function sortByCreatedDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

function createEmptyDerivedState() {
  return {
    activeProjectLinkedWorktrees: {
      error: null,
      notice: null,
      options: [],
      projectId: null,
      projectPath: null,
      resolvedProjectPath: null,
    },
    closeOutReadinessSummaries: {},
    commitExecutionReadinessSummaries: {},
    commitPackageReadinessSummaries: {},
    providerExecutionSummaries: {},
    releasePackageReadinessSummaries: {},
    reviewerReadinessSummaries: {},
    taskGuardSummaries: {},
  };
}

function getProjectProviderConfig(project) {
  const provider = project?.provider && typeof project.provider === 'object' ? project.provider : {};
  const env = provider.env && typeof provider.env === 'object' ? provider.env : {};
  const mode = provider.mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: mode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: mode === 'live' ? env.apiKeyVar || '' : '',
    },
    mode,
    model: mode === 'live' ? provider.model || '' : '',
  };
}

function getProviderExecutionSummary(project, data) {
  if (!project?.id) {
    return null;
  }

  return data.derived.providerExecutionSummaries?.[project.id] || null;
}

function syncProjectProviderDraft(project) {
  const config = getProjectProviderConfig(project);

  state.projectProviderDraftProjectId = project?.id || null;
  state.projectProviderDraftMode = config.mode;
  state.projectProviderDraftModel = config.model;
  state.projectProviderDraftApiKeyVar = config.env.apiKeyVar;
}

function getActivePayload() {
  return (
    state.payload || {
      artifactCatalog: {},
      derived: createEmptyDerivedState(),
      snapshot: {
        activeProjectId: null,
        selectedMissionId: null,
        missions: {},
        councilSessions: {},
        projects: {},
        tasks: {},
        runs: {},
        artifacts: {},
        decisionInboxItems: {},
        approvals: {},
      },
    }
  );
}

function getDerived() {
  const payload = getActivePayload();
  const snapshot = payload.snapshot;

  const projects = Object.values(snapshot.projects).sort(sortByCreatedDesc);
  const missions = Object.values(snapshot.missions || {}).sort(sortByCreatedDesc);
  const councilSessions = Object.values(snapshot.councilSessions || {}).sort(sortByCreatedDesc);
  const tasks = Object.values(snapshot.tasks).sort(sortByCreatedDesc);
  const runs = Object.values(snapshot.runs).sort(sortByCreatedDesc);
  const artifacts = Object.values(snapshot.artifacts).sort(sortByCreatedDesc);
  const inboxItems = Object.values(snapshot.decisionInboxItems).sort(sortByCreatedDesc);
  const approvals = Object.values(snapshot.approvals).sort(sortByCreatedDesc);

  const activeProject = snapshot.activeProjectId
    ? snapshot.projects[snapshot.activeProjectId] || null
    : null;

  const projectTasks = activeProject
    ? tasks.filter((task) => task.projectId === activeProject.id)
    : [];
  const projectMissions = activeProject
    ? missions.filter((mission) => mission.projectId === activeProject.id)
    : [];
  const projectCouncilSessions = activeProject
    ? councilSessions.filter((councilSession) => {
        const mission = snapshot.missions[councilSession.missionId];
        return mission && mission.projectId === activeProject.id;
      })
    : [];
  const projectRuns = activeProject
    ? runs.filter((run) => {
        const task = snapshot.tasks[run.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectArtifacts = activeProject
    ? artifacts.filter((artifact) => {
        const task = snapshot.tasks[artifact.taskId];
        return task && task.projectId === activeProject.id;
      })
    : [];
  const projectInboxItems = activeProject
    ? inboxItems.filter((item) => item.projectId === activeProject.id)
    : [];
  const projectApprovals = activeProject
    ? approvals.filter((approval) => approval.projectId === activeProject.id)
    : [];

  const taskMap = new Map(projectTasks.map((task) => [task.id, task]));
  const missionMap = new Map(projectMissions.map((mission) => [mission.id, mission]));
  const councilSessionMap = new Map(
    projectCouncilSessions.map((councilSession) => [councilSession.id, councilSession]),
  );
  const runMap = new Map(projectRuns.map((run) => [run.id, run]));
  const artifactMap = new Map(projectArtifacts.map((artifact) => [artifact.id, artifact]));
  const inboxItemMap = new Map(projectInboxItems.map((item) => [item.id, item]));

  return {
    artifactCatalog: payload.artifactCatalog || {},
    derived: payload.derived || createEmptyDerivedState(),
    councilSessions: projectCouncilSessions,
    missions: projectMissions,
    snapshot,
    activeProject,
    projects,
    councilSessionMap,
    missionMap,
    tasks: projectTasks,
    runs: projectRuns,
    artifacts: projectArtifacts,
    inboxItems: projectInboxItems,
    approvals: projectApprovals,
    taskMap,
    runMap,
    artifactMap,
    inboxItemMap,
  };
}

function getProjectBootstrapState(data) {
  if (data.projects.length === 0) {
    return {
      copy: 'Register the first project before task creation or execution.',
      title: 'First-Run Bootstrap',
    };
  }

  if (!data.activeProject) {
    return {
      copy: 'Select the current project before task creation or execution.',
      title: 'Project Selection Required',
    };
  }

  return {
    copy: 'The bootstrap path closes once a project is active. The next step is the first task.',
    title: 'Project Registry',
  };
}

function getMissionStatusTone(status) {
  if (status === 'completed') {
    return 'success';
  }

  if (status === 'blocked') {
    return 'danger';
  }

  if (status === 'aligning') {
    return 'warning';
  }

  if (status === 'executing') {
    return 'accent';
  }

  if (status === 'aligned') {
    return 'success';
  }

  return 'neutral';
}

function getCouncilStatusTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'pending-alignment') {
    return 'warning';
  }

  return 'neutral';
}

function getAlignmentTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  return 'warning';
}

function getProjectGateCopy(data, surfaceName) {
  if (data.projects.length === 0) {
    return `Register a project in Advanced Ops Mode before using ${surfaceName}.`;
  }

  return `Select the current project in Advanced Ops Mode before using ${surfaceName}.`;
}

function renderProjectGateSurface(title, copy) {
  return `
    <div class="surface-panel">
      <div class="empty-state empty-state-strong">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </div>
    </div>
  `;
}

function renderAdvancedOpsNotice(copy) {
  return `
    <section class="ops-mode-banner">
      <div class="card-title-row">
        <strong>Advanced Ops Mode</strong>
        ${createToken('detailed control', 'warning')}
      </div>
      <p class="detail-copy">${escapeHtml(copy)}</p>
    </section>
  `;
}

function getActiveProjectLinkedWorktreesState(data) {
  return data.derived.activeProjectLinkedWorktrees || createEmptyDerivedState().activeProjectLinkedWorktrees;
}

function buildLinkedWorktreeFallbackName(option) {
  const pathParts = String(option?.path || '')
    .split('/')
    .filter(Boolean);

  return option?.branch || pathParts[pathParts.length - 1] || 'linked-worktree';
}

function buildTaskWorktreeRelation(task, activeProjectLinkedWorktrees) {
  const matchedOption = task.worktreeRef
    ? (activeProjectLinkedWorktrees.options || []).find((option) => option.path === task.worktreeRef) || null
    : null;

  if (!task.worktreeRef) {
    return {
      copy: 'task.worktreeRef is not set.',
      label: 'worktree:not-set',
      status: 'not-set',
      switchOption: null,
      tone: 'neutral',
    };
  }

  if (matchedOption?.isCurrentProjectPath) {
    return {
      copy: 'task.worktreeRef matches the current active project_path.',
      label: 'worktree:matches-active-project',
      status: 'matches-active-project',
      switchOption: null,
      tone: 'success',
    };
  }

  if (matchedOption) {
    return {
      copy: `task.worktreeRef points to ${formatWorktreeOptionLabel(matchedOption)} while the active project_path remains ${activeProjectLinkedWorktrees.projectPath || 'unset'}.`,
      label: 'worktree:mismatch',
      status: 'mismatch',
      switchOption: matchedOption,
      tone: 'warning',
    };
  }

  if (activeProjectLinkedWorktrees.notice) {
    return {
      copy: `Linked worktree detection is unavailable for the current project_path. Stored task.worktreeRef is ${task.worktreeRef}.`,
      label: 'worktree:unavailable',
      status: 'unavailable',
      switchOption: null,
      tone: 'neutral',
    };
  }

  return {
    copy: 'Stored task.worktreeRef is outside the current detected linked worktree list.',
    label: 'worktree:outside-detected-list',
    status: 'outside-detected-list',
    switchOption: null,
    tone: 'warning',
  };
}

function renderLinkedWorktreeSwitchPanel(data, projectActionDisabled) {
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);

  if (!data.activeProject) {
    return `
      <section class="linked-worktree-panel relation-strip">
        <div class="card-title-row">
          <strong>Detected Linked Worktrees</strong>
          ${createToken('linked-worktrees:inactive', 'neutral')}
        </div>
        <p class="detail-copy">Select a registered project to inspect linked worktree roots.</p>
      </section>
    `;
  }

  const options = activeProjectLinkedWorktrees.options || [];
  const body = options.length
    ? options
        .map((option) => {
          const buttonLabel = option.isCurrentProjectPath ? 'Current Active Project' : 'Switch Active Project';

          return `
            <div class="linked-worktree-row relation-strip">
              <div class="card-title-row">
                <strong>${escapeHtml(option.branch || buildLinkedWorktreeFallbackName(option))}</strong>
                <div class="token-row">
                  ${option.isCurrentProjectPath ? createToken('active project_path', 'success') : ''}
                  ${
                    option.registeredProjectId
                      ? createToken(`registered:${option.registeredProjectName || option.registeredProjectId}`, 'neutral')
                      : createToken('unregistered', 'warning')
                  }
                </div>
              </div>
              <p class="detail-copy mono">${escapeHtml(option.path)}</p>
              <div class="form-actions">
                <button
                  class="secondary-button"
                  type="button"
                  data-action="switch-active-project-worktree"
                  data-path="${escapeHtml(option.path)}"
                  ${projectActionDisabled || option.isCurrentProjectPath ? 'disabled' : ''}
                >
                  ${buttonLabel}
                </button>
                <p class="form-help">${
                  option.registeredProjectId
                    ? 'Reuses the existing project select flow.'
                    : 'Reuses project registration, then makes the linked root active.'
                }</p>
              </div>
            </div>
          `;
        })
        .join('')
    : `
        <div class="empty-state empty-state-inline">
          <strong>No linked worktrees detected</strong>
          <p>${escapeHtml(activeProjectLinkedWorktrees.notice || 'This project currently exposes no dedicated linked worktree roots.')}</p>
        </div>
      `;

  return `
    <section class="linked-worktree-panel">
      <div class="panel-header panel-header-compact">
        <div>
          <h4>Detected Linked Worktrees</h4>
          <p class="panel-copy">Current active project 기준으로 detected linked roots만 보여준다. Main worktree는 여기서 제외된다.</p>
        </div>
      </div>
      <div class="linked-worktree-list">
        ${body}
      </div>
    </section>
  `;
}

function groupTasksByLifecycle(tasks) {
  const groups = new Map(TASK_LIFECYCLE_ORDER.map((stateName) => [stateName, []]));
  const extras = [];

  for (const task of tasks) {
    if (groups.has(task.lifecycleState)) {
      groups.get(task.lifecycleState).push(task);
      continue;
    }

    extras.push(task);
  }

  if (extras.length > 0) {
    groups.set('Other', extras);
  }

  return [...groups.entries()];
}

function getTaskApprovals(taskId, approvals) {
  return approvals.filter((approval) => approval.taskId === taskId);
}

function getTaskInboxItems(taskId, inboxItems) {
  return inboxItems.filter((item) => item.taskId === taskId);
}

function getTaskArtifacts(taskId, artifacts) {
  return artifacts.filter((artifact) => artifact.taskId === taskId);
}

function getTaskRuns(taskId, runs) {
  return runs.filter((run) => run.taskId === taskId).sort(sortByCreatedDesc);
}

function getLatestTaskArtifact(task, data, type = null) {
  const artifactIds = Array.isArray(task?.artifactIds) ? [...task.artifactIds].reverse() : [];

  for (const artifactId of artifactIds) {
    const artifact = data.artifactMap.get(artifactId);

    if (!artifact) {
      continue;
    }

    if (!type || artifact.type === type) {
      return artifact;
    }
  }

  return null;
}

function getPreferredTaskArtifact(task, data) {
  return (
    getLatestTaskArtifact(task, data, 'change-summary') ||
    getLatestTaskArtifact(task, data, 'diff') ||
    getLatestTaskArtifact(task, data, 'patch') ||
    getLatestTaskArtifact(task, data, 'preflight') ||
    getLatestTaskArtifact(task, data, 'breakdown') ||
    getLatestTaskArtifact(task, data, 'architecture') ||
    getLatestTaskArtifact(task, data)
  );
}

function getTaskApprovalSummary(task, approvals) {
  const taskApprovals = getTaskApprovals(task.id, approvals);

  return {
    total: taskApprovals.length,
    pending: taskApprovals.filter((approval) => approval.status === 'pending').length,
    approved: taskApprovals.filter((approval) => approval.status === 'approved').length,
    rejected: taskApprovals.filter((approval) => approval.status === 'rejected').length,
    actions: taskApprovals.map((approval) => approval.allowedNextAction).filter(Boolean),
  };
}

function getApprovalActionLabel(action) {
  if (!action) {
    return null;
  }

  if (action === 'builder-live-mutation') {
    return 'builder live mutation';
  }

  if (action === 'commit-intent') {
    return 'local commit';
  }

  if (action === 'release-ready') {
    return 'release package';
  }

  return action;
}

function describeApprovalTarget(approval, targetArtifact) {
  if (targetArtifact) {
    return `${targetArtifact.type} ${targetArtifact.id}`;
  }

  if (approval?.targetArtifactId) {
    return `artifact ${approval.targetArtifactId}`;
  }

  return 'the current bounded artifact';
}

function getTaskApprovalBridge(task, data) {
  if (!task) {
    return {
      actionLabel: null,
      bridgeCopy: 'No approval bridge exists yet for this mission.',
      currentApproval: null,
      currentGateItem: null,
      nextStepCopy: 'Next operator step: stay on Mission or Council until execution creates the first gate.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  const taskApprovals = getTaskApprovals(task.id, data.approvals).sort(sortByCreatedDesc);
  const taskItems = getTaskInboxItems(task.id, data.inboxItems).sort(sortByCreatedDesc);
  const currentGateItem = getPreferredTaskInboxItem(task.id, data);
  const pendingInboxItem =
    taskItems.find((item) => item.status === 'pending' && item.kind === 'approval') || null;
  const currentApproval =
    (pendingInboxItem?.sourceId
      ? taskApprovals.find((approval) => approval.id === pendingInboxItem.sourceId) || null
      : null) ||
    taskApprovals.find((approval) => approval.status === 'pending') ||
    taskApprovals[0] ||
    null;
  const targetArtifact = currentApproval?.targetArtifactId
    ? data.artifactMap.get(currentApproval.targetArtifactId) || null
    : null;
  const actionLabel = getApprovalActionLabel(currentApproval?.allowedNextAction);
  const targetLabel = describeApprovalTarget(currentApproval, targetArtifact);

  if (currentApproval) {
    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `Council approval already advanced this mission to preflight. The current human gate is ${currentApproval.id}, which approves builder live mutation against ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `Open Advanced Ops Mode -> Decision Inbox -> approve ${pendingInboxItem.id}, then return to Taskboard and run Live Mutation.`
          : 'Open Advanced Ops Mode and approve the current builder live mutation gate before running Live Mutation.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'builder-live-mutation'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id} already approved builder live mutation for ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: 'Open Advanced Ops Mode -> Taskboard and run Live Mutation.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `The current human gate is ${currentApproval.id}, which approves local commit intent against ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `Approve ${pendingInboxItem.id} on Execution, then return here for Resume Approved Local Commit when readiness turns green.`
          : 'Approve the current commit gate on Execution, then return here for Resume Approved Local Commit when readiness turns green.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'commit-intent'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id} already approved local commit intent for ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy:
          'Run Resume Approved Local Commit on Execution when the current commit bundle readiness is green.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'pending' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `The current human gate is ${currentApproval.id}, which approves release readiness against ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy: pendingInboxItem
          ? `Approve ${pendingInboxItem.id} on Execution, then return here for Resume Approved Close Out when readiness turns green.`
          : 'Approve the current release gate on Execution, then return here for Resume Approved Close Out when readiness turns green.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    if (
      currentApproval.status === 'approved' &&
      currentApproval.allowedNextAction === 'release-ready'
    ) {
      return {
        actionLabel,
        bridgeCopy: `${currentApproval.id} already approved release readiness for ${targetLabel}.`,
        currentApproval,
        currentGateItem,
        nextStepCopy:
          'Run Resume Approved Close Out on Execution when the current release bundle readiness is green.',
        pendingInboxItem,
        targetArtifact,
      };
    }

    return {
      actionLabel,
      bridgeCopy: `${currentApproval.id} is ${currentApproval.status} for ${actionLabel || currentApproval.scope || 'the current approval'}, targeting ${targetLabel}.`,
      currentApproval,
      currentGateItem,
      nextStepCopy: pendingInboxItem
        ? `Open Advanced Ops Mode -> Decision Inbox -> review ${pendingInboxItem.id}.`
        : 'Open Advanced Ops Mode and inspect the current approval record.',
      pendingInboxItem,
      targetArtifact,
    };
  }

  if (currentGateItem?.status === 'pending') {
    return {
      actionLabel: null,
      bridgeCopy: `${currentGateItem.id} is the current pending ${currentGateItem.kind} gate for this mission.`,
      currentApproval: null,
      currentGateItem,
      nextStepCopy: 'Open Advanced Ops Mode -> Decision Inbox and resolve the current gate.',
      pendingInboxItem: null,
      targetArtifact: null,
    };
  }

  return {
    actionLabel: null,
    bridgeCopy: 'No approval bridge is active right now.',
    currentApproval: null,
    currentGateItem,
    nextStepCopy: 'Stay on the primary surfaces until a new execution gate appears.',
    pendingInboxItem: null,
    targetArtifact: null,
  };
}

function getTaskDecisionSummary(task, inboxItems) {
  const taskItems = getTaskInboxItems(task.id, inboxItems);
  const pending = taskItems.filter((item) => item.status === 'pending');

  return {
    total: taskItems.length,
    pendingTotal: pending.length,
    pendingReview: pending.filter((item) => item.kind === 'review').length,
    pendingDecision: pending.filter((item) => item.kind === 'decision').length,
    pendingApproval: pending.filter((item) => item.kind === 'approval').length,
  };
}

function getPreferredTaskInboxItem(taskId, data) {
  const taskItems = getTaskInboxItems(taskId, data.inboxItems);
  const pendingApprovals = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'approval',
  );

  if (pendingApprovals.length > 0) {
    return pendingApprovals[0];
  }

  const pendingBlockingDecisions = taskItems.filter(
    (item) => item.status === 'pending' && item.kind === 'decision' && item.blocksTask,
  );

  if (pendingBlockingDecisions.length > 0) {
    return pendingBlockingDecisions[0];
  }

  const pendingItems = taskItems.filter((item) => item.status === 'pending');

  if (pendingItems.length > 0) {
    return pendingItems[0];
  }

  return taskItems[0] || null;
}

function getTaskBreakerAvailability(task, data) {
  const guardSummary = task ? data.derived?.taskGuardSummaries?.[task.id]?.taskBreaker || null : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

function getBuilderPreflightAvailability(task, data) {
  const guardSummary = task
    ? data.derived?.taskGuardSummaries?.[task.id]?.builderPreflight || null
    : null;
  const latestPlanArtifact = getLatestTaskArtifact(task, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(task, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(task, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(task, data, 'preflight');
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (guardSummary?.reasons?.length) {
    reasons.push(...guardSummary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: reasons.length > 0,
    latestArchitectureArtifact,
    latestBreakdownArtifact,
    latestPlanArtifact,
    latestPreflightArtifact,
    pendingApprovalIds: guardSummary?.pendingApprovalIds || [],
    pendingBlockingDecisionItemIds: guardSummary?.pendingBlockingDecisionItemIds || [],
    reasons: [...new Set(reasons)],
  };
}

function getBuilderLiveMutationSummaries(task, data) {
  const summaries = task ? data.derived?.taskGuardSummaries?.[task.id] || null : null;

  return {
    guardSummary: summaries?.builderLiveMutation || {
      allowed: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime guard unavailable'],
    },
    requestSummary: summaries?.builderLiveMutationApprovalRequest || {
      allowed: false,
      conflict: false,
      latestApprovalDisplayStatus: 'none',
      reasons: ['runtime request summary unavailable'],
    },
  };
}

function getReviewerAvailability(task, data) {
  const summary = task ? data.derived?.reviewerReadinessSummaries?.[task.id] || null : null;
  const reasons = [];

  if (!task) {
    reasons.push('select a task');
  }

  if (!summary) {
    reasons.push('reviewer readiness unavailable');
  } else if (!summary.allowed && summary.reasons?.length) {
    reasons.push(...summary.reasons);
  }

  if (state.loading || state.mutating) {
    reasons.push('wait for the current action to finish');
  }

  return {
    disabled: !summary?.allowed || reasons.length > 0,
    summary: summary || {
      allowed: false,
      reasons: ['reviewer readiness unavailable'],
    },
    reasons: [...new Set(reasons)],
  };
}

function getCommitApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovalStatus || 'none';
}

function getCommitPackageAvailability(task, data) {
  const summary = task ? data.derived?.commitPackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      currentCommitPackageArtifactId: null,
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestCommitPackageArtifactId: null,
      packageStale: false,
      reasons: ['commit-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getCommitExecutionAvailability(task, data) {
  const summary = task ? data.derived?.commitExecutionReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      changedFileCount: 0,
      commitMessagePresent: false,
      commitPackageArtifactId: null,
      conflict: false,
      existingCommitResultArtifactId: null,
      existingLocalCommitRunId: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      reasons: ['commit execution readiness unavailable'],
      repoChangeCountBeforeCommit: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getReleasePackageAvailability(task, data) {
  const summary = task ? data.derived?.releasePackageReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      latestApprovalDisplayStatus: 'none',
      latestApprovalId: null,
      latestApprovalStatus: null,
      latestReleasePackageArtifactId: null,
      packageStale: false,
      reasons: ['release-package readiness unavailable'],
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getCloseOutApprovalDisplayStatus(summary) {
  if (summary?.approvalStale) {
    return 'stale';
  }

  return summary?.latestApprovedReleaseApprovalStatus || 'none';
}

function getCloseOutAvailability(task, data) {
  const summary = task ? data.derived?.closeOutReadinessSummaries?.[task.id] || null : null;

  return {
    disabled: state.loading || state.mutating || !summary?.allowed,
    summary: summary || {
      allowed: false,
      approvalStale: false,
      commitPackageArtifactId: null,
      commitResultArtifactId: null,
      commitSha: null,
      conflict: false,
      currentReleasePackageArtifactId: null,
      deliveryStance: null,
      existingCloseOutArtifactId: null,
      existingCloseOutRunId: null,
      latestApprovedReleaseApprovalId: null,
      latestApprovedReleaseApprovalStatus: null,
      latestCloseOutArtifactId: null,
      latestReleasePackageArtifactId: null,
      reasons: ['close-out readiness unavailable'],
      repoClean: false,
      repoDirtyFileCount: null,
      repoStagedFileCount: null,
      repoUntrackedFileCount: null,
      sourceBuilderApprovalId: null,
      sourceBuilderRunId: null,
      sourceReviewArtifactId: null,
      sourceReviewerRunId: null,
      targetPreflightArtifactId: null,
      targetPreflightRunId: null,
    },
  };
}

function getMissionCompletionSummary(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;
  const latestCloseOutArtifact = linkedTask ? getLatestTaskArtifact(linkedTask, data, 'close-out') : null;
  const closeOutState = linkedTask ? getCloseOutAvailability(linkedTask, data) : null;
  const completionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState?.summary?.existingCloseOutArtifactId),
  );

  return {
    closeOutArtifactId:
      latestCloseOutArtifact?.id || closeOutState?.summary?.existingCloseOutArtifactId || null,
    closeOutState,
    completionReady,
    latestCloseOutArtifact,
    linkedTask,
    releasePackageArtifactId:
      closeOutState?.summary?.currentReleasePackageArtifactId ||
      closeOutState?.summary?.latestReleasePackageArtifactId ||
      null,
  };
}

function getMissionCouncilPreview(mission, data) {
  const councilSession =
    mission?.councilSessionId && data.councilSessionMap.has(mission.councilSessionId)
      ? data.councilSessionMap.get(mission.councilSessionId)
      : null;
  const alignmentStatus = councilSession?.alignment?.status || 'pending';
  const openQuestionsCount = Array.isArray(councilSession?.openQuestions)
    ? councilSession.openQuestions.length
    : 0;
  const participantCount = Array.isArray(councilSession?.participants)
    ? councilSession.participants.length
    : 0;
  const selectedPlanTitle = councilSession?.selectedPlan?.title || null;
  const recommendation = councilSession?.recommendation || null;
  const summary = councilSession?.summary || null;

  return {
    alignmentStatus,
    councilSession,
    openQuestionsCount,
    participantCount,
    previewLine: councilSession
      ? `${selectedPlanTitle || recommendation || summary || 'Recommendation ready'}. Alignment ${alignmentStatus}.`
      : 'No council recommendation recorded yet.',
    recommendationPreview: recommendation || summary || 'No recommendation recorded.',
    selectedPlanTitle: selectedPlanTitle || 'No selected plan recorded.',
    selectedPlanScope: councilSession?.selectedPlan?.scope || 'No selected scope recorded.',
  };
}

function getMissionExecutionPreview(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  if (!linkedTask) {
    return {
      actionLabel: null,
      approvalBridge: null,
      blockedReason: 'No linked task exists yet.',
      gatePreview: 'No execution gate is active because no linked task exists yet.',
      latestRun: null,
      latestRunNextStage: null,
      latestRunRole: null,
      linkedTask,
      preferredInboxItem: null,
      stagePreview: 'No execution run has been recorded yet.',
    };
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const blockedReason =
    preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? 'Builder live mutation approval is pending.'
        : linkedTask.flags?.waitingDecision
          ? 'A blocking decision is pending.'
          : linkedTask.flags?.blocked
            ? 'The linked task is currently blocked.'
            : 'No blocking reason is active.';

  return {
    actionLabel: approvalBridge.actionLabel || preferredInboxItem?.kind || null,
    approvalBridge,
    blockedReason,
    gatePreview: approvalBridge.bridgeCopy || 'No execution gate is active right now.',
    latestRun,
    latestRunNextStage,
    latestRunRole,
    linkedTask,
    preferredInboxItem,
    stagePreview: latestRun
      ? `Latest execution stage: ${latestRunRole}${
          latestRunNextStage ? ` -> ${latestRunNextStage}` : ''
        } (${latestRun.status}).`
      : 'No execution run has been recorded yet.',
  };
}

function getMissionDeliverablesPreview(mission, data) {
  const linkedTask =
    mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)
      ? data.taskMap.get(mission.linkedTaskId)
      : null;

  if (!linkedTask) {
    return {
      approvalSummary: { approved: 0, pending: 0, rejected: 0, total: 0 },
      currentDeliverableArtifact: null,
      latestApproval: null,
      latestReviewStatus: 'pending',
      linkedTask,
      previewLine: 'No deliverables yet because no linked task exists.',
    };
  }

  const taskArtifacts = getTaskArtifacts(linkedTask.id, data.artifacts).sort(sortByCreatedDesc);
  const taskApprovals = getTaskApprovals(linkedTask.id, data.approvals).sort(sortByCreatedDesc);
  const latestArtifact = taskArtifacts[0] || null;
  const latestPlanArtifact = getLatestTaskArtifact(linkedTask, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(linkedTask, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(linkedTask, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(linkedTask, data, 'preflight');
  const latestChangeSummaryArtifact = getLatestTaskArtifact(linkedTask, data, 'change-summary');
  const latestPatchArtifact = getLatestTaskArtifact(linkedTask, data, 'patch');
  const latestDiffArtifact = getLatestTaskArtifact(linkedTask, data, 'diff');
  const latestReviewArtifact = getLatestTaskArtifact(linkedTask, data, 'review');
  const latestCommitPackageArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-package');
  const latestCommitResultArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-result');
  const latestReleasePackageArtifact = getLatestTaskArtifact(linkedTask, data, 'release-package');
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const currentDeliverableArtifact =
    latestCloseOutArtifact ||
    latestReleasePackageArtifact ||
    latestCommitResultArtifact ||
    latestCommitPackageArtifact ||
    latestReviewArtifact ||
    latestChangeSummaryArtifact ||
    latestDiffArtifact ||
    latestPatchArtifact ||
    latestPreflightArtifact ||
    latestBreakdownArtifact ||
    latestArchitectureArtifact ||
    latestPlanArtifact ||
    latestArtifact;
  const latestApproval = taskApprovals[0] || null;
  const latestReviewStatus = linkedTask.review?.status || 'pending';

  return {
    approvalSummary: getTaskApprovalSummary(linkedTask, data.approvals),
    currentDeliverableArtifact,
    latestApproval,
    latestReviewStatus,
    linkedTask,
    previewLine: currentDeliverableArtifact
      ? `${currentDeliverableArtifact.type} ${currentDeliverableArtifact.id}; review ${latestReviewStatus}; approval ${latestApproval?.status || 'none'}.`
      : `No artifact package yet; review ${latestReviewStatus}; approval ${latestApproval?.status || 'none'}.`,
  };
}

function getMissionNextActionPreview(mission, previews) {
  if (!mission) {
    return {
      actionLabel: 'Start With Mission',
      summary: 'Mission is the current best next step because no mission is selected yet.',
      surface: 'mission',
      tone: 'warning',
    };
  }

  if (previews.completion?.completionReady) {
    return {
      actionLabel: 'Prepare Next Mission',
      summary:
        'Mission is the current best next step because the bounded path is already sealed and the next mission draft can be prepared safely from current constraints.',
      surface: 'mission',
      tone: 'success',
    };
  }

  if (!previews.council?.councilSession) {
    return {
      actionLabel: 'Draft Council',
      summary:
        'Council is the current best next step because no visible recommendation exists yet for this mission.',
      surface: 'council',
      tone: 'warning',
    };
  }

  if (previews.council.alignmentStatus !== 'approved') {
    return {
      actionLabel: 'Open Council',
      summary:
        'Council is the current best next step because the recommendation is visible but alignment is still pending.',
      surface: 'council',
      tone: 'warning',
    };
  }

  if (!previews.execution?.linkedTask) {
    return {
      actionLabel: 'Create Linked Task',
      summary:
        'Mission is the current best next step because the recommendation is aligned but no linked task exists yet.',
      surface: 'mission',
      tone: 'accent',
    };
  }

  return {
    actionLabel: 'Open Execution',
    summary: `Execution is the current best next step because ${previews.execution.gatePreview}`,
    surface: 'execution',
    tone: 'accent',
  };
}

function renderMissionSnapshotList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p class="detail-copy">No snapshot items are available yet.</p>';
  }

  return `
    <ul class="compact-list">
      ${items
        .map(
          (item) => `
            <li>
              <strong>${escapeHtml(item.label)}</strong>
              ${createToken(`surface:${item.surface}`, item.tone || 'neutral')}
              : ${escapeHtml(item.copy)}
              ${item.handoffCopy ? ` ${escapeHtml(item.handoffCopy)}` : ''}
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function stripMarkdownBullet(line) {
  return String(line || '')
    .trim()
    .replace(/^[-*]\s+/, '')
    .trim();
}

function parseMarkdownBullets(content) {
  return String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map(stripMarkdownBullet)
    .filter(Boolean);
}

function parseMarkdownLines(content) {
  return String(content || '')
    .split('\n')
    .map((line) => stripMarkdownBullet(line))
    .filter(Boolean);
}

function parseMarkdownSections(content) {
  const text = String(content || '');
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];

  if (matches.length === 0) {
    return null;
  }

  const sections = {};

  for (let index = 0; index < matches.length; index += 1) {
    const heading = matches[index][1].trim();
    const sectionStart = matches[index].index + matches[index][0].length;
    const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
    sections[heading] = text.slice(sectionStart, sectionEnd).trim();
  }

  return sections;
}

function parseMarkdownKeyValueLines(content) {
  const result = {};

  for (const line of parseMarkdownBullets(content)) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (!key || !value) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

function parseChangeSummaryFileUpdates(content) {
  const text = String(content || '').trim();

  if (!text) {
    return [];
  }

  const matches = [...text.matchAll(/^###\s+(.+)$/gm)];

  if (matches.length === 0) {
    return [];
  }

  return matches
    .map((match, index) => {
      const path = match[1]?.trim() || '';
      const sectionStart = match.index + match[0].length;
      const sectionEnd = index + 1 < matches.length ? matches[index + 1].index : text.length;
      const block = text.slice(sectionStart, sectionEnd).trim();
      const codeFenceMatch = block.match(/^```([^\n]*)\n[\s\S]*?\n```$/m);

      if (!path) {
        return null;
      }

      return {
        encoding: codeFenceMatch?.[1]?.trim() || null,
        path,
        payloadStored: block.length > 0,
      };
    })
    .filter(Boolean);
}

function parseIntegerValue(value) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseYesNoValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'yes') {
    return true;
  }

  if (normalized === 'no') {
    return false;
  }

  return null;
}

function parseBreakdownArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    executionBoundarySummary: parseMarkdownBullets(sections['Execution Boundary Summary']),
    checkpoints: parseMarkdownBullets(sections.Checkpoints),
    expectedArtifacts: parseMarkdownBullets(sections['Expected Artifacts Per Checkpoint']),
    orderedSubTasks: parseMarkdownBullets(sections['Ordered Sub-Tasks']),
    reviewTriggerPoints: parseMarkdownLines(sections['Review Trigger Point']),
    stopAndEscalateConditions: parseMarkdownBullets(sections['Stop-And-Escalate Conditions']),
    title: text.match(/^#\s+Task Breakdown:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationCheckpoints: parseMarkdownBullets(sections['Verification Checkpoints']),
  };
  const hasStructuredContent = [
    parsed.orderedSubTasks,
    parsed.checkpoints,
    parsed.expectedArtifacts,
    parsed.verificationCheckpoints,
    parsed.reviewTriggerPoints,
    parsed.stopAndEscalateConditions,
    parsed.executionBoundarySummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parsePreflightArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const parsed = {
    escalationTriggers: parseMarkdownBullets(sections['Escalation Triggers']),
    inputSummary: parseMarkdownLines(sections['Input Summary']),
    intendedChanges: parseMarkdownBullets(sections['Intended Changes']),
    reviewEvidenceExpectations: parseMarkdownBullets(sections['Review Evidence Expectations']),
    risks: parseMarkdownBullets(sections.Risks),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Preflight:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationPlan: parseMarkdownBullets(sections['Verification Plan']),
  };
  const hasStructuredContent = [
    parsed.targetFiles,
    parsed.intendedChanges,
    parsed.risks,
    parsed.verificationPlan,
    parsed.reviewEvidenceExpectations,
    parsed.escalationTriggers,
    parsed.inputSummary,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parseChangeSummaryArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const summaryValues = parseMarkdownKeyValueLines(sections['Change Summary']);
  const parsed = {
    approvalId: summaryValues['approval id'] || null,
    changeSummary: parseMarkdownBullets(sections['Change Summary']),
    commitOrReleaseExecuted: summaryValues['commit or release executed'] || null,
    fileUpdates: parseChangeSummaryFileUpdates(sections['File Updates']),
    preparedFileUpdates: parseIntegerValue(summaryValues['prepared file updates']),
    preflightArtifactId: summaryValues['preflight artifact'] || null,
    reviewerExecuted: summaryValues['reviewer executed'] || null,
    risks: parseMarkdownBullets(sections.Risks),
    targetFileAllowlistCount: parseIntegerValue(summaryValues['target file allowlist count']),
    targetFiles: parseMarkdownBullets(sections['Target Files']),
    title: text.match(/^#\s+Builder Live Mutation:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationNotes: parseMarkdownBullets(sections['Verification Notes']),
  };
  const hasStructuredContent = [
    parsed.changeSummary,
    parsed.fileUpdates,
    parsed.targetFiles,
    parsed.risks,
    parsed.verificationNotes,
  ].some((items) => items.length > 0);

  return hasStructuredContent ? parsed : null;
}

function parseReviewArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const verdictValues = parseMarkdownKeyValueLines(sections['Review Verdict']);
  const followUpValues = parseMarkdownKeyValueLines(sections['Follow-Up Gate']);
  const verdict = String(verdictValues.verdict || '').trim().toLowerCase();
  const parsed = {
    acceptedRisks: parseMarkdownBullets(sections['Accepted Risks']),
    changeSummaryArtifactId: verdictValues['change-summary artifact'] || null,
    contractCompliance: parseMarkdownBullets(sections['Contract Compliance']),
    decisionRequired: parseYesNoValue(followUpValues['decision required']),
    diffArtifactId: verdictValues['diff artifact'] || null,
    evidence: parseMarkdownBullets(sections['Evidence Reviewed']),
    findings: parseMarkdownBullets(sections.Findings),
    mappedReviewStatus:
      verdict === 'pass'
        ? 'passed'
        : verdict === 'fail' || verdict === 'changes_requested'
          ? 'changes_requested'
          : null,
    nextAction: parseMarkdownBullets(sections['Next Action']),
    patchArtifactId: verdictValues['patch artifact'] || null,
    preflightArtifactId: verdictValues['preflight artifact'] || null,
    sourceBuilderRunId: verdictValues['source builder run'] || null,
    title: text.match(/^#\s+Reviewer Report:\s*(.+)$/m)?.[1]?.trim() || '',
    verificationEvidence: parseMarkdownBullets(sections['Verification Evidence']),
    verdict: ['pass', 'fail', 'changes_requested'].includes(verdict) ? verdict : null,
    blockingIssue: parseYesNoValue(followUpValues['blocking issue']),
  };
  const hasStructuredContent = [
    parsed.verdict,
    parsed.evidence,
    parsed.findings,
    parsed.contractCompliance,
    parsed.verificationEvidence,
    parsed.nextAction,
    parsed.acceptedRisks,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.blockingIssue,
    parsed.decisionRequired,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCommitPackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceReviewerValues = parseMarkdownKeyValueLines(sections['Source Reviewer Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const verificationValues = parseMarkdownKeyValueLines(sections['Verification Evidence']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    builderLiveMutationApprovalId: sourceReviewerValues['builder live mutation approval'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    changedFiles: parseMarkdownBullets(sections['Changed Files']),
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceReviewerValues['target preflight artifact'] || null,
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    reviewArtifactId: sourceReviewerValues['review artifact'] || null,
    reviewerMappedStatus: verificationValues['reviewer mapped status'] || null,
    reviewerRawVerdict: verificationValues['reviewer raw verdict'] || null,
    sourceBuilderRunId: sourceReviewerValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewerValues['source reviewer run'] || null,
    title: text.match(/^#\s+Commit Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.preflightArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.changedFiles,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.gitCommitExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCommitResultArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceValues = parseMarkdownKeyValueLines(sections['Source Commit Package']);
  const commitValues = parseMarkdownKeyValueLines(sections.Commit);
  const validationValues = parseMarkdownKeyValueLines(sections.Validation);
  const safetyValues = parseMarkdownKeyValueLines(sections.Safety);
  const parsed = {
    commitApprovalId: sourceValues['commit approval'] || null,
    commitMessage: commitValues['commit message'] || null,
    commitPackageArtifactId: sourceValues['source commit-package artifact'] || null,
    commitSha: commitValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    committedFilesMatchedScope: parseYesNoValue(
      validationValues['committed files matched scope'],
    ),
    dirtyFileCountAfterGitAdd: parseIntegerValue(
      validationValues['dirty file count after git add'],
    ),
    dirtyFileCountBeforeCommit: parseIntegerValue(
      validationValues['dirty file count before commit'],
    ),
    gitCommitExecuted: parseYesNoValue(safetyValues['git commit executed']),
    mergeExecuted: parseYesNoValue(safetyValues['merge executed']),
    preflightArtifactId: sourceValues['target preflight artifact'] || null,
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseExecuted: parseYesNoValue(safetyValues['release executed']),
    repoChangedFileCountBeforeCommit: parseIntegerValue(
      validationValues['repo changed file count before commit'],
    ),
    repoCleanAfterCommit: parseYesNoValue(validationValues['repo clean after commit']),
    reviewArtifactId: sourceValues['source review artifact'] || null,
    scopeFileCount: parseIntegerValue(validationValues['scope file count']),
    sourceBuilderApprovalId: sourceValues['source builder approval'] || null,
    sourceBuilderRunId: sourceValues['source builder run'] || null,
    sourceReviewerRunId: sourceValues['source reviewer run'] || null,
    stagedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['staged file count after git add'],
    ),
    stagedFileCountBeforeCommit: parseIntegerValue(
      validationValues['staged file count before commit'],
    ),
    title: text.match(/^#\s+Commit Result:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCountAfterGitAdd: parseIntegerValue(
      validationValues['untracked file count after git add'],
    ),
    untrackedFileCountBeforeCommit: parseIntegerValue(
      validationValues['untracked file count before commit'],
    ),
  };
  const hasStructuredContent = [
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.committedFiles,
    parsed.scopeFileCount,
    parsed.repoChangedFileCountBeforeCommit,
    parsed.stagedFileCountBeforeCommit,
    parsed.committedFilesMatchedScope,
    parsed.repoCleanAfterCommit,
    parsed.gitCommitExecuted,
    parsed.pushExecuted,
    parsed.mergeExecuted,
    parsed.releaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseReleasePackageArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const sourceCommitValues = parseMarkdownKeyValueLines(sections['Source Local Commit Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const releaseCandidateValues = parseMarkdownKeyValueLines(sections['Release Candidate']);
  const humanGateValues = parseMarkdownKeyValueLines(sections['Human Gate']);
  const safetyValues = parseMarkdownKeyValueLines(sections['Execution Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    commitApprovalId: sourceCommitValues['commit approval'] || null,
    commitMessage: releaseCandidateValues['commit message'] || null,
    commitPackageArtifactId: sourceCommitValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceCommitValues['source commit-result artifact'] || null,
    commitSha: releaseCandidateValues['commit sha'] || null,
    committedFiles: parseMarkdownBullets(sections['Committed Files']),
    deliveryStance: releaseCandidateValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    externalReleaseExecuted: parseYesNoValue(safetyValues['external release executed']),
    localCommitBundleExecuted: parseYesNoValue(safetyValues['local commit bundle executed']),
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceCommitValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(safetyValues['publish executed']),
    pushExecuted: parseYesNoValue(safetyValues['push executed']),
    releaseApprovalRequired: parseYesNoValue(humanGateValues['release approval required']),
    releaseReadyAction: humanGateValues['allowed next action'] || null,
    reviewArtifactId: sourceCommitValues['source review artifact'] || null,
    sourceBuilderApprovalId: sourceCommitValues['source builder approval'] || null,
    sourceBuilderRunId: sourceCommitValues['source builder run'] || null,
    sourceReviewerRunId: sourceCommitValues['source reviewer run'] || null,
    title: text.match(/^#\s+Release Package:\s*(.+)$/m)?.[1]?.trim() || '',
  };
  const hasStructuredContent = [
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitApprovalId,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.commitSha,
    parsed.commitMessage,
    parsed.deliveryStance,
    parsed.committedFiles,
    parsed.releaseApprovalRequired,
    parsed.releaseReadyAction,
    parsed.publishExecuted,
    parsed.pushExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== ''));

  return hasStructuredContent ? parsed : null;
}

function parseCloseOutArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const sections = parseMarkdownSections(text);

  if (!sections) {
    return null;
  }

  const doneTransitionValues = parseMarkdownKeyValueLines(sections['Done Transition']);
  const sourceReleaseValues = parseMarkdownKeyValueLines(sections['Source Release Bundle']);
  const sourceReviewValues = parseMarkdownKeyValueLines(sections['Source Review Bundle']);
  const sourceBuilderValues = parseMarkdownKeyValueLines(sections['Source Builder Bundle']);
  const worktreeValues = parseMarkdownKeyValueLines(sections['Worktree Verification']);
  const releaseSafetyValues = parseMarkdownKeyValueLines(sections['Release Safety']);
  const parsed = {
    architectureArtifactId: sourceBuilderValues['architecture artifact'] || null,
    breakdownArtifactId: sourceBuilderValues['breakdown artifact'] || null,
    changeSummaryArtifactId: sourceBuilderValues['change-summary artifact'] || null,
    closeOutRunId: doneTransitionValues['close-out run'] || null,
    closedOutAt: doneTransitionValues['closed out at'] || null,
    commitPackageArtifactId: sourceReleaseValues['source commit-package artifact'] || null,
    commitResultArtifactId: sourceReleaseValues['source commit-result artifact'] || null,
    commitSha: sourceReleaseValues['commit sha'] || null,
    deliveryStance: sourceReleaseValues['delivery stance'] || null,
    diffArtifactId: sourceBuilderValues['diff artifact'] || null,
    dirtyFileCount: parseIntegerValue(worktreeValues['dirty file count']),
    externalReleaseExecuted: parseYesNoValue(releaseSafetyValues['external release executed']),
    lifecycleStateAfter: doneTransitionValues['task lifecycle after close-out'] || null,
    lifecycleStateBefore: doneTransitionValues['task lifecycle before close-out'] || null,
    lifecycleTransition: doneTransitionValues['lifecycle transition'] || null,
    patchArtifactId: sourceBuilderValues['patch artifact'] || null,
    planArtifactId: sourceBuilderValues['plan artifact'] || null,
    preflightArtifactId: sourceBuilderValues['target preflight artifact'] || null,
    publishExecuted: parseYesNoValue(releaseSafetyValues['publish executed']),
    pushExecuted: parseYesNoValue(releaseSafetyValues['push executed']),
    releaseApprovalId: doneTransitionValues['source release approval'] || null,
    releasePackageArtifactId:
      sourceReleaseValues['source release-package artifact'] ||
      doneTransitionValues['source release-package artifact'] ||
      null,
    repoCleanBeforeCloseOut: parseYesNoValue(worktreeValues['repo clean before close-out']),
    reviewArtifactId: sourceReviewValues['source review artifact'] || null,
    reviewerMappedStatus: sourceReviewValues['reviewer mapped status'] || null,
    reviewerRawVerdict: sourceReviewValues['reviewer raw verdict'] || null,
    sourceBuilderApprovalId: sourceBuilderValues['source builder approval'] || null,
    sourceBuilderRunId: sourceBuilderValues['source builder run'] || null,
    sourceReviewerRunId: sourceReviewValues['source reviewer run'] || null,
    stagedFileCount: parseIntegerValue(worktreeValues['staged file count']),
    title: text.match(/^#\s+Close-Out:\s*(.+)$/m)?.[1]?.trim() || '',
    untrackedFileCount: parseIntegerValue(worktreeValues['untracked file count']),
  };
  const hasStructuredContent = [
    parsed.releaseApprovalId,
    parsed.releasePackageArtifactId,
    parsed.commitResultArtifactId,
    parsed.commitPackageArtifactId,
    parsed.commitSha,
    parsed.deliveryStance,
    parsed.sourceReviewerRunId,
    parsed.reviewArtifactId,
    parsed.reviewerMappedStatus,
    parsed.reviewerRawVerdict,
    parsed.sourceBuilderRunId,
    parsed.sourceBuilderApprovalId,
    parsed.preflightArtifactId,
    parsed.planArtifactId,
    parsed.architectureArtifactId,
    parsed.breakdownArtifactId,
    parsed.changeSummaryArtifactId,
    parsed.patchArtifactId,
    parsed.diffArtifactId,
    parsed.repoCleanBeforeCloseOut,
    parsed.pushExecuted,
    parsed.publishExecuted,
    parsed.externalReleaseExecuted,
  ].some((value) => value !== null && value !== '');

  return hasStructuredContent ? parsed : null;
}

function parseUnifiedDiffArtifact(content) {
  const text = String(content || '').trim();

  if (!text) {
    return null;
  }

  const filePaths = [
    ...[...text.matchAll(/^diff --git a\/(.+?) b\/(.+)$/gm)].map((match) => match[2].trim()),
    ...[...text.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1].trim()),
    ...[...text.matchAll(/^--- a\/(.+)$/gm)].map((match) => match[1].trim()),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
  const files = [...new Set(filePaths)];
  const hunkCount = (text.match(/^@@/gm) || []).length;

  if (files.length === 0 && hunkCount === 0) {
    return null;
  }

  return {
    files,
    hunkCount,
  };
}

function renderBreakdownList(title, items, options = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  const tagName = options.ordered ? 'ol' : 'ul';

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <${tagName} class="breakdown-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </${tagName}>
    </section>
  `;
}

function renderStructuredBreakdown(parsed, options = {}) {
  if (!parsed) {
    return '';
  }

  const includeCheckpoints = options.includeCheckpoints !== false;
  const includeExpectedArtifacts = options.includeExpectedArtifacts !== false;
  const includeExecutionBoundary = options.includeExecutionBoundary !== false;
  const includeStopConditions = options.includeStopConditions !== false;
  const includeVerification = options.includeVerification !== false;
  const includeReviewTrigger = options.includeReviewTrigger !== false;
  const sections = [
    renderBreakdownList('Ordered Sub-Tasks', parsed.orderedSubTasks, { ordered: true }),
    includeCheckpoints ? renderBreakdownList('Checkpoints', parsed.checkpoints) : '',
    includeExpectedArtifacts
      ? renderBreakdownList('Expected Artifacts Per Checkpoint', parsed.expectedArtifacts)
      : '',
    includeVerification
      ? renderBreakdownList('Verification Checkpoints', parsed.verificationCheckpoints)
      : '',
    includeReviewTrigger
      ? renderBreakdownList('Review Trigger Point', parsed.reviewTriggerPoints)
      : '',
    includeStopConditions
      ? renderBreakdownList(
          'Stop-And-Escalate Conditions',
          parsed.stopAndEscalateConditions,
        )
      : '',
    includeExecutionBoundary
      ? renderBreakdownList('Execution Boundary Summary', parsed.executionBoundarySummary)
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

function renderStructuredPreflight(parsed) {
  if (!parsed) {
    return '';
  }

  const sections = [
    renderBreakdownList('Target Files', parsed.targetFiles),
    renderBreakdownList('Intended Changes', parsed.intendedChanges),
    renderBreakdownList('Risks', parsed.risks),
    renderBreakdownList('Verification Plan', parsed.verificationPlan),
    renderBreakdownList(
      'Review Evidence Expectations',
      parsed.reviewEvidenceExpectations,
    ),
    renderBreakdownList('Escalation Triggers', parsed.escalationTriggers),
    renderBreakdownList('Input Summary', parsed.inputSummary),
  ]
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      ${sections}
    </div>
  `;
}

function renderStructuredChangeSummary(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.approvalId ? createToken(`approval:${parsed.approvalId}`, 'neutral') : ''}
        ${
          parsed.targetFileAllowlistCount !== null
            ? createToken(`allowlist:${parsed.targetFileAllowlistCount}`, 'neutral')
            : ''
        }
        ${
          parsed.preparedFileUpdates !== null
            ? createToken(`updates:${parsed.preparedFileUpdates}`, 'neutral')
            : ''
        }
        ${
          parsed.fileUpdates.length > 0
            ? createToken(`file updates:${parsed.fileUpdates.length}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerExecuted
            ? createToken(`reviewer:${parsed.reviewerExecuted}`, 'warning')
            : ''
        }
        ${
          parsed.commitOrReleaseExecuted
            ? createToken(`commit/release:${parsed.commitOrReleaseExecuted}`, 'warning')
            : ''
        }
      </div>
      ${renderBreakdownList('Change Summary', parsed.changeSummary)}
      ${renderBreakdownList('Target Files', parsed.targetFiles)}
      ${
        parsed.fileUpdates.length > 0
          ? `
            <section class="breakdown-section">
              <p class="detail-key">File Updates</p>
              <p class="detail-copy">${escapeHtml(getPreviewRedactionCopy())}</p>
              <ul class="breakdown-list">
                ${parsed.fileUpdates
                  .map((update) => {
                    const detail =
                      update.encoding || update.payloadStored
                        ? `${update.path} (${update.encoding || 'stored'} payload redacted in preview)`
                        : `${update.path} (preview redacted)`;
                    return `<li>${escapeHtml(detail)}</li>`;
                  })
                  .join('')}
              </ul>
            </section>
          `
          : ''
      }
      ${renderBreakdownList('Risks', parsed.risks)}
      ${renderBreakdownList('Verification Notes', parsed.verificationNotes)}
    </div>
  `;
}

function renderStructuredReview(parsed, taskReviewStatus = null) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured review-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.verdict ? createToken(`verdict:${parsed.verdict}`, getReviewerVerdictTone(parsed.verdict)) : ''}
        ${
          parsed.mappedReviewStatus
            ? createToken(
                `mapped review:${parsed.mappedReviewStatus}`,
                getReviewTone(parsed.mappedReviewStatus),
              )
            : ''
        }
        ${
          taskReviewStatus
            ? createToken(`task review:${taskReviewStatus}`, getReviewTone(taskReviewStatus))
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`source run:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${createToken(`evidence:${parsed.evidence.length}`, 'neutral')}
        ${
          parsed.findings.length > 0
            ? createToken(`findings:${parsed.findings.length}`, 'danger')
            : createToken('findings:0', 'success')
        }
        ${
          parsed.blockingIssue === true
            ? createToken('blocking issue:yes', 'danger')
            : parsed.blockingIssue === false
              ? createToken('blocking issue:no', 'success')
              : ''
        }
        ${
          parsed.decisionRequired === true
            ? createToken('decision required:yes', 'warning')
            : parsed.decisionRequired === false
              ? createToken('decision required:no', 'success')
              : ''
        }
      </div>
      ${renderBreakdownList('Evidence Reviewed', parsed.evidence)}
      ${renderBreakdownList('Findings', parsed.findings)}
      ${renderBreakdownList('Contract Compliance', parsed.contractCompliance)}
      ${renderBreakdownList('Verification Evidence', parsed.verificationEvidence)}
      ${renderBreakdownList('Next Action', parsed.nextAction)}
      ${renderBreakdownList('Accepted Risks', parsed.acceptedRisks)}
    </div>
  `;
}

function renderStructuredCommitPackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.sourceReviewerRunId
            ? createToken(`reviewer:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`builder:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.builderLiveMutationApprovalId
            ? createToken(`builder approval:${parsed.builderLiveMutationApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.reviewerMappedStatus
            ? createToken(`mapped review:${parsed.reviewerMappedStatus}`, 'success')
            : ''
        }
        ${
          parsed.reviewerRawVerdict
            ? createToken(
                `raw verdict:${parsed.reviewerRawVerdict}`,
                getReviewerVerdictTone(parsed.reviewerRawVerdict),
              )
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${parsed.gitCommitExecuted ? 'yes' : 'no'}`,
                parsed.gitCommitExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${parsed.mergeExecuted ? 'yes' : 'no'}`,
                parsed.mergeExecuted ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${parsed.releaseExecuted ? 'yes' : 'no'}`,
                parsed.releaseExecuted ? 'warning' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        'Source Reviewer Bundle',
        [
          parsed.sourceReviewerRunId ? `source reviewer run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `review artifact: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `source builder run: ${parsed.sourceBuilderRunId}` : null,
          parsed.builderLiveMutationApprovalId
            ? `builder live mutation approval: ${parsed.builderLiveMutationApprovalId}`
            : null,
          parsed.preflightArtifactId ? `target preflight artifact: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Source Builder Bundle',
        [
          parsed.planArtifactId ? `plan artifact: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `architecture artifact: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `breakdown artifact: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `change-summary artifact: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `patch artifact: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff artifact: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('Changed Files', parsed.changedFiles)}
      ${renderBreakdownList(
        'Verification Evidence',
        [
          parsed.reviewerMappedStatus ? `reviewer mapped status: ${parsed.reviewerMappedStatus}` : null,
          parsed.reviewerRawVerdict ? `reviewer raw verdict: ${parsed.reviewerRawVerdict}` : null,
          parsed.reviewArtifactId ? `review artifact: ${parsed.reviewArtifactId}` : null,
          parsed.diffArtifactId ? `diff artifact: ${parsed.diffArtifactId}` : null,
          parsed.patchArtifactId ? `patch artifact: ${parsed.patchArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Execution Safety',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit executed: ${parsed.gitCommitExecuted ? 'yes' : 'no'}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge executed: ${parsed.mergeExecuted ? 'yes' : 'no'}`
            : null,
          parsed.releaseExecuted !== null
            ? `release executed: ${parsed.releaseExecuted ? 'yes' : 'no'}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredCommitResult(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${
          parsed.commitApprovalId
            ? createToken(`commit approval:${parsed.commitApprovalId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`commit-package:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`reviewer:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`builder:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.gitCommitExecuted !== null
            ? createToken(
                `git commit:${parsed.gitCommitExecuted ? 'yes' : 'no'}`,
                parsed.gitCommitExecuted ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${parsed.pushExecuted ? 'yes' : 'no'}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.mergeExecuted !== null
            ? createToken(
                `merge:${parsed.mergeExecuted ? 'yes' : 'no'}`,
                parsed.mergeExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseExecuted !== null
            ? createToken(
                `release:${parsed.releaseExecuted ? 'yes' : 'no'}`,
                parsed.releaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        'Provenance',
        [
          parsed.commitPackageArtifactId
            ? `source commit-package artifact: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `commit approval: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `source reviewer run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `source review artifact: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `source builder run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `source builder approval: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId
            ? `target preflight artifact: ${parsed.preflightArtifactId}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Commit',
        [
          parsed.commitSha ? `commit sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `commit message: ${parsed.commitMessage}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('Committed Files', parsed.committedFiles)}
      ${renderBreakdownList(
        'Validation',
        [
          parsed.scopeFileCount !== null ? `scope file count: ${parsed.scopeFileCount}` : null,
          parsed.repoChangedFileCountBeforeCommit !== null
            ? `repo changed file count before commit: ${parsed.repoChangedFileCountBeforeCommit}`
            : null,
          parsed.dirtyFileCountBeforeCommit !== null
            ? `dirty file count before commit: ${parsed.dirtyFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountBeforeCommit !== null
            ? `staged file count before commit: ${parsed.stagedFileCountBeforeCommit}`
            : null,
          parsed.untrackedFileCountBeforeCommit !== null
            ? `untracked file count before commit: ${parsed.untrackedFileCountBeforeCommit}`
            : null,
          parsed.stagedFileCountAfterGitAdd !== null
            ? `staged file count after git add: ${parsed.stagedFileCountAfterGitAdd}`
            : null,
          parsed.dirtyFileCountAfterGitAdd !== null
            ? `dirty file count after git add: ${parsed.dirtyFileCountAfterGitAdd}`
            : null,
          parsed.untrackedFileCountAfterGitAdd !== null
            ? `untracked file count after git add: ${parsed.untrackedFileCountAfterGitAdd}`
            : null,
          parsed.committedFilesMatchedScope !== null
            ? `committed files matched scope: ${parsed.committedFilesMatchedScope ? 'yes' : 'no'}`
            : null,
          parsed.repoCleanAfterCommit !== null
            ? `repo clean after commit: ${parsed.repoCleanAfterCommit ? 'yes' : 'no'}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Safety',
        [
          parsed.gitCommitExecuted !== null
            ? `git commit executed: ${parsed.gitCommitExecuted ? 'yes' : 'no'}`
            : null,
          parsed.pushExecuted !== null
            ? `push executed: ${parsed.pushExecuted ? 'yes' : 'no'}`
            : null,
          parsed.mergeExecuted !== null
            ? `merge executed: ${parsed.mergeExecuted ? 'yes' : 'no'}`
            : null,
          parsed.releaseExecuted !== null
            ? `release executed: ${parsed.releaseExecuted ? 'yes' : 'no'}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredReleasePackage(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`delivery:${parsed.deliveryStance}`, 'neutral') : ''}
        ${
          parsed.commitResultArtifactId
            ? createToken(`commit-result:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`commit-package:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceReviewerRunId
            ? createToken(`reviewer:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`builder:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.releaseApprovalRequired !== null
            ? createToken(
                `release approval:${parsed.releaseApprovalRequired ? 'yes' : 'no'}`,
                parsed.releaseApprovalRequired ? 'warning' : 'success',
              )
            : ''
        }
        ${
          parsed.releaseReadyAction
            ? createToken(`action:${parsed.releaseReadyAction}`, 'neutral')
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${parsed.pushExecuted ? 'yes' : 'no'}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${parsed.publishExecuted ? 'yes' : 'no'}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `external release:${parsed.externalReleaseExecuted ? 'yes' : 'no'}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        'Source Local Commit Bundle',
        [
          parsed.commitResultArtifactId
            ? `source commit-result artifact: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `source commit-package artifact: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitApprovalId ? `commit approval: ${parsed.commitApprovalId}` : null,
          parsed.sourceReviewerRunId ? `source reviewer run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `source review artifact: ${parsed.reviewArtifactId}` : null,
          parsed.sourceBuilderRunId ? `source builder run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `source builder approval: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `target preflight artifact: ${parsed.preflightArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Source Builder Bundle',
        [
          parsed.planArtifactId ? `plan artifact: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `architecture artifact: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `breakdown artifact: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `change-summary artifact: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `patch artifact: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff artifact: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Release Candidate',
        [
          parsed.commitSha ? `commit sha: ${parsed.commitSha}` : null,
          parsed.commitMessage ? `commit message: ${parsed.commitMessage}` : null,
          parsed.deliveryStance ? `delivery stance: ${parsed.deliveryStance}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList('Committed Files', parsed.committedFiles)}
      ${renderBreakdownList(
        'Human Gate',
        [
          parsed.releaseApprovalRequired !== null
            ? `release approval required: ${parsed.releaseApprovalRequired ? 'yes' : 'no'}`
            : null,
          parsed.releaseReadyAction ? `allowed next action: ${parsed.releaseReadyAction}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Execution Safety',
        [
          parsed.localCommitBundleExecuted !== null
            ? `local commit bundle executed: ${parsed.localCommitBundleExecuted ? 'yes' : 'no'}`
            : null,
          parsed.pushExecuted !== null
            ? `push executed: ${parsed.pushExecuted ? 'yes' : 'no'}`
            : null,
          parsed.publishExecuted !== null
            ? `publish executed: ${parsed.publishExecuted ? 'yes' : 'no'}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `external release executed: ${parsed.externalReleaseExecuted ? 'yes' : 'no'}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredCloseOut(parsed) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      ${parsed.title ? `<p class="breakdown-title">${escapeHtml(parsed.title)}</p>` : ''}
      <div class="token-row">
        ${
          parsed.lifecycleTransition
            ? createToken(`transition:${parsed.lifecycleTransition}`, 'success')
            : ''
        }
        ${
          parsed.releasePackageArtifactId
            ? createToken(`release-package:${parsed.releasePackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitResultArtifactId
            ? createToken(`commit-result:${parsed.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.commitPackageArtifactId
            ? createToken(`commit-package:${parsed.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${parsed.commitSha ? createToken(`sha:${parsed.commitSha}`, 'success') : ''}
        ${parsed.deliveryStance ? createToken(`delivery:${parsed.deliveryStance}`, 'neutral') : ''}
        ${
          parsed.sourceReviewerRunId
            ? createToken(`reviewer:${parsed.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.sourceBuilderRunId
            ? createToken(`builder:${parsed.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          parsed.preflightArtifactId
            ? createToken(`preflight:${parsed.preflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          parsed.repoCleanBeforeCloseOut !== null
            ? createToken(
                `repo clean:${parsed.repoCleanBeforeCloseOut ? 'yes' : 'no'}`,
                parsed.repoCleanBeforeCloseOut ? 'success' : 'warning',
              )
            : ''
        }
        ${
          parsed.pushExecuted !== null
            ? createToken(
                `push:${parsed.pushExecuted ? 'yes' : 'no'}`,
                parsed.pushExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.publishExecuted !== null
            ? createToken(
                `publish:${parsed.publishExecuted ? 'yes' : 'no'}`,
                parsed.publishExecuted ? 'danger' : 'success',
              )
            : ''
        }
        ${
          parsed.externalReleaseExecuted !== null
            ? createToken(
                `external release:${parsed.externalReleaseExecuted ? 'yes' : 'no'}`,
                parsed.externalReleaseExecuted ? 'danger' : 'success',
              )
            : ''
        }
      </div>
      ${renderBreakdownList(
        'Done Transition',
        [
          parsed.releaseApprovalId ? `source release approval: ${parsed.releaseApprovalId}` : null,
          parsed.releasePackageArtifactId
            ? `source release-package artifact: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.closeOutRunId ? `close-out run: ${parsed.closeOutRunId}` : null,
          parsed.closedOutAt ? `closed out at: ${parsed.closedOutAt}` : null,
          parsed.lifecycleTransition ? `lifecycle transition: ${parsed.lifecycleTransition}` : null,
          parsed.lifecycleStateBefore
            ? `task lifecycle before close-out: ${parsed.lifecycleStateBefore}`
            : null,
          parsed.lifecycleStateAfter
            ? `task lifecycle after close-out: ${parsed.lifecycleStateAfter}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Source Release Bundle',
        [
          parsed.releasePackageArtifactId
            ? `source release-package artifact: ${parsed.releasePackageArtifactId}`
            : null,
          parsed.commitResultArtifactId
            ? `source commit-result artifact: ${parsed.commitResultArtifactId}`
            : null,
          parsed.commitPackageArtifactId
            ? `source commit-package artifact: ${parsed.commitPackageArtifactId}`
            : null,
          parsed.commitSha ? `commit sha: ${parsed.commitSha}` : null,
          parsed.deliveryStance ? `delivery stance: ${parsed.deliveryStance}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Source Review Bundle',
        [
          parsed.sourceReviewerRunId ? `source reviewer run: ${parsed.sourceReviewerRunId}` : null,
          parsed.reviewArtifactId ? `source review artifact: ${parsed.reviewArtifactId}` : null,
          parsed.reviewerMappedStatus
            ? `reviewer mapped status: ${parsed.reviewerMappedStatus}`
            : null,
          parsed.reviewerRawVerdict ? `reviewer raw verdict: ${parsed.reviewerRawVerdict}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Source Builder Bundle',
        [
          parsed.sourceBuilderRunId ? `source builder run: ${parsed.sourceBuilderRunId}` : null,
          parsed.sourceBuilderApprovalId
            ? `source builder approval: ${parsed.sourceBuilderApprovalId}`
            : null,
          parsed.preflightArtifactId ? `target preflight artifact: ${parsed.preflightArtifactId}` : null,
          parsed.planArtifactId ? `plan artifact: ${parsed.planArtifactId}` : null,
          parsed.architectureArtifactId ? `architecture artifact: ${parsed.architectureArtifactId}` : null,
          parsed.breakdownArtifactId ? `breakdown artifact: ${parsed.breakdownArtifactId}` : null,
          parsed.changeSummaryArtifactId ? `change-summary artifact: ${parsed.changeSummaryArtifactId}` : null,
          parsed.patchArtifactId ? `patch artifact: ${parsed.patchArtifactId}` : null,
          parsed.diffArtifactId ? `diff artifact: ${parsed.diffArtifactId}` : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Worktree Verification',
        [
          parsed.repoCleanBeforeCloseOut !== null
            ? `repo clean before close-out: ${parsed.repoCleanBeforeCloseOut ? 'yes' : 'no'}`
            : null,
          parsed.dirtyFileCount !== null ? `dirty file count: ${parsed.dirtyFileCount}` : null,
          parsed.stagedFileCount !== null ? `staged file count: ${parsed.stagedFileCount}` : null,
          parsed.untrackedFileCount !== null
            ? `untracked file count: ${parsed.untrackedFileCount}`
            : null,
        ].filter(Boolean),
      )}
      ${renderBreakdownList(
        'Release Safety',
        [
          parsed.pushExecuted !== null
            ? `push executed: ${parsed.pushExecuted ? 'yes' : 'no'}`
            : null,
          parsed.publishExecuted !== null
            ? `publish executed: ${parsed.publishExecuted ? 'yes' : 'no'}`
            : null,
          parsed.externalReleaseExecuted !== null
            ? `external release executed: ${parsed.externalReleaseExecuted ? 'yes' : 'no'}`
            : null,
        ].filter(Boolean),
      )}
    </div>
  `;
}

function renderStructuredUnifiedDiff(parsed, label) {
  if (!parsed) {
    return '';
  }

  return `
    <div class="breakdown-structured">
      <div class="token-row">
        ${createToken(label, 'neutral')}
        ${createToken(`files:${parsed.files.length}`, 'neutral')}
        ${createToken(`hunks:${parsed.hunkCount}`, 'neutral')}
      </div>
      ${renderBreakdownList('Files', parsed.files)}
    </div>
  `;
}

function renderCompactList(title, items, limit = 2) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return `
    <section class="breakdown-section">
      <p class="detail-key">${escapeHtml(title)}</p>
      <ul class="compact-list">
        ${items
          .slice(0, limit)
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}
      </ul>
    </section>
  `;
}

function createToken(label, tone = 'neutral') {
  return `<span class="token token-${tone}">${escapeHtml(label)}</span>`;
}

function getArtifactCatalogEntry(artifact, data) {
  if (!artifact || !data?.artifactCatalog) {
    return null;
  }

  return data.artifactCatalog[artifact.type] || null;
}

function getArtifactMeaningBadge(entry) {
  if (!entry) {
    return null;
  }

  if (entry.retentionTier === 'tier-a-provenance-critical') {
    return { label: 'provenance-critical', tone: 'warning' };
  }

  if (entry.retentionTier === 'tier-b-latest-centered-history-retained') {
    return { label: 'latest-centered browse', tone: 'accent' };
  }

  if (entry.retentionTier === 'tier-c-generic-fallback') {
    return { label: 'generic fallback', tone: 'neutral' };
  }

  return null;
}

function getArtifactPreviewBadge(entry) {
  if (!entry) {
    return null;
  }

  if (entry.previewMode === 'structured-with-raw-fallback') {
    return { label: 'structured preview + raw fallback', tone: 'success' };
  }

  if (entry.previewMode === 'raw-only') {
    return { label: 'raw only', tone: 'neutral' };
  }

  return null;
}

function renderArtifactPolicyTokens(artifact, data) {
  const entry = getArtifactCatalogEntry(artifact, data);
  const meaningBadge = getArtifactMeaningBadge(entry);
  const previewBadge = getArtifactPreviewBadge(entry);

  return [meaningBadge, previewBadge]
    .filter(Boolean)
    .map((badge) => createToken(badge.label, badge.tone))
    .join('');
}

function getArtifactPolicySummary(artifact, data) {
  const entry = getArtifactCatalogEntry(artifact, data);
  const meaningBadge = getArtifactMeaningBadge(entry);
  const previewBadge = getArtifactPreviewBadge(entry);

  if (!meaningBadge || !previewBadge) {
    return '';
  }

  return `${meaningBadge.label}. ${previewBadge.label}.`;
}

function getStructuredPreviewLeadCopy() {
  return 'Structured preview is best-effort. Stored raw content below remains the source of truth.';
}

function getPreviewRedactionCopy() {
  return 'Preview redacts stored repo content inside File Updates. Stored raw content below remains the source of truth.';
}

function getStructuredPreviewFallbackCopy() {
  return 'Structured preview is unavailable for this artifact instance. Showing stored raw content.';
}

function getRawOnlyPreviewCopy() {
  return 'This artifact type is raw-only in the current contract. No structured view is derived.';
}

function getReviewTone(status) {
  if (status === 'passed') {
    return 'success';
  }

  if (status === 'changes_requested') {
    return 'danger';
  }

  return 'warning';
}

function getReviewerVerdictTone(verdict) {
  if (verdict === 'pass') {
    return 'success';
  }

  if (verdict === 'fail') {
    return 'danger';
  }

  if (verdict === 'changes_requested') {
    return 'warning';
  }

  return 'neutral';
}

function getRunTone(status) {
  return status === 'running' ? 'warning' : 'success';
}

function getApprovalTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'rejected') {
    return 'danger';
  }

  return 'warning';
}

function getApprovalDisplayTone(status) {
  if (status === 'approved') {
    return 'success';
  }

  if (status === 'rejected') {
    return 'danger';
  }

  if (status === 'stale') {
    return 'warning';
  }

  if (status === 'pending') {
    return 'accent';
  }

  return 'neutral';
}

function getCommitPackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentCommitPackageArtifactId || summary?.latestCommitPackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'commit-package');
}

function buildCommitPackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const commitPackageArtifact = getCommitPackageArtifactForTask(task, data, summary);
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;
  const reviewerSummary =
    reviewerRun?.summary && typeof reviewerRun.summary === 'object' ? reviewerRun.summary : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'commit-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerSummary?.rawVerdict || null,
    reviewArtifact:
      (summary.sourceReviewArtifactId &&
        data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function getReleasePackageArtifactForTask(task, data, summary = null) {
  if (!task) {
    return null;
  }

  const artifactId =
    summary?.currentReleasePackageArtifactId || summary?.latestReleasePackageArtifactId || null;

  if (artifactId && data.artifactMap.has(artifactId)) {
    return data.artifactMap.get(artifactId);
  }

  return getLatestTaskArtifact(task, data, 'release-package');
}

function buildReleasePackageRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, summary);
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'release-package',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function buildCloseOutRelationContext(task, data, summary) {
  if (!task || !summary) {
    return null;
  }

  const releasePackageArtifact = getReleasePackageArtifactForTask(task, data, {
    currentReleasePackageArtifactId: summary.currentReleasePackageArtifactId,
    latestReleasePackageArtifactId: summary.latestReleasePackageArtifactId,
  });
  const commitPackageArtifact =
    (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
    getCommitPackageArtifactForTask(task, data) ||
    null;
  const commitResultArtifact =
    (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
    getLatestTaskArtifact(task, data, 'commit-result') ||
    null;
  const reviewerRun = summary.sourceReviewerRunId
    ? data.runMap.get(summary.sourceReviewerRunId) || null
    : null;
  const builderRun = summary.sourceBuilderRunId
    ? data.runMap.get(summary.sourceBuilderRunId) || null
    : null;
  const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

  return {
    approvalId: summary.latestApprovedReleaseApprovalId || null,
    builderRun,
    changedFiles: builderBundle?.changedFiles || [],
    commitPackageArtifact,
    commitResultArtifact,
    changeSummaryArtifact: builderBundle?.changeSummaryArtifact || null,
    diffArtifact: builderBundle?.diffArtifact || null,
    executionMode: 'close-out',
    patchArtifact: builderBundle?.patchArtifact || null,
    preflightArtifact:
      (summary.targetPreflightArtifactId && data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      builderBundle?.preflightArtifact ||
      null,
    rawVerdict: reviewerRun?.summary?.rawVerdict || null,
    releasePackageArtifact,
    reviewArtifact:
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      null,
    reviewerRun,
  };
}

function getArtifactsForRun(runId, data) {
  return data.artifacts
    .filter((artifact) => artifact.runId === runId)
    .sort(sortByCreatedDesc);
}

function findLatestRunForPreflightArtifact(artifact, data) {
  if (!artifact || artifact.type !== 'preflight') {
    return null;
  }

  return (
    data.runs
      .filter((run) => {
        const summary = run.summary && typeof run.summary === 'object' ? run.summary : null;
        return (
          summary?.executionMode === 'live-mutation' &&
          summary?.preflightArtifactId === artifact.id
        );
      })
      .sort(sortByCreatedDesc)[0] || null
  );
}

function getRunArtifactBundle(run, data) {
  if (!run) {
    return null;
  }

  const summary = run.summary && typeof run.summary === 'object' ? run.summary : {};
  const artifactIds =
    summary.artifactIds && typeof summary.artifactIds === 'object' ? summary.artifactIds : {};
  const inputArtifactIds = Array.isArray(summary.inputArtifactIds) ? summary.inputArtifactIds : [];
  const sameRunArtifacts = getArtifactsForRun(run.id, data);
  const inputArtifacts = inputArtifactIds
    .map((artifactId) => data.artifactMap.get(artifactId))
    .filter(Boolean);
  const sourceBuilderRun =
    (summary.sourceBuilderRunId && data.runMap.get(summary.sourceBuilderRunId)) || null;
  const sourceReviewerRun =
    (summary.sourceReviewerRunId && data.runMap.get(summary.sourceReviewerRunId)) || null;

  return {
    approvalId: summary.approvalId || null,
    changeSummaryArtifact:
      (artifactIds.changeSummary && data.artifactMap.get(artifactIds.changeSummary)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      inputArtifacts.find((artifact) => artifact.type === 'change-summary') ||
      null,
    changedFiles: Array.isArray(summary.changedFiles)
      ? summary.changedFiles
      : Array.isArray(summary.committedFiles)
        ? summary.committedFiles
        : [],
    closeOutArtifact:
      (summary.closeOutArtifactId && data.artifactMap.get(summary.closeOutArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'close-out') ||
      null,
    commitPackageArtifact:
      (summary.commitPackageArtifactId && data.artifactMap.get(summary.commitPackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-package') ||
      null,
    commitResultArtifact:
      (summary.commitResultArtifactId && data.artifactMap.get(summary.commitResultArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'commit-result') ||
      null,
    diffArtifact:
      (artifactIds.diff && data.artifactMap.get(artifactIds.diff)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'diff') ||
      inputArtifacts.find((artifact) => artifact.type === 'diff') ||
      null,
    executionMode: summary.executionMode || run.metadata?.executionMode || null,
    inputArtifacts,
    patchArtifact:
      (artifactIds.patch && data.artifactMap.get(artifactIds.patch)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'patch') ||
      inputArtifacts.find((artifact) => artifact.type === 'patch') ||
      null,
    preflightArtifact:
      (summary.preflightArtifactId && data.artifactMap.get(summary.preflightArtifactId)) ||
      (summary.targetPreflightArtifactId &&
        data.artifactMap.get(summary.targetPreflightArtifactId)) ||
      inputArtifacts.find((artifact) => artifact.type === 'preflight') ||
      null,
    rawVerdict: summary.rawVerdict || null,
    releasePackageArtifact:
      (summary.releasePackageArtifactId && data.artifactMap.get(summary.releasePackageArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'release-package') ||
      null,
    reviewArtifact:
      (summary.reviewArtifactId && data.artifactMap.get(summary.reviewArtifactId)) ||
      (summary.sourceReviewArtifactId && data.artifactMap.get(summary.sourceReviewArtifactId)) ||
      sameRunArtifacts.find((artifact) => artifact.type === 'review') ||
      inputArtifacts.find((artifact) => artifact.type === 'review') ||
      null,
    sourceBuilderRun,
    sourceReviewerRun,
    sourceRun:
      (summary.sourceRunId && data.runMap.get(summary.sourceRunId)) ||
      null,
    run,
  };
}

function getPreferredArtifactForRun(run, data) {
  const bundle = getRunArtifactBundle(run, data);

  return (
    bundle?.closeOutArtifact ||
    bundle?.releasePackageArtifact ||
    bundle?.commitResultArtifact ||
    bundle?.commitPackageArtifact ||
    bundle?.reviewArtifact ||
    bundle?.changeSummaryArtifact ||
    bundle?.diffArtifact ||
    bundle?.patchArtifact ||
    getArtifactsForRun(run.id, data)[0] ||
    null
  );
}

function getArtifactRelationContext(artifact, data, options = {}) {
  if (!artifact) {
    return null;
  }

  const parsedChangeSummary = options.parsedChangeSummary || null;
  const parsedCloseOut = options.parsedCloseOut || null;
  const parsedCommitResult = options.parsedCommitResult || null;
  const parsedCommitPackage = options.parsedCommitPackage || null;
  const parsedReleasePackage = options.parsedReleasePackage || null;
  const parsedReview = options.parsedReview || null;
  let run = data.runMap.get(artifact.runId) || null;
  let bundle = run ? getRunArtifactBundle(run, data) : null;

  if (artifact.type === 'commit-result') {
    return {
      approvalId: bundle?.approvalId || parsedCommitResult?.commitApprovalId || null,
      builderRun:
        bundle?.sourceBuilderRun ||
        (parsedCommitResult?.sourceBuilderRunId
          ? data.runMap.get(parsedCommitResult.sourceBuilderRunId) || null
          : null),
      changeSummaryArtifact: bundle?.changeSummaryArtifact || null,
      changedFiles: parsedCommitResult?.committedFiles || bundle?.changedFiles || [],
      commitPackageArtifact:
        bundle?.commitPackageArtifact ||
        (parsedCommitResult?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCommitResult.commitPackageArtifactId) || null
          : null),
      diffArtifact: bundle?.diffArtifact || null,
      executionMode: bundle?.executionMode || null,
      patchArtifact: bundle?.patchArtifact || null,
      preflightArtifact:
        bundle?.preflightArtifact ||
        (parsedCommitResult?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitResult.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || null,
      run,
      runLabel: 'commit-executor run',
      reviewArtifact:
        bundle?.reviewArtifact ||
        (parsedCommitResult?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitResult.reviewArtifactId) || null
          : null),
      reviewerRun:
        bundle?.sourceReviewerRun ||
        (parsedCommitResult?.sourceReviewerRunId
          ? data.runMap.get(parsedCommitResult.sourceReviewerRunId) || null
          : null),
    };
  }

  if (artifact.type === 'commit-package') {
    const builderRun =
      (parsedCommitPackage?.sourceBuilderRunId &&
        data.runMap.get(parsedCommitPackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCommitPackage?.sourceReviewerRunId &&
        data.runMap.get(parsedCommitPackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: bundle?.approvalId || null,
      builderRun,
      changedFiles: parsedCommitPackage?.changedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact: artifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCommitPackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCommitPackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCommitPackage?.diffArtifactId
          ? data.artifactMap.get(parsedCommitPackage.diffArtifactId) || null
          : null),
      executionMode: 'commit-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCommitPackage?.patchArtifactId
          ? data.artifactMap.get(parsedCommitPackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCommitPackage?.preflightArtifactId
          ? data.artifactMap.get(parsedCommitPackage.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCommitPackage?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      run,
      runLabel: 'commit-packager run',
      reviewArtifact:
        (parsedCommitPackage?.reviewArtifactId
          ? data.artifactMap.get(parsedCommitPackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'review') {
    const sourceRun =
      bundle?.sourceRun ||
      (parsedReview?.sourceBuilderRunId
        ? data.runMap.get(parsedReview.sourceBuilderRunId) || null
        : null);
    const sourceBundle = sourceRun ? getRunArtifactBundle(sourceRun, data) : null;

    return {
      approvalId: sourceBundle?.approvalId || null,
      builderRun: sourceRun,
      changeSummaryArtifact:
        sourceBundle?.changeSummaryArtifact ||
        (parsedReview?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReview.changeSummaryArtifactId) || null
          : null),
      changedFiles: sourceBundle?.changedFiles || [],
      commitPackageArtifact: null,
      diffArtifact:
        sourceBundle?.diffArtifact ||
        (parsedReview?.diffArtifactId ? data.artifactMap.get(parsedReview.diffArtifactId) || null : null),
      executionMode: sourceBundle?.executionMode || null,
      patchArtifact:
        sourceBundle?.patchArtifact ||
        (parsedReview?.patchArtifactId ? data.artifactMap.get(parsedReview.patchArtifactId) || null : null),
      preflightArtifact:
        sourceBundle?.preflightArtifact ||
        (parsedReview?.preflightArtifactId
          ? data.artifactMap.get(parsedReview.preflightArtifactId) || null
          : null),
      rawVerdict: bundle?.rawVerdict || parsedReview?.verdict || null,
      run,
      runLabel: 'reviewer run',
      reviewArtifact: artifact,
      reviewerRun: run,
    };
  }

  if (artifact.type === 'release-package') {
    const builderRun =
      (parsedReleasePackage?.sourceBuilderRunId &&
        data.runMap.get(parsedReleasePackage.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedReleasePackage?.sourceReviewerRunId &&
        data.runMap.get(parsedReleasePackage.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: null,
      builderRun,
      changedFiles: parsedReleasePackage?.committedFiles || builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedReleasePackage?.commitPackageArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedReleasePackage?.commitResultArtifactId
          ? data.artifactMap.get(parsedReleasePackage.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedReleasePackage?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedReleasePackage.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedReleasePackage?.diffArtifactId
          ? data.artifactMap.get(parsedReleasePackage.diffArtifactId) || null
          : null),
      executionMode: 'release-package',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedReleasePackage?.patchArtifactId
          ? data.artifactMap.get(parsedReleasePackage.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedReleasePackage?.preflightArtifactId
          ? data.artifactMap.get(parsedReleasePackage.preflightArtifactId) || null
          : null),
      rawVerdict: reviewerRun?.summary?.rawVerdict || null,
      releasePackageArtifact: artifact,
      run,
      runLabel: 'release-packager run',
      reviewArtifact:
        (parsedReleasePackage?.reviewArtifactId
          ? data.artifactMap.get(parsedReleasePackage.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (artifact.type === 'close-out') {
    const builderRun =
      (parsedCloseOut?.sourceBuilderRunId &&
        data.runMap.get(parsedCloseOut.sourceBuilderRunId)) ||
      bundle?.sourceBuilderRun ||
      null;
    const reviewerRun =
      (parsedCloseOut?.sourceReviewerRunId &&
        data.runMap.get(parsedCloseOut.sourceReviewerRunId)) ||
      bundle?.sourceReviewerRun ||
      null;
    const builderBundle = builderRun ? getRunArtifactBundle(builderRun, data) : null;

    return {
      approvalId: parsedCloseOut?.releaseApprovalId || null,
      builderRun,
      changedFiles: builderBundle?.changedFiles || [],
      commitPackageArtifact:
        (parsedCloseOut?.commitPackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitPackageArtifactId) || null
          : null) || bundle?.commitPackageArtifact,
      commitResultArtifact:
        (parsedCloseOut?.commitResultArtifactId
          ? data.artifactMap.get(parsedCloseOut.commitResultArtifactId) || null
          : null) || bundle?.commitResultArtifact,
      changeSummaryArtifact:
        builderBundle?.changeSummaryArtifact ||
        (parsedCloseOut?.changeSummaryArtifactId
          ? data.artifactMap.get(parsedCloseOut.changeSummaryArtifactId) || null
          : null),
      diffArtifact:
        builderBundle?.diffArtifact ||
        (parsedCloseOut?.diffArtifactId
          ? data.artifactMap.get(parsedCloseOut.diffArtifactId) || null
          : null),
      executionMode: 'close-out',
      patchArtifact:
        builderBundle?.patchArtifact ||
        (parsedCloseOut?.patchArtifactId
          ? data.artifactMap.get(parsedCloseOut.patchArtifactId) || null
          : null),
      preflightArtifact:
        builderBundle?.preflightArtifact ||
        (parsedCloseOut?.preflightArtifactId
          ? data.artifactMap.get(parsedCloseOut.preflightArtifactId) || null
          : null),
      rawVerdict:
        parsedCloseOut?.reviewerRawVerdict ||
        reviewerRun?.summary?.rawVerdict ||
        null,
      releasePackageArtifact:
        (parsedCloseOut?.releasePackageArtifactId
          ? data.artifactMap.get(parsedCloseOut.releasePackageArtifactId) || null
          : null) || bundle?.releasePackageArtifact,
      run,
      runLabel: 'close-out run',
      reviewArtifact:
        (parsedCloseOut?.reviewArtifactId
          ? data.artifactMap.get(parsedCloseOut.reviewArtifactId) || null
          : null) || bundle?.reviewArtifact,
      reviewerRun,
    };
  }

  if (!bundle && artifact.type === 'preflight') {
    run = findLatestRunForPreflightArtifact(artifact, data);
    bundle = run ? getRunArtifactBundle(run, data) : null;
  }

  return {
    approvalId: bundle?.approvalId || parsedChangeSummary?.approvalId || null,
    builderRun:
      bundle?.sourceBuilderRun || (run?.role === 'builder' ? run : null),
    changeSummaryArtifact:
      bundle?.changeSummaryArtifact || (artifact.type === 'change-summary' ? artifact : null),
    changedFiles: bundle?.changedFiles || [],
    commitPackageArtifact:
      bundle?.commitPackageArtifact || (artifact.type === 'commit-package' ? artifact : null),
    diffArtifact: bundle?.diffArtifact || (artifact.type === 'diff' ? artifact : null),
    executionMode: bundle?.executionMode || null,
    patchArtifact: bundle?.patchArtifact || (artifact.type === 'patch' ? artifact : null),
    preflightArtifact:
      bundle?.preflightArtifact ||
      (parsedChangeSummary?.preflightArtifactId
        ? data.artifactMap.get(parsedChangeSummary.preflightArtifactId) || null
        : null) ||
      (artifact.type === 'preflight' ? artifact : null),
    rawVerdict: bundle?.rawVerdict || null,
    releasePackageArtifact:
      bundle?.releasePackageArtifact || (artifact.type === 'release-package' ? artifact : null),
    run,
    runLabel: 'run',
    reviewArtifact: bundle?.reviewArtifact || (artifact.type === 'review' ? artifact : null),
    reviewerRun:
      bundle?.sourceReviewerRun || (run?.role === 'reviewer' ? run : null),
  };
}

function renderRelationButton(label, action, id, tone = 'neutral', isSelected = false) {
  if (!id) {
    return '';
  }

  return `
    <button
      class="token-button token token-${tone} ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-action="${escapeHtml(action)}"
      data-id="${escapeHtml(id)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderRelationStrip(context) {
  if (!context) {
    return '';
  }

  const legacyRunButton =
    context.run &&
    context.run.id !== context.builderRun?.id &&
    context.run.id !== context.reviewerRun?.id
      ? renderRelationButton(
          `${context.runLabel || 'run'}:${context.run.id}`,
          'select-run',
          context.run.id,
          'neutral',
          state.selectedRunId === context.run.id,
        )
      : '';
  const relationButtons = [
    context.releasePackageArtifact
      ? renderRelationButton(
          `release-package:${context.releasePackageArtifact.id}`,
          'select-artifact',
          context.releasePackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.releasePackageArtifact.id,
        )
      : '',
    context.commitResultArtifact
      ? renderRelationButton(
          `commit-result:${context.commitResultArtifact.id}`,
          'select-artifact',
          context.commitResultArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitResultArtifact.id,
        )
      : '',
    context.commitPackageArtifact
      ? renderRelationButton(
          `commit-package:${context.commitPackageArtifact.id}`,
          'select-artifact',
          context.commitPackageArtifact.id,
          'neutral',
          state.selectedArtifactId === context.commitPackageArtifact.id,
        )
      : '',
    context.reviewerRun
      ? renderRelationButton(
          `reviewer:${context.reviewerRun.id}`,
          'select-run',
          context.reviewerRun.id,
          'neutral',
          state.selectedRunId === context.reviewerRun.id,
        )
      : '',
    context.reviewArtifact
      ? renderRelationButton(
          `review:${context.reviewArtifact.id}`,
          'select-artifact',
          context.reviewArtifact.id,
          'neutral',
          state.selectedArtifactId === context.reviewArtifact.id,
        )
      : '',
    context.builderRun
      ? renderRelationButton(
          `builder:${context.builderRun.id}`,
          'select-run',
          context.builderRun.id,
          'neutral',
          state.selectedRunId === context.builderRun.id,
        )
      : '',
    context.preflightArtifact
      ? renderRelationButton(
          `preflight:${context.preflightArtifact.id}`,
          'select-artifact',
          context.preflightArtifact.id,
          'neutral',
          state.selectedArtifactId === context.preflightArtifact.id,
        )
      : '',
    context.changeSummaryArtifact
      ? renderRelationButton(
          `change-summary:${context.changeSummaryArtifact.id}`,
          'select-artifact',
          context.changeSummaryArtifact.id,
          'neutral',
          state.selectedArtifactId === context.changeSummaryArtifact.id,
        )
      : '',
    context.patchArtifact
      ? renderRelationButton(
          `patch:${context.patchArtifact.id}`,
          'select-artifact',
          context.patchArtifact.id,
          'neutral',
          state.selectedArtifactId === context.patchArtifact.id,
        )
      : '',
    context.diffArtifact
      ? renderRelationButton(
          `diff:${context.diffArtifact.id}`,
          'select-artifact',
          context.diffArtifact.id,
          'neutral',
          state.selectedArtifactId === context.diffArtifact.id,
        )
      : '',
    legacyRunButton,
  ]
    .filter(Boolean)
    .join('');
  const contextTokens = [
    context.executionMode ? createToken(`mode:${context.executionMode}`, 'neutral') : '',
    context.approvalId ? createToken(`approval:${context.approvalId}`, 'neutral') : '',
    context.rawVerdict ? createToken(`verdict:${context.rawVerdict}`, getReviewerVerdictTone(context.rawVerdict)) : '',
    context.changedFiles.length > 0
      ? createToken(`changed files:${context.changedFiles.length}`, 'neutral')
      : '',
  ]
    .filter(Boolean)
    .join('');

  if (!relationButtons && !contextTokens && context.changedFiles.length === 0) {
    return '';
  }

  return `
    <div class="relation-strip">
      ${contextTokens ? `<div class="token-row">${contextTokens}</div>` : ''}
      ${relationButtons ? `<div class="relation-button-row">${relationButtons}</div>` : ''}
      ${renderCompactList('Changed Files', context.changedFiles, 4)}
    </div>
  `;
}

function getInboxTone(item) {
  if (item.status === 'resolved') {
    return 'success';
  }

  if (item.blocksTask) {
    return 'danger';
  }

  if (item.kind === 'approval') {
    return 'accent';
  }

  return 'warning';
}

function renderReasonList(title, items) {
  return renderCompactList(title, items, Array.isArray(items) ? items.length : 0);
}

function findPendingApprovalItemByAction(taskId, data, allowedNextAction, matcher = null) {
  for (const item of data.inboxItems) {
    if (item.taskId !== taskId || item.status !== 'pending' || item.kind !== 'approval' || !item.sourceId) {
      continue;
    }

    const approval = data.approvals.find((candidate) => candidate.id === item.sourceId) || null;

    if (!approval || approval.allowedNextAction !== allowedNextAction) {
      continue;
    }

    if (!matcher || matcher(approval)) {
      return item;
    }
  }

  return null;
}

function renderPreselectedPendingItemHint(item, approval, options = {}) {
  if (!item) {
    return '';
  }

  const helpText =
    options.helpText || 'Approval actions stay on the current surface and mirror the server snapshot as-is.';

  return `
    <div class="breakdown-inbox-hint">
      <div class="token-row">
        ${createToken(`preselected inbox:${item.id}`, 'warning')}
        ${createToken(item.kind, getInboxTone(item))}
        ${item.blocksTask ? createToken('blocksTask', 'danger') : ''}
        ${approval ? createToken(`scope:${approval.scope}`, 'neutral') : ''}
        ${
          approval?.allowedNextAction
            ? createToken(`action:${approval.allowedNextAction}`, 'neutral')
            : ''
        }
      </div>
      <p class="detail-copy">${escapeHtml(item.title)}</p>
      <p class="detail-copy">${escapeHtml(item.prompt || 'No prompt recorded.')}</p>
      ${
        item.kind === 'approval'
          ? `
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="approve"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                Approve
              </button>
              <button
                class="danger-button"
                type="button"
                data-action="run-inbox-action"
                data-id="${escapeHtml(item.id)}"
                data-verb="reject"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                Reject
              </button>
              <p class="form-help">${escapeHtml(helpText)}</p>
            </div>
          `
          : '<p class="form-help">Decision resolution remains in Decision Inbox for this slice.</p>'
      }
    </div>
  `;
}

function getSurfaceDisplayName(surface) {
  if (surface === 'mission') {
    return 'Mission';
  }

  if (surface === 'council') {
    return 'Council';
  }

  if (surface === 'execution') {
    return 'Execution';
  }

  if (surface === 'deliverables') {
    return 'Deliverables';
  }

  if (surface === 'decision-inbox') {
    return 'Decision Inbox';
  }

  if (surface === 'taskboard') {
    return 'Taskboard';
  }

  if (surface === 'artifacts') {
    return 'Artifacts';
  }

  if (surface === 'logs') {
    return 'Logs';
  }

  return surface || 'Current surface';
}

function renderTaskDetailNavigationHint(task, options = {}) {
  if (!task) {
    return '';
  }

  const label = options.label || 'Open Task Detail';
  const helpText = options.helpText || 'Open Task Detail to continue on the bounded execution surface.';

  return `
    <div class="breakdown-inbox-hint">
      <div class="form-actions form-actions-inline">
        <button
          class="secondary-button"
          type="button"
          data-action="open-taskboard-task"
          data-id="${escapeHtml(task.id)}"
          ${state.loading || state.mutating ? 'disabled' : ''}
        >
          ${escapeHtml(label)}
        </button>
        <p class="form-help">${escapeHtml(helpText)}</p>
      </div>
    </div>
  `;
}

function renderCommitPackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCommitPackageAvailability(task, data);
  const commitExecutionState = getCommitExecutionAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCommitApprovalDisplayStatus(summary);
  const packageStatus = summary.currentCommitPackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestCommitPackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildCommitPackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `Creates or reuses a commit-package artifact for ${summary.sourceReviewerRunId || 'the latest passing reviewer bundle'} and opens a commit approval inbox item without running git commit, merge, or release.`
    : `Prepare Commit Package stays disabled until ${
        (summary.reasons || []).join('; ') || 'the latest passing reviewer bundle is ready'
      }.`;
  const localCommitDisplayStatus =
    commitExecutionState.summary.latestApprovalDisplayStatus ||
    getCommitApprovalDisplayStatus(commitExecutionState.summary);
  const localCommitHelp = commitExecutionState.summary.allowed
    ? `Resume Approved Local Commit runs a local git commit from commit-package ${commitExecutionState.summary.commitPackageArtifactId || 'the current package'} and lands on the saved commit-result artifact. Push, merge, and release remain disabled.`
    : `Resume Approved Local Commit stays disabled until ${
        (commitExecutionState.summary.reasons || []).join('; ') || 'the approved local commit bundle is ready'
      }.`;
  const actionSurface =
    options.includeAction === false || !allowExecutingActions
      ? ''
      : `
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-commit-package"
            data-id="${escapeHtml(task.id)}"
            ${disabled ? 'disabled' : ''}
          >
            Prepare Commit Package
          </button>
          <p class="form-help">${escapeHtml(actionHelp)}</p>
        </div>
      `;
  const localCommitActionSurface =
    options.includeLocalCommitAction === false
      ? ''
      : `
        <div class="guard-summary">
          <div class="token-row">
            ${
              commitExecutionState.summary.allowed
                ? createToken('local commit:ready', 'success')
                : createToken('local commit:blocked', 'warning')
            }
            ${createToken(
              `commit approval:${localCommitDisplayStatus}`,
              getApprovalDisplayTone(localCommitDisplayStatus),
            )}
            ${
              commitExecutionState.summary.commitPackageArtifactId
                ? createToken(
                    `package:${commitExecutionState.summary.commitPackageArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.existingCommitResultArtifactId
                ? createToken(
                    `existing result:${commitExecutionState.summary.existingCommitResultArtifactId}`,
                    commitExecutionState.summary.conflict ? 'warning' : 'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.sourceReviewerRunId
                ? createToken(`reviewer:${commitExecutionState.summary.sourceReviewerRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.sourceBuilderRunId
                ? createToken(`builder:${commitExecutionState.summary.sourceBuilderRunId}`, 'neutral')
                : ''
            }
            ${
              commitExecutionState.summary.targetPreflightArtifactId
                ? createToken(
                    `preflight:${commitExecutionState.summary.targetPreflightArtifactId}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.changedFileCount
                ? createToken(
                    `changed files:${commitExecutionState.summary.changedFileCount}`,
                    'neutral',
                  )
                : ''
            }
            ${
              commitExecutionState.summary.commitMessagePresent
                ? createToken('commit message:present', 'success')
                : createToken('commit message:missing', 'warning')
            }
          </div>
          <p class="detail-copy">
            Local commit enablement comes directly from commitExecutionReadiness. The UI does not infer commit semantics beyond loading and mutation state, and push, merge, and release remain disabled.
          </p>
          ${
            commitExecutionState.summary.reasons?.length
              ? renderReasonList(
                  'Local Commit Disabled By',
                  commitExecutionState.summary.reasons,
                )
              : '<p class="detail-copy">Local commit is ready for the current approved commit-package bundle.</p>'
          }
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-local-commit"
                    data-id="${escapeHtml(task.id)}"
                    ${commitExecutionState.disabled ? 'disabled' : ''}
                  >
                    Resume Approved Local Commit
                  </button>
                  <p class="form-help">${escapeHtml(localCommitHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)} stays navigation-only for commit follow-up. Open Task Detail to use Resume Approved Local Commit.`,
                    )}
                  </p>
                `
            }
          </div>
        </div>
      `;
  const navigationHint =
    allowExecutingActions
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: 'Open Task Detail Commit Guard',
          helpText:
            'Execution stays on Task Detail. Artifacts and Decision Inbox remain navigation-only for commit continuation.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('commit-package:ready', 'success')
            : createToken('commit-package:blocked', 'warning')
        }
        ${createToken(
          `commit approval:${displayStatus}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `package:${packageStatus}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`approval:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentCommitPackageArtifactId
            ? createToken(`current package:${summary.currentCommitPackageArtifactId}`, 'neutral')
            : summary.latestCommitPackageArtifactId
              ? createToken(`latest package:${summary.latestCommitPackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`reviewer:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`builder:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`surface:${currentSurface}`, 'neutral')}
      </div>
      <p class="detail-copy">
        Commit-package readiness comes directly from the coordinator. This panel only reflects that summary and keeps actual git commit, merge, and release disabled.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('Commit Package Guard Reasons', summary.reasons)
          : '<p class="detail-copy">No commit-package guard reasons remain for the latest passing reviewer bundle.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">No commit-package relation context is available yet.</p>'
      }
      ${actionSurface}
      ${localCommitActionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderReleasePackagePanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getReleasePackageAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const displayStatus = summary.latestApprovalDisplayStatus || 'none';
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.packageStale
      ? 'stale'
      : summary.latestReleasePackageArtifactId
        ? 'latest'
        : 'missing';
  const relationContext = buildReleasePackageRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `Creates or reuses a release-package artifact from commit-result ${summary.commitResultArtifactId || 'the latest local commit bundle'} and opens a release approval inbox item. Push, publish, and external release remain disabled.`
    : `Prepare Release Package stays disabled until ${
        (summary.reasons || []).join('; ') || 'the latest successful local commit bundle is ready'
      }.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-release-package"
              data-id="${escapeHtml(task.id)}"
              ${disabled ? 'disabled' : ''}
            >
              Prepare Release Package
            </button>
            <p class="form-help">${escapeHtml(actionHelp)}</p>
          </div>
        `;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('release-package:ready', 'success')
            : createToken('release-package:blocked', 'warning')
        }
        ${createToken(
          `release approval:${displayStatus}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `package:${packageStatus}`,
          packageStatus === 'current'
            ? 'success'
            : packageStatus === 'stale'
              ? 'warning'
              : 'neutral',
        )}
        ${
          summary.latestApprovalId
            ? createToken(`approval:${summary.latestApprovalId}`, 'neutral')
            : ''
        }
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`current package:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`latest package:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`commit-result:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`commit-package:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitSha
            ? createToken(`sha:${summary.commitSha}`, 'success')
            : ''
        }
        ${
          summary.deliveryStance
            ? createToken(`delivery:${summary.deliveryStance}`, 'neutral')
            : ''
        }
        ${
          summary.sourceReviewerRunId
            ? createToken(`reviewer:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`builder:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${createToken(`surface:${currentSurface}`, 'neutral')}
      </div>
      <p class="detail-copy">
        Release-package readiness comes directly from the coordinator. This panel only reflects that summary and keeps push, publish, and external release disabled.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('Release Package Guard Reasons', summary.reasons)
          : '<p class="detail-copy">No release-package guard reasons remain for the current local commit bundle.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">No release-package provenance relation is available yet.</p>'
      }
      ${actionSurface}
    </div>
  `;
}

function renderCloseOutPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { disabled, summary } = getCloseOutAvailability(task, data);
  const currentSurface = options.currentSurface || state.surface;
  const allowExecutingActions =
    options.forceExecutingActions === true || currentSurface === 'taskboard';
  const displayStatus = getCloseOutApprovalDisplayStatus(summary);
  const packageStatus = summary.currentReleasePackageArtifactId
    ? 'current'
    : summary.latestReleasePackageArtifactId
      ? 'latest'
      : 'missing';
  const relationContext = buildCloseOutRelationContext(task, data, summary);
  const actionHelp = summary.allowed
    ? `Resume Approved Close Out runs close-out from release-package ${summary.currentReleasePackageArtifactId || 'the current approved bundle'}, captures a close-out artifact, and transitions Review -> Done without push, publish, or external release.`
    : `Close Out stays disabled until ${
        (summary.reasons || []).join('; ') || 'the current approved release bundle is ready'
      }.`;
  const actionSurface =
    options.includeAction === false
      ? ''
      : `
          <div class="form-actions form-actions-inline">
            ${
              allowExecutingActions
                ? `
                  <button
                    class="primary-button"
                    type="button"
                    data-action="run-close-out"
                    data-id="${escapeHtml(task.id)}"
                    ${disabled ? 'disabled' : ''}
                  >
                    Resume Approved Close Out
                  </button>
                  <p class="form-help">${escapeHtml(actionHelp)}</p>
                `
                : `
                  <p class="form-help">
                    ${escapeHtml(
                      `${getSurfaceDisplayName(currentSurface)} stays navigation-only for close-out follow-up. Open Task Detail to use Resume Approved Close Out.`,
                    )}
                  </p>
                `
            }
          </div>
        `;
  const navigationHint =
    allowExecutingActions || !summary.allowed
      ? ''
      : renderTaskDetailNavigationHint(task, {
          label: 'Open Task Detail Close-Out Guard',
          helpText:
            'Execution stays on Task Detail. Artifacts and Decision Inbox remain navigation-only for close-out continuation.',
        });

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          summary.allowed
            ? createToken('close-out:ready', 'success')
            : createToken('close-out:blocked', 'warning')
        }
        ${createToken(
          `release approval:${displayStatus}`,
          getApprovalDisplayTone(displayStatus),
        )}
        ${createToken(
          `package:${packageStatus}`,
          packageStatus === 'current' ? 'success' : 'neutral',
        )}
        ${
          summary.currentReleasePackageArtifactId
            ? createToken(`current package:${summary.currentReleasePackageArtifactId}`, 'neutral')
            : summary.latestReleasePackageArtifactId
              ? createToken(`latest package:${summary.latestReleasePackageArtifactId}`, 'neutral')
              : ''
        }
        ${
          summary.commitResultArtifactId
            ? createToken(`commit-result:${summary.commitResultArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.commitPackageArtifactId
            ? createToken(`commit-package:${summary.commitPackageArtifactId}`, 'neutral')
            : ''
        }
        ${summary.commitSha ? createToken(`sha:${summary.commitSha}`, 'success') : ''}
        ${summary.deliveryStance ? createToken(`delivery:${summary.deliveryStance}`, 'neutral') : ''}
        ${
          summary.sourceReviewerRunId
            ? createToken(`reviewer:${summary.sourceReviewerRunId}`, 'neutral')
            : ''
        }
        ${
          summary.sourceBuilderRunId
            ? createToken(`builder:${summary.sourceBuilderRunId}`, 'neutral')
            : ''
        }
        ${
          summary.targetPreflightArtifactId
            ? createToken(`preflight:${summary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          summary.repoClean
            ? createToken('repo:clean', 'success')
            : createToken('repo:blocked', 'warning')
        }
        ${
          summary.existingCloseOutArtifactId
            ? createToken(`existing close-out:${summary.existingCloseOutArtifactId}`, summary.conflict ? 'warning' : 'neutral')
            : ''
        }
        ${createToken(`surface:${currentSurface}`, 'neutral')}
      </div>
      <p class="detail-copy">
        Close-out enablement comes directly from closeOutReadiness. The UI only layers loading/mutating state on top, and push, publish, and external release remain disabled.
      </p>
      ${
        summary.reasons?.length
          ? renderReasonList('Close Out Guard Reasons', summary.reasons)
          : '<p class="detail-copy">No close-out guard reasons remain for the current approved release bundle.</p>'
      }
      ${
        renderRelationStrip(relationContext) ||
        '<p class="detail-copy">No close-out provenance relation is available yet.</p>'
      }
      ${actionSurface}
      ${navigationHint}
    </div>
  `;
}

function renderBuilderLiveMutationApprovalPanel(task, data, options = {}) {
  if (!task) {
    return '';
  }

  const { guardSummary, requestSummary } = getBuilderLiveMutationSummaries(task, data);
  const requestDisabled = state.loading || state.mutating || !requestSummary.allowed;
  const runDisabled = state.loading || state.mutating || !guardSummary.allowed;
  const requestHelp = requestSummary.allowed
    ? `Creates a new approval inbox item for ${requestSummary.currentPreflightArtifactId}.`
    : `Approval request stays disabled until ${
        (requestSummary.reasons || []).join('; ') || 'the latest preflight is ready'
      }.`;
  const runHelp = guardSummary.allowed
    ? `Runs limited live mutation for ${guardSummary.currentPreflightArtifactId} and stores change-summary, patch, and diff artifacts.`
    : `Live mutation stays disabled until ${
        (guardSummary.reasons || []).join('; ') || 'the latest approved preflight pair is ready'
      }.`;

  return `
    <div class="guard-summary">
      <div class="token-row">
        ${
          guardSummary.allowed
            ? createToken('live mutation guard:ready', 'success')
            : createToken('live mutation guard:blocked', 'danger')
        }
        ${createToken(
          `latest approval:${guardSummary.latestApprovalDisplayStatus || 'none'}`,
          getApprovalDisplayTone(guardSummary.latestApprovalDisplayStatus || 'none'),
        )}
        ${
          requestSummary.currentPreflightArtifactId
            ? createToken(`current preflight:${requestSummary.currentPreflightArtifactId}`, 'neutral')
            : createToken('current preflight:none', 'warning')
        }
        ${
          guardSummary.targetPreflightArtifactId
            ? createToken(`approval target:${guardSummary.targetPreflightArtifactId}`, 'neutral')
            : ''
        }
        ${
          guardSummary.targetFileCount
            ? createToken(`target files:${guardSummary.targetFileCount}`, 'neutral')
            : createToken('target files:none', 'warning')
        }
        ${
          requestSummary.allowed
            ? createToken('request:available', 'success')
            : createToken('request:disabled', requestSummary.conflict ? 'danger' : 'warning')
        }
        ${
          guardSummary.allowed
            ? createToken('run:available', 'success')
            : createToken('run:disabled', 'warning')
        }
      </div>
      <p class="detail-copy">
        Runtime-derived summary for limited builder live mutation. Execution stays bounded to the latest preflight target files, then hands off to reviewer without auto-starting commit paths.
      </p>
      ${
        guardSummary.reasons?.length
          ? renderReasonList('Live Mutation Guard Reasons', guardSummary.reasons)
          : '<p class="detail-copy">No live mutation guard reasons remain for the latest preflight target.</p>'
      }
      ${
        requestSummary.reasons?.length
          ? renderReasonList('Approval Request Disabled By', requestSummary.reasons)
          : '<p class="detail-copy">Approval request is available for the latest preflight target.</p>'
      }
      ${
        options.includeRequestAction === false
          ? ''
          : `
            <div class="form-actions form-actions-inline">
              <button
                class="secondary-button"
                type="button"
                data-action="request-builder-live-mutation-approval"
                data-id="${escapeHtml(task.id)}"
                ${requestDisabled ? 'disabled' : ''}
              >
                Request Live Mutation Approval
              </button>
              <p class="form-help">${escapeHtml(requestHelp)}</p>
            </div>
            <div class="form-actions form-actions-inline">
              <button
                class="primary-button"
                type="button"
                data-action="run-builder-live-mutation"
                data-id="${escapeHtml(task.id)}"
                ${runDisabled ? 'disabled' : ''}
              >
                Run Live Mutation
              </button>
              <p class="form-help">${escapeHtml(runHelp)}</p>
            </div>
          `
      }
    </div>
  `;
}

function ensureSelection(data) {
  const selectedMission = data.missionMap.get(state.selectedMissionId) || null;
  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedArtifact = data.artifactMap.get(state.selectedArtifactId) || null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  if (!state.selectionSeeded) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
    state.selectedTaskId =
      selectedArtifact?.taskId ||
      selectedRun?.taskId ||
      selectedInboxItem?.taskId ||
      data.tasks[0]?.id ||
      null;

    const initialTask = data.taskMap.get(state.selectedTaskId) || null;
    const initialRun =
      selectedRun ||
      (initialTask?.latestRunId && data.runMap.has(initialTask.latestRunId)
        ? data.runMap.get(initialTask.latestRunId)
        : null);
    const initialArtifact =
      selectedArtifact ||
      (initialRun ? getPreferredArtifactForRun(initialRun, data) : null) ||
      (initialTask ? getPreferredTaskArtifact(initialTask, data) : null) ||
      data.artifacts[0] ||
      null;

    state.selectedRunId = initialRun?.id || null;
    state.selectedArtifactId = initialArtifact?.id || null;
    state.selectedInboxItemId =
      selectedInboxItem?.id ||
      (initialTask ? getPreferredTaskInboxItem(initialTask.id, data)?.id || null : null) ||
      data.inboxItems.find((item) => item.status === 'pending')?.id ||
      data.inboxItems[0]?.id ||
      null;
    state.selectionSeeded = true;
    return;
  }

  if (state.selectedMissionId && !selectedMission) {
    state.selectedMissionId = null;
  }

  if (state.selectedRunId && !selectedRun) {
    state.selectedRunId = null;
  }

  if (state.selectedArtifactId && !selectedArtifact) {
    state.selectedArtifactId = null;
  }

  if (state.selectedInboxItemId && !selectedInboxItem) {
    state.selectedInboxItemId = null;
  }

  if (!state.selectedTaskId || !data.taskMap.has(state.selectedTaskId)) {
    state.selectedTaskId =
      (state.selectedArtifactId && data.artifactMap.get(state.selectedArtifactId)?.taskId) ||
      (state.selectedRunId && data.runMap.get(state.selectedRunId)?.taskId) ||
      (state.selectedInboxItemId && data.inboxItemMap.get(state.selectedInboxItemId)?.taskId) ||
      data.tasks[0]?.id ||
      null;
  }

  if (!state.selectedMissionId || !data.missionMap.has(state.selectedMissionId)) {
    state.selectedMissionId =
      data.snapshot.selectedMissionId && data.missionMap.has(data.snapshot.selectedMissionId)
        ? data.snapshot.selectedMissionId
        : data.missions[0]?.id || null;
  }

  const activeTask = data.taskMap.get(state.selectedTaskId) || null;
  const currentRun = state.selectedRunId ? data.runMap.get(state.selectedRunId) || null : null;
  const currentArtifact = state.selectedArtifactId
    ? data.artifactMap.get(state.selectedArtifactId) || null
    : null;
  const currentInboxItem = state.selectedInboxItemId
    ? data.inboxItemMap.get(state.selectedInboxItemId) || null
    : null;

  if (currentRun && activeTask && currentRun.taskId !== activeTask.id) {
    state.selectedRunId = null;
  }

  if (currentArtifact && activeTask && currentArtifact.taskId !== activeTask.id) {
    state.selectedArtifactId = null;
  }

  if (currentInboxItem && activeTask && currentInboxItem.taskId !== activeTask.id) {
    state.selectedInboxItemId = null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status} ${response.statusText}`);
  }

  return payload;
}

function buildProviderPayload(mode, model, apiKeyVar) {
  const normalizedMode = mode === 'live' ? 'live' : 'local-stub';

  return {
    adapter: normalizedMode === 'live' ? 'openai-responses' : 'local-stub',
    env: {
      apiKeyVar: normalizedMode === 'live' ? apiKeyVar.trim() : '',
    },
    mode: normalizedMode,
    model: normalizedMode === 'live' ? model.trim() : '',
  };
}

function applySnapshotPayload(payload) {
  state.payload = {
    derived: payload.derived || createEmptyDerivedState(),
    generatedAt: payload.generatedAt,
    runtimeRoot: payload.runtimeRoot,
    snapshot: payload.snapshot,
  };

  const snapshot = payload.snapshot || {};
  const activeProject = snapshot.activeProjectId
    ? snapshot.projects?.[snapshot.activeProjectId] || null
    : null;

  if (
    (activeProject && state.projectProviderDraftProjectId !== activeProject.id) ||
    (!activeProject && state.projectProviderDraftProjectId !== null)
  ) {
    syncProjectProviderDraft(activeProject);
  }
}

function resolvePostMutationSurface(currentSurface, payload, fallbackSurface) {
  const inboxItemId = payload?.mutation?.inboxItemId || null;

  if (!inboxItemId) {
    return fallbackSurface;
  }

  const data = getDerived();
  const item = data.inboxItemMap.get(inboxItemId) || null;

  if (item?.status === 'pending' && item.kind === 'decision') {
    return currentSurface;
  }

  return fallbackSurface;
}

async function hydrateSelectedDetails() {
  const runId = state.selectedRunId;
  const artifactId = state.selectedArtifactId;
  const data = getDerived();
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const latestBreakdownArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'breakdown')
    : null;
  const latestPreflightArtifact = selectedTask
    ? getLatestTaskArtifact(selectedTask, data, 'preflight')
    : null;

  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  let selectedArtifactDetail = null;

  await Promise.all([
    runId
      ? fetchJson(`/api/runs/${encodeURIComponent(runId)}/logs`).then((payload) => {
          state.selectedRunLogs = payload;
        })
      : Promise.resolve(),
    artifactId
      ? fetchJson(`/api/artifacts/${encodeURIComponent(artifactId)}`).then((artifactPayload) => {
          selectedArtifactDetail = artifactPayload.artifact;
          state.selectedArtifact = artifactPayload.artifact;
        })
      : Promise.resolve(),
  ]);

  if (latestBreakdownArtifact) {
    if (selectedArtifactDetail?.id === latestBreakdownArtifact.id) {
      state.selectedTaskBreakdownArtifact = selectedArtifactDetail;
    } else {
      const breakdownPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestBreakdownArtifact.id)}`,
      );

      state.selectedTaskBreakdownArtifact = breakdownPayload.artifact;
    }
  }

  if (latestPreflightArtifact) {
    if (selectedArtifactDetail?.id === latestPreflightArtifact.id) {
      state.selectedTaskPreflightArtifact = selectedArtifactDetail;
    } else {
      const preflightPayload = await fetchJson(
        `/api/artifacts/${encodeURIComponent(latestPreflightArtifact.id)}`,
      );

      state.selectedTaskPreflightArtifact = preflightPayload.artifact;
    }
  }
}

async function refreshData() {
  if (state.loading || state.mutating) {
    return;
  }

  state.loading = true;
  state.error = null;
  elements.refreshStatus.textContent = 'Refreshing runtime snapshot…';

  try {
    applySnapshotPayload(await fetchJson('/api/snapshot'));
    const data = getDerived();
    ensureSelection(data);
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `Updated ${formatDate(state.payload?.generatedAt)}`;
  } catch (error) {
    state.error = error;
    render();
    elements.refreshStatus.textContent = 'Failed to load runtime snapshot';
  } finally {
    state.loading = false;
    render();
  }
}

function syncSelectionsFromTask(taskId, options = {}) {
  const data = getDerived();
  const task = data.taskMap.get(taskId);
  const preferredRun =
    options.preferredRunId && data.runMap.has(options.preferredRunId)
      ? data.runMap.get(options.preferredRunId)
      : null;
  const preferredArtifact =
    options.preferredArtifactId && data.artifactMap.has(options.preferredArtifactId)
      ? data.artifactMap.get(options.preferredArtifactId)
      : null;
  const preferredInboxItem =
    options.preferredInboxItemId && data.inboxItemMap.has(options.preferredInboxItemId)
      ? data.inboxItemMap.get(options.preferredInboxItemId)
      : null;
  const currentInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;

  state.selectedTaskId = taskId;
  state.selectionSeeded = true;

  if (preferredRun && preferredRun.taskId === taskId) {
    state.selectedRunId = preferredRun.id;
  } else if (task?.latestRunId && data.runMap.has(task.latestRunId)) {
    state.selectedRunId = task.latestRunId;
  } else {
    state.selectedRunId = null;
  }

  if (preferredArtifact && preferredArtifact.taskId === taskId) {
    state.selectedArtifactId = preferredArtifact.id;
  } else {
    const taskArtifact = getPreferredTaskArtifact(task, data);
    state.selectedArtifactId = taskArtifact?.id || null;
  }

  if (
    preferredInboxItem &&
    preferredInboxItem.taskId === taskId &&
    preferredInboxItem.status === 'pending'
  ) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else if (options.applyTaskInboxPreselect) {
    state.selectedInboxItemId = getPreferredTaskInboxItem(taskId, data)?.id || null;
  } else if (currentInboxItem && currentInboxItem.taskId === taskId) {
    state.selectedInboxItemId = currentInboxItem.id;
  } else if (preferredInboxItem && preferredInboxItem.taskId === taskId) {
    state.selectedInboxItemId = preferredInboxItem.id;
  } else {
    state.selectedInboxItemId =
      data.inboxItems.find((item) => item.taskId === taskId && item.status === 'pending')?.id ||
      data.inboxItems.find((item) => item.taskId === taskId)?.id ||
      null;
  }
}

function syncSelectionsFromMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  state.selectedMissionId = missionId;
  state.selectionSeeded = true;

  if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
    syncSelectionsFromTask(mission.linkedTaskId, {
      applyTaskInboxPreselect: true,
    });
    state.selectedMissionId = missionId;
  }
}

function prepareNextMissionDraft(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  state.surface = 'mission';
  state.selectedMissionId = mission?.id || state.selectedMissionId;
  state.missionDraftTitle = '';
  state.missionDraftGoal = '';
  state.missionDraftConstraints = mission?.constraints || '';
  elements.refreshStatus.textContent = mission
    ? `Prepared next mission draft from ${mission.id}`
    : 'Prepared next mission draft';
}

async function handleSurfaceChange(surface) {
  state.surface = surface;
  render();
}

async function handleSelection(action, id) {
  if (action === 'select-project') {
    await submitSelectProject(id);
    return;
  }

  if (action === 'select-mission') {
    await submitSelectMission(id);
    return;
  }

  if (action === 'open-council') {
    syncSelectionsFromMission(id);
    state.surface = 'council';
  }

  if (action === 'open-execution') {
    syncSelectionsFromMission(id);
    state.surface = 'execution';
  }

  if (action === 'revise-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'open-mission') {
    syncSelectionsFromMission(id);
    state.surface = 'mission';
  }

  if (action === 'prepare-next-mission') {
    prepareNextMissionDraft(id);
  }

  if (action === 'select-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
  }

  if (action === 'open-taskboard-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
    state.surface = 'taskboard';
  }

  if (action === 'create-linked-task-for-mission') {
    await submitCreateLinkedTaskForMission(id);
    return;
  }

  if (action === 'draft-council-for-mission') {
    await submitDraftCouncilForMission(id);
    return;
  }

  if (action === 'approve-council-for-mission') {
    await submitApproveCouncilForMission(id);
    return;
  }

  if (action === 'open-advanced-ops') {
    const data = getDerived();
    const mission = data.missionMap.get(id) || null;

    if (mission?.linkedTaskId && data.taskMap.has(mission.linkedTaskId)) {
      syncSelectionsFromTask(mission.linkedTaskId, {
        applyTaskInboxPreselect: true,
      });
    }

    state.selectedMissionId = mission?.id || state.selectedMissionId;
    state.surface = 'taskboard';
  }

  if (action === 'select-run') {
    const data = getDerived();
    const run = data.runMap.get(id);

    state.selectedRunId = id;

    if (run) {
      const preferredArtifact = getPreferredArtifactForRun(run, data);

      syncSelectionsFromTask(run.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
      });
      state.selectedRunId = id;
    }
  }

  if (action === 'select-artifact') {
    const data = getDerived();
    const artifact = data.artifactMap.get(id);

    state.selectedArtifactId = id;

    if (artifact) {
      const preferredReleaseInboxItem =
        artifact.type === 'release-package'
          ? findPendingApprovalItemByAction(
              artifact.taskId,
              data,
              'release-ready',
              (approval) => approval.metadata?.releasePackageArtifactId === artifact.id,
            )
          : artifact.type === 'commit-result'
            ? findPendingApprovalItemByAction(
                artifact.taskId,
                data,
                'release-ready',
                (approval) => approval.metadata?.commitResultArtifactId === artifact.id,
              )
            : null;

      syncSelectionsFromTask(artifact.taskId, {
        preferredInboxItemId: preferredReleaseInboxItem?.id || null,
      });
      state.selectedArtifactId = id;
      state.selectedRunId = artifact.runId || state.selectedRunId;
    }
  }

  if (action === 'select-inbox-item') {
    const data = getDerived();
    const item = data.inboxItemMap.get(id);

    state.selectedInboxItemId = id;

    if (item) {
      const approval =
        item.kind === 'approval' && item.sourceId
          ? data.approvals.find((candidate) => candidate.id === item.sourceId) || null
          : null;
      const commitPackageArtifactId =
        approval?.allowedNextAction === 'commit-intent'
          ? approval.metadata?.commitPackageArtifactId || null
          : null;
      const releasePackageArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.releasePackageArtifactId || null
          : null;
      const commitResultArtifactId =
        approval?.allowedNextAction === 'release-ready'
          ? approval.metadata?.commitResultArtifactId || null
          : null;
      const commitPackageArtifact =
        commitPackageArtifactId && data.artifactMap.has(commitPackageArtifactId)
          ? data.artifactMap.get(commitPackageArtifactId)
          : null;
      const releasePackageArtifact =
        releasePackageArtifactId && data.artifactMap.has(releasePackageArtifactId)
          ? data.artifactMap.get(releasePackageArtifactId)
          : null;
      const commitResultArtifact =
        commitResultArtifactId && data.artifactMap.has(commitResultArtifactId)
          ? data.artifactMap.get(commitResultArtifactId)
          : null;
      const preferredArtifact = releasePackageArtifact || commitPackageArtifact || commitResultArtifact || null;

      syncSelectionsFromTask(item.taskId, {
        preferredArtifactId: preferredArtifact?.id || null,
        preferredRunId: preferredArtifact?.runId || null,
      });
      state.selectedInboxItemId = id;
    }
  }

  await hydrateSelectedDetails();
  render();
}

async function submitCreateProject(options = {}) {
  const name = state.projectDraftName.trim();
  const projectPath = state.projectDraftPath.trim();
  const provider = options.forceLocalStub
    ? buildProviderPayload('local-stub', '', '')
    : buildProviderPayload(
        state.projectDraftProviderMode,
        state.projectDraftProviderModel,
        state.projectDraftProviderApiKeyVar,
      );

  if (!name) {
    throw new Error('Project name is required');
  }

  if (!projectPath) {
    throw new Error('project_path is required');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = 'Registering project…';
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      provider,
      projectPath,
    });

    state.projectDraftName = '';
    state.projectDraftPath = '';
    state.projectDraftProviderMode = 'local-stub';
    state.projectDraftProviderModel = '';
    state.projectDraftProviderApiKeyVar = '';
    await applyProjectScopePayload(payload);
    if (options.successSurface) {
      state.surface = options.successSurface;
    }
    elements.refreshStatus.textContent = `Active project set to ${payload.project.name}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitUpdateProjectProvider() {
  const data = getDerived();
  const activeProject = data.activeProject;

  if (!activeProject) {
    throw new Error('Active project is required before updating provider config');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Updating provider for ${activeProject.name}…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/provider-config`,
      {
        provider: buildProviderPayload(
          state.projectProviderDraftMode,
          state.projectProviderDraftModel,
          state.projectProviderDraftApiKeyVar,
        ),
      },
    );

    applySnapshotPayload(payload);
    syncProjectProviderDraft(payload.project || null);
    render();
    elements.refreshStatus.textContent = `Provider updated for ${payload.project.name}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedWorktree() {
  const data = getDerived();
  const activeProject = data.activeProject;
  const slug = state.linkedWorktreeDraftSlug.trim();

  if (!activeProject) {
    throw new Error('Active project is required before creating a linked worktree');
  }

  if (!slug) {
    throw new Error('linked worktree slug is required');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Creating linked worktree ${slug}…`;
  render();

  try {
    const payload = await postJson(
      `/api/projects/${encodeURIComponent(activeProject.id)}/linked-worktrees`,
      {
        slug,
      },
    );

    state.linkedWorktreeDraftSlug = '';
    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `Active project set to ${payload.project.name}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectProject(projectId) {
  const dataBefore = getDerived();

  if (!projectId || !dataBefore.snapshot.projects[projectId]) {
    throw new Error('Select a registered project');
  }

  if (projectId === dataBefore.activeProject?.id) {
    return;
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Switching active project to ${projectId}…`;
  render();

  try {
    const payload = await postJson(`/api/projects/${encodeURIComponent(projectId)}/select`);

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `Active project set to ${payload.project.name}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateMission() {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('Active project is required before creating missions');
  }

  const title = state.missionDraftTitle.trim();
  const goal = state.missionDraftGoal.trim();
  const constraints = state.missionDraftConstraints.trim();

  if (!title) {
    throw new Error('Mission title is required');
  }

  if (!goal) {
    throw new Error('Mission goal is required');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = 'Creating mission and drafting council…';
  render();

  try {
    const payload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints,
      goal,
      title,
    });

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(payload.mission.id);
    state.missionDraftTitle = '';
    state.missionDraftGoal = '';
    state.missionDraftConstraints = '';
    state.selectionSeeded = true;
    await hydrateSelectedDetails();
    state.surface = payload.councilSession?.id ? 'council' : 'mission';
    render();
    elements.refreshStatus.textContent = payload.councilSession?.id
      ? `Created mission ${payload.mission.id} and drafted council ${payload.councilSession.id}`
      : `Created mission ${payload.mission.id}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitSelectMission(missionId) {
  const data = getDerived();

  if (!missionId || !data.missionMap.has(missionId)) {
    throw new Error('Select a mission');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Selecting mission ${missionId}…`;
  render();

  try {
    const payload = await postJson(`/api/missions/${encodeURIComponent(missionId)}/select`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `Selected mission ${payload.mission.id}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateLinkedTaskForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('Select a mission before creating a linked task');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Creating linked task for ${missionId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/create-linked-task`,
      {},
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'mission';
    render();
    elements.refreshStatus.textContent = `Created linked task ${payload.task.id}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitDraftCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('Select a mission before drafting council');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Drafting council for ${missionId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/draft-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    await hydrateSelectedDetails();
    state.surface = 'council';
    render();
    elements.refreshStatus.textContent = `Drafted council ${payload.councilSession.id}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitApproveCouncilForMission(missionId) {
  const data = getDerived();
  const mission = data.missionMap.get(missionId) || null;

  if (!mission) {
    throw new Error('Select a mission before approving council');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Approving recommendation for ${missionId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/approve-council`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromMission(missionId);
    if (payload.task?.id) {
      syncSelectionsFromTask(payload.task.id, {
        applyTaskInboxPreselect: true,
        preferredArtifactId:
          payload.mutation?.lastArtifactId || payload.approval?.targetArtifactId || null,
        preferredInboxItemId: payload.item?.id || null,
        preferredRunId: payload.mutation?.lastRunId || null,
      });
    }
    await hydrateSelectedDetails();
    state.surface = 'execution';
    render();
    elements.refreshStatus.textContent = `Aligned mission ${payload.mission.id} and advanced execution to ${payload.mutation?.autoChain?.stoppedAt || 'execution'}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function submitCreateTask() {
  const data = getDerived();

  if (!data.activeProject) {
    throw new Error('Active project is required before creating tasks');
  }

  const title = state.taskDraftTitle.trim();
  const intent = state.taskDraftIntent.trim();

  if (!title) {
    throw new Error('Task title is required');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = 'Creating task…';
  render();

  try {
    const payload = await postJson('/api/tasks', {
      intent,
      title,
    });

    applySnapshotPayload(payload);
    state.error = null;
    state.selectedTaskId = payload.task.id;
    state.selectedRunId = null;
    state.selectedArtifactId = null;
    state.selectedInboxItemId = null;
    state.selectedRunLogs = null;
    state.selectedArtifact = null;
    state.selectedTaskBreakdownArtifact = null;
    state.selectedTaskPreflightArtifact = null;
    state.taskDraftTitle = '';
    state.taskDraftIntent = '';
    state.selectionSeeded = true;
    state.surface = 'taskboard';
    render();
    elements.refreshStatus.textContent = `Created task ${payload.task.id}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runPlanner(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before starting planner run');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Starting planner run for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `Planner run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runArchitect(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before starting architect run');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Starting architect run for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-architect`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `Architect run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runTaskBreaker(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before starting task-breaker run');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Starting task-breaker run for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `Task-breaker run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderPreflight(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before starting builder preflight');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Starting builder preflight for ${taskId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-preflight`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `Builder preflight run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function requestBuilderLiveMutationApproval(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before requesting builder live mutation approval');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Requesting live mutation approval for ${taskId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/request-builder-live-mutation-approval`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.targetArtifactId || null,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.targetRunId || null,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `Requested live mutation approval ${payload.mutation.approvalId}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runBuilderLiveMutation(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before running builder live mutation');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Running live mutation for ${taskId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'logs';
    render();
    elements.refreshStatus.textContent = `Builder live mutation run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReviewer(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before running reviewer');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Running reviewer for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-reviewer`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = resolvePostMutationSurface(currentSurface, payload, 'artifacts');
    render();
    elements.refreshStatus.textContent = `Reviewer run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCommitPackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before preparing a commit package');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Preparing commit package for ${taskId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-commit-package`,
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = currentSurface;
    render();
    elements.refreshStatus.textContent = `Commit package run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runLocalCommit(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before running local commit');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Running local commit for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-local-commit`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `Local commit run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runReleasePackage(taskId) {
  const data = getDerived();
  const currentSurface = state.surface;

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before preparing a release package');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Preparing release package for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-release-package`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredInboxItemId: payload.mutation.inboxItemId || null,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface =
      currentSurface === 'taskboard' || currentSurface === 'artifacts'
        ? currentSurface
        : 'artifacts';
    render();
    elements.refreshStatus.textContent = `Release package run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runCloseOut(taskId) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before running close-out');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Running close-out for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-close-out`);

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      preferredArtifactId: payload.mutation.artifactId,
      preferredRunId: payload.mutation.runId,
    });
    await hydrateSelectedDetails();
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `Close-out run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

function resetProjectScopeSelections() {
  state.selectedMissionId = null;
  state.selectedTaskId = null;
  state.selectedRunId = null;
  state.selectedArtifactId = null;
  state.selectedInboxItemId = null;
  state.selectedRunLogs = null;
  state.selectedArtifact = null;
  state.selectedTaskBreakdownArtifact = null;
  state.selectedTaskPreflightArtifact = null;
  state.selectionSeeded = false;
}

async function applyProjectScopePayload(payload) {
  applySnapshotPayload(payload);
  const data = getDerived();

  resetProjectScopeSelections();
  ensureSelection(data);
  await hydrateSelectedDetails();
  render();
}

async function updateTaskWorktreeRef(taskId, worktreeRef) {
  const data = getDerived();

  if (!taskId || !data.taskMap.has(taskId)) {
    throw new Error('Select a task before updating task.worktreeRef');
  }

  const isClearing = worktreeRef === null;

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = isClearing
    ? `Clearing task.worktreeRef for ${taskId}…`
    : `Applying linked worktree for ${taskId}…`;
  render();

  try {
    const payload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/worktree-ref`, {
      worktreeRef,
    });

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(taskId, {
      applyTaskInboxPreselect: true,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = isClearing
      ? `Cleared task.worktreeRef for ${taskId}`
      : `Updated task.worktreeRef for ${taskId}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function applySelectedTaskWorktree(taskId) {
  const select = document.querySelector('#task-worktree-select');

  if (!select) {
    throw new Error('No linked worktree selection is available');
  }

  const worktreeRef = select.value.trim();

  if (!worktreeRef) {
    throw new Error('Select a linked worktree before applying');
  }

  await updateTaskWorktreeRef(taskId, worktreeRef);
}

async function clearTaskWorktree(taskId) {
  await updateTaskWorktreeRef(taskId, null);
}

async function switchActiveProjectWorktree(worktreePath) {
  const data = getDerived();
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const option =
    (activeProjectLinkedWorktrees.options || []).find((candidate) => candidate.path === worktreePath) || null;

  if (!data.activeProject) {
    throw new Error('Active project is required before switching to a linked worktree');
  }

  if (!option) {
    throw new Error('Select a detected linked worktree before switching active project');
  }

  if (option.isCurrentProjectPath) {
    return;
  }

  if (option.registeredProjectId) {
    await submitSelectProject(option.registeredProjectId);
    return;
  }

  const name = option.suggestedProjectName || buildLinkedWorktreeFallbackName(option);

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `Registering linked worktree ${worktreePath} as the active project…`;
  render();

  try {
    const payload = await postJson('/api/projects', {
      name,
      projectPath: option.path,
    });

    await applyProjectScopePayload(payload);
    elements.refreshStatus.textContent = `Active project set to ${payload.project.name}`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runInboxAction(itemId, verb) {
  const data = getDerived();
  const item = data.inboxItemMap.get(itemId);
  const previousRunId = state.selectedRunId;
  const previousArtifactId = state.selectedArtifactId;

  if (!item) {
    throw new Error('Select a pending inbox item before taking action');
  }

  state.error = null;
  state.mutating = true;
  elements.refreshStatus.textContent = `${verb} ${itemId}…`;
  render();

  try {
    const payload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(itemId)}/actions`,
      { verb },
    );

    applySnapshotPayload(payload);
    state.error = null;
    syncSelectionsFromTask(payload.mutation.taskId, {
      applyTaskInboxPreselect: true,
      preferredArtifactId: previousArtifactId,
      preferredRunId: previousRunId,
    });
    await hydrateSelectedDetails();
    render();
    elements.refreshStatus.textContent = `${verb} ${payload.mutation.itemId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

function renderSummary(data) {
  const activeProject = data.activeProject;
  const activeRuns = data.runs.filter((run) => run.status === 'running').length;
  const pendingGates = data.inboxItems.filter((item) => item.status === 'pending').length;

  elements.activeProjectName.textContent = activeProject?.name || 'No project selected';
  elements.activeProjectPath.textContent = activeProject?.projectPath || 'project_path required before execution';
  elements.runtimeRoot.textContent = state.payload?.runtimeRoot || 'Unavailable';
  elements.activeRunCount.textContent = String(activeRuns);
  elements.pendingGateCount.textContent = String(pendingGates);
  elements.refreshButton.disabled = state.loading || state.mutating;
}

function renderNav(data) {
  const pendingInboxCount = data.inboxItems.filter((item) => item.status === 'pending').length;
  const artifactCount = data.artifacts.length;
  const councilCount = data.councilSessions.length;
  const executionCount = data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  const deliverableCount = data.missions.filter((mission) => Boolean(mission.linkedTaskId)).length;
  const missionCount = data.missions.length;
  const runCount = data.runs.length;
  const taskCount = data.tasks.length;

  for (const button of elements.navButtons) {
    const surface = button.dataset.surface;
    const isActive = surface === state.surface;
    button.classList.toggle('is-active', isActive);

    let count = 0;
    if (surface === 'mission') {
      count = missionCount;
    }
    if (surface === 'council') {
      count = councilCount;
    }
    if (surface === 'execution') {
      count = executionCount;
    }
    if (surface === 'deliverables') {
      count = deliverableCount;
    }
    if (surface === 'taskboard') {
      count = taskCount;
    }
    if (surface === 'logs') {
      count = runCount;
    }
    if (surface === 'artifacts') {
      count = artifactCount;
    }
    if (surface === 'decision-inbox') {
      count = pendingInboxCount;
    }

    const label =
      button.dataset.surface === 'decision-inbox'
        ? 'Decision Inbox'
        : button.dataset.surface.charAt(0).toUpperCase() + button.dataset.surface.slice(1);
    button.textContent = `${label} (${count})`;
  }
}

function renderProjectBootstrapPanel(data, options = {}) {
  const mode = options.mode === 'mission' ? 'mission' : 'advanced';
  const missionMode = mode === 'mission';
  const bootstrapState = missionMode
    ? data.projects.length === 0
      ? {
          copy: 'Register the first local project here, then move directly into mission creation.',
          title: 'Mission Start',
        }
      : {
          copy: 'Select a registered project here or register a new one, then continue on the mission path.',
          title: 'Mission Project Access',
        }
    : getProjectBootstrapState(data);
  const projectActionDisabled = state.loading || state.mutating;
  const linkedWorktreeActionDisabled = projectActionDisabled || !data.activeProject;
  const linkedWorktreePanel = missionMode
    ? ''
    : renderLinkedWorktreeSwitchPanel(data, projectActionDisabled);
  const createProjectProviderMode =
    state.projectDraftProviderMode === 'live' ? 'live' : 'local-stub';
  const activeProjectProviderConfig = getProjectProviderConfig(data.activeProject);
  const activeProjectProviderSummary = getProviderExecutionSummary(data.activeProject, data);
  const activeProjectBaseName = data.activeProject
    ? data.activeProject.projectPath.split('/').filter(Boolean).pop() || 'project'
    : 'project';
  const projectList = data.projects.length
    ? `
        <div class="project-list">
          ${data.projects
            .map(
              (project) => {
                const providerConfig = getProjectProviderConfig(project);
                const providerSummary = getProviderExecutionSummary(project, data);

                return `
                  <button
                    class="list-button ${project.id === data.activeProject?.id ? 'is-selected' : ''}"
                    type="button"
                    data-action="select-project"
                    data-id="${escapeHtml(project.id)}"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <div class="card-title-row">
                      <strong>${escapeHtml(project.name)}</strong>
                      ${
                        project.id === data.activeProject?.id
                          ? createToken('active', 'success')
                          : createToken('registered', 'neutral')
                      }
                    </div>
                    <p class="list-copy">${escapeHtml(project.projectPath)}</p>
                    <div class="token-row">
                      ${createToken(project.pack || 'development', 'neutral')}
                      ${createToken(`readiness:${project.readiness || 'unknown'}`, 'neutral')}
                      ${
                        missionMode
                          ? ''
                          : createToken(`provider:${providerConfig.adapter}`, providerConfig.mode === 'live' ? 'accent' : 'neutral')
                      }
                      ${
                        missionMode
                          ? ''
                          : providerSummary
                            ? createToken(
                                `provider readiness:${providerSummary.readiness || 'unknown'}`,
                                providerSummary.allowed
                                  ? 'success'
                                  : providerSummary.readiness === 'error'
                                    ? 'danger'
                                    : 'warning',
                              )
                            : ''
                      }
                    </div>
                  </button>
                `;
              },
            )
            .join('')}
        </div>
      `
    : `
        <div class="empty-state">
          <strong>No registered projects</strong>
          <p>Start by registering a local project path.</p>
        </div>
      `;

  return `
    <section class="project-bootstrap">
      <div class="panel-header">
        <div>
          <h3>${escapeHtml(bootstrapState.title)}</h3>
          <p class="panel-copy">${escapeHtml(bootstrapState.copy)}</p>
        </div>
        ${
          data.activeProject
            ? `<div class="token-row">
                ${createToken(`active:${data.activeProject.name}`, 'success')}
              </div>`
            : ''
        }
      </div>
      ${projectList}
      ${linkedWorktreePanel}
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="update-project-provider">
              <div class="panel-header">
                <div>
                  <h4>Execution Provider</h4>
                  <p class="panel-copy">Project-level opt-in only. Default stays local-stub, and live mode never falls back silently.</p>
                </div>
                <div class="token-row">
                  ${createToken(`provider:${activeProjectProviderConfig.adapter}`, activeProjectProviderConfig.mode === 'live' ? 'accent' : 'neutral')}
                  ${
                    activeProjectProviderSummary
                      ? createToken(
                          `provider readiness:${activeProjectProviderSummary.readiness || 'unknown'}`,
                          activeProjectProviderSummary.allowed
                            ? 'success'
                            : activeProjectProviderSummary.readiness === 'error'
                              ? 'danger'
                              : 'warning',
                        )
                      : ''
                  }
                </div>
              </div>
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">Mode</span>
                  <select
                    name="editProjectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${state.projectProviderDraftMode === 'local-stub' ? 'selected' : ''}>local-stub</option>
                    <option value="live" ${state.projectProviderDraftMode === 'live' ? 'selected' : ''}>openai-responses</option>
                  </select>
                </label>
                ${
                  state.projectProviderDraftMode === 'live'
                    ? `
                      <label class="field">
                        <span class="field-label">Model</span>
                        <input
                          type="text"
                          name="editProjectProviderModel"
                          value="${escapeHtml(state.projectProviderDraftModel)}"
                          placeholder="operator-chosen-model"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                      <label class="field">
                        <span class="field-label">API Key Env Var</span>
                        <input
                          type="text"
                          name="editProjectProviderApiKeyVar"
                          value="${escapeHtml(state.projectProviderDraftApiKeyVar)}"
                          placeholder="OPENAI_API_KEY"
                          ${projectActionDisabled ? 'disabled' : ''}
                        >
                      </label>
                    `
                    : ''
                }
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
                  Update Provider
                </button>
                <p class="form-help">
                  ${
                    activeProjectProviderSummary?.reasons?.length
                      ? escapeHtml(activeProjectProviderSummary.reasons[0])
                      : 'Only non-secret metadata is stored here. Live mode enables planner, architect, task-breaker, builder preflight, builder live mutation, and reviewer when model and env are valid. Commit-package, local commit, release-package, and close-out remain explicit downstream local steps.'
                  }
                </p>
              </div>
            </form>
          `
          : ''
      }
      ${
        data.activeProject && !missionMode
          ? `
            <form class="task-create-form project-create-form" data-form="create-linked-worktree">
              <div class="field-grid">
                <label class="field">
                  <span class="field-label">Worktree Slug</span>
                  <input
                    type="text"
                    name="linkedWorktreeSlug"
                    value="${escapeHtml(state.linkedWorktreeDraftSlug)}"
                    placeholder="feature-x"
                    ${linkedWorktreeActionDisabled ? 'disabled' : ''}
                  >
                </label>
              </div>
              <div class="form-actions">
                <button class="secondary-button" type="submit" ${linkedWorktreeActionDisabled ? 'disabled' : ''}>
                  Create Linked Worktree
                </button>
                <p class="form-help">Creates branch <code>worktree/&lt;slug&gt;</code> at sibling <code>${escapeHtml(`${activeProjectBaseName}--<slug>`)}</code>, then reuses project register/select to make the new linked root active. Existing branch or path collisions fail so use the detected switch list instead.</p>
              </div>
            </form>
          `
          : ''
      }
      <form class="task-create-form project-create-form" data-form="${missionMode ? 'create-project-from-mission' : 'create-project'}">
        <div class="field-grid">
          <label class="field">
            <span class="field-label">Project Name</span>
            <input
              type="text"
              name="projectName"
              value="${escapeHtml(state.projectDraftName)}"
              placeholder="orchestration"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          <label class="field">
            <span class="field-label">project_path</span>
            <input
              type="text"
              name="projectPath"
              value="${escapeHtml(state.projectDraftPath)}"
              placeholder="/absolute/path/to/project"
              ${projectActionDisabled ? 'disabled' : ''}
            >
          </label>
          ${
            !missionMode
              ? `
                <label class="field">
                  <span class="field-label">Provider Mode</span>
                  <select
                    name="projectProviderMode"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                    <option value="local-stub" ${createProjectProviderMode === 'local-stub' ? 'selected' : ''}>local-stub</option>
                    <option value="live" ${createProjectProviderMode === 'live' ? 'selected' : ''}>openai-responses</option>
                  </select>
                </label>
              `
              : ''
          }
          ${
            !missionMode && createProjectProviderMode === 'live'
              ? `
                <label class="field">
                  <span class="field-label">Provider Model</span>
                  <input
                    type="text"
                    name="projectProviderModel"
                    value="${escapeHtml(state.projectDraftProviderModel)}"
                    placeholder="operator-chosen-model"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
                <label class="field">
                  <span class="field-label">API Key Env Var</span>
                  <input
                    type="text"
                    name="projectProviderApiKeyVar"
                    value="${escapeHtml(state.projectDraftProviderApiKeyVar)}"
                    placeholder="OPENAI_API_KEY"
                    ${projectActionDisabled ? 'disabled' : ''}
                  >
                </label>
              `
              : ''
          }
        </div>
        <div class="form-actions">
          <button class="secondary-button" type="submit" ${projectActionDisabled ? 'disabled' : ''}>
            ${missionMode ? 'Start With This Project' : 'Register Project'}
          </button>
          <p class="form-help">
            ${
              missionMode
                ? 'Mission registration always starts local-stub by default. Provider and linked worktree controls stay in Advanced Ops Mode.'
                : createProjectProviderMode === 'live'
                ? 'Live mode stores non-secret opt-in metadata only. Planner, architect, task-breaker, builder preflight, builder live mutation, and reviewer can execute live when model and env are valid; commit-package, local commit, release-package, and close-out stay explicit local follow-up.'
                : 'Registration stores the project, keeps local-stub as the default execution provider, and makes the project active.'
            }
          </p>
        </div>
      </form>
    </section>
  `;
}

function renderMission(data) {
  if (!data.activeProject) {
    elements.surfaces.mission.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>Mission</h2>
              <p class="panel-copy">Pick the project first, then create the mission.</p>
            </div>
            <div class="token-row">
              ${createToken(`registered-projects:${data.projects.length}`, data.projects.length > 0 ? 'neutral' : 'warning')}
            </div>
          </div>
          ${renderProjectBootstrapPanel(data, { mode: 'mission' })}
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>Mission Entry</h2>
              <p class="panel-copy">Project starts here. Advanced Ops keeps provider, worktree, and operator detail.</p>
            </div>
          </div>
          <div class="stack">
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>Recommended First Step</strong>
                ${createToken('orchestration-first', 'success')}
              </div>
              <p class="detail-copy">Pick a project above, then create the first mission.</p>
            </section>
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>Still In Advanced Ops</strong>
                ${createToken('provider/worktree/detail', 'warning')}
              </div>
              <p class="detail-copy">Provider, worktree, logs, artifacts, and decisions stay in Advanced Ops.</p>
            </section>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedMissionCompletion = getMissionCompletionSummary(selectedMission, data);
  const selectedMissionCouncilPreview = getMissionCouncilPreview(selectedMission, data);
  const selectedMissionExecutionPreview = getMissionExecutionPreview(selectedMission, data);
  const selectedMissionDeliverablesPreview = getMissionDeliverablesPreview(selectedMission, data);
  const selectedMissionNextActionPreview = getMissionNextActionPreview(selectedMission, {
    completion: selectedMissionCompletion,
    council: selectedMissionCouncilPreview,
    deliverables: selectedMissionDeliverablesPreview,
    execution: selectedMissionExecutionPreview,
  });
  const linkedTask = selectedMissionCompletion.linkedTask;
  const closeOutState = selectedMissionCompletion.closeOutState;
  const missionCompletionReady = selectedMissionCompletion.completionReady;
  const missionCompletionArtifactId = selectedMissionCompletion.closeOutArtifactId;
  const missionCompletionReleasePackageId = selectedMissionCompletion.releasePackageArtifactId;
  const selectedCouncilSession = selectedMissionCouncilPreview.councilSession;
  const selectedMissionActiveSnapshotItems = missionCompletionReady
    ? []
    : [
        {
          label: 'Council Preview',
          copy: selectedCouncilSession
            ? `${selectedMissionCouncilPreview.recommendationPreview} Alignment ${selectedMissionCouncilPreview.alignmentStatus}.`
            : 'Draft council to populate the current recommendation.',
          handoffCopy: 'See Council for recommendation detail and alignment.',
          surface: 'council',
          tone: selectedCouncilSession
            ? getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus)
            : 'warning',
        },
        {
          label: 'Execution Preview',
          copy: selectedMissionExecutionPreview.stagePreview,
          handoffCopy: 'See Execution for current gate and blocked reason.',
          surface: 'execution',
          tone: 'accent',
        },
        {
          label: 'Deliverables Preview',
          copy: selectedMissionDeliverablesPreview.previewLine,
          handoffCopy: 'See Deliverables for artifact, review, and approval detail.',
          surface: 'deliverables',
          tone: 'neutral',
        },
        {
          label: 'Current Best Next Step',
          copy: selectedMissionNextActionPreview.summary,
          handoffCopy: `Current owner surface is ${getSurfaceDisplayName(selectedMissionNextActionPreview.surface)}.`,
          surface: selectedMissionNextActionPreview.surface,
          tone: selectedMissionNextActionPreview.tone,
        },
      ];
  const missionCreateDisabled = state.loading || state.mutating;
  const linkedTaskCreateDisabled =
    state.loading || state.mutating || !selectedMission || Boolean(selectedMission.linkedTaskId);
  const missionEntries = data.missions.map((mission) => ({
    councilPreview: getMissionCouncilPreview(mission, data),
    completion: getMissionCompletionSummary(mission, data),
    deliverablesPreview: getMissionDeliverablesPreview(mission, data),
    executionPreview: getMissionExecutionPreview(mission, data),
    nextActionPreview: getMissionNextActionPreview(mission, {
      completion: getMissionCompletionSummary(mission, data),
      council: getMissionCouncilPreview(mission, data),
      deliverables: getMissionDeliverablesPreview(mission, data),
      execution: getMissionExecutionPreview(mission, data),
    }),
    mission,
  }));
  const activeMissionEntries = missionEntries.filter(({ completion }) => !completion.completionReady);
  const completedMissionEntries = missionEntries.filter(({ completion }) => completion.completionReady);
  const renderMissionRows = (entries, emptyTitle, emptyCopy) => {
    if (entries.length === 0) {
      return `
        <div class="empty-state empty-state-inline">
          <strong>${escapeHtml(emptyTitle)}</strong>
          <p>${escapeHtml(emptyCopy)}</p>
        </div>
      `;
    }

    return `
      <div class="project-list">
        ${entries
          .map(({ mission, completion, councilPreview, deliverablesPreview, executionPreview, nextActionPreview }) => {
            const missionTask = completion.linkedTask;
            const missionSurfaceLabel = getSurfaceDisplayName(nextActionPreview.surface);
            const missionRowSummary = completion.completionReady
              ? `Completed · close-out artifact ${completion.closeOutArtifactId}. Linked task ${mission.linkedTaskId || 'none'} is sealed and next cycle is ready on Mission.`
              : `Council · ${councilPreview.alignmentStatus}. Execution · ${
                  missionTask ? missionTask.lifecycleState : 'no linked task'
                }. Deliverables · ${
                  deliverablesPreview.currentDeliverableArtifact?.type || 'none'
                }, review ${deliverablesPreview.latestReviewStatus}, approval ${
                  deliverablesPreview.latestApproval?.status || 'none'
                }.`;
            const missionRowNextCopy = completion.completionReady
              ? 'Next owner · Mission via Prepare Next Mission.'
              : `Next owner · ${missionSurfaceLabel} via ${nextActionPreview.actionLabel}.`;
            const missionRowTokens = completion.completionReady
              ? `
                  ${createToken('completion:sealed', 'success')}
                  ${createToken('next-cycle:ready', 'success')}
                  ${
                    mission.linkedTaskId
                      ? createToken(`linked-task:${mission.linkedTaskId}`, 'accent')
                      : createToken('linked-task:none', 'warning')
                  }
                  ${
                    completion.closeOutArtifactId
                      ? createToken(`close-out:${completion.closeOutArtifactId}`, 'neutral')
                      : ''
                  }
                `
              : `
                  ${
                    mission.linkedTaskId
                      ? createToken(`linked-task:${mission.linkedTaskId}`, 'accent')
                      : createToken('linked-task:none', 'warning')
                  }
                  ${
                    missionTask ? createToken(`task:${missionTask.lifecycleState}`, 'neutral') : ''
                  }
                  ${
                    councilPreview.councilSession
                      ? createToken(
                          `alignment:${councilPreview.alignmentStatus}`,
                          getAlignmentTone(councilPreview.alignmentStatus),
                        )
                      : createToken('alignment:none', 'warning')
                  }
                  ${
                    executionPreview.actionLabel
                      ? createToken(`gate:${executionPreview.actionLabel}`, 'neutral')
                      : ''
                  }
                  ${
                    deliverablesPreview.currentDeliverableArtifact
                      ? createToken(
                          `artifact:${deliverablesPreview.currentDeliverableArtifact.type}`,
                          'neutral',
                        )
                      : ''
                  }
                  ${createToken(`next:${nextActionPreview.surface}`, nextActionPreview.tone)}
                  ${missionTask?.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
                  ${missionTask?.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
                  ${missionTask?.flags?.blocked ? createToken('blocked', 'danger') : ''}
                `;

            return `
              <button
                class="list-button ${mission.id === selectedMission?.id ? 'is-selected' : ''}"
                type="button"
                data-action="select-mission"
                data-id="${escapeHtml(mission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
                >
                  <div class="card-title-row">
                    <strong>${escapeHtml(mission.title)}</strong>
                    ${createToken(mission.status || 'draft', getMissionStatusTone(mission.status))}
                  </div>
                  <p class="list-copy">${escapeHtml(mission.goal || 'No mission goal recorded.')}</p>
                  <p class="detail-copy">${escapeHtml(missionRowSummary)}</p>
                  <p class="detail-copy">${escapeHtml(missionRowNextCopy)}</p>
                  <div class="token-row">${missionRowTokens}</div>
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  };
  const missionList = data.missions.length
    ? `
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Active Missions</strong>
              <div class="token-row">
                ${createToken(`count:${activeMissionEntries.length}`, activeMissionEntries.length > 0 ? 'neutral' : 'warning')}
              </div>
            </div>
            <p class="detail-copy">Current bounded work stays here.</p>
          </section>
          ${renderMissionRows(
            activeMissionEntries,
            'No active missions',
            'Prepare the next mission when the next bounded cycle is ready.',
          )}
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Completed Missions</strong>
              <div class="token-row">
                ${createToken(`count:${completedMissionEntries.length}`, completedMissionEntries.length > 0 ? 'success' : 'neutral')}
              </div>
            </div>
            <p class="detail-copy">Sealed rows wait here for the next cycle.</p>
          </section>
          ${renderMissionRows(
            completedMissionEntries,
            'No completed missions yet',
            'Completed rows land here after close-out seals the path.',
          )}
        </div>
      `
    : `
        <div class="empty-state">
          <strong>No missions yet</strong>
          <p>Create the first mission above, then add the linked task when execution is needed.</p>
        </div>
      `;

  elements.surfaces.mission.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>Mission</h2>
            <p class="panel-copy panel-copy-tight">Intent starts here. Task-level execution stays in Advanced Ops.</p>
          </div>
          <div class="token-row token-row-compact">
            ${createToken(`project:${data.activeProject.name}`, 'success')}
            ${createToken(`missions:${data.missions.length}`, 'neutral')}
          </div>
        </div>
        <form class="task-create-form task-create-form-compact" data-form="create-mission">
          <div class="field-grid field-grid-compact">
            <label class="field field-compact">
              <span class="field-label">Title</span>
              <input
                type="text"
                name="missionTitle"
                value="${escapeHtml(state.missionDraftTitle)}"
                placeholder="Mission title"
                ${missionCreateDisabled ? 'disabled' : ''}
              >
            </label>
            <label class="field field-compact">
              <span class="field-label">Goal</span>
              <textarea
                name="missionGoal"
                rows="3"
                placeholder="What should the system make or improve?"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftGoal)}</textarea>
            </label>
            <label class="field field-compact">
              <span class="field-label">Scope</span>
              <textarea
                name="missionConstraints"
                rows="3"
                placeholder="Scope limits or acceptance hints"
                ${missionCreateDisabled ? 'disabled' : ''}
              >${escapeHtml(state.missionDraftConstraints)}</textarea>
            </label>
          </div>
          <div class="form-actions form-actions-inline form-actions-compact">
            <button class="primary-button" type="submit" ${missionCreateDisabled ? 'disabled' : ''}>Create Mission</button>
            <div class="token-row">
              ${createToken('council:auto-draft', 'success')}
            </div>
          </div>
        </form>
        ${missionList}
      </section>
      <aside class="detail-card">
        <div class="panel-header panel-header-tight">
          <div>
            <h2>Mission Detail</h2>
            <p class="panel-copy panel-copy-tight">Mission stays primary. Advanced Ops stays secondary.</p>
          </div>
        </div>
        ${
          selectedMission
            ? `
              <div class="token-row token-row-compact">
                ${createToken(selectedMission.status || 'draft', getMissionStatusTone(selectedMission.status))}
                ${
                  selectedMission.linkedTaskId
                    ? createToken(`linked-task:${selectedMission.linkedTaskId}`, 'accent')
                    : createToken('linked-task:none', 'warning')
                }
              </div>
              <div class="stack">
                <section class="relation-strip relation-strip-compact">
                  <div class="card-title-row card-title-row-tight">
                    <strong>${escapeHtml(selectedMission.title)}</strong>
                  </div>
                  <p class="detail-copy detail-copy-compact">${escapeHtml(selectedMission.goal || 'No mission goal recorded.')}</p>
                </section>
                ${
                  missionCompletionReady
                    ? `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>Execution Preview</strong>
                        </div>
                        <div class="token-row">
                          ${
                            linkedTask ? createToken(`task:${linkedTask.lifecycleState}`, 'neutral') : createToken('task:none', 'warning')
                          }
                          ${
                            selectedMissionExecutionPreview.actionLabel
                              ? createToken(`gate:${selectedMissionExecutionPreview.actionLabel}`, 'neutral')
                              : createToken('gate:none', 'warning')
                          }
                          ${linkedTask?.flags?.blocked ? createToken('blocked', 'danger') : ''}
                          ${linkedTask?.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
                          ${linkedTask?.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionExecutionPreview.stagePreview)}</p>
                        <p class="detail-copy">
                          <strong>Current Gate Preview</strong>: ${escapeHtml(selectedMissionExecutionPreview.gatePreview)}
                        </p>
                        <p class="detail-copy">
                          <strong>Blocked Reason</strong>: ${escapeHtml(selectedMissionExecutionPreview.blockedReason)}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>Deliverables Preview</strong>
                        </div>
                        <div class="token-row">
                          ${
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? createToken(
                                  `artifact:${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type}`,
                                  'neutral',
                                )
                              : createToken('artifact:none', 'warning')
                          }
                          ${createToken(
                            `review:${selectedMissionDeliverablesPreview.latestReviewStatus}`,
                            getReviewTone(selectedMissionDeliverablesPreview.latestReviewStatus),
                          )}
                          ${
                            selectedMissionDeliverablesPreview.latestApproval
                              ? createToken(
                                  `approval:${selectedMissionDeliverablesPreview.latestApproval.status}`,
                                  getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                )
                              : createToken('approval:none', 'neutral')
                          }
                        </div>
                        <p class="detail-copy">
                          <strong>Latest Artifact Preview</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.currentDeliverableArtifact
                              ? `${selectedMissionDeliverablesPreview.currentDeliverableArtifact.type} ${selectedMissionDeliverablesPreview.currentDeliverableArtifact.id} is the current bounded output head.`
                              : 'No artifact package exists yet.',
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>Review State</strong>: ${escapeHtml(
                            `Current review status is ${selectedMissionDeliverablesPreview.latestReviewStatus}.`,
                          )}
                        </p>
                        <p class="detail-copy">
                          <strong>Approval State</strong>: ${escapeHtml(
                            selectedMissionDeliverablesPreview.latestApproval
                              ? `${selectedMissionDeliverablesPreview.latestApproval.id} is ${selectedMissionDeliverablesPreview.latestApproval.status}.`
                              : 'No approval record exists yet.',
                          )}
                        </p>
                      </section>
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>Current Best Next Step</strong>
                        </div>
                        <div class="token-row">
                          ${createToken(`surface:${selectedMissionNextActionPreview.surface}`, selectedMissionNextActionPreview.tone)}
                          ${createToken(`action:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                        </div>
                        <p class="detail-copy">${escapeHtml(selectedMissionNextActionPreview.summary)}</p>
                      </section>
                    `
                    : `
                      <section class="relation-strip">
                        <div class="card-title-row">
                          <strong>Mission Snapshot</strong>
                          <div class="token-row">
                            ${
                              selectedCouncilSession
                                ? createToken(
                                    `alignment:${selectedMissionCouncilPreview.alignmentStatus}`,
                                    getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                                  )
                                : createToken('alignment:none', 'warning')
                            }
                            ${
                              linkedTask
                                ? createToken(`task:${linkedTask.lifecycleState}`, 'neutral')
                                : createToken('task:none', 'warning')
                            }
                            ${
                              selectedMissionDeliverablesPreview.latestApproval
                                ? createToken(
                                    `approval:${selectedMissionDeliverablesPreview.latestApproval.status}`,
                                    getApprovalTone(selectedMissionDeliverablesPreview.latestApproval.status),
                                  )
                                : createToken('approval:none', 'neutral')
                            }
                            ${createToken(
                              `surface:${selectedMissionNextActionPreview.surface}`,
                              selectedMissionNextActionPreview.tone,
                            )}
                            ${createToken(`action:${selectedMissionNextActionPreview.actionLabel}`, 'neutral')}
                          </div>
                        </div>
                        <p class="detail-copy">One strip keeps council, execution, deliverables, and next step together.</p>
                        ${renderMissionSnapshotList(selectedMissionActiveSnapshotItems)}
                      </section>
                    `
                }
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Linked Task</strong>
                  </div>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`${linkedTask.id} is ready in ${linkedTask.lifecycleState}.`)
                        : 'No linked task exists yet for this mission.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Mission Actions</strong>
                  </div>
                  <p class="detail-copy">Primary actions live here. Advanced Ops stays secondary.</p>
                  <div class="form-actions form-actions-inline">
                    ${
                      selectedCouncilSession
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-council"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            Open Council
                          </button>
                        `
                        : `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="draft-council-for-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            Draft Council
                          </button>
                        `
                    }
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="create-linked-task-for-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${linkedTaskCreateDisabled ? 'disabled' : ''}
                    >
                      Create Linked Task
                    </button>
                    ${
                      linkedTask
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-execution"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            Open Execution
                          </button>
                        `
                        : ''
                    }
                  </div>
                  ${
                    missionCompletionReady
                      ? `
                        <div class="form-actions form-actions-inline">
                          <button
                            class="primary-button"
                            type="button"
                            data-action="prepare-next-mission"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            Prepare Next Mission
                          </button>
                        </div>
                      `
                      : ''
                  }
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-advanced-ops"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Advanced Ops Mode
                    </button>
                    <p class="form-help">Linked task setup stays on the v1 engine. Advanced Ops remains secondary.</p>
                  </div>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Mission Completion</strong>
                  </div>
                  <div class="token-row">
                    ${
                          linkedTask
                            ? createToken(
                                `task:${linkedTask.lifecycleState}`,
                                linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                              )
                            : createToken('task:none', 'warning')
                        }
                        ${
                          missionCompletionReady
                            ? createToken('state:complete', 'success')
                            : createToken('state:open', 'warning')
                        }
                        ${
                          missionCompletionArtifactId
                            ? createToken(`close-out:${missionCompletionArtifactId}`, 'neutral')
                            : ''
                        }
                  </div>
                  <p class="detail-copy">
                    ${
                      missionCompletionReady
                        ? escapeHtml(
                            `${selectedMission.title} completed the bounded orchestration path and closed through close-out artifact ${missionCompletionArtifactId}.`,
                          )
                        : 'Mission completion summary appears here after the linked task reaches Done through the bounded close-out path.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>Current Mission State</strong>: ${
                      missionCompletionReady
                        ? escapeHtml(
                            `Task ${linkedTask.id} is Done. Source release bundle ${missionCompletionReleasePackageId || 'unknown'} is anchored to the saved close-out result.`,
                          )
                        : linkedTask
                          ? escapeHtml(
                              `Task ${linkedTask.id} is currently ${linkedTask.lifecycleState}. Complete the bounded path through close-out to seal mission completion.`,
                            )
                          : 'No linked task exists yet.'
                    }
                  </p>
                  <p class="detail-copy">
                    <strong>Next Safe Follow-Up</strong>: ${
                      missionCompletionReady
                        ? 'Review the saved close-out bundle on Deliverables, then start a new mission or revise this mission for the next bounded outcome. Push, publish, and external release remain out of scope here.'
                        : 'Use Council or Execution to keep advancing the current bounded path. Completion stays unset until the close-out bundle is saved.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Council</strong>
                  </div>
                  ${
                    selectedCouncilSession
                      ? `
                        <div class="token-row">
                          ${createToken(
                            `alignment:${selectedMissionCouncilPreview.alignmentStatus}`,
                            getAlignmentTone(selectedMissionCouncilPreview.alignmentStatus),
                          )}
                          ${createToken(
                            `participants:${selectedMissionCouncilPreview.participantCount}`,
                            'neutral',
                          )}
                          ${
                            selectedMissionCouncilPreview.openQuestionsCount > 0
                              ? createToken(
                                  `open-questions:${selectedMissionCouncilPreview.openQuestionsCount}`,
                                  'warning',
                                )
                              : createToken('open-questions:0', 'success')
                          }
                        </div>
                      `
                      : ''
                  }
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `${selectedCouncilSession.id} is ${selectedCouncilSession.status} with alignment ${selectedCouncilSession.alignment?.status || 'pending'}.`,
                          )
                        : 'No council session yet for this mission.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `Recommendation Preview: ${selectedMissionCouncilPreview.recommendationPreview}`,
                          )
                        : 'Recommendation Preview: Draft council to populate the current recommendation.'
                    }
                  </p>
                  <p class="detail-copy">
                    ${
                      selectedCouncilSession
                        ? escapeHtml(
                            `Alignment State: ${selectedMissionCouncilPreview.alignmentStatus}. Selected plan ${selectedMissionCouncilPreview.selectedPlanTitle}.`,
                          )
                        : 'Alignment State: unavailable until a council session exists.'
                    }
                  </p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Constraints</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedMission.constraints || 'No explicit constraints recorded.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Advanced Ops Mode</strong>
                  </div>
                  <p class="detail-copy">Secondary escape hatch for full Taskboard control.</p>
                  <p class="detail-copy">
                    ${
                      linkedTask
                        ? escapeHtml(`Opens Taskboard with linked task ${linkedTask.id} selected.`)
                        : 'Opens Taskboard without changing mission scope.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>No mission selected</strong>
                <p>Select or create a mission.</p>
              </div>
            `
        }
      </aside>
    </div>
  `;
}

function renderCouncil(data) {
  if (!data.activeProject) {
    elements.surfaces.council.innerHTML = renderProjectGateSurface(
      'Council Unavailable',
      'Register or select a project on Taskboard before opening council.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;
  const selectedCouncilSession =
    selectedMission?.councilSessionId && data.councilSessionMap.has(selectedMission.councilSessionId)
      ? data.councilSessionMap.get(selectedMission.councilSessionId)
      : null;
  const linkedTask =
    selectedMission?.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!selectedMission) {
    elements.surfaces.council.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>No mission selected</strong>
          <p>Create or select a mission on the Mission surface before opening council.</p>
        </div>
      </div>
    `;
    return;
  }

  const councilDraftDisabled =
    state.loading || state.mutating || Boolean(selectedCouncilSession);
  const approveDisabled =
    state.loading ||
    state.mutating ||
    !selectedCouncilSession ||
    selectedCouncilSession.alignment?.status === 'approved';
  const participantCards = selectedCouncilSession
    ? selectedCouncilSession.participants
        .map(
          (participant) => `
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>${escapeHtml(participant.role)}</strong>
                ${createToken('visible role', 'neutral')}
              </div>
              <p class="detail-copy">${escapeHtml(participant.focus || 'No focus recorded.')}</p>
            </section>
          `,
        )
        .join('')
    : '';
  const transcriptCards = selectedCouncilSession
    ? selectedCouncilSession.transcript
        .map(
          (entry) => `
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>${escapeHtml(entry.role)}</strong>
                ${entry.stance ? createToken(entry.stance, 'neutral') : ''}
              </div>
              <p class="detail-copy">${escapeHtml(entry.content || '')}</p>
            </section>
          `,
        )
        .join('')
    : '';

  elements.surfaces.council.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Council</h2>
            <p class="panel-copy">Visible role roster, transcript, and one alignment checkpoint sit above the existing execution engine.</p>
          </div>
          <div class="token-row">
            ${createToken(`project:${data.activeProject.name}`, 'success')}
            ${createToken(`mission:${selectedMission.id}`, 'neutral')}
            ${createToken(`sessions:${data.councilSessions.length}`, 'neutral')}
          </div>
        </div>
        <section class="relation-strip">
          <div class="card-title-row">
            <strong>${escapeHtml(selectedMission.title)}</strong>
            ${createToken(selectedMission.status || 'draft', getMissionStatusTone(selectedMission.status))}
            ${
              selectedCouncilSession
                ? createToken(
                    selectedCouncilSession.status,
                    getCouncilStatusTone(selectedCouncilSession.status),
                  )
                : createToken('council:none', 'warning')
            }
          </div>
          <p class="detail-copy">${escapeHtml(selectedMission.goal || 'No mission goal recorded.')}</p>
          <p class="detail-copy">${escapeHtml(selectedMission.constraints || 'No explicit constraints recorded.')}</p>
          ${
            !selectedCouncilSession
              ? `
                <div class="form-actions form-actions-inline">
                  <button
                    class="primary-button"
                    type="button"
                    data-action="draft-council-for-mission"
                    data-id="${escapeHtml(selectedMission.id)}"
                    ${councilDraftDisabled ? 'disabled' : ''}
                  >
                    Draft Council
                  </button>
                  <p class="form-help">Draft one visible multi-role recommendation before any automatic downstream execution exists.</p>
                </div>
              `
              : ''
          }
        </section>
        ${
          selectedCouncilSession
            ? `
              <div class="stack">
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Participant Roster</strong>
                  </div>
                  <div class="stack">
                    ${participantCards}
                  </div>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Transcript</strong>
                  </div>
                  <div class="stack">
                    ${transcriptCards}
                  </div>
                </section>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>No council session yet</strong>
                <p>Draft council to make the role roster, transcript, recommendation, and alignment checkpoint visible.</p>
              </div>
            `
        }
      </section>
      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>Recommendation</h2>
            <p class="panel-copy">Approve Recommendation now auto-creates the linked task, advances planner through builder preflight, and stops at the existing approval or decision gate.</p>
          </div>
        </div>
        ${
          selectedCouncilSession
            ? `
              <div class="token-row">
                ${createToken(selectedCouncilSession.id, 'neutral')}
                ${createToken(
                  `alignment:${selectedCouncilSession.alignment?.status || 'pending'}`,
                  getAlignmentTone(selectedCouncilSession.alignment?.status || 'pending'),
                )}
                ${
                  linkedTask
                    ? createToken(`linked-task:${linkedTask.id}`, 'accent')
                    : createToken('linked-task:none', 'warning')
                }
              </div>
              <div class="stack">
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Summary</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedCouncilSession.summary || 'No summary recorded.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Recommendation</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedCouncilSession.recommendation || 'No recommendation recorded.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Selected Plan</strong>
                  </div>
                  <p class="detail-copy">${escapeHtml(selectedCouncilSession.selectedPlan?.title || 'No selected plan recorded.')}</p>
                  <p class="detail-copy">${escapeHtml(selectedCouncilSession.selectedPlan?.scope || 'No selected scope recorded.')}</p>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Open Questions</strong>
                  </div>
                  <div class="stack">
                    ${selectedCouncilSession.openQuestions
                      .map(
                        (question) => `
                          <p class="detail-copy">${escapeHtml(question)}</p>
                        `,
                      )
                      .join('')}
                  </div>
                </section>
                <section class="relation-strip">
                  <div class="card-title-row">
                    <strong>Alignment Checkpoint</strong>
                  </div>
                  <p class="detail-copy">Approve Recommendation creates the linked task when needed, runs planner through builder preflight, and then stops at the existing gate.</p>
                  <div class="form-actions">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="approve-council-for-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${approveDisabled ? 'disabled' : ''}
                    >
                      Approve Recommendation
                    </button>
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="revise-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Revise Mission
                    </button>
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-advanced-ops"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Advanced Ops Mode
                    </button>
                    ${
                      linkedTask
                        ? `
                          <button
                            class="secondary-button"
                            type="button"
                            data-action="open-execution"
                            data-id="${escapeHtml(selectedMission.id)}"
                            ${state.loading || state.mutating ? 'disabled' : ''}
                          >
                            Open Execution
                          </button>
                        `
                        : ''
                    }
                  </div>
                  <p class="form-help">
                    ${
                      selectedCouncilSession.alignment?.status === 'approved'
                        ? escapeHtml(
                            `Aligned at ${formatDate(selectedCouncilSession.alignment?.decidedAt)}. Open Execution to inspect the linked task, latest run stage, approval bridge, and next operator step.`,
                          )
                        : 'Alignment stays explicit and single-step. Downstream execution starts only when this recommendation is approved.'
                    }
                  </p>
                </section>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>Council recommendation unavailable</strong>
                <p>Draft council from the selected mission to populate the recommendation and alignment checkpoint.</p>
              </div>
            `
        }
      </aside>
    </div>
  `;
}

function renderExecution(data) {
  if (!data.activeProject) {
    elements.surfaces.execution.innerHTML = renderProjectGateSurface(
      'Execution Unavailable',
      'Register or select a project on Mission, or use Advanced Ops Mode when you need manual project control before opening execution.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;

  if (!selectedMission) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>No mission selected</strong>
          <p>Create or select a mission before opening execution.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.execution.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>Execution</h2>
              <p class="panel-copy">Execution stays empty until a linked task exists for the selected mission.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>No linked task yet</strong>
            <p>Approve Recommendation on Council to auto-create the first linked task, or create one manually from Mission.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>Next Action</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-council"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              Open Council
            </button>
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              Open Advanced Ops Mode
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const latestRun = linkedTask.latestRunId ? data.runMap.get(linkedTask.latestRunId) || null : null;
  const latestRunNextStage = latestRun?.summary?.nextStage || null;
  const latestRunRole = latestRun?.role || latestRun?.kind || 'none';
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const taskBreakerState = getTaskBreakerAvailability(linkedTask, data);
  const builderPreflightState = getBuilderPreflightAvailability(linkedTask, data);
  const builderLiveMutationState = getBuilderLiveMutationSummaries(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data);
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      builderLiveMutationState.guardSummary.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const gateCopy =
    preferredInboxItem?.status === 'pending'
      ? preferredInboxItem.prompt || preferredInboxItem.title
      : linkedTask.flags?.waitingApproval
        ? 'Builder live mutation approval is pending.'
        : linkedTask.flags?.waitingDecision
          ? 'A blocking decision is pending.'
          : builderLiveMutationState.requestSummary.allowed
            ? `Preflight ${builderLiveMutationState.requestSummary.currentPreflightArtifactId} is ready for builder live mutation approval.`
            : 'No blocking gate is active.';

  elements.surfaces.execution.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Execution</h2>
            <p class="panel-copy">Compact execution summary for the selected mission. Detailed run control remains in Advanced Ops Mode.</p>
          </div>
          <div class="token-row">
            ${createToken(`mission:${selectedMission.id}`, 'neutral')}
            ${createToken(`task:${linkedTask.id}`, 'accent')}
            ${createToken(linkedTask.lifecycleState, 'neutral')}
          </div>
        </div>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>Lifecycle</strong>
          </div>
          <div class="token-row">
            ${createToken(`review:${linkedTask.review?.status || 'pending'}`, getReviewTone(linkedTask.review?.status))}
            ${linkedTask.flags?.blocked ? createToken('blocked', 'danger') : ''}
            ${linkedTask.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
            ${linkedTask.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
          </div>
          <p class="detail-copy">${escapeHtml(linkedTask.intent || selectedMission.goal || 'No execution intent recorded.')}</p>
        </section>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>Latest Run Stage</strong>
          </div>
          <div class="token-row">
            ${latestRun ? createToken(`run:${latestRun.id}`, getRunTone(latestRun.status)) : createToken('run:none', 'neutral')}
            ${latestRun ? createToken(`role:${latestRunRole}`, 'neutral') : ''}
            ${latestRunNextStage ? createToken(`next:${latestRunNextStage}`, 'neutral') : ''}
          </div>
          <p class="detail-copy">
            ${
              latestRun
                ? escapeHtml(`${formatDate(latestRun.startedAt)}에 시작된 latest run 기준 요약이다.`)
                : 'No execution run has been recorded yet.'
            }
          </p>
        </section>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>Upstream Chain</strong>
          </div>
          <div class="token-row">
            ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
            ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
            ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
            ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
          </div>
          <p class="detail-copy">Approve Recommendation auto chain은 planner부터 builder preflight까지만 진행되고, 이후는 기존 gate semantics를 따른다.</p>
        </section>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>Current Gate</h2>
            <p class="panel-copy">Execution은 current approval bridge, gate 상태, 그리고 preflight readiness를 compact하게 보여준다.</p>
          </div>
        </div>
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Approval Bridge</strong>
            </div>
            <div class="token-row">
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `approval:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('approval:none', 'neutral')
              }
              ${
                approvalBridge.actionLabel
                  ? createToken(`action:${approvalBridge.actionLabel}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`target:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`artifact:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `inbox:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>Next Operator Step</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Approve Current Gate
                    </button>
                  </div>
                  <p class="form-help">This reuses the existing pending builder approval record and keeps detailed task, log, artifact, and inbox control in Advanced Ops Mode.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Approve Current Commit Gate
                    </button>
                  </div>
                  <p class="form-help">This reuses the existing pending commit approval record. Local commit, release, and close-out still stay in Advanced Ops Mode after this approval is resolved.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-inbox-action"
                      data-id="${escapeHtml(approvalBridge.pendingInboxItem.id)}"
                      data-verb="approve"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Approve Current Release Gate
                    </button>
                  </div>
                  <p class="form-help">This reuses the existing pending release approval record. Close-out still stays bounded and continues from Execution only after current release readiness turns green.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-builder-live-mutation"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Run Live Mutation
                    </button>
                  </div>
                  <p class="form-help">The current builder approval is already approved. This CTA reuses the existing live mutation task route, then lands on Logs for the bounded mutation bundle.</p>
                `
                : ''
            }
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-reviewer"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Run Reviewer
                    </button>
                  </div>
                  <p class="form-help">The latest live mutation bundle is ready for reviewer inspection from the primary orchestration path. This CTA reuses the existing reviewer route and then lands on Artifacts.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-commit-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Prepare Commit Package
                    </button>
                  </div>
                  <p class="form-help">The latest passing reviewer bundle is ready. This CTA reuses the existing commit-package route and opens the current commit approval without running local commit, release, or close-out.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-local-commit"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Resume Approved Local Commit
                    </button>
                  </div>
                  <p class="form-help">The current commit bundle is ready. This CTA reuses the existing local commit route, then lands on Artifacts with the saved commit-result bundle. Release and close-out still stay in Advanced Ops Mode.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-release-package"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Prepare Release Package
                    </button>
                  </div>
                  <p class="form-help">The latest successful local commit bundle is ready. This CTA reuses the existing release-package route, then opens the current release approval without enabling push, publish, or close-out on the primary shell.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="primary-button"
                      type="button"
                      data-action="run-close-out"
                      data-id="${escapeHtml(linkedTask.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Resume Approved Close Out
                    </button>
                  </div>
                  <p class="form-help">The current approved release bundle is ready. This CTA reuses the existing close-out route, then lands on Artifacts with the saved close-out bundle. External delivery still stays in Advanced Ops Mode.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Blocked Reason</strong>
            </div>
            <p class="detail-copy">${escapeHtml(gateCopy)}</p>
            <div class="token-row">
              ${preferredInboxItem?.status === 'pending' ? createToken(`inbox:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem)) : ''}
              ${preferredInboxItem?.kind ? createToken(`kind:${preferredInboxItem.kind}`, 'neutral') : ''}
              ${
                builderLiveMutationState.requestSummary.latestApprovalDisplayStatus
                  ? createToken(
                      `approval:${builderLiveMutationState.requestSummary.latestApprovalDisplayStatus}`,
                      builderLiveMutationState.requestSummary.latestApprovalDisplayStatus === 'pending'
                        ? 'accent'
                        : 'neutral',
                    )
                  : ''
              }
            </div>
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Preflight Readiness</strong>
            </div>
            <div class="token-row">
              ${createToken(
                builderLiveMutationState.requestSummary.allowed ? 'ready-for-approval' : 'not-ready',
                builderLiveMutationState.requestSummary.allowed ? 'success' : 'warning',
              )}
              ${
                builderLiveMutationState.requestSummary.currentPreflightArtifactId
                  ? createToken(
                      `preflight:${builderLiveMutationState.requestSummary.currentPreflightArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                builderLiveMutationState.requestSummary.allowed
                  ? '현재 preflight artifact 기준으로 builder live mutation approval gate가 생성된 상태다.'
                  : escapeHtml(
                      (builderLiveMutationState.requestSummary.reasons || []).join('; ') ||
                        'Preflight readiness is not available yet.',
                    )
              }
            </p>
            ${
              parsedPreflight
                ? `
                  ${renderCompactList('Target Files', parsedPreflight.targetFiles)}
                  ${renderCompactList('Risks', parsedPreflight.risks)}
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Next Actions</strong>
            </div>
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
                data-action="open-council"
                data-id="${escapeHtml(selectedMission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                Open Council
              </button>
              <button
                class="secondary-button"
                type="button"
                data-action="open-advanced-ops"
                data-id="${escapeHtml(selectedMission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                Open Advanced Ops Mode
              </button>
            </div>
            <p class="form-help">If the current gate is still pending, open Advanced Ops Mode, resolve it in Decision Inbox, then return to Taskboard for the next bounded execution action.</p>
          </section>
        </div>
      </aside>
    </div>
  `;
}

function renderDeliverables(data) {
  if (!data.activeProject) {
    elements.surfaces.deliverables.innerHTML = renderProjectGateSurface(
      'Deliverables Unavailable',
      'Register or select a project on Mission, or use Advanced Ops Mode when you need manual project control before opening deliverables.',
    );
    return;
  }

  const selectedMission = data.missionMap.get(state.selectedMissionId) || data.missions[0] || null;

  if (!selectedMission) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-panel">
        <div class="empty-state empty-state-strong">
          <strong>No mission selected</strong>
          <p>Create or select a mission before opening deliverables.</p>
        </div>
      </div>
    `;
    return;
  }

  const linkedTask =
    selectedMission.linkedTaskId && data.taskMap.has(selectedMission.linkedTaskId)
      ? data.taskMap.get(selectedMission.linkedTaskId)
      : null;

  if (!linkedTask) {
    elements.surfaces.deliverables.innerHTML = `
      <div class="surface-grid">
        <section class="surface-panel">
          <div class="panel-header">
            <div>
              <h2>Deliverables</h2>
              <p class="panel-copy">Deliverables stay empty until the selected mission owns one linked task.</p>
            </div>
          </div>
          <div class="empty-state">
            <strong>No linked task yet</strong>
            <p>Approve Recommendation on Council first. Deliverables only summarize artifact, review, and approval state that already exists on the current engine.</p>
          </div>
        </section>
        <aside class="detail-card">
          <div class="panel-header">
            <div>
              <h2>Advanced Ops Detail</h2>
            </div>
          </div>
          <div class="form-actions">
            <button
              class="secondary-button"
              type="button"
              data-action="open-advanced-ops"
              data-id="${escapeHtml(selectedMission.id)}"
              ${state.loading || state.mutating ? 'disabled' : ''}
            >
              Open Advanced Ops Mode
            </button>
          </div>
        </aside>
      </div>
    `;
    return;
  }

  const taskArtifacts = getTaskArtifacts(linkedTask.id, data.artifacts).sort(sortByCreatedDesc);
  const taskApprovals = getTaskApprovals(linkedTask.id, data.approvals).sort(sortByCreatedDesc);
  const approvalSummary = getTaskApprovalSummary(linkedTask, data.approvals);
  const preferredInboxItem = getPreferredTaskInboxItem(linkedTask.id, data);
  const latestArtifact = taskArtifacts[0] || null;
  const latestPlanArtifact = getLatestTaskArtifact(linkedTask, data, 'plan');
  const latestArchitectureArtifact = getLatestTaskArtifact(linkedTask, data, 'architecture');
  const latestBreakdownArtifact = getLatestTaskArtifact(linkedTask, data, 'breakdown');
  const latestPreflightArtifact = getLatestTaskArtifact(linkedTask, data, 'preflight');
  const latestChangeSummaryArtifact = getLatestTaskArtifact(linkedTask, data, 'change-summary');
  const latestPatchArtifact = getLatestTaskArtifact(linkedTask, data, 'patch');
  const latestDiffArtifact = getLatestTaskArtifact(linkedTask, data, 'diff');
  const latestReviewArtifact = getLatestTaskArtifact(linkedTask, data, 'review');
  const latestCommitPackageArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-package');
  const latestCommitResultArtifact = getLatestTaskArtifact(linkedTask, data, 'commit-result');
  const latestReleasePackageArtifact = getLatestTaskArtifact(linkedTask, data, 'release-package');
  const latestCloseOutArtifact = getLatestTaskArtifact(linkedTask, data, 'close-out');
  const latestApproval = taskApprovals[0] || null;
  const approvalBridge = getTaskApprovalBridge(linkedTask, data);
  const reviewerState = getReviewerAvailability(linkedTask, data);
  const commitPackageState = getCommitPackageAvailability(linkedTask, data);
  const commitExecutionState = getCommitExecutionAvailability(linkedTask, data);
  const releasePackageState = getReleasePackageAvailability(linkedTask, data);
  const closeOutState = getCloseOutAvailability(linkedTask, data);
  const missionCompletionReady = Boolean(
    linkedTask &&
      linkedTask.lifecycleState === 'Done' &&
      (latestCloseOutArtifact || closeOutState.summary.existingCloseOutArtifactId),
  );
  const missionCompletionArtifactId =
    latestCloseOutArtifact?.id || closeOutState.summary.existingCloseOutArtifactId || null;
  const canApproveCurrentGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'builder-live-mutation',
  );
  const canApproveCommitGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'commit-intent',
  );
  const canApproveReleaseGate = Boolean(
    approvalBridge.pendingInboxItem &&
      approvalBridge.currentApproval?.status === 'pending' &&
      approvalBridge.currentApproval?.allowedNextAction === 'release-ready',
  );
  const canRunLiveMutation = Boolean(
    approvalBridge.currentApproval &&
      approvalBridge.currentApproval.status === 'approved' &&
      approvalBridge.currentApproval.allowedNextAction === 'builder-live-mutation' &&
      data.derived?.taskGuardSummaries?.[linkedTask.id]?.builderLiveMutation?.allowed,
  );
  const canRunReviewer = Boolean(reviewerState.summary.allowed);
  const canPrepareCommitPackage = Boolean(commitPackageState.summary.allowed);
  const canRunLocalCommit = Boolean(commitExecutionState.summary.allowed);
  const canPrepareReleasePackage = Boolean(releasePackageState.summary.allowed);
  const canRunCloseOut = Boolean(closeOutState.summary.allowed);
  const latestReviewStatus = linkedTask.review?.status || 'pending';
  const latestReviewNote =
    linkedTask.review?.resolution?.note || 'No review resolution note recorded yet.';
  const currentDeliverableArtifact =
    latestCloseOutArtifact ||
    latestReleasePackageArtifact ||
    latestCommitResultArtifact ||
    latestCommitPackageArtifact ||
    latestReviewArtifact ||
    latestChangeSummaryArtifact ||
    latestDiffArtifact ||
    latestPatchArtifact ||
    latestPreflightArtifact ||
    latestBreakdownArtifact ||
    latestArchitectureArtifact ||
    latestPlanArtifact ||
    latestArtifact;

  elements.surfaces.deliverables.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Deliverables</h2>
            <p class="panel-copy">Compact summary of the latest artifact package, review state, and approval state for the selected mission.</p>
          </div>
          <div class="token-row">
            ${createToken(`mission:${selectedMission.id}`, 'neutral')}
            ${createToken(`task:${linkedTask.id}`, 'accent')}
            ${createToken(`artifacts:${taskArtifacts.length}`, 'neutral')}
          </div>
        </div>

        <section class="relation-strip">
          <div class="card-title-row">
            <strong>Latest Artifact Package</strong>
          </div>
          <div class="token-row">
            ${
              currentDeliverableArtifact
                ? createToken(`current:${currentDeliverableArtifact.type}`, 'success')
                : createToken('current:none', 'warning')
            }
            ${currentDeliverableArtifact ? createToken(currentDeliverableArtifact.id, 'neutral') : ''}
            ${latestArtifact ? createToken(`latest-write:${latestArtifact.type}`, 'neutral') : ''}
          </div>
          <p class="detail-copy">
            ${
              currentDeliverableArtifact
                ? escapeHtml(
                    `${currentDeliverableArtifact.type} artifact ${currentDeliverableArtifact.id} is the current top of the bounded deliverable stack as of ${formatDate(currentDeliverableArtifact.createdAt)}.`,
                  )
                : 'No artifact package exists yet for this mission.'
            }
          </p>
          <div class="stack">
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>Execution Package</strong>
              </div>
              <div class="token-row">
                ${latestPlanArtifact ? createToken(`plan:${latestPlanArtifact.id}`, 'success') : createToken('plan:none', 'warning')}
                ${latestArchitectureArtifact ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success') : createToken('architecture:none', 'warning')}
                ${latestBreakdownArtifact ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral') : createToken('breakdown:none', 'neutral')}
                ${latestPreflightArtifact ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral') : createToken('preflight:none', 'neutral')}
              </div>
              <p class="detail-copy">Planner through builder preflight artifacts remain the current upstream package for this mission until a later bounded step advances mutation or review.</p>
            </section>
            <section class="relation-strip">
              <div class="card-title-row">
                <strong>Delivery Package</strong>
              </div>
              <div class="token-row">
                ${latestChangeSummaryArtifact ? createToken(`change-summary:${latestChangeSummaryArtifact.id}`, 'neutral') : createToken('change-summary:none', 'neutral')}
                ${latestPatchArtifact ? createToken(`patch:${latestPatchArtifact.id}`, 'neutral') : createToken('patch:none', 'neutral')}
                ${latestDiffArtifact ? createToken(`diff:${latestDiffArtifact.id}`, 'neutral') : createToken('diff:none', 'neutral')}
                ${latestReviewArtifact ? createToken(`review:${latestReviewArtifact.id}`, 'neutral') : createToken('review:none', 'neutral')}
                ${latestCommitPackageArtifact ? createToken(`commit-package:${latestCommitPackageArtifact.id}`, 'neutral') : ''}
                ${latestCommitResultArtifact ? createToken(`commit-result:${latestCommitResultArtifact.id}`, 'neutral') : ''}
                ${latestReleasePackageArtifact ? createToken(`release-package:${latestReleasePackageArtifact.id}`, 'neutral') : ''}
                ${latestCloseOutArtifact ? createToken(`close-out:${latestCloseOutArtifact.id}`, 'neutral') : ''}
              </div>
              <p class="detail-copy">
                ${
                  latestChangeSummaryArtifact || latestReviewArtifact || latestCommitPackageArtifact || latestReleasePackageArtifact || latestCloseOutArtifact
                    ? 'Downstream package artifacts already exist and remain visible here without adding any new execution affordance.'
                    : 'No downstream mutation, review, commit, release, or close-out package exists yet. Current bounded progress still stops before those later semantics.'
                }
              </p>
            </section>
          </div>
        </section>
      </section>

      <aside class="detail-card">
        <div class="panel-header">
          <div>
            <h2>Latest State</h2>
            <p class="panel-copy">Deliverables stays summary-only. It now highlights the current approval target and still hands detailed control off to Advanced Ops Mode.</p>
          </div>
        </div>
        <div class="stack">
          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Latest Review State</strong>
            </div>
            <div class="token-row">
              ${createToken(`required:${linkedTask.review?.required ? 'yes' : 'no'}`, linkedTask.review?.required ? 'warning' : 'neutral')}
              ${createToken(`status:${latestReviewStatus}`, getReviewTone(latestReviewStatus))}
              ${createToken(`verification:${linkedTask.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
              ${latestReviewArtifact ? createToken(`artifact:${latestReviewArtifact.id}`, 'neutral') : createToken('artifact:none', 'neutral')}
              ${
                reviewerState.summary.sourceBuilderRunId
                  ? createToken(`source run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(latestReviewNote)}</p>
            ${
              canRunReviewer
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Run Reviewer
                    </button>
                  </div>
                  <p class="form-help">Primary reviewer CTA lives on Execution after the bounded live mutation bundle is available.</p>
                `
                : ''
            }
            ${
              canPrepareCommitPackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Prepare Commit Package
                    </button>
                  </div>
                  <p class="form-help">Primary commit-package CTA lives on Execution after the latest passing reviewer bundle is available.</p>
                `
                : ''
            }
            ${
              canApproveCommitGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Approve Commit Gate
                    </button>
                  </div>
                  <p class="form-help">Primary commit approval CTA lives on Execution after the current commit package opens a pending commit approval.</p>
                `
                : ''
            }
            ${
              canRunLocalCommit
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Run Local Commit
                    </button>
                  </div>
                  <p class="form-help">Primary local commit CTA lives on Execution once the current approved commit bundle is ready.</p>
                `
                : ''
            }
            ${
              canPrepareReleasePackage
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Prepare Release Package
                    </button>
                  </div>
                  <p class="form-help">Primary release-package CTA lives on Execution once the latest successful local commit bundle is ready.</p>
                `
                : ''
            }
            ${
              canApproveReleaseGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Approve Release Gate
                    </button>
                  </div>
                  <p class="form-help">Primary release approval CTA lives on Execution after the current release package opens a pending release approval.</p>
                `
                : ''
            }
            ${
              canRunCloseOut
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Run Close Out
                    </button>
                  </div>
                  <p class="form-help">Primary close-out CTA lives on Execution once the current approved release bundle is ready.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Latest Approval State</strong>
            </div>
            <div class="token-row">
              ${createToken(`pending:${approvalSummary.pending}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')}
              ${createToken(`approved:${approvalSummary.approved}`, approvalSummary.approved > 0 ? 'success' : 'neutral')}
              ${createToken(`rejected:${approvalSummary.rejected}`, approvalSummary.rejected > 0 ? 'danger' : 'neutral')}
              ${
                latestApproval?.allowedNextAction
                  ? createToken(
                      `action:${getApprovalActionLabel(latestApproval.allowedNextAction)}`,
                      'neutral',
                    )
                  : ''
              }
              ${
                latestApproval
                  ? createToken(`latest:${latestApproval.status}`, getApprovalTone(latestApproval.status))
                  : createToken('latest:none', 'neutral')
              }
            </div>
            <p class="detail-copy">
              ${
                latestApproval
                  ? escapeHtml(
                      `${latestApproval.id} is ${latestApproval.status} for ${latestApproval.allowedNextAction || latestApproval.scope}, targeting ${latestApproval.targetArtifactId || 'the current bounded artifact'}.`,
                    )
                  : 'No approval record exists yet for this mission.'
              }
            </p>
            ${
              preferredInboxItem?.status === 'pending'
                ? `
                  <div class="token-row">
                    ${createToken(`inbox:${preferredInboxItem.id}`, getInboxTone(preferredInboxItem))}
                    ${createToken(`kind:${preferredInboxItem.kind}`, 'neutral')}
                  </div>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Current Approval Target</strong>
            </div>
            <div class="token-row">
              ${
                approvalBridge.currentApproval
                  ? createToken(
                      `approval:${approvalBridge.currentApproval.id}`,
                      getApprovalTone(approvalBridge.currentApproval.status),
                    )
                  : createToken('approval:none', 'neutral')
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`target:${approvalBridge.targetArtifact.type}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.targetArtifact
                  ? createToken(`artifact:${approvalBridge.targetArtifact.id}`, 'neutral')
                  : ''
              }
              ${
                approvalBridge.pendingInboxItem
                  ? createToken(
                      `inbox:${approvalBridge.pendingInboxItem.id}`,
                      getInboxTone(approvalBridge.pendingInboxItem),
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">${escapeHtml(approvalBridge.bridgeCopy)}</p>
            <p class="detail-copy"><strong>Next Operator Step</strong>: ${escapeHtml(approvalBridge.nextStepCopy)}</p>
            ${
              canApproveCurrentGate
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution
                    </button>
                  </div>
                  <p class="form-help">Primary approval CTA lives on Execution. Deliverables keeps this surface summary-only.</p>
                `
                : ''
            }
            ${
              canRunLiveMutation
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-execution"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Execution To Run Live Mutation
                    </button>
                  </div>
                  <p class="form-help">The bounded live mutation CTA is available on Execution after the current builder gate is approved.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Mission Completion</strong>
            </div>
            <div class="token-row">
              ${createToken(`mission:${selectedMission.status || 'draft'}`, getMissionStatusTone(selectedMission.status))}
              ${
                linkedTask
                  ? createToken(
                      `task:${linkedTask.lifecycleState}`,
                      linkedTask.lifecycleState === 'Done' ? 'success' : 'neutral',
                    )
                  : createToken('task:none', 'warning')
              }
              ${
                missionCompletionReady
                  ? createToken('completion:sealed', 'success')
                  : createToken('completion:open', 'warning')
              }
              ${
                missionCompletionArtifactId
                  ? createToken(`close-out:${missionCompletionArtifactId}`, 'neutral')
                  : ''
              }
              ${
                closeOutState.summary.currentReleasePackageArtifactId
                  ? createToken(
                      `release-package:${closeOutState.summary.currentReleasePackageArtifactId}`,
                      'neutral',
                    )
                  : ''
              }
            </div>
            <p class="detail-copy">
              ${
                missionCompletionReady
                  ? escapeHtml(
                      `Current Mission State: bounded delivery is sealed by close-out artifact ${missionCompletionArtifactId} for task ${linkedTask.id}.`,
                    )
                  : 'Current Mission State: bounded delivery is still open. Deliverables will pin the close-out bundle here after the mission reaches Done.'
              }
            </p>
            <p class="detail-copy">
              <strong>Next Safe Follow-Up</strong>: ${
                missionCompletionReady
                  ? 'Use the saved close-out bundle as the final bounded summary, then start the next mission or open Advanced Ops Mode for deeper provenance inspection. External delivery remains disabled here.'
                  : 'Keep advancing the current bounded path from Execution. This surface remains summary-only until the close-out bundle is saved.'
              }
            </p>
            ${
              missionCompletionReady
                ? `
                  <div class="form-actions form-actions-inline">
                    <button
                      class="secondary-button"
                      type="button"
                      data-action="open-mission"
                      data-id="${escapeHtml(selectedMission.id)}"
                      ${state.loading || state.mutating ? 'disabled' : ''}
                    >
                      Open Mission To Start Next Cycle
                    </button>
                  </div>
                  <p class="form-help">Mission holds the next-cycle entry. Use it to prepare the next bounded mission draft without reopening execution.</p>
                `
                : ''
            }
          </section>

          <section class="relation-strip">
            <div class="card-title-row">
              <strong>Advanced Ops Detail</strong>
            </div>
            <p class="detail-copy">Deliverables intentionally stops at compact summary. Taskboard, Logs, Artifacts, and Decision Inbox remain the detailed operator path.</p>
            <div class="form-actions">
              <button
                class="secondary-button"
                type="button"
                data-action="open-advanced-ops"
                data-id="${escapeHtml(selectedMission.id)}"
                ${state.loading || state.mutating ? 'disabled' : ''}
              >
                Open Advanced Ops Mode
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  `;
}

function renderTaskboard(data) {
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const createDisabled = !data.activeProject || state.loading || state.mutating;
  const bootstrapPanel = renderProjectBootstrapPanel(data);
  const lanes = groupTasksByLifecycle(data.tasks)
    .map(([laneName, tasks]) => {
      const cards = tasks.length
        ? tasks
            .map((task) => {
              const approvalSummary = getTaskApprovalSummary(task, data.approvals);
              const decisionSummary = getTaskDecisionSummary(task, data.inboxItems);
              const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;

              return `
                <article class="card ${task.id === selectedTask?.id ? 'is-selected' : ''}">
                  <button class="card-button" type="button" data-action="select-task" data-id="${escapeHtml(task.id)}">
                    <div class="card-title-row">
                      <h4 class="card-title">${escapeHtml(task.title)}</h4>
                      ${createToken(task.lifecycleState, 'neutral')}
                    </div>
                    <p class="card-copy">${escapeHtml(task.intent || 'No intent recorded.')}</p>
                    <div class="token-row">
                      ${createToken(`review:${task.review?.status || 'pending'}`, getReviewTone(task.review?.status))}
                      ${task.flags?.blocked ? createToken('blocked', 'danger') : ''}
                      ${task.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
                      ${task.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
                    </div>
                    <div class="meta-row">
                      ${createToken(`artifacts:${(task.artifactIds || []).length}`, 'neutral')}
                      ${createToken(`pending inbox:${decisionSummary.pendingTotal}`, decisionSummary.pendingTotal > 0 ? 'warning' : 'success')}
                      ${createToken(`approvals:${approvalSummary.pending}/${approvalSummary.total}`, approvalSummary.pending > 0 ? 'accent' : 'neutral')}
                      ${latestRun ? createToken(`run:${latestRun.status}`, getRunTone(latestRun.status)) : createToken('run:none', 'neutral')}
                    </div>
                  </button>
                </article>
              `;
            })
            .join('')
        : `
            <div class="empty-state">
              <strong>No tasks</strong>
              <p>This lifecycle lane is empty.</p>
            </div>
          `;

      return `
        <section class="lane">
          <div class="lane-header">
            <h3>${escapeHtml(laneName)}</h3>
            <span class="lane-count">${tasks.length}</span>
          </div>
          <div class="stack">${cards}</div>
        </section>
      `;
    })
    .join('');

  const detail = renderTaskDetail(selectedTask, data);

  elements.surfaces.taskboard.innerHTML = `
    <div class="surface-grid">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Taskboard</h2>
            <p class="panel-copy">Taskboard is the detailed execution control surface for project setup, lifecycle, gate handling, and downstream follow-up.</p>
          </div>
          <p class="runtime-note">Planner + architect + task-breaker + builder preflight + live mutation approval + limited live mutation write + reviewer + commit-package prepare + local commit + release-package prepare + close-out enabled</p>
        </div>
        ${renderAdvancedOpsNotice('Taskboard, Logs, Artifacts, and Decision Inbox now sit behind the orchestration-first path. Use this surface when mission-level flow needs detailed operator control.')}
        ${bootstrapPanel}
        ${
          data.activeProject
            ? `
              <form class="task-create-form" data-form="create-task">
                <div class="field-grid">
                  <label class="field">
                    <span class="field-label">Title</span>
                    <input
                      type="text"
                      name="title"
                      value="${escapeHtml(state.taskDraftTitle)}"
                      placeholder="Thin-slice task title"
                      ${createDisabled ? 'disabled' : ''}
                    >
                  </label>
                  <label class="field">
                    <span class="field-label">Intent</span>
                    <textarea
                      name="intent"
                      rows="3"
                      placeholder="Optional intended outcome and acceptance hint"
                      ${createDisabled ? 'disabled' : ''}
                    >${escapeHtml(state.taskDraftIntent)}</textarea>
                  </label>
                </div>
                <div class="form-actions">
                  <button class="primary-button" type="submit" ${createDisabled ? 'disabled' : ''}>Create Task</button>
                  <p class="form-help">Creates a task in ${escapeHtml(data.activeProject.name)}.</p>
                </div>
              </form>
            `
            : ''
        }
        ${
          !data.activeProject
            ? `
              <div class="empty-state">
                <strong>No active project</strong>
                <p>Register or select a project above before creating the first task.</p>
              </div>
            `
            : data.tasks.length > 0
            ? `<div class="lane-grid">${lanes}</div>`
            : `
              <div class="empty-state">
                <strong>No tasks yet</strong>
                <p>The active project is ready. Create the first thin-slice task to enter the core loop.</p>
              </div>
            `
        }
      </section>
      ${detail}
    </div>
  `;
}

function renderTaskDetail(task, data) {
  if (!task) {
    return `
      <aside class="detail-card">
        <h2>Task Detail</h2>
        <div class="empty-state">
          <strong>No task selected</strong>
          <p>Select a task card to inspect run, artifact, review, and decision state.</p>
        </div>
      </aside>
    `;
  }

  const taskRuns = getTaskRuns(task.id, data.runs);
  const taskArtifacts = getTaskArtifacts(task.id, data.artifacts);
  const taskApprovals = getTaskApprovals(task.id, data.approvals);
  const taskInboxItems = getTaskInboxItems(task.id, data.inboxItems);
  const latestRun = task.latestRunId ? data.runMap.get(task.latestRunId) : null;
  const taskBreakerState = getTaskBreakerAvailability(task, data);
  const builderPreflightState = getBuilderPreflightAvailability(task, data);
  const latestPlanArtifact = taskBreakerState.latestPlanArtifact;
  const latestArchitectureArtifact = taskBreakerState.latestArchitectureArtifact;
  const latestBreakdownArtifact = taskBreakerState.latestBreakdownArtifact;
  const latestPreflightArtifact = builderPreflightState.latestPreflightArtifact;
  const latestBreakdownDetail =
    state.selectedTaskBreakdownArtifact?.id === latestBreakdownArtifact?.id
      ? state.selectedTaskBreakdownArtifact
      : null;
  const latestPreflightDetail =
    state.selectedTaskPreflightArtifact?.id === latestPreflightArtifact?.id
      ? state.selectedTaskPreflightArtifact
      : null;
  const parsedBreakdown = latestBreakdownDetail
    ? parseBreakdownArtifact(latestBreakdownDetail.content)
    : null;
  const parsedPreflight = latestPreflightDetail
    ? parsePreflightArtifact(latestPreflightDetail.content)
    : null;
  const activeProjectLinkedWorktrees = getActiveProjectLinkedWorktreesState(data);
  const detectedWorktreeOptions =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.options || []
      : [];
  const worktreeDetectionNotice =
    activeProjectLinkedWorktrees.projectId === task.projectId
      ? activeProjectLinkedWorktrees.notice
      : null;
  const currentWorktreeOption = task.worktreeRef
    ? detectedWorktreeOptions.find((option) => option.path === task.worktreeRef) || null
    : null;
  const worktreeRelation = buildTaskWorktreeRelation(task, {
    ...activeProjectLinkedWorktrees,
    options: detectedWorktreeOptions,
  });
  const selectedWorktreeOptionValue =
    currentWorktreeOption?.path || detectedWorktreeOptions[0]?.path || '';
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const preselectedPendingItem =
    selectedInboxItem?.taskId === task.id && selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const plannerDisabled = state.loading || state.mutating;
  const architectDisabled = state.loading || state.mutating || !latestPlanArtifact;
  const taskBreakerDisabled = taskBreakerState.disabled;
  const builderPreflightDisabled = builderPreflightState.disabled;
  const worktreeApplyDisabled =
    state.loading ||
    state.mutating ||
    detectedWorktreeOptions.length === 0;
  const worktreeClearDisabled = state.loading || state.mutating || !task.worktreeRef;
  const reviewerState = getReviewerAvailability(task, data);
  const commitPackageState = getCommitPackageAvailability(task, data);
  const closeOutState = getCloseOutAvailability(task, data);
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';

  return `
    <aside class="detail-card">
      <div>
        <p class="eyebrow">Task Detail</p>
        <h2>${escapeHtml(task.title)}</h2>
      </div>

      <div class="detail-block">
        <p class="detail-copy">${escapeHtml(task.intent || 'No intent recorded.')}</p>
        <div class="token-row">
          ${createToken(task.lifecycleState, 'neutral')}
          ${createToken(`review:${task.review?.status || 'pending'}`, getReviewTone(task.review?.status))}
          ${task.flags?.blocked ? createToken('blocked', 'danger') : ''}
          ${task.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
          ${task.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
        </div>
      </div>

      <div class="detail-block">
        <div class="kv-grid">
          <div class="kv-item">
            <p class="detail-key">Latest Run</p>
            <strong>${escapeHtml(latestRun?.id || 'None')}</strong>
            <p class="detail-copy">${latestRun ? `${escapeHtml(latestRun.status)} · ${escapeHtml(formatDate(latestRun.startedAt))}` : 'No run recorded'}</p>
          </div>
          <div class="kv-item">
            <p class="detail-key">Worktree</p>
            <strong>${escapeHtml(task.worktreeRef || 'Not linked')}</strong>
            <p class="detail-copy">${
              currentWorktreeOption
                ? escapeHtml(formatWorktreeOptionLabel(currentWorktreeOption))
                : task.worktreeRef
                  ? 'Stored task.worktreeRef is outside the current detected linked worktree list.'
                  : 'task.worktreeRef is not set.'
            }</p>
          </div>
        </div>
        <div class="relation-strip">
          <div class="card-title-row">
            <strong>task.worktreeRef vs active project_path</strong>
            ${createToken(worktreeRelation.label, worktreeRelation.tone)}
          </div>
          <p class="detail-copy">${escapeHtml(worktreeRelation.copy)}</p>
          ${
            worktreeRelation.switchOption
              ? `
                <div class="relation-button-row">
                  <button
                    class="secondary-button"
                    type="button"
                    data-action="switch-active-project-worktree"
                    data-path="${escapeHtml(worktreeRelation.switchOption.path)}"
                    ${state.loading || state.mutating ? 'disabled' : ''}
                  >
                    Switch Active Project
                  </button>
                </div>
              `
              : ''
          }
        </div>
        <label class="field">
          <span class="field-label">Detected Linked Worktrees</span>
          <select id="task-worktree-select" ${worktreeApplyDisabled ? 'disabled' : ''}>
            ${
              detectedWorktreeOptions.length > 0
                ? detectedWorktreeOptions
                    .map(
                      (option) => `
                        <option value="${escapeHtml(option.path)}" ${
                          option.path === selectedWorktreeOptionValue ? 'selected' : ''
                        }>
                          ${escapeHtml(formatWorktreeOptionLabel(option))}
                        </option>
                      `,
                    )
                    .join('')
                : '<option value="">No linked worktrees detected</option>'
            }
          </select>
        </label>
        <div class="form-actions form-actions-inline">
          <button
            class="secondary-button"
            type="button"
            data-action="set-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeApplyDisabled ? 'disabled' : ''}
          >
            Apply Worktree
          </button>
          <button
            class="secondary-button"
            type="button"
            data-action="clear-task-worktree-ref"
            data-id="${escapeHtml(task.id)}"
            ${worktreeClearDisabled ? 'disabled' : ''}
          >
            Clear Worktree
          </button>
        </div>
        ${
          worktreeDetectionNotice
            ? `<p class="detail-copy">${escapeHtml(worktreeDetectionNotice)}</p>`
            : detectedWorktreeOptions.length > 0
              ? '<p class="form-help">Stores task.worktreeRef only. release-package and close-out still require active project_path to resolve to the same linked worktree root.</p>'
              : '<p class="detail-copy">No linked worktrees were detected from the current project_path.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Role Runs</p>
        <div class="token-row">
          ${
            latestPlanArtifact
              ? createToken(`plan:${latestPlanArtifact.id}`, 'success')
              : createToken('plan:missing', 'warning')
          }
          ${
            latestArchitectureArtifact
              ? createToken(`architecture:${latestArchitectureArtifact.id}`, 'success')
              : createToken('architecture:missing', 'warning')
          }
          ${
            latestBreakdownArtifact
              ? createToken(`breakdown:${latestBreakdownArtifact.id}`, 'neutral')
              : createToken('breakdown:none', 'neutral')
          }
          ${
            latestPreflightArtifact
              ? createToken(`preflight:${latestPreflightArtifact.id}`, 'neutral')
              : createToken('preflight:none', 'neutral')
          }
          ${
            taskBreakerState.pendingBlockingDecisionItemIds.length > 0
              ? createToken(
                  `blocking decision:${taskBreakerState.pendingBlockingDecisionItemIds.length}`,
                  'danger',
                )
              : ''
          }
          ${
            taskBreakerState.pendingApprovalIds.length > 0
              ? createToken(`pending approval:${taskBreakerState.pendingApprovalIds.length}`, 'accent')
              : ''
          }
        </div>
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-planner"
            data-id="${escapeHtml(task.id)}"
            ${plannerDisabled ? 'disabled' : ''}
          >
            Run Planner
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-architect"
            data-id="${escapeHtml(task.id)}"
            ${architectDisabled ? 'disabled' : ''}
          >
            Run Architect
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-task-breaker"
            data-id="${escapeHtml(task.id)}"
            ${taskBreakerDisabled ? 'disabled' : ''}
          >
            Run Task-Breaker
          </button>
          <button
            class="primary-button"
            type="button"
            data-action="run-builder-preflight"
            data-id="${escapeHtml(task.id)}"
            ${builderPreflightDisabled ? 'disabled' : ''}
          >
            Run Builder Preflight
          </button>
          <p class="form-help">
            ${
              taskBreakerDisabled
                ? `Task-Breaker stays disabled until ${escapeHtml(taskBreakerState.reasons.join('; '))}.`
                : `Task-Breaker reads ${escapeHtml(latestPlanArtifact?.id || 'latest plan artifact')} and ${escapeHtml(latestArchitectureArtifact?.id || 'latest architecture artifact')}, writes a breakdown artifact, and only preselects a blocking Decision Inbox item without leaving Artifacts.`
            }
          </p>
          <p class="form-help">
            ${
              builderPreflightDisabled
                ? `Builder preflight stays disabled until ${escapeHtml(builderPreflightState.reasons.join('; '))}.`
                : `Builder preflight reads ${escapeHtml(builderPreflightState.latestPlanArtifact?.id || 'latest plan artifact')}, ${escapeHtml(builderPreflightState.latestArchitectureArtifact?.id || 'latest architecture artifact')}, and ${escapeHtml(builderPreflightState.latestBreakdownArtifact?.id || 'latest breakdown artifact')}, then writes a no-write preflight artifact and leaves reviewer as an explicit downstream step.`
            }
          </p>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">Generated Subtasks</p>
        ${
          latestBreakdownArtifact && parsedBreakdown
            ? `
              <div class="token-row">
                ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                ${createToken('derived view', 'neutral')}
                ${
                  preselectedPendingItem
                    ? createToken(`preselected inbox:${preselectedPendingItem.id}`, 'warning')
                    : ''
                }
              </div>
              <p class="detail-copy">Best-effort parsing of the latest breakdown artifact. Raw markdown remains available on Artifacts.</p>
              ${renderStructuredBreakdown(parsedBreakdown, {
                includeExecutionBoundary: false,
                includeExpectedArtifacts: false,
                includeStopConditions: false,
              })}
            `
            : latestBreakdownArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestBreakdownArtifact.id}`, 'neutral')}
                  ${createToken('raw fallback only', 'warning')}
                </div>
                <p class="detail-copy">The latest breakdown artifact could not be structured. Open the raw markdown from Artifacts for the full content.</p>
              `
              : '<p class="detail-copy">No breakdown artifact yet. Run task-breaker after plan and architecture artifacts are ready.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Latest Builder Preflight</p>
        ${
          latestPreflightArtifact && parsedPreflight
            ? `
              <div class="token-row">
                ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                ${createToken('compact summary', 'neutral')}
                ${createToken(`target files:${parsedPreflight.targetFiles.length}`, 'neutral')}
                ${createToken(`risks:${parsedPreflight.risks.length}`, parsedPreflight.risks.length > 0 ? 'warning' : 'success')}
              </div>
              <p class="detail-copy">Best-effort compact summary only. Open Artifacts for the full structured preview and raw markdown.</p>
              ${renderCompactList('Target Files', parsedPreflight.targetFiles)}
              ${renderCompactList('Risks', parsedPreflight.risks)}
              ${renderCompactList('Verification Plan', parsedPreflight.verificationPlan)}
              ${renderBuilderLiveMutationApprovalPanel(task, data)}
            `
            : latestPreflightArtifact
              ? `
                <div class="token-row">
                  ${createToken(`source:${latestPreflightArtifact.id}`, 'neutral')}
                  ${createToken('raw fallback only', 'warning')}
                </div>
                <p class="detail-copy">Structured parsing failed. Open Artifacts for the raw markdown fallback.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
              : `
                <p class="detail-copy">No builder preflight artifact yet. Run builder preflight after plan, architecture, and breakdown artifacts are ready.</p>
                ${renderBuilderLiveMutationApprovalPanel(task, data)}
              `
        }
        ${
          showBuilderApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  'Approval actions stay on the current surface and mirror the server snapshot as-is.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Review</p>
        <div class="pill-list">
          ${createToken(`required:${task.review?.required ? 'yes' : 'no'}`, task.review?.required ? 'warning' : 'neutral')}
          ${createToken(`status:${task.review?.status || 'pending'}`, getReviewTone(task.review?.status))}
          ${createToken(`verification:${task.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
          ${
            reviewerState.summary.sourceBuilderRunId
              ? createToken(`source run:${reviewerState.summary.sourceBuilderRunId}`, 'neutral')
              : ''
          }
        </div>
        <p class="detail-copy">${escapeHtml(task.review?.resolution?.note || 'No review resolution note recorded.')}</p>
        <div class="guard-summary">
          <div class="token-row">
            ${
              reviewerState.summary.allowed
                ? createToken('reviewer:ready', 'success')
                : createToken('reviewer:blocked', 'warning')
            }
            ${
              reviewerState.summary.preflightArtifactId
                ? createToken(`preflight:${reviewerState.summary.preflightArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.changeSummaryArtifactId
                ? createToken(`change-summary:${reviewerState.summary.changeSummaryArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.patchArtifactId
                ? createToken(`patch:${reviewerState.summary.patchArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.diffArtifactId
                ? createToken(`diff:${reviewerState.summary.diffArtifactId}`, 'neutral')
                : ''
            }
            ${
              reviewerState.summary.existingReviewerRunId
                ? createToken(`existing reviewer:${reviewerState.summary.existingReviewerRunId}`, 'warning')
                : ''
            }
          </div>
          ${
            reviewerState.reasons.length > 0
              ? renderReasonList('Reviewer Disabled By', reviewerState.reasons)
              : '<p class="detail-copy">Reviewer can inspect the latest builder live mutation bundle without any new code mutation.</p>'
          }
          <div class="form-actions form-actions-inline">
            <button
              class="primary-button"
              type="button"
              data-action="run-reviewer"
              data-id="${escapeHtml(task.id)}"
              ${reviewerState.disabled ? 'disabled' : ''}
            >
              Run Reviewer
            </button>
            <p class="form-help">
              ${
                reviewerState.disabled
                  ? `Run Reviewer stays disabled until ${escapeHtml(reviewerState.reasons.join('; '))}.`
                  : `Run Reviewer reads builder run ${escapeHtml(reviewerState.summary.sourceBuilderRunId)} and writes a terminal review artifact without commit or release actions.`
              }
            </p>
          </div>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">Commit Package</p>
        <div class="pill-list">
          ${createToken(
            `ready:${commitPackageState.summary.allowed ? 'yes' : 'no'}`,
            commitPackageState.summary.allowed ? 'success' : 'warning',
          )}
          ${createToken(
            `commit approval:${getCommitApprovalDisplayStatus(commitPackageState.summary)}`,
            getApprovalDisplayTone(getCommitApprovalDisplayStatus(commitPackageState.summary)),
          )}
          ${
            commitPackageState.summary.currentCommitPackageArtifactId
              ? createToken(
                  `current package:${commitPackageState.summary.currentCommitPackageArtifactId}`,
                  'neutral',
                )
              : ''
          }
        </div>
        ${renderCommitPackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showCommitApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  'Approval actions stay on the current surface and mirror the server snapshot as-is.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Release Package</p>
        ${renderReleasePackagePanel(task, data, { currentSurface: 'taskboard' })}
        ${
          showReleaseApprovalHint
            ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                helpText:
                  'Approval actions stay on the current surface and mirror the server snapshot as-is. Push, publish, and external release remain disabled.',
              })
            : ''
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Close Out</p>
        <div class="pill-list">
          ${createToken(
            `ready:${closeOutState.summary.allowed ? 'yes' : 'no'}`,
            closeOutState.summary.allowed ? 'success' : 'warning',
          )}
          ${createToken(
            `release approval:${getCloseOutApprovalDisplayStatus(closeOutState.summary)}`,
            getApprovalDisplayTone(getCloseOutApprovalDisplayStatus(closeOutState.summary)),
          )}
          ${
            closeOutState.summary.existingCloseOutArtifactId
              ? createToken(
                  `existing close-out:${closeOutState.summary.existingCloseOutArtifactId}`,
                  closeOutState.summary.conflict ? 'warning' : 'neutral',
                )
              : ''
          }
        </div>
        ${renderCloseOutPanel(task, data, { currentSurface: 'taskboard' })}
      </div>

      <div class="detail-block">
        <p class="detail-key">Approvals</p>
        ${
          taskApprovals.length > 0
            ? taskApprovals
                .map(
                  (approval) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(approval.allowedNextAction || approval.scope)}</strong>
                      <div class="token-row">
                        ${createToken(approval.status, getApprovalTone(approval.status))}
                        ${createToken(`scope:${approval.scope}`, 'neutral')}
                      </div>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">No approval records linked to this task.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Decision History</p>
        ${
          taskInboxItems.length > 0
            ? taskInboxItems
                .map(
                  (item) => `
                    <div class="kv-item">
                      <strong>${escapeHtml(item.title)}</strong>
                      <div class="token-row">
                        ${createToken(item.kind, getInboxTone(item))}
                        ${createToken(item.status, item.status === 'pending' ? 'warning' : 'success')}
                        ${item.blocksTask ? createToken('blocksTask', 'danger') : ''}
                        ${item.id === selectedInboxItem?.id ? createToken('preselected', 'accent') : ''}
                      </div>
                      <p class="detail-copy">${escapeHtml(item.prompt || item.resolution?.note || 'No prompt recorded.')}</p>
                    </div>
                  `,
                )
                .join('')
            : '<p class="detail-copy">No decision inbox items linked to this task.</p>'
        }
      </div>

      <div class="detail-block">
        <p class="detail-key">Linked Outputs</p>
        <div class="token-row">
          ${createToken(`runs:${taskRuns.length}`, 'neutral')}
          ${createToken(`artifacts:${taskArtifacts.length}`, 'neutral')}
        </div>
      </div>
    </aside>
  `;
}

function renderLogs(data) {
  if (!data.activeProject) {
    elements.surfaces.logs.innerHTML = renderProjectGateSurface(
      'Logs Unavailable',
      getProjectGateCopy(data, 'Logs'),
    );
    return;
  }

  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedTask = selectedRun
    ? data.taskMap.get(selectedRun.taskId)
    : data.taskMap.get(state.selectedTaskId) || null;
  const runBundle = selectedRun ? getRunArtifactBundle(selectedRun, data) : null;
  const logs = state.selectedRunLogs?.logs || [];
  const logText =
    logs.length > 0
      ? logs.map((entry) => `[${entry.ts}] ${entry.level.toUpperCase()} ${entry.message}`).join('\n')
      : 'No log records available for this run.';

  const runList = data.runs.length
    ? data.runs
        .map((run) => {
          const runTask = data.taskMap.get(run.taskId);

          return `
            <button class="list-button ${run.id === selectedRun?.id ? 'is-selected' : ''}" type="button" data-action="select-run" data-id="${escapeHtml(run.id)}">
              <div class="card-title-row">
                <strong>${escapeHtml(run.id)}</strong>
                ${createToken(run.status, getRunTone(run.status))}
              </div>
              <p class="list-copy">${escapeHtml(runTask?.title || 'Unknown task')}</p>
              <div class="token-row">
                ${createToken(`started:${formatDate(run.startedAt)}`, 'neutral')}
                ${run.finishedAt ? createToken(`finished:${formatDate(run.finishedAt)}`, 'neutral') : ''}
              </div>
            </button>
          `;
        })
        .join('')
    : `
      <div class="empty-state">
        <strong>No runs yet</strong>
        <p>Start task execution before using the Logs surface.</p>
      </div>
    `;

  elements.surfaces.logs.innerHTML = `
    <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Logs</h2>
            <p class="panel-copy">Advanced operator logs for run-level execution output, linkage, and gate context.</p>
          </div>
        </div>
        ${renderAdvancedOpsNotice('Logs remains an advanced inspection surface. Mission, Council, Execution, and Deliverables stay the primary product path.')}
        <div class="list-column">${runList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">Run Detail</p>
          <h2>${escapeHtml(selectedRun?.id || 'No run selected')}</h2>
        </div>
        ${
          selectedRun
            ? `
              <div class="detail-block">
                <div class="token-row">
                  ${createToken(selectedRun.status, getRunTone(selectedRun.status))}
                  ${selectedTask ? createToken(selectedTask.lifecycleState, 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`review:${selectedTask.review.status}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('blocked', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
                </div>
                <p class="detail-copy">${escapeHtml(selectedTask?.title || 'Unknown task')}</p>
                <p class="detail-copy mono">${escapeHtml(selectedRun.logPath)}</p>
              </div>
              <div class="detail-block">
                <p class="detail-key">Timestamps</p>
                <div class="kv-grid">
                  <div class="kv-item">
                    <strong>${escapeHtml(formatDate(selectedRun.startedAt))}</strong>
                    <p class="detail-copy">Started</p>
                  </div>
                  <div class="kv-item">
                    <strong>${escapeHtml(formatDate(selectedRun.finishedAt))}</strong>
                    <p class="detail-copy">Finished</p>
                  </div>
                </div>
              </div>
              <div class="detail-block">
                <p class="detail-key">Run Linkage</p>
                <p class="detail-copy">Client-first links from the selected run to its input preflight and saved mutation artifacts.</p>
                ${
                  runBundle
                    ? renderRelationStrip(runBundle) ||
                      '<p class="detail-copy">No direct artifact linkage recorded for this run.</p>'
                    : '<p class="detail-copy">No direct artifact linkage recorded for this run.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">Output</p>
                <pre class="log-viewer">${escapeHtml(logText)}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>No run selected</strong>
                <p>Select a run from the left column to inspect its output.</p>
              </div>
            `
        }
      </aside>
    </div>
  `;
}

function renderArtifacts(data) {
  if (!data.activeProject) {
    elements.surfaces.artifacts.innerHTML = renderProjectGateSurface(
      'Artifacts Unavailable',
      getProjectGateCopy(data, 'Artifacts'),
    );
    return;
  }

  const selectedArtifactMeta = data.artifactMap.get(state.selectedArtifactId) || null;
  const selectedArtifactTask = selectedArtifactMeta
    ? data.taskMap.get(selectedArtifactMeta.taskId)
    : null;
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const parsedBreakdown =
    selectedArtifactMeta?.type === 'breakdown' && state.selectedArtifact?.content
      ? parseBreakdownArtifact(state.selectedArtifact.content)
      : null;
  const parsedPreflight =
    selectedArtifactMeta?.type === 'preflight' && state.selectedArtifact?.content
      ? parsePreflightArtifact(state.selectedArtifact.content)
      : null;
  const parsedChangeSummary =
    selectedArtifactMeta?.type === 'change-summary' && state.selectedArtifact?.content
      ? parseChangeSummaryArtifact(state.selectedArtifact.content)
      : null;
  const parsedReview =
    selectedArtifactMeta?.type === 'review' && state.selectedArtifact?.content
      ? parseReviewArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitPackage =
    selectedArtifactMeta?.type === 'commit-package' && state.selectedArtifact?.content
      ? parseCommitPackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCommitResult =
    selectedArtifactMeta?.type === 'commit-result' && state.selectedArtifact?.content
      ? parseCommitResultArtifact(state.selectedArtifact.content)
      : null;
  const parsedReleasePackage =
    selectedArtifactMeta?.type === 'release-package' && state.selectedArtifact?.content
      ? parseReleasePackageArtifact(state.selectedArtifact.content)
      : null;
  const parsedCloseOut =
    selectedArtifactMeta?.type === 'close-out' && state.selectedArtifact?.content
      ? parseCloseOutArtifact(state.selectedArtifact.content)
      : null;
  const parsedUnifiedDiff =
    (selectedArtifactMeta?.type === 'patch' || selectedArtifactMeta?.type === 'diff') &&
    state.selectedArtifact?.content
      ? parseUnifiedDiffArtifact(state.selectedArtifact.content)
      : null;
  const artifactRelationContext = selectedArtifactMeta
      ? getArtifactRelationContext(selectedArtifactMeta, data, {
        parsedChangeSummary,
        parsedCommitResult,
        parsedCommitPackage,
        parsedCloseOut,
        parsedReleasePackage,
        parsedReview,
      })
    : null;
  const selectedArtifactPolicyEntry = selectedArtifactMeta
    ? getArtifactCatalogEntry(selectedArtifactMeta, data)
    : null;
  const selectedArtifactPolicySummary = selectedArtifactMeta
    ? getArtifactPolicySummary(selectedArtifactMeta, data)
    : '';
  const preselectedPendingItem =
    selectedArtifactTask &&
    selectedInboxItem &&
    selectedInboxItem.taskId === selectedArtifactTask.id &&
    selectedInboxItem.status === 'pending'
      ? selectedInboxItem
      : null;
  const preselectedApproval =
    preselectedPendingItem?.kind === 'approval' && preselectedPendingItem.sourceId
      ? data.approvals.find((approval) => approval.id === preselectedPendingItem.sourceId) || null
      : null;
  const showBuilderApprovalHint =
    Boolean(preselectedPendingItem) &&
    (preselectedPendingItem.kind !== 'approval' ||
      preselectedApproval?.allowedNextAction === 'builder-live-mutation');
  const showCommitApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'commit-intent';
  const showReleaseApprovalHint =
    preselectedPendingItem?.kind === 'approval' &&
    preselectedApproval?.allowedNextAction === 'release-ready';
  const artifactList = data.artifacts.length
    ? data.artifacts
        .map(
          (artifact) => `
            <button class="list-button ${artifact.id === selectedArtifactMeta?.id ? 'is-selected' : ''}" type="button" data-action="select-artifact" data-id="${escapeHtml(artifact.id)}">
              <div class="card-title-row">
                <strong>${escapeHtml(artifact.id)}</strong>
                ${createToken(artifact.type, 'neutral')}
              </div>
              <p class="list-copy">${escapeHtml(data.taskMap.get(artifact.taskId)?.title || 'Unknown task')}</p>
              <div class="token-row">
                ${renderArtifactPolicyTokens(artifact, data)}
                ${createToken(`run:${artifact.runId}`, 'neutral')}
                ${createToken(formatDate(artifact.createdAt), 'neutral')}
              </div>
            </button>
          `,
        )
        .join('')
    : `
      <div class="empty-state">
        <strong>No artifacts</strong>
        <p>Artifacts appear after runtime execution or review evidence is recorded.</p>
      </div>
    `;

  elements.surfaces.artifacts.innerHTML = `
    <div class="surface-grid surface-grid-wide">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Artifacts</h2>
            <p class="panel-copy">Advanced artifact inspection with latest-first evidence, provenance, and raw stored content.</p>
            <p class="panel-copy">Badges show browse priority and preview mode. All artifact history stays retained in v1.</p>
          </div>
        </div>
        ${renderAdvancedOpsNotice('Artifacts is intentionally an advanced provenance surface. Deliverables stays summary-only and links back here only when deep inspection is required.')}
        <div class="list-column">${artifactList}</div>
      </section>
      <aside class="detail-card">
        <div>
          <p class="eyebrow">Artifact Detail</p>
          <h2>${escapeHtml(selectedArtifactMeta?.id || 'No artifact selected')}</h2>
        </div>
        ${
          selectedArtifactMeta
            ? `
              <div class="detail-block">
                <div class="token-row">
                  ${createToken(selectedArtifactMeta.type, 'neutral')}
                  ${renderArtifactPolicyTokens(selectedArtifactMeta, data)}
                  ${selectedArtifactTask ? createToken(selectedArtifactTask.lifecycleState, 'neutral') : ''}
                  ${selectedArtifactTask?.review ? createToken(`review:${selectedArtifactTask.review.status}`, getReviewTone(selectedArtifactTask.review.status)) : ''}
                </div>
                <p class="detail-copy">${escapeHtml(selectedArtifactTask?.title || 'Unknown task')}</p>
                <p class="detail-copy mono">${escapeHtml(selectedArtifactMeta.path)}</p>
                ${
                  selectedArtifactPolicySummary
                    ? `<p class="detail-copy">${escapeHtml(selectedArtifactPolicySummary)}</p>`
                    : ''
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">Provenance</p>
                <p class="detail-copy">This strip is convenience only. Stored raw content and runtime metadata remain the source of truth.</p>
                ${
                  renderRelationStrip(artifactRelationContext) ||
                  '<p class="detail-copy">No direct run or artifact linkage recorded for this artifact.</p>'
                }
              </div>
              <div class="detail-block">
                <p class="detail-key">Preview</p>
                ${
                  selectedArtifactMeta.type === 'breakdown' && parsedBreakdown
                    ? `
                      <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                      ${renderStructuredBreakdown(parsedBreakdown)}
                    `
                    : selectedArtifactMeta.type === 'breakdown'
                      ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                      : selectedArtifactMeta.type === 'preflight' && parsedPreflight
                        ? `
                          <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                          ${renderStructuredPreflight(parsedPreflight)}
                        `
                        : selectedArtifactMeta.type === 'preflight'
                          ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                        : selectedArtifactMeta.type === 'change-summary' && parsedChangeSummary
                          ? `
                            <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                            ${renderStructuredChangeSummary(parsedChangeSummary)}
                          `
                          : selectedArtifactMeta.type === 'change-summary'
                            ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                          : selectedArtifactMeta.type === 'review' && parsedReview
                            ? `
                              <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                              ${renderStructuredReview(parsedReview, selectedArtifactTask?.review?.status || null)}
                            `
                            : selectedArtifactMeta.type === 'review'
                              ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'commit-package' && parsedCommitPackage
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredCommitPackage(parsedCommitPackage)}
                              `
                              : selectedArtifactMeta.type === 'commit-package'
                                ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'commit-result' && parsedCommitResult
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredCommitResult(parsedCommitResult)}
                              `
                              : selectedArtifactMeta.type === 'commit-result'
                                ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'release-package' && parsedReleasePackage
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredReleasePackage(parsedReleasePackage)}
                              `
                              : selectedArtifactMeta.type === 'release-package'
                                ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'close-out' && parsedCloseOut
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredCloseOut(parsedCloseOut)}
                              `
                              : selectedArtifactMeta.type === 'close-out'
                                ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'patch' && parsedUnifiedDiff
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'planned patch')}
                              `
                            : selectedArtifactMeta.type === 'patch'
                              ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                            : selectedArtifactMeta.type === 'diff' && parsedUnifiedDiff
                              ? `
                                <p class="detail-copy">${escapeHtml(getStructuredPreviewLeadCopy())}</p>
                                ${renderStructuredUnifiedDiff(parsedUnifiedDiff, 'observed diff')}
                              `
                              : selectedArtifactMeta.type === 'diff'
                                ? `<p class="detail-copy">${escapeHtml(getStructuredPreviewFallbackCopy())}</p>`
                      : ''
                }
                ${
                  selectedArtifactPolicyEntry?.previewMode === 'raw-only'
                    ? `<p class="detail-copy">${escapeHtml(getRawOnlyPreviewCopy())}</p>`
                    : ''
                }
                ${
                  selectedArtifactMeta.type === 'preflight' && selectedArtifactTask
                    ? renderBuilderLiveMutationApprovalPanel(selectedArtifactTask, data)
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderCommitPackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderReleasePackagePanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package' ||
                    selectedArtifactMeta.type === 'close-out')
                    ? renderCloseOutPanel(selectedArtifactTask, data, {
                        currentSurface: 'artifacts',
                      })
                    : ''
                }
                ${
                  showBuilderApprovalHint &&
                  selectedArtifactMeta.type === 'preflight'
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        helpText: 'Approval actions stay on Artifacts and mirror the server snapshot as-is.',
                      })
                    : ''
                }
                ${
                  showCommitApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'review' ||
                    selectedArtifactMeta.type === 'commit-package' ||
                    selectedArtifactMeta.type === 'commit-result')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        helpText: 'Approval actions stay on Artifacts and mirror the server snapshot as-is.',
                      })
                    : ''
                }
                ${
                  showReleaseApprovalHint &&
                  selectedArtifactTask &&
                  (selectedArtifactMeta.type === 'commit-result' ||
                    selectedArtifactMeta.type === 'release-package')
                    ? renderPreselectedPendingItemHint(preselectedPendingItem, preselectedApproval, {
                        helpText:
                          'Approval actions stay on Artifacts and mirror the server snapshot as-is. Push, publish, and external release remain disabled.',
                      })
                    : ''
                }
                <p class="detail-key">Stored Raw Content</p>
                <p class="detail-copy">Stored raw content below remains the source of truth.</p>
                <pre class="artifact-preview">${escapeHtml(state.selectedArtifact?.content || 'No preview content available.')}</pre>
              </div>
            `
            : `
              <div class="empty-state">
                <strong>No artifact selected</strong>
                <p>Select an artifact to inspect its stored content and source linkage.</p>
              </div>
            `
        }
      </aside>
    </div>
  `;
}

function renderDecisionInbox(data) {
  if (!data.activeProject) {
    elements.surfaces['decision-inbox'].innerHTML = renderProjectGateSurface(
      'Decision Inbox Unavailable',
      getProjectGateCopy(data, 'Decision Inbox'),
    );
    return;
  }

  const pendingItems = data.inboxItems.filter((item) => item.status === 'pending');
  const resolvedItems = data.inboxItems.filter((item) => item.status === 'resolved');
  const selectedItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const selectedTask = selectedItem ? data.taskMap.get(selectedItem.taskId) : null;
  const selectedApproval = selectedItem?.sourceId
    ? data.approvals.find((approval) => approval.id === selectedItem.sourceId) || null
    : null;
  const inboxActionDisabled = state.loading || state.mutating;
  let actionSurface = '';

  if (selectedItem?.status === 'pending' && selectedItem.kind === 'approval') {
    actionSurface = `
      <div class="detail-block">
        <p class="detail-key">Actions</p>
        <div class="form-actions form-actions-inline">
          <button
            class="primary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="approve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            Approve
          </button>
          <button
            class="danger-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="reject"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            Reject
          </button>
          <p class="form-help">Approval items only allow approve or reject in this slice.</p>
        </div>
      </div>
    `;
  } else if (selectedItem?.status === 'pending' && selectedItem.kind === 'decision') {
    actionSurface = `
      <div class="detail-block">
        <p class="detail-key">Actions</p>
        <div class="form-actions form-actions-inline">
          <button
            class="secondary-button"
            type="button"
            data-action="run-inbox-action"
            data-id="${escapeHtml(selectedItem.id)}"
            data-verb="resolve"
            ${inboxActionDisabled ? 'disabled' : ''}
          >
            Resolve
          </button>
          <p class="form-help">Decision items only allow resolve in this slice.</p>
        </div>
      </div>
    `;
  } else if (selectedItem?.status === 'pending') {
    actionSurface = `
      <div class="detail-block">
        <p class="detail-key">Actions</p>
        <p class="detail-copy">No write action is available for this inbox item in ui-slice-03.</p>
      </div>
    `;
  }

  const renderInboxList = (items, title, emptyCopy) => `
    <section class="surface-panel">
      <div class="panel-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          <p class="panel-copy">${escapeHtml(emptyCopy)}</p>
        </div>
      </div>
      ${
        items.length > 0
          ? `<div class="list-column">
              ${items
                .map(
                  (item) => `
                    <button class="list-button ${item.id === selectedItem?.id ? 'is-selected' : ''}" type="button" data-action="select-inbox-item" data-id="${escapeHtml(item.id)}">
                      <div class="card-title-row">
                        <strong>${escapeHtml(item.title)}</strong>
                        ${createToken(item.kind, getInboxTone(item))}
                      </div>
                      <p class="list-copy">${escapeHtml(data.taskMap.get(item.taskId)?.title || 'Unknown task')}</p>
                      <div class="token-row">
                        ${createToken(item.status, item.status === 'pending' ? 'warning' : 'success')}
                        ${item.blocksTask ? createToken('blocksTask', 'danger') : ''}
                        ${createToken(formatDate(item.updatedAt || item.createdAt), 'neutral')}
                      </div>
                    </button>
                  `,
                )
                .join('')}
            </div>`
          : `
            <div class="empty-state">
              <strong>None</strong>
              <p>${escapeHtml(emptyCopy)}</p>
            </div>
          `
      }
    </section>
  `;

  elements.surfaces['decision-inbox'].innerHTML = `
    <div class="surface-grid surface-grid-inbox">
      <section class="surface-panel">
        <div class="panel-header">
          <div>
            <h2>Decision Inbox</h2>
            <p class="panel-copy">Advanced decision handling for pending and resolved review, decision, and approval items.</p>
          </div>
        </div>
        ${renderAdvancedOpsNotice('Decision Inbox stays available for explicit approval and decision handling, but it is no longer the primary orchestration entry path.')}
        ${renderInboxList(pendingItems, 'Pending Queue', 'Human-required gates still waiting on resolution.')}
      </section>
      ${renderInboxList(resolvedItems, 'Resolved Recent', 'Resolved decisions and approvals remain visible for audit.')}
      <aside class="detail-card">
        <div>
          <p class="eyebrow">Inbox Detail</p>
          <h2>${escapeHtml(selectedItem?.title || 'No inbox item selected')}</h2>
        </div>
        ${
          selectedItem
            ? `
              <div class="detail-block">
                <div class="token-row">
                  ${createToken(selectedItem.kind, getInboxTone(selectedItem))}
                  ${createToken(selectedItem.status, selectedItem.status === 'pending' ? 'warning' : 'success')}
                  ${selectedItem.blocksTask ? createToken('blocksTask', 'danger') : ''}
                </div>
                <p class="detail-copy">${escapeHtml(selectedItem.prompt || 'No prompt recorded.')}</p>
              </div>
              <div class="detail-block">
                <p class="detail-key">Affected Task</p>
                <strong>${escapeHtml(selectedTask?.title || selectedItem.taskId)}</strong>
                <div class="token-row">
                  ${selectedTask ? createToken(selectedTask.lifecycleState, 'neutral') : ''}
                  ${selectedTask?.review ? createToken(`review:${selectedTask.review.status}`, getReviewTone(selectedTask.review.status)) : ''}
                  ${selectedTask?.flags?.blocked ? createToken('blocked', 'danger') : ''}
                  ${selectedTask?.flags?.waitingApproval ? createToken('waitingApproval', 'accent') : ''}
                  ${selectedTask?.flags?.waitingDecision ? createToken('waitingDecision', 'warning') : ''}
                </div>
              </div>
              ${
                selectedApproval
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">Approval Record</p>
                      <div class="kv-item">
                        <strong>${escapeHtml(selectedApproval.allowedNextAction || selectedApproval.scope)}</strong>
                        <div class="token-row">
                          ${createToken(selectedApproval.status, getApprovalTone(selectedApproval.status))}
                          ${createToken(`scope:${selectedApproval.scope}`, 'neutral')}
                        </div>
                      </div>
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'builder-live-mutation'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">Live Mutation Approval</p>
                      ${renderBuilderLiveMutationApprovalPanel(selectedTask, data)}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'commit-intent'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">Commit Execution</p>
                      ${renderCommitPackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">Release Package</p>
                      ${renderReleasePackagePanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                        includeAction: false,
                      })}
                    </div>
                  `
                  : ''
              }
              ${
                selectedTask &&
                selectedApproval?.allowedNextAction === 'release-ready'
                  ? `
                    <div class="detail-block">
                      <p class="detail-key">Close Out</p>
                      ${renderCloseOutPanel(selectedTask, data, {
                        currentSurface: 'decision-inbox',
                      })}
                    </div>
                  `
                  : ''
              }
              <div class="detail-block">
                <p class="detail-key">Resolution</p>
                <p class="detail-copy">${escapeHtml(selectedItem.resolution?.note || 'Still pending or no resolution note recorded.')}</p>
                <div class="token-row">
                  ${selectedItem.resolution?.action ? createToken(`action:${selectedItem.resolution.action}`, 'success') : ''}
                  ${createToken(`updated:${formatDate(selectedItem.updatedAt)}`, 'neutral')}
                </div>
              </div>
              ${actionSurface}
            `
            : `
              <div class="empty-state">
                <strong>No inbox item selected</strong>
                <p>Select an item to inspect task context and recorded resolution state.</p>
              </div>
            `
        }
      </aside>
    </div>
  `;
}

function renderError(error) {
  const message = escapeHtml(error?.message || 'Unknown error');

  for (const surface of Object.values(elements.surfaces)) {
    surface.innerHTML = `
      <div class="empty-state">
        <strong>Runtime unavailable</strong>
        <p>${message}</p>
      </div>
    `;
  }
}

function render() {
  const data = getDerived();

  renderSummary(data);
  renderNav(data);

  for (const surfaceId of SURFACE_IDS) {
    elements.surfaces[surfaceId].classList.toggle('is-active', surfaceId === state.surface);
  }

  if (state.error) {
    renderError(state.error);
    return;
  }

  renderMission(data);
  renderCouncil(data);
  renderExecution(data);
  renderDeliverables(data);
  renderTaskboard(data);
  renderLogs(data);
  renderArtifacts(data);
  renderDecisionInbox(data);
}

document.addEventListener('click', async (event) => {
  const navButton = event.target.closest('[data-surface]');
  const actionButton = event.target.closest('[data-action]');

  if (navButton) {
    await handleSurfaceChange(navButton.dataset.surface);
    return;
  }

  if (actionButton) {
    try {
      if (actionButton.dataset.action === 'run-planner') {
        await runPlanner(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-architect') {
        await runArchitect(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-task-breaker') {
        await runTaskBreaker(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-preflight') {
        await runBuilderPreflight(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'request-builder-live-mutation-approval') {
        await requestBuilderLiveMutationApproval(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-builder-live-mutation') {
        await runBuilderLiveMutation(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'set-task-worktree-ref') {
        await applySelectedTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'clear-task-worktree-ref') {
        await clearTaskWorktree(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'switch-active-project-worktree') {
        await switchActiveProjectWorktree(actionButton.dataset.path);
        return;
      }

      if (actionButton.dataset.action === 'run-reviewer') {
        await runReviewer(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-commit-package') {
        await runCommitPackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-local-commit') {
        await runLocalCommit(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-release-package') {
        await runReleasePackage(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-close-out') {
        await runCloseOut(actionButton.dataset.id);
        return;
      }

      if (actionButton.dataset.action === 'run-inbox-action') {
        await runInboxAction(actionButton.dataset.id, actionButton.dataset.verb);
        return;
      }

      await handleSelection(actionButton.dataset.action, actionButton.dataset.id);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Action failed';
      render();
    }
  }
});

function handleFormInput(event) {
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');

  if (createLinkedWorktreeForm) {
    if (event.target.name === 'linkedWorktreeSlug') {
      state.linkedWorktreeDraftSlug = event.target.value;
    }

    return;
  }

  if (createProjectForm || createMissionProjectForm) {
    if (event.target.name === 'projectName') {
      state.projectDraftName = event.target.value;
    }

    if (event.target.name === 'projectPath') {
      state.projectDraftPath = event.target.value;
    }

    if (event.target.name === 'projectProviderMode') {
      state.projectDraftProviderMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'projectProviderModel') {
      state.projectDraftProviderModel = event.target.value;
    }

    if (event.target.name === 'projectProviderApiKeyVar') {
      state.projectDraftProviderApiKeyVar = event.target.value;
    }

    return;
  }

  if (updateProjectProviderForm) {
    if (event.target.name === 'editProjectProviderMode') {
      state.projectProviderDraftMode = event.target.value === 'live' ? 'live' : 'local-stub';
    }

    if (event.target.name === 'editProjectProviderModel') {
      state.projectProviderDraftModel = event.target.value;
    }

    if (event.target.name === 'editProjectProviderApiKeyVar') {
      state.projectProviderDraftApiKeyVar = event.target.value;
    }

    return;
  }

  if (createMissionForm) {
    if (event.target.name === 'missionTitle') {
      state.missionDraftTitle = event.target.value;
    }

    if (event.target.name === 'missionGoal') {
      state.missionDraftGoal = event.target.value;
    }

    if (event.target.name === 'missionConstraints') {
      state.missionDraftConstraints = event.target.value;
    }

    return;
  }

  if (!createTaskForm) {
    return;
  }

  if (event.target.name === 'title') {
    state.taskDraftTitle = event.target.value;
  }

  if (event.target.name === 'intent') {
    state.taskDraftIntent = event.target.value;
  }
}

document.addEventListener('input', handleFormInput);
document.addEventListener('change', handleFormInput);

document.addEventListener('submit', async (event) => {
  const createLinkedWorktreeForm = event.target.closest('[data-form="create-linked-worktree"]');
  const createMissionForm = event.target.closest('[data-form="create-mission"]');
  const createProjectForm = event.target.closest('[data-form="create-project"]');
  const createMissionProjectForm = event.target.closest('[data-form="create-project-from-mission"]');
  const updateProjectProviderForm = event.target.closest('[data-form="update-project-provider"]');
  const createTaskForm = event.target.closest('[data-form="create-task"]');

  if (createLinkedWorktreeForm) {
    event.preventDefault();

    try {
      await submitCreateLinkedWorktree();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Linked worktree creation failed';
      render();
    }
    return;
  }

  if (createProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Project registration failed';
      render();
    }
    return;
  }

  if (createMissionProjectForm) {
    event.preventDefault();

    try {
      await submitCreateProject({
        forceLocalStub: true,
        successSurface: 'mission',
      });
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Mission project registration failed';
      render();
    }
    return;
  }

  if (updateProjectProviderForm) {
    event.preventDefault();

    try {
      await submitUpdateProjectProvider();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Project provider update failed';
      render();
    }
    return;
  }

  if (createMissionForm) {
    event.preventDefault();

    try {
      await submitCreateMission();
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Mission creation failed';
      render();
    }
    return;
  }

  if (!createTaskForm) {
    return;
  }

  event.preventDefault();

  try {
    await submitCreateTask();
  } catch (error) {
    elements.refreshStatus.textContent = error.message || 'Task creation failed';
    render();
  }
});

elements.refreshButton.addEventListener('click', async () => {
  await refreshData();
});

async function bootstrap() {
  render();
  await refreshData();
  state.timerId = window.setInterval(refreshData, 5000);
}

void bootstrap();
