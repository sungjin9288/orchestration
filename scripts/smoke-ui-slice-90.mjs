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
assert.match(appJs, /eyebrow: '안건 배정 판단판'/);
assert.match(appJs, /heading: '현재 배정 판단과 다음 처리를 먼저 봅니다'/);
assert.match(appJs, /오른쪽 패널은 긴 설명보다 현재 배정 상태, 가장 먼저 열어야 할 처리선, 필요한 연결 상태를 먼저 보여 줍니다\./);
assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '다음'/);
assert.match(appJs, /label: '이유'/);
assert.match(appJs, /selectedMissionBriefControl\.currentTitle/);
assert.match(appJs, /selectedMissionBriefControl\.nextTitle/);
assert.match(appJs, /selectedMissionBriefControl\.reasonTitle/);
assert.match(appJs, /브리프 핵심 4줄/);
assert.match(appJs, /등록 후속/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoMissionBriefControl: {
        eyebrow: '안건 배정 판단판',
        heading: '현재 배정 판단과 다음 처리를 먼저 봅니다',
        cards: ['현재 판단', '다음', '이유'],
        preservedSections: ['브리프 핵심 4줄', '등록 후속'],
      },
    },
    null,
    2,
  ),
);
