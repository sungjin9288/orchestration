import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { renderMissionEvidenceGraph } from '../ui/mission-evidence-graph.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-672');
const port = 9200 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-672-mission-evidence-graph-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

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
  throw new Error('Timed out waiting for ui-slice-672 server');
}

function seedMissionGraph() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-mission-evidence-graph.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MISSION_GRAPH_KEEP_FIXTURE: '1',
        ORCHESTRATION_MISSION_GRAPH_TEMP_ROOT: tempRoot,
      },
    },
  );

  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed Mission evidence graph fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function readJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

async function main() {
  const seeded = seedMissionGraph();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', seeded.runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const [appResponse, rendererResponse, stylesResponse] = await Promise.all([
      fetch(`${baseUrl}/app.js`),
      fetch(`${baseUrl}/mission-evidence-graph.js`),
      fetch(`${baseUrl}/styles.css`),
    ]);
    assert.equal(appResponse.status, 200);
    assert.equal(rendererResponse.status, 200);
    assert.equal(stylesResponse.status, 200);
    const [appSource, rendererSource, stylesSource] = await Promise.all([
      appResponse.text(),
      rendererResponse.text(),
      stylesResponse.text(),
    ]);

    assert.match(appSource, /missionViewMode: 'thread'/);
    assert.match(appSource, /data-action="set-mission-view"/);
    assert.match(appSource, /data-view-mode="thread"/);
    assert.match(appSource, /data-view-mode="graph"/);
    assert.match(appSource, /renderMissionEvidenceGraph\(state\.missionEvidenceGraph/);
    assert.match(appSource, /\/evidence-graph`/);
    assert.doesNotMatch(
      appSource,
      /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
    );
    assert.match(rendererSource, /MISSION_GRAPH_STAGES/);
    assert.match(rendererSource, /role="button"/);
    assert.match(rendererSource, /aria-pressed=/);
    assert.match(rendererSource, /mission-evidence-graph-fallback/);
    assert.doesNotMatch(rendererSource, /fetch\(|localStorage|sessionStorage/);
    assert.doesNotMatch(
      rendererSource,
      /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
    );
    assert.match(stylesSource, /\.mission-view-selector/);
    assert.match(stylesSource, /\.mission-evidence-graph-viewport/);
    assert.match(stylesSource, /\.graph-node:focus-visible circle/);
    assert.match(
      stylesSource,
      /@media \(max-width: 520px\)[\s\S]*\.mission-evidence-graph-viewport,[\s\S]*display: none/,
    );

    const graphPath = `/api/missions/${encodeURIComponent(seeded.missionId)}/evidence-graph`;
    const first = await readJson(graphPath);
    const second = await readJson(graphPath);
    assert.equal(first.response.status, 200);
    assert.equal(second.response.status, 200);
    const graph = first.payload.missionEvidenceGraph;
    assert.equal(graph.schemaVersion, 1);
    assert.equal(graph.missionId, seeded.missionId);
    assert.equal(graph.maxNodes, 250);
    assert.ok(graph.nodes.length <= 250);
    assert.equal(graph.authority.readOnly, true);
    assert.equal(graph.authority.persistenceAllowed, false);
    assert.equal(graph.authority.mutationAllowed, false);
    assert.equal(graph.sourceDigest, second.payload.missionEvidenceGraph.sourceDigest);
    assert.deepEqual(graph.nodes, second.payload.missionEvidenceGraph.nodes);
    assert.deepEqual(graph.edges, second.payload.missionEvidenceGraph.edges);
    assert.equal(Object.prototype.hasOwnProperty.call(first.payload, 'runtimeRoot'), false);
    assert.equal(JSON.stringify(graph).includes('SENSITIVE_GOAL_BODY'), false);
    assert.equal(JSON.stringify(graph).includes('SENSITIVE_CONSTRAINT_BODY'), false);

    const missing = await readJson('/api/missions/mission-missing/evidence-graph');
    assert.equal(missing.response.status, 404);
    const wrongMethod = await readJson(graphPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mutate' }),
    });
    assert.equal(wrongMethod.response.status, 405);
    assert.match(wrongMethod.payload.error, /GET/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const rendered = renderMissionEvidenceGraph(graph);
    assert.match(rendered, /<svg/);
    assert.match(rendered, /role="group"/);
    assert.match(rendered, /role="button"/);
    assert.match(rendered, /Read-only projection/);
    assert.match(rendered, /exact GET · state write 없음/);
    assert.match(rendered, /data-action="select-mission-graph-node"/);
    assert.doesNotMatch(
      rendered,
      /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
    );
    const escaped = renderMissionEvidenceGraph({
      ...graph,
      counts: { ...graph.counts, projectedNodes: 1, projectedEdges: 0 },
      nodes: [{ ...graph.nodes[0], label: '<script>alert(1)</script>' }],
      edges: [],
    });
    assert.equal(escaped.includes('<script>alert(1)</script>'), false);
    assert.match(escaped, /&lt;script&gt;/);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        graphStatus: first.response.status,
        missingStatus: missing.response.status,
        wrongMethodStatus: wrongMethod.response.status,
        stateBytesStable: true,
      },
      ui: {
        defaultView: 'thread',
        selectableView: 'graph',
        semanticFallback: true,
        browserOnlyExplorerActions: true,
        authorityActions: 0,
        responsiveBreakpoint: 520,
      },
      graph: {
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        maxNodes: graph.maxNodes,
        readOnly: graph.authority.readOnly,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2_000),
    ]);
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }

  if (stderr.trim()) process.stderr.write(stderr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
