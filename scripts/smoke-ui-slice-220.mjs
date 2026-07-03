import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const appJs = fs.readFileSync(appPath, 'utf8');
const artifactStructuredRenderPath = path.join(repoRoot, 'ui', 'artifact-structured-render.js');
const artifactStructuredRender = fs.readFileSync(artifactStructuredRenderPath, 'utf8');

assert.match(artifactStructuredRender, /커밋 전 저장소 변경 파일 수: \$\{parsed\.repoChangedFileCountBeforeCommit\}/);
assert.match(artifactStructuredRender, /커밋 후 저장소 정리 상태: \$\{getBooleanDisplay\(parsed\.repoCleanAfterCommit\)\}/);
assert.match(artifactStructuredRender, /저장소정상:\$\{getBooleanDisplay\(parsed\.repoCleanBeforeCloseOut\)\}/);
assert.match(artifactStructuredRender, /종료 전 저장소 정리 상태: \$\{getBooleanDisplay\(parsed\.repoCleanBeforeCloseOut\)\}/);
assert.match(appJs, /createToken\('저장소:정상', 'success'\)/);
assert.match(appJs, /createToken\('저장소:차단', 'warning'\)/);

assert.doesNotMatch(appJs, /커밋 전 repo 변경 파일 수/);
assert.doesNotMatch(appJs, /커밋 후 repo clean/);
assert.doesNotMatch(appJs, /repo정상:/);
assert.doesNotMatch(appJs, /종료 전 repo clean/);
assert.doesNotMatch(appJs, /createToken\('repo:정상', 'success'\)/);
assert.doesNotMatch(appJs, /createToken\('repo:차단', 'warning'\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      repoHelperBatch: {
        markers: [
          '커밋 전 저장소 변경 파일 수',
          '커밋 후 저장소 정리 상태',
          '저장소정상',
          '종료 전 저장소 정리 상태',
          '저장소:정상',
          '저장소:차단',
        ],
      },
    },
    null,
    2,
  ),
);
