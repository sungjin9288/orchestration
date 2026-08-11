import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import localStubModule from '../src/execution/providers/council-local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import contextConsumptionModule from '../src/runtime/strategist-context-consumption.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = localStubModule;
const { createRuntimeService } = runtimeModule;
const {
  CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT,
  CONTEXT_CONSUMPTION_BLOCKED_ACTIONS,
} = contextConsumptionModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(
  repoRoot,
  'var',
  'runtime-ai-company-strategist-mission-context-consumption-smoke',
);
const mode = 'ai-company-strategist-mission-context-consumption-smoke';
const COUNCIL_AGENT_IDS = [
  'agent-conductor',
  'agent-strategist',
  'agent-architect',
  'agent-decomposer',
];

requireNoCliArgs(process.argv.slice(2), { mode });

function readState(runtimeRoot) {
  return JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'));
}

function readStateBytes(runtimeRoot) {
  return fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8');
}

function writeState(runtimeRoot, state) {
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function createRuntime(runtimeRoot, options = {}) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    ...options,
  });
}

function seedHistoricalV29Attachment() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-reviewed-mission-context-attachment.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_REVIEWED_MISSION_CONTEXT_ATTACHMENT_KEEP_FIXTURE: '1',
        ORCHESTRATION_REVIEWED_MISSION_CONTEXT_ATTACHMENT_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MissionContextAttachment');
  }
  const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
  const state = readState(runtimeRoot);
  const attachment = Object.values(state.missionContextAttachments || {})[0];
  if (!attachment) throw new Error('Seeded MissionContextAttachment was not found');
  return { attachment, runtimeRoot };
}

function createStaffingSpec() {
  return {
    mode: 'council',
    selectedAgentIds: [...COUNCIL_AGENT_IDS],
    selectionRationale:
      'Bind one accepted local Council roster to the exact reviewed Mission context.',
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

function acceptStaffingPlan(runtime, mission) {
  const evaluatedAt = new Date().toISOString();
  const staffingSpec = createStaffingSpec();
  const preview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  return runtime.acceptMissionStaffingPlan({
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
      rationale: 'Accept the exact local Council staffing source tuple.',
      reviewedAt: evaluatedAt,
    },
  }).staffingPlan;
}

function createInstrumentedAdapter() {
  const delegate = createCouncilLocalStubAdapter();
  const positionRequests = [];
  const synthesisRequests = [];
  return {
    adapter: {
      id: 'instrumented-context-local-stub',
      mode: 'local-stub',
      executePosition(request) {
        positionRequests.push(request);
        const output = delegate.executePosition(request);
        if (request.agent.role !== 'strategist') return output;
        return {
          ...output,
          recommendation: request.context.summary,
          assumptions: [request.context.summary.slice(0, 12)],
        };
      },
      executeSynthesis(request) {
        synthesisRequests.push(request);
        return delegate.executeSynthesis(request);
      },
    },
    positionRequests,
    synthesisRequests,
  };
}

function buildRequest(staffingPlan, attachment, requestedAt = new Date().toISOString()) {
  return {
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    missionContextAttachmentId: attachment.id,
    missionContextAttachmentRecordDigest: attachment.recordDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Bind the accepted plan to one context-aware local Council attempt.',
      requestedAt,
    },
    contextConsumption: {
      decision: 'consume',
      targetRole: 'strategist',
      acknowledgement: CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT,
      rationale: 'Use this exact reviewed context for the Strategist position only.',
      requestedAt,
    },
  };
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const before = readStateBytes(runtimeRoot);
  assert.throws(operation, pattern);
  assert.equal(readStateBytes(runtimeRoot), before);
}

function countAtomicSaves(runtimeRoot, operation) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const originalRenameSync = fs.renameSync;
  let saves = 0;
  fs.renameSync = (source, target) => {
    if (path.resolve(target) === path.resolve(statePath)) saves += 1;
    return originalRenameSync(source, target);
  };
  try {
    return { result: operation(), saves };
  } finally {
    fs.renameSync = originalRenameSync;
  }
}

