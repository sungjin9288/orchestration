import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import specialistPreviewModule from '../src/runtime/specialist-batch-preview.js';
import specialistCellAttemptModule from '../src/runtime/specialist-cell-attempts.js';
import researcherRunnerModule from '../src/execution/specialist-researcher-local-runner.js';
import qaRunnerModule from '../src/execution/qa-node-check-runner.js';
import specialistCoordinatorModule from '../src/execution/specialist-batch-coordinator.js';
import fileStoreModule from '../src/runtime/file-store.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeModule;
const { digestCanonical } = specialistPreviewModule;
const { normalizeResultSummary } = specialistCellAttemptModule;
const { runSpecialistResearcherLocal } = researcherRunnerModule;
const {
  captureBoundedSpecialistInputEvidence,
  runSpecialistSourceBoundNodeChecks,
} = qaRunnerModule;
const {
  createFailureIsolatedSettlementQueue,
  normalizeWorkerOutcome,
} = specialistCoordinatorModule;
const { StateConflictError } = fileStoreModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(
  repoRoot,
  'var',
  'runtime-ai-company-durable-specialist-batch-smoke',
);
const blueprintPath = path.join(tempRoot, 'company', 'blueprint.json');
const runtimeRoot = path.join(tempRoot, 'runtime');
const apiRuntimeRoot = path.join(tempRoot, 'api-runtime');
const projectPath = path.join(tempRoot, 'project');
const statePath = path.join(runtimeRoot, 'state.json');
const port = 9990 + (process.pid % 10);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ai-company-durable-specialist-batch-smoke';
const keepFixture =
  process.env.ORCHESTRATION_DURABLE_SPECIALIST_BATCH_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'durable-specialist-batch-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function writeFixtureSources() {
  const files = {
    'README.md': '# Durable specialist source fixture\n',
    'src/runtime/runtime-service.js':
      "'use strict';\n\nmodule.exports = { durableSpecialistBatch: true };\n",
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }
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
    selectionRationale: 'Bind one local Council before the specialist batch.',
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

function seedBoundCouncil(runtimeOptions = {}) {
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
    councilAdapter: createResolvedCouncilAdapter(),
    councilLiveAdapter: {
      executePosition() {
        throw new Error('Durable SpecialistBatch must not call a live provider');
      },
      executeSynthesis() {
        throw new Error('Durable SpecialistBatch must not call a live provider');
      },
    },
    ...runtimeOptions,
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name: 'Durable specialist batch',
    projectPath,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Run two fixed read-only specialists',
    goal: 'Persist exact Researcher and QA evidence.',
    constraints:
      'No provider, retry, recovery, result application, source mutation, or Git.',
  });
  const staffingSpec = createStaffingSpec();
  const evaluatedAt = new Date().toISOString();
  const preview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const staffingPlan = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    sourceDigest: preview.sourceDigest,
    missionDigest: preview.missionDigest,
    blueprintDigest: preview.blueprintDigest,
    staffingSpecDigest: preview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept the exact Council staffing source.',
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
      rationale: 'Bind the accepted plan to one local Council.',
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

function downgradeStateToV19(targetStatePath = statePath) {
  const state = JSON.parse(fs.readFileSync(targetStatePath, 'utf8'));
  state.schemaVersion = 19;
  delete state.sequences.specialistBatch;
  delete state.sequences.specialistCellAttempt;
  delete state.sequences.specialistCellRetry;
  delete state.sequences.reworkPlan;
  delete state.specialistBatches;
  delete state.specialistCellAttempts;
  delete state.specialistCellRetries;
  delete state.reworkPlans;
  fs.writeFileSync(targetStatePath, `${JSON.stringify(state, null, 2)}\n`);
}

