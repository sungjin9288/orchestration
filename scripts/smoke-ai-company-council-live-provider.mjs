import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import blueprintModule from '../src/runtime/company-blueprint.js';
import adapterModule from '../src/execution/providers/council-openai-responses-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { readCompanyBlueprintStatus } = blueprintModule;
const { CouncilProviderError, createCouncilOpenAIResponsesAdapter } = adapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-council-live-provider-smoke');
const MODE = 'ai-company-council-live-provider-smoke';
const API_KEY_VAR = 'ORCHESTRATION_COUNCIL_SMOKE_API_KEY';
const API_KEY = 'synthetic-council-secret-value';
const MODEL = 'synthetic-council-model';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    async text() {
      return typeof payload === 'string' ? payload : JSON.stringify(payload);
    },
  };
}

function positionOutput(role) {
  return {
    recommendation: `${role} recommends the smallest verified provider Council slice.`,
    assumptions: ['The operator keeps human alignment authority.'],
    evidenceRefs: ['mission.goal', 'company.blueprint'],
    objections: role === 'architect' ? ['Provider failure must not trigger local fallback.'] : [],
    risks: ['Provider output may fail schema validation.'],
    confidence: 'high',
    proposedNextStep: `Review the ${role} position with deterministic conflict evidence.`,
  };
}

function synthesisOutput(input) {
  const positionRefs = input.positions.map((position) => position.id);

  return {
    missionInterpretation: 'Execute one explicit provider-backed Council attempt without widening authority.',
    adoptedRecommendation: 'Keep local-stub authoritative and require human alignment for provider output.',
    adoptedPositionRefs: positionRefs,
    rejectedAlternatives: ['Automatic local fallback after provider failure.'],
    dissentRefs: input.conflictSummary.dissentPositionRefs,
    unresolvedQuestions: [],
    proposedExecutionBoundary: 'Council recommendation evidence only; no source or downstream execution mutation.',
    proposedAcceptanceCriteria: [
      'All four role calls use the normalized contract.',
      'Persisted provider evidence contains no secret or absolute project path.',
    ],
    humanDecisionRequired: true,
  };
}

function createSuccessFetch(calls) {
  return async (_url, options) => {
    const body = JSON.parse(options.body);
    const input = JSON.parse(body.input);
    calls.push({ body, input, authorization: options.headers.Authorization });
    const output = input.role === 'conductor'
      ? synthesisOutput(input)
      : positionOutput(input.role);

    return response(200, {
      id: `provider-run-${calls.length}`,
      model: MODEL,
      output_text: JSON.stringify(output),
      usage: {
        input_tokens: 10,
        output_tokens: 20,
        total_tokens: 30,
        ignored_provider_field: API_KEY,
      },
    });
  };
}

function createProviderProject(runtime, name) {
  return runtime.createProject({
    name,
    projectPath: repoRoot,
    provider: {
      mode: 'live',
      adapter: 'openai-responses',
      model: MODEL,
      env: { apiKeyVar: API_KEY_VAR },
    },
  });
}

function createMission(runtime, project, suffix) {
  return runtime.createMission({
    projectId: project.id,
    title: `Provider Council ${suffix}`,
    goal: `Prove ${suffix} with isolated Council provider requests.`,
    constraints: 'Keep schema v6 and human alignment authority.',
  });
}

function createRuntime(name, adapter) {
  const runtimeRoot = path.join(tempRoot, name);
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: adapter,
  });
  runtime.resetRuntime();
  return { runtime, runtimeRoot };
}

function buildDirectRequest(profile) {
  return {
    sessionId: 'councilSession-direct',
    attemptId: 'councilSession-direct-attempt-01',
    sourceDigest: 'a'.repeat(64),
    agenda: {
      missionId: 'mission-direct',
      projectId: 'project-secret-id',
      title: 'Direct provider transport check',
      goal: 'Verify bounded retry and error normalization.',
      constraints: 'No source mutation.',
      deliverableType: null,
      projectPath: repoRoot,
    },
    agent: { id: profile.id, role: profile.role, objective: profile.objective },
    revisionRequest: null,
  };
}

function providerContext(profile, signal = null) {
  return {
    profile,
    providerConfig: {
      mode: 'live',
      adapter: 'openai-responses',
      model: MODEL,
      env: { apiKeyVar: API_KEY_VAR },
    },
    signal,
  };
}

const previousSecret = process.env[API_KEY_VAR];
process.env[API_KEY_VAR] = API_KEY;
fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(tempRoot, { recursive: true });

