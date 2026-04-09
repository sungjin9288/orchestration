import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /actionLabel: '협의회'/);
assert.match(appJs, /actionLabel: '실행'/);
assert.match(appJs, /label: '결정함'/);
assert.match(appJs, /label: '산출물'/);
assert.match(appJs, /label: '아티팩트'/);
assert.match(appJs, />\s*실행\s*<\/button>/);
assert.match(appJs, />\s*실행에서 변경\s*<\/button>/);
assert.match(appJs, /승인은 실행에서 처리합니다\. 산출물은 요약만 남깁니다\./);
assert.match(appJs, /빌더 게이트 승인 후 실행에서 시작합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      actionButtonShortening: {
        labels: ['협의회', '실행', '결정함', '산출물', '아티팩트'],
        deliverablesActions: ['실행', '실행에서 변경'],
        help: ['승인은 실행에서 처리합니다. 산출물은 요약만 남깁니다.', '빌더 게이트 승인 후 실행에서 시작합니다.'],
      },
    },
    null,
    2,
  ),
);
