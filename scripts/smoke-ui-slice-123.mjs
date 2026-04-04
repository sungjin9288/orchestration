import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /options\.agendaGoal \|\| '안건이 올라오면 목표와 범위를 먼저 고정합니다\.'/);
assert.match(appJs, /귀여운 HQ 연출은 방향 표시만 맡고, 실제 실행은 bounded execution과 review\/approval gate를 그대로 따릅니다\./);
assert.match(appJs, /<p class="charter-label">목표 헌장<\/p>/);
assert.match(appJs, /<p class="charter-label">운영 기준<\/p>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      charterSupportCopyTightening: {
        markers: [
          '안건이 올라오면 목표와 범위를 먼저 고정합니다.',
          '귀여운 HQ 연출은 방향 표시만 맡고, 실제 실행은 bounded execution과 review/approval gate를 그대로 따릅니다.',
        ],
      },
    },
    null,
    2,
  ),
);
