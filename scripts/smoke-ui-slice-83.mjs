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

assert.match(appJs, /avatarLabel: '지휘 아바타'/);
assert.match(appJs, /avatarLabel: '전략 아바타'/);
assert.match(appJs, /avatarLabel: '설계 아바타'/);
assert.match(appJs, /avatarLabel: '실행 아바타'/);
assert.match(appJs, /deskProp: '상황판 · 최종 승인 봉투'/);
assert.match(appJs, /deskProp: '우선순위 보드 · 전략 차트'/);
assert.match(appJs, /deskProp: '경계 도면 · 구조 메모판'/);
assert.match(appJs, /deskProp: '체크포인트 보드 · 실행 큐'/);
assert.match(appJs, /boardroom-seat-portrait/);
assert.match(appJs, /boardroom-seat-avatar-shell/);
assert.match(appJs, /boardroom-seat-avatar-head/);
assert.match(appJs, /boardroom-seat-avatar-body/);
assert.match(appJs, /boardroom-seat-avatar-badge/);
assert.match(appJs, /boardroom-seat-avatar-label/);
assert.match(appJs, /boardroom-seat-avatar-mood/);
assert.match(appJs, /boardroom-seat-avatar-prop/);
assert.match(appJs, /cast-avatar-panel/);
assert.match(appJs, /cast-avatar-shell/);
assert.match(appJs, /cast-avatar-head/);
assert.match(appJs, /cast-avatar-body/);
assert.match(appJs, /cast-avatar-badge/);
assert.match(appJs, /cast-avatar-label/);
assert.match(appJs, /cast-avatar-prop/);

assert.match(styles, /\.boardroom-seat-portrait \{/);
assert.match(styles, /\.boardroom-seat-avatar-shell \{/);
assert.match(styles, /\.boardroom-seat-avatar-head \{/);
assert.match(styles, /\.boardroom-seat-avatar-body \{/);
assert.match(styles, /\.boardroom-seat-avatar-badge \{/);
assert.match(styles, /\.boardroom-seat-avatar-label \{/);
assert.match(styles, /\.boardroom-seat-avatar-mood,/);
assert.match(styles, /\.cast-avatar-panel \{/);
assert.match(styles, /\.cast-avatar-shell \{/);
assert.match(styles, /\.cast-avatar-head \{/);
assert.match(styles, /\.cast-avatar-body \{/);
assert.match(styles, /\.cast-avatar-badge \{/);
assert.match(styles, /\.cast-avatar-label \{/);
assert.match(styles, /\.cast-avatar-prop \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqOfficeAvatars: {
        avatars: ['지휘 아바타', '전략 아바타', '설계 아바타', '실행 아바타'],
        props: [
          '상황판 · 최종 승인 봉투',
          '우선순위 보드 · 전략 차트',
          '경계 도면 · 구조 메모판',
          '체크포인트 보드 · 실행 큐',
        ],
        stageClasses: [
          'boardroom-seat-portrait',
          'boardroom-seat-avatar-shell',
          'boardroom-seat-avatar-badge',
        ],
        cardClasses: ['cast-avatar-panel', 'cast-avatar-shell', 'cast-avatar-badge'],
      },
    },
    null,
    2,
  ),
);
