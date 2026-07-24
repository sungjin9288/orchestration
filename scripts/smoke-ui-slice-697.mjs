import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeModule from '../src/runtime/runtime-service.js';
import { getMissionStaffingPlanSummary } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-697');
const runtimeRoot = path.join(tempRoot, 'runtime');
const port = 9800 + (process.pid % 100);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-697-staffing-entry-binding-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_697_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function fetchJson(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, options).then(async (response) => ({
    response,
    payload: await response.json(),
  }));
}

function postJson(pathname, body, contentType = 'application/json') {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-697 server');
}

function staffingSpec(mode = 'council') {
  return {
    mode,
    selectedAgentIds:
      mode === 'solo'
        ? ['agent-researcher']
        : [
            'agent-conductor',
            'agent-strategist',
            'agent-architect',
            'agent-decomposer',
          ],
    selectionRationale:
      mode === 'solo'
        ? 'Keep one accepted solo plan inspectable without claiming runtime execution.'
        : 'Bind the exact local Council roster through one operator-controlled entry.',
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

function acceptPlan(runtime, projectId, mode) {
  const mission = runtime.createMission({
    projectId,
    title: `${mode} StaffingEntry UI`,
    goal: 'Prove the exact operator-facing StaffingEntry boundary.',
    constraints: 'No unbound local start or downstream execution controls.',
  });
  const evaluatedAt = new Date().toISOString();
  const spec = staffingSpec(mode);
  const preview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec: spec,
    evaluatedAt,
  });
  const result = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec: spec,
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
      rationale: `Accept the exact ${mode} plan as immutable local evidence.`,
      reviewedAt: evaluatedAt,
    },
  });
  return { mission, staffingPlan: result.staffingPlan };
}

function seedFixture() {
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: path.join(repoRoot, 'company', 'blueprint.json'),
    companyRepoRoot: repoRoot,
  });
  const project = runtime.createProject({
    name: 'UI StaffingEntry',
    projectPath: repoRoot,
  });
  const council = acceptPlan(runtime, project.id, 'council');
  const solo = acceptPlan(runtime, project.id, 'solo');
  runtime.selectMission(council.mission.id);
  return { council, project, solo };
}

