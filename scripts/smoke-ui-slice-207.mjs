import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const artifactPreviewPath = path.join(repoRoot, 'ui', 'artifact-preview.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const artifactPreview = fs.readFileSync(artifactPreviewPath, 'utf8');

assert.match(artifactPreview, /구조화 미리보기는 가능한 범위에서 제공합니다\. 아래 저장된 원문이 최종 기준으로 남습니다\./);
assert.match(appJs, /최신 breakdown 아티팩트를 가능한 범위에서 파싱했습니다\./);
assert.match(appJs, /가능한 범위의 간결 요약만 제공합니다\./);

assert.doesNotMatch(artifactPreview, /구조화 미리보기는 best-effort입니다\. 아래 저장된 원문이 최종 기준으로 남습니다\./);
assert.doesNotMatch(appJs, /최신 breakdown 아티팩트를 best-effort로 파싱했습니다\./);
assert.doesNotMatch(appJs, /best-effort 간결 요약만 제공합니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactBestEffortHelperCopy: {
        markers: ['가능한 범위에서 제공합니다', '가능한 범위에서 파싱했습니다', '가능한 범위의 간결 요약'],
      },
    },
    null,
    2,
  ),
);
