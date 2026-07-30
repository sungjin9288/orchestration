import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import specialistModule from '../src/runtime/specialist-batch-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const {
  BLOCKED_ACTIONS,
  buildSpecialistBatchPreview,
  digestCanonical,
} = specialistModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(
  repoRoot,
  'var',
  'runtime-ai-company-specialist-batch-preview-smoke',
);
const blueprintPath = path.join(tempRoot, 'company', 'blueprint.json');
const runtimeRoot = path.join(tempRoot, 'runtime');
const projectPath = path.join(tempRoot, 'project');
const statePath = path.join(runtimeRoot, 'state.json');
const port = 9980 + (process.pid % 10);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ai-company-specialist-batch-preview-smoke';
const keepFixture =
  process.env.ORCHESTRATION_SPECIALIST_BATCH_PREVIEW_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'specialist-batch-preview-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function writeProjectFixture() {
  const files = {
    'README.md': '# Specialist source fixture\n',
    'src/runtime/runtime-service.js':
      "'use strict';\n\nmodule.exports = { specialistPreview: true };\n",
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }
  fs.symlinkSync(
    path.join(projectPath, 'README.md'),
    path.join(projectPath, 'README-alias.md'),
  );
}

function createStaffingSpec() {
  return {
    mode: 'council',
    selectedAgentIds: [
      'agent-conductor',
      'agent-strategist',
      'agent-architect',
      'agent-decomposer',
    ],
    selectionRationale:
      'Bind one exact local Council before response-only specialist preview.',
    parallelGroups: [],
    providerMode: 'local-stub',
    terminationPolicy: {
      maxProviderCalls: 0,
      maxTurnsPerAgent: 4,
      deadlineMs: 120000,
      stopOnRequiredRoleFailure: true,
    },
  };
}

function seedBoundCouncil() {
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
    councilAdapter: createResolvedCouncilAdapter(),
    councilLiveAdapter: {
      executePosition() {
        throw new Error('SpecialistBatchPreview must not call a live provider');
      },
      executeSynthesis() {
        throw new Error('SpecialistBatchPreview must not call a live provider');
      },
    },
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'Specialist batch preview',
    projectPath,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Review two read-only specialist contracts',
    goal: 'Produce one response-only exact specialist preview.',
    constraints:
      'No worker, provider, persistence, source mutation, retry, commit, push, or release.',
  });
  const staffingSpec = createStaffingSpec();
  const evaluatedAt = new Date().toISOString();
  const staffingPreview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const staffingPlan = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: staffingPreview.id,
    previewDigest: staffingPreview.previewDigest,
    sourceDigest: staffingPreview.sourceDigest,
    missionDigest: staffingPreview.missionDigest,
    blueprintDigest: staffingPreview.blueprintDigest,
    staffingSpecDigest: staffingPreview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept the exact local Council staffing source.',
      reviewedAt: evaluatedAt,
    },
  }).staffingPlan;
  const entered = runtime.enterStaffingPlanCouncil({
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Bind the accepted StaffingPlan to one local Council.',
      requestedAt: new Date().toISOString(),
    },
  });
  runtime.decideRealCouncilSession({
    councilSessionId: entered.councilSession.id,
    action: 'approve',
  });
  return {
    councilSessionId: entered.councilSession.id,
    mission,
    project,
    runtime,
    staffingEntry: entered.staffingEntry,
    staffingPlan,
  };
}

