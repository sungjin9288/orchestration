import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  createExecutionProvenanceView,
  getExecutionProvenanceStatusTone,
  renderExecutionProvenanceGraph,
} from '../ui/execution-provenance-graph.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-692');
const port = 9400 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-692-execution-provenance-graph-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const graph = {
  schemaVersion: 1,
  projectId: 'project-0001',
  missionId: 'mission-0001',
  taskId: 'task-0001',
  sourceDigest: 'a'.repeat(64),
  maxNodes: 250,
  truncated: false,
  counts: { availableNodes: 5, projectedNodes: 5, excludedNodes: 0, projectedEdges: 4 },
  nodes: [
    { id: 'project:project-0001', kind: 'project', lane: 'context', label: 'Project', status: 'active', sourceRefs: ['project-0001'], importance: 'root' },
    { id: 'task:task-0001', kind: 'task', lane: 'context', label: 'Task', status: 'In Progress', sourceRefs: ['task-0001'], importance: 'root' },
    { id: 'execution-plan:plan-0001', kind: 'execution-plan', lane: 'plan', label: 'ExecutionPlan', status: 'pending-approval', sourceRefs: ['plan-0001'], importance: 'major' },
    { id: 'approval:approval-0001', kind: 'approval', lane: 'verify', label: 'Builder approval', status: 'approved', sourceRefs: ['approval-0001'], importance: 'major' },
    { id: 'artifact-patch:artifact-0001', kind: 'artifact-patch', lane: 'build', label: 'Patch artifact', status: 'recorded', sourceRefs: ['artifact-0001'], importance: 'evidence' },
  ],
  edges: [
    { id: 'edge-1', kind: 'contains', from: 'project:project-0001', to: 'task:task-0001', sourceRefs: ['project-0001', 'task-0001'] },
    { id: 'edge-2', kind: 'planned-as', from: 'task:task-0001', to: 'execution-plan:plan-0001', sourceRefs: ['task-0001', 'plan-0001'] },
    { id: 'edge-3', kind: 'gated-by', from: 'execution-plan:plan-0001', to: 'approval:approval-0001', sourceRefs: ['plan-0001', 'approval-0001'] },
    { id: 'edge-4', kind: 'produced', from: 'task:task-0001', to: 'artifact-patch:artifact-0001', sourceRefs: ['task-0001', 'artifact-0001'] },
  ],
  authority: {
    readOnly: true,
    persistenceAllowed: false,
    mutationAllowed: false,
    blockedActions: ['approval', 'execution', 'resume', 'source-mutation', 'commit', 'push', 'release'],
  },
};

async function waitForServer(server, getOutput) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`ui-slice-692 server exited early\n${getOutput()}`.trim());
    }
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-692 server');
}

function seedRuntime() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-mission-task-close-out.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MISSION_CLOSE_OUT_KEEP_FIXTURE: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_SEED_ONLY: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed execution provenance fixture');
  }
  const result = JSON.parse(seeded.stdout);
  const runtime = createRuntimeService({ runtimeRoot: result.runtimeRoot });
  const state = runtime.getSnapshot();
  const plan = state.executionPlans[result.executionPlanId];
  const missionlessTask = runtime.createTask({
    projectId: plan.projectId,
    title: 'Missionless provenance boundary',
    intent: 'Prove exact null Mission lineage.',
  });
  return {
    ...result,
    taskId: plan.controlTaskId,
    missionlessTaskId: missionlessTask.id,
  };
}

async function readJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

