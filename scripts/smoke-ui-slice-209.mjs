import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /원문 마크다운은 아티팩트 표면에 그대로 남습니다\./);
assert.match(appJs, /전체 내용은 아티팩트 표면의 원문 마크다운에서 확인합니다\./);
assert.match(appJs, /전체 구조화 미리보기와 원문 마크다운은 아티팩트 표면에서 확인합니다\./);
assert.match(appJs, /원문 마크다운 대체는 아티팩트 표면에서 확인합니다\./);

assert.doesNotMatch(appJs, /원문 markdown은 아티팩트 표면에 그대로 남습니다\./);
assert.doesNotMatch(appJs, /전체 내용은 아티팩트 표면의 원문 markdown에서 확인합니다\./);
assert.doesNotMatch(appJs, /전체 구조화 미리보기와 원문 markdown은 아티팩트 표면에서 확인합니다\./);
assert.doesNotMatch(appJs, /원문 markdown 대체는 아티팩트 표면에서 확인합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactMarkdownHelperCopy: {
        markers: [
          '원문 마크다운은 아티팩트 표면에 그대로 남습니다',
          '원문 마크다운 대체는 아티팩트 표면에서 확인합니다',
        ],
      },
    },
    null,
    2,
  ),
);
