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

assert.match(appJs, /<p class="eyebrow">회의 운영 데스크<\/p>/);
assert.match(appJs, /참석 역할, 안건, 권고를 같은 회의실에서 정리합니다/);
assert.match(appJs, /Council은 참석자, 안건, 이견, 권고, 승인 선반을 한 화면에서 읽는 표면입니다\./);
assert.match(appJs, /<strong>참석 역할 등록부<\/strong>/);
assert.match(appJs, /<p class="boardroom-table-label">오늘 회의 안건<\/p>/);
assert.match(appJs, /참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다\./);
assert.match(appJs, /<p class="council-meeting-label">권고안 선반<\/p>/);
assert.match(appJs, /<p class="council-meeting-label">이견 보드<\/p>/);
assert.match(appJs, /<p class="council-meeting-label">승인 선반<\/p>/);
assert.match(appJs, /heading: '참석 기록선과 권고 선반으로 나눕니다'/);
assert.match(appJs, /<h2>회의 참석 등록부<\/h2>/);
assert.match(appJs, /<h2>권고와 승인 선반<\/h2>/);

assert.match(styles, /\.surface\[data-surface="council"\] \.council-meeting-board \{/);
assert.match(styles, /\.council-meeting-grid \{/);
assert.match(styles, /\.council-meeting-card \{/);
assert.match(styles, /\.council-meeting-stack \{/);
assert.match(styles, /\.council-meeting-attendance-list/);
assert.match(styles, /\.council-meeting-attendance-row/);
assert.match(styles, /\.surface\[data-surface="council"\] \.council-meeting-board \.boardroom-stage \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      companyShellCouncilMeetingRoom: {
        markers: [
          '회의 운영 데스크',
          '참석 역할 등록부',
          '오늘 회의 안건',
          '권고안 선반',
          '이견 보드',
          '승인 선반',
        ],
      },
    },
    null,
    2,
  ),
);
