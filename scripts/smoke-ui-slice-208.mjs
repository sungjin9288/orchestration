import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const artifactPreviewPath = path.join(repoRoot, 'ui', 'artifact-preview.js');

const artifactPreview = fs.readFileSync(artifactPreviewPath, 'utf8');

assert.match(
  artifactPreview,
  /미리보기는 파일 업데이트 항목 안의 저장된 저장소 내용을 가립니다\. 아래 저장된 원문이 최종 기준으로 남습니다\./,
);
assert.doesNotMatch(
  artifactPreview,
  /미리보기는 File Updates 안의 저장된 repo 내용을 가립니다\. 아래 저장된 원문이 최종 기준으로 남습니다\./,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactFileUpdatesHelperCopy: {
        markers: ['파일 업데이트 항목', '저장된 저장소 내용'],
      },
    },
    null,
    2,
  ),
);
