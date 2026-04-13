import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /function renderMissionIntakeBoard\(options = \{\}\)/);
assert.match(appJs, /오늘 안건을 등록대장에 올리고 바로 다음 회의를 엽니다/);
assert.match(appJs, /Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다\./);
assert.match(appJs, /신규 안건 등록/);
assert.match(appJs, /배정 등록대장/);
assert.match(appJs, /다음 처리 트리거/);
assert.match(appJs, /등록대장 인계선/);
assert.match(appJs, /접수 라인/);
assert.match(appJs, /배정 판단선/);
assert.match(appJs, /왼쪽 접수 라인에서 첫 안건을 등록하면 회의와 판단선이 함께 열립니다\./);
assert.match(appJs, /안건 등록대장/);
assert.match(appJs, /등록 후속/);

assert.match(styles, /\.mission-intake-board \{/);
assert.match(styles, /\.mission-intake-grid \{/);
assert.match(styles, /\.mission-intake-card \{/);
assert.match(styles, /\.mission-intake-card-primary \{/);
assert.match(styles, /\.mission-intake-label \{/);
assert.match(styles, /\.mission-intake-title \{/);
assert.match(styles, /\.mission-intake-copyline \{/);
assert.match(styles, /\.mission-intake-foot \{/);

assert.doesNotMatch(appJs, /오늘의 안건을 접수하면 네 역할이 바로 회의를 엽니다/);
assert.doesNotMatch(appJs, /안건 접수 흐름/);
assert.doesNotMatch(appJs, /빠른 접수/);
assert.doesNotMatch(appJs, /즉시 착석/);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionRegisterBoard: {
        markers: [
          '안건 등록대장',
          '신규 안건 등록',
          '배정 등록대장',
          '다음 처리 트리거',
          '접수 라인',
          '배정 판단선',
        ],
      },
    },
    null,
    2,
  ),
);
