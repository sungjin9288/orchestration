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
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-696');
const runtimeRoot = path.join(tempRoot, 'runtime');
const port = 9800 + (process.pid % 100);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-696-durable-staffing-plan-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_696_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-696 server');
}

function seedFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: path.join(repoRoot, 'company', 'blueprint.json'),
    companyRepoRoot: repoRoot,
  });
  const project = runtime.createProject({
    name: 'UI StaffingPlan',
    projectPath: repoRoot,
  });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Review one source-current staffing plan',
    goal: 'Preview and accept exact staffing evidence without starting Council or execution.',
    constraints: 'Keep every downstream action blocked.',
  });
  return { mission, project };
}

async function main() {
  const { mission } = seedFixture();
  const statePath = path.join(runtimeRoot, 'state.json');
  const initialBytes = fs.readFileSync(statePath, 'utf8');
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
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
    assert.match(staffingPanelSource, /data-form="mission-staffing-plan"/);
    assert.match(staffingPanelSource, /data-action="preview-mission-staffing-plan"/);
    assert.match(staffingPanelSource, /data-action="accept-mission-staffing-plan"/);
    assert.match(staffingPanelSource, /Response-only preview/);
    assert.match(staffingPanelSource, /data-form="staffing-plan-entry"/);
    assert.match(staffingPanelSource, /data-action="enter-staffing-plan-council"/);
    assert.match(staffingPanelSource, /Enter local Council/);
    assert.match(staffingPanelSource, /solo runtime not implemented/);
    assert.match(staffingPanelSource, /data-staffing-plan-derived/);
    assert.doesNotMatch(staffingPanelSource, /data-action="start-/);
    assert.doesNotMatch(staffingPanelSource, /data-action="run-/);
    assert.doesNotMatch(staffingPanelSource, /data-action="create-/);
    assert.match(appSource, /state\.missionStaffingPlanPreview = null/);
    assert.match(
      appSource,
      /querySelectorAll\('\[data-staffing-plan-derived\]'\)[\s\S]*element\.remove\(\)/,
    );
    assert.match(appSource, /data-staffing-plan-status-token/);
    assert.match(signalSource, /getMissionStaffingPlanSummary/);
    assert.match(stylesSource, /\.staffing-plan-control-grid/);
    assert.match(stylesSource, /\.staffing-plan-role-strip/);
    assert.match(
      stylesSource,
      /@media \(max-width: 820px\)[\s\S]*\.staffing-plan-control-grid,[\s\S]*grid-template-columns: repeat\(2,/,
    );

    const snapshot = await fetchJson('/api/snapshot');
    assert.equal(snapshot.response.status, 200);
    assert.equal(snapshot.payload.snapshot.schemaVersion, 19);
    assert.deepEqual(snapshot.payload.snapshot.staffingPlans, {});
    const blueprint = snapshot.payload.snapshot.companyRuntime.blueprint;
    const staffingSpec = {
      mode: 'council',
      selectedAgentIds: [...blueprint.defaultStaffingPolicy.requiredCouncilAgentIds],
      selectionRationale:
        'Record the current local Council roster as reviewable staffing evidence only.',
      parallelGroups: [],
      providerMode: 'local-stub',
      terminationPolicy: {
        maxProviderCalls: 0,
        maxTurnsPerAgent: 4,
        deadlineMs: 120000,
        stopOnRequiredRoleFailure: true,
      },
    };
    const evaluatedAt = new Date().toISOString();
    const previewPath =
      `/api/missions/${encodeURIComponent(mission.id)}/staffing-plan-preview`;

    const wrongContentType = await postJson(
      previewPath,
      { staffingSpec, evaluatedAt },
      'text/plain',
    );
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await fetchJson(previewPath, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(33 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    const malformed = await postJson(previewPath, {
      staffingSpec,
      evaluatedAt,
      downstreamAction: 'start-council',
    });
    assert.equal(malformed.response.status, 409);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), initialBytes);

    const previewResponse = await postJson(previewPath, {
      staffingSpec,
      evaluatedAt,
    });
    assert.equal(previewResponse.response.status, 200);
    assert.equal(previewResponse.payload.persisted, false);
    assert.equal(previewResponse.payload.downstreamAllowed, false);
    const preview = previewResponse.payload.staffingPlanPreview;
    assert.equal(preview.status, 'review-ready');
    assert.equal(fs.readFileSync(statePath, 'utf8'), initialBytes);
    assert.deepEqual(
      getMissionStaffingPlanSummary(mission, preview, null),
      {
        canAccept: true,
        canPreview: true,
        canEnterCouncil: false,
        downstreamAllowed: false,
        durableCurrent: false,
        entryCurrent: false,
        previewCurrent: true,
        sourceReady: true,
        status: 'review-ready',
      },
    );

    const acceptancePath =
      `/api/missions/${encodeURIComponent(mission.id)}/staffing-plans`;
    const acceptance = {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept the exact preview as immutable local audit evidence only.',
      reviewedAt: new Date().toISOString(),
    };
    const acceptanceBody = {
      staffingSpec,
      evaluatedAt,
      previewId: preview.id,
      previewDigest: preview.previewDigest,
      sourceDigest: preview.sourceDigest,
      missionDigest: preview.missionDigest,
      blueprintDigest: preview.blueprintDigest,
      staffingSpecDigest: preview.staffingSpecDigest,
      acceptance,
    };
    const stale = await postJson(acceptancePath, {
      ...acceptanceBody,
      sourceDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.deepEqual(JSON.parse(fs.readFileSync(statePath, 'utf8')).staffingPlans, {});

    const accepted = await postJson(acceptancePath, acceptanceBody);
    assert.equal(accepted.response.status, 201);
    assert.equal(accepted.payload.persisted, true);
    assert.equal(accepted.payload.downstreamAllowed, false);
    assert.equal(accepted.payload.mutation.kind, 'accept-mission-staffing-plan');
    assert.equal(accepted.payload.mutation.idempotent, false);
    const staffingPlan = accepted.payload.staffingPlan;
    assert.equal(staffingPlan.status, 'accepted');
    assert.equal(staffingPlan.sourcePreviewId, preview.id);

    const inspected = await fetchJson(
      `/api/staffing-plans/${encodeURIComponent(staffingPlan.id)}`,
    );
    assert.equal(inspected.response.status, 200);
    assert.equal(inspected.payload.persisted, true);
    assert.equal(inspected.payload.staffingPlan.recordDigest, staffingPlan.recordDigest);
    const inspectPost = await fetchJson(
      `/api/staffing-plans/${encodeURIComponent(staffingPlan.id)}`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: '{}',
      },
    );
    assert.equal(inspectPost.response.status, 405);

    const replay = await postJson(acceptancePath, acceptanceBody);
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    const finalState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(finalState.schemaVersion, 19);
    assert.equal(Object.keys(finalState.staffingPlans).length, 1);
    assert.equal(Object.keys(finalState.councilSessions).length, 0);
    assert.equal(Object.keys(finalState.executionPlans).length, 0);
    assert.equal(Object.keys(finalState.workOrders).length, 0);
    assert.equal(Object.keys(finalState.runs).length, 0);
    assert.equal(Object.keys(finalState.artifacts).length, 0);
    assert.equal(Object.keys(finalState.approvals).length, 0);
    assert.equal(Object.keys(finalState.decisionInboxItems).length, 0);
    assert.equal(
      getMissionStaffingPlanSummary(mission, preview, staffingPlan).canEnterCouncil,
      true,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            previewStatus: previewResponse.response.status,
            acceptanceStatus: accepted.response.status,
            replayStatus: replay.response.status,
            inspectionStatus: inspected.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            oversizedStatus: oversized.response.status,
          },
          ui: {
            explicitPreviewAndAcceptance: true,
            exactInspectionVisible: true,
            browserMemoryInvalidationPresent: true,
            councilEntryVisibleAfterAcceptance: true,
            soloRuntimeUnavailable: true,
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
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }

  if (stderr.trim()) {
    throw new Error(`ui-slice-696 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
