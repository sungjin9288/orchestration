import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /사람 판단을 먼저 처리합니다\./);
assert.match(appJs, /차단 원인을 먼저 정리합니다\./);
assert.match(appJs, /안건이 등록됐으므로 보이는 추천안과 정렬 지점을 먼저 엽니다\./);
assert.match(appJs, /권고안 정리 후 실행으로 넘깁니다\./);
assert.match(appJs, /담당·상태·다음만 먼저 봅니다\./);
assert.match(appJs, /<span class="control-overview-label">반영<\/span>/);
assert.match(appJs, /roster와 회사 구조에 추가합니다\./);
assert.match(appJs, /roster와 회사 구조에 반영합니다\./);
assert.match(appJs, /class="primary-button" type="submit" [\s\S]*agent 추가/);
assert.match(appJs, /class="primary-button" type="submit" [\s\S]*배정 저장/);

assert.match(styles, /\.ops-form-footer \{[\s\S]*gap:\s*10px;[\s\S]*padding:\s*9px 11px;/s);
assert.match(styles, /\.ops-form-footer-title \{[\s\S]*font-size:\s*0\.76rem;[\s\S]*line-height:\s*1\.3;/s);
assert.match(styles, /\.ops-form-footer-actions \.primary-button,[\s\S]*min-width:\s*108px;/s);

console.log(
  JSON.stringify(
    {
      ok: true,
      actionCopyShortening: {
        app: [
          '사람 판단을 먼저 처리합니다.',
          '차단 원인을 먼저 정리합니다.',
          '안건이 등록됐으므로 보이는 추천안과 정렬 지점을 먼저 엽니다.',
          '권고안 정리 후 실행으로 넘깁니다.',
          '담당·상태·다음만 먼저 봅니다.',
          '반영',
          'roster와 회사 구조에 추가합니다.',
          'roster와 회사 구조에 반영합니다.',
          'agent 추가',
          '배정 저장',
        ],
        styles: ['ops-form-footer gap 10px', 'ops-form-footer-title 0.76rem', 'ops-form-footer-actions buttons 108px'],
      },
    },
    null,
    2,
  ),
);
