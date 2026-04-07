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
assert.match(appJs, /안건을 올리면 네 역할이 각자 자리에서 읽고/);
assert.match(appJs, /label: '안건 접수'/);
assert.match(appJs, /label: '참모 회의'/);
assert.match(appJs, /label: '실행 방향'/);
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
assert.match(styles, /\.boardroom-seat-avatar-eye \{/);
assert.match(styles, /\.boardroom-seat-avatar-smile \{/);
assert.match(styles, /\.boardroom-seat-avatar-accessory \{/);
assert.match(styles, /\.boardroom-seat-avatar-accessory-lead \{/);
assert.match(styles, /\.boardroom-seat-avatar-accessory-strategist \{/);
assert.match(styles, /\.boardroom-seat-avatar-accessory-architect \{/);
assert.match(styles, /\.boardroom-seat-avatar-accessory-decomposer \{/);
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
      hqCuteAvatarShell: {
        steps: ['안건 접수', '참모 회의', '실행 방향', '결과 보고'],
        mood: '네 역할이 각자 자리에서 읽고 회의로 목표와 방향을 정리합니다.',
        avatarClasses: [
          'boardroom-seat-avatar-eye',
          'boardroom-seat-avatar-smile',
          'boardroom-seat-avatar-accessory',
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