async function main() {
  const { council, solo } = seedFixture();
  const statePath = path.join(runtimeRoot, 'state.json');
  const server = spawn(
    process.execPath,
    [
      'scripts/serve-ui-slice-01.mjs',
      '--port',
      String(port),
      '--runtime-root',
      runtimeRoot,
    ],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const [appSource, signalSource, stylesSource] = await Promise.all([
      fetch(`${baseUrl}/app.js`).then((response) => response.text()),
      fetch(`${baseUrl}/council-signals.js`).then((response) => response.text()),
      fetch(`${baseUrl}/styles.css`).then((response) => response.text()),
    ]);
    const staffingPanelSource = appSource.slice(
      appSource.indexOf('function renderMissionStaffingPlan'),
      appSource.indexOf('function renderCouncil(data)'),
    );
    const alignmentSource = appSource.slice(
      appSource.indexOf('function renderRealCouncilAlignmentControls'),
      appSource.indexOf('function getCouncilConversationTurns'),
    );
    const boundAlignmentBranch = alignmentSource.slice(
      alignmentSource.indexOf('if (staffingEntryBound)'),
      alignmentSource.indexOf("if (attempt?.status === 'failed')"),
    );

    assert.match(staffingPanelSource, /data-form="staffing-plan-entry"/);
    assert.match(staffingPanelSource, /data-action="enter-staffing-plan-council"/);
    assert.match(staffingPanelSource, /Enter local Council/);
    assert.match(staffingPanelSource, /Durable StaffingEntry evidence/);
    assert.match(staffingPanelSource, /solo runtime not implemented/);
    assert.doesNotMatch(staffingPanelSource, /data-action="start-real-council/);
    assert.match(boundAlignmentBranch, /Alignment 승인/);
    assert.match(boundAlignmentBranch, /stop-real-council-session/);
    assert.doesNotMatch(
      boundAlignmentBranch,
      /data-action="request-revision-real-council-session"/,
    );
    assert.doesNotMatch(
      boundAlignmentBranch,
      /data-action="resume-real-council-session"/,
    );
    assert.doesNotMatch(boundAlignmentBranch, /WorkOrder preview/);
    assert.doesNotMatch(appSource, /data-action="start-real-council-for-mission"/);
    assert.match(appSource, /option\.value !== 'real-local-stub'/);
    assert.match(signalSource, /canEnterCouncil/);
    assert.match(signalSource, /entryCurrent/);
    assert.match(stylesSource, /\.staffing-entry-record/);
    assert.match(
      stylesSource,
      /@media \(max-width: 820px\)[\s\S]*\.staffing-plan-facts[\s\S]*grid-template-columns: repeat\(2,/,
    );

    const snapshot = await fetchJson('/api/snapshot');
    assert.equal(snapshot.response.status, 200);
    assert.equal(snapshot.payload.snapshot.schemaVersion, 18);
    assert.deepEqual(snapshot.payload.snapshot.staffingEntries, {});
    assert.equal(
      getMissionStaffingPlanSummary(
        council.mission,
        null,
        council.staffingPlan,
        null,
      ).canEnterCouncil,
      true,
    );
    assert.equal(
      getMissionStaffingPlanSummary(
        solo.mission,
        null,
        solo.staffingPlan,
        null,
      ).canEnterCouncil,
      false,
    );

    const unboundStart = await postJson(
      `/api/missions/${encodeURIComponent(council.mission.id)}/council/start`,
      { mode: 'real-local-stub' },
    );
    assert.equal(unboundStart.response.status, 409);
    assert.equal(unboundStart.payload.code, 'STAFFING_PLAN_ENTRY_REQUIRED');

    const entryPath =
      `/api/staffing-plans/${encodeURIComponent(council.staffingPlan.id)}/council-entry`;
    const requestedAt = new Date().toISOString();
    const entryBody = {
      staffingPlanRecordDigest: council.staffingPlan.recordDigest,
      sourceDigest: council.staffingPlan.sourceDigest,
      missionDigest: council.staffingPlan.missionDigest,
      blueprintDigest: council.staffingPlan.blueprintDigest,
      staffingSpecDigest: council.staffingPlan.staffingSpecDigest,
      entryApproval: {
        decision: 'enter',
        acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
        rationale: 'Enter the exact accepted Council plan and stop at alignment.',
        requestedAt,
      },
    };
    const wrongContentType = await postJson(entryPath, entryBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await fetchJson(entryPath, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(33 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    const malformed = await postJson(entryPath, {
      ...entryBody,
      downstreamAction: 'create-workorder',
    });
    assert.equal(malformed.response.status, 409);
    const stale = await postJson(entryPath, {
      ...entryBody,
      sourceDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.deepEqual(JSON.parse(fs.readFileSync(statePath, 'utf8')).staffingEntries, {});

    const created = await postJson(entryPath, entryBody);
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.persisted, true);
    assert.equal(created.payload.downstreamAllowed, false);
    assert.equal(created.payload.mutation.kind, 'enter-staffing-plan-council');
    assert.equal(created.payload.mutation.stoppedAt, 'human-alignment');
    assert.equal(created.payload.staffingEntry.status, 'bound');
    assert.equal(created.payload.councilSession.phase, 'awaiting-alignment');
    assert.equal(created.payload.mission.staffingEntryId, created.payload.staffingEntry.id);
    const afterCreateBytes = fs.readFileSync(statePath, 'utf8');

    const inspection = await fetchJson(
      `/api/staffing-entries/${encodeURIComponent(created.payload.staffingEntry.id)}`,
    );
    assert.equal(inspection.response.status, 200);
    assert.equal(
      inspection.payload.staffingEntry.recordDigest,
      created.payload.staffingEntry.recordDigest,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), afterCreateBytes);
    const inspectionPost = await fetchJson(
      `/api/staffing-entries/${encodeURIComponent(created.payload.staffingEntry.id)}`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: '{}',
      },
    );
    assert.equal(inspectionPost.response.status, 405);

    const replay = await postJson(entryPath, entryBody);
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), afterCreateBytes);
    const divergent = await postJson(entryPath, {
      ...entryBody,
      entryApproval: {
        ...entryBody.entryApproval,
        rationale: 'Divergent entry approval.',
      },
    });
    assert.equal(divergent.response.status, 409);
    assert.equal(fs.readFileSync(statePath, 'utf8'), afterCreateBytes);

    const councilSessionId = created.payload.councilSession.id;
    const revision = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/decision`,
      {
        action: 'request-revision',
        note: 'Blocked.',
        targetAgentIds: ['agent-strategist'],
      },
    );
    assert.equal(revision.response.status, 409);
    const resume = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/resume`,
      {},
    );
    assert.equal(resume.response.status, 409);
    const workOrderPreview = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/work-order-preview`,
      { compileSpec: {} },
    );
    assert.equal(workOrderPreview.response.status, 409);
    const workOrderPlan = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/work-order-plans`,
      { compileSpec: {}, previewId: 'blocked', sourceDigest: 'blocked' },
    );
    assert.equal(workOrderPlan.response.status, 409);
    assert.equal(fs.readFileSync(statePath, 'utf8'), afterCreateBytes);

    const approved = await postJson(
      `/api/council-sessions/${encodeURIComponent(councilSessionId)}/decision`,
      { action: 'approve' },
    );
    assert.equal(approved.response.status, 200);
    assert.equal(approved.payload.mutation.kind, 'decide-bound-council-alignment');
    assert.equal(approved.payload.mutation.stoppedAt, 'alignment-only');
    assert.equal(approved.payload.mutation.autoChain, null);
    assert.equal(approved.payload.mutation.taskId, null);
    assert.equal(approved.payload.mission.status, 'aligned');
    const finalState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(Object.keys(finalState.staffingEntries).length, 1);
    assert.equal(Object.keys(finalState.councilSessions).length, 1);
    assert.deepEqual(finalState.tasks, {});
    assert.deepEqual(finalState.runs, {});
    assert.deepEqual(finalState.artifacts, {});
    assert.deepEqual(finalState.approvals, {});
    assert.deepEqual(finalState.executionPlans, {});
    assert.deepEqual(finalState.workOrders, {});

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            unboundStartStatus: unboundStart.response.status,
            creationStatus: created.response.status,
            replayStatus: replay.response.status,
            inspectionStatus: inspection.response.status,
            alignmentStatus: approved.response.status,
            revisionStatus: revision.response.status,
            resumeStatus: resume.response.status,
            workOrderPreviewStatus: workOrderPreview.response.status,
            workOrderPlanStatus: workOrderPlan.response.status,
          },
          ui: {
            exactCouncilEntry: true,
            durableEvidence: true,
            soloWithoutAction: true,
            unboundLocalControlHidden: true,
            boundDownstreamControlsHidden: true,
            desktopMobileRulesPresent: true,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
    if (!keepFixture) {
      fs.rmSync(tempRoot, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 50,
      });
    }
  }

  if (stderr.trim()) {
    throw new Error(`ui-slice-697 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
