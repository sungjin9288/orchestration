import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-198');
const port = 4498;
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function postJson(pathname, body = {}) {
  return fetchJson(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-198 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stderr = '';

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();
    const packConfigResponse = await fetch(`${baseUrl}/pack-config.js`);
    const packConfig = await packConfigResponse.text();
    const preferenceConfigResponse = await fetch(`${baseUrl}/preference-config.js`);
    const preferenceConfig = await preferenceConfigResponse.text();
    const companyConfigResponse = await fetch(`${baseUrl}/company-config.js`);
    const companyConfig = await companyConfigResponse.text();
    const surfaceConfigResponse = await fetch(`${baseUrl}/surface-config.js`);
    const surfaceConfig = await surfaceConfigResponse.text();

    assert.equal(appJsResponse.status, 200);
    assert.equal(packConfigResponse.status, 200);
    assert.equal(preferenceConfigResponse.status, 200);
    assert.equal(companyConfigResponse.status, 200);
    assert.equal(surfaceConfigResponse.status, 200);
    assert.match(appJs, /from '\.\/company-config\.js'/);
    assert.match(appJs, /from '\.\/pack-config\.js'/);
    assert.match(appJs, /from '\.\/preference-config\.js'/);
    assert.match(appJs, /from '\.\/surface-config\.js'/);
    assert.match(companyConfig, /export const COMPANY_ROLE_OPTIONS = \[/);
    assert.match(companyConfig, /export function normalizeCompanyMember\(entry, index = 0\) \{/);
    assert.match(packConfig, /export const PACK_DISPLAY_NAMES = \{/);
    assert.match(packConfig, /export const KNOWLEDGE_WORK_DELIVERABLES = \{/);
    assert.match(preferenceConfig, /export const UI_PREFERENCE_STORAGE_KEY = 'orchestration\.ui-preferences\.v1'/);
    assert.match(preferenceConfig, /export function normalizeUiPreferences\(entry = \{\}\) \{/);
    assert.match(surfaceConfig, /export const SURFACE_IDS = \[/);
    assert.match(surfaceConfig, /export const NAV_GROUPS = \{/);
    assert.match(surfaceConfig, /export function getNavGroupForSurface\(surface\) \{/);
    assert.match(appJs, /name="projectPack"/);
    assert.match(appJs, /name="missionDeliverableType"/);
    assert.match(appJs, /선택한 산출물 유형으로 회의 안건이 바로 열리고/);

    const projectPayload = await postJson('/api/projects', {
      name: 'knowledge-work-ui-project',
      pack: 'knowledge-work',
      projectPath: repoRoot,
    });
    const project = projectPayload.project;

    assert.equal(projectPayload.mutation.kind, 'create-project');
    assert.equal(project.pack, 'knowledge-work');
    assert.equal(projectPayload.snapshot.projects[project.id].pack, 'knowledge-work');

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep the scope inside one reviewable knowledge-work deliverable only.',
      deliverableType: 'research-brief',
      goal: 'Prepare one research brief that keeps the next operator move inspectable and bounded.',
      title: 'Knowledge-work UI support smoke',
    });
    const mission = missionPayload.mission;

    assert.equal(missionPayload.mutation.kind, 'create-mission-autodraft-council');
    assert.equal(mission.deliverableType, 'research-brief');
    assert.equal(missionPayload.snapshot.missions[mission.id].deliverableType, 'research-brief');
    assert.equal(missionPayload.snapshot.selectedMissionId, mission.id);
    assert.ok(missionPayload.councilSession?.id);

    console.log(
      JSON.stringify(
        {
          ok: true,
          project: {
            id: project.id,
            pack: project.pack,
          },
          mission: {
            councilSessionId: missionPayload.councilSession.id,
            deliverableType: mission.deliverableType,
            id: mission.id,
          },
          runtimeRoot,
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
