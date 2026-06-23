import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const uiQaStatusPath = path.join(repoRoot, 'scripts', 'ui_qa_status.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');

const appJs = fs.readFileSync(appPath, 'utf8');
const uiQaStatus = fs.readFileSync(uiQaStatusPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');

assert.match(appJs, /function getMissionHandoffState\(\{ mission = null, councilSession = null, linkedTask = null \} = \{\}\)/);
assert.match(appJs, /function getMissionFirstRunHandoff\(mission, data\)/);
assert.match(
  appJs,
  /if \(!councilSession\) \{[\s\S]*action:\s*\{ label:\s*'회의 초안',\s*targetSurface:\s*'council'\s*\}[\s\S]*next:\s*'회의 초안 작성'/,
);
assert.match(
  appJs,
  /if \(alignmentStatus !== 'approved'\) \{[\s\S]*action:\s*\{ label:\s*'협의회 정렬',\s*targetSurface:\s*'council'\s*\}[\s\S]*next:\s*'협의회 정렬'/,
);
assert.match(
  appJs,
  /if \(!linkedTask\) \{[\s\S]*action:\s*\{ label:\s*'실행 셀 연결',\s*targetSurface:\s*'mission'\s*\}[\s\S]*next:\s*'실행 셀 연결'/,
);
assert.match(
  appJs,
  /return \{[\s\S]*action:\s*\{ label:\s*'실행 데스크',\s*targetSurface:\s*'execution'\s*\}[\s\S]*next:\s*getExecutionDeskNext\(linkedTask\)[\s\S]*title:\s*'실행 인계'/,
);
assert.match(appJs, /const selectedMissionHandoff = getMissionFirstRunHandoff\(selectedMission, data\);/);
assert.match(appJs, /next:\s*selectedMissionHandoff\.next/);
assert.match(appJs, /title:\s*missionHandoff\.title/);
assert.match(appJs, /action:\s*missionHandoff\.action/);
assert.match(uiQaStatus, /smoke-ui-slice-647\.mjs/);
assert.match(verificationStatus, /smoke-ui-slice-647\.mjs/);
assert.doesNotMatch(
  appJs,
  /if \(surface === 'mission'\) \{[\s\S]*action:\s*\{ label:\s*'협의회',\s*targetSurface:\s*'council'\s*\}/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      firstRunMissionHandoff: {
        sequence: ['회의 초안', '협의회 정렬', '실행 셀 연결', '실행 데스크'],
        routeScope: 'existing Mission, Council, and Execution actions only',
        runtimeScope: 'UI handoff contract only',
      },
    },
    null,
    2,
  ),
);
