import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');

assert.match(controlSnapshots, /actionLabel: '회의 초안'/);
assert.match(controlSnapshots, /actionLabel: '태스크 연결'/);
assert.match(controlSnapshots, /nextTitle: '실행 데스크'/);
assert.match(controlSnapshots, /nextTitle: '안건 브리프'/);
assert.match(appJs, /const label = options\.label \|\| '태스크 상세'/);
assert.match(appJs, /label: '커밋 가드'/);
assert.match(appJs, /label: '종료 가드'/);
assert.match(appJs, /label: '결재함'/);
assert.match(appJs, /label: '영향 셀'/);
assert.match(appJs, /관제실/);

assert.doesNotMatch(appJs, /협의회 초안 만들기/);
assert.doesNotMatch(appJs, /연결 태스크 만들기/);
assert.doesNotMatch(appJs, /태스크 상세 열기/);
assert.doesNotMatch(appJs, /태스크 상세 커밋 가드 열기/);
assert.doesNotMatch(appJs, /태스크 상세 종료 정리 가드 열기/);
assert.doesNotMatch(appJs, /실행 지시 데스크 열기/);
assert.doesNotMatch(appJs, /안건 브리프 열기/);
assert.doesNotMatch(appJs, /결재함 열기/);
assert.doesNotMatch(appJs, /영향 셀 열기/);
assert.doesNotMatch(appJs, /관제실 열기/);

console.log(
  JSON.stringify(
    {
      ok: true,
      actionLabelShortening: {
        mission: ['회의 초안', '태스크 연결'],
        navigation: ['태스크 상세', '커밋 가드', '종료 가드'],
        surfaces: ['결재함', '영향 셀', '관제실', '실행 데스크', '안건 브리프'],
      },
    },
    null,
    2,
  ),
);