function buildPreviewRequest(context) {
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
  return {
    councilSessionId: councilSession.id,
    compileSpec: {
      expectedArtifacts: ['Durable specialist evidence'],
      stopConditions: ['Stop after exact durable inspection'],
      targetPathAllowlist: ['src/runtime/runtime-service.js'],
      verificationCommands: ['node --check src/runtime/runtime-service.js'],
    },
    evaluatedAt: new Date().toISOString(),
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
    specialistSpec: {
      batchDeadlineMs: 120000,
      cells: [
        {
          agentProfileId: 'agent-researcher',
          cellDeadlineMs: 60000,
          cellId: 'research-source-evidence',
          evidenceMode: 'source-evidence-summary',
          inputPaths: ['README.md'],
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
    },
  };
}

function buildStartRequest(previewRequest, preview, reviewedAt = new Date().toISOString()) {
  return {
    ...previewRequest,
    executionApproval: {
      decision: 'start-first-attempt',
      acknowledgement: 'execute-exact-readonly-specialist-batch-once',
      rationale: 'Run the exact local read-only first attempt once.',
      reviewedAt,
    },
    previewDigest: preview.previewDigest,
    previewId: preview.id,
    sourceDigest: preview.sourceDigest,
  };
}

function completedResearcherOutcome(cellAttempt) {
  return {
    status: 'completed',
    observedInputDigest: cellAttempt.inputDigest,
    resultSummary: {
      kind: 'source-evidence-manifest',
      files: cellAttempt.inputPathDigests,
      totalByteLength: cellAttempt.inputPathDigests.reduce(
        (total, entry) => total + entry.byteLength,
        0,
      ),
    },
  };
}

function completedQaOutcome(inputDigest, inputPathDigests) {
  return {
    observedInputDigest: inputDigest,
    resultSummary: {
      kind: 'node-syntax-check',
      checks: inputPathDigests.map((entry) => ({
        relativePath: entry.path,
        exitCode: 0,
        timedOut: false,
        truncated: false,
        passed: true,
        stdoutDigest: digestCanonical(''),
        stderrDigest: digestCanonical(''),
      })),
      mutationDetected: false,
      verdict: 'passed',
    },
  };
}

async function startScenario(name, runtimeOptions = {}) {
  const scenarioRuntimeRoot = path.join(tempRoot, name);
  const context = seedBoundCouncil({
    runtimeRoot: scenarioRuntimeRoot,
    ...runtimeOptions,
  });
  const scenarioStatePath = path.join(scenarioRuntimeRoot, 'state.json');
  downgradeStateToV19(scenarioStatePath);
  const previewRequest = buildPreviewRequest(context);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const startRequest = buildStartRequest(previewRequest, preview);
  return {
    context,
    preview,
    previewRequest,
    scenarioRuntimeRoot,
    scenarioStatePath,
    startRequest,
  };
}

async function waitFor(predicate, label) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error(`Timed out waiting for ${label}`);
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
      // The bounded local server is still starting.
    }
    await delay(50);
  }
  throw new Error(`UI server did not start: ${output}`);
}

