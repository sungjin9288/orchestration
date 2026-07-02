import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /회의 인계와 현재 실행 로그를 같은 선으로 읽습니다/);
assert.match(appJs, /현재 담당, 역할별 증적, 차단 사유, 다음 인계만 요약합니다\./);

assert.doesNotMatch(appJs, /handoff deck/);
assert.doesNotMatch(appJs, /다음 handoff/);
assert.doesNotMatch(appJs, /owner, role별 evidence/);

console.log(
  JSON.stringify(
    {
      ok: true,
      handoffHelperCopy: {
        markers: ['인계선 요약', '역할별 증적', '다음 인계'],
      },
    },
    null,
    2,
  ),
);
