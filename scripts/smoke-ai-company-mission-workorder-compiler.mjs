import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import blueprintModule from '../src/runtime/company-blueprint.js';
import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import compilerModule from '../src/runtime/mission-workorder-compiler.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { startHistoricalUnboundRealCouncilFixture } from './ai-company-council-fixtures.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { loadCompanyBlueprint } = blueprintModule;
const { createCouncilLocalStubAdapter } = councilAdapterModule;
const {
  compileMissionWorkOrderPreview,
  normalizeCompileSpec,
  preflightMissionWorkOrderCandidate,
  validateWorkOrderGraph,
} = compilerModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-mission-workorder-compiler-smoke');
const MODE = 'ai-company-mission-workorder-compiler-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = Object.freeze({
  targetPathAllowlist: ['src/runtime/mission-workorder-compiler.js', 'scripts/smoke-example.mjs'],
  expectedArtifacts: ['focused compiler smoke evidence', 'aggregate verification evidence'],
  verificationCommands: ['node scripts/smoke-example.mjs', 'node scripts/verification_status.mjs'],
  stopConditions: ['Source digest becomes stale', 'Authority boundary opens'],
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'resolved-council-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return {
        ...base.executeSynthesis(request),
        unresolvedQuestions: [],
      };
    },
  };
}

