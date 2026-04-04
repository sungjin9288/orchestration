import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const app = fs.readFileSync(appPath, 'utf8');

assert.match(app, /참모 회의를 열면 역할군, 결론, 승인 지점이 이곳에 뜹니다\./);
assert.match(app, /오른쪽 패널은 긴 회의록 대신 현재 결론과 다음 표면만 먼저 보여 줍니다\./);
assert.match(app, /이제 작전실과 관제실에서 다음 지시를 확인합니다\./);
assert.match(app, /선택된 안건에서 참모 회의를 열면 결론과 승인 지점이 채워집니다\./);

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
