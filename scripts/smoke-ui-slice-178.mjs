import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-178');
const port = 4378;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appJsPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /프로젝트 이름이 필요합니다\./);
assert.match(serveUi, /project_path가 필요합니다\./);
assert.match(serveUi, /미션을 만들기 전에 활성 프로젝트가 필요합니다\./);
assert.match(serveUi, /태스크를 만들기 전에 활성 프로젝트가 필요합니다\./);
assert.match(serveUi, /태스크 제목이 필요합니다\./);
assert.match(serveUi, /연결 워크트리를 만들기 전에 project_path가 필요합니다\./);
assert.match(serveUi, /프로젝트 .*에 현재 탐지된 연결 워크트리가 없습니다\./);
assert.match(serveUi, /worktreeRef가 존재하지 않습니다:/);
assert.match(serveUi, /결정함 처리에 실패했습니다\./);
assert.match(serveUi, /실행을 찾을 수 없습니다\./);
assert.match(serveUi, /아티팩트를 찾을 수 없습니다\./);

assert.match(appJs, /요청이 실패했습니다:/);
assert.match(appJs, /작업 처리에 실패했습니다\./);
assert.match(appJs, /프로젝트 등록에 실패했습니다\./);
assert.match(appJs, /미션용 프로젝트 등록에 실패했습니다\./);
assert.match(appJs, /프로젝트 프로바이더 설정 갱신에 실패했습니다\./);
assert.match(appJs, /미션 생성에 실패했습니다\./);
assert.match(appJs, /태스크 생성에 실패했습니다\./);

assert.doesNotMatch(serveUi, /Project name is required/);
assert.doesNotMatch(serveUi, /project_path is required before creating a linked worktree/);
assert.doesNotMatch(serveUi, /Active project is required before creating missions/);
assert.doesNotMatch(serveUi, /Active project is required before creating tasks/);
assert.doesNotMatch(serveUi, /Task title is required/);
assert.doesNotMatch(serveUi, /Project registration failed/);
assert.doesNotMatch(serveUi, /Task worktree update failed/);
assert.doesNotMatch(serveUi, /Decision inbox action failed/);
assert.doesNotMatch(serveUi, /Run not found/);
assert.doesNotMatch(serveUi, /Artifact not found/);

assert.doesNotMatch(appJs, /Request failed:/);
assert.doesNotMatch(appJs, /Action failed/);
assert.doesNotMatch(appJs, /Project provider update failed/);
assert.doesNotMatch(appJs, /Mission creation failed/);
assert.doesNotMatch(appJs, /Task creation failed/);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('ui-slice-178 서버 기동을 기다리다 시간 초과가 발생했습니다.');
}

async function fetchError(pathname, expectedStatus, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();

  assert.equal(response.status, expectedStatus);
  return payload;
}

async function main() {
  fs.rmSync(runtimeRoot, { recursive: true, force: true });

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

    const missingProjectTaskPayload = await fetchError('/api/tasks', 400, {
      title: 'No active project',
    });
    const missingProjectCreatePayload = await fetchError('/api/projects', 400, {
      projectPath: repoRoot,
    });
    const missingRunPayload = await fetchError('/api/runs/run-9999/logs', 404);
    const missingArtifactPayload = await fetchError('/api/artifacts/artifact-9999', 404);

    assert.equal(missingProjectTaskPayload.error, '태스크를 만들기 전에 활성 프로젝트가 필요합니다.');
    assert.equal(missingProjectCreatePayload.error, '프로젝트 이름이 필요합니다.');
    assert.equal(missingRunPayload.error, '실행을 찾을 수 없습니다.');
    assert.equal(missingArtifactPayload.error, '아티팩트를 찾을 수 없습니다.');

    console.log(
      JSON.stringify(
        {
          ok: true,
          koreanOperatorFallbacks: {
            requestFallback: '요청이 실패했습니다',
            refreshFallbacks: [
              '작업 처리에 실패했습니다.',
              '프로젝트 등록에 실패했습니다.',
              '미션 생성에 실패했습니다.',
              '태스크 생성에 실패했습니다.',
            ],
            serveUiErrors: [
              missingProjectCreatePayload.error,
              missingProjectTaskPayload.error,
              missingRunPayload.error,
              missingArtifactPayload.error,
            ],
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const detail = stderr.trim();

    throw new Error(
      detail
        ? `${error instanceof Error ? error.message : String(error)}\n${detail}`
        : error instanceof Error
          ? error.message
          : String(error),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(50);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    fs.rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