async function main() {
  const seeded = seedRuntime();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', seeded.runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stdout = '';
  let stderr = '';
  server.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  server.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

  try {
    await waitForServer(server, () => `${stdout}${stderr}`);
    const [appResponse, rendererResponse, stylesResponse] = await Promise.all([
      fetch(`${baseUrl}/app.js`),
      fetch(`${baseUrl}/execution-provenance-graph.js`),
      fetch(`${baseUrl}/styles.css`),
    ]);
    assert.equal(appResponse.status, 200);
    assert.equal(rendererResponse.status, 200);
    assert.equal(stylesResponse.status, 200);
    const [appSource, rendererSource, stylesSource] = await Promise.all([
      appResponse.text(), rendererResponse.text(), stylesResponse.text(),
    ]);
    assert.match(appSource, /executionProvenanceOpen: false/);
    assert.match(appSource, /data-execution-provenance/);
    assert.match(appSource, /\/execution-provenance`/);
    assert.match(appSource, /executionProvenanceRequestId/);
    assert.match(appSource, /invalidateExecutionProvenance/);
    assert.match(
      appSource,
      /if \(refreshExecutionProvenance\)[\s\S]*void loadTaskExecutionProvenance/,
    );
    assert.match(appSource, /event\.key === 'Enter' \|\| event\.key === ' '/);
    assert.doesNotMatch(appSource, /data-action="(?:approve|execute|resume|mutate|commit|push|release)-execution-provenance/);
    assert.match(rendererSource, /EXECUTION_PROVENANCE_LANES/);
    assert.match(rendererSource, /execution-provenance-fallback/);
    assert.doesNotMatch(rendererSource, /fetch\(|localStorage|sessionStorage/);
    assert.match(stylesSource, /\.execution-provenance-disclosure/);
    assert.match(stylesSource, /\.execution-provenance-node:focus-visible circle/);
    assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.execution-provenance-viewport[\s\S]*display: none/);

    const graphPath = `/api/tasks/${encodeURIComponent(seeded.taskId)}/execution-provenance`;
    const first = await readJson(graphPath);
    const second = await readJson(graphPath);
    assert.equal(first.response.status, 200);
    assert.equal(second.response.status, 200);
    assert.equal(first.payload.executionProvenance.taskId, seeded.taskId);
    assert.equal(first.payload.executionProvenance.authority.readOnly, true);
    assert.equal(first.payload.executionProvenance.sourceDigest, second.payload.executionProvenance.sourceDigest);
    assert.ok(first.payload.executionProvenance.nodes.length > 10);
    assert.ok(
      first.payload.executionProvenance.nodes.some(
        (node) => node.id === `execution-plan:${seeded.executionPlanId}`,
      ),
    );
    assert.ok(
      first.payload.executionProvenance.nodes.some(
        (node) => node.kind === 'delivery-package',
      ),
    );
    const missing = await readJson('/api/tasks/task-missing/execution-provenance');
    assert.equal(missing.response.status, 404);
    const nonCanonical = await readJson(
      `/api/tasks/${encodeURIComponent(` ${seeded.taskId} `)}/execution-provenance`,
    );
    assert.equal(nonCanonical.response.status, 404);
    const wrongMethod = await readJson(graphPath, { method: 'POST' });
    assert.equal(wrongMethod.response.status, 405);
    assert.match(wrongMethod.payload.error, /GET/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const missionless = await readJson(
      `/api/tasks/${encodeURIComponent(seeded.missionlessTaskId)}/execution-provenance`,
    );
    assert.equal(missionless.response.status, 200);
    assert.equal(missionless.payload.executionProvenance.missionId, null);
    assert.equal(
      missionless.payload.executionProvenance.nodes.some(
        (node) => node.kind === 'execution-plan',
      ),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const graphBefore = JSON.stringify(graph);
    const defaultView = createExecutionProvenanceView(graph);
    assert.equal(defaultView.counts.visibleNodes, 5);
    assert.equal(defaultView.counts.visibleEdges, 4);
    assert.equal(createExecutionProvenanceView(graph, { query: 'APPROVAL' }).visibleNodes.length, 2);
    assert.deepEqual(
      createExecutionProvenanceView(graph, { lane: 'verify' }).visibleNodes.map((node) => node.id),
      ['approval:approval-0001'],
    );
    const selected = createExecutionProvenanceView(graph, { selectedNodeId: 'execution-plan:plan-0001' });
    assert.equal(selected.focusedNodeIds.size, 3);
    assert.equal(selected.relationships.length, 2);
    assert.equal(createExecutionProvenanceView(graph, { lane: 'close', selectedNodeId: 'task:task-0001' }).selectedNode, null);
    assert.equal(getExecutionProvenanceStatusTone('approved'), 'success');
    assert.equal(getExecutionProvenanceStatusTone('pending-approval'), 'warning');
    assert.equal(getExecutionProvenanceStatusTone('failed'), 'danger');

    const rendered = renderExecutionProvenanceGraph(graph, { selectedNodeId: 'execution-plan:plan-0001' });
    assert.match(rendered, /data-form="execution-provenance-explorer"/);
    assert.match(rendered, /data-action="select-execution-provenance-node"/);
    assert.match(rendered, /role="button"/);
    assert.match(rendered, /exact GET · state write 없음/);
    assert.doesNotMatch(rendered, /data-action="(?:approve|execute|resume|mutate|commit|push|release)-execution-provenance/);
    const escaped = renderExecutionProvenanceGraph({
      ...graph,
      counts: { ...graph.counts, projectedNodes: 1, projectedEdges: 0 },
      nodes: [{ ...graph.nodes[0], label: '<script>alert(1)</script>', sourceRefs: ['<img src=x>'] }],
      edges: [],
    });
    assert.equal(escaped.includes('<script>alert(1)</script>'), false);
    assert.match(escaped, /&lt;script&gt;/);
    assert.equal(JSON.stringify(graph), graphBefore);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        graphStatus: first.response.status,
        richLineage: true,
        missionlessLineageExcluded: true,
        missingStatus: missing.response.status,
        nonCanonicalStatus: nonCanonical.response.status,
        wrongMethodStatus: wrongMethod.response.status,
        stateBytesStable: true,
      },
      ui: {
        defaultClosed: true,
        sameTaskSnapshotRefresh: true,
        browserOnlyExplorer: true,
        semanticMobileFallback: true,
        directNeighborFocus: true,
        authorityActions: 0,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)]);
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
  if (stderr.trim()) process.stderr.write(stderr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
