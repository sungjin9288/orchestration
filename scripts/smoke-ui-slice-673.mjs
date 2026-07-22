import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  createMissionGraphExplorerView,
  getMissionGraphStatusTone,
  renderMissionEvidenceGraph,
} from '../ui/mission-evidence-graph.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-673-mission-evidence-graph-exploration-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const graph = {
  schemaVersion: 1,
  projectId: 'project-0001',
  missionId: 'mission-0001',
  generatedAt: '2026-07-22T00:00:00.000Z',
  sourceDigest: 'a'.repeat(64),
  maxNodes: 250,
  truncated: false,
  counts: {
    availableNodes: 5,
    projectedNodes: 5,
    excludedNodes: 0,
    projectedEdges: 4,
  },
  nodes: [
    {
      id: 'mission:mission-0001',
      kind: 'mission',
      stage: 'mission',
      label: 'Release readiness',
      status: 'executing',
      sourceRef: 'mission-0001',
      importance: 'root',
      createdAt: '2026-07-22T00:00:00.000Z',
    },
    {
      id: 'council-session:council-0001',
      kind: 'council-session',
      stage: 'council',
      label: 'Council local stub',
      status: 'approved',
      sourceRef: 'council-0001',
      importance: 'major',
      createdAt: '2026-07-22T00:01:00.000Z',
    },
    {
      id: 'execution-plan:plan-0001',
      kind: 'execution-plan',
      stage: 'execution',
      label: 'ExecutionPlan',
      status: 'pending-approval',
      sourceRef: 'plan-0001',
      importance: 'major',
      createdAt: '2026-07-22T00:02:00.000Z',
    },
    {
      id: 'approval:approval-0001',
      kind: 'approval',
      stage: 'verification',
      label: 'Builder approval',
      status: 'pending',
      sourceRef: 'approval-0001',
      importance: 'major',
      createdAt: '2026-07-22T00:03:00.000Z',
    },
    {
      id: 'artifact:artifact-0001',
      kind: 'artifact',
      stage: 'verification',
      label: 'QA evidence',
      status: 'failed',
      sourceRef: 'artifact-0001',
      importance: 'evidence',
      createdAt: '2026-07-22T00:04:00.000Z',
    },
  ],
  edges: [
    {
      id: 'edge-0001',
      kind: 'contains',
      from: 'mission:mission-0001',
      to: 'council-session:council-0001',
      sourceRefs: ['mission-0001', 'council-0001'],
    },
    {
      id: 'edge-0002',
      kind: 'derived-from',
      from: 'council-session:council-0001',
      to: 'execution-plan:plan-0001',
      sourceRefs: ['council-0001', 'plan-0001'],
    },
    {
      id: 'edge-0003',
      kind: 'gated-by',
      from: 'execution-plan:plan-0001',
      to: 'approval:approval-0001',
      sourceRefs: ['plan-0001', 'approval-0001'],
    },
    {
      id: 'edge-0004',
      kind: 'produced',
      from: 'execution-plan:plan-0001',
      to: 'artifact:artifact-0001',
      sourceRefs: ['plan-0001', 'artifact-0001'],
    },
  ],
  authority: {
    readOnly: true,
    persistenceAllowed: false,
    mutationAllowed: false,
    blockedActions: ['approval', 'execution', 'resume', 'source-mutation', 'commit', 'push', 'release'],
  },
};

const graphBefore = JSON.stringify(graph);
const defaultView = createMissionGraphExplorerView(graph);
assert.equal(defaultView.counts.visibleNodes, 5);
assert.equal(defaultView.counts.visibleEdges, 4);
assert.deepEqual(defaultView.visibleNodes, graph.nodes);
assert.deepEqual(defaultView.visibleEdges, graph.edges);

const queryCases = [
  ['release READINESS', 'mission:mission-0001'],
  ['COUNCIL-SESSION', 'council-session:council-0001'],
  ['PENDING-APPROVAL', 'execution-plan:plan-0001'],
  ['verification', 'approval:approval-0001'],
  ['ARTIFACT-0001', 'artifact:artifact-0001'],
];
for (const [query, expectedNodeId] of queryCases) {
  const view = createMissionGraphExplorerView(graph, { query });
  assert.ok(view.visibleNodes.some((node) => node.id === expectedNodeId));
}

const stageView = createMissionGraphExplorerView(graph, { stage: 'verification' });
assert.deepEqual(stageView.visibleNodes.map((node) => node.id), [
  'approval:approval-0001',
  'artifact:artifact-0001',
]);
assert.equal(stageView.visibleEdges.length, 0);

