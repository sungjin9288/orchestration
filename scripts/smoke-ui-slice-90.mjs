import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /function getMissionBriefControlSnapshot\(mission, previews\)/);
assert.match(appJs, /eyebrow: '안건 판단판'/);
assert.match(appJs, /heading: '현재 판단과 바로 이동만 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 긴 설명보다 지금 결정할 상태와 가장 먼저 열어야 할 표면을 먼저 보여 줍니다\./);
assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '바로 이동'/);
assert.match(appJs, /label: '이유'/);
assert.match(appJs, /selectedMissionBriefControl\.currentTitle/);
assert.match(appJs, /selectedMissionBriefControl\.nextTitle/);
assert.match(appJs, /selectedMissionBriefControl\.reasonTitle/);
assert.match(appJs, /브리프 핵심 4줄/);
assert.match(appJs, /브리프 액션/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoMissionBriefControl: {
        eyebrow: '안건 판단판',
        heading: '현재 판단과 바로 이동만 먼저 봅니다',
        cards: ['현재 판단', '바로 이동', '이유'],
        preservedSections: ['브리프 핵심 4줄', '브리프 액션'],
      },
    },
    null,
    2,
  ),
);
