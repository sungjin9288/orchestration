import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /현재 미션 상태를 먼저 잡아 두면 아래 인계선 요약과 상세 패널이 더 자연스럽게 이어집니다\./);
assert.match(appJs, /현재 담당, 역할별 증적, 보류 사유, 다음 인계만 요약합니다\./);

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
