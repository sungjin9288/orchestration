import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import graphModule from '../src/runtime/execution-provenance-graph.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createEmptyState, STATE_SCHEMA_VERSION } = contractsModule;
const { MAX_GRAPH_NODES, buildTaskExecutionProvenanceGraph } = graphModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = process.env.ORCHESTRATION_EXECUTION_PROVENANCE_GRAPH_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-execution-provenance-graph-smoke');
const runtimeRoot = path.join(tempRoot, 'runtime');
const statePath = path.join(runtimeRoot, 'state.json');
const keepFixture = process.env.ORCHESTRATION_EXECUTION_PROVENANCE_GRAPH_KEEP_FIXTURE === '1';
const MODE = 'ai-company-execution-provenance-graph-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function buildExecutionProvenanceFixture() {
  const state = createEmptyState();
  state.activeProjectId = 'project-a';
  state.projects['project-a'] = {
    id: 'project-a',
    name: 'Visible project',
    projectPath: '/private/project-a',
    createdAt: '2030-01-01T00:00:00.000Z',
  };
  state.projects['project-b'] = {
    id: 'project-b',
    name: 'Hidden project',
    projectPath: '/private/project-b',
    createdAt: '2030-01-01T00:00:00.000Z',
  };
  state.missions['mission-a'] = {
    id: 'mission-a',
    projectId: 'project-a',
    title: 'Visible mission',
    status: 'executing',
    createdAt: '2030-01-01T00:00:01.000Z',
  };
  state.tasks['task-a'] = {
    id: 'task-a',
    projectId: 'project-a',
    missionId: 'mission-a',
    title: 'Visible task',
    lifecycleState: 'In Progress',
    intent: 'SENSITIVE_TASK_BODY',
    artifactIds: ['artifact-a'],
    createdAt: '2030-01-01T00:00:02.000Z',
  };
  state.tasks['task-b'] = {
    id: 'task-b',
    projectId: 'project-b',
    title: 'Hidden task',
    lifecycleState: 'Done',
    artifactIds: ['artifact-b'],
    createdAt: '2030-01-01T00:00:02.000Z',
  };
  state.executionPlans['plan-a'] = {
    id: 'plan-a',
    projectId: 'project-a',
    missionId: 'mission-a',
    controlTaskId: 'task-a',
    status: 'active',
    workOrderIds: ['work-order-a'],
    checkpointRefs: ['checkpoint-a'],
    deliveryPackageRefs: ['package-a'],
    approvalId: 'approval-a',
    terminalGateApprovalId: null,
    createdAt: '2030-01-01T00:00:03.000Z',
  };
  state.workOrders['work-order-a'] = {
    id: 'work-order-a',
    executionPlanId: 'plan-a',
    role: 'builder',
    title: 'Build visible task',
    status: 'completed',
    dependencyIds: [],
    runRefs: ['run-a'],
    artifactRefs: ['artifact-a'],
    approvalRefs: ['approval-a'],
    acceptanceCriterionRefs: ['criterion-a', 'criterion-malformed'],
    createdAt: '2030-01-01T00:00:04.000Z',
  };
  state.runs['run-a'] = {
    id: 'run-a',
    taskId: 'task-a',
    role: 'builder',
    kind: 'local-stub',
    status: 'completed',
    summary: {
      artifactIds: ['artifact-a'],
      prompt: 'SENSITIVE_RUN_PROMPT',
      providerPayload: 'SENSITIVE_PROVIDER_PAYLOAD',
    },
    startedAt: '2030-01-01T00:00:05.000Z',
  };
  state.runs['run-b'] = {
    id: 'run-b',
    taskId: 'task-b',
    role: 'builder',
    status: 'completed',
    startedAt: '2030-01-01T00:00:05.000Z',
  };
  state.artifacts['artifact-a'] = {
    id: 'artifact-a',
    taskId: 'task-a',
    runId: 'run-a',
    type: 'patch',
    path: '/private/project-a/artifact-a.patch',
    content: 'SENSITIVE_ARTIFACT_CONTENT',
    createdAt: '2030-01-01T00:00:06.000Z',
  };
  state.artifacts['artifact-b'] = {
    id: 'artifact-b',
    taskId: 'task-b',
    runId: 'run-b',
    type: 'patch',
    path: '/private/project-b/artifact-b.patch',
    createdAt: '2030-01-01T00:00:06.000Z',
  };
  state.approvals['approval-a'] = {
    id: 'approval-a',
    taskId: 'task-a',
    scope: 'live-mutation',
    status: 'approved',
    createdAt: '2030-01-01T00:00:07.000Z',
  };
  state.decisionInboxItems['decision-a'] = {
    id: 'decision-a',
    taskId: 'task-a',
    kind: 'review',
    sourceId: 'approval-a',
    status: 'resolved',
    createdAt: '2030-01-01T00:00:08.000Z',
  };
  state.workflowCheckpoints['checkpoint-a'] = {
    id: 'checkpoint-a',
    executionPlanId: 'plan-a',
    stage: 'reviewed',
    status: 'terminal',
    createdAt: '2030-01-01T00:00:09.000Z',
  };
  state.acceptanceCriteria['criterion-a'] = {
    id: 'criterion-a',
    projectId: 'project-a',
    missionId: 'mission-a',
    executionPlanId: 'plan-a',
    workOrderId: 'work-order-a',
    title: 'Verification passes',
    status: 'active',
    createdAt: '2030-01-01T00:00:10.000Z',
  };
  state.acceptanceCriteria['criterion-malformed'] = {
    ...state.acceptanceCriteria['criterion-a'],
    id: 'criterion-malformed',
    executionPlanId: 'plan-b',
  };
  state.verificationProofs['proof-a'] = {
    id: 'proof-a',
    acceptanceCriterionId: 'criterion-a',
    executionPlanId: 'plan-a',
    workOrderId: 'work-order-a',
    proofKind: 'review',
    status: 'passed',
    evidenceArtifactIds: ['artifact-a'],
    createdAt: '2030-01-01T00:00:11.000Z',
  };
  state.deliveryPackages['package-a'] = {
    id: 'package-a',
    projectId: 'project-a',
    missionId: 'mission-a',
    executionPlanId: 'plan-a',
    status: 'review-required',
    createdAt: '2030-01-01T00:00:12.000Z',
  };
  state.deliveryPackageAcceptances['acceptance-a'] = {
    id: 'acceptance-a',
    executionPlanId: 'plan-a',
    deliveryPackageId: 'package-a',
    decision: 'accepted',
    createdAt: '2030-01-01T00:00:13.000Z',
  };
  state.missionCloseOuts['close-out-a'] = {
    id: 'close-out-a',
    missionId: 'mission-a',
    linkedTaskId: 'task-a',
    executionPlanId: 'plan-a',
    deliveryPackageId: 'package-a',
    decision: 'closed-out',
    createdAt: '2030-01-01T00:00:14.000Z',
  };
  return state;
}

