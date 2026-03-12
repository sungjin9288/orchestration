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
  selectedTaskBreakdownArtifact: null,
  selectedTaskPreflightArtifact: null,
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
  return (
    state.payload || {
      derived: {
        taskGuardSummaries: {},
      },
      snapshot: {
        activeProjectId: null,
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
    derived: payload.derived || { taskGuardSummaries: {} },
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
        Runtime-derived summary for limited builder live mutation. Execution stays bounded to the latest preflight target files and never runs reviewer or commit paths.
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
    const selectedArtifact = data.artifactMap.get(state.selectedArtifactId) || null;
    const preferredTaskArtifact = getPreferredTaskArtifact(activeTask, data);

    if (!selectedArtifact || selectedArtifact.taskId !== activeTask.id) {
      state.selectedArtifactId = preferredTaskArtifact?.id || null;
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
    derived: payload.derived || { taskGuardSummaries: {} },
    generatedAt: payload.generatedAt,
    runtimeRoot: payload.runtimeRoot,
    snapshot: payload.snapshot,
  };
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

async function handleSurfaceChange(surface) {
  state.surface = surface;
  render();
}

async function handleSelection(action, id) {
  if (action === 'select-task') {
    syncSelectionsFromTask(id, {
      applyTaskInboxPreselect: true,
    });
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
    state.selectedTaskBreakdownArtifact = null;
    state.selectedTaskPreflightArtifact = null;
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
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `Architect run ${payload.mutation.runId} completed`;
  } finally {
    state.mutating = false;
    render();
  }
}

async function runTaskBreaker(taskId) {
  const data = getDerived();

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
    state.surface = 'artifacts';
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
    state.surface = 'artifacts';
    render();
    elements.refreshStatus.textContent = `Builder live mutation run ${payload.mutation.runId} completed`;
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
          <p class="runtime-note">Planner + architect + task-breaker + builder preflight + live mutation approval + limited live mutation write enabled</p>
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
                : `Task-Breaker reads ${escapeHtml(latestPlanArtifact.id)} and ${escapeHtml(latestArchitectureArtifact.id)}, writes a breakdown artifact, and only preselects a blocking Decision Inbox item without leaving Artifacts.`
            }
          </p>
          <p class="form-help">
            ${
              builderPreflightDisabled
                ? `Builder preflight stays disabled until ${escapeHtml(builderPreflightState.reasons.join('; '))}.`
                : `Builder preflight reads ${escapeHtml(builderPreflightState.latestPlanArtifact.id)}, ${escapeHtml(builderPreflightState.latestArchitectureArtifact.id)}, and ${escapeHtml(builderPreflightState.latestBreakdownArtifact.id)}, then writes a no-write preflight artifact without running reviewer live.`
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
          preselectedPendingItem
            ? `
              <div class="breakdown-inbox-hint">
                <div class="token-row">
                  ${createToken(`preselected inbox:${preselectedPendingItem.id}`, 'warning')}
                  ${createToken(preselectedPendingItem.kind, getInboxTone(preselectedPendingItem))}
                  ${preselectedPendingItem.blocksTask ? createToken('blocksTask', 'danger') : ''}
                  ${
                    preselectedApproval
                      ? createToken(
                          `scope:${preselectedApproval.scope}`,
                          'neutral',
                        )
                      : ''
                  }
                </div>
                <p class="detail-copy">${escapeHtml(preselectedPendingItem.title)}</p>
                <p class="detail-copy">${escapeHtml(preselectedPendingItem.prompt || 'No prompt recorded.')}</p>
                ${
                  preselectedPendingItem.kind === 'approval'
                    ? `
                      <div class="form-actions form-actions-inline">
                        <button
                          class="primary-button"
                          type="button"
                          data-action="run-inbox-action"
                          data-id="${escapeHtml(preselectedPendingItem.id)}"
                          data-verb="approve"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          Approve
                        </button>
                        <button
                          class="danger-button"
                          type="button"
                          data-action="run-inbox-action"
                          data-id="${escapeHtml(preselectedPendingItem.id)}"
                          data-verb="reject"
                          ${state.loading || state.mutating ? 'disabled' : ''}
                        >
                          Reject
                        </button>
                        <p class="form-help">Approval actions stay on the current surface and mirror the server snapshot as-is.</p>
                      </div>
                    `
                    : '<p class="form-help">Decision resolution remains in Decision Inbox for this slice.</p>'
                }
              </div>
            `
            : ''
        }
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
  const selectedInboxItem = data.inboxItemMap.get(state.selectedInboxItemId) || null;
  const parsedBreakdown =
    selectedArtifactMeta?.type === 'breakdown' && state.selectedArtifact?.content
      ? parseBreakdownArtifact(state.selectedArtifact.content)
      : null;
  const parsedPreflight =
    selectedArtifactMeta?.type === 'preflight' && state.selectedArtifact?.content
      ? parsePreflightArtifact(state.selectedArtifact.content)
      : null;
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
                ${
                  selectedArtifactMeta.type === 'breakdown' && parsedBreakdown
                    ? `
                      <p class="detail-copy">Best-effort structured view of the stored breakdown artifact. Raw markdown remains below.</p>
                      ${renderStructuredBreakdown(parsedBreakdown)}
                    `
                    : selectedArtifactMeta.type === 'breakdown'
                      ? '<p class="detail-copy">Structured parsing failed. Showing the stored raw markdown fallback.</p>'
                      : selectedArtifactMeta.type === 'preflight' && parsedPreflight
                        ? `
                          <p class="detail-copy">Best-effort structured view of the stored builder preflight artifact. Raw markdown remains below.</p>
                          ${renderStructuredPreflight(parsedPreflight)}
                        `
                        : selectedArtifactMeta.type === 'preflight'
                          ? '<p class="detail-copy">Structured parsing failed. Showing the stored raw markdown fallback.</p>'
                      : ''
                }
                ${
                  selectedArtifactMeta.type === 'preflight' && selectedArtifactTask
                    ? renderBuilderLiveMutationApprovalPanel(selectedArtifactTask, data)
                    : ''
                }
                ${
                  preselectedPendingItem
                    ? `
                      <div class="breakdown-inbox-hint">
                        <div class="token-row">
                          ${createToken(`preselected inbox:${preselectedPendingItem.id}`, 'warning')}
                          ${createToken(preselectedPendingItem.kind, getInboxTone(preselectedPendingItem))}
                          ${preselectedPendingItem.blocksTask ? createToken('blocksTask', 'danger') : ''}
                          ${
                            preselectedApproval
                              ? createToken(`scope:${preselectedApproval.scope}`, 'neutral')
                              : ''
                          }
                        </div>
                        <p class="detail-copy">${escapeHtml(preselectedPendingItem.title)}</p>
                        <p class="detail-copy">${escapeHtml(preselectedPendingItem.prompt || 'No prompt recorded.')}</p>
                        ${
                          preselectedPendingItem.kind === 'approval'
                            ? `
                              <div class="form-actions form-actions-inline">
                                <button
                                  class="primary-button"
                                  type="button"
                                  data-action="run-inbox-action"
                                  data-id="${escapeHtml(preselectedPendingItem.id)}"
                                  data-verb="approve"
                                  ${state.loading || state.mutating ? 'disabled' : ''}
                                >
                                  Approve
                                </button>
                                <button
                                  class="danger-button"
                                  type="button"
                                  data-action="run-inbox-action"
                                  data-id="${escapeHtml(preselectedPendingItem.id)}"
                                  data-verb="reject"
                                  ${state.loading || state.mutating ? 'disabled' : ''}
                                >
                                  Reject
                                </button>
                                <p class="form-help">Approval actions stay on Artifacts and mirror the server snapshot as-is.</p>
                              </div>
                            `
                            : '<p class="form-help">Decision resolution remains in Decision Inbox for this slice.</p>'
                        }
                      </div>
                    `
                    : ''
                }
                <p class="detail-key">${
                  selectedArtifactMeta.type === 'breakdown' || selectedArtifactMeta.type === 'preflight'
                    ? 'Raw Markdown'
                    : 'Raw Preview'
                }</p>
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