function createConfiguredRuntime(name, adapter = createResolvedAdapter()) {
  const runtimeRoot = path.join(tempRoot, name);
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: adapter,
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name, projectPath: repoRoot });
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Mission compiler ${name}`,
    goal: 'Compile one deterministic response-only Builder Reviewer QA preview.',
    constraints: 'Keep the response-only preview path and do not create or execute durable WorkOrders.',
  });
  const started = startHistoricalUnboundRealCouncilFixture({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: adapter,
    missionId: mission.id,
  });
  return { runtime, runtimeRoot, project, mission, session: started.councilSession };
}

function getCompilerInput(runtime, sessionId, blueprint) {
  const snapshot = runtime.getSnapshot();
  const councilSession = snapshot.councilSessions[sessionId];
  const mission = snapshot.missions[councilSession.missionId];
  return {
    mission,
    project: snapshot.projects[mission.projectId],
    councilSession,
    companyBlueprint: blueprint,
    compileSpec,
  };
}

function assertNoDownstreamRecords(snapshot) {
  for (const key of ['tasks', 'runs', 'artifacts', 'approvals']) {
    assert.equal(Object.keys(snapshot[key]).length, 0, `${key} must remain empty`);
  }
  for (const emptyKey of ['executionPlans', 'workOrders', 'handoffPackets']) {
    assert.equal(Object.keys(snapshot[emptyKey] || {}).length, 0, `${emptyKey} must remain empty`);
  }
  assert.equal(Object.hasOwn(snapshot, 'checkpoints'), false);
}

function assertGraphFailure(workOrders, pattern) {
  assert.throws(() => validateWorkOrderGraph(workOrders), pattern);
}

fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(tempRoot, { recursive: true });

try {
  const blueprint = loadCompanyBlueprint({ blueprintPath, repoRoot });
  const success = createConfiguredRuntime('success');
  const initialSnapshot = success.runtime.getSnapshot();
  const initialSession = initialSnapshot.councilSessions[success.session.id];
  const initialAttempt = initialSession.attempts[0];

  assert.equal(initialSnapshot.schemaVersion, 18);
  assert.deepEqual(initialAttempt.synthesis.unresolvedQuestions, []);
  assert.equal(initialSession.phase, 'awaiting-alignment');
  assertNoDownstreamRecords(initialSnapshot);

  const preflightInput = getCompilerInput(success.runtime, success.session.id, blueprint);
  const firstPreflight = success.runtime.preflightMissionWorkOrderPreview({
    councilSessionId: success.session.id,
    action: 'approve',
    compileSpec,
  });
  const secondPreflight = success.runtime.preflightMissionWorkOrderPreview({
    councilSessionId: success.session.id,
    action: 'approve',
    compileSpec,
  });
  assert.deepEqual(firstPreflight, secondPreflight);
  assert.equal(firstPreflight.validation.authorityClosed, true);
  assert.equal(firstPreflight.workOrderIds.length, 3);
  assert.deepEqual(success.runtime.getSnapshot(), initialSnapshot);

  assert.throws(
    () => success.runtime.preflightMissionWorkOrderPreview({
      councilSessionId: success.session.id,
      action: 'approve',
      compileSpec: { ...compileSpec, unknownField: ['blocked'] },
    }),
    /fields are invalid/,
  );
  assert.deepEqual(success.runtime.getSnapshot(), initialSnapshot);

  const approved = success.runtime.decideRealCouncilSession({
    councilSessionId: success.session.id,
    action: 'approve',
  });
  assert.equal(approved.councilSession.alignment.status, 'approved');

  const preview = success.runtime.previewMissionWorkOrders({
    councilSessionId: success.session.id,
    compileSpec,
  });
  const recomputed = success.runtime.previewMissionWorkOrders({
    councilSessionId: success.session.id,
    compileSpec,
  });
  assert.deepEqual(preview, recomputed);
  assert.equal(Object.isFrozen(preview), true);
  assert.equal(Object.isFrozen(preview.executionPlan), true);
  assert.equal(Object.isFrozen(preview.workOrders[0]), true);
  assert.equal(preview.schemaVersion, 1);
  assert.equal(preview.persistenceAllowed, false);
  assert.equal(preview.executionAllowed, false);
  assert.equal(preview.approvalAllowed, false);
  assert.deepEqual(preview.workOrders.map((entry) => entry.assignedAgentId), [
    'agent-builder',
    'agent-reviewer',
    'agent-qa',
  ]);
  assert.deepEqual(preview.workOrders.map((entry) => entry.dependencies.length), [0, 1, 1]);
  assert.equal(preview.handoffPackets.length, 3);
  assert.equal(preview.validation.dependencyCycleFree, true);
  assert.equal(preview.validation.mutableTargetCollisionFree, true);
  assert.ok(preview.workOrders.every((entry) => entry.authority.executeAllowed === false));
  assert.ok(preview.workOrders.every((entry) => entry.authority.persistenceAllowed === false));

  const approvedSnapshot = success.runtime.getSnapshot();
  assert.equal(approvedSnapshot.schemaVersion, 18);
  assertNoDownstreamRecords(approvedSnapshot);
  const stateBeforeReload = clone(approvedSnapshot);
  const reloaded = createRuntimeService({
    runtimeRoot: success.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  assert.deepEqual(reloaded.getSnapshot(), stateBeforeReload);
  assert.deepEqual(
    reloaded.previewMissionWorkOrders({ councilSessionId: success.session.id, compileSpec }),
    preview,
  );

  const providerPreflightInput = clone(preflightInput);
  providerPreflightInput.councilSession.mode = 'real-openai-responses';
  assert.deepEqual(
    Object.keys(preflightMissionWorkOrderCandidate({
      ...providerPreflightInput,
      alignmentAction: 'approve',
    })).sort(),
    Object.keys(firstPreflight).sort(),
  );
  const providerFinalInput = getCompilerInput(reloaded, success.session.id, blueprint);
  providerFinalInput.councilSession = clone(providerFinalInput.councilSession);
  providerFinalInput.councilSession.mode = 'real-openai-responses';
  const providerPreview = compileMissionWorkOrderPreview(providerFinalInput);
  assert.deepEqual(Object.keys(providerPreview).sort(), Object.keys(preview).sort());
  assert.deepEqual(
    providerPreview.workOrders.map((entry) => Object.keys(entry).sort()),
    preview.workOrders.map((entry) => Object.keys(entry).sort()),
  );

  const unresolved = createConfiguredRuntime('unresolved', createCouncilLocalStubAdapter());
  assert.throws(
    () => unresolved.runtime.preflightMissionWorkOrderPreview({
      councilSessionId: unresolved.session.id,
      action: 'approve',
      compileSpec,
    }),
    /unresolved questions/,
  );
  assert.equal(
    unresolved.runtime.getCouncilSession(unresolved.session.id).alignment.status,
    'pending',
  );

  const invalidSessionCases = [
    ['wrong action', (input) => ({ ...input, alignmentAction: 'stop' }), /explicit approval/],
    ['missing synthesis', (input) => {
      input.councilSession.attempts[0].synthesis = null;
      return input;
    }, /no synthesis/],
    ['failed attempt', (input) => {
      input.councilSession.attempts[0].status = 'failed';
      return input;
    }, /not ready for alignment/],
    ['stopped session', (input) => {
      input.councilSession.phase = 'terminal';
      input.councilSession.status = 'stopped';
      return input;
    }, /not awaiting explicit approval/],
  ];
  for (const [, mutate, pattern] of invalidSessionCases) {
    const input = mutate(clone({ ...preflightInput, alignmentAction: 'approve' }));
    assert.throws(() => preflightMissionWorkOrderCandidate(input), pattern);
  }

  for (const invalidSpec of [
    { ...compileSpec, expectedArtifacts: [] },
    { ...compileSpec, stopConditions: ['same', 'same'] },
    { ...compileSpec, targetPathAllowlist: ['/absolute/path'] },
    { ...compileSpec, targetPathAllowlist: ['../traversal'] },
    { ...compileSpec, targetPathAllowlist: ['src\\windows.js'] },
    { ...compileSpec, targetPathAllowlist: ['src/*.js'] },
  ]) {
    assert.throws(() => normalizeCompileSpec(invalidSpec));
  }

  const graphBase = [
    { id: 'a', dependencies: [], targetPathAllowlist: ['src/shared.js'] },
    { id: 'b', dependencies: ['a'], targetPathAllowlist: ['src/shared.js'] },
  ];
  assert.deepEqual(validateWorkOrderGraph(graphBase), {
    dependencyCycleFree: true,
    mutableTargetCollisionFree: true,
  });
  assertGraphFailure(
    [{ id: 'a', dependencies: ['missing'], targetPathAllowlist: [] }],
    /missing dependency/,
  );
  assertGraphFailure(
    [
      { id: 'a', dependencies: ['b'], targetPathAllowlist: [] },
      { id: 'b', dependencies: ['a'], targetPathAllowlist: [] },
    ],
    /dependency cycle/,
  );
  assertGraphFailure(
    [
      { id: 'a', dependencies: [], targetPathAllowlist: ['src/shared.js'] },
      { id: 'b', dependencies: [], targetPathAllowlist: ['src/shared.js'] },
    ],
    /target collision is not serialized/,
  );

  const missingRoleInput = clone({ ...preflightInput, alignmentAction: 'approve' });
  missingRoleInput.companyBlueprint.agentProfiles =
    missingRoleInput.companyBlueprint.agentProfiles.filter((entry) => entry.role !== 'qa');
  assert.throws(() => preflightMissionWorkOrderCandidate(missingRoleInput), /missing WorkOrder role: qa/);

  const forbiddenAuthorityInput = clone({ ...preflightInput, alignmentAction: 'approve' });
  forbiddenAuthorityInput.companyBlueprint.agentProfiles.find(
    (entry) => entry.role === 'builder',
  ).authority.canCommit = true;
  assert.throws(
    () => preflightMissionWorkOrderCandidate(forbiddenAuthorityInput),
    /builder has forbidden authority/,
  );

  const forbiddenConductorInput = clone({ ...preflightInput, alignmentAction: 'approve' });
  forbiddenConductorInput.companyBlueprint.agentProfiles.find(
    (entry) => entry.role === 'conductor',
  ).authority.canPush = true;
  assert.throws(
    () => preflightMissionWorkOrderCandidate(forbiddenConductorInput),
    /conductor has forbidden authority/,
  );

  const stale = createConfiguredRuntime('stale');
  const staleStatePath = path.join(stale.runtimeRoot, 'state.json');
  const staleState = JSON.parse(fs.readFileSync(staleStatePath, 'utf8'));
  staleState.missions[stale.mission.id].goal = 'Changed after Council synthesis.';
  fs.writeFileSync(staleStatePath, `${JSON.stringify(staleState, null, 2)}\n`);
  assert.throws(
    () => stale.runtime.preflightMissionWorkOrderPreview({
      councilSessionId: stale.session.id,
      action: 'approve',
      compileSpec,
    }),
    /stale source digest/,
  );

  process.stdout.write(`${JSON.stringify({
    ok: true,
    mode: MODE,
    compiler: {
      deterministic: true,
      sourceCurrentRequired: true,
      exactCompileSpecRequired: true,
      graph: ['builder-preflight', 'reviewer', 'qa'],
      providerSchemaParity: true,
    },
    compatibility: {
      schemaVersion: 12,
      persistedPlanRecords: 0,
      persistedWorkOrderRecords: 0,
      defaultLocalUnresolvedRejected: true,
    },
    authority: {
      persistenceAllowed: false,
      executionAllowed: false,
      approvalAllowed: false,
      commitAllowed: false,
      pushAllowed: false,
    },
  }, null, 2)}\n`);
} finally {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
}
