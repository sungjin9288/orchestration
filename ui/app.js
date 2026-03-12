const SURFACE_IDS = ['taskboard', 'logs', 'artifacts', 'decision-inbox'];
const TASK_LIFECYCLE_ORDER = ['Inbox', 'In Progress', 'Review', 'Done'];

const state = {
  surface: 'taskboard',
  payload: null,
  loading: false,
  mutating: false,
  error: null,
  selectedTaskId: null,
  selectedRunId: null,
  selectedArtifactId: null,
  selectedInboxItemId: null,
  selectedRunLogs: null,
  selectedArtifact: null,
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

function sortByCreatedDesc(left, right) {
  const leftValue = left.updatedAt || left.createdAt || '';
  const rightValue = right.updatedAt || right.createdAt || '';

  if (leftValue === rightValue) {
    return String(left.id).localeCompare(String(right.id));
  }

  return rightValue.localeCompare(leftValue);
}

function getActivePayload() {
  return state.payload?.snapshot || {
    activeProjectId: null,
    projects: {},
    tasks: {},
    runs: {},
    artifacts: {},
    decisionInboxItems: {},
    approvals: {},
  };
}

function getDerived() {
  const snapshot = getActivePayload();

  const projects = Object.values(snapshot.projects).sort(sortByCreatedDesc);
  const tasks = Object.values(snapshot.tasks).sort(sortByCreatedDesc);
  const runs = Object.values(snapshot.runs).sort(sortByCreatedDesc);
  const artifacts = Object.values(snapshot.artifacts).sort(sortByCreatedDesc);
  const inboxItems = Object.values(snapshot.decisionInboxItems).sort(sortByCreatedDesc);
  const approvals = Object.values(snapshot.approvals).sort(sortByCreatedDesc);

  const activeProject =
    snapshot.projects[snapshot.activeProjectId] ||
    (tasks.length > 0 ? snapshot.projects[tasks[0].projectId] : null) ||
    projects[0] ||
    null;

  const projectTasks = activeProject
    ? tasks.filter((task) => task.projectId === activeProject.id)
    : tasks;
  const projectRuns = activeProject
    ? runs.filter((run) => {
        const task = snapshot.tasks[run.taskId];
        return task && task.projectId === activeProject.id;
      })
    : runs;
  const projectArtifacts = activeProject
    ? artifacts.filter((artifact) => {
        const task = snapshot.tasks[artifact.taskId];
        return task && task.projectId === activeProject.id;
      })
    : artifacts;
  const projectInboxItems = activeProject
    ? inboxItems.filter((item) => item.projectId === activeProject.id)
    : inboxItems;
  const projectApprovals = activeProject
    ? approvals.filter((approval) => approval.projectId === activeProject.id)
    : approvals;

  const taskMap = new Map(projectTasks.map((task) => [task.id, task]));
  const runMap = new Map(projectRuns.map((run) => [run.id, run]));
  const artifactMap = new Map(projectArtifacts.map((artifact) => [artifact.id, artifact]));
  const inboxItemMap = new Map(projectInboxItems.map((item) => [item.id, item]));

  return {
    snapshot,
    activeProject,
    projects,
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

function createToken(label, tone = 'neutral') {
  return `<span class="token token-${tone}">${escapeHtml(label)}</span>`;
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

function ensureSelection(data) {
  const selectedTask = data.taskMap.get(state.selectedTaskId);

  if (!selectedTask) {
    state.selectedTaskId = data.tasks[0]?.id || null;
  }

  const activeTask = data.taskMap.get(state.selectedTaskId) || null;
  const preferredRunId =
    activeTask?.latestRunId && data.runMap.has(activeTask.latestRunId) ? activeTask.latestRunId : null;
  const selectedRun = data.runMap.get(state.selectedRunId) || null;

  if (!selectedRun || (activeTask && selectedRun.taskId !== activeTask.id)) {
    state.selectedRunId = preferredRunId;
  }

  if (activeTask) {
    const taskArtifactIds = activeTask.artifactIds || [];
    const firstTaskArtifactId = taskArtifactIds.find((artifactId) => data.artifactMap.has(artifactId));
    const selectedArtifact = data.artifactMap.get(state.selectedArtifactId) || null;

    if (!selectedArtifact || selectedArtifact.taskId !== activeTask.id) {
      state.selectedArtifactId = firstTaskArtifactId || null;
    }
  } else if (!data.artifactMap.has(state.selectedArtifactId)) {
    state.selectedArtifactId = data.artifacts[0]?.id || null;
  }

  const pendingForTask = activeTask
    ? data.inboxItems.filter((item) => item.taskId === activeTask.id && item.status === 'pending')
    : [];
  const nextInboxItem =
    pendingForTask[0]?.id ||
    data.inboxItems.find((item) => item.status === 'pending')?.id ||
    data.inboxItems[0]?.id ||
    null;

  if (!data.inboxItemMap.has(state.selectedInboxItemId)) {
    state.selectedInboxItemId = nextInboxItem;
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

function applySnapshotPayload(payload) {
  state.payload = {
    generatedAt: payload.generatedAt,
    runtimeRoot: payload.runtimeRoot,
    snapshot: payload.snapshot,
  };
}

async function hydrateSelectedDetails() {
  const runId = state.selectedRunId;
  const artifactId = state.selectedArtifactId;

  state.selectedRunLogs = null;
  state.selectedArtifact = null;

  if (runId) {
    state.selectedRunLogs = await fetchJson(`/api/runs/${encodeURIComponent(runId)}/logs`);
  }

  if (artifactId) {
    const artifactPayload = await fetchJson(`/api/artifacts/${encodeURIComponent(artifactId)}`);
    state.selectedArtifact = artifactPayload.artifact;
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
  }
}

function syncSelectionsFromTask(taskId) {
  const data = getDerived();
  const task = data.taskMap.get(taskId);

  state.selectedTaskId = taskId;

  if (task?.latestRunId && data.runMap.has(task.latestRunId)) {
    state.selectedRunId = task.latestRunId;
  } else {
    state.selectedRunId = null;
  }

  const taskArtifactId = (task?.artifactIds || []).find((artifactId) => data.artifactMap.has(artifactId));

  if (taskArtifactId) {
    state.selectedArtifactId = taskArtifactId;
  } else {
    state.selectedArtifactId = null;
  }

  const pendingItem =
    data.inboxItems.find((item) => item.taskId === taskId && item.status === 'pending') ||
    data.inboxItems.find((item) => item.taskId === taskId);

  if (pendingItem) {
    state.selectedInboxItemId = pendingItem.id;
  }
}

async function handleSurfaceChange(surface) {
  state.surface = surface;
  render();
}

async function handleSelection(action, id) {
  if (action === 'select-task') {
    syncSelectionsFromTask(id);
  }

  if (action === 'select-run') {
    const data = getDerived();
    const run = data.runMap.get(id);

    state.selectedRunId = id;

    if (run) {
      syncSelectionsFromTask(run.taskId);
      state.selectedRunId = id;
    }
  }

  if (action === 'select-artifact') {
    const data = getDerived();
    const artifact = data.artifactMap.get(id);

    state.selectedArtifactId = id;

    if (artifact) {
      syncSelectionsFromTask(artifact.taskId);
      state.selectedArtifactId = id;
      state.selectedRunId = artifact.runId || state.selectedRunId;
    }
  }

  if (action === 'select-inbox-item') {
    const data = getDerived();
    const item = data.inboxItemMap.get(id);

    state.selectedInboxItemId = id;

    if (item) {
      syncSelectionsFromTask(item.taskId);
      state.selectedInboxItemId = id;
    }
  }

  await hydrateSelectedDetails();
  render();
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
    state.taskDraftTitle = '';
    state.taskDraftIntent = '';
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
    state.selectedTaskId = taskId;
    state.selectedRunId = payload.mutation.runId;
    state.selectedArtifactId = payload.mutation.artifactId;
    state.selectedInboxItemId = payload.mutation.inboxItemId || state.selectedInboxItemId;
    state.selectedRunLogs = payload.runLogs || null;
    state.selectedArtifact = payload.artifactDetail || null;
    render();
    elements.refreshStatus.textContent = `Planner run ${payload.mutation.runId} completed`;
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
  const runCount = data.runs.length;
  const taskCount = data.tasks.length;

  for (const button of elements.navButtons) {
    const surface = button.dataset.surface;
    const isActive = surface === state.surface;
    button.classList.toggle('is-active', isActive);

    let count = 0;
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

    button.textContent = `${button.dataset.surface === 'decision-inbox' ? 'Decision Inbox' : button.dataset.surface.charAt(0).toUpperCase() + button.dataset.surface.slice(1)} (${count})`;
  }
}

function renderTaskboard(data) {
  const selectedTask = data.taskMap.get(state.selectedTaskId) || null;
  const createDisabled = !data.activeProject || state.loading || state.mutating;
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
            <p class="panel-copy">Lifecycle, flags, review state, and gate visibility by task.</p>
          </div>
          <p class="runtime-note">Planner write enabled</p>
        </div>
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
            <p class="form-help">
              ${
                data.activeProject
                  ? `Creates a task in ${escapeHtml(data.activeProject.name)}.`
                  : 'Active project required before creating tasks.'
              }
            </p>
          </div>
        </form>
        ${
          data.tasks.length > 0
            ? `<div class="lane-grid">${lanes}</div>`
            : `
              <div class="empty-state">
                <strong>No tasks yet</strong>
                <p>Create a task through the runtime flow before using the Taskboard.</p>
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
  const plannerDisabled = state.loading || state.mutating;

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
            <p class="detail-copy">No worktree-specific UI in slice 02.</p>
          </div>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">Planner Run</p>
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
          <p class="form-help">Starts a planner-only run and updates task, log, and artifact links immediately.</p>
        </div>
      </div>

      <div class="detail-block">
        <p class="detail-key">Review</p>
        <div class="pill-list">
          ${createToken(`required:${task.review?.required ? 'yes' : 'no'}`, task.review?.required ? 'warning' : 'neutral')}
          ${createToken(`status:${task.review?.status || 'pending'}`, getReviewTone(task.review?.status))}
          ${createToken(`verification:${task.review?.verificationArtifactIds?.length || 0}`, 'neutral')}
        </div>
        <p class="detail-copy">${escapeHtml(task.review?.resolution?.note || 'No review resolution note recorded.')}</p>
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
  const selectedRun = data.runMap.get(state.selectedRunId) || null;
  const selectedTask = selectedRun ? data.taskMap.get(selectedRun.taskId) : data.taskMap.get(state.selectedTaskId) || null;
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
            <p class="panel-copy">Run-level execution output with task and gate context.</p>
          </div>
        </div>
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
  const selectedArtifactMeta = data.artifactMap.get(state.selectedArtifactId) || null;
  const selectedArtifactTask = selectedArtifactMeta ? data.taskMap.get(selectedArtifactMeta.taskId) : null;
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
            <p class="panel-copy">Traceable outputs grouped by task and origin run.</p>
          </div>
        </div>
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
                  ${selectedArtifactTask ? createToken(selectedArtifactTask.lifecycleState, 'neutral') : ''}
                  ${selectedArtifactTask?.review ? createToken(`review:${selectedArtifactTask.review.status}`, getReviewTone(selectedArtifactTask.review.status)) : ''}
                </div>
                <p class="detail-copy">${escapeHtml(selectedArtifactTask?.title || 'Unknown task')}</p>
                <p class="detail-copy mono">${escapeHtml(selectedArtifactMeta.path)}</p>
              </div>
              <div class="detail-block">
                <p class="detail-key">Preview</p>
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
  const pendingItems = data.inboxItems.filter((item) => item.status === 'pending');
  const resolvedItems = data.inboxItems.filter((item) => item.status === 'resolved');
  const selectedItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const selectedTask = selectedItem ? data.taskMap.get(selectedItem.taskId) : null;
  const selectedApproval = selectedItem?.sourceId
    ? data.approvals.find((approval) => approval.id === selectedItem.sourceId) || null
    : null;

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
      ${renderInboxList(pendingItems, 'Pending Queue', 'Human-required gates still waiting on resolution.')}
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
              <div class="detail-block">
                <p class="detail-key">Resolution</p>
                <p class="detail-copy">${escapeHtml(selectedItem.resolution?.note || 'Still pending or no resolution note recorded.')}</p>
                <div class="token-row">
                  ${selectedItem.resolution?.action ? createToken(`action:${selectedItem.resolution.action}`, 'success') : ''}
                  ${createToken(`updated:${formatDate(selectedItem.updatedAt)}`, 'neutral')}
                </div>
              </div>
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

      await handleSelection(actionButton.dataset.action, actionButton.dataset.id);
    } catch (error) {
      elements.refreshStatus.textContent = error.message || 'Action failed';
      render();
    }
  }
});

document.addEventListener('input', (event) => {
  const createTaskForm = event.target.closest('[data-form="create-task"]');

  if (!createTaskForm) {
    return;
  }

  if (event.target.name === 'title') {
    state.taskDraftTitle = event.target.value;
  }

  if (event.target.name === 'intent') {
    state.taskDraftIntent = event.target.value;
  }
});

document.addEventListener('submit', async (event) => {
  const createTaskForm = event.target.closest('[data-form="create-task"]');

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
