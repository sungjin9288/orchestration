import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /회의를 열면 참석 역할, 권고안, 승인 선반이 이곳에 뜹니다\./);
assert.match(app, /오른쪽 패널은 회의록 전체보다 현재 권고안, 열린 이견, 승인 상태를 먼저 보여 줍니다\./);
assert.match(app, /이제 실행 지시 데스크와 관제실에서 다음 지시를 확인합니다\./);
assert.match(app, /선택된 안건에서 회의를 열면 권고안과 승인 선반이 채워집니다\./);

assert.doesNotMatch(app, /참모 회의를 초안으로 만들어 역할군, 회의록, 결론, 승인 체크포인트를 화면에 올립니다\./);
assert.doesNotMatch(app, /회의실 오른쪽 패널은 긴 회의록보다 현재 결론 상태와 다음 표면을 먼저 보여 줍니다\./);
assert.doesNotMatch(app, /선택된 안건에서 참모 회의를 초안으로 만들어 결론과 승인 체크포인트를 채웁니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilSecondaryCopy: 'tightened',
    },
    null,
    2,
  ),
);