try {
  const companyRuntime = readCompanyBlueprintStatus({ blueprintPath, repoRoot });
  const strategist = companyRuntime.blueprint.agentProfiles.find(
    (profile) => profile.role === 'strategist',
  );
  const calls = [];
  const adapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    fetchImpl: createSuccessFetch(calls),
    now: () => '2026-07-15T00:00:00.000Z',
    retryDelayMs: 0,
  });
  const success = createRuntime('success', adapter);
  const project = createProviderProject(success.runtime, 'provider-success');
  const mission = createMission(success.runtime, project, 'success');
  const readiness = success.runtime.getCouncilProviderReadiness({ projectId: project.id });

  assert.equal(readiness.allowed, true);
  assert.equal(readiness.roles.length, 4);

  const started = await success.runtime.startProviderCouncilForMission({
    missionId: mission.id,
    mode: 'real-openai-responses',
  });
  const session = started.councilSession;
  const attempt = session.attempts[0];

  assert.equal(calls.length, 4);
  assert.equal(session.mode, 'real-openai-responses');
  assert.equal(session.staffingSnapshot.providerMode, 'openai-responses');
  assert.equal(attempt.providerCallCount, 4);
  assert.equal(attempt.positions.length, 3);
  assert.equal(attempt.conflictSummary.approvalReady, true);
  assert.ok(attempt.conflictSummary.conflictingRecommendations.length > 0);
  assert.ok(attempt.synthesis);
  assert.equal(attempt.synthesis.providerEvidence.outcome, 'succeeded');
  assert.deepEqual(
    attempt.positions.map((position) => position.role),
    ['strategist', 'architect', 'decomposer'],
  );
  assert.ok(attempt.positions.every((position) => position.providerEvidence.providerAttemptCount === 1));

  for (const [index, call] of calls.entries()) {
    const serializedBody = JSON.stringify(call.body);
    assert.equal(serializedBody.includes(API_KEY), false);
    assert.equal(serializedBody.includes(repoRoot), false);
    assert.equal(serializedBody.includes('project-secret-id'), false);
    assert.equal(Object.hasOwn(call.input.agenda, 'projectPath'), false);
    assert.equal(Object.hasOwn(call.input.agenda, 'projectId'), false);

    if (index < 3) {
      assert.equal(Object.hasOwn(call.input, 'positions'), false);
      assert.equal(Object.hasOwn(call.input, 'conflictSummary'), false);
    } else {
      assert.equal(call.input.positions.length, 3);
      assert.equal(call.input.conflictSummary.approvalReady, true);
    }
  }

  const persisted = JSON.stringify(success.runtime.getSnapshot());
  assert.equal(persisted.includes(API_KEY), false);
  assert.equal(persisted.includes(repoRoot), true);
  assert.equal(JSON.stringify(session.attempts).includes(repoRoot), false);

  const reloaded = createRuntimeService({
    runtimeRoot: success.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  assert.equal(reloaded.getSnapshot().schemaVersion, 12);
  assert.equal(reloaded.getCouncilSession(session.id).mode, 'real-openai-responses');

  let retryCalls = 0;
  const retryAdapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    retryDelayMs: 0,
    maxRetryAttempts: 2,
    waitForRetry: async () => {},
    fetchImpl: async () => {
      retryCalls += 1;
      return retryCalls < 3
        ? response(retryCalls === 1 ? 429 : 503, {})
        : response(200, { output_text: JSON.stringify(positionOutput('strategist')) });
    },
  });
  const retryResult = await retryAdapter.executePosition(
    buildDirectRequest(strategist),
    providerContext(strategist),
  );
  assert.equal(retryCalls, 3);
  assert.equal(retryResult.providerEvidence.providerAttemptCount, 3);

  let nonRetryCalls = 0;
  const nonRetryAdapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    maxRetryAttempts: 3,
    fetchImpl: async () => {
      nonRetryCalls += 1;
      return response(400, {});
    },
  });
  await assert.rejects(
    nonRetryAdapter.executePosition(buildDirectRequest(strategist), providerContext(strategist)),
    (error) => error instanceof CouncilProviderError && error.code === 'HTTP_ERROR',
  );
  assert.equal(nonRetryCalls, 1);

  const timeoutAdapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    timeoutMs: 5,
    fetchImpl: async (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      }),
  });
  await assert.rejects(
    timeoutAdapter.executePosition(buildDirectRequest(strategist), providerContext(strategist)),
    (error) => error.code === 'TIMEOUT' && error.providerEvidence.errorCode === 'TIMEOUT',
  );

  const invalidJsonAdapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    fetchImpl: async () => response(200, 'not-json'),
  });
  await assert.rejects(
    invalidJsonAdapter.executePosition(buildDirectRequest(strategist), providerContext(strategist)),
    (error) => error.code === 'INVALID_JSON',
  );

  const malformedAdapter = createCouncilOpenAIResponsesAdapter({
    repoRoot,
    fetchImpl: async (_url, options) => {
      const input = JSON.parse(JSON.parse(options.body).input);
      const output = input.role === 'conductor'
        ? synthesisOutput(input)
        : { ...positionOutput(input.role), unexpectedAuthority: true };
      return response(200, { output_text: JSON.stringify(output), model: MODEL });
    },
  });
  const malformed = createRuntime('malformed', malformedAdapter);
  const malformedProject = createProviderProject(malformed.runtime, 'provider-malformed');
  const malformedMission = createMission(malformed.runtime, malformedProject, 'malformed output');
  const malformedStarted = await malformed.runtime.startProviderCouncilForMission({
    missionId: malformedMission.id,
    mode: 'real-openai-responses',
  });
  assert.equal(malformedStarted.councilSession.status, 'failed');
  assert.equal(
    malformedStarted.councilSession.attempts[0].conflictSummary.requiredRoleFailures[0].code,
    'SCHEMA_ERROR',
  );
  assert.equal(
    malformedStarted.councilSession.attempts[0].conflictSummary.requiredRoleFailures[0]
      .providerEvidence.errorCode,
    'SCHEMA_ERROR',
  );

  const cancelledCalls = [];
  const cancelled = createRuntime(
    'cancelled',
    createCouncilOpenAIResponsesAdapter({ repoRoot, fetchImpl: createSuccessFetch(cancelledCalls) }),
  );
  const cancelledProject = createProviderProject(cancelled.runtime, 'provider-cancelled');
  const cancelledMission = createMission(cancelled.runtime, cancelledProject, 'cancellation');
  const controller = new AbortController();
  controller.abort();
  const cancelledStarted = await cancelled.runtime.startProviderCouncilForMission({
    missionId: cancelledMission.id,
    mode: 'real-openai-responses',
    signal: controller.signal,
  });
  assert.equal(cancelledCalls.length, 0);
  assert.equal(cancelledStarted.councilSession.status, 'cancelled');
  assert.equal(cancelledStarted.councilSession.phase, 'terminal');
  assert.equal(cancelledStarted.mission.linkedTaskId, null);

  const missingEnv = process.env[API_KEY_VAR];
  delete process.env[API_KEY_VAR];
  const blocked = createRuntime('missing-configuration', adapter);
  const blockedProject = createProviderProject(blocked.runtime, 'provider-missing-config');
  const blockedReadiness = blocked.runtime.getCouncilProviderReadiness({ projectId: blockedProject.id });
  assert.equal(blockedReadiness.allowed, false);
  await assert.rejects(
    blocked.runtime.startProviderCouncilForMission({
      missionId: createMission(blocked.runtime, blockedProject, 'missing configuration').id,
      mode: 'real-openai-responses',
    }),
    (error) => error.code === 'COUNCIL_PROVIDER_NOT_READY' && error.statusCode === 409,
  );
  process.env[API_KEY_VAR] = missingEnv;

  const local = createRuntimeService({
    runtimeRoot: path.join(tempRoot, 'local-compatibility'),
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  local.resetRuntime();
  const localProject = local.createProject({ name: 'local', projectPath: repoRoot });
  const localMission = createMission(local, localProject, 'local compatibility');
  const localSession = local.startRealCouncilForMission({ missionId: localMission.id });
  assert.equal(localSession.councilSession.mode, 'real-local-stub');
  assert.equal(localSession.councilSession.attempts[0].providerCallCount, undefined);

  const legacyMission = createMission(local, localProject, 'legacy compatibility');
  const legacySession = local.createCouncilSessionForMission({ missionId: legacyMission.id });
  assert.equal(Object.hasOwn(legacySession.councilSession, 'mode'), false);

  const finalSnapshot = success.runtime.getSnapshot();
  assert.equal(Object.keys(finalSnapshot.tasks).length, 0);
  assert.equal(Object.keys(finalSnapshot.runs).length, 0);
  assert.equal(Object.keys(finalSnapshot.artifacts).length, 0);
  assert.equal(Object.keys(finalSnapshot.approvals).length, 0);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: MODE,
        provider: {
          mode: 'real-openai-responses',
          roleCalls: calls.length,
          requestIsolation: true,
          deterministicConflictBeforeSynthesis: true,
          retryStatuses: [429, 503],
          timeout: true,
          cancellation: true,
          malformedOutput: true,
          missingConfiguration: true,
          redactedEvidence: true,
          callBudget: 5,
        },
        compatibility: {
          schemaVersion: 12,
          localStub: true,
          legacyCouncil: true,
          downstreamMutation: false,
        },
      },
      null,
      2,
    )}\n`,
  );
} finally {
  if (previousSecret === undefined) {
    delete process.env[API_KEY_VAR];
  } else {
    process.env[API_KEY_VAR] = previousSecret;
  }
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
}
