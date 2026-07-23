import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-687-unchanged-snapshot-noop-refresh-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');

function getFunctionSource(name) {
  const start = appSource.indexOf(`function ${name}(`);
  const end = appSource.indexOf('\nfunction ', start + 1);

  assert.notEqual(start, -1, `Missing function ${name}`);
  return appSource.slice(start, end === -1 ? appSource.length : end);
}

const stableContentSource = getFunctionSource('getStableSnapshotContent');
const unchangedContentSource = getFunctionSource('hasUnchangedSnapshotContent');
const selectedRunLogGateSource = getFunctionSource('shouldPollSelectedRunLogs');
const selectedRunLogRefreshSource = getFunctionSource(
  'refreshSelectedRunLogsForUnchangedSnapshot',
);
const refreshSource = getFunctionSource('refreshData');
const bootstrapSource = getFunctionSource('bootstrap');
const manualRefreshStart = appSource.indexOf("elements.refreshButton.addEventListener('click'");
const manualRefreshSource = appSource.slice(
  manualRefreshStart,
  appSource.indexOf('\nfunction registerQaHooks', manualRefreshStart),
);
const qaRefreshStart = appSource.indexOf('async refresh() {');
const qaRefreshSource = appSource.slice(qaRefreshStart, appSource.indexOf('\n    },', qaRefreshStart));
const { hasUnchangedSnapshotContent } = new Function(
  'createEmptyDerivedState',
  `${stableContentSource}\n${unchangedContentSource}\nreturn { hasUnchangedSnapshotContent };`,
)(() => ({}));
const { shouldPollSelectedRunLogs } = new Function(
  `${selectedRunLogGateSource}\nreturn { shouldPollSelectedRunLogs };`,
)();

const currentPayload = {
  snapshot: { activeProjectId: 'project-001', projects: { 'project-001': { id: 'project-001' } } },
  derived: { taskGuardSummaries: { 'task-001': { state: 'ready' } } },
  runtimeRoot: '/tmp/orchestration-runtime',
  generatedAt: '2026-07-23T00:00:00.000Z',
};

assert.match(stableContentSource, /snapshot:\s*payload\.snapshot/);
assert.match(stableContentSource, /derived:\s*payload\.derived \|\| createEmptyDerivedState\(\)/);
assert.match(stableContentSource, /runtimeRoot:\s*payload\.runtimeRoot/);
assert.doesNotMatch(stableContentSource, /generatedAt/);

assert.match(unchangedContentSource, /if \(!previousPayload\)/);
assert.match(unchangedContentSource, /return false/);
assert.match(
  unchangedContentSource,
  /getStableSnapshotContent\(previousPayload\) === getStableSnapshotContent\(nextPayload\)/,
);
assert.equal(
  hasUnchangedSnapshotContent(currentPayload, {
    ...currentPayload,
    generatedAt: '2026-07-23T00:00:05.000Z',
  }),
  true,
);
assert.equal(
  hasUnchangedSnapshotContent(currentPayload, {
    ...currentPayload,
    snapshot: { activeProjectId: 'project-002' },
  }),
  false,
);
assert.equal(
  hasUnchangedSnapshotContent(currentPayload, {
    ...currentPayload,
    derived: { taskGuardSummaries: {} },
  }),
  false,
);
assert.equal(
  hasUnchangedSnapshotContent(currentPayload, {
    ...currentPayload,
    runtimeRoot: '/tmp/another-runtime',
  }),
  false,
);
assert.equal(hasUnchangedSnapshotContent(null, currentPayload), false);
assert.equal(
  hasUnchangedSnapshotContent(currentPayload, {
    ...currentPayload,
    snapshot: {
      projects: { 'project-001': { id: 'project-001' } },
      activeProjectId: 'project-001',
    },
  }),
  false,
);

const runningRunPayload = {
  snapshot: {
    runs: {
      'run-001': { id: 'run-001', status: 'running' },
      'run-002': { id: 'run-002', status: 'completed' },
    },
  },
};

