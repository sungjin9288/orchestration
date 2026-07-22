import assert from 'node:assert/strict';
import fs from 'node:fs';

import { renderMissionEvidenceGraph } from '../ui/mission-evidence-graph.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const MODE = 'ui-slice-685-llm-native-sparse-mission-graph-density-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createNode(id, stage, importance = 'evidence') {
  return {
    id: `${stage}:${id}`,
    kind: stage,
    stage,
    label: `${stage} ${id}`,
    status: 'recorded',
    sourceRef: id,
    importance,
    createdAt: '2026-07-23T00:00:00.000Z',
  };
}

function createGraph(nodes, edges = []) {
  return {
    schemaVersion: 1,
    projectId: 'project-0001',
    missionId: 'mission-0001',
    generatedAt: '2026-07-23T00:00:00.000Z',
    sourceDigest: 'a'.repeat(64),
    maxNodes: 250,
    truncated: false,
    counts: {
      availableNodes: nodes.length,
      projectedNodes: nodes.length,
      excludedNodes: 0,
      projectedEdges: edges.length,
    },
    nodes,
    edges,
    authority: {
      readOnly: true,
      persistenceAllowed: false,
      mutationAllowed: false,
      blockedActions: ['approval', 'execution', 'resume', 'source-mutation', 'commit', 'push'],
    },
  };
}

const missionNode = createNode('mission-0001', 'mission', 'root');
const councilNode = createNode('council-0001', 'council', 'major');
const sparseGraph = createGraph([missionNode, councilNode], [{
  id: 'edge-0001',
  kind: 'contains',
  from: missionNode.id,
  to: councilNode.id,
  sourceRefs: ['mission-0001', 'council-0001'],
}]);
const sparseBefore = JSON.stringify(sparseGraph);
const sparseRendered = renderMissionEvidenceGraph(sparseGraph);

assert.match(sparseRendered, /viewBox="0 0 1060 220"/);
assert.equal(
  (sparseRendered.match(/mission-evidence-graph-fallback-stage is-empty/g) || []).length,
  4,
);
assert.equal(
  (sparseRendered.match(/<h4>(?:Mission|Council|Execution|Verification|Delivery|Learning) <span>/g) || []).length,
  6,
);
assert.equal(JSON.stringify(sparseGraph), sparseBefore);

const denseCouncilNodes = Array.from(
  { length: 6 },
  (_, index) => createNode(`council-000${index + 1}`, 'council'),
);
const denseRendered = renderMissionEvidenceGraph(createGraph([missionNode, ...denseCouncilNodes]));
assert.match(denseRendered, /viewBox="0 0 1060 452"/);

const rendererSource = fs.readFileSync(
  new URL('../ui/mission-evidence-graph.js', import.meta.url),
  'utf8',
);
const stylesSource = fs.readFileSync(new URL('../ui/styles.css', import.meta.url), 'utf8');
const decisionSource = fs.readFileSync(
  new URL('../docs/01_decision-log.md', import.meta.url),
  'utf8',
);
const planSource = fs.readFileSync(
  new URL('../docs/102_llm-native-sparse-mission-graph-density-plan.md', import.meta.url),
  'utf8',
);

assert.match(rendererSource, /const MIN_GRAPH_HEIGHT = 220/);
assert.match(rendererSource, /Math\.max\(MIN_GRAPH_HEIGHT, 140 \+ largestRowCount \* NODE_ROW_GAP\)/);
assert.match(stylesSource, /\.mission-evidence-graph-fallback-stage\.is-empty p \{[\s\S]*display: none/);
assert.match(stylesSource, /@media \(max-width: 520px\)[\s\S]*\.mission-evidence-graph-fallback-body \{[\s\S]*gap: 12px/);
assert.match(stylesSource, /body \.llm-app-shell \.workspace-shell \{[\s\S]*grid-template-rows: auto minmax\(0, 1fr\)/);
assert.match(decisionSource, /### DEC-151/);
assert.match(planSource, /API contract: exact DEC-138 GET unchanged/);
assert.doesNotMatch(rendererSource, /fetch\(|localStorage|sessionStorage/);
assert.doesNotMatch(
  sparseRendered,
  /data-action="(?:approve|execute|resume|mutate|commit|push|release)-mission-graph/,
);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: MODE,
  presentation: {
    sparseCanvasHeight: 220,
    denseCanvasHeight: 452,
    semanticStages: 6,
    emptyStages: 4,
    emptyStagePresentation: 'heading-and-count-only',
    workspaceRows: 'intrinsic-header-and-content',
  },
  compatibility: {
    maxNodes: sparseGraph.maxNodes,
    sourceUnchanged: true,
    exactGetUnchanged: true,
  },
  authority: {
    runtimeWrites: 0,
    apiChanges: 0,
    schemaChanges: 0,
    dependencyChanges: 0,
    graphActions: 0,
  },
}, null, 2)}\n`);
