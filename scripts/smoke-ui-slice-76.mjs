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

assert.match(appJs, /strong>브리프 핵심 4줄<\/strong>/);
assert.match(appJs, /지금 판단할 상태만 네 줄로 봅니다\./);
assert.match(appJs, /label: '회의'/);
assert.match(appJs, /label: '실행'/);
assert.match(appJs, /label: '보고'/);
assert.match(appJs, /label: '다음'/);
assert.match(appJs, /renderMissionSnapshotList\(selectedMissionActiveSnapshotItems, \{ compact: true \}\)/);
assert.match(appJs, /class="list-button mission-row-button/);
assert.match(appJs, /class="card-title-row mission-row-head"/);
assert.match(appJs, /class="list-copy list-copy-compact mission-row-goal"/);
assert.match(appJs, /class="list-copy list-copy-compact mission-row-summary"/);
assert.match(appJs, /class="mission-row-foot"/);
assert.match(appJs, /class="list-copy list-copy-compact mission-row-next"/);
assert.match(appJs, /현재 배정 중인 안건만 모읍니다\./);
assert.match(appJs, /종료 정리까지 끝난 안건만 따로 보관합니다\./);

assert.match(styles, /\.mission-row-button \{/);
assert.match(styles, /\.mission-row-head \{/);
assert.match(styles, /\.list-copy-compact \{/);
assert.match(styles, /\.mission-row-goal \{/);
assert.match(styles, /\.mission-row-summary \{/);
assert.match(styles, /\.mission-row-foot \{/);
assert.match(styles, /\.mission-row-next \{/);
assert.match(styles, /\.brief-snapshot-list \{/);
assert.match(styles, /\.brief-snapshot-row \{/);
assert.match(styles, /\.brief-snapshot-main \{/);
assert.match(styles, /\.brief-snapshot-copy \{/);

assert.doesNotMatch(appJs, /strong>회의 브리프 한눈에<\/strong>/);
assert.doesNotMatch(appJs, /현재 진행 중인 한정된 작업은 이곳에 남습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqMissionBriefDensity: {
        missionRowClasses: [
          'mission-row-button',
          'mission-row-head',
          'mission-row-goal',
          'mission-row-summary',
          'mission-row-foot',
          'mission-row-next',
        ],
        briefClasses: ['brief-snapshot-list', 'brief-snapshot-row', 'brief-snapshot-main'],
        labels: ['회의', '작전', '보고', '다음'],
      },
    },
    null,
    2,
  ),
);
