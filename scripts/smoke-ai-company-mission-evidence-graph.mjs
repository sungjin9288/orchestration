import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import graphModule from '../src/runtime/mission-evidence-graph.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { startHistoricalUnboundRealCouncilFixture } from './ai-company-council-fixtures.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createEmptyState } = contractsModule;
const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { MAX_GRAPH_NODES, buildMissionEvidenceGraph } = graphModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = process.env.ORCHESTRATION_MISSION_GRAPH_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-mission-evidence-graph-smoke');
const runtimeRoot = path.join(tempRoot, 'runtime');
const statePath = path.join(runtimeRoot, 'state.json');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const keepFixture = process.env.ORCHESTRATION_MISSION_GRAPH_KEEP_FIXTURE === '1';
const MODE = 'ai-company-mission-evidence-graph-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: ['src/runtime/mission-evidence-graph.js'],
  expectedArtifacts: ['Mission evidence graph smoke evidence'],
  verificationCommands: ['node --check src/runtime/mission-evidence-graph.js'],
  stopConditions: ['Stop before source mutation'],
};

function createResolvedAdapter() {
  const adapter = createCouncilLocalStubAdapter();
  return {
    id: 'mission-evidence-graph-local-stub',
    mode: 'local-stub',
    executePosition: (request) => adapter.executePosition(request),
    executeSynthesis(request) {
      return { ...adapter.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function buildCapFixture() {
  const state = createEmptyState();
  state.activeProjectId = 'project-cap';
  state.projects['project-cap'] = {
    id: 'project-cap',
    name: 'Cap fixture',
    projectPath: repoRoot,
  };
  state.missions['mission-cap'] = {
    id: 'mission-cap',
    projectId: 'project-cap',
    title: 'Cap fixture mission',
    status: 'draft',
    createdAt: '2030-01-01T00:00:00.000Z',
  };
  for (let index = 0; index < 300; index += 1) {
    const id = `learning-candidate-cap-${String(index).padStart(3, '0')}`;
    state.learningCandidates[id] = {
      id,
      sourceMissionId: 'mission-cap',
      reviewerStatus: 'review-required',
      createdAt: `2030-01-01T00:${String(index % 60).padStart(2, '0')}:00.000Z`,
    };
  }
  return state;
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const runtime = createRuntimeService({
      runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
      councilAdapter: createResolvedAdapter(),
    });
    runtime.resetRuntime();
    const project = runtime.createProject({ name: 'Mission graph fixture', projectPath: repoRoot });
    const mission = runtime.createMission({
      projectId: project.id,
      title: 'Trace one bounded delivery',
      goal: 'SENSITIVE_GOAL_BODY must never enter the graph payload.',
      constraints: 'SENSITIVE_CONSTRAINT_BODY must never enter the graph payload.',
    });
    const started = startHistoricalUnboundRealCouncilFixture({
      runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
      councilAdapter: createResolvedAdapter(),
      missionId: mission.id,
    });
    runtime.decideRealCouncilSession({
      councilSessionId: started.councilSession.id,
      action: 'approve',
    });
    const preview = runtime.previewMissionWorkOrders({
      councilSessionId: started.councilSession.id,
      compileSpec,
    });
    runtime.persistMissionWorkOrderPlan({
      councilSessionId: started.councilSession.id,
      compileSpec,
      previewId: preview.previewId,
      sourceDigest: preview.sourceDigest,
    });

    const beforeRead = fs.readFileSync(statePath);
    const first = runtime.getMissionEvidenceGraph(mission.id);
    const second = runtime.getMissionEvidenceGraph(mission.id);
    const afterRead = fs.readFileSync(statePath);
    const kinds = new Set(first.nodes.map((node) => node.kind));
    const nodeIds = new Set(first.nodes.map((node) => node.id));

    assert.equal(first.schemaVersion, 1);
    assert.equal(first.projectId, project.id);
    assert.equal(first.missionId, mission.id);
    assert.equal(first.maxNodes, MAX_GRAPH_NODES);
    assert.equal(first.truncated, false);
    assert.equal(first.authority.readOnly, true);
    assert.equal(first.authority.persistenceAllowed, false);
    assert.equal(first.authority.mutationAllowed, false);
    assert.equal(first.sourceDigest, second.sourceDigest);
    assert.deepEqual(first.nodes, second.nodes);
    assert.deepEqual(first.edges, second.edges);
    assert.deepEqual(afterRead, beforeRead);
    assertDeepFrozen(first);

    for (const expectedKind of [
      'mission',
      'council-session',
      'council-position',
      'council-synthesis',
      'execution-plan',
      'work-order',
      'task',
      'approval',
      'decision',
    ]) {
      assert.equal(kinds.has(expectedKind), true, `missing graph node kind: ${expectedKind}`);
    }
    assert.ok(first.edges.length > 0);
    assert.ok(first.edges.every((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)));
    assert.ok(first.edges.every((edge) => edge.sourceRefs.length > 0));

    const serialized = JSON.stringify(first);
    for (const forbidden of [
      'SENSITIVE_GOAL_BODY',
      'SENSITIVE_CONSTRAINT_BODY',
      'projectPath',
      'runtimeRoot',
      'transcript',
      'providerPayload',
      'credential',
    ]) {
      assert.equal(serialized.includes(forbidden), false, `graph leaked forbidden field: ${forbidden}`);
    }

    assert.throws(
      () => runtime.getMissionEvidenceGraph('mission-missing'),
      (error) => error.statusCode === 404 && /not found/.test(error.message),
    );

    const capped = buildMissionEvidenceGraph(buildCapFixture(), 'mission-cap', {
      generatedAt: '2030-01-01T00:00:00.000Z',
    });
    const cappedNodeIds = new Set(capped.nodes.map((node) => node.id));
    assert.equal(capped.nodes.length, MAX_GRAPH_NODES);
    assert.equal(capped.truncated, true);
    assert.equal(capped.counts.availableNodes, 301);
    assert.equal(capped.counts.excludedNodes, 51);
    assert.ok(capped.edges.every((edge) => cappedNodeIds.has(edge.from) && cappedNodeIds.has(edge.to)));
    assertDeepFrozen(capped);

    const otherProjectPath = path.join(runtimeRoot, 'other-project');
    fs.mkdirSync(otherProjectPath, { recursive: true });
    const otherProject = runtime.createProject({ name: 'Other project', projectPath: otherProjectPath });
    runtime.selectProject(otherProject.id);
    assert.throws(
      () => runtime.getMissionEvidenceGraph(mission.id),
      (error) => error.statusCode === 409 && /active project/.test(error.message),
    );
    runtime.selectMission(mission.id);

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: JSON.parse(beforeRead.toString('utf8')).schemaVersion,
      graphSchemaVersion: first.schemaVersion,
      missionId: mission.id,
      projectId: project.id,
      otherProjectId: otherProject.id,
      projectedNodes: first.nodes.length,
      projectedEdges: first.edges.length,
      maxNodes: first.maxNodes,
      cappedNodes: capped.nodes.length,
      stateBytesStable: true,
      readOnly: true,
      blockedActions: first.authority.blockedActions,
      runtimeRoot,
    }, null, 2));
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
