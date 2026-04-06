import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /프로바이더와 워크트리 같은 세부 제어는 고급 운영 모드에 남깁니다\./);
assert.match(appJs, /프로바이더\/워크트리\/세부 제어/);
assert.match(appJs, /프로바이더, 워크트리, 로그, 아티팩트, 결정함은 고급 운영 모드에 남습니다\./);

assert.doesNotMatch(appJs, /프로바이더와 worktree 같은 세부 제어는 고급 운영 모드에 남깁니다\./);
assert.doesNotMatch(appJs, /프로바이더\/worktree\/세부 제어/);
assert.doesNotMatch(appJs, /프로바이더, worktree, 로그, 아티팩트, 결정함은 고급 운영 모드에 남습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionWorktreeHelperCopy: {
        markers: ['워크트리 같은 세부 제어', '프로바이더/워크트리/세부 제어', '프로바이더, 워크트리'],
      },
    },
    null,
    2,
  ),
);
