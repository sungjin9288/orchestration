import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import {
  getMissionWorkOrderPreviewSummary,
  parseMissionWorkOrderCompileList,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-653');
const port = 5700 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-653-mission-workorder-compiler-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: ['src/runtime/example.js', 'scripts/smoke-example.mjs'],
  expectedArtifacts: ['focused smoke evidence'],
  verificationCommands: ['node scripts/smoke-example.mjs'],
  stopConditions: ['Source digest becomes stale'],
};

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'ui-slice-653-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const payload = await response.json();
  return { response, payload };
}

function postJson(pathname, body = {}) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-653 server');
}

function countRecords(snapshot, key) {
  return Object.keys(snapshot[key] || {}).length;
}

async function main() {
  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });

  const resolvedRuntime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
  });
  resolvedRuntime.resetRuntime();
  const project = resolvedRuntime.createProject({
    name: 'ui-slice-653',
    projectPath: repoRoot,
  });
  const resolvedMission = resolvedRuntime.createMission({
    projectId: project.id,
    title: 'Inert WorkOrder preview',
    goal: 'Approve one response-only WorkOrder preview without downstream records.',
    constraints: 'Keep the response-only preview and the default auto-chain compatibility path.',
  });
  const resolvedStart = resolvedRuntime.startRealCouncilForMission({
    missionId: resolvedMission.id,
    mode: 'real-local-stub',
  });

  const defaultRuntime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  const compatibilityMission = defaultRuntime.createMission({
    projectId: project.id,
    title: 'Default linked-task compatibility',
    goal: 'Preserve the existing Real Council approval auto-chain.',
    constraints: 'Do not send an inert preview handoff mode.',
  });
  const compatibilityStart = defaultRuntime.startRealCouncilForMission({
    missionId: compatibilityMission.id,
    mode: 'real-local-stub',
  });

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const appSource = await (await fetch(`${baseUrl}/app.js`)).text();
    const signalSource = await (await fetch(`${baseUrl}/council-signals.js`)).text();
    const stylesSource = await (await fetch(`${baseUrl}/styles.css`)).text();
    const serverSource = fs.readFileSync(
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      'utf8',
    );

    assert.match(appSource, /WorkOrder compile spec/);
    assert.match(appSource, /approve-real-council-session-inert-preview/);
    assert.match(appSource, /recompute-mission-workorder-preview/);
    assert.match(appSource, /response-only/);
    assert.match(appSource, /authority closed/);
    assert.match(appSource, /미해결 질문을 정리한 새 Council synthesis가 필요합니다/);
    assert.doesNotMatch(appSource, /execute-mission-workorder/);
    assert.doesNotMatch(appSource, /approve-mission-workorder/);
    assert.match(signalSource, /parseMissionWorkOrderCompileList/);
    assert.match(signalSource, /getMissionWorkOrderPreviewSummary/);
    assert.match(stylesSource, /\.mission-workorder-compile-grid/);
    assert.match(stylesSource, /@media \(max-width: 720px\)[\s\S]*\.mission-workorder-compile-grid/);
    assert.match(serverSource, /handoffMode === 'inert-workorder-preview'/);
    assert.match(serverSource, /preflightMissionWorkOrderPreview/);
    assert.match(serverSource, /work-order-preview/);

    assert.deepEqual(parseMissionWorkOrderCompileList('a\na\n b \n'), ['a', 'b']);

    const beforeInvalid = await fetchJson('/api/snapshot');
    const invalid = await postJson(
      `/api/council-sessions/${encodeURIComponent(resolvedStart.councilSession.id)}/decision`,
      {
        action: 'approve',
        handoffMode: 'inert-workorder-preview',
        compileSpec: { ...compileSpec, targetPathAllowlist: [] },
      },
    );
    assert.equal(invalid.response.status, 400);
    assert.match(invalid.payload.error, /non-empty array/);

    const afterInvalid = await fetchJson('/api/snapshot');
    const invalidSession = afterInvalid.payload.snapshot.councilSessions[resolvedStart.councilSession.id];
    assert.equal(invalidSession.phase, 'awaiting-alignment');
    assert.equal(invalidSession.alignment.status, 'pending');
    for (const key of ['tasks', 'runs', 'artifacts', 'approvals']) {
      assert.equal(
        countRecords(afterInvalid.payload.snapshot, key),
        countRecords(beforeInvalid.payload.snapshot, key),
      );
    }

    const approved = await postJson(
      `/api/council-sessions/${encodeURIComponent(resolvedStart.councilSession.id)}/decision`,
      {
        action: 'approve',
        handoffMode: 'inert-workorder-preview',
        compileSpec,
      },
    );
    assert.equal(approved.response.status, 200);
    assert.equal(approved.payload.councilSession.status, 'approved');
    assert.equal(approved.payload.mission.linkedTaskId, null);
    assert.equal(approved.payload.mutation.handoffMode, 'inert-workorder-preview');
    assert.equal(approved.payload.mutation.persistedPreview, false);
    assert.equal(approved.payload.mutation.taskId, null);
    const preview = approved.payload.missionWorkOrderPreview;
    const summary = getMissionWorkOrderPreviewSummary(
      preview,
      resolvedStart.councilSession.id,
    );
    assert.equal(summary.workOrderCount, 3);
    assert.equal(summary.handoffCount, 3);
    assert.equal(summary.authorityClosed, true);

    for (const key of ['tasks', 'runs', 'artifacts', 'approvals']) {
      assert.equal(countRecords(approved.payload.snapshot, key), 0);
    }
    for (const emptyKey of ['executionPlans', 'workOrders', 'handoffPackets']) {
      assert.equal(countRecords(approved.payload.snapshot, emptyKey), 0);
    }

    const recomputed = await postJson(
      `/api/council-sessions/${encodeURIComponent(resolvedStart.councilSession.id)}/work-order-preview`,
      { compileSpec },
    );
    assert.equal(recomputed.response.status, 200);
    assert.deepEqual(recomputed.payload.missionWorkOrderPreview, preview);
    assert.equal(recomputed.payload.mutation.persistedPreview, false);

    const compatibility = await postJson(
      `/api/council-sessions/${encodeURIComponent(compatibilityStart.councilSession.id)}/decision`,
      { action: 'approve' },
    );
    assert.equal(compatibility.response.status, 200);
    assert.equal(compatibility.payload.councilSession.status, 'approved');
    assert.ok(compatibility.payload.task?.id);
    assert.equal(compatibility.payload.mutation.autoChain.linkedTaskCreated, true);
    assert.equal(compatibility.payload.mission.linkedTaskId, compatibility.payload.task.id);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      ui: {
        explicitInertPreviewSelection: true,
        responseOnlyEvidence: true,
        downstreamControlsBlocked: true,
        responsiveCompileGrid: true,
      },
      api: {
        preflightBeforeApproval: true,
        invalidInputStatus: 400,
        deterministicRecompute: true,
        persistedPreview: false,
        defaultLinkedTaskAutoChainPreserved: true,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000).then(() => server.kill('SIGKILL')),
    ]);
    fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  }

  if (stderr.trim()) {
    throw new Error(stderr.trim());
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