function buildRequest(context, evaluatedAt = new Date().toISOString(), overrides = {}) {
  const snapshot = context.runtime.getSnapshot();
  const councilSession = snapshot.councilSessions[context.councilSessionId];
  const currentAttempt = councilSession.attempts.find(
    (attempt) => attempt.id === councilSession.currentAttemptId,
  );
  const roleDigests = new Map(
    snapshot.companyRuntime.roleSourceDigests.map((entry) => [
      entry.ref,
      entry.sha256,
    ]),
  );
  const compileSpec = {
    expectedArtifacts: ['Specialist contract evidence'],
    stopConditions: ['Stop before persistence or execution'],
    targetPathAllowlist: ['src/runtime/runtime-service.js'],
    verificationCommands: ['node --check src/runtime/runtime-service.js'],
  };
  const specialistSpec = {
    batchDeadlineMs: 120000,
    cells: [
      {
        agentProfileId: 'agent-researcher',
        cellDeadlineMs: 60000,
        cellId: 'research-source-evidence',
        evidenceMode: 'source-evidence-summary',
        inputPaths: ['README.md', 'README-alias.md'],
        maxAttempts: 1,
        retryAllowed: false,
      },
      {
        agentProfileId: 'agent-qa',
        cellDeadlineMs: 60000,
        cellId: 'verify-plan-evidence',
        evidenceMode: 'node-check-plan',
        inputPaths: ['src/runtime/runtime-service.js'],
        maxAttempts: 1,
        retryAllowed: false,
      },
    ],
    maxConcurrentCells: 2,
    maxProviderCalls: 0,
  };
  return {
    councilSessionId: councilSession.id,
    compileSpec,
    evaluatedAt,
    sourceRefs: {
      blueprintDigest: snapshot.companyRuntime.blueprintDigest,
      councilSessionSourceDigest: councilSession.sourceDigest,
      councilSynthesisDigest: digestCanonical(currentAttempt.synthesis),
      currentAttemptId: currentAttempt.id,
      missionId: context.mission.id,
      projectId: context.project.id,
      qaRoleSourceDigest: roleDigests.get('company/roles/qa.md'),
      researcherRoleSourceDigest: roleDigests.get('company/roles/researcher.md'),
      staffingEntryId: context.staffingEntry.id,
      staffingEntryRecordDigest: context.staffingEntry.recordDigest,
      staffingPlanId: context.staffingPlan.id,
      staffingPlanRecordDigest: context.staffingPlan.recordDigest,
    },
    specialistSpec,
    ...overrides,
  };
}

function assertExactKeys(value, expected) {
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort());
}

