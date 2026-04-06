import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /heading: '로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다'/);
assert.match(appJs, /copy:\s*'왼쪽은 실행 기록 목록을 보고, 오른쪽은 선택된 실행 기록의 현재 상태와 다음 확인만 먼저 봅니다\.'/);
assert.match(appJs, /title: selectedRun \? '현재 실행 기록 \+ 원문 확인' : '선택 기록 대기'/);
assert.match(appJs, /copy:\s*'아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다\.'/);
assert.match(appJs, /heading: '현재 실행 기록과 다음 확인을 먼저 보는 로그 상세'/);
assert.match(appJs, /copy: selectedTask\?\.title \|\| '실행 기록을 고르면 현재 실행 기록과 다음 확인만 먼저 판단합니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      logsObservationCopySync: {
        markers: [
          '로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다',
          '아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다.',
          '현재 실행 기록과 다음 확인을 먼저 보는 로그 상세',
        ],
      },
    },
    null,
    2,
  ),
);
