import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(
  appJs,
  /copy:\s*'왼쪽은 대기 안건과 최근 처리 큐를 보고, 오른쪽은 현재 선택 항목의 상태와 다음 처리만 먼저 봅니다\.'/,
);
assert.match(
  appJs,
  /copy:\s*'아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다\.'/,
);
assert.match(appJs, /label: '다음 처리'/);
assert.match(appJs, /heading: '현재 상태와 다음 처리를 먼저 보는 결재 상세'/);
assert.match(appJs, /copy: selectedItem\?\.prompt \|\| '결재를 고르면 현재 상태와 다음 처리만 먼저 판단합니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionInboxProcessingCopySync: {
        markers: [
          '오른쪽은 현재 선택 항목의 상태와 다음 처리만 먼저 봅니다.',
          '아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다.',
          '현재 상태와 다음 처리를 먼저 보는 결재 상세',
        ],
      },
    },
    null,
    2,
  ),
);
