import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /copy: '추천안과 방향을 함께 정리합니다\.'/);
assert.match(appJs, /owner: '회의 리드 \+ 참여 역할'/);
assert.match(appJs, /summary: '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다\.'/);
assert.match(appJs, /안건을 올리면 네 역할이 각자 자리에서 읽고, 회의로 목표와 방향을 정리합니다\./);
assert.match(appJs, /네 역할이 같은 안건을 읽고, 회의 결론을 하나의 실행 방향으로 모읍니다\./);
assert.match(appJs, /여기는 네 역할이 같은 안건을 읽고, 회의에서 목표와 방향을 정리하는 표면입니다\./);
assert.match(appJs, /같은 네 역할이 계속 참여해, 결론이 숨은 메타데이터가 아니라 실제 협의 흐름처럼 읽힙니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestCouncilReadabilityBatch: {
        markers: [
          '추천안과 방향을 함께 정리합니다.',
          '회의 리드 + 참여 역할',
          '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다.',
          '안건을 올리면 네 역할이 각자 자리에서 읽고, 회의로 목표와 방향을 정리합니다.',
          '네 역할이 같은 안건을 읽고, 회의 결론을 하나의 실행 방향으로 모읍니다.',
          '여기는 네 역할이 같은 안건을 읽고, 회의에서 목표와 방향을 정리하는 표면입니다.',
          '같은 네 역할이 계속 참여해, 결론이 숨은 메타데이터가 아니라 실제 협의 흐름처럼 읽힙니다.',
        ],
      },
    },
    null,
    2,
  ),
);
