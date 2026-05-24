import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function renderWorkspacePlaybook\(activeGroupId, context = \{\}\)/);
assert.match(appJs, /const baseLocation = SURFACE_LOCATION_GUIDANCE\[state\.surface\] \|\| \{/);
assert.match(
  appJs,
  /state\.surface === 'mission' && !context\.selectedMission[\s\S]*next:\s*'신규 안건 등록'[\s\S]*nextHint:\s*'먼저 미션에서 제목, 목표, 경계를 등록해 첫 안건을 만듭니다\.'[\s\S]*targetSurface:\s*'mission'/,
);
assert.match(appJs, /renderWorkspacePlaybook\(activeGroupId, context\)/);
assert.doesNotMatch(
  appJs,
  /function renderWorkspacePlaybook\(activeGroupId\)[\s\S]*const location = SURFACE_LOCATION_GUIDANCE\[state\.surface\]/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookNoMissionNextLocation: {
        emptyMissionNextLocation: '신규 안건 등록',
        emptyMissionTargetSurface: 'mission',
        boundary: 'UI orientation only; runtime, API, provider, approval, and artifact contracts unchanged',
      },
    },
    null,
    2,
  ),
);