function buildCapFixture() {
  const state = buildExecutionProvenanceFixture();
  for (let index = 0; index < 300; index += 1) {
    const id = `artifact-cap-${String(index).padStart(3, '0')}`;
    state.artifacts[id] = {
      id,
      taskId: 'task-a',
      type: 'output',
      createdAt: `2030-01-02T00:${String(index % 60).padStart(2, '0')}:00.000Z`,
    };
  }
  return state;
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const fixture = buildExecutionProvenanceFixture();
    const first = buildTaskExecutionProvenanceGraph(fixture, 'task-a', {
      generatedAt: '2030-01-03T00:00:00.000Z',
    });
    const second = buildTaskExecutionProvenanceGraph(fixture, 'task-a', {
      generatedAt: '2030-01-03T00:00:01.000Z',
    });
    const nodeIds = new Set(first.nodes.map((node) => node.id));
    const serialized = JSON.stringify(first);

    assert.equal(first.schemaVersion, 1);
    assert.equal(first.taskId, 'task-a');
    assert.equal(first.maxNodes, MAX_GRAPH_NODES);
    assert.equal(first.sourceDigest, second.sourceDigest);
    assert.deepEqual(first.nodes, second.nodes);
    assert.deepEqual(first.edges, second.edges);
    assert.equal(first.authority.readOnly, true);
    assert.equal(first.authority.persistenceAllowed, false);
    assert.equal(first.authority.mutationAllowed, false);
    assertDeepFrozen(first);
    assert.ok(first.nodes.every((node) => node.sourceRefs.length > 0));
    assert.ok(first.edges.every((edge) => edge.sourceRefs.length > 0));
    assert.ok(first.edges.every((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)));
    assert.equal(nodeIds.has('artifact-patch:artifact-b'), false);
    assert.equal(nodeIds.has('acceptance-criterion:criterion-malformed'), false);
    assert.equal(nodeIds.has('role:task-a:builder'), true);
    assert.equal(nodeIds.has('mission-close-out:close-out-a'), true);
    assert.throws(
      () => buildTaskExecutionProvenanceGraph(fixture, ' task-a '),
      (error) => error.statusCode === 404 && /not found/.test(error.message),
    );

    const missionlessFixture = buildExecutionProvenanceFixture();
    missionlessFixture.tasks['task-a'].missionId = null;
    const missionless = buildTaskExecutionProvenanceGraph(missionlessFixture, 'task-a');
    const missionlessNodeIds = new Set(missionless.nodes.map((node) => node.id));
    assert.equal(missionless.missionId, null);
    assert.equal(missionlessNodeIds.has('mission:mission-a'), false);
    assert.equal(missionlessNodeIds.has('execution-plan:plan-a'), false);
    assert.equal(missionlessNodeIds.has('acceptance-criterion:criterion-a'), false);
    assert.equal(missionlessNodeIds.has('delivery-package:package-a'), false);
    assert.equal(missionlessNodeIds.has('mission-close-out:close-out-a'), false);
    for (const forbidden of [
      'SENSITIVE_TASK_BODY',
      'SENSITIVE_RUN_PROMPT',
      'SENSITIVE_PROVIDER_PAYLOAD',
      'SENSITIVE_ARTIFACT_CONTENT',
      '/private/project-a',
      'projectPath',
      'path',
      'content',
      'summary',
    ]) {
      assert.equal(serialized.includes(forbidden), false, `graph leaked ${forbidden}`);
    }

    const capped = buildTaskExecutionProvenanceGraph(buildCapFixture(), 'task-a');
    const cappedIds = new Set(capped.nodes.map((node) => node.id));
    assert.equal(capped.nodes.length, MAX_GRAPH_NODES);
    assert.equal(capped.truncated, true);
    assert.ok(capped.counts.excludedNodes > 0);
    assert.ok(capped.edges.every((edge) => cappedIds.has(edge.from) && cappedIds.has(edge.to)));

    const runtime = createRuntimeService({ runtimeRoot });
    runtime.resetRuntime();
    const project = runtime.createProject({ name: 'Runtime graph fixture', projectPath: repoRoot });
    const mission = runtime.createMission({
      projectId: project.id,
      title: 'Runtime graph mission',
      goal: 'Exercise one read-only task graph.',
    });
    const { task } = runtime.createLinkedTaskForMission({
      missionId: mission.id,
      title: 'Read-only graph task',
      intent: 'Keep projection evidence read-only.',
    });
    const beforeRead = fs.readFileSync(statePath);
    const runtimeGraph = runtime.getTaskExecutionProvenance(task.id);
    const afterRead = fs.readFileSync(statePath);
    assert.equal(JSON.parse(beforeRead.toString('utf8')).schemaVersion, STATE_SCHEMA_VERSION);
    assert.deepEqual(afterRead, beforeRead);
    assert.equal(runtimeGraph.taskId, task.id);
    assert.throws(
      () => runtime.getTaskExecutionProvenance('task-missing'),
      (error) => error.statusCode === 404 && /not found/.test(error.message),
    );

    const otherPath = path.join(runtimeRoot, 'other-project');
    fs.mkdirSync(otherPath, { recursive: true });
    const otherProject = runtime.createProject({ name: 'Other project', projectPath: otherPath });
    runtime.selectProject(otherProject.id);
    assert.throws(
      () => runtime.getTaskExecutionProvenance(task.id),
      (error) => error.statusCode === 409 && /active project/.test(error.message),
    );
    runtime.selectProject(project.id);

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      runtimeSchemaVersion: STATE_SCHEMA_VERSION,
      graphSchemaVersion: first.schemaVersion,
      projectedNodes: first.nodes.length,
      projectedEdges: first.edges.length,
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
