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

assert.match(appJs, /avatarStyle: 'lead'/);
assert.match(appJs, /avatarStyle: 'strategist'/);
assert.match(appJs, /avatarStyle: 'architect'/);
assert.match(appJs, /avatarStyle: 'decomposer'/);
assert.match(appJs, /참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다\./);
assert.match(appJs, /label: '안건 접수'/);
assert.match(appJs, /label: '참모 회의'/);
assert.match(appJs, /label: '작업 지시'/);
assert.match(appJs, /label: '결과 보고'/);
assert.match(appJs, /최종 판단판 · 승인 묶음/);
assert.match(appJs, /우선순위 표 · 전략 메모/);
assert.match(appJs, /경계 도면 · 구조 메모/);
assert.match(appJs, /체크포인트 표 · 실행 큐/);
assert.match(appJs, /boardroom-seat-avatar-eye/);
assert.match(appJs, /boardroom-seat-avatar-smile/);
assert.match(appJs, /boardroom-seat-avatar-accessory/);
assert.match(appJs, /cast-avatar-eye/);
assert.match(appJs, /cast-avatar-smile/);
assert.match(appJs, /cast-avatar-accessory/);
assert.match(appJs, /cast-avatar-mood/);

assert.match(styles, /\.briefing-steps \{/);
assert.match(styles, /\.briefing-step \{/);
assert.match(
  styles,
  /\.boardroom-seat-avatar-head,\s*\.boardroom-seat-avatar-body,\s*\.boardroom-seat-avatar-eye,\s*\.boardroom-seat-avatar-smile,\s*\.boardroom-seat-avatar-accessory \{\s*display: none;/s,
);
assert.match(styles, /\.cast-avatar-eye \{/);
assert.match(styles, /\.cast-avatar-smile \{/);
assert.match(styles, /\.cast-avatar-accessory \{/);
assert.match(styles, /\.cast-avatar-accessory-lead \{/);
assert.match(styles, /\.cast-avatar-accessory-strategist \{/);
assert.match(styles, /\.cast-avatar-accessory-architect \{/);
assert.match(styles, /\.cast-avatar-accessory-decomposer \{/);
assert.match(styles, /\.cast-avatar-mood,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqAvatarDataPreserved: {
        steps: ['안건 접수', '참모 회의', '작업 지시', '결과 보고'],
        mood: '참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다.',
        avatarClasses: [
          'boardroom-seat-avatar-eye (hidden)',
          'boardroom-seat-avatar-smile (hidden)',
          'boardroom-seat-avatar-accessory (hidden)',
          'cast-avatar-eye',
          'cast-avatar-smile',
          'cast-avatar-accessory',
        ],
      },
    },
    null,
    2,
  ),
);
