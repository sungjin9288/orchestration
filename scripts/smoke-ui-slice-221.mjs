import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /커밋 전 수정 파일 수: \$\{parsed\.dirtyFileCountBeforeCommit\}/);
assert.match(appJs, /커밋 전 스테이징 파일 수: \$\{parsed\.stagedFileCountBeforeCommit\}/);
assert.match(appJs, /커밋 전 미추적 파일 수: \$\{parsed\.untrackedFileCountBeforeCommit\}/);
assert.match(appJs, /git add 후 스테이징 파일 수: \$\{parsed\.stagedFileCountAfterGitAdd\}/);
assert.match(appJs, /git add 후 수정 파일 수: \$\{parsed\.dirtyFileCountAfterGitAdd\}/);
assert.match(appJs, /git add 후 미추적 파일 수: \$\{parsed\.untrackedFileCountAfterGitAdd\}/);
assert.match(appJs, /수정 파일 수: \$\{parsed\.dirtyFileCount\}/);
assert.match(appJs, /스테이징 파일 수: \$\{parsed\.stagedFileCount\}/);
assert.match(appJs, /미추적 파일 수: \$\{parsed\.untrackedFileCount\}/);

assert.doesNotMatch(appJs, /커밋 전 dirty 파일 수/);
assert.doesNotMatch(appJs, /커밋 전 staged 파일 수/);
assert.doesNotMatch(appJs, /커밋 전 untracked 파일 수/);
assert.doesNotMatch(appJs, /git add 후 staged 파일 수/);
assert.doesNotMatch(appJs, /git add 후 dirty 파일 수/);
assert.doesNotMatch(appJs, /git add 후 untracked 파일 수/);
assert.doesNotMatch(appJs, /dirty 파일 수: \$\{parsed\.dirtyFileCount\}/);
assert.doesNotMatch(appJs, /staged 파일 수: \$\{parsed\.stagedFileCount\}/);
assert.doesNotMatch(appJs, /untracked 파일 수: \$\{parsed\.untrackedFileCount\}/);

console.log(
  JSON.stringify(
    {
      ok: true,
      gitStateHelperBatch: {
        markers: [
          '커밋 전 수정 파일 수',
          '커밋 전 스테이징 파일 수',
          '커밋 전 미추적 파일 수',
          'git add 후 스테이징 파일 수',
          'git add 후 수정 파일 수',
          'git add 후 미추적 파일 수',
          '수정 파일 수',
          '스테이징 파일 수',
          '미추적 파일 수',
        ],
      },
    },
    null,
    2,
  ),
);