const warningView = createMissionGraphExplorerView(graph, { statusTone: 'warning' });
assert.deepEqual(warningView.visibleNodes.map((node) => node.id), [
  'execution-plan:plan-0001',
  'approval:approval-0001',
]);
assert.equal(warningView.visibleEdges.length, 1);
assert.equal(getMissionGraphStatusTone('failed'), 'danger');
assert.equal(getMissionGraphStatusTone('approved'), 'success');

const composedView = createMissionGraphExplorerView(graph, {
  query: 'approval',
  stage: 'verification',
  statusTone: 'warning',
});
assert.deepEqual(composedView.visibleNodes.map((node) => node.id), ['approval:approval-0001']);

const focusedView = createMissionGraphExplorerView(graph, {
  selectedNodeId: 'execution-plan:plan-0001',
});
assert.equal(focusedView.selectedNode.id, 'execution-plan:plan-0001');
assert.deepEqual([...focusedView.focusedNodeIds].sort(), [
  'approval:approval-0001',
  'artifact:artifact-0001',
  'council-session:council-0001',
  'execution-plan:plan-0001',
].sort());
assert.deepEqual(
  focusedView.selectedRelationships.map((relationship) => relationship.kind),
  ['derived-from', 'gated-by', 'produced'],
);
assert.deepEqual(focusedView.selectedRelationships[0].sourceRefs, ['council-0001', 'plan-0001']);

const staleSelectionView = createMissionGraphExplorerView(graph, {
  stage: 'mission',
  selectedNodeId: 'execution-plan:plan-0001',
});
assert.equal(staleSelectionView.selectedNode, null);
assert.equal(staleSelectionView.explorer.selectedNodeId, null);
assert.equal(staleSelectionView.focusedNodeIds.size, 0);

const rendered = renderMissionEvidenceGraph(graph, {
  selectedNodeId: 'execution-plan:plan-0001',
});
assert.match(rendered, /data-form="mission-graph-explorer"/);
assert.match(rendered, /name="missionGraphQuery"/);
assert.match(rendered, /name="missionGraphStage"/);
assert.match(rendered, /name="missionGraphStatusTone"/);
assert.match(rendered, /data-action="select-mission-graph-node"/);
assert.match(rendered, /role="button"/);
assert.match(rendered, /aria-pressed="true"/);
assert.match(rendered, /mission-graph-detail/);
assert.match(rendered, /Incoming · derived-from/);
assert.match(rendered, /Outgoing · gated-by/);
assert.match(rendered, /plan-0001 · approval-0001/);
assert.match(rendered, /exact GET · state write 없음/);
assert.doesNotMatch(
  rendered,
  /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
);

const escaped = renderMissionEvidenceGraph({
  ...graph,
  nodes: [{
    ...graph.nodes[0],
    label: '<script>alert(1)</script>',
    sourceRef: '<img src=x onerror=alert(1)>',
  }],
  edges: [],
  counts: { ...graph.counts, projectedNodes: 1, projectedEdges: 0 },
}, { selectedNodeId: 'mission:mission-0001' });
assert.equal(escaped.includes('<script>alert(1)</script>'), false);
assert.equal(escaped.includes('<img src=x onerror=alert(1)>'), false);
assert.match(escaped, /&lt;script&gt;/);
assert.match(escaped, /&lt;img/);

const appSource = fs.readFileSync(new URL('../ui/app.js', import.meta.url), 'utf8');
const rendererSource = fs.readFileSync(
  new URL('../ui/mission-evidence-graph.js', import.meta.url),
  'utf8',
);
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
assert.match(appSource, /missionGraphQuery: ''/);
assert.match(appSource, /resetMissionGraphExplorer\(\)/);
assert.match(appSource, /selectMissionGraphNode/);
assert.match(appSource, /data-form="mission-graph-explorer"/);
assert.match(appSource, /event\.key === 'Enter' \|\| event\.key === ' '/);
assert.doesNotMatch(rendererSource, /fetch\(|localStorage|sessionStorage/);
assert.doesNotMatch(
  rendererSource,
  /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
);
assert.match(stylesSource, /\.graph-node\.is-dimmed/);
assert.match(stylesSource, /\.mission-graph-detail/);
assert.match(stylesSource, /\.mission-graph-explorer/);
assert.equal(JSON.stringify(graph), graphBefore);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  source: {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    unchanged: true,
  },
  exploration: {
    queryFields: 5,
    lifecycleFilter: true,
    statusFilter: true,
    directNeighborFocus: true,
    staleSelectionCleared: true,
    readOnlyDetail: true,
  },
  authority: {
    runtimeWrites: 0,
    persistence: false,
    authorityActions: 0,
  },
}, null, 2)}\n`);