function captureError(operation, pattern) {
  try {
    operation();
  } catch (error) {
    assert.match(error.message, pattern);
    return error;
  }
  assert.fail(`Expected operation to throw ${pattern}`);
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`UI server exited early: ${output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch {
      // Server startup is still in progress.
    }
    await delay(50);
  }
  throw new Error(`UI server did not start: ${output}`);
}

async function requestApi(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

async function main() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(projectPath, { recursive: true });
  fs.cpSync(path.join(repoRoot, 'company'), path.join(tempRoot, 'company'), {
    recursive: true,
  });
  for (const sourceRef of [
    'docs/48_ai-company-master-plan.md',
    'docs/49_agent-runtime-contract.md',
    'docs/52_ai-company-runtime-blueprint-implementation-plan.md',
  ]) {
    const targetPath = path.join(tempRoot, sourceRef);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, sourceRef), targetPath);
  }
  writeProjectFixture();
  const context = seedBoundCouncil();
  const request = buildRequest(context);
  const stateBytes = fs.readFileSync(statePath);

  const preview = context.runtime.previewCouncilSpecialistBatch(request);
  assertExactKeys(preview, [
    'blockedActions',
    'blueprintDigest',
    'cells',
    'compileSpecDigest',
    'councilSessionId',
    'councilSessionSourceDigest',
    'councilSynthesisDigest',
    'currentAttemptId',
    'deadline',
    'evaluatedAt',
    'executionAllowed',
    'id',
    'maxConcurrentCells',
    'maxProviderCalls',
    'missionId',
    'persisted',
    'persistenceAllowed',
    'previewDigest',
    'projectId',
    'roleSourceDigests',
    'schemaVersion',
    'sourceDigest',
    'sourceRefs',
    'specialistSpecDigest',
    'staffingEntryId',
    'staffingEntryRecordDigest',
    'staffingPlanId',
    'staffingPlanRecordDigest',
    'status',
  ]);
  assert.deepEqual(
    preview.cells.map((cell) => cell.cellId),
    ['research-source-evidence', 'verify-plan-evidence'],
  );
  assert.deepEqual(
    preview.cells.map((cell) => cell.role),
    ['researcher', 'qa'],
  );
  for (const cell of preview.cells) {
    assertExactKeys(cell, [
      'agentProfileId',
      'cellDeadlineMs',
      'cellId',
      'cellSpecDigest',
      'dependencies',
      'evidenceMode',
      'inputPathDigests',
      'maxAttempts',
      'position',
      'retryAllowed',
      'role',
      'status',
      'targetPaths',
    ]);
    assert.equal(cell.status, 'contract-ready');
    assert.deepEqual(cell.dependencies, []);
    assert.deepEqual(cell.targetPaths, []);
    assert.equal(Object.isFrozen(cell), true);
  }
  assert.deepEqual(preview.blockedActions, [...BLOCKED_ACTIONS]);
  assert.deepEqual(Object.keys(preview.deadline).sort(), [
    'batchDeadlineMs',
    'deadlineAt',
  ]);
  assert.equal(
    preview.deadline.deadlineAt,
    new Date(Date.parse(request.evaluatedAt) + 120000).toISOString(),
  );
  assert.equal(preview.executionAllowed, false);
  assert.equal(preview.persistenceAllowed, false);
  assert.equal(preview.persisted, false);
  assert.equal(preview.maxConcurrentCells, 2);
  assert.equal(preview.maxProviderCalls, 0);
  assert.equal(Object.isFrozen(preview), true);
  assert.match(preview.id, /^specialist-batch-preview-[a-f0-9]{16}$/);
  assert.match(preview.previewDigest, /^[a-f0-9]{64}$/);
  assert.deepEqual(
    context.runtime.previewCouncilSpecialistBatch(request),
    preview,
  );
  const changedTimeRequest = buildRequest(
    context,
    new Date(Date.parse(request.evaluatedAt) + 1).toISOString(),
  );
  assert.notEqual(
    context.runtime.previewCouncilSpecialistBatch(changedTimeRequest).id,
    preview.id,
  );
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  const specialistSnapshot = context.runtime.getSnapshot();
  assert.equal(specialistSnapshot.schemaVersion, 25);
  assert.equal(Object.hasOwn(specialistSnapshot, 'specialistBatches'), false);
  assert.equal(Object.hasOwn(specialistSnapshot, 'specialistCellAttempts'), false);
  assert.equal(
    Object.hasOwn(specialistSnapshot, 'specialistBatchPreviews'),
    false,
  );
  const synthesisDigestEvidence =
    specialistSnapshot.companyRuntime.councilSynthesisDigests.find(
      (entry) => entry.councilSessionId === context.councilSessionId,
    );
  assertExactKeys(synthesisDigestEvidence, [
    'councilSessionId',
    'currentAttemptId',
    'sha256',
  ]);
  assert.equal(
    synthesisDigestEvidence.currentAttemptId,
    request.sourceRefs.currentAttemptId,
  );
  assert.equal(
    synthesisDigestEvidence.sha256,
    request.sourceRefs.councilSynthesisDigest,
  );
  assert.equal(Object.hasOwn(synthesisDigestEvidence, 'synthesis'), false);

  const staleError = captureError(
    () =>
      context.runtime.previewCouncilSpecialistBatch(
        buildRequest(context, request.evaluatedAt, {
          sourceRefs: {
            ...request.sourceRefs,
            councilSynthesisDigest: '0'.repeat(64),
          },
        }),
      ),
    /sourceRefs\.councilSynthesisDigest is stale/,
  );
  assert.equal(staleError.statusCode, 409);
  const missingRequest = buildRequest(context);
  missingRequest.specialistSpec.cells[0].inputPaths = ['missing.md'];
  const missingError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(missingRequest),
    /input file not found/,
  );
  assert.equal(missingError.statusCode, 404);
  const invalidPathRequest = buildRequest(context);
  invalidPathRequest.specialistSpec.cells[0].inputPaths = ['..\\outside.md'];
  assert.throws(
    () => context.runtime.previewCouncilSpecialistBatch(invalidPathRequest),
    /literal project-relative POSIX path/,
  );
  const extraFieldError = captureError(
    () =>
      context.runtime.previewCouncilSpecialistBatch({
        ...request,
        rawBody: 'forbidden',
      }),
    /unexpected or missing fields/,
  );
  assert.equal(extraFieldError.statusCode, 400);
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);

  const directoryPath = path.join(projectPath, 'source-directory');
  fs.mkdirSync(directoryPath);
  const directoryRequest = buildRequest(context);
  directoryRequest.specialistSpec.cells[0].inputPaths = ['source-directory'];
  const directoryError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(directoryRequest),
    /must resolve to a file/,
  );
  assert.equal(directoryError.statusCode, 404);

  const outsidePath = path.join(tempRoot, 'outside-source.txt');
  const escapingLinkPath = path.join(projectPath, 'escaping-source.txt');
  fs.writeFileSync(outsidePath, 'outside\n');
  fs.symlinkSync(outsidePath, escapingLinkPath);
  const escapingRequest = buildRequest(context);
  escapingRequest.specialistSpec.cells[0].inputPaths = ['escaping-source.txt'];
  const escapingError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(escapingRequest),
    /escapes project root/,
  );
  assert.equal(escapingError.statusCode, 400);
  fs.rmSync(escapingLinkPath);
  fs.rmSync(outsidePath);
  fs.rmSync(directoryPath, { recursive: true });
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);

  const researcherRolePath = path.join(
    tempRoot,
    'company',
    'roles',
    'researcher.md',
  );
  const researcherRoleBytes = fs.readFileSync(researcherRolePath);
  fs.appendFileSync(researcherRolePath, '\nsource drift\n');
  const roleDriftError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(request),
    /CompanyBlueprint or role sources are stale/,
  );
  assert.equal(roleDriftError.statusCode, 409);
  fs.writeFileSync(researcherRolePath, researcherRoleBytes);

  const synthesisDriftState = JSON.parse(stateBytes.toString('utf8'));
  const synthesisDriftSession =
    synthesisDriftState.councilSessions[context.councilSessionId];
  const synthesisDriftAttempt = synthesisDriftSession.attempts.find(
    (attempt) => attempt.id === synthesisDriftSession.currentAttemptId,
  );
  synthesisDriftAttempt.synthesis = {
    ...synthesisDriftAttempt.synthesis,
    recommendation: 'Drifted synthesis must invalidate the preview.',
  };
  fs.writeFileSync(statePath, `${JSON.stringify(synthesisDriftState, null, 2)}\n`);
  const synthesisDriftError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(request),
    /sourceRefs\.councilSynthesisDigest is stale/,
  );
  assert.equal(synthesisDriftError.statusCode, 409);
  fs.writeFileSync(statePath, stateBytes);

  const largePath = path.join(projectPath, 'large.txt');
  fs.writeFileSync(largePath, Buffer.alloc(1024 * 1024 + 1, 1));
  const largeRequest = buildRequest(context);
  largeRequest.specialistSpec.cells[0].inputPaths = ['large.txt'];
  const originalReadFileSync = fs.readFileSync;
  let oversizedFileRead = false;
  fs.readFileSync = (...args) => {
    if (path.resolve(String(args[0])) === path.resolve(largePath)) {
      oversizedFileRead = true;
    }
    return originalReadFileSync(...args);
  };
  let largeError;
  try {
    largeError = captureError(
      () => context.runtime.previewCouncilSpecialistBatch(largeRequest),
      /exceeds 1048576 bytes/,
    );
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
  assert.equal(largeError.statusCode, 413);
  assert.equal(oversizedFileRead, false);
  fs.rmSync(largePath);
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);

  const sharedLargePath = path.join(projectPath, 'shared-large.txt');
  fs.writeFileSync(sharedLargePath, Buffer.alloc(1024 * 1024, 2));
  const aliasPaths = Array.from(
    { length: 9 },
    (_, index) => `shared-large-${index}.txt`,
  );
  for (const aliasPath of aliasPaths) {
    fs.symlinkSync(sharedLargePath, path.join(projectPath, aliasPath));
  }
  const aliasRequest = buildRequest(context);
  aliasRequest.specialistSpec.cells[0].inputPaths = aliasPaths;
  const aliasPreview =
    context.runtime.previewCouncilSpecialistBatch(aliasRequest);
  assert.equal(
    aliasPreview.cells.flatMap((cell) => cell.inputPathDigests).length,
    10,
  );
  for (const aliasPath of aliasPaths) {
    fs.rmSync(path.join(projectPath, aliasPath));
  }
  fs.rmSync(sharedLargePath);

  const aggregatePaths = Array.from(
    { length: 9 },
    (_, index) => `aggregate-${index}.txt`,
  );
  for (const aggregatePath of aggregatePaths) {
    fs.writeFileSync(
      path.join(projectPath, aggregatePath),
      Buffer.alloc(1024 * 1024, 3),
    );
  }
  const aggregateRequest = buildRequest(context);
  aggregateRequest.specialistSpec.cells[0].inputPaths = aggregatePaths;
  const aggregateError = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(aggregateRequest),
    /exceed 8388608 aggregate bytes/,
  );
  assert.equal(aggregateError.statusCode, 413);
  for (const aggregatePath of aggregatePaths) {
    fs.rmSync(path.join(projectPath, aggregatePath));
  }
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);

  const child = spawn(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      '--port',
      String(port),
      '--runtime-root',
      runtimeRoot,
    ],
    { cwd: repoRoot, env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  try {
    await waitForServer(child);
    const pathname =
      `/api/council-sessions/${encodeURIComponent(context.councilSessionId)}` +
      '/specialist-batch-preview';
    const body = {
      compileSpec: request.compileSpec,
      evaluatedAt: request.evaluatedAt,
      sourceRefs: request.sourceRefs,
      specialistSpec: request.specialistSpec,
    };
    const success = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal(success.response.status, 200);
    assertExactKeys(success.payload, ['generatedAt', 'specialistBatchPreview']);
    assert.deepEqual(success.payload.specialistBatchPreview, preview);
    assert.equal(Object.hasOwn(success.payload, 'snapshot'), false);
    assert.equal(Object.hasOwn(success.payload, 'providerEvidence'), false);
    assert.deepEqual(fs.readFileSync(statePath), stateBytes);

    const exactLimitJson = JSON.stringify(body);
    const exactLimitBody =
      exactLimitJson +
      ' '.repeat(65536 - Buffer.byteLength(exactLimitJson));
    assert.equal(Buffer.byteLength(exactLimitBody), 65536);
    const exactLimit = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: exactLimitBody,
    });
    assert.equal(exactLimit.response.status, 200);
    assertExactKeys(exactLimit.payload, [
      'generatedAt',
      'specialistBatchPreview',
    ]);

    const invalidJson = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"compileSpec":',
    });
    assert.equal(invalidJson.response.status, 400);
    assertExactKeys(invalidJson.payload, ['error']);

    const malformed = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, rawBody: 'forbidden' }),
    });
    assert.equal(malformed.response.status, 400);
    assertExactKeys(malformed.payload, ['error']);

    const missing = await requestApi(
      '/api/council-sessions/missing/specialist-batch-preview',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    assert.equal(missing.response.status, 404);
    assertExactKeys(missing.payload, ['error']);

    const stale = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        sourceRefs: {
          ...body.sourceRefs,
          staffingPlanRecordDigest: '0'.repeat(64),
        },
      }),
    });
    assert.equal(stale.response.status, 409);
    assertExactKeys(stale.payload, ['error']);

    const oversized = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(65536) }),
    });
    assert.equal(oversized.response.status, 413);
    assertExactKeys(oversized.payload, ['error']);

    const unsupported = await requestApi(pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
    });
    assert.equal(unsupported.response.status, 415);
    assertExactKeys(unsupported.payload, ['error']);
    assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  } finally {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      delay(2000),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }

  const workOrderPreview = context.runtime.previewMissionWorkOrders({
    councilSessionId: context.councilSessionId,
    compileSpec: request.compileSpec,
  });
  context.runtime.persistMissionWorkOrderPlan({
    councilSessionId: context.councilSessionId,
    compileSpec: request.compileSpec,
    previewId: workOrderPreview.previewId,
    sourceDigest: workOrderPreview.sourceDigest,
  });
  const persistedConflict = captureError(
    () => context.runtime.previewCouncilSpecialistBatch(request),
    /Mission lifecycle|already has ExecutionPlan/,
  );
  assert.equal(persistedConflict.statusCode, 409);

  const directInputPathDigests = preview.cells
    .flatMap((cell) => cell.inputPathDigests)
    .filter(
      (entry, index, entries) =>
        entries.findIndex((candidate) => candidate.path === entry.path) ===
        index,
    );
  const directRealTargets = new Set(
    request.specialistSpec.cells
      .flatMap((cell) => cell.inputPaths)
      .map((inputPath) =>
        fs.realpathSync(path.join(projectPath, inputPath))),
  );
  const directInputTotalByteLength = [...directRealTargets].reduce(
    (total, inputPath) => total + fs.statSync(inputPath).size,
    0,
  );
  const direct = buildSpecialistBatchPreview(
    {
      compileSpec: request.compileSpec,
      evaluatedAt: request.evaluatedAt,
      sourceRefs: request.sourceRefs,
      specialistSpec: request.specialistSpec,
    },
    {
      alignmentDecidedAt:
        context.runtime.getCouncilSession(context.councilSessionId).alignment.decidedAt,
      blueprintDigest: request.sourceRefs.blueprintDigest,
      councilSessionId: context.councilSessionId,
      councilSessionSourceDigest: request.sourceRefs.councilSessionSourceDigest,
      councilSynthesis:
        context.runtime.getCouncilSession(context.councilSessionId).attempts.find(
          (attempt) => attempt.id === request.sourceRefs.currentAttemptId,
        ).synthesis,
      currentAttemptId: request.sourceRefs.currentAttemptId,
      inputPathDigests: directInputPathDigests,
      inputTotalByteLength: directInputTotalByteLength,
      missionId: context.mission.id,
      projectId: context.project.id,
      roleSourceDigests: preview.roleSourceDigests,
      staffingEntryId: context.staffingEntry.id,
      staffingEntryRecordDigest: context.staffingEntry.recordDigest,
      staffingPlanId: context.staffingPlan.id,
      staffingPlanRecordDigest: context.staffingPlan.recordDigest,
    },
    { now: request.evaluatedAt },
  );
  assert.deepEqual(direct, preview);
  if (keepFixture) {
    fs.writeFileSync(statePath, stateBytes);
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: MODE,
        schemaVersion: 23,
        previewId: preview.id,
        cells: preview.cells.map((cell) => cell.cellId),
        stateUnchanged: true,
        httpStatuses: [200, 400, 404, 409, 413, 415],
      },
      null,
      2,
    )}\n`,
  );
}

try {
  await main();
} finally {
  if (!keepFixture) {
    fs.rmSync(tempRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 50,
    });
  }
}
