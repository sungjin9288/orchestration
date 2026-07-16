import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createRuntimeService } = runtimeServiceModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-real-council-smoke');
const MODE = 'ai-company-real-council-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createInstrumentedAdapter(options = {}) {
  const base = createCouncilLocalStubAdapter();
  const positionRequests = [];
  const synthesisRequests = [];
  const consumed = new Set();

  return {
    positionRequests,
    synthesisRequests,
    adapter: {
      id: 'instrumented-council-local-stub',
      mode: 'local-stub',
      executePosition(request) {
        positionRequests.push(clone(request));
        assert.equal(Object.isFrozen(request), true);
        assert.equal(Object.isFrozen(request.agenda), true);
        assert.equal(Object.isFrozen(request.agent), true);
        assert.equal(Object.hasOwn(request, 'positions'), false);
        assert.equal(Object.hasOwn(request, 'peerOutputs'), false);

        if (
          options.failPositionRoleOnce === request.agent.role &&
          !consumed.has(`fail:${request.agent.role}`)
        ) {
          consumed.add(`fail:${request.agent.role}`);
          throw new Error(`injected ${request.agent.role} failure`);
        }

        const output = base.executePosition(request);

        if (
          options.invalidPositionRoleOnce === request.agent.role &&
          !consumed.has(`invalid:${request.agent.role}`)
        ) {
          consumed.add(`invalid:${request.agent.role}`);
          return { ...output, unexpectedAuthority: true };
        }

        if (
          options.unsupportedEvidenceRoleOnce === request.agent.role &&
          !consumed.has(`evidence:${request.agent.role}`)
        ) {
          consumed.add(`evidence:${request.agent.role}`);
          return { ...output, evidenceRefs: ['provider.hidden-memory'] };
        }

        return output;
      },
      executeSynthesis(request) {
        synthesisRequests.push(clone(request));
        assert.equal(Object.isFrozen(request), true);
        assert.equal(Object.isFrozen(request.agenda), true);
        assert.equal(Object.isFrozen(request.agent), true);
        assert.equal(Object.isFrozen(request.positions), true);
        assert.equal(Object.isFrozen(request.conflictSummary), true);

        if (options.failSynthesisOnce && !consumed.has('synthesis')) {
          consumed.add('synthesis');
          throw new Error('injected synthesis failure');
        }

        return base.executeSynthesis(request);
      },
    },
  };
}

function createConfiguredRuntime(name, adapter = null) {
  const runtimeRoot = path.join(tempRoot, name);
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    ...(adapter ? { councilAdapter: adapter } : {}),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({
    name,
    projectPath: repoRoot,
  });

  return { runtime, runtimeRoot, project };
}

function createMission(runtime, project, suffix) {
  return runtime.createMission({
    projectId: project.id,
    title: `Real Council ${suffix}`,
    goal: `Prove ${suffix} with independent local-stub positions.`,
    constraints: 'Keep schema v6, preserve legacy routes, and make no provider call.',
  });
}

fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(tempRoot, { recursive: true });

