import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /heading: '보관실 아래는 증적 목록과 현재 증적으로 나눕니다'/);
assert.match(appJs, /copy:\s*'왼쪽은 증적 목록을 보고, 오른쪽은 선택된 증적의 현재 상태와 다음 확인만 먼저 봅니다\.'/);
assert.match(appJs, /title: selectedArtifactMeta \? '현재 증적 \+ 미리보기' : '선택 증적 대기'/);
assert.match(appJs, /copy:\s*'아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다\.'/);
assert.match(appJs, /heading: '현재 증적과 다음 확인을 먼저 보는 증적 상세'/);
assert.match(appJs, /copy: selectedArtifactTask\?\.title \|\| '증적을 고르면 현재 증적과 다음 확인만 먼저 판단합니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactsObservationCopySync: {
        markers: [
          '보관실 아래는 증적 목록과 현재 증적으로 나눕니다',
          '아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다.',
          '현재 증적과 다음 확인을 먼저 보는 증적 상세',
        ],
      },
    },
    null,
    2,
  ),
);
