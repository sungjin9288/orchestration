import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /메인 워크트리는 여기서 제외합니다\./);
assert.match(appJs, /기존 프로젝트 등록\/선택 흐름을 재사용해 새 연결 루트를 활성 상태로 전환합니다\./);

assert.doesNotMatch(appJs, /main worktree는 여기서 제외합니다\./);
assert.doesNotMatch(appJs, /기존 프로젝트 등록\/선택 흐름을 재사용해 새 linked root를 활성 상태로 전환합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      worktreeHelperCopy: {
        markers: ['메인 워크트리', '새 연결 루트'],
      },
    },
    null,
    2,
  ),
);
