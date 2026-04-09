import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appJsPath, 'utf8');

assert.match(appJs, /여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다\./);
assert.match(appJs, /owner: '회의 리드 \+ 참여 역할'/);
assert.match(appJs, /summary: '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다\.'/);
assert.match(appJs, /Council은 참석자, 안건, 이견, 권고, 승인 선반을 한 화면에서 읽는 표면입니다\./);
assert.match(appJs, /참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다\./);
assert.match(appJs, /여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다\./);
assert.match(appJs, /참석 역할이 끝까지 기록되어 권고와 승인선의 근거를 같은 회의 흐름에서 확인할 수 있습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      preRealTestCouncilReadabilityBatch: {
        markers: [
          '여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다.',
          '회의 리드 + 참여 역할',
          '각 역할이 같은 안건을 함께 읽고 방향을 정리합니다.',
          'Council은 참석자, 안건, 이견, 권고, 승인 선반을 한 화면에서 읽는 표면입니다.',
          '참석 역할이 안건을 검토하고, 이견과 권고를 회의 결론으로 정리합니다.',
          '여기는 참석자, 안건, 이견, 권고, 승인 선반을 같은 회의실에서 정리하는 표면입니다.',
          '참석 역할이 끝까지 기록되어 권고와 승인선의 근거를 같은 회의 흐름에서 확인할 수 있습니다.',
        ],
      },
    },
    null,
    2,
  ),
);
