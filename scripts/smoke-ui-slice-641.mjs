import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getControlOverviewFocus\(context\)/);
assert.match(appJs, /const hasMission = Boolean\(selectedMission\);/);
assert.match(
  appJs,
  /next:\s*hasMission\s*\?\s*selectedMission\.councilSessionId\s*\?\s*'협의회 정렬 계속'\s*:\s*'회의 초안 작성'\s*:\s*'신규 안건 등록'/,
);
assert.match(appJs, /if \(surface === 'mission'\) \{[\s\S]*if \(!selectedMission\) \{/);
assert.match(
  appJs,
  /if \(!selectedMission\) \{[\s\S]*title:\s*'신규 안건 등록'[\s\S]*next:\s*'신규 안건 등록'[\s\S]*action:\s*\{ label:\s*'신규 안건 등록',\s*targetSurface:\s*'mission'\s*\}/,
);
assert.match(
  appJs,
  /const selectedOrderNext = selectedTask[\s\S]*:\s*selectedMission[\s\S]*\?\s*'회의 초안 작성'[\s\S]*:\s*'신규 안건 등록';/,
);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(nextTargetSurface\)\}"/);
assert.doesNotMatch(
  appJs,
  /if \(surface === 'mission'\) \{[\s\S]*current:\s*selectedMission \? getMissionStatusDisplay\(selectedMission\.status\) : '안건 대기'[\s\S]*action:\s*\{ label:\s*'협의회',\s*targetSurface:\s*'council'\s*\}/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      operatorHomeNoMissionStartGate: {
        emptyMissionNextAction: '신규 안건 등록',
        primaryShortcutTarget: 'mission',
        boundary: 'UI orientation only; runtime, API, provider, approval, and artifact contracts unchanged',
      },
    },
    null,
    2,
  ),
);