try {
  const successProbe = createInstrumentedAdapter();
  const success = createConfiguredRuntime('success', successProbe.adapter);
  const mission = createMission(success.runtime, success.project, 'success');
  const started = success.runtime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  const session = started.councilSession;
  const firstAttempt = session.attempts[0];

  assert.equal(success.runtime.getSnapshot().schemaVersion, 8);
  assert.equal(session.mode, 'real-local-stub');
  assert.equal(session.phase, 'awaiting-alignment');
  assert.equal(session.status, 'pending-alignment');
  assert.equal(firstAttempt.positions.length, 3);
  assert.equal(firstAttempt.status, 'awaiting-alignment');
  assert.ok(firstAttempt.synthesis);
  assert.equal(firstAttempt.conflictSummary.requiredRoleFailures.length, 0);
  assert.equal(firstAttempt.conflictSummary.unsupportedEvidenceRefs.length, 0);
  assert.equal(firstAttempt.conflictSummary.approvalReady, true);
  assert.ok(firstAttempt.conflictSummary.conflictingRecommendations.length > 0);
  assert.ok(firstAttempt.conflictSummary.dissentPositionRefs.length > 0);
  assert.deepEqual(
    successProbe.positionRequests.map((request) => request.agent.role),
    ['strategist', 'architect', 'decomposer'],
  );
  assert.equal(
    new Set(successProbe.positionRequests.map((request) => request.sourceDigest)).size,
    1,
  );
  assert.deepEqual(
    successProbe.positionRequests.map((request) => request.agenda),
    [session.agenda, session.agenda, session.agenda],
  );
  assert.equal(successProbe.synthesisRequests.length, 1);
  assert.equal(successProbe.synthesisRequests[0].positions.length, 3);
  assert.equal(successProbe.synthesisRequests[0].conflictSummary.approvalReady, true);
  assert.equal(firstAttempt.synthesis.humanDecisionRequired, true);

  const immutableFirstAttempt = clone(firstAttempt);
  const revised = success.runtime.decideRealCouncilSession({
    councilSessionId: session.id,
    action: 'request-revision',
    note: 'Tighten the measurable acceptance signal.',
    targetAgentIds: ['agent-strategist'],
  });

  assert.equal(revised.councilSession.attempts.length, 2);
  assert.equal(revised.attempt.positions.length, 1);
  assert.equal(revised.attempt.positions[0].agentId, 'agent-strategist');
  assert.equal(revised.attempt.revisionRequest.note, 'Tighten the measurable acceptance signal.');
  assert.deepEqual(revised.councilSession.attempts[0], immutableFirstAttempt);
  assert.equal(successProbe.positionRequests.length, 4);
  assert.equal(successProbe.synthesisRequests.length, 2);
  assert.equal(successProbe.synthesisRequests[1].positions.length, 3);

  const reloaded = createRuntimeService({
    runtimeRoot: success.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
  });
  const reloadedSession = reloaded.getCouncilSession(session.id);

  assert.equal(reloaded.getSnapshot().schemaVersion, 8);
  assert.equal(reloadedSession.mode, 'real-local-stub');
  assert.equal(reloadedSession.attempts.length, 2);
  assert.equal(reloadedSession.currentAttemptId, revised.attempt.id);
  assert.ok(reloadedSession.attempts[1].synthesis);

  const approved = reloaded.decideRealCouncilSession({
    councilSessionId: session.id,
    action: 'approve',
  });
  const approvedSnapshot = reloaded.getSnapshot();

  assert.equal(approved.councilSession.phase, 'terminal');
  assert.equal(approved.councilSession.terminalReason, 'operator-approved');
  assert.equal(approved.councilSession.alignment.status, 'approved');
  assert.equal(Object.keys(approvedSnapshot.tasks).length, 0);
  assert.equal(Object.keys(approvedSnapshot.runs).length, 0);
  assert.equal(Object.keys(approvedSnapshot.artifacts).length, 0);
  assert.equal(Object.keys(approvedSnapshot.approvals).length, 0);

  const stoppedMission = createMission(reloaded, success.project, 'operator stop');
  const stoppedStart = reloaded.startRealCouncilForMission({ missionId: stoppedMission.id });
  const stopped = reloaded.decideRealCouncilSession({
    councilSessionId: stoppedStart.councilSession.id,
    action: 'stop',
  });

  assert.equal(stopped.councilSession.phase, 'terminal');
  assert.equal(stopped.councilSession.terminalReason, 'operator-stopped');
  assert.equal(stopped.mission.linkedTaskId, null);
  assert.equal(Object.keys(reloaded.getSnapshot().tasks).length, 0);

  const legacyMission = createMission(reloaded, success.project, 'legacy compatibility');
  const legacy = reloaded.createCouncilSessionForMission({ missionId: legacyMission.id });

  assert.equal(Object.hasOwn(legacy.councilSession, 'mode'), false);
  assert.equal(legacy.councilSession.status, 'pending-alignment');
  assert.equal(legacy.councilSession.transcript.length, 4);
  assert.deepEqual(
    legacy.councilSession.participants.map((participant) => participant.role),
    ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
  );
  const legacyApproved = reloaded.approveCouncilRecommendation({ missionId: legacyMission.id });
  assert.equal(legacyApproved.councilSession.alignment.action, 'approve-recommendation');

  const failureProbe = createInstrumentedAdapter({ failPositionRoleOnce: 'architect' });
  const failure = createConfiguredRuntime('position-failure', failureProbe.adapter);
  const failedMission = createMission(failure.runtime, failure.project, 'position failure');
  const failedStart = failure.runtime.startRealCouncilForMission({ missionId: failedMission.id });

  assert.equal(failedStart.councilSession.status, 'failed');
  assert.equal(failedStart.councilSession.attempts[0].positions.length, 2);
  assert.equal(failedStart.councilSession.attempts[0].synthesis, null);
  assert.deepEqual(
    failedStart.councilSession.attempts[0].conflictSummary.requiredRoleFailures.map(
      (entry) => entry.role,
    ),
    ['architect'],
  );
  assert.equal(failureProbe.synthesisRequests.length, 0);
  const resumed = failure.runtime.resumeRealCouncilSession({
    councilSessionId: failedStart.councilSession.id,
  });
  assert.equal(resumed.attempt.positions.length, 1);
  assert.equal(resumed.attempt.positions[0].role, 'architect');
  assert.ok(resumed.attempt.synthesis);
  assert.equal(resumed.councilSession.phase, 'awaiting-alignment');

  const invalidProbe = createInstrumentedAdapter({ invalidPositionRoleOnce: 'strategist' });
  const invalid = createConfiguredRuntime('invalid-position', invalidProbe.adapter);
  const invalidMission = createMission(invalid.runtime, invalid.project, 'invalid output');
  const invalidStart = invalid.runtime.startRealCouncilForMission({ missionId: invalidMission.id });
  assert.equal(invalidStart.councilSession.status, 'failed');
  assert.equal(invalidStart.councilSession.attempts[0].synthesis, null);
  assert.equal(
    invalidStart.councilSession.attempts[0].conflictSummary.requiredRoleFailures[0].role,
    'strategist',
  );

  const evidenceProbe = createInstrumentedAdapter({ unsupportedEvidenceRoleOnce: 'decomposer' });
  const evidence = createConfiguredRuntime('unsupported-evidence', evidenceProbe.adapter);
  const evidenceMission = createMission(evidence.runtime, evidence.project, 'unsupported evidence');
  const evidenceStart = evidence.runtime.startRealCouncilForMission({ missionId: evidenceMission.id });
  assert.deepEqual(
    evidenceStart.councilSession.attempts[0].conflictSummary.unsupportedEvidenceRefs,
    ['provider.hidden-memory'],
  );
  assert.equal(evidenceStart.councilSession.attempts[0].synthesis, null);
  const evidenceResume = evidence.runtime.resumeRealCouncilSession({
    councilSessionId: evidenceStart.councilSession.id,
  });
  assert.equal(evidenceResume.attempt.positions[0].role, 'decomposer');
  assert.ok(evidenceResume.attempt.synthesis);

  const synthesisProbe = createInstrumentedAdapter({ failSynthesisOnce: true });
  const synthesis = createConfiguredRuntime('synthesis-failure', synthesisProbe.adapter);
  const synthesisMission = createMission(synthesis.runtime, synthesis.project, 'synthesis failure');
  const synthesisStart = synthesis.runtime.startRealCouncilForMission({
    missionId: synthesisMission.id,
  });
  assert.equal(synthesisStart.councilSession.status, 'failed');
  assert.equal(synthesisStart.councilSession.attempts[0].positions.length, 3);
  assert.equal(synthesisStart.councilSession.attempts[0].synthesis, null);
  const synthesisPositionRequestCount = synthesisProbe.positionRequests.length;
  const synthesisResume = synthesis.runtime.resumeRealCouncilSession({
    councilSessionId: synthesisStart.councilSession.id,
  });
  assert.equal(synthesisResume.attempt.positions.length, 0);
  assert.ok(synthesisResume.attempt.synthesis);
  assert.equal(synthesisProbe.positionRequests.length, synthesisPositionRequestCount);

  const stale = createConfiguredRuntime('stale-source');
  const staleMission = createMission(stale.runtime, stale.project, 'stale source');
  const staleStart = stale.runtime.startRealCouncilForMission({ missionId: staleMission.id });
  const statePath = path.join(stale.runtimeRoot, 'state.json');
  const staleState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  staleState.missions[staleMission.id].goal = 'Changed after Council execution.';
  fs.writeFileSync(statePath, `${JSON.stringify(staleState, null, 2)}\n`);
  assert.throws(
    () =>
      stale.runtime.decideRealCouncilSession({
        councilSessionId: staleStart.councilSession.id,
        action: 'approve',
      }),
    /stale source digest/,
  );

  const invalidBlueprintRoot = path.join(tempRoot, 'invalid-blueprint-runtime');
  const invalidBlueprintRuntime = createRuntimeService({
    runtimeRoot: invalidBlueprintRoot,
    companyBlueprintPath: path.join(tempRoot, 'missing-repo', 'company', 'blueprint.json'),
    companyRepoRoot: path.join(tempRoot, 'missing-repo'),
  });
  invalidBlueprintRuntime.resetRuntime();
  const invalidBlueprintProject = invalidBlueprintRuntime.createProject({
    name: 'invalid-blueprint',
    projectPath: repoRoot,
  });
  const invalidBlueprintMission = createMission(
    invalidBlueprintRuntime,
    invalidBlueprintProject,
    'invalid blueprint',
  );
  assert.throws(
    () =>
      invalidBlueprintRuntime.startRealCouncilForMission({
        missionId: invalidBlueprintMission.id,
      }),
    /CompanyBlueprint must be ready/,
  );
  const invalidBlueprintLegacy = invalidBlueprintRuntime.createCouncilSessionForMission({
    missionId: invalidBlueprintMission.id,
  });
  assert.equal(invalidBlueprintLegacy.councilSession.transcript.length, 4);

  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        mode: MODE,
        runtime: {
          schemaVersion: 8,
          positionRoles: ['strategist', 'architect', 'decomposer'],
          synthesisRole: 'conductor',
          independentRequestIsolation: true,
          immutableRequestPackets: true,
          revisionHistoryPreserved: true,
          failureResume: true,
          synthesisRetry: true,
          staleDigestRejected: true,
          legacyCouncilPreserved: true,
        },
        authority: {
          providerCallsAllowed: false,
          memoryPersistenceAllowed: false,
          sourceMutationAllowed: false,
          runtimeAgentCommitAllowed: false,
          runtimeAgentPushAllowed: false,
          releaseAllowed: false,
        },
      },
      null,
      2,
    )}\n`,
  );
} finally {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
}