assert.equal(shouldPollSelectedRunLogs(runningRunPayload, 'logs', 'run-001'), true);
assert.equal(shouldPollSelectedRunLogs(runningRunPayload, 'logs', 'run-002'), true);
assert.equal(shouldPollSelectedRunLogs(runningRunPayload, 'mission', 'run-001'), false);
assert.equal(shouldPollSelectedRunLogs(runningRunPayload, 'logs', null), false);
assert.match(selectedRunLogRefreshSource, /fetchJson\(/);
assert.match(
  selectedRunLogRefreshSource,
  /\/api\/runs\/\$\{encodeURIComponent\(selectedRunId\)\}\/logs/,
);
assert.match(selectedRunLogRefreshSource, /const selectedRunId = state\.selectedRunId/);
assert.match(
  selectedRunLogRefreshSource,
  /state\.surface !== 'logs' \|\| state\.selectedRunId !== selectedRunId/,
);
assert.match(selectedRunLogRefreshSource, /JSON\.stringify\(state\.selectedRunLogs\)/);
assert.match(selectedRunLogRefreshSource, /state\.selectedRunLogs = nextRunLogs/);
assert.match(selectedRunLogRefreshSource, /catch \{/);
assert.match(
  selectedRunLogRefreshSource,
  /failed: state\.surface === 'logs' && state\.selectedRunId === selectedRunId/,
);

function createSelectedRunLogRefreshHarness(state, fetchJson) {
  return new Function(
    'state',
    'fetchJson',
    'shouldPollSelectedRunLogs',
    `async ${selectedRunLogRefreshSource}\nreturn refreshSelectedRunLogsForUnchangedSnapshot;`,
  )(state, fetchJson, shouldPollSelectedRunLogs);
}

const currentLogState = {
  surface: 'logs',
  selectedRunId: 'run-001',
  selectedRunLogs: { logs: [{ message: 'before' }] },
};
const refreshCurrentLogs = createSelectedRunLogRefreshHarness(
  currentLogState,
  async () => ({ logs: [{ message: 'after' }] }),
);
assert.deepEqual(await refreshCurrentLogs(runningRunPayload), {
  changed: true,
  failed: false,
});
assert.deepEqual(currentLogState.selectedRunLogs, { logs: [{ message: 'after' }] });

let resolveStaleLogRequest;
const staleLogState = {
  surface: 'logs',
  selectedRunId: 'run-001',
  selectedRunLogs: { logs: [{ message: 'run-001' }] },
};
const refreshStaleLogs = createSelectedRunLogRefreshHarness(
  staleLogState,
  () => new Promise((resolve) => {
    resolveStaleLogRequest = resolve;
  }),
);
const staleLogRefresh = refreshStaleLogs(runningRunPayload);
staleLogState.selectedRunId = 'run-002';
resolveStaleLogRequest({ logs: [{ message: 'stale-response' }] });
assert.deepEqual(await staleLogRefresh, { changed: false, failed: false });
assert.deepEqual(staleLogState.selectedRunLogs, { logs: [{ message: 'run-001' }] });

let rejectStaleLogRequest;
const staleFailedLogState = {
  surface: 'logs',
  selectedRunId: 'run-001',
  selectedRunLogs: { logs: [{ message: 'run-001' }] },
};
const refreshStaleFailedLogs = createSelectedRunLogRefreshHarness(
  staleFailedLogState,
  () => new Promise((_resolve, reject) => {
    rejectStaleLogRequest = reject;
  }),
);
const staleFailedLogRefresh = refreshStaleFailedLogs(runningRunPayload);
staleFailedLogState.selectedRunId = 'run-002';
rejectStaleLogRequest(new Error('synthetic stale selected-log failure'));
assert.deepEqual(await staleFailedLogRefresh, { changed: false, failed: false });
assert.deepEqual(staleFailedLogState.selectedRunLogs, { logs: [{ message: 'run-001' }] });

const failedLogState = {
  surface: 'logs',
  selectedRunId: 'run-001',
  selectedRunLogs: { logs: [] },
};
const refreshFailedLogs = createSelectedRunLogRefreshHarness(
  failedLogState,
  async () => {
    throw new Error('synthetic selected-log failure');
  },
);
assert.deepEqual(await refreshFailedLogs(runningRunPayload), {
  changed: false,
  failed: true,
});

function createRefreshDataHarness(selectedLogRefresh) {
  const state = {
    error: null,
    loading: false,
    mutating: false,
    payload: structuredClone(currentPayload),
  };
  const elements = { refreshStatus: { textContent: '' } };
  const dom = {
    logs: { innerHTML: 'logs-before' },
    workspace: { innerHTML: 'workspace-before' },
  };
  const calls = {
    applySnapshotPayload: 0,
    ensureSelection: 0,
    hydrateSelectedDetails: 0,
    render: 0,
    renderLogs: 0,
  };
  const refreshData = new Function(
    'state',
    'elements',
    'captureMissionComposerFocus',
    'fetchJson',
    'hasUnchangedSnapshotContent',
    'refreshSelectedRunLogsForUnchangedSnapshot',
    'formatDate',
    'applySnapshotPayload',
    'getDerived',
    'ensureSelection',
    'hydrateSelectedDetails',
    'render',
    'restoreMissionComposerFocus',
    'renderLogs',
    `async ${refreshSource}\nreturn refreshData;`,
  )(
    state,
    elements,
    () => null,
    async () => ({
      ...currentPayload,
      generatedAt: '2026-07-23T00:00:05.000Z',
    }),
    hasUnchangedSnapshotContent,
    async () => selectedLogRefresh,
    (value) => value,
    () => {
      calls.applySnapshotPayload += 1;
    },
    () => ({}),
    () => {
      calls.ensureSelection += 1;
    },
    async () => {
      calls.hydrateSelectedDetails += 1;
    },
    () => {
      calls.render += 1;
      dom.workspace.innerHTML = 'workspace-after-full-render';
    },
    () => {},
    () => {
      calls.renderLogs += 1;
      dom.logs.innerHTML = 'logs-after';
    },
  );

  return { calls, dom, elements, refreshData, state };
}

const changedLogHarness = createRefreshDataHarness({ changed: true, failed: false });
await changedLogHarness.refreshData({ skipUnchanged: true });
assert.equal(changedLogHarness.dom.workspace.innerHTML, 'workspace-before');
assert.equal(changedLogHarness.dom.logs.innerHTML, 'logs-after');
assert.deepEqual(changedLogHarness.calls, {
  applySnapshotPayload: 0,
  ensureSelection: 0,
  hydrateSelectedDetails: 0,
  render: 0,
  renderLogs: 1,
});
assert.match(changedLogHarness.elements.refreshStatus.textContent, /최근 갱신/);

const failedLogHarness = createRefreshDataHarness({ changed: false, failed: true });
await failedLogHarness.refreshData({ skipUnchanged: true });
assert.equal(failedLogHarness.dom.workspace.innerHTML, 'workspace-before');
assert.equal(failedLogHarness.dom.logs.innerHTML, 'logs-before');
assert.deepEqual(failedLogHarness.calls, {
  applySnapshotPayload: 0,
  ensureSelection: 0,
  hydrateSelectedDetails: 0,
  render: 0,
  renderLogs: 0,
});
assert.match(failedLogHarness.elements.refreshStatus.textContent, /선택 로그 갱신 실패/);

assert.match(refreshSource, /function refreshData\(\{ skipUnchanged = false \} = \{\}\)/);
assert.match(refreshSource, /const payload = await fetchJson\('\/api\/snapshot'\)/);
assert.match(
  refreshSource,
  /skipUnchanged &&\s*!state\.error &&\s*hasUnchangedSnapshotContent\(state\.payload, payload\)/,
);
assert.match(refreshSource, /state\.payload\.generatedAt = payload\.generatedAt/);
assert.match(
  refreshSource,
  /const selectedLogRefresh = await refreshSelectedRunLogsForUnchangedSnapshot\(payload\)/,
);
assert.match(refreshSource, /refreshRenderTarget = selectedLogRefresh\.changed \? 'logs' : 'none'/);
assert.match(refreshSource, /selectedLogRefresh\.failed[\s\S]*선택 로그 갱신 실패/);
assert.match(refreshSource, /if \(refreshRenderTarget === 'full'\) \{[\s\S]*render\(\)/);
assert.match(refreshSource, /else if \(refreshRenderTarget === 'logs'\) \{[\s\S]*renderLogs\(getDerived\(\)\)/);
assert.match(refreshSource, /const missionComposerFocus = captureMissionComposerFocus\(\)/);
assert.match(refreshSource, /applySnapshotPayload\(payload\)/);
assert.match(refreshSource, /ensureSelection\(data\)/);
assert.match(refreshSource, /await hydrateSelectedDetails\(\)/);

const unchangedBranch = refreshSource.slice(
  refreshSource.indexOf('if (\n      skipUnchanged'),
  refreshSource.indexOf('state.error = null'),
);

for (const fullRefreshOperation of [
  'applySnapshotPayload',
  'ensureSelection',
  'hydrateSelectedDetails',
  'render(',
]) {
  assert.doesNotMatch(unchangedBranch, new RegExp(fullRefreshOperation.replace('(', '\\(')));
}

assert.match(bootstrapSource, /await refreshData\(\)/);
assert.match(bootstrapSource, /window\.setInterval\(\(\) => refreshData\(\{ skipUnchanged: true \}\), 5000\)/);
assert.match(manualRefreshSource, /await refreshData\(\)/);
assert.doesNotMatch(manualRefreshSource, /skipUnchanged/);
assert.match(qaRefreshSource, /await refreshData\(\)/);
assert.doesNotMatch(qaRefreshSource, /skipUnchanged/);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  timerRefresh: {
    stableFields: ['snapshot', 'derived', 'runtimeRoot'],
    ignoredFields: ['generatedAt'],
    keyOrderDifference: 'safe-full-refresh',
    firstRefreshSkips: false,
    unchangedSkips: ['applySnapshotPayload', 'ensureSelection', 'hydrateSelectedDetails'],
    renderPolicy: 'visible-selected-log-surface-only-when-content-changes',
    staleLogResponse: 'discarded-after-selection-change',
    staleLogFailure: 'discarded-after-selection-change',
    selectedLogFailure: 'status-only-and-retry',
    changedRefresh: 'existing-full-path',
  },
  compatibility: {
    bootstrap: 'forced-full-refresh',
    manualRefresh: 'forced-full-refresh',
    qaRefresh: 'forced-full-refresh',
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    routeChanges: 0,
  },
}, null, 2)}\n`);