async function requestApi(pathname, options = {}) {
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
  writeFixtureSources();

  const workerStarts = [];
  let releaseWorkers;
  const workerGate = new Promise((resolve) => {
    releaseWorkers = resolve;
  });
  const assertActiveSave = () => {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(state.schemaVersion, 29);
    assert.equal(Object.keys(state.specialistBatches).length, 1);
    assert.deepEqual(
      Object.values(state.specialistCellAttempts).map((attempt) => attempt.status),
      ['active', 'active'],
    );
  };
  const context = seedBoundCouncil({
    specialistResearcherRunner: async ({ cellAttempt }) => {
      workerStarts.push('researcher');
      assertActiveSave();
      await workerGate;
      return {
        status: 'completed',
        observedInputDigest: cellAttempt.inputDigest,
        resultSummary: {
          kind: 'source-evidence-manifest',
          files: cellAttempt.inputPathDigests,
          totalByteLength: cellAttempt.inputPathDigests.reduce(
            (total, entry) => total + entry.byteLength,
            0,
          ),
        },
      };
    },
    specialistQaRunner: async ({ inputDigest, inputPathDigests }) => {
      workerStarts.push('qa');
      assertActiveSave();
      await workerGate;
      return {
        observedInputDigest: inputDigest,
        resultSummary: {
          kind: 'node-syntax-check',
          checks: [
            {
              relativePath: inputPathDigests[0].path,
              exitCode: 0,
              timedOut: false,
              truncated: false,
              passed: true,
              stdoutDigest: digestCanonical(''),
              stderrDigest: digestCanonical(''),
            },
          ],
          mutationDetected: false,
          verdict: 'passed',
        },
      };
    },
  });
  downgradeStateToV19();
  const previewRequest = buildPreviewRequest(context);
  const v19Bytes = fs.readFileSync(statePath);
  const preview = context.runtime.previewCouncilSpecialistBatch(previewRequest);
  const publicSnapshot = context.runtime.getSnapshot();
  assert.deepEqual(fs.readFileSync(statePath), v19Bytes);
  assert.equal(Object.hasOwn(publicSnapshot, 'specialistBatches'), false);
  assert.equal(Object.hasOwn(publicSnapshot, 'specialistCellAttempts'), false);
  assert.equal(Object.hasOwn(publicSnapshot, 'specialistCellRetries'), false);

  const invalidRequest = buildStartRequest(previewRequest, preview);
  invalidRequest.extra = true;
  await assert.rejects(
    context.runtime.startCouncilSpecialistBatch(invalidRequest),
    /unexpected or missing fields/,
  );
  assert.deepEqual(fs.readFileSync(statePath), v19Bytes);

  const startRequest = buildStartRequest(previewRequest, preview);
  fs.cpSync(runtimeRoot, apiRuntimeRoot, { recursive: true });
  const apiChild = spawn(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      '--port',
      String(port),
      '--runtime-root',
      apiRuntimeRoot,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  try {
    await waitForServer(apiChild);
    const { councilSessionId: _councilSessionId, ...apiStartBody } = startRequest;
    const unsupportedContent = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify(apiStartBody),
      },
    );
    assert.equal(unsupportedContent.response.status, 415);
    assert.deepEqual(Object.keys(unsupportedContent.payload), ['error']);
    const malformedShape = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...apiStartBody, extra: true }),
      },
    );
    assert.equal(malformedShape.response.status, 400);
    assert.deepEqual(Object.keys(malformedShape.payload), ['error']);
    const oversized = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ oversized: 'x'.repeat(70 * 1024) }),
      },
    );
    assert.equal(oversized.response.status, 413);
    assert.deepEqual(Object.keys(oversized.payload), ['error']);
    const apiCreate = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(apiStartBody),
      },
    );
    assert.equal(apiCreate.response.status, 201);
    assert.deepEqual(Object.keys(apiCreate.payload).sort(), [
      'generatedAt',
      'idempotent',
      'specialistBatch',
      'specialistCellAttempts',
    ]);
    assert.equal(apiCreate.payload.idempotent, false);
    const apiReplay = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(apiStartBody),
      },
    );
    assert.equal(apiReplay.response.status, 200);
    assert.equal(apiReplay.payload.idempotent, true);
    assert.equal(
      apiReplay.payload.specialistBatch.id,
      apiCreate.payload.specialistBatch.id,
    );
    const divergentReplay = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batches`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...apiStartBody,
          executionApproval: {
            ...apiStartBody.executionApproval,
            rationale: 'Divergent replay must fail closed.',
          },
        }),
      },
    );
    assert.equal(divergentReplay.response.status, 409);
    assert.deepEqual(Object.keys(divergentReplay.payload), ['error']);
    const missingExact = await requestApi(
      '/api/specialist-batches/specialist-batch-9999',
    );
    assert.equal(missingExact.response.status, 404);
    assert.deepEqual(Object.keys(missingExact.payload), ['error']);
  } finally {
    apiChild.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => apiChild.once('exit', resolve)),
      delay(1000),
    ]);
    if (apiChild.exitCode === null) apiChild.kill('SIGKILL');
  }

  const startPromise = context.runtime.startCouncilSpecialistBatch(startRequest);
  await waitFor(() => workerStarts.length === 2, 'both specialist workers');
  assert.deepEqual([...workerStarts].sort(), ['qa', 'researcher']);
  assertActiveSave();
  releaseWorkers();
  const created = await startPromise;
  assert.equal(created.idempotent, false);
  assert.equal(created.specialistBatch.status, 'completed');
  assert.deepEqual(
    created.specialistCellAttempts.map((attempt) => attempt.status),
    ['completed', 'completed'],
  );
  assert.deepEqual(
    created.specialistCellAttempts.map((attempt) => attempt.observedInputDigest),
    created.specialistCellAttempts.map((attempt) => attempt.inputDigest),
  );
  assert.equal(workerStarts.length, 2);

  const researcherEvidence = await runSpecialistResearcherLocal({
    projectRoot: projectPath,
    cellAttempt: created.specialistCellAttempts[0],
    batchDeadlineAt: created.specialistBatch.deadlineAt,
  });
  assert.equal(researcherEvidence.status, 'completed');
  assert.equal(
    researcherEvidence.observedInputDigest,
    created.specialistCellAttempts[0].inputDigest,
  );
  const qaEvidence = await runSpecialistSourceBoundNodeChecks({
    projectRoot: projectPath,
    inputPathDigests: created.specialistCellAttempts[1].inputPathDigests,
    deadlineAt: created.specialistCellAttempts[1].deadlineAt,
    commands: previewRequest.compileSpec.verificationCommands,
    targetPathAllowlist: previewRequest.compileSpec.targetPathAllowlist,
  });
  assert.equal(qaEvidence.resultSummary.verdict, 'passed');
  assert.equal(
    qaEvidence.observedInputDigest,
    created.specialistCellAttempts[1].inputDigest,
  );
  assert.throws(
    () =>
      normalizeResultSummary({
        kind: 'node-syntax-check',
        checks: [
          {
            relativePath: 'src/runtime/runtime-service.js',
            exitCode: 1,
            timedOut: false,
            truncated: false,
            passed: true,
            stdoutDigest: digestCanonical(''),
            stderrDigest: digestCanonical(''),
          },
        ],
        mutationDetected: false,
        verdict: 'passed',
      }),
    /contradicts/,
  );
  const researcherAttempt = created.specialistCellAttempts[0];
  const qaAttempt = created.specialistCellAttempts[1];
  const wrongResearcherKind = normalizeWorkerOutcome(
    {
      status: 'completed',
      ...completedQaOutcome(
        researcherAttempt.inputDigest,
        researcherAttempt.inputPathDigests,
      ),
    },
    researcherAttempt,
  );
  assert.deepEqual(wrongResearcherKind, {
    status: 'failed',
    observedInputDigest: null,
    failureReason: 'runner-contract-failed',
  });
  const mismatchedResearcherManifest = normalizeWorkerOutcome(
    {
      status: 'completed',
      observedInputDigest: researcherAttempt.inputDigest,
      resultSummary: {
        ...completedResearcherOutcome(researcherAttempt).resultSummary,
        files: qaAttempt.inputPathDigests,
      },
    },
    researcherAttempt,
  );
  assert.equal(mismatchedResearcherManifest.status, 'failed');
  assert.equal(
    mismatchedResearcherManifest.failureReason,
    'runner-contract-failed',
  );
  const qaOutsidePath = normalizeWorkerOutcome(
    {
      status: 'completed',
      ...completedQaOutcome(
        qaAttempt.inputDigest,
        researcherAttempt.inputPathDigests,
      ),
    },
    qaAttempt,
  );
  assert.equal(qaOutsidePath.status, 'failed');
  assert.equal(qaOutsidePath.failureReason, 'runner-contract-failed');
  const injectedClockEvidence = await runSpecialistSourceBoundNodeChecks(
    {
      projectRoot: projectPath,
      inputPathDigests: created.specialistCellAttempts[1].inputPathDigests,
      deadlineAt: '2020-01-02T00:00:00.000Z',
      commands: previewRequest.compileSpec.verificationCommands,
      targetPathAllowlist: previewRequest.compileSpec.targetPathAllowlist,
    },
    { now: () => Date.parse('2020-01-01T00:00:00.000Z') },
  );
  assert.equal(injectedClockEvidence.resultSummary.verdict, 'passed');

  const insideAliasTarget = path.join(projectPath, 'src', 'runtime', 'alias-target.js');
  const aliasPath = path.join(projectPath, 'src', 'runtime', 'alias.js');
  const outsideAliasTarget = path.join(tempRoot, 'outside-alias-target.js');
  const insideAliasBytes = Buffer.from("'use strict';\nmodule.exports = true;\n");
  fs.writeFileSync(insideAliasTarget, insideAliasBytes);
  fs.writeFileSync(outsideAliasTarget, "'use strict';\nprocess.exit(7);\n");
  fs.symlinkSync('alias-target.js', aliasPath);
  let observedQaArgs = null;
  await assert.rejects(
    runSpecialistSourceBoundNodeChecks(
      {
        projectRoot: projectPath,
        inputPathDigests: [
          {
            byteLength: insideAliasBytes.byteLength,
            path: 'src/runtime/alias.js',
            sha256: crypto.createHash('sha256').update(insideAliasBytes).digest('hex'),
          },
        ],
        deadlineAt: new Date(Date.now() + 10_000).toISOString(),
        commands: ['node --check src/runtime/alias.js'],
        targetPathAllowlist: ['src/runtime/alias.js'],
      },
      {
        spawnImpl(command, args, options) {
          observedQaArgs = args;
          fs.unlinkSync(aliasPath);
          fs.symlinkSync(outsideAliasTarget, aliasPath);
          return spawn(command, args, options);
        },
      },
    ),
    (error) => error.code === 'source-unavailable-after-start',
  );
  assert.deepEqual(observedQaArgs, ['--check', '-']);
  fs.rmSync(aliasPath);
  fs.rmSync(insideAliasTarget);
  fs.rmSync(outsideAliasTarget);

  const readmePath = path.join(projectPath, 'README.md');
  const researcherRaceBackup = `${readmePath}.race-backup`;
  const researcherOutsidePath = path.join(tempRoot, 'researcher-outside.txt');
  fs.writeFileSync(researcherOutsidePath, 'outside researcher bytes\n');
  const originalOpenSync = fs.openSync;
  let researcherTargetSwapped = false;
  fs.openSync = function guardedOpenSync(target, ...args) {
    if (
      !researcherTargetSwapped &&
      path.resolve(String(target)) === readmePath
    ) {
      fs.renameSync(readmePath, researcherRaceBackup);
      fs.symlinkSync(researcherOutsidePath, readmePath);
      researcherTargetSwapped = true;
    }
    return originalOpenSync.call(fs, target, ...args);
  };
  try {
    const racedResearcher = await runSpecialistResearcherLocal({
      projectRoot: projectPath,
      cellAttempt: researcherAttempt,
      batchDeadlineAt: created.specialistBatch.deadlineAt,
    });
    assert.equal(racedResearcher.status, 'failed');
    assert.equal(
      racedResearcher.failureReason,
      'source-unavailable-after-start',
    );
  } finally {
    fs.openSync = originalOpenSync;
    if (fs.lstatSync(readmePath).isSymbolicLink()) fs.unlinkSync(readmePath);
    fs.renameSync(researcherRaceBackup, readmePath);
    fs.rmSync(researcherOutsidePath);
  }

  const qaRacePath = path.join(projectPath, 'src', 'runtime', 'qa-race.js');
  const qaRaceBackup = `${qaRacePath}.race-backup`;
  const qaOutsideFile = path.join(tempRoot, 'qa-outside.js');
  const qaRaceBytes = Buffer.from("'use strict';\nmodule.exports = 'inside';\n");
  fs.writeFileSync(qaRacePath, qaRaceBytes);
  fs.writeFileSync(qaOutsideFile, "'use strict';\nmodule.exports = 'outside';\n");
  const qaRaceEntry = {
    byteLength: qaRaceBytes.byteLength,
    path: 'src/runtime/qa-race.js',
    sha256: crypto.createHash('sha256').update(qaRaceBytes).digest('hex'),
  };
  let qaTargetSwapped = false;
  fs.openSync = function guardedOpenSync(target, ...args) {
    if (!qaTargetSwapped && path.resolve(String(target)) === qaRacePath) {
      fs.renameSync(qaRacePath, qaRaceBackup);
      fs.symlinkSync(qaOutsideFile, qaRacePath);
      qaTargetSwapped = true;
    }
    return originalOpenSync.call(fs, target, ...args);
  };
  try {
    assert.throws(
      () =>
        captureBoundedSpecialistInputEvidence(projectPath, [qaRaceEntry]),
      (error) => error.code === 'source-unavailable-after-start',
    );
  } finally {
    fs.openSync = originalOpenSync;
    if (fs.lstatSync(qaRacePath).isSymbolicLink()) fs.unlinkSync(qaRacePath);
    fs.renameSync(qaRaceBackup, qaRacePath);
    fs.rmSync(qaRacePath);
    fs.rmSync(qaOutsideFile);
  }

  const growingPath = path.join(projectPath, 'src', 'runtime', 'growing.js');
  const growingBytes = Buffer.from('12345678');
  fs.writeFileSync(growingPath, growingBytes);
  const growingEntry = {
    byteLength: growingBytes.byteLength,
    path: 'src/runtime/growing.js',
    sha256: crypto.createHash('sha256').update(growingBytes).digest('hex'),
  };
  const originalReadSync = fs.readSync;
  let sourceGrown = false;
  fs.readSync = function boundedReadSync(...args) {
    if (!sourceGrown) {
      fs.appendFileSync(growingPath, 'x'.repeat(32));
      sourceGrown = true;
    }
    return originalReadSync.apply(fs, args);
  };
  try {
    assert.throws(
      () =>
        captureBoundedSpecialistInputEvidence(projectPath, [growingEntry], {
          maxFileBytes: 16,
          maxTotalFileBytes: 16,
        }),
      (error) => error.code === 'source-byte-cap-exceeded-after-start',
    );
  } finally {
    fs.readSync = originalReadSync;
    fs.rmSync(growingPath);
  }

  const readmeBytes = fs.readFileSync(readmePath);
  fs.appendFileSync(readmePath, 'drift\n');
  const driftEvidence = await runSpecialistResearcherLocal({
    projectRoot: projectPath,
    cellAttempt: created.specialistCellAttempts[0],
    batchDeadlineAt: created.specialistBatch.deadlineAt,
  });
  assert.equal(driftEvidence.status, 'failed');
  assert.equal(driftEvidence.failureReason, 'source-drift-before-worker');
  fs.writeFileSync(readmePath, readmeBytes);

  const invalidJsPath = path.join(projectPath, 'src', 'runtime', 'invalid.js');
  const invalidJsBytes = Buffer.from("'use strict';\nconst = ;\n");
  fs.writeFileSync(invalidJsPath, invalidJsBytes);
  const invalidJsEvidence = {
    byteLength: invalidJsBytes.byteLength,
    path: 'src/runtime/invalid.js',
    sha256: crypto.createHash('sha256').update(invalidJsBytes).digest('hex'),
  };
  const invalidSyntaxEvidence = await runSpecialistSourceBoundNodeChecks({
    projectRoot: projectPath,
    inputPathDigests: [invalidJsEvidence],
    deadlineAt: new Date(Date.now() + 10000).toISOString(),
    commands: ['node --check src/runtime/invalid.js'],
    targetPathAllowlist: ['src/runtime/invalid.js'],
  });
  assert.equal(invalidSyntaxEvidence.resultSummary.verdict, 'failed');
  assert.equal(invalidSyntaxEvidence.resultSummary.checks[0].passed, false);
  await assert.rejects(
    runSpecialistSourceBoundNodeChecks(
      {
        projectRoot: projectPath,
        inputPathDigests: [invalidJsEvidence],
        deadlineAt: new Date(Date.now() + 10000).toISOString(),
        commands: ['node --check src/runtime/invalid.js'],
        targetPathAllowlist: ['src/runtime/invalid.js'],
      },
      { outputCapBytes: 1 },
    ),
    (error) => error.code === 'qa-output-cap-exceeded',
  );
  await assert.rejects(
    runSpecialistSourceBoundNodeChecks({
      projectRoot: projectPath,
      inputPathDigests: [invalidJsEvidence],
      deadlineAt: new Date(Date.now() - 1).toISOString(),
      commands: ['node --check src/runtime/invalid.js'],
      targetPathAllowlist: ['src/runtime/invalid.js'],
    }),
    (error) => error.code === 'deadline-expired-before-worker',
  );
  fs.rmSync(invalidJsPath);

  const settlementCalls = [];
  const settlementQueue = createFailureIsolatedSettlementQueue(async (value) => {
    settlementCalls.push(value);
    if (value === 'first') {
      throw new StateConflictError('synthetic first settlement conflict');
    }
    return value;
  });
  const isolatedSettlements = await Promise.allSettled([
    settlementQueue.enqueue('first'),
    settlementQueue.enqueue('second'),
  ]);
  await settlementQueue.drain();
  assert.deepEqual(
    isolatedSettlements.map((result) => result.status),
    ['rejected', 'fulfilled'],
  );
  assert.deepEqual(settlementCalls, ['first', 'second']);

  const replay = await context.runtime.startCouncilSpecialistBatch(startRequest);
  assert.equal(replay.idempotent, true);
  assert.equal(replay.specialistBatch.id, created.specialistBatch.id);
  assert.equal(workerStarts.length, 2);
  const exact = context.runtime.getSpecialistBatch(created.specialistBatch.id);
  assert.deepEqual(exact, {
    specialistBatch: created.specialistBatch,
    specialistCellAttempts: created.specialistCellAttempts,
  });
  const located = context.runtime.getCurrentCouncilSpecialistBatch({
    councilSessionId: preview.councilSessionId,
    currentAttemptId: preview.currentAttemptId,
    staffingEntryId: preview.staffingEntryId,
  });
  assert.equal(located.specialistBatch.id, created.specialistBatch.id);
  await assert.rejects(
    context.runtime.startCouncilSpecialistBatch({
      ...startRequest,
      executionApproval: {
        ...startRequest.executionApproval,
        rationale: 'A divergent approval must not start another attempt.',
      },
    }),
    /different first attempt/,
  );

  const child = spawn(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      '--port',
      String(port),
      '--runtime-root',
      runtimeRoot,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  try {
    await waitForServer(child);
    const exactResponse = await requestApi(
      `/api/specialist-batches/${encodeURIComponent(created.specialistBatch.id)}`,
    );
    assert.equal(exactResponse.response.status, 200);
    assert.deepEqual(Object.keys(exactResponse.payload).sort(), [
      'generatedAt',
      'specialistBatch',
      'specialistCellAttempts',
    ]);
    const locator = new URLSearchParams({
      currentAttemptId: preview.currentAttemptId,
      staffingEntryId: preview.staffingEntryId,
    });
    const locatorResponse = await requestApi(
      `/api/council-sessions/${encodeURIComponent(preview.councilSessionId)}/specialist-batch?${locator}`,
    );
    assert.equal(locatorResponse.response.status, 200);
    assert.equal(
      locatorResponse.payload.specialistBatch.id,
      created.specialistBatch.id,
    );
    const apiSnapshot = await requestApi('/api/snapshot');
    assert.equal(apiSnapshot.response.status, 200);
    assert.equal(
      Object.hasOwn(apiSnapshot.payload.snapshot, 'specialistBatches'),
      false,
    );
    assert.equal(
      Object.hasOwn(apiSnapshot.payload.snapshot, 'specialistCellAttempts'),
      false,
    );
  } finally {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => child.once('exit', resolve)),
      delay(1000),
    ]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }

  const partialScenario = await startScenario('runtime-partial-failed', {
    specialistResearcherRunner: async ({ cellAttempt }) =>
      completedResearcherOutcome(cellAttempt),
    specialistQaRunner: async () => {
      const error = new Error('synthetic bounded QA failure');
      error.code = 'qa-spawn-failed';
      throw error;
    },
  });
  const partialResult = await partialScenario.context.runtime.startCouncilSpecialistBatch(
    partialScenario.startRequest,
  );
  assert.equal(partialResult.specialistBatch.status, 'partial-failed');
  assert.deepEqual(
    partialResult.specialistCellAttempts.map((attempt) => attempt.status),
    ['completed', 'failed'],
  );
  const partialReload = createRuntimeService({
    runtimeRoot: partialScenario.scenarioRuntimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
  }).getSpecialistBatch(partialResult.specialistBatch.id);
  assert.equal(partialReload.specialistBatch.status, 'partial-failed');

  let delayedSettlementNow = Date.now() + 5_000;
  const delayedSettlementScenario = await startScenario(
    'runtime-delayed-second-settlement',
    {
      specialistNow: () => new Date(delayedSettlementNow),
      specialistBatchCoordinator: async ({ batch, cellAttempts, settle }) => {
        const [researcherCell, qaCell] = cellAttempts;
        const first = await settle({
          specialistBatchId: batch.id,
          cellAttemptId: researcherCell.id,
          sourceDigest: batch.sourceDigest,
          inputDigest: researcherCell.inputDigest,
          transition: completedResearcherOutcome(researcherCell),
        });
        delayedSettlementNow = Date.parse(qaCell.deadlineAt);
        const second = await settle({
          specialistBatchId: batch.id,
          cellAttemptId: qaCell.id,
          sourceDigest: batch.sourceDigest,
          inputDigest: qaCell.inputDigest,
          transition: {
            status: 'completed',
            ...completedQaOutcome(
              qaCell.inputDigest,
              qaCell.inputPathDigests,
            ),
          },
        });
        return {
          specialistBatchId: batch.id,
          settlements: [
            { status: 'fulfilled', value: first },
            { status: 'fulfilled', value: second },
          ],
        };
      },
    },
  );
  const delayedSettlementResult =
    await delayedSettlementScenario.context.runtime.startCouncilSpecialistBatch(
      delayedSettlementScenario.startRequest,
    );
  assert.equal(delayedSettlementResult.specialistBatch.status, 'partial-failed');
  assert.deepEqual(
    delayedSettlementResult.specialistCellAttempts.map((attempt) => [
      attempt.status,
      attempt.failureReason,
    ]),
    [
      ['completed', null],
      ['failed', 'cell-deadline-exceeded'],
    ],
  );

  const failedScenario = await startScenario('runtime-both-failed', {
    specialistResearcherRunner: async () => ({
      status: 'failed',
      observedInputDigest: null,
      failureReason: 'source-drift-before-worker',
    }),
    specialistQaRunner: async () => {
      const error = new Error('synthetic bounded QA failure');
      error.code = 'qa-spawn-failed';
      throw error;
    },
  });
  const failedResult = await failedScenario.context.runtime.startCouncilSpecialistBatch(
    failedScenario.startRequest,
  );
  assert.equal(failedResult.specialistBatch.status, 'failed');
  assert.deepEqual(
    failedResult.specialistCellAttempts.map((attempt) => attempt.status),
    ['failed', 'failed'],
  );

  const interruptedScenario = await startScenario('runtime-interrupted', {
    specialistBatchCoordinator: async () => {
      throw new Error('synthetic interruption after active save');
    },
  });
  await assert.rejects(
    interruptedScenario.context.runtime.startCouncilSpecialistBatch(
      interruptedScenario.startRequest,
    ),
    /inspect exact durable evidence/,
  );
  const interruptedState = JSON.parse(
    fs.readFileSync(interruptedScenario.scenarioStatePath, 'utf8'),
  );
  const interruptedBatch = Object.values(interruptedState.specialistBatches)[0];
  assert.equal(interruptedBatch.status, 'active');
  assert.deepEqual(
    interruptedBatch.cellAttemptIds.map(
      (cellAttemptId) => interruptedState.specialistCellAttempts[cellAttemptId].status,
    ),
    ['active', 'active'],
  );

  const settlementScenario = await startScenario('runtime-settlement-isolation', {
    specialistBatchCoordinator: async ({ batch, cellAttempts, settle }) => {
      const [researcherAttempt, qaAttempt] = cellAttempts;
      const first = await settle({
        specialistBatchId: batch.id,
        cellAttemptId: researcherAttempt.id,
        sourceDigest: '0'.repeat(64),
        inputDigest: researcherAttempt.inputDigest,
        transition: completedResearcherOutcome(researcherAttempt),
      }).then(
        (value) => ({ status: 'fulfilled', value }),
        () => ({ status: 'rejected', reason: 'state-conflict' }),
      );
      const qaOutcome = completedQaOutcome(
        qaAttempt.inputDigest,
        qaAttempt.inputPathDigests,
      );
      const second = await settle({
        specialistBatchId: batch.id,
        cellAttemptId: qaAttempt.id,
        sourceDigest: batch.sourceDigest,
        inputDigest: qaAttempt.inputDigest,
        transition: {
          status: 'completed',
          ...qaOutcome,
        },
      }).then(
        (value) => ({ status: 'fulfilled', value }),
        () => ({ status: 'rejected', reason: 'settlement-failed' }),
      );
      return { specialistBatchId: batch.id, settlements: [first, second] };
    },
  });
  await assert.rejects(
    settlementScenario.context.runtime.startCouncilSpecialistBatch(
      settlementScenario.startRequest,
    ),
    /inspect exact durable evidence/,
  );
  const isolatedState = JSON.parse(
    fs.readFileSync(settlementScenario.scenarioStatePath, 'utf8'),
  );
  const isolatedBatch = Object.values(isolatedState.specialistBatches)[0];
  assert.equal(isolatedBatch.status, 'active');
  assert.deepEqual(
    isolatedBatch.cellAttemptIds.map(
      (cellAttemptId) => isolatedState.specialistCellAttempts[cellAttemptId].status,
    ),
    ['active', 'completed'],
  );

  const invalidRuntimeRoot = path.join(tempRoot, 'runtime-invalid-v20');
  fs.cpSync(partialScenario.scenarioRuntimeRoot, invalidRuntimeRoot, {
    recursive: true,
  });
  const invalidStatePath = path.join(invalidRuntimeRoot, 'state.json');
  const invalidState = JSON.parse(fs.readFileSync(invalidStatePath, 'utf8'));
  Object.values(invalidState.specialistBatches)[0].maxConcurrentCells = 3;
  fs.writeFileSync(invalidStatePath, `${JSON.stringify(invalidState, null, 2)}\n`);
  const invalidRuntime = createRuntimeService({
    runtimeRoot: invalidRuntimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: tempRoot,
  });
  assert.throws(
    () => invalidRuntime.getSnapshot(),
    /persistence or execution bounds|recordDigest/,
  );

  const finalState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  assert.equal(finalState.schemaVersion, 29);
  assert.equal(Object.keys(finalState.specialistBatches).length, 1);
  assert.equal(Object.keys(finalState.specialistCellAttempts).length, 2);
  assert.equal(Object.keys(finalState.specialistCellRetries).length, 0);
  assert.equal(Object.keys(finalState.executionPlans).length, 0);
  assert.equal(Object.keys(finalState.workOrders).length, 0);
  assert.equal(Object.keys(finalState.runs).length, 0);
  assert.equal(Object.keys(finalState.artifacts).length, 0);
  assert.equal(Object.keys(finalState.approvals).length, 0);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: MODE,
        schemaVersion: finalState.schemaVersion,
        activeBeforeExecution: true,
        concurrentStarts: workerStarts,
        idempotentReplay: true,
        exactInspection: true,
        genericSnapshotMaps: false,
        downstreamRecords: 0,
      },
      null,
      2,
    )}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().finally(() => {
    if (!keepFixture) {
      fs.rmSync(tempRoot, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 50,
      });
    }
  });
}

export {
  blueprintPath,
  buildPreviewRequest,
  buildStartRequest,
  completedQaOutcome,
  completedResearcherOutcome,
  createResolvedCouncilAdapter,
  projectPath,
  repoRoot,
  seedBoundCouncil,
  tempRoot,
  writeFixtureSources,
};