async function waitForServer(child, port) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('API server exited before readiness');
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/snapshot`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('API server readiness timed out');
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seeded = seedHistoricalV29Attachment();
    const seedRuntime = createRuntime(seeded.runtimeRoot);
    const seededState = readState(seeded.runtimeRoot);
    const mission = seededState.missions[seeded.attachment.targetMissionId];
    const staffingPlan = acceptStaffingPlan(seedRuntime, mission);

    const historical = readState(seeded.runtimeRoot);
    historical.schemaVersion = 29;
    writeState(seeded.runtimeRoot, historical);
    const historicalBytes = readStateBytes(seeded.runtimeRoot);

    const probe = createInstrumentedAdapter();
    const runtime = createRuntime(seeded.runtimeRoot, { councilAdapter: probe.adapter });
    assert.equal(runtime.getSnapshot().schemaVersion, 30);
    assert.equal(runtime.getMissionContextAttachment(mission.id).missionContextAttachment.id, seeded.attachment.id);
    assert.equal(runtime.getStaffingPlan(staffingPlan.id).staffingPlan.recordDigest, staffingPlan.recordDigest);
    assert.equal(readStateBytes(seeded.runtimeRoot), historicalBytes);

    const request = buildRequest(staffingPlan, seeded.attachment);
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.enterStaffingPlanCouncilWithStrategistContext({ ...request, extra: true }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.enterStaffingPlanCouncilWithStrategistContext({
        ...request,
        missionContextAttachmentRecordDigest: '0'.repeat(64),
      }),
      /stale, expired, or outside/,
    );
    const created = countAtomicSaves(seeded.runtimeRoot, () =>
      runtime.enterStaffingPlanCouncilWithStrategistContext(request),
    );
    assert.equal(created.saves, 1);
    assert.equal(created.result.idempotent, false);
    assert.equal(probe.positionRequests.length, 3);
    assert.equal(probe.synthesisRequests.length, 1);

    const strategistRequest = probe.positionRequests.find(
      (entry) => entry.agent.role === 'strategist',
    );
    const isolatedRequests = probe.positionRequests.filter(
      (entry) => entry.agent.role !== 'strategist',
    );
    assert.ok(strategistRequest.context);
    assert.equal(Object.isFrozen(strategistRequest), true);
    assert.equal(Object.isFrozen(strategistRequest.context), true);
    assert.equal(strategistRequest.context.attachmentId, seeded.attachment.id);
    assert.equal(
      isolatedRequests.every((entry) => !Object.prototype.hasOwnProperty.call(entry, 'context')),
      true,
    );
    const synthesisRequest = probe.synthesisRequests[0];
    assert.equal(
      synthesisRequest.positions.every(
        (position) =>
          !Object.prototype.hasOwnProperty.call(position, 'contextRef') &&
          !JSON.stringify(position).includes(seeded.attachment.id),
      ),
      true,
    );

    const state = readState(seeded.runtimeRoot);
    assert.equal(state.schemaVersion, 30);
    const entry = state.staffingEntries[created.result.staffingEntry.id];
    const session = state.councilSessions[created.result.councilSession.id];
    const attempt = session.attempts[0];
    const strategistPosition = attempt.positions.find((position) => position.role === 'strategist');
    assert.deepEqual(entry.missionContextAttachmentRef, strategistPosition.contextRef);
    assert.equal(session.strategistContextConsumption.targetRole, 'strategist');
    assert.deepEqual(
      session.strategistContextConsumption.blockedActions,
      [...CONTEXT_CONSUMPTION_BLOCKED_ACTIONS],
    );
    assert.equal(
      attempt.positions
        .filter((position) => position.role !== 'strategist')
        .every((position) => !Object.prototype.hasOwnProperty.call(position, 'contextRef')),
      true,
    );
    assert.match(strategistPosition.recommendation, /Reviewed mission context acknowledged/);
    assert.equal(JSON.stringify(attempt).includes(seeded.attachment.summary), false);
    assert.equal(JSON.stringify(attempt).includes(seeded.attachment.summary.slice(0, 12)), false);

    const snapshot = runtime.getSnapshot();
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        snapshot.staffingEntries[entry.id],
        'missionContextAttachmentRef',
      ),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        snapshot.councilSessions[session.id],
        'strategistContextConsumption',
      ),
      false,
    );
    assert.equal(JSON.stringify(snapshot).includes(seeded.attachment.id), false);

    const exact = runtime.getStaffingEntry(entry.id);
    assert.deepEqual(exact.staffingEntry.missionContextAttachmentRef, entry.missionContextAttachmentRef);
    assert.deepEqual(exact.councilSession.strategistContextConsumption, session.strategistContextConsumption);

    const persistedBytes = readStateBytes(seeded.runtimeRoot);
    const replayCalls = probe.positionRequests.length + probe.synthesisRequests.length;
    const replay = runtime.enterStaffingPlanCouncilWithStrategistContext(request);
    assert.equal(replay.idempotent, true);
    assert.equal(readStateBytes(seeded.runtimeRoot), persistedBytes);
    assert.equal(probe.positionRequests.length + probe.synthesisRequests.length, replayCalls);
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.enterStaffingPlanCouncilWithStrategistContext({
        ...request,
        contextConsumption: {
          ...request.contextConsumption,
          rationale: 'A different replay rationale must fail closed.',
        },
      }),
      /does not match retained evidence/,
    );

    const port = 47630;
    const server = spawn(
      process.execPath,
      [
        'scripts/serve-ui-slice-01.mjs',
        '--runtime-root',
        seeded.runtimeRoot,
        '--port',
        String(port),
      ],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    try {
      await waitForServer(server, port);
      const apiBody = structuredClone(request);
      delete apiBody.staffingPlanId;
      const replayResponse = await fetch(
        `http://127.0.0.1:${port}/api/staffing-plans/${encodeURIComponent(staffingPlan.id)}/council-entry-with-strategist-context`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(apiBody),
        },
      );
      assert.equal(replayResponse.status, 200);
      const replayPayload = await replayResponse.json();
      assert.equal(replayPayload.mutation.idempotent, true);
      assert.equal(replayPayload.mutation.stoppedAt, 'human-alignment');
      for (const field of ['staffingEntry', 'councilSession', 'mission']) {
        assert.equal(Object.prototype.hasOwnProperty.call(replayPayload, field), false);
      }
      assert.equal(JSON.stringify(replayPayload).includes(seeded.attachment.id), false);
      const exactResponse = await fetch(
        `http://127.0.0.1:${port}/api/staffing-entries/${encodeURIComponent(entry.id)}`,
      );
      assert.equal(exactResponse.status, 200);
      const exactPayload = await exactResponse.json();
      assert.equal(
        exactPayload.councilSession.strategistContextConsumption.attachmentId,
        seeded.attachment.id,
      );
      assert.equal(
        Object.prototype.hasOwnProperty.call(
          replayPayload.snapshot.councilSessions[session.id],
          'strategistContextConsumption',
        ),
        false,
      );
    } finally {
      server.kill('SIGTERM');
      await new Promise((resolve) => server.once('exit', resolve));
    }

    const approved = runtime.decideRealCouncilSession({
      councilSessionId: session.id,
      action: 'approve',
    });
    assert.equal(approved.councilSession.status, 'approved');
    assertNoWrite(
      seeded.runtimeRoot,
      () => runtime.previewMissionWorkOrders({
        councilSessionId: session.id,
        compileSpec: {},
      }),
      /Context-bound Council sessions are blocked/,
    );

    const providerRoot = path.join(tempRoot, 'provider-blocked');
    fs.mkdirSync(providerRoot, { recursive: true });
    writeState(providerRoot, historical);
    const providerRuntime = createRuntime(providerRoot, {
      councilAdapter: {
        id: 'blocked-provider',
        mode: 'openai-responses',
        executePosition() {
          throw new Error('provider must not execute');
        },
        executeSynthesis() {
          throw new Error('provider must not execute');
        },
      },
    });
    assertNoWrite(
      providerRoot,
      () => providerRuntime.enterStaffingPlanCouncilWithStrategistContext(request),
      /requires the local-stub adapter/,
    );

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode,
      migration: {
        fromSchemaVersion: 29,
        toSchemaVersion: 30,
        atomicSaveCount: created.saves,
        passiveSaveCount: 0,
      },
      consumption: {
        staffingEntryId: entry.id,
        councilSessionId: session.id,
        attachmentId: seeded.attachment.id,
        targetRole: session.strategistContextConsumption.targetRole,
        exactReplay: 'no-write-no-adapter-call',
      },
      safety: {
        strategistOnlyFrozenContext: true,
        conductorAllowlistedProjection: true,
        rawAndFragmentedContextOutputReplaced: true,
        genericSnapshotRedacted: true,
        postResponseRedactedUntilExactGet: true,
        exactInspectionHydration: true,
        downstreamSchedulerBlocked: true,
        providerContextBlocked: true,
      },
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
